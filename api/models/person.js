const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

let PersonSchema = new Schema({
    Name: {
        type: String,
        required: true,
    },
    User_Followers: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        required: false
    }
});

let Person = mongoose.model('Person', PersonSchema);
module.exports = Person;