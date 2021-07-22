const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//schema

const kiemkeSchema = new Schema({
    tenkienhang: {
        type: String,
        require: true,
        lowercase: true
    },
    soluongkiemke: {
        type: String,
        require: true
    },
    trangthaikienhang: {
        type: String,
        require: true
    },
    dongia: {
        type: String,
        require: true
    },
    loaikienhang: {
        type: String,
        require: true
    },
    khochuakienhang: {
        type: String,
        require: true
    },
    ngaykiemke: {
        type: Date,
        require: true
    }
})


//model
const KiemKe = mongoose.model('kiemke', kiemkeSchema);

module.exports = KiemKe;