const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//schema

const phieuxuatkhochitietSchema = new Schema({
    malohang: {
        type: String,
        require: true
    },
    nguoitaolohang: {
        type: String,
        require: true
    },

    tenkienhang: {
        type: String,
        require: true
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

    trangthai: {
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

    diachikhochua: {
        type: String,
        require: true
    },

    tennguoinhan: {
        type: String,
        require: true
    },

    sdtnguoinhan: {
        type: String,
        require: true
    },

    diachinguoinhan: {
        type: String,
        require: true
    },

    tennguoigui: {
        type: String,
        require: true
    },

    sdtnguoigui: {
        type: String,
        require: true
    },

    diachinguoigui: {
        type: String,
        require: true
    },
    
})


//model
const PhieuXuatKhoChiTiet = mongoose.model('phieuxuatkhochitiet', phieuxuatkhochitietSchema);

module.exports = PhieuXuatKhoChiTiet;