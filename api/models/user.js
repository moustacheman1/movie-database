const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    contributing: {
        type: Boolean,
        default: false,
        required: true
    },
    favourite_genres: {
        type: [String],
        default: ['Action'],
        required: false
    },
    people_following: [{
        type: Schema.Types.ObjectId,
        ref: 'Person',
        required: false
    }],
    users_following: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        required: false
    },
    users_followers: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        required: false
    }
});

UserSchema.statics.authenticate = function (username, password, callback) {
    User.findOne({username: username})
        .exec(function (err, user) {

            if (err) {
                return callback(err);
            } else if (!user) {
                let error = new Error("User not found");
                error.status = 401;
                return callback(error);
            }

            if (user.password === password) {
                return callback(null, user);
            } else {
                return callback();
            }
        });
}

UserSchema.methods.findReviews = function (callback) {
    this.model("Review").find()
        .where("Reviewer").equals(this._id)
        .populate("Movie")
        .exec(callback);
}

UserSchema.methods.findUsersFollowing = function (callback) {
    this.model("User").find()
        .where("users_following").exists(this._id)
        .exec(callback);
}

let User = mongoose.model('User', UserSchema);
module.exports = User;