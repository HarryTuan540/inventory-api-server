const PhieuNhapKho = require('../models/phieunhapkho');
const PhieuNhapKhoChiTiet = require('../models/phieunhapkhochitiet');
const PhieuXuatKho = require('../models/phieuxuatkho');
const PhieuXuatKhoChiTiet = require('../models/phieuxuatkhochitiet');
const Warehouse = require('../models/warehouse');
const ThongKeNhapXuatKho = require('../models/thongkenhapxuat');

async function getDoanhThu(khochua) {
    let result = 0;
    let listMaLoHang = [];
    await PhieuNhapKhoChiTiet.find({ khochuakienhang: khochua }).then((pnkchitiet) => {
        pnkchitiet.forEach(element => {
            if (!listMaLoHang.includes(element.malohang)) {
                listMaLoHang.push(element.malohang)
            }
        });
    })
    await PhieuNhapKho.find({ malohang: listMaLoHang }).then((pnk) => {

        for (let i = 0; i < pnk.length; i++) {
            const dongiaConvert = (pnk[i].tongtien).split(",").join("");
            result = result + parseFloat(dongiaConvert, 10);
        }
        return result;
    })
    return result;
}

async function getSoluongXuatNhap(khochua) {
    let result = {};
    let listMaLoHang = [];
    let tongsoluongkienhangnhapkho = 0;
    await PhieuNhapKhoChiTiet.find({ khochuakienhang: khochua }).then((pnkchitiet) => {
        pnkchitiet.forEach(element => {
            // if(!listMaLoHang.includes(element.malohang)){
            //     listMaLoHang.push(element.malohang)
            // }
            tongsoluongkienhangnhapkho = tongsoluongkienhangnhapkho + parseFloat(element.soluongkienhang, 10)
        });
    })

    let listMaLoHangXuat = [];
    let tongsoluongkienhangxuatkho = 0;
    await PhieuXuatKhoChiTiet.find({ khochuakienhang: khochua }).then((pxkchitiet) => {
        pxkchitiet.forEach(element => {
            tongsoluongkienhangxuatkho = tongsoluongkienhangxuatkho + parseFloat(element.soluongkienhang, 10)
        });
    })

    result = {
        tongthu: tongsoluongkienhangnhapkho,
        tongxuat: tongsoluongkienhangxuatkho
    }

    return result;
}

module.exports = {
    createWarehouse: async (req, res, next) => {
        try {
            const { tenkhohang, succhua, trangthai, provine, district, phuong } = req.body;

            const foundWarehouse = await Warehouse.findOne({ tenkhohang });
            if (foundWarehouse) {
                res.status(403).json({ message: "Warehouse info is a already in use" });
            }
            else {
                const newWarehouse = Warehouse({ tenkhohang, succhua, trangthai, provine, district, phuong });
                await newWarehouse.save();
                res.status(200).json({ message: "create info warehouse success" });
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "create info warehouse error" });
        }
    },

    getListWarehouse: async (req, res, next) => {
        //const getdoanhthu = getDoanhThu(khohang.tenkhohang);
        try {
            const result = [];
            await Warehouse.find().then(async (warehouse) => {
                for (let i = 0; i < warehouse.length; i++) {
                    const resultdoanhthu = await getDoanhThu(warehouse[i].tenkhohang);
                    const tongxuatnhap = await getSoluongXuatNhap(warehouse[i].tenkhohang);

                    const tile = (parseFloat(tongxuatnhap.tongxuat, 10) / parseFloat(tongxuatnhap.tongthu, 10)) * 100

                    const dataAdd = {
                        _id: warehouse[i]._id,
                        tenkhohang: warehouse[i].tenkhohang,
                        succhua: warehouse[i].succhua,
                        trangthai: warehouse[i].trangthai,
                        tongxuat: tongxuatnhap.tongxuat,
                        tongthu: tongxuatnhap.tongthu,
                        tile: tile,
                        provine: warehouse[i].provine,
                        district: warehouse[i].district,
                        phuong: warehouse[i].phuong,
                        doanhthu: new Intl.NumberFormat().format(resultdoanhthu),
                        __v: 0
                    }
                    result.push(dataAdd);
                }
            })
            res.json({
                result: 'ok',
                data: result,
                length: result.length,
                message: 'get warehouse successfully'
            })
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "get info warehouse error" });
        }
    },


    deleteWarehouse: async (req, res, next) => {
        try {
            const { tenkhohang } = req.body;
            const foundWarehouse = await Warehouse.findOne({ tenkhohang });
            if (!foundWarehouse) {
                res.status(403).json({ message: "Warehouse is not in data" });
            }
            else {
                Warehouse.findOneAndDelete({ tenkhohang }, function (err, docs) {
                    if (err) {
                        res.status(404).json({ message: "delete Warehouse error" });
                    }
                    else {
                        res.status(200).json({ message: "delete Warehouse success" });
                    }
                });
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "get info user error" });
        }
    },

    editWarehouse: async (req, res, next) => {
        try {
            const { tenkhohang, succhua, trangthai, provine, district, phuong } = req.body;
            const foundWarehouse = await Warehouse.findOne({ tenkhohang });
            if (!foundWarehouse) {
                res.status(403).json({ message: "Warehouse is not in data" });
            }
            else {
                const succhuaUpdate = (succhua !== '' && succhua !== undefined) ? succhua : foundWarehouse.succhua;
                const trangthaiUpdate = (trangthai !== '' && trangthai !== undefined) ? trangthai : foundWarehouse.trangthai;
                const provineUpdate = (provine !== '' && provine !== undefined) ? provine : foundWarehouse.provine;
                const districtUpdate = (district !== '' && district !== undefined) ? district : foundWarehouse.district;
                const phuongUpdate = (phuong !== '' && phuong !== undefined) ? phuong : foundWarehouse.phuong;

                Warehouse.findOneAndUpdate({ _id: foundWarehouse._id }, { $set: { succhua: succhuaUpdate, trangthai: trangthaiUpdate, provine: provineUpdate, district: districtUpdate, phuong: phuongUpdate } }, function (err, docs) {
                    if (err) {
                        res.status(404).json({ message: "update Warehouse error" });
                    }
                    else {
                        res.status(200).json({ message: "update Warehouse success" });
                    }
                });
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "update info Warehouse error" });
        }
    },

    getByIDWarehouse: async (req, res, next) => {
        try {
            const { tenkhohang } = req.body;
            const foundWarehouse = await Warehouse.findOne({ tenkhohang });
            if (!foundWarehouse) {
                res.status(403).json({ message: "Warehouse is not in data" });
            }
            else {
                res.json({
                    result: 'ok',
                    data: foundWarehouse,
                    message: 'get warehouse successfully'
                })
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "get info user error" });
        }
    },

    getListThongKe: async (req, res, next) => {
        try {
            ThongKeNhapXuatKho.find().then((thongke) => {
                res.json({
                    result: 'ok',
                    data: thongke,
                    length: thongke.length,
                    message: 'get thong ke successfully'
                })
            })
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "get Thongke error" });
        }
    },
}