const PhieuXuatKho = require('../models/phieuxuatkho');
const PhieuNhapKho = require('../models/phieunhapkho');
const PhieuXuatKhoChiTiet = require('../models/phieuxuatkhochitiet');
const KienHangTonKho = require('../models/kienhangtonkho');
const ThongKeNhapXuatKho = require('../models/thongkenhapxuat');
const PhieuNhapKhoChiTiet = require('../models/phieunhapkhochitiet');

function getDifferenceInDays(date1, date2) {
    console.log();
    const diffInMs = date2 - date1;
    return diffInMs / (1000 * 60 * 60 * 24);
}

module.exports = {
    createPNK: async (req, res, next) => {
        try {
            const { data, lydoxuatkho, sotienthanhtoan, phuongthucthanhtoan, taixevanchuyen,
                dongiacuoc, quangduongdichuyen, ngayxuatkho } = req.body;

            let today = new Date(ngayxuatkho);
            const monthCreate = (parseFloat((today.getMonth() + 1), 10) > 9) ? (today.getMonth() + 1) : ("0" + (today.getMonth() + 1));
            const dayCreate = (parseFloat((today.getDate()), 10) > 9) ? (today.getDate()) : ("0" + (today.getDate()));
            let created = monthCreate + '-' + dayCreate + '-' + today.getFullYear();

            const dayCreate2 = (parseFloat((today.getDate() +1), 10) > 9) ? (today.getDate() + 1) : ("0" + (today.getDate() +1));
            let created2 = monthCreate + '-' + dayCreate2 + '-' + today.getFullYear();

            //const tongConvert = (sotienthanhtoan).split(",").join("");
            const tongtienXuatKho = parseFloat(sotienthanhtoan, 10) + (parseFloat(dongiacuoc, 10) * quangduongdichuyen);

            PhieuXuatKho.find().then(async (check) => {
                if (check.length === 0) {
                    for (let i = 0; i < data.length; i++) {
                        const foundPXKCheck = await PhieuNhapKhoChiTiet.findOne({ tenkienhang: data[i].tenkienhang.toLowerCase() });
                        const foundPXK = await PhieuNhapKho.findOne({ malohang: foundPXKCheck.malohang });
                        if (foundPXK) {
                            let today1 = new Date(foundPXK.ngaytaolohang);
                            const monthCreate1 = (parseFloat((today1.getMonth() + 1), 10) > 9) ? (today1.getMonth() + 1) : ("0" + (today1.getMonth() + 1));
                            const dayCreate1 = (parseFloat((today1.getDate()), 10) > 9) ? (today1.getDate()) : ("0" + (today1.getDate()));
                            let created1 = monthCreate1 + '-' + dayCreate1 + '-' + today1.getFullYear();
                            console.log("created1created1", created1);
                            if ((getDifferenceInDays(new Date(created1), new Date(created))) < 0)
                                return res.status(403).json({ message: `Ngay xuat kho phai lon hon ngay nhap kho (${created1})` });
                        }
                    }
                    const newPXK = PhieuXuatKho({
                        malohang: "1000", nguoitaolohang: data[0].nguoitaolohang, 
                        ngaytaolohang: created2, lydoxuatkho,
                        sotienthanhtoan: new Intl.NumberFormat().format(tongtienXuatKho), phuongthucthanhtoan,
                        //sotienthanhtoan: tongtienXuatKho, phuongthucthanhtoan, 
                        taixevanchuyen, dongiacuoc, quangduongdichuyen
                    });
                    await newPXK
                        .save()
                        .then(async (doc) => {

                            for (let i = 0; i < data.length; i++) {
                                const newPXKDetail = PhieuXuatKhoChiTiet({
                                    malohang: "1000", nguoitaolohang: data[i].nguoitaolohang, tenkienhang: data[i].tenkienhang,
                                    soluongkienhang: data[i].soluongkienhang, khoiluongkienhang: data[i].khoiluongkienhang,
                                    trangthai: data[i].trangthai,
                                    loaikienhang: data[i].loaikienhang, khochuakienhang: data[i].khochuakienhang, diachikhochua: data[i].diachikhochua,
                                    tennguoinhan: data[i].tennguoinhan, sdtnguoinhan: data[i].sdtnguoinhan, diachinguoinhan: data[i].diachinguoinhan,
                                    tennguoigui: data[i].tennguoigui, sdtnguoigui: data[i].sdtnguoigui, diachinguoigui: data[i].diachinguoigui,
                                    dongia: data[i].dongia
                                });
                                await newPXKDetail.save();

                                const foundThongke = await ThongKeNhapXuatKho.findOne({
                                    tenkienhang: (data[i].tenkienhang).toLowerCase(),
                                    loaikienhang: data[i].loaikienhang
                                });
                                if (foundThongke) {

                                    const slXuat = parseFloat(foundThongke.soluongxuat, 10) === 0 ? parseFloat(data[i].soluongkienhang, 10) :
                                        parseFloat(foundThongke.soluongxuat, 10) + parseFloat(data[i].soluongkienhang, 10)
                                    let tile = (slXuat / parseFloat(foundThongke.soluongnhap, 10)) * 100;

                                    const monthCreate1 = (parseFloat((today.getMonth() + 1), 9) > 10) ? (today.getMonth() + 1) : ("0" + (today.getMonth() + 1));
                                    const dayCreate1 = (parseFloat((today.getDate()), 10) > 9) ? (today.getDate()) : ("0" + (today.getDate()));
                                    let created1 = monthCreate1 + '-' + dayCreate1 + '-' + today.getFullYear();
                                    let vantoc = 0
                                    if ((getDifferenceInDays(new Date(created), new Date(foundThongke.thoigiannhap))) === 0) {
                                        vantoc = 100;
                                    }
                                    else {
                                        vantoc = slXuat / (getDifferenceInDays(new Date(created), new Date(foundThongke.thoigiannhap)))
                                    }

                                    ThongKeNhapXuatKho.findOneAndUpdate({ _id: foundThongke._id },
                                        {
                                            $set: {
                                                soluongxuat: slXuat,
                                                tilechuyenhang: tile,
                                                thoigianxuat: created,
                                                vantocchuyenhang: Math.abs(vantoc)
                                            }
                                        }, async function (err, docs) {
                                            if (err) {
                                                return res.status(404).json({ message: "create PNK error" });
                                            }
                                        });
                                }



                                const foundKHTK = await KienHangTonKho.findOne({
                                    tenkienhang: (data[i].tenkienhang).toLowerCase(),
                                    dongia: data[i].dongia,
                                    //khoiluongkienhang: data[i].khoiluongkienhang,
                                    loaikienhang: data[i].loaikienhang,
                                    khochuakienhang: data[i].khochuakienhang
                                });

                                if (parseFloat(foundKHTK.soluongkienhang, 10) - parseFloat(data[i].soluongkienhang, 10) === 0) {
                                    //xoa
                                    KienHangTonKho.findOneAndDelete({
                                        tenkienhang: (data[i].tenkienhang).toLowerCase(),
                                        dongia: data[i].dongia,
                                        //khoiluongkienhang: data[i].khoiluongkienhang,
                                        loaikienhang: data[i].loaikienhang,
                                        khochuakienhang: data[i].khochuakienhang
                                    }, async function (err, docs) {
                                        if (err) {
                                            res.status(404).json({ message: "delete KHTK error" });
                                        }
                                    });
                                }
                                else {
                                    const khtkQty = parseFloat(foundKHTK.soluongkienhang, 10) - parseFloat(data[i].soluongkienhang, 10);
                                    const khtkKL = parseFloat(foundKHTK.khoiluongkienhang, 10) - parseFloat(data[i].khoiluongkienhang, 10) * parseFloat(data[i].soluongkienhang, 10);
                                    KienHangTonKho.findOneAndUpdate({ _id: foundKHTK._id },
                                        {
                                            $set: {
                                                soluongkienhang: khtkQty,
                                                khoiluongkienhang: khtkKL
                                            }
                                        }, async function (err, docs) {
                                            if (err) {
                                                res.status(404).json({ message: "create PXK error" });
                                            }
                                        });
                                }
                            }
                            res.status(200).json({ malohang: "1000" });
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(400).json({ message: "create PNK error" });
                        });
                }
                else {
                    for (let i = 0; i < data.length; i++) {
                        const foundPXKCheck = await PhieuNhapKhoChiTiet.findOne({ tenkienhang: data[i].tenkienhang.toLowerCase() });
                        const foundPXK = await PhieuNhapKho.findOne({ malohang: foundPXKCheck.malohang });
                        if (foundPXK) {
                            let today1 = new Date(foundPXK.ngaytaolohang);
                            const monthCreate1 = (parseFloat((today1.getMonth() + 1), 10) > 9) ? (today1.getMonth() + 1) : ("0" + (today1.getMonth() + 1));
                            const dayCreate1 = (parseFloat((today1.getDate()), 10) > 9) ? (today1.getDate()) : ("0" + (today1.getDate()));
                            let created1 = monthCreate1 + '-' + dayCreate1 + '-' + today1.getFullYear();
                            console.log("created1created1", created1);
                            if ((getDifferenceInDays(new Date(created1), new Date(created))) < 0)
                                return res.status(403).json({ message: `Ngay xuat kho phai lon hon ngay nhap kho (${created1})` });
                        }
                    }
                    PhieuXuatKho.find().sort({ malohang: -1 }).then(async (pxk) => {
                        const malohangCheck = (parseInt(pxk[0].malohang) + 1).toString();
                        const foundPXK = await PhieuXuatKho.findOne({ malohang: malohangCheck });
                        if (foundPXK) {
                            res.status(403).json({ message: "ID PNK is a already in use" });
                        }
                        else {
                            const newPXK = PhieuXuatKho({
                                malohang: malohangCheck, nguoitaolohang: data[0].nguoitaolohang,
                                ngaytaolohang: created2, lydoxuatkho,
                                sotienthanhtoan: new Intl.NumberFormat().format(tongtienXuatKho),
                                //sotienthanhtoan: tongtienXuatKho,
                                phuongthucthanhtoan, taixevanchuyen, dongiacuoc, quangduongdichuyen
                            });
                            await newPXK
                                .save()
                                .then(async (doc) => {
                                    for (let i = 0; i < data.length; i++) {
                                        const newPXKDetail = PhieuXuatKhoChiTiet({
                                            malohang: malohangCheck, nguoitaolohang: data[i].nguoitaolohang, tenkienhang: data[i].tenkienhang,
                                            soluongkienhang: data[i].soluongkienhang, khoiluongkienhang: data[i].khoiluongkienhang,
                                            trangthai: data[i].trangthai,
                                            loaikienhang: data[i].loaikienhang, khochuakienhang: data[i].khochuakienhang, diachikhochua: data[i].diachikhochua,
                                            tennguoinhan: data[i].tennguoinhan, sdtnguoinhan: data[i].sdtnguoinhan, diachinguoinhan: data[i].diachinguoinhan,
                                            tennguoigui: data[i].tennguoigui, sdtnguoigui: data[i].sdtnguoigui, diachinguoigui: data[i].diachinguoigui,
                                            dongia: data[i].dongia
                                        });
                                        await newPXKDetail.save();

                                        const foundThongke = await ThongKeNhapXuatKho.findOne({
                                            tenkienhang: (data[i].tenkienhang).toLowerCase(),
                                            loaikienhang: data[i].loaikienhang
                                        });
                                        if (foundThongke) {
                                            const slXuat = parseFloat(foundThongke.soluongxuat, 10) === 0 ? parseFloat(data[i].soluongkienhang, 10) :
                                                parseFloat(foundThongke.soluongxuat, 10) + parseFloat(data[i].soluongkienhang, 10)
                                            let tile = (slXuat / parseFloat(foundThongke.soluongnhap, 10)) * 100;
                                            let vantoc = 0
                                            if ((getDifferenceInDays(new Date(created), new Date(foundThongke.thoigiannhap))) === 0) {
                                                vantoc = 100;
                                            }
                                            else {
                                                vantoc = slXuat / (getDifferenceInDays(new Date(created), new Date(foundThongke.thoigiannhap)))
                                            }


                                            ThongKeNhapXuatKho.findOneAndUpdate({ _id: foundThongke._id },
                                                {
                                                    $set: {
                                                        soluongxuat: slXuat,
                                                        tilechuyenhang: tile,
                                                        thoigianxuat: created,
                                                        vantocchuyenhang: Math.abs(vantoc)
                                                    }
                                                }, async function (err, docs) {
                                                    if (err) {
                                                        return res.status(404).json({ message: "create PNK error" });
                                                    }
                                                });
                                        }

                                        const foundKHTK = await KienHangTonKho.findOne({
                                            tenkienhang: (data[i].tenkienhang).toLowerCase(),
                                            dongia: data[i].dongia,
                                            //khoiluongkienhang: data[i].khoiluongkienhang,
                                            loaikienhang: data[i].loaikienhang,
                                            khochuakienhang: data[i].khochuakienhang
                                        });


                                        if (parseFloat(foundKHTK.soluongkienhang, 10) - parseFloat(data[i].soluongkienhang, 10) === 0) {
                                            //xoa
                                            await KienHangTonKho.findOneAndDelete({
                                                tenkienhang: (data[i].tenkienhang).toLowerCase(),
                                                dongia: data[i].dongia, loaikienhang: data[i].loaikienhang,
                                                khochuakienhang: data[i].khochuakienhang
                                            }, async function (err, docs) {
                                                if (err) {
                                                    res.status(404).json({ message: "delete KHTK error" });
                                                }
                                            });
                                        }
                                        else {
                                            const khtkQty = parseFloat(foundKHTK.soluongkienhang, 10) - parseFloat(data[i].soluongkienhang, 10);
                                            const khtkKL = parseFloat(foundKHTK.khoiluongkienhang, 10) - parseFloat(data[i].khoiluongkienhang, 10) * parseFloat(data[i].soluongkienhang, 10);
                                            await KienHangTonKho.findOneAndUpdate({ _id: foundKHTK._id },
                                                {
                                                    $set: {
                                                        soluongkienhang: khtkQty,
                                                        khoiluongkienhang: khtkKL
                                                    }
                                                }, async function (err, docs) {
                                                    if (err) {
                                                        res.status(404).json({ message: "create PXK error" });
                                                    }
                                                });
                                        }

                                    }
                                    res.status(200).json({ malohang: malohangCheck });
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(400).json({ message: "create PNK error" });
                                });
                        }
                    })
                }
            })
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "create PNK error" });
        }
    },

    getListPXK: async (req, res, next) => {
        const { nguoitaolohang } = req.body;
        console.log(nguoitaolohang)
        try {
            if (nguoitaolohang === '') {
                PhieuXuatKho.find().then((pxk) => {
                    res.json({
                        result: 'ok',
                        data: pxk,
                        length: pxk.length,
                        message: 'get PNK successfully'
                    })
                })
            }
            else {
                PhieuXuatKho.find({ nguoitaolohang }).then((pxk) => {
                    res.json({
                        result: 'ok',
                        data: pxk,
                        length: pxk.length,
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
            PhieuXuatKhoChiTiet.find({ malohang }).then((pxkchitiet) => {
                res.json({
                    result: 'ok',
                    data: pxkchitiet,
                    message: 'get PXKDetail successfully'
                })
            })
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "get PXKDetail error" });
        }
    },

    searchPNK: async (req, res, next) => {
        const { queryString, dataQuery } = req.body;
        try {
            if (queryString === "nguoitaolohang") {
                PhieuXuatKho.find({ nguoitaolohang: dataQuery }).then((pnkchitiet) => {
                    res.json({
                        result: 'ok',
                        data: pnkchitiet,
                        message: 'get PNK successfully'
                    })
                })
            }
            else if (queryString === "malohang") {
                PhieuXuatKho.find({ malohang: dataQuery }).then((pnkchitiet) => {
                    res.json({
                        result: 'ok',
                        data: pnkchitiet,
                        message: 'get PNK successfully'
                    })
                })
            }
            else if (queryString === "ngaytaolohang") {

                PhieuXuatKho.find({ ngaytaolohang: { $gte: dataQuery.date_from, $lte: dataQuery.date_to } }).sort([['time', -1]]).then((pnkchitiet) => {
                    res.json({
                        result: 'ok',
                        data: pnkchitiet,
                        message: 'get PNK successfully'
                    })
                })
            }
            else if (queryString === "khochuakienhang") {
                let listMaLoHang = [];
                PhieuXuatKhoChiTiet.find({ khochuakienhang: dataQuery }).then((pnkchitiet) => {
                    pnkchitiet.forEach(element => {
                        listMaLoHang.push(element.malohang)
                    });
                    PhieuXuatKho.find({ malohang: listMaLoHang }).then((pnkchitiet) => {
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

    report: async (req, res, next) => {

        try {
            PhieuXuatKho.find().then((pxk) => {
                const lengthPXK = pxk.length;
                PhieuNhapKho.find().then((pnk) => {
                    const lengthPNK = pnk.length;
                    const total = lengthPXK + lengthPNK;

                    const percentPNK = lengthPNK / total * 100;
                    const percentPXK = lengthPXK / total * 100;
                    res.json({
                        result: 'ok',
                        percentPNK: percentPNK,
                        percentPXK: percentPXK,
                        message: 'get report successfully'
                    })
                })
            })
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "get report error" });
        }
    },

    editPXK: async (req, res, next) => {
        try {
            const { malohang, tenkienhang, soluongkienhang, khoiluongkienhang, dongia,
                trangthai, loaikienhang, khochuakienhang, diachikhochua, diachinguoigui,
                tennguoinhan, sdtnguoinhan, diachinguoinhan, dataUpdate } = req.body;

            console.log("soluongkienhang", soluongkienhang);
            console.log("dataUpdate.soluongkienhang", dataUpdate.soluongkienhang);
            if (parseFloat(soluongkienhang, 10) <= 0) {
                return res.status(404).json({ message: "Số lượng xuất kho phải lớn hơn 0" });
            }

            const checkSoLuong = parseFloat(soluongkienhang, 10) - parseFloat(dataUpdate.soluongkienhang, 10);
            if (checkSoLuong > 0) {
                const tonkho = await KienHangTonKho.findOne({
                    tenkienhang: dataUpdate.tenkienhang,
                    dongia: dataUpdate.dongia,
                    //khoiluongkienhang: dataUpdate.khoiluongkienhang,
                    loaikienhang: dataUpdate.loaikienhang,
                    khochuakienhang: dataUpdate.khochuakienhang,
                })
                const soluongtoida = parseFloat(dataUpdate.soluongkienhang, 10) + parseFloat(tonkho.soluongkienhang, 10);
                if (parseFloat(soluongkienhang, 10) > soluongtoida) {
                    return res.status(404).json({ message: `Tồn kho của kiện hàng ${dataUpdate.tenkienhang} chỉ còn ${tonkho.soluongkienhang}. Chỉ được xuất kho tối đa ${soluongtoida}` });
                }
            }

            const foundPXK = await PhieuXuatKhoChiTiet.findOne({
                malohang: dataUpdate.malohang, tenkienhang: dataUpdate.tenkienhang,
                soluongkienhang: dataUpdate.soluongkienhang, khoiluongkienhang: dataUpdate.khoiluongkienhang,
                dongia: dataUpdate.dongia, trangthai: dataUpdate.trangthai, loaikienhang: dataUpdate.loaikienhang, khochuakienhang: dataUpdate.khochuakienhang,
                diachinguoigui: dataUpdate.diachinguoigui, tennguoinhan: dataUpdate.tennguoinhan, sdtnguoinhan: dataUpdate.sdtnguoinhan, diachinguoinhan: dataUpdate.diachinguoinhan
            });

            const foundKHTK = await KienHangTonKho.findOne({
                tenkienhang: (dataUpdate.tenkienhang).toLowerCase(),
                dongia: dataUpdate.dongia,
                //khoiluongkienhang: dataUpdate.khoiluongkienhang,
                loaikienhang: dataUpdate.loaikienhang, khochuakienhang: dataUpdate.khochuakienhang
            });

            if (!foundPXK) {
                res.status(403).json({ message: "PXK is not in data" });
            }
            else {
                const tenkienhangUpdate = (tenkienhang !== '' && tenkienhang !== undefined) ? tenkienhang : foundPXK.tenkienhang;
                const soluongkienhangUpdate = (soluongkienhang !== '' && soluongkienhang !== undefined) ? soluongkienhang : foundPXK.soluongkienhang;
                const khoiluongkienhangUpdate = (khoiluongkienhang !== '' && khoiluongkienhang !== undefined) ? khoiluongkienhang : foundPXK.khoiluongkienhang;
                const dongiaUpdate = (dongia !== '' && dongia !== undefined) ? dongia : foundPXK.dongia;
                const trangthaiUpdate = (trangthai !== '' && trangthai !== undefined) ? trangthai : foundPXK.trangthai;
                const loaikienhangUpdate = (loaikienhang !== '' && loaikienhang !== undefined) ? loaikienhang : foundPXK.loaikienhang;
                const khochuakienhangUpdate = (khochuakienhang !== '' && khochuakienhang !== undefined) ? khochuakienhang : foundPXK.khochuakienhang;
                const diachikhochuaUpdate = (diachikhochua !== '' && diachikhochua !== undefined) ? diachikhochua : foundPXK.diachikhochua;
                const diachinguoiguiUpdate = (diachinguoigui !== '' && diachinguoigui !== undefined) ? diachinguoigui : foundPXK.diachinguoigui;
                const tennguoinhanUpdate = (tennguoinhan !== '' && tennguoinhan !== undefined) ? tennguoinhan : foundPXK.tennguoinhan;
                const sdtnguoinhanUpdate = (sdtnguoinhan !== '' && sdtnguoinhan !== undefined) ? sdtnguoinhan : foundPXK.sdtnguoinhan;
                const diachinguoinhanUpdate = (diachinguoinhan !== '' && diachinguoinhan !== undefined) ? diachinguoinhan : foundPXK.diachinguoinhan;

                let dongiaChitietUpdate = dongiaUpdate;
                if (dongiaUpdate.includes(",")) {
                    dongiaChitietUpdate = (dongiaUpdate).split(",").join("");
                }

                PhieuXuatKhoChiTiet.findOneAndUpdate({ _id: foundPXK._id },
                    {
                        $set: {
                            tenkienhang: tenkienhangUpdate,
                            soluongkienhang: soluongkienhangUpdate, khoiluongkienhang: khoiluongkienhangUpdate,
                            dongia: new Intl.NumberFormat().format(dongiaChitietUpdate), trangthai: trangthaiUpdate, loaikienhang: loaikienhangUpdate,
                            khochuakienhang: khochuakienhangUpdate, diachikhochua: diachikhochuaUpdate,
                            diachinguoigui: diachinguoiguiUpdate, tennguoinhan: tennguoinhanUpdate,
                            sdtnguoinhan: sdtnguoinhanUpdate, diachinguoinhan: diachinguoinhanUpdate
                        }
                    }, async function (err, docs) {
                        if (err) {
                            res.status(404).json({ message: "update PXK error" });
                        }
                        else {
                            //update tong tien
                            const foundPXKUpdate = await PhieuXuatKho.findOne({ malohang });
                            const dongiaDetail = (foundPXK.dongia).split(",").join("");
                            const dongiaUpdateFormat = (dongiaUpdate).split(",").join("");
                            const foundPXKUpdateFormat = (foundPXKUpdate.sotienthanhtoan).split(",").join("");

                            const totalUpdate = parseFloat(foundPXKUpdateFormat, 10) - parseFloat(dongiaDetail, 10) * parseFloat(foundPXK.soluongkienhang, 10) * parseFloat(foundPXK.khoiluongkienhang, 10) + parseFloat(dongiaUpdateFormat, 10) * parseFloat(soluongkienhangUpdate, 10) * parseFloat(khoiluongkienhangUpdate, 10);
                            PhieuXuatKho.findOneAndUpdate({ _id: foundPXKUpdate._id },
                                {
                                    $set: {
                                        sotienthanhtoan: new Intl.NumberFormat().format(totalUpdate)
                                    }
                                }, function (err, docs) {
                                    if (err) {
                                        res.status(404).json({ message: "update PNK error" });
                                    }
                                });

                            let qtyUpdateKHTK = 0;
                            //co update so luong

                            if (soluongkienhang !== '' && soluongkienhang !== undefined) {
                                qtyUpdateKHTK = parseFloat(foundPXK.soluongkienhang, 10) - parseFloat(soluongkienhang, 10);
                            }

                            const qty = parseFloat(foundKHTK.soluongkienhang, 10) + parseFloat(qtyUpdateKHTK, 10);
                            const kl = qty * parseFloat(khoiluongkienhangUpdate, 10)
                            KienHangTonKho.findOneAndUpdate({ _id: foundKHTK._id },
                                {
                                    $set: {
                                        soluongkienhang: qty,
                                        khoiluongkienhang: kl
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
                                const qtyThongke = parseFloat(foundThongke.soluongxuat, 10) - parseFloat(qtyUpdateKHTK, 10);
                                let tile = parseFloat(foundThongke.soluongxuat, 10) === 0 ? 0 :
                                    (qtyThongke / parseFloat(foundThongke.soluongnhap, 10)) * 100
                                let vantoc = 0
                                if ((getDifferenceInDays(new Date(foundThongke.thoigianxuat), new Date(foundThongke.thoigiannhap))) === 0) {
                                    vantoc = 100;
                                }
                                else {
                                    vantoc = qtyThongke / (getDifferenceInDays(new Date(foundThongke.thoigianxuat), new Date(foundThongke.thoigiannhap)))
                                }
                                ThongKeNhapXuatKho.findOneAndUpdate({ _id: foundThongke._id },
                                    {
                                        $set: {
                                            soluongxuat: qtyThongke,
                                            tilechuyenhang: tile,
                                            vantocchuyenhang: Math.abs(vantoc)
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
            res.status(400).json({ message: "update PXK error" });
        }
    },

    deletePXK: async (req, res, next) => {
        try {
            const { dataUpdate } = req.body;

            const foundPXK = await PhieuXuatKhoChiTiet.findOne({
                malohang: dataUpdate.malohang, tenkienhang: dataUpdate.tenkienhang,
                soluongkienhang: dataUpdate.soluongkienhang, khoiluongkienhang: dataUpdate.khoiluongkienhang,
                dongia: dataUpdate.dongia, trangthai: dataUpdate.trangthai, loaikienhang: dataUpdate.loaikienhang, khochuakienhang: dataUpdate.khochuakienhang,
                diachinguoigui: dataUpdate.diachinguoigui, tennguoinhan: dataUpdate.tennguoinhan, sdtnguoinhan: dataUpdate.sdtnguoinhan, diachinguoinhan: dataUpdate.diachinguoinhan
            });

            const foundKHTK = await KienHangTonKho.findOne({
                tenkienhang: (dataUpdate.tenkienhang).toLowerCase(),
                dongia: dataUpdate.dongia,
                //khoiluongkienhang: dataUpdate.khoiluongkienhang,
                loaikienhang: dataUpdate.loaikienhang, khochuakienhang: dataUpdate.khochuakienhang
            });

            if (!foundPXK) {
                res.status(403).json({ message: "PXK is not in data" });
            }
            else {
                PhieuXuatKhoChiTiet.findOneAndDelete({
                    malohang: dataUpdate.malohang, tenkienhang: dataUpdate.tenkienhang,
                    soluongkienhang: dataUpdate.soluongkienhang, khoiluongkienhang: dataUpdate.khoiluongkienhang,
                    dongia: dataUpdate.dongia, trangthai: dataUpdate.trangthai, loaikienhang: dataUpdate.loaikienhang, khochuakienhang: dataUpdate.khochuakienhang,
                    diachinguoigui: dataUpdate.diachinguoigui, tennguoinhan: dataUpdate.tennguoinhan, sdtnguoinhan: dataUpdate.sdtnguoinhan, diachinguoinhan: dataUpdate.diachinguoinhan
                }, async function (err, docs) {
                    if (err) {
                        res.status(404).json({ message: "delete PXK error" });
                    }
                    else {
                        const malohangCheck = dataUpdate.malohang

                        const foundPXKChecked = await PhieuXuatKhoChiTiet.findOne({
                            malohang: malohangCheck
                        });
                        if (foundPXKChecked) {
                            //update tong tien
                            const foundPXKUpdate = await PhieuXuatKho.findOne({ malohang: malohangCheck });
                            const dongiaDetail = (foundPXK.dongia).split(",").join("");
                            const foundPXKUpdateFormat = (foundPXKUpdate.sotienthanhtoan).split(",").join("");

                            const totalUpdate = parseFloat(foundPXKUpdateFormat, 10) - parseFloat(dongiaDetail, 10) * parseFloat(foundPXK.soluongkienhang, 10) * parseFloat(foundPXK.khoiluongkienhang, 10);
                            PhieuXuatKho.findOneAndUpdate({ _id: foundPXKUpdate._id },
                                {
                                    $set: {
                                        sotienthanhtoan: new Intl.NumberFormat().format(totalUpdate)
                                    }
                                }, function (err, docs) {
                                    if (err) {
                                        res.status(404).json({ message: "update PXK error" });
                                    }
                                });
                        }
                        else {
                            const foundPXKDelete = await PhieuXuatKho.findOne({
                                malohang: malohangCheck
                            });
                            // console.log(foundPNKDelete)
                            const id = foundPXKDelete._id;
                            PhieuXuatKho.findByIdAndDelete(id, function (err, docs) {
                                if (err) {
                                    console.log(err)
                                }
                                else {
                                    console.log("Deleted : ", docs);
                                }
                            });
                        }


                        if (foundKHTK) {
                            const qty = parseFloat(foundKHTK.soluongkienhang, 10) + parseFloat(foundPXK.soluongkienhang, 10);
                            const kl = parseFloat(foundKHTK.khoiluongkienhang, 10) + parseFloat(foundPXK.soluongkienhang, 10) * parseFloat(foundPXK.khoiluongkienhang, 10)
                            KienHangTonKho.findOneAndUpdate({ _id: foundKHTK._id },
                                {
                                    $set: {
                                        soluongkienhang: qty,
                                        khoiluongkienhang: kl
                                    }
                                }, async function (err, docs) {
                                    if (err) {
                                        res.status(404).json({ message: "update PXK error" });
                                    }
                                });
                        }

                        const foundThongke = await ThongKeNhapXuatKho.findOne({
                            tenkienhang: (foundPXK.tenkienhang).toLowerCase(),
                            loaikienhang: foundPXK.loaikienhang
                        });

                        if (foundThongke) {
                            const qtyThongke = parseFloat(foundThongke.soluongxuat, 10) - parseFloat(foundPXK.soluongkienhang, 10)
                            let tile = parseFloat(foundThongke.soluongxuat, 10) === 0 ? 0 :
                                (qtyThongke / parseFloat(foundThongke.soluongnhap, 10)) * 100

                            let vantoc = 0
                            if ((getDifferenceInDays(new Date(foundThongke.thoigianxuat), new Date(foundThongke.thoigiannhap))) === 0) {
                                vantoc = 100;
                            }
                            else {
                                vantoc = qtyThongke / (getDifferenceInDays(new Date(foundThongke.thoigianxuat), new Date(foundThongke.thoigiannhap)))
                            }
                            ThongKeNhapXuatKho.findOneAndUpdate({ _id: foundThongke._id },
                                {
                                    $set: {
                                        soluongxuat: qtyThongke,
                                        tilechuyenhang: tile,
                                        vantocchuyenhang: Math.abs(vantoc)
                                    }
                                }, async function (err, docs) {
                                    if (err) {
                                        return res.status(404).json({ message: "create PNK error" });
                                    }
                                });
                        }

                        res.status(200).json({ message: "update PXK success" });
                    }
                });
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "delete PXK error" });
        }
    },
}