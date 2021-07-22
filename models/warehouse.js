const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//schema

const warehouseSchema = new Schema({
    tenkhohang: {
        type: String,
        require: true,
        unique: false,
        lowercase: true
    },
    succhua: {
        type: String,
        require: true
    },
    
    trangthai: {
        type: String,
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
const WareHouse = mongoose.model('warehouse', warehouseSchema);

module.exports = WareHouse;