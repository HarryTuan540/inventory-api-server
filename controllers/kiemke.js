const KiemKe = require('../models/kiemke');

module.exports = {
    createKiemKe: async (req, res, next) => {
        try {
            const { data, soluong, trangthai } = req.body;

            if( parseFloat(soluong, 10) <= 0){
                return res.status(404).json({ message: "Số lượng kiểm kê phải lớn hơn 0 " });
            }

            if( trangthai === ""){
                return res.status(404).json({ message: "Vui lòng nhập trạng thái kiện hàng kiểm kê " });
            }

            let today = new Date();
            let created = (today.getMonth() + 1) + '-' + (today.getDate()) + '-' + today.getFullYear();

            const newKiemKe = KiemKe({
                tenkienhang: data.tenkienhang,
                soluongkiemke: soluong,
                trangthaikienhang: trangthai,
                dongia: data.dongia,
                loaikienhang: data.loaikienhang,
                khochuakienhang: data.khochuakienhang,
                ngaykiemke: created
            });

            await newKiemKe.save();
            res.status(200).json({ message: "create kiem ke success" });

        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "create kiem ke error" });
        }
    },

    getdetail: async (req, res, next) => {
        try {
            const { data } = req.body;
            KiemKe.find({
                tenkienhang: data.tenkienhang,
                dongia: data.dongia,
                loaikienhang: data.loaikienhang,
                khochuakienhang: data.khochuakienhang
            }).then((kiemke) => {
                res.json({
                    result: 'ok',
                    data: kiemke,
                    message: 'get kiem ke successfully'
                })
            });

        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "get kiem ke error" });
        }
    },
}