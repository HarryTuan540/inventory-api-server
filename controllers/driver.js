const Driver = require('../models/driver');
const User = require('../models/user');

async function checkSDT(sdt) {
    const foundDriver = await Driver.findOne({ sdt });
    const fountUser   = await User.findOne({ sdt });

    if(foundDriver){
        return true;
    }
    if(fountUser){
        return true;
    }
    return false;
}

module.exports = {
    createInfoDriver: async (req,res,next) =>{
        try {
            const { cmnd, tentx,trangthai, sdt, namsinh, provine,district, phuong } = req.body;

            const check = await checkSDT(sdt);
            if(check){
                return res.status(404).json({ message: "Số điện thoại không đường trùng" });
            }
            const foundDriver = await Driver.findOne({ cmnd });
            if (foundDriver) {
                res.status(403).json({ message: "Driver info is a already in use" });
            }
            else{
                const newDriver = Driver({ cmnd, tentx,trangthai, sdt, namsinh, provine,district, phuong });
                await newDriver.save();
                res.status(200).json({ message: "create info driver success" });
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "create info driver error" });
        }
    },

    getListDriver: async (req, res, next) => {
        try {
            Driver.find().then((driver) => {
                res.json({
                    result: 'ok',
                    data: driver,
                    length: driver.length,
                    message: 'get driver successfully'
                })
            })
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "get info driver error" });
        }
    },

    deleteDriver: async (req, res, next) => {
        try {
            const { cmnd } = req.body;
            const foundDriver = await Driver.findOne({ cmnd });
            if (!foundDriver) {
                res.status(403).json({ message: "Driver is not in data" });
            }
            else{
                Driver.findOneAndDelete({ cmnd }, function (err, docs) {
                    if (err){
                        res.status(404).json({ message: "delete Driver error" });
                    }
                    else{
                        res.status(200).json({ message: "delete Driver success" });
                    }
                });
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "get info Driver error" });
        }
    },

    editDriver: async (req, res, next) => {
        try {
            const { cmnd, tentx,trangthai, sdt, namsinh, provine,district, phuong } = req.body;
            const foundDriver = await Driver.findOne({ cmnd });

            const check = await checkSDT(sdt);
            if(check){
                return res.status(404).json({ message: "Số điện thoại không đường trùng" });
            }
            
            if (!foundDriver) {
                res.status(403).json({ message: "Driver is not in data" });
            }
            else{
                const tentxUpdate = (tentx !== '' && tentx !== undefined) ? tentx : foundDriver.tentx;
                const trangthaiUpdate = (trangthai !== '' && trangthai !== undefined) ? trangthai : foundDriver.trangthai;
                const sdtUpdate = (sdt !== '' && sdt !== undefined) ? sdt : foundDriver.sdt;
                const namsinhUpdate = (namsinh !== '' && namsinh !== undefined) ? namsinh : foundDriver.namsinh;
                const provineUpdate = (provine !== '' && provine !== undefined) ? provine : foundDriver.provine;
                const districtUpdate = (district !== '' && district !== undefined) ? district : foundDriver.district;
                const phuongUpdate = (phuong !== '' && phuong !== undefined) ? phuong : foundDriver.phuong;

                
                Driver.findOneAndUpdate({ _id: foundDriver._id },{$set:{tentx:tentxUpdate,trangthai:trangthaiUpdate,
                    sdt: sdtUpdate,namsinh:namsinhUpdate,
                    provine: provineUpdate,district:districtUpdate,phuong:phuongUpdate}}, function (err, docs) {
                    if (err){
                        res.status(404).json({ message: "update Driver error" });
                    }
                    else{
                        res.status(200).json({ message: "update Driver success" });
                    }
                });
            }
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "update info Driver error" });
        }
    },
}