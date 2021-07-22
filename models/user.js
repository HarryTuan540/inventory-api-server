const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
//schema

const userSchema = new Schema({
    email: {
        type: String,
        require: true,
        unique: false,
        lowercase: true
    },
    password: {
        type: String,
        require: true
    },
    
    roll: {
        type: String,
        require: true,
        lowercase: true
    },

    name: {
        type: String,
        require: true,
        lowercase: true
    },

    emailUser: {
        type: String,
        require: true,
        lowercase: true
    },

    sdt: {
        type: String,
        require: true,
        lowercase: true
    },

    kholamviec: {
        type: String,
        require: true,
        lowercase: true
    },
   
})

userSchema.pre('save', async function (next) {
    try {
        const salt = await bcrypt.genSalt(10);

        const passwordHash = await bcrypt.hash(this.password,salt);

        this.password = passwordHash;

        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.isValidPassword= async function (newPassword) {
    try {
        return await bcrypt.compare(newPassword,this.password);
    } catch (error) {
        throw new Error(error);
    }
}

//model
const User = mongoose.model('user', userSchema);

module.exports = User;