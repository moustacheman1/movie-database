const mongoose = require("mongoose");

let movies = require('./movie-data.json');
const Movie = require("../models/movie");
const Person = require("../models/person");
let moviesList = [];
let personList = [];

console.log(movies.length);

for (let i = 0; i < movies.length; i++) {
    if (movies[i].Title === '#DUPE#') {
        continue;
    }

    movies[i].Year = movies[i].Year.split('–')[0];
    movies[i].Genre = movies[i].Genre.split(', ');

    movies[i].Director = movies[i].Director.split(', ');
    movies[i].Director = movies[i].Director.map(director =>
        director.replace(/\((.*)/g, "").trim()
    );
    movies[i].Director.forEach(director => {
            let directorPerson = {Name: director};
            if (!personList.some(person => person.Name === directorPerson.Name) || personList.length === 0) {
                let p = new Person(directorPerson);
                personList.push(p);
            }
        }
    );
    movies[i].Director = movies[i].Director.map(director =>
        personList.find(person => person.Name === director)
    );

    movies[i].Writer = movies[i].Writer.split(', ');
    movies[i].Writer = movies[i].Writer.map(writer =>
        writer.replace(/\((.*)/g, "").trim()
    );
    movies[i].Writer.forEach(writer => {
        let writerPerson = {Name: writer};
        if (!personList.some(person => person.Name === writerPerson.Name) || personList.length === 0) {
            let p = new Person(writerPerson);
            personList.push(p);
        }
    });
    movies[i].Writer = movies[i].Writer.map(writer =>
        personList.find(person => person.Name === writer)
    );

    movies[i].Actors = movies[i].Actors.split(', ');
    movies[i].Actors.forEach(actor => {
        let actorPerson = {Name: actor};
        if (!personList.some(person => person.Name === actorPerson.Name) || personList.length === 0) {
            let p = new Person(actorPerson);
            personList.push(p);
        }
    });
    movies[i].Actors = movies[i].Actors.map(actor =>
        personList.find(person => person.Name === actor)
    )

    movies[i].Language = movies[i].Language.split(', ');
    movies[i].Country = movies[i].Country.split(', ');

    movies[i].Metascore = movies[i].Metascore.replace('N/A', 0);
    movies[i].imdbVotes = movies[i].imdbVotes.replace(/,/g, '');
    movies[i].imdbVotes = movies[i].imdbVotes.replace('N/A', 0);
    movies[i].imdbRating = movies[i].imdbRating.replace('N/A', 0);

    movies[i].Response = movies[i].Response === "True";

    console.log(personList.length);

    let m = new Movie(movies[i]);
    moviesList.push(m);
}

console.log(moviesList.length);
console.log(personList.length);

mongoose.connect('mongodb://localhost:27017/movie-database', {useNewUrlParser: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function () {
    mongoose.connection.db.dropDatabase(function (err, result) {
        if (err) {
            console.log("Error dropping database: ");
            conosle.log(err);
            return;
        }
        console.log('Dropped collection of ' + Movie.collection.name + '. Starting re-creation.');

        let completedMovies = 0;
        let completedPeople = 0;

        moviesList.forEach(movie => {
            movie.save(function (e, res) {
                if (e) throw e;
                completedMovies++;
                if (completedMovies >= moviesList.length) {
                    console.log('\x1b[36m%s\x1b[0m', "Successfuly inserted " + completedMovies + " movies into the database.");

                    personList.forEach(person => {
                        person.save(function (e, res) {
                            if (e) throw e;
                            completedPeople++;
                            if (completedPeople >= personList.length) {
                                console.log('\x1b[36m%s\x1b[0m', "Successfuly inserted " + completedPeople + " people into the database.");
                                process.exit();
                            }
                        });
                    })
                }
            })
        });
    });
});
