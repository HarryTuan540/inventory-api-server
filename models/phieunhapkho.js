const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//schema

const phieunhapkhoSchema = new Schema({
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
    tongtien: {
        type: String,
        require: true
    },
})


//model
const PhieuNhapKho = mongoose.model('phieunhapkho', phieunhapkhoSchema);

module.exports = PhieuNhapKho;