const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//schema

const phieuxuatkhoSchema = new Schema({
    malohang: {
        type: String,
        require: true,
        unique: false,
        lowercase: true
    },
    nguoitaolohang: {
        type: String,
        require: true
    },
    ngaytaolohang: {
        type: Date,
        require: true
    },
    lydoxuatkho: {
        type: String,
        require: true
    },
    sotienthanhtoan: {
        type: String,
        require: true
    },
    phuongthucthanhtoan: {
        type: String,
        require: true
    },
    taixevanchuyen: {
        type: String,
        require: true
    },
    dongiacuoc: {
        type: String,
        require: true
    },
    quangduongdichuyen: {
        type: String,
        require: true
    },
})


//model
const PhieuXuatKho = mongoose.model('phieuxuatkho', phieuxuatkhoSchema);

module.exports = PhieuXuatKho;