const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let NotificationSchema = new Schema({
   User_Id: {
       type: Schema.Types.ObjectId,
       ref: 'User',
       required: true
   },
    Notification_Text: {
       type: String,
        required: true
    }
});

let Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;