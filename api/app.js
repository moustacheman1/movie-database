let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let cors = require('cors');
let mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
let session = require('express-session');

let indexRouter = require('./routes/index');
const User = require("./models/user");
const Movie = require("./models/movie");
const Person = require("./models/person");
const Review = require("./models/review");
const Notif = require("./models/notification");

let app = express();
let movieDatabase;

mongoose.connect('mongodb://localhost:27017/movie-database', {useNewUrlParser: true, useFindAndModify: false});

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function () {
    console.log("\x1b[33m", "Connected to mongo server, running at mongodb://localhost:27017/movie-database");
    movieDatabase = this.db;
})

const MongoStore = require('connect-mongo')(session);
const store = new MongoStore({
    mongooseConnection: db
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: "my top secret secret",
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 3600000
    },
    store: store
}));

app.use('/', indexRouter);

// error handler
app.use(function (err, req, res, next) {

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// session cookie handler
app.use(function (req, res, next) {
    console.log(req.session);
    next();
});

app.post('/api/register', function (req, res, next) {

    if (req.body.username && req.body.password) {
        let userData = {
            username: req.body.username,
            password: req.body.password
        };

        User.exists({username: userData.username}, function (err, exists) {
            if (exists) {
                return res.status(409).send("Username already exists");
            } else {
                User.create(userData, function (error, user) {
                    if (error) {
                        return next(error);
                    } else {
                        console.log(user);
                        req.session.user = {
                            _id: user._id,
                            username: user.username,
                            contributing: user.contributing,
                            favourite_genres: user.favourite_genres,
                            people_following: user.people_following,
                            users_following: user.users_following
                        };
                        return res.status(200).send(req.session.user);
                    }
                });
            }
        });
    }
});

app.post('/api/login', function (req, res) {
    User.authenticate(req.body.username, req.body.password, function (error, user) {
        if (error || !user) {
            return res.status(403).send({message: "Login and/or password is invalid. Please try again"});
        } else {
            req.session.user = {
                _id: user._id,
                username: user.username,
                contributing: user.contributing,
                favourite_genres: user.favourite_genres,
                people_following: user.people_following,
                users_following: user.users_following
            };
            return res.status(200).send(req.session.user);
        }
    });
});

app.post('/api/logout', function (req, res) {
    req.session.destroy(error => {
        if (error) {
            return res.status(400).send({
                message: 'There was a problem logging out.'
            });
        }
        res.status(200).send({message: 'Log out successful'});
    })
});

app.get('/api/user-info', function (req, res) {
    const {user} = req.session;
    if (!user) {
        return res.status(401).json({message: "Unauthorized"});
    }
    res.json({user});
})

const requireAuthorization = (req, res, next) => {
    if (!req.session.user._id) {
        res.status(403).json({message: 'Unauthorized'});
    }
    next();
};

const requireContributingRole = (req, res, next) => {
    const {user} = req.session;
    if (!user || !user.contributing) {
        console.log('Unauthorized');
        return res.status(401).json({message: 'Unauthorized role'});
    }
    next();
}

app.get('/api/profile', requireAuthorization, function (req, res) {
    let finalRes = {};

    User.findOne({_id: req.session.user._id}, {password: 0})
        .populate("people_following")
        .populate("users_following", '_id username')
        .exec(function (error, user) {
        if (error) {
            return res.status(500).send('Oops looks like something went wrong');
        } else {
            console.log(user);

            if (!user) {
                return res.status(404).send({message: "That user does not exist."});
            }

            finalRes.User = user;
            user.findReviews(function (e, reviews) {
                if (e) {
                    res.status(400).send({message: "Couldn't retrieve reviews"})
                }
                finalRes.Reviews = reviews;
                return res.status(200).send(finalRes);
            })
        }
    });
});

app.put('/api/profile', requireAuthorization, function (req, res) {
    console.log(req.body);
    console.log(!req.body.contributing);

    if (req.body.hasOwnProperty('favGenres')) {
        User.findOneAndUpdate(
            {_id: req.session.user._id},
            {favourite_genres: req.body.favGenres},
            {new: true}
        ).exec(function (error, user) {
            if (error) {
                return res.status(400).send({message: 'Failed to change preferred genres.'})
            }
            console.log(user);
            return res.status(200).send({message: 'Successfully changed favourite genre(s).'});
        });
    } else {
        User.findOneAndUpdate(
            {_id: req.session.user._id},
            {contributing: !req.body.contributing},
            {new: true}
        ).exec(function (error, user) {
            if (error) {
                return res.status(400).send({message: 'Failed to change user role.'})
            }
            console.log(user);
            req.session.user.contributing = user.contributing;
            return res.status(200).send({message: 'Successfully changed user role.'});
        });
    }
});

app.get('/api/movies', function (req, res) {

    let q = req.query;
    let finalQuery = {};

    const pageNumber = req.query.page ? parseInt(req.query.page) : 1;

    if (Object.keys(q).includes('Title')) {
        finalQuery['Title'] = {$regex: q['Title'], $options: "i"};
    }

    if (Object.keys(q).includes('Genre')) {
        if (Array.isArray(q['Genre'])) {
            finalQuery['Genre'] = {$all: q['Genre']};
        } else {
            finalQuery['Genre'] = {$regex: q['Genre'], $options: "i"};
        }
    }

    if (Object.keys(q).includes('YearMin')) {
        finalQuery['Year'] = {$gte: q['YearMin'], $lte: q['YearMax']};
    }

    if (Object.keys(q).includes('MinRating')) {
        finalQuery['imdbRating'] = {$gte: q['MinRating'], $lte: q['MaxRating']};
    }

    Movie.find(finalQuery).skip((pageNumber - 1) * 25).limit(25).exec(function (error, movies) {
        if (error) {
            return res.status(400).send({
                message: "No results found."
            });
        }
        res.status(200).send(movies);
    });
});

app.get('/api/movies/:movieID', function (req, res) {

    let movieID = new ObjectId(req.params.movieID);
    let finalResult = {};

    Movie.findById(movieID).exec(function (error, movie) {
        if (error) {
            return res.status(400).send({
                message: "No results found."
            });
        }

        if (!movie) {
            return res.status(404).send({message: "That movie does not exist."});
        }

        finalResult.Movie = movie;
        movie.findReviews(function (e, reviews) {
            if (e) {
                res.status(400).send({message: "Couldn't retrieve reviews"})
            }
            console.log(reviews);
            finalResult.Reviews = reviews;
            movie.findSimilarMovies(function (err, similarMovies) {
                if (err) throw err;
                finalResult.Similar_Movies = similarMovies;
                return res.status(200).send(finalResult);
            });
        })
    });
});

app.post('/api/movie', requireContributingRole, function (req, res) {
    // check if user is logged in
    // if user logged in check if contributing user
    // frontend - check if all fields filled in
    // add movie to db
    const movie = {Title, Year, Genre, Director, Writer, Actors, Rated} = req.body;

    if (!!movie) {
        Movie.create(movie, function (error, mov) {
            if (error) {
                console.log(error);
                return res.status(400).json({message: "Oops couldn't add movie"});
            } else {
                return res.status(200).json({message: "Successfully added " + mov.Title + "."})
            }
        })
    }
});

// reviews
app.post('/api/movies/:movieID', requireContributingRole, function (req, res) {
    console.log(req.body);
    const {Rating, Summary, Review_Text} = req.body;

    const Reviewer = ObjectId(req.session.user._id);
    const movie_id = ObjectId(req.params.movieID);

    if (!!Summary && !!Review_Text) {
        Movie.findById(movie_id).exec(function (error, movie) {
            if (error) {
                return res.status(400).send({
                    message: "Couldnt find movie."
                });
            }
            User.findById(Reviewer).exec(function (err, u) {
                if (err) {
                    return res.status(400).send({
                        message: "Couldnt find user."
                    });
                }
                let r = new Review({
                    Movie: movie._id,
                    Reviewer: u._id,
                    Rating,
                    Summary,
                    Review_Text
                });
                r.save(function (e, review) {
                    if (e) {
                        return res.status(400).send({
                            message: "Couldnt add review."
                        });
                    }
                    console.log(review);

                    u.users_followers.forEach(follower => {
                        let n = new Notif({
                            User_Id: follower,
                            Notification_Text: u.username + " has added a review to " + movie.Title + "."
                        })
                        n.save(function (notifyError, notification) {
                            if (notifyError) {
                                return res.status(400).send({
                                    message: "Couldn't create notification."
                                });
                            }
                            console.log(notification);
                        });
                    });
                    return res.status(200).send({message: 'Review added successfully.'})
                });
            });
        });
    } else if (!!Rating) {
        Movie.findById(movie_id).exec(function (error, movie) {
            if (error) {
                return res.status(400).send({
                    message: "Couldnt find movie."
                });
            }
            User.findById(Reviewer).exec(function (err, u) {
                if (err) {
                    return res.status(400).send({
                        message: "Couldnt find user."
                    });
                }
                let r = new Review({
                    Movie: movie._id,
                    Reviewer: u._id,
                    Rating
                });
                r.save(function (e, review) {
                    if (e) {
                        return res.status(400).send({
                            message: "Couldn't add review."
                        });
                    }

                    u.users_followers.forEach(follower => {
                        let n = new Notif({
                            User_Id: follower,
                            Notification_Text: u.username + " has given a rating of " + review.Rating + " for " + movie.Title + "."
                        })
                        n.save(function (notifyError, notification) {
                            if (notifyError) {
                                return res.status(400).send({
                                    message: "Couldn't create notification."
                                });
                            }
                            console.log(notification);
                        });
                    });

                    console.log(review);
                    return res.status(200).send({message: 'Review added successfully.'})
                });
            });
        });
    }
});

app.patch('/api/movies/:movieID', requireContributingRole, function (req, res) {
    console.log(req.body);
    const movieID = ObjectId(req.params.movieID);
    const {director, writers, actors} = req.body;

    let peopleSet = new Set();
    director.forEach(d => peopleSet.add(d));
    writers.forEach(w => peopleSet.add(w));
    actors.forEach(a => peopleSet.add(a));
    console.log(peopleSet);

    Movie.findByIdAndUpdate(movieID,
        {$addToSet: {Director: {$each: director}, Writer: {$each: writers}, Actors: {$each: actors} }},
        {new: true}).exec(function(err, movie) {
            if (err) {
                res.status(400).send({message: "Couldn't edit people in movie" })
            }

            peopleSet.forEach(person => {
                if (person.User_Followers && person.User_Followers.length) {
                    person.User_Followers.forEach(follower => {
                        let n = new Notif({
                            User_Id: follower,
                            Notification_Text: person.Name + " has been added to " + movie.Title + "."
                        });
                        n.save(function (e, notification) {
                            if (e) {
                                return res.status(400).send({
                                    message: "Couldn't create notification."
                                });
                            }
                            console.log(notification);
                        });
                    });
                }
            });

            return res.status(200).send({message: 'Movie successfully edited.'})
    });
});

// TODO: Maybe add Director, Writer, Actor filters when searching for people
// TODO: Add paging to get all query, so you don't load it all in memory
app.get('/api/people', function (req, res) {

    console.log(req.query);
    let name = req.query['Name'];

    if (!name || name.length === 0) {
        Person.find().limit(25).exec(function (err, results) {
            if (err) {
                return res.status(400).send({message: "No results found."});
            }
            res.status(200).send(results);
        });
    } else {
        Person.find({Name: {$regex: name, $options: 'i'}}).limit(25).exec(function (err, results) {
            if (err) {
                return res.status(400).send({message: "No results found."});
            }
            res.status(200).send(results);
        });
    }
});

app.get('/api/people/:personID', function (req, res) {

    let personID = new ObjectId(req.params.personID);
    let finalResult = {};

    Person.find({_id: personID}).exec(function (error, person) {
        if (error) {
            return res.status(400).send({message: "Couldn't retrieve data."});
        }
        finalResult.Person = person;

        Movie.findPerson(personID, function (err, results) {
            if (err) {
                return res.status(400).send({message: "No results found."});
            }
            finalResult.Movies = results;

            Movie.findMostCommonCollabs(personID, function (e, collabs) {
                if (err) {
                    return res.status(400).send({message: "No results found."});
                }
                finalResult.common_collabs = collabs;
                res.status(200).send(finalResult);
            })
        });
    });
});

app.post('/api/people', function (req, res) {
    // after adding create notification to send all following users
    const {person_name} = req.body;

    if (person_name && person_name.length > 0) {
        Person.exists({Name: person_name}, function (error, exists) {
            if (exists) {
                return res.status(400).json({message: 'This person already exists.'});
            } else {
                Person.create({Name: person_name}, function (err, person) {
                    if (err) {
                        return res.status(400).json({message: 'Oops couldnt add person'});
                    } else {
                        console.log(person);
                        return res.status(200).json({message: "Succesfully added " + person.Name + " ."});
                    }
                });
            }
        })
    }
});

app.post('/api/people/:peopleID/', function (req, res) {

    console.log(req.body);
    const {follower, following, action} = req.body;

    // if action is follow or unfollow
    if (action === 'follow') {
        User.findByIdAndUpdate(ObjectId(follower), {$addToSet: {people_following: ObjectId(following)}}, {new: true}).exec(function (error, user) {
            if (error) {
                return res.status(400).send({
                    message: "Couldn't follow person"
                });
            }
            Person.findByIdAndUpdate(ObjectId(following), {$addToSet: {User_Followers: ObjectId(follower)}}, {new: true}).exec(function (err, person) {
                if (err) {
                    return res.status(400).send({
                        message: "Couldn't add follower."
                    });
                }
                req.session.user.people_following = user.people_following;
                res.status(200).send({message: "Successfully followed " + person.Name})
            });
        });
    } else if (action === 'unfollow') {
        User.findByIdAndUpdate(ObjectId(follower), {$pull: {people_following: ObjectId(following)}}, {new: true}).exec(function (error, user) {
            if (error) {
                return res.status(400).send({
                    message: "Couldn't unfollow person"
                });
            }
            Person.findByIdAndUpdate(ObjectId(following), {$pull: {User_Followers: ObjectId(follower)}}, {new: true}).exec( function (err, person) {
                if (err) {
                    return res.status(400).send({
                        message: "Couldn't remove user."
                    });
                }
                req.session.user.people_following = user.people_following;
                res.status(200).send({message: "Successfully unfollowed " + person.Name})
            })
        })
    }
});

app.get('/api/users', function (req, res) {

    console.log(req.query);
    let username = req.query['Username'];

    if (!username || username.length === 0) {
        User.find({}, {password: 0}).exec(function (err, results) {
            if (err) {
                return res.status(400).send({message: "No results found."});
            }
            res.status(200).send(results);
        });
    } else {
        User.find({username: {$regex: username, $options: 'i'}}, {password: 0}).exec(function (err, results) {
            if (err) {
                return res.status(400).send({message: "No results found."});
            }
            res.status(200).send(results);
        });
    }
});

app.get('/api/users/:userID', function (req, res) {
    let userID = new ObjectId(req.params.userID);
    let finalResult = {};

    User.findOne({_id: userID}, {password: 0}).exec(function (err, user) {
        if (err) {
            return res.status(400).send({message: "No results found."});
        }
        finalResult.User = user;

        user.findReviews(function (e, reviews) {
            if (e) {
                res.status(400).send({message: "Couldnt retrieve reviews"})
            }
            finalResult.Reviews = reviews;
            return res.status(200).send(finalResult);
        })
    })
});

app.post('/api/users/:userID', function (req, res) {
    console.log(req.body);
    const {follower, following, action} = req.body;

    if (follower === following) {
        res.status(400).send({message: "Cannot follow yourself."})
    }

    // if action is follow or unfollow
    if (action === 'follow') {
        User.findByIdAndUpdate(ObjectId(follower), {$addToSet: {users_following: ObjectId(following)}}, {new: true}).exec(function (error, userFollower) {
            if (error) {
                return res.status(400).send({
                    message: "Couldn't follow user"
                });
            }
            User.findByIdAndUpdate(ObjectId(following), {$addToSet: {users_followers: ObjectId(follower)}}, {new: true}).exec(function (err, userFollowing) {
                if (err) {
                    return res.status(400).send({
                        message: "Couldn't add follower."
                    });
                }
                req.session.user.users_following = userFollower.users_following;
                res.status(200).send({message: "Successfully followed " + userFollowing.username})
            });
        });
    } else if (action === 'unfollow') {
        User.findByIdAndUpdate(ObjectId(follower), {$pull: {users_following: ObjectId(following)}}, {new: true}).exec(function (error, userFollower) {
            if (error) {
                return res.status(400).send({
                    message: "Couldn't unfollow user"
                });
            }
            User.findByIdAndUpdate(ObjectId(following), {$pull: {users_followers: ObjectId(follower)}}, {new: true}).exec( function (err, userFollowing) {
                if (err) {
                    return res.status(400).send({
                        message: "Couldn't unfollow user."
                    });
                }
                req.session.user.users_following = userFollower.users_following;
                res.status(200).send({message: "Successfully unfollowed " + userFollowing.username})
            })
        })
    }
});

app.get('/api/notifications/', function (req, res) {

    const userID = req.session.user._id;
    console.log(userID);

    Notif.find({User_Id: userID}).exec(function (error, notifications) {
        if (error) {
            return res.status(400).send({message: "Error. No notifications found."});
        }
        res.status(200).send(notifications);
    });
})

app.delete('/api/notifications', function (req, res) {
    // get the id of the notification in the body
    console.log(req.body);
    const {notification_id} = req.body;

    Notif.findOneAndDelete({_id: notification_id}).exec(function (error) {
        if (error) {
            res.status(400).send({message: "Error removing notification"});
        }
        res.status(200).send({message: "Notification removed successfully."})
    })
})

module.exports = app;
