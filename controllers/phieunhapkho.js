const PhieuNhapKho = require('../models/phieunhapkho');
const PhieuNhapKhoChiTiet = require('../models/phieunhapkhochitiet');
const KienHangTonKho = require('../models/kienhangtonkho');

const ThongKeNhapXuatKho = require('../models/thongkenhapxuat');

const User = require('../models/user');


module.exports = {
    createPNK: async (req, res, next) => {
        try {
            const { data, driver, dongiacuoc, quangduongdichuyen, ngaynhapkho } = req.body;

            let today = new Date(ngaynhapkho);
            const monthCreate = (parseFloat((today.getMonth() + 1), 9) > 10) ? (today.getMonth() + 1) : ("0" + (today.getMonth() + 1));
            const dayCreate = (parseFloat((today.getDate()), 10) > 9) ? (today.getDate()) : ("0" + (today.getDate()));
            let created = monthCreate + '-' + dayCreate + '-' + today.getFullYear();

            let tongtienlohang = 0;

            data.forEach(dataPNK => {
                const dongiaConvert = (dataPNK.dongia).split(",").join("");
                tongtienlohang = tongtienlohang + parseFloat(dongiaConvert, 10) * parseFloat(dataPNK.soluongkienhang, 10) * parseFloat(dataPNK.khoiluongkienhang, 10);
            });

            tongtienlohang = tongtienlohang + (parseFloat(dongiacuoc, 10) * quangduongdichuyen);

            const check = await PhieuNhapKho.find();

            if (check.length === 0) {
                const newPNK = PhieuNhapKho({
                    malohang: "1000", nguoitaolohang: data[0].nguoitaolohang, ngaytaolohang: created,
                    taixevanchuyen: driver, dongiacuoc: dongiacuoc, quangduongdichuyen: quangduongdichuyen,
                    tongtien: new Intl.NumberFormat().format(tongtienlohang)
                });
                await newPNK
                    .save()
                    .then(async (doc) => {
                        data.forEach(async dataPNK => {
                            const newPNKDetail = PhieuNhapKhoChiTiet({
                                malohang: "1000", nguoitaolohang: dataPNK.nguoitaolohang, tenkienhang: dataPNK.tenkienhang,
                                soluongkienhang: dataPNK.soluongkienhang, khoiluongkienhang: dataPNK.khoiluongkienhang, trangthai: dataPNK.trangthai,
                                loaikienhang: dataPNK.loaikienhang, khochuakienhang: dataPNK.khochuakienhang, diachikhochua: dataPNK.diachikhochua,
                                tennguoinhan: dataPNK.tennguoinhan, sdtnguoinhan: dataPNK.sdtnguoinhan, diachinguoinhan: dataPNK.diachinguoinhan,
                                tennguoigui: dataPNK.tennguoigui, sdtnguoigui: dataPNK.sdtnguoigui, diachinguoigui: dataPNK.diachinguoigui,
                                dongia: dataPNK.dongia
                            });
                            await newPNKDetail.save();

                            const foundThongke = await ThongKeNhapXuatKho.findOne({
                                tenkienhang: (dataPNK.tenkienhang).toLowerCase(),
                                loaikienhang: dataPNK.loaikienhang
                            });
                            if (!foundThongke) {
                                const monthCreate1 = (parseFloat((today.getMonth() + 1), 10) > 9) ? (today.getMonth() + 1) : ("0" + (today.getMonth() + 1));
                                const dayCreate1 = (parseFloat((today.getDate()), 10) > 9) ? (today.getDate() -1) : ("0" + (today.getDate() -1));
                                let created1 = monthCreate1 + '-' + dayCreate1 + '-' + today.getFullYear();
                                const newThongKe = ThongKeNhapXuatKho({
                                    tenkienhang: dataPNK.tenkienhang,
                                    loaikienhang: dataPNK.loaikienhang,
                                    soluongnhap: dataPNK.soluongkienhang,
                                    soluongxuat: 0,
                                    thoigiannhap: created,
                                    vantocchuyenhang: 0,
                                    tilechuyenhang: 0
                                })
                                await newThongKe.save();
                            }
                            else {
                                const slNhap = parseFloat(foundThongke.soluongnhap, 10) + parseFloat(dataPNK.soluongkienhang, 10)
                                let tile = parseFloat(foundThongke.soluongxuat, 10) === 0 ? 0 :
                                    (parseFloat(foundThongke.soluongxuat, 10) / parseFloat(slXuat, 10)) * 100
                                ThongKeNhapXuatKho.findOneAndUpdate({ _id: foundThongke._id },
                                    {
                                        $set: {
                                            soluongnhap: slNhap,
                                            tilechuyenhang: tile
                                        }
                                    }, async function (err, docs) {
                                        if (err) {
                                            return res.status(404).json({ message: "create PNK error" });
                                        }
                                    });
                            }


                            const foundKHTK = await KienHangTonKho.findOne({
                                tenkienhang: (dataPNK.tenkienhang).toLowerCase(),
                                dongia: dataPNK.dongia,
                                //khoiluongkienhang: dataPNK.khoiluongkienhang,
                                loaikienhang: dataPNK.loaikienhang, khochuakienhang: dataPNK.khochuakienhang
                            });
                            const khoiluong = parseFloat(dataPNK.soluongkienhang, 10) * parseFloat(dataPNK.khoiluongkienhang, 10)
                            if (!foundKHTK) {
                                const newKienHangTonKho = KienHangTonKho({
                                    tenkienhang: dataPNK.tenkienhang,
                                    soluongkienhang: dataPNK.soluongkienhang,
                                    khoiluongkienhang: khoiluong,
                                    dongia: dataPNK.dongia,
                                    loaikienhang: dataPNK.loaikienhang,
                                    khochuakienhang: dataPNK.khochuakienhang,
                                    kiemke: "chưa kiểm kê"
                                })
                                await newKienHangTonKho.save();
                            }
                            else {
                                const khtkKL = parseFloat(foundKHTK.soluongkienhang, 10) + khoiluong;
                                const khtkQty = parseFloat(foundKHTK.soluongkienhang, 10) + parseFloat(dataPNK.soluongkienhang, 10);
                                //const khtkKLKH = parseFloat(foundKHTK.khoiluongkienhang, 10) + parseFloat(dataPNK.khoiluongkienhang, 10);
                                KienHangTonKho.findOneAndUpdate({ _id: foundKHTK._id },
                                    {
                                        $set: {
                                            soluongkienhang: khtkQty,
                                            khoiluongkienhang: khtkKL
                                        }
                                    }, async function (err, docs) {
                                        if (err) {
                                            return res.status(404).json({ message: "create PNK error" });
                                        }
                                    });
                            }
                        });
                        res.status(200).json({ malohang: "1000" });
                    })
                    .catch(err => {
                        console.log(error);
                        return res.status(400).json({ message: "create PNK error" });
                    });
            }
            else {



                const pnk = await PhieuNhapKho.find().sort({ malohang: -1 });
                const malohangCheck = (parseInt(pnk[0].malohang) + 1).toString();
                const foundPNK = await PhieuNhapKho.findOne({ malohang: malohangCheck });



                if (foundPNK) {
                    return res.status(403).json({ message: "ID PNK is a already in use" });
                }
                else {
                    const newPNK = PhieuNhapKho({
                        malohang: malohangCheck, nguoitaolohang: data[0].nguoitaolohang, ngaytaolohang: created,
                        taixevanchuyen: driver, dongiacuoc: dongiacuoc, quangduongdichuyen: quangduongdichuyen,
                        tongtien: new Intl.NumberFormat().format(tongtienlohang)
                    });

                    await newPNK.save();


                    data.forEach(async dataPNK => {
                        const newPNKDetail = PhieuNhapKhoChiTiet({
                            malohang: malohangCheck, nguoitaolohang: dataPNK.nguoitaolohang, tenkienhang: dataPNK.tenkienhang,
                            soluongkienhang: dataPNK.soluongkienhang, khoiluongkienhang: dataPNK.khoiluongkienhang, trangthai: dataPNK.trangthai,
                            loaikienhang: dataPNK.loaikienhang, khochuakienhang: dataPNK.khochuakienhang, diachikhochua: dataPNK.diachikhochua,
                            tennguoinhan: dataPNK.tennguoinhan, sdtnguoinhan: dataPNK.sdtnguoinhan, diachinguoinhan: dataPNK.diachinguoinhan,
                            tennguoigui: dataPNK.tennguoigui, sdtnguoigui: dataPNK.sdtnguoigui, diachinguoigui: dataPNK.diachinguoigui,
                            dongia: dataPNK.dongia
                        });
                        await newPNKDetail.save();

                        const foundThongke = await ThongKeNhapXuatKho.findOne({
                            tenkienhang: (dataPNK.tenkienhang).toLowerCase(),
                            loaikienhang: dataPNK.loaikienhang
                        });
                        if (!foundThongke) {
                            const newThongKe = ThongKeNhapXuatKho({
                                tenkienhang: dataPNK.tenkienhang,
                                loaikienhang: dataPNK.loaikienhang,
                                soluongnhap: dataPNK.soluongkienhang,
                                soluongxuat: 0,
                                thoigiannhap: created,
                                vantocchuyenhang: 0,
                                tilechuyenhang: 0
                            })
                            await newThongKe.save();
                        }
                        else {
                            const slNhap = parseFloat(foundThongke.soluongnhap, 10) + parseFloat(dataPNK.soluongkienhang, 10)
                            let tile = parseFloat(foundThongke.soluongxuat, 10) === 0 ? 0 :
                                (parseFloat(foundThongke.soluongxuat, 10) / parseFloat(slXuat, 10)) * 100
                            ThongKeNhapXuatKho.findOneAndUpdate({ _id: foundThongke._id },
                                {
                                    $set: {
                                        soluongnhap: slNhap,
                                        tilechuyenhang: tile
                                    }
                                }, async function (err, docs) {
                                    if (err) {
                                        return res.status(404).json({ message: "create PNK error" });
                                    }
                                });
                        }


                        const foundKHTK = await KienHangTonKho.findOne({
                            tenkienhang: (dataPNK.tenkienhang),
                            dongia: dataPNK.dongia,
                            //khoiluongkienhang: dataPNK.khoiluongkienhang,
                            loaikienhang: dataPNK.loaikienhang,
                            khochuakienhang: dataPNK.khochuakienhang
                        });

                        const khoiluong = parseFloat(dataPNK.soluongkienhang, 10) * parseFloat(dataPNK.khoiluongkienhang, 10)

                        if (!foundKHTK) {
                            const newKienHangTonKho = KienHangTonKho({
                                tenkienhang: dataPNK.tenkienhang,
                                soluongkienhang: dataPNK.soluongkienhang,
                                khoiluongkienhang: khoiluong,
                                dongia: dataPNK.dongia,
                                loaikienhang: dataPNK.loaikienhang,
                                khochuakienhang: dataPNK.khochuakienhang,
                                kiemke: "chưa kiểm kê"
                            })
                            await newKienHangTonKho.save();
                        }
                        else {
                            const khtkKL = parseFloat(foundKHTK.khoiluongkienhang, 10) + khoiluong;

                            const khtkQty = parseFloat(foundKHTK.soluongkienhang, 10) + parseFloat(dataPNK.soluongkienhang, 10);
                            //const khtkKLKH = parseFloat(foundKHTK.khoiluongkienhang, 10) + parseFloat(dataPNK.khoiluongkienhang, 10);
                            await KienHangTonKho.findOneAndUpdate({ _id: foundKHTK._id },
                                {
                                    $set: {
                                        soluongkienhang: khtkQty,
                                        khoiluongkienhang: khtkKL
                                    }
                                }, function (err, docs) {
                                    if (err) {
                                        return res.status(404).json({ message: "create PNK error" });
                                    }
                                });
                        }
                    });
                    res.status(200).json({ malohang: malohangCheck });
                }
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "create PNK error" });
        }
    },

    getListPNK: async (req, res, next) => {
        const { nguoitaolohang } = req.body;
        try {
            if (nguoitaolohang === '') {
                PhieuNhapKho.find().then((pnk) => {
                    res.json({
                        result: 'ok',
                        data: pnk,
                        length: pnk.length,
                        message: 'get PNK successfully'
                    })
                })
            }
            else {
                PhieuNhapKho.find({ nguoitaolohang }).then((pnk) => {
                    res.json({
                        result: 'ok',
                        data: pnk,
                        length: pnk.length,
                        message: 'get PNK successfully'
                    })
                })
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "get PNK error" });
        }
    },

    getPNKChiTiet: async (req, res, next) => {
        const { malohang } = req.body;
        try {
            PhieuNhapKhoChiTiet.find({ malohang }).then((pnkchitiet) => {
                res.json({
                    result: 'ok',
                    data: pnkchitiet,
                    message: 'get PNKDetail successfully'
                })
            })
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "get PNKDetail error" });
        }
    },

    searchPNK: async (req, res, next) => {
        const { queryString, dataQuery } = req.body;
        try {
            if (queryString === "nguoitaolohang") {
                PhieuNhapKho.find({ nguoitaolohang: dataQuery }).then((pnkchitiet) => {
                    res.json({
                        result: 'ok',
                        data: pnkchitiet,
                        message: 'get PNK successfully'
                    })
                })
            }
            else if (queryString === "malohang") {
                PhieuNhapKho.find({ malohang: dataQuery }).then((pnkchitiet) => {
                    res.json({
                        result: 'ok',
                        data: pnkchitiet,
                        message: 'get PNK successfully'
                    })
                })
            }
            else if (queryString === "ngaytaolohang") {

                PhieuNhapKho.find({ ngaytaolohang: { $gte: dataQuery.date_from, $lte: dataQuery.date_to } }).sort([['time', -1]]).then((pnkchitiet) => {
                    res.json({
                        result: 'ok',
                        data: pnkchitiet,
                        message: 'get PNK successfully'
                    })
                })
            }
            else if (queryString === "khochuakienhang") {
                let listMaLoHang = [];
                PhieuNhapKhoChiTiet.find({ khochuakienhang: dataQuery }).then((pnkchitiet) => {
                    pnkchitiet.forEach(element => {
                        listMaLoHang.push(element.malohang)
                    });
                    PhieuNhapKho.find({ malohang: listMaLoHang }).then((pnkchitiet) => {
                        res.json({
                            result: 'ok',
                            data: pnkchitiet,
                            message: 'get PNK successfully'
                        })
                    })
                })
            }

        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "get PNK error" });
        }
    },

    editPNK: async (req, res, next) => {
        try {
            const { malohang, tenkienhang, soluongkienhang, khoiluongkienhang, dongia,
                trangthai, loaikienhang, khochuakienhang, diachikhochua, diachinguoinhan,
                tennguoigui, sdtnguoigui, diachinguoigui, dataUpdate } = req.body;

            const foundPNK = await PhieuNhapKhoChiTiet.findOne({
                malohang: dataUpdate.malohang, tenkienhang: dataUpdate.tenkienhang,
                soluongkienhang: dataUpdate.soluongkienhang, khoiluongkienhang: dataUpdate.khoiluongkienhang,
                dongia: dataUpdate.dongia, trangthai: dataUpdate.trangthai, loaikienhang: dataUpdate.loaikienhang, khochuakienhang: dataUpdate.khochuakienhang,
                diachinguoinhan: dataUpdate.diachinguoinhan, tennguoigui: dataUpdate.tennguoigui, sdtnguoigui: dataUpdate.sdtnguoigui, diachinguoigui: dataUpdate.diachinguoigui
            });

            const foundKHTK = await KienHangTonKho.findOne({
                tenkienhang: (dataUpdate.tenkienhang).toLowerCase(),
                dongia: dataUpdate.dongia, //, khoiluongkienhang: dataUpdate.khoiluongkienhang,
                loaikienhang: dataUpdate.loaikienhang, khochuakienhang: dataUpdate.khochuakienhang
            });

            if (!foundPNK) {
                res.status(403).json({ message: "PNK is not in data" });
            }
            else {
                const tenkienhangUpdate = (tenkienhang !== '' && tenkienhang !== undefined) ? tenkienhang : foundPNK.tenkienhang;
                const soluongkienhangUpdate = (soluongkienhang !== '' && soluongkienhang !== undefined) ? soluongkienhang : foundPNK.soluongkienhang;
                const khoiluongkienhangUpdate = (khoiluongkienhang !== '' && khoiluongkienhang !== undefined) ? khoiluongkienhang : foundPNK.khoiluongkienhang;
                const dongiaUpdate = (dongia !== '' && dongia !== undefined) ? dongia : foundPNK.dongia;
                const trangthaiUpdate = (trangthai !== '' && trangthai !== undefined) ? trangthai : foundPNK.trangthai;
                const loaikienhangUpdate = (loaikienhang !== '' && loaikienhang !== undefined) ? loaikienhang : foundPNK.loaikienhang;
                const khochuakienhangUpdate = (khochuakienhang !== '' && khochuakienhang !== undefined) ? khochuakienhang : foundPNK.khochuakienhang;
                const diachikhochuaUpdate = (diachikhochua !== '' && diachikhochua !== undefined) ? diachikhochua : foundPNK.diachikhochua;
                const diachinguoinhanUpdate = (diachinguoinhan !== '' && diachinguoinhan !== undefined) ? diachinguoinhan : foundPNK.diachinguoinhan;
                const tennguoiguiUpdate = (tennguoigui !== '' && tennguoigui !== undefined) ? tennguoigui : foundPNK.tennguoigui;
                const sdtnguoiguiUpdate = (sdtnguoigui !== '' && sdtnguoigui !== undefined) ? sdtnguoigui : foundPNK.sdtnguoigui;
                const diachinguoiguiUpdate = (diachinguoigui !== '' && diachinguoigui !== undefined) ? diachinguoigui : foundPNK.diachinguoigui;

                let dongiaChitietUpdate = dongiaUpdate;
                if (dongiaUpdate.includes(",")) {
                    dongiaChitietUpdate = (dongiaUpdate).split(",").join("");
                }

                PhieuNhapKhoChiTiet.findOneAndUpdate({ _id: foundPNK._id },
                    {
                        $set: {
                            tenkienhang: tenkienhangUpdate,
                            soluongkienhang: soluongkienhangUpdate, khoiluongkienhang: khoiluongkienhangUpdate,
                            dongia: new Intl.NumberFormat().format(dongiaChitietUpdate), trangthai: trangthaiUpdate, loaikienhang: loaikienhangUpdate,
                            khochuakienhang: khochuakienhangUpdate, diachikhochua: diachikhochuaUpdate,
                            diachinguoinhan: diachinguoinhanUpdate, tennguoigui: tennguoiguiUpdate,
                            sdtnguoigui: sdtnguoiguiUpdate, diachinguoigui: diachinguoiguiUpdate
                        }
                    }, async function (err, docs) {
                        if (err) {
                            res.status(404).json({ message: "update PNK error" });
                        }
                        else {
                            //update tong tien
                            const foundPNKUpdate = await PhieuNhapKho.findOne({ malohang });
                            const dongiaDetail = (foundPNK.dongia).split(",").join("");
                            const dongiaUpdateFormat = (dongiaUpdate).split(",").join("");
                            const foundPNKUpdateFormat = (foundPNKUpdate.tongtien).split(",").join("");

                            const totalUpdate = parseFloat(foundPNKUpdateFormat, 10) - parseFloat(dongiaDetail, 10) * parseFloat(foundPNK.soluongkienhang, 10) * parseFloat(foundPNK.khoiluongkienhang, 10) + parseFloat(dongiaUpdateFormat, 10) * parseFloat(soluongkienhangUpdate, 10) * parseFloat(khoiluongkienhangUpdate, 10);
                            PhieuNhapKho.findOneAndUpdate({ _id: foundPNKUpdate._id },
                                {
                                    $set: {
                                        tongtien: new Intl.NumberFormat().format(totalUpdate)
                                    }
                                }, function (err, docs) {
                                    if (err) {
                                        res.status(404).json({ message: "update PNK error" });
                                    }
                                });

                            let qtyUpdateKHTK = 0;
                            //co update so luong

                            // if (soluongkienhang !== '' && soluongkienhang !== undefined) {
                            //     qtyUpdateKHTK = parseFloat(soluongkienhang, 10) - parseFloat(foundPNK.soluongkienhang, 10);
                            // }


                            qtyUpdateKHTK = parseFloat(soluongkienhangUpdate, 10) - parseFloat(foundPNK.soluongkienhang, 10);
                            const qty = parseFloat(foundKHTK.soluongkienhang, 10) + parseFloat(qtyUpdateKHTK, 10);
                            const kl = qty * parseFloat(khoiluongkienhangUpdate, 10)

                            KienHangTonKho.findOneAndUpdate({ _id: foundKHTK._id },
                                {
                                    $set: {
                                        tenkienhang: tenkienhangUpdate,
                                        soluongkienhang: qty,
                                        khoiluongkienhang: kl,
                                        dongia: new Intl.NumberFormat().format(dongiaChitietUpdate),
                                        loaikienhang: loaikienhangUpdate,
                                        khochuakienhang: khochuakienhangUpdate
                                    }
                                }, async function (err, docs) {
                                    if (err) {
                                        res.status(404).json({ message: "create PNK error" });
                                    }
                                });

                            const foundThongke = await ThongKeNhapXuatKho.findOne({
                                tenkienhang: (tenkienhangUpdate).toLowerCase(),
                                loaikienhang: loaikienhangUpdate
                            });

                            if (foundThongke) {
                                console.log("co");
                                const qtyThongke = parseFloat(foundThongke.soluongnhap, 10) + parseFloat(qtyUpdateKHTK, 10);
                                let tile = parseFloat(foundThongke.soluongxuat, 10) === 0 ? 0 :
                                    (parseFloat(foundThongke.soluongxuat, 10) / parseFloat(qtyThongke, 10)) * 100
                                console.log("qtyThongke", qtyThongke);
                                console.log("tile", tile);
                                ThongKeNhapXuatKho.findOneAndUpdate({ _id: foundThongke._id },
                                    {
                                        $set: {
                                            soluongnhap: qtyThongke,
                                            tilechuyenhang: tile
                                        }
                                    }, async function (err, docs) {
                                        if (err) {
                                            return res.status(404).json({ message: "create PNK error" });
                                        }
                                    });
                            }

                            res.status(200).json({ message: "update PNK success" });
                        }
                    });
            }

        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "update PNK error" });
        }
    },

    deletePNK: async (req, res, next) => {
        try {
            const { dataUpdate } = req.body;
            const foundPNK = await PhieuNhapKhoChiTiet.findOne({
                malohang: dataUpdate.malohang, tenkienhang: dataUpdate.tenkienhang,
                soluongkienhang: dataUpdate.soluongkienhang, khoiluongkienhang: dataUpdate.khoiluongkienhang,
                dongia: dataUpdate.dongia, trangthai: dataUpdate.trangthai, loaikienhang: dataUpdate.loaikienhang, khochuakienhang: dataUpdate.khochuakienhang,
                diachinguoinhan: dataUpdate.diachinguoinhan, tennguoigui: dataUpdate.tennguoigui, sdtnguoigui: dataUpdate.sdtnguoigui, diachinguoigui: dataUpdate.diachinguoigui
            });

            const foundKHTK = await KienHangTonKho.findOne({
                tenkienhang: (dataUpdate.tenkienhang).toLowerCase(),
                dongia: dataUpdate.dongia,
                //khoiluongkienhang: dataUpdate.khoiluongkienhang,
                loaikienhang: dataUpdate.loaikienhang, khochuakienhang: dataUpdate.khochuakienhang
            });

            if (!foundPNK) {
                res.status(403).json({ message: "PNK is not in data" });
            }
            else {
                PhieuNhapKhoChiTiet.findOneAndDelete({
                    malohang: dataUpdate.malohang, tenkienhang: dataUpdate.tenkienhang,
                    soluongkienhang: dataUpdate.soluongkienhang, khoiluongkienhang: dataUpdate.khoiluongkienhang,
                    dongia: dataUpdate.dongia, trangthai: dataUpdate.trangthai, loaikienhang: dataUpdate.loaikienhang, khochuakienhang: dataUpdate.khochuakienhang,
                    diachinguoinhan: dataUpdate.diachinguoinhan, tennguoigui: dataUpdate.tennguoigui, sdtnguoigui: dataUpdate.sdtnguoigui, diachinguoigui: dataUpdate.diachinguoigui
                }, async function (err, docs) {
                    if (err) {
                        res.status(404).json({ message: "delete PNK error" });
                    }
                    else {
                        const malohangCheck = dataUpdate.malohang
                        const foundPNKChecked = await PhieuNhapKhoChiTiet.findOne({
                            malohang: malohangCheck
                        });

                        if (foundPNKChecked) {
                            //update tong tien
                            const foundPNKUpdate = await PhieuNhapKho.findOne({ malohang: malohangCheck });
                            const dongiaDetail = (foundPNK.dongia).split(",").join("");
                            const foundPNKUpdateFormat = (foundPNKUpdate.tongtien).split(",").join("");

                            const totalUpdate = parseFloat(foundPNKUpdateFormat, 10) - parseFloat(dongiaDetail, 10) * parseFloat(foundPNK.soluongkienhang, 10) * parseFloat(foundPNK.khoiluongkienhang, 10);
                            PhieuNhapKho.findOneAndUpdate({ _id: foundPNKUpdate._id },
                                {
                                    $set: {
                                        tongtien: new Intl.NumberFormat().format(totalUpdate)
                                    }
                                }, function (err, docs) {
                                    if (err) {
                                        res.status(404).json({ message: "update PNK error" });
                                    }
                                });
                        }
                        else {
                            const foundPNKDelete = await PhieuNhapKho.findOne({
                                malohang: malohangCheck
                            });
                            // console.log(foundPNKDelete)
                            const id = foundPNKDelete._id;
                            PhieuNhapKho.findByIdAndDelete(id, function (err, docs) {
                                if (err) {
                                    console.log(err)
                                }
                                else {
                                    console.log("Deleted : ", docs);
                                }
                            });
                        }


                        if (foundKHTK) {
                            if (parseFloat(foundKHTK.soluongkienhang, 10) > parseFloat(foundPNK.soluongkienhang, 10)) {
                                //update lai so luong
                                const qty = parseFloat(foundKHTK.soluongkienhang, 10) - parseFloat(foundPNK.soluongkienhang, 10);
                                const kl = parseFloat(foundKHTK.khoiluongkienhang, 10) - parseFloat(foundPNK.soluongkienhang, 10) * parseFloat(foundPNK.khoiluongkienhang, 10)
                                //const qtykl = parseFloat(foundKHTK.khoiluongkienhang, 10) - parseFloat(foundPNK.khoiluongkienhang, 10);
                                KienHangTonKho.findOneAndUpdate({ _id: foundKHTK._id },
                                    {
                                        $set: {
                                            soluongkienhang: qty,
                                            khoiluongkienhang: kl
                                        }
                                    }, async function (err, docs) {
                                        if (err) {
                                            res.status(404).json({ message: "update PNK error" });
                                        }
                                    });

                            }
                            else {
                                KienHangTonKho.findOneAndDelete({
                                    tenkienhang: (dataUpdate.tenkienhang).toLowerCase(),
                                    dongia: dataUpdate.dongia,
                                    //khoiluongkienhang: dataUpdate.khoiluongkienhang,
                                    loaikienhang: dataUpdate.loaikienhang, khochuakienhang: dataUpdate.khochuakienhang
                                }, async function (err, docs) {
                                    if (err) {
                                        res.status(404).json({ message: "update PNK error" });
                                    }
                                });
                            }
                        }
                        const foundThongke = await ThongKeNhapXuatKho.findOne({
                            tenkienhang: (foundPNK.tenkienhang).toLowerCase(),
                            loaikienhang: foundPNK.loaikienhang
                        });

                        if (foundThongke) {
                            if (parseFloat(foundThongke.soluongnhap, 10) > parseFloat(foundPNK.soluongkienhang, 10)) {
                                const qtyThongke = parseFloat(foundThongke.soluongnhap, 10) - parseFloat(foundPNK.soluongkienhang, 10)
                                let tile = parseFloat(foundThongke.soluongxuat, 10) === 0 ? 0 :
                                    (parseFloat(foundThongke.soluongxuat, 10) / parseFloat(qtyThongke, 10)) * 100
                                ThongKeNhapXuatKho.findOneAndUpdate({ _id: foundThongke._id },
                                    {
                                        $set: {
                                            soluongnhap: qtyThongke,
                                            tilechuyenhang: tile
                                        }
                                    }, async function (err, docs) {
                                        if (err) {
                                            return res.status(404).json({ message: "create PNK error" });
                                        }
                                    });
                            }
                            else {
                                ThongKeNhapXuatKho.findOneAndDelete({
                                    tenkienhang: (foundPNK.tenkienhang).toLowerCase(),
                                    loaikienhang: foundPNK.loaikienhang
                                }, async function (err, docs) {
                                    if (err) {
                                        res.status(404).json({ message: "update PNK error" });
                                    }
                                });
                            }

                        }
                        res.status(200).json({ message: "update PNK success" });
                    }
                });
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "delete PNK error" });
        }
    },

    getListKHTK: async (req, res, next) => {
        const { emailuser } = req.body;
        try {
            //const khtk = await KienHangTonKho.findOne({ khochuakienhang });
            if (emailuser) {
                const fountUser = await User.findOne({ email: emailuser });
                KienHangTonKho.find({ khochuakienhang: fountUser.kholamviec }).then((khtk) => {

                    res.json({
                        result: 'ok',
                        data: khtk,
                        length: khtk.length,
                        message: 'get KHTK successfully'
                    })
                })
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "get KHTK error" });
        }
    },

    getDetailKHTKByID: async (req, res, next) => {
        const { id } = req.body;
        try {
            KienHangTonKho.find({ _id: id }).then((khtk) => {
                console.log(khtk);
                res.json({
                    result: 'ok',
                    data: khtk,
                    message: 'get KHTKDetail successfully'
                })
            })
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "get KHTKDetail error" });
        }
    },

    checkcreate: async (req, res, next) => {
        const { tenkienhang } = req.body;
        try {
            const foundPNKChiTietCheck = await PhieuNhapKhoChiTiet.findOne({ tenkienhang: tenkienhang });
            if (foundPNKChiTietCheck) {
                return res.status(403).json({ message: `Kiện hàng ${tenkienhang} đã tồn tại` });
            }
            res.status(200).json({ message: "success" });
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "get KHTKDetail error" });
        }
    },
}