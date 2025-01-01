// name
// Email
// password
// photourl

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required :true
    },
    email: {
        type: String,
        required: true,
        unique :true
    },
    password: {
        type: String,
        required :true
    },
    photoUrl: {
        type: String,
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
    }

}, {
    timestamps :true
})

userSchema.pre('save',async function (next) {
    const user = this
    if (!user.isModified) {
        next();
    }
    user.password = await bcrypt.hash(user.password, 10);
}) 

userSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}


module.exports = mongoose.model('User', userSchema);