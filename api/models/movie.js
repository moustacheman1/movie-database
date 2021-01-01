const mongoose = require("mongoose");
const Person = require("./person").schema;
const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;

let MovieSchema = new Schema({
    Title: {
        type: String,
        required: true
    },
    Year: {
        type: Number,
        required: true
    },
    Rated: {
        type: String,
        required: true
    },
    Released: {
        type: String,
    },
    Runtime: {type: String},
    Genre: {
        type: [String],
        text: true,
        required: true
    },
    Director: {
        type: [Person],
        required: true
    },
    Writer: {
        type: [Person],
        required: true
    },
    Actors: {
        type: [Person],
        required: true
    },
    Plot: {type: String},
    Language: {type: [String]},
    Country: {type: [String]},
    Awards: {type: String},
    Poster: {type: String},
    Ratings: {
        type: [{
            Source: {type: String},
            Value: {type: String}
        }]
    },
    Metascore: {type: Number},
    imdbRating: {type: Number},
    imdbVotes: {type: Number},
    imdbID: {type: String},
    Type: {type: String},
    DVD: {type: String},
    BoxOffice: {type: String},
    Production: {type: String},
    Website: {type: String},
    Response: {type: Boolean},
    // Reviews: [{type: Schema.Types.ObjectId, ref: 'Review'}]
});

MovieSchema.statics.findPerson = function (id, callback) {
    this.find({
        $or:
            [
                {'Director._id': id},
                {'Writer._id': id},
                {'Actors._id': id}
            ]
    }).exec(callback);
}

MovieSchema.statics.findMostCommonCollabs = function (id, callback) {
    this.aggregate([
        {
            $match:
                {
                    $or:
                        [
                            {'Director._id': id},
                            {'Writer._id': id},
                            {'Actors._id': id}
                        ]
                }
        },
        {
            $project: {
                People: {
                    $setUnion: [
                        '$Director',
                        '$Writer',
                        '$Actors'
                    ]
                }
            }
        },
        {
            $project: {
                People: {
                    $filter: {
                        input: '$People',
                        as: 'person',
                        cond: {$ne: ['$$person._id', id]}
                    }
                }
            }
        },
        {
            $unwind: '$People'
        },
        {
            $sortByCount: '$People'
        }
    ]).exec(callback);
}

MovieSchema.methods.findSimilarMovies = function (callback) {
    let searchQuery = this.Genre.join(" ");
    console.log(this.Year);

    return this.model("Movie").find(
        {$text: {$search: searchQuery}},
        {score: {$meta: 'textScore'}}
    ).sort({score: { $meta: 'textScore'}})
        .where("_id").ne(this._id)
        .where("imdbRating")
            .gte(this.imdbRating - 1)
            .lte(this.imdbRating + 1)
        .where("Year")
            .gte(this.Year - 2)
            .lte(this.Year + 2)
        .limit(10)
    .exec(callback);
}

MovieSchema.methods.findReviews = function (callback) {
    this.model("Review").find()
        .where("Movie").equals(this._id)
        .populate("Reviewer", '_id username contributing')
        .exec(callback);
};

let Movie = mongoose.model('Movie', MovieSchema);
module.exports = Movie;