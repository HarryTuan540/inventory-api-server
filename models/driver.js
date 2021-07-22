const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//schema

const driverSchema = new Schema({
    cmnd: {
        type: String,
        require: true,
        unique: false,
        lowercase: true
    },
    tentx: {
        type: String,
        require: true
    },
    
    trangthai: {
        type: String,
        require: true,
        lowercase: true
    },

    sdt: {
        type: String,
        require: true,
        lowercase: true
    },

    namsinh: {
        type: Date,
        require: true,
        lowercase: true
    },

    provine: {
        type: String,
        require: true,
        lowercase: true
    },

    district: {
        type: String,
        require: true,
        lowercase: true
    },

    phuong: {
        type: String,
        require: true,
        lowercase: true
    },
   
})


//model
const Driver = mongoose.model('driver', driverSchema);

module.exports = Driver;