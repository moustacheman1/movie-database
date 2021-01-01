const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let ReviewSchema = new Schema({
    Reviewer: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    Movie: {
        type: Schema.Types.ObjectId,
        ref: 'Movie'
    },
    Rating : {
        type: Number,
        min: 1,
        max: 10,
        required: true
    },
    Summary: {
        type: String,
        required: checkReview
    },
    Review_Text: {
        type: String,
        required: checkReview
    }
});

function checkReview() {
    return this.Summary || this.Review_Text;
}

let Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;