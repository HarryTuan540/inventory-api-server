const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//schema

const thongkeSchema = new Schema({
    tenkienhang: {
        type: String,
        require: true,
        unique: false,
        lowercase: true
    },
    loaikienhang: {
        type: String,
        require: true
    },
    soluongnhap: {
        type: String,
        require: true
    },
    soluongxuat: {
        type: String,
        require: true
    },
    thoigiannhap: {
        type: String,
        require: true
    },
    thoigianxuat: {
        type: String,
        require: true
    },
    vantocchuyenhang: {
        type: String,
        require: true
    },
    tilechuyenhang: {
        type: String,
        require: true
    },
})


//model
const ThongKeNhapXuatKho = mongoose.model('thongkenhapxuatkho', thongkeSchema);

module.exports = ThongKeNhapXuatKho;