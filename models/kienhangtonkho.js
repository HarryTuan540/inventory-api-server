const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//schema

const kienhangtonkhoSchema = new Schema({
    tenkienhang: {
        type: String,
        require: true,
        lowercase: true
    },
    soluongkienhang: {
        type: String,
        require: true
    },
    khoiluongkienhang: {
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
    kiemke: {
        type: String,
        require: true
    }
})


//model
const KienHangTonKho = mongoose.model('kienhangtonkho', kienhangtonkhoSchema);

module.exports = KienHangTonKho;