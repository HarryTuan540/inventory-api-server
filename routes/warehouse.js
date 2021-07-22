var router = require('express-promise-router')();
const passport = require('passport');

const WarehouseController = require('../controllers/warehouse');

const passportJWT = passport.authenticate('jwt', { session: false });

router.route('/create-warehouse')
    .post(passportJWT, WarehouseController.createWarehouse);

router.route('/getlist-warehouse')
    .get(passportJWT, WarehouseController.getListWarehouse);

router.route('/thongkekienhang')
    .get(passportJWT, WarehouseController.getListThongKe);

router.route('/delete-warehouse')
    .post(passportJWT, WarehouseController.deleteWarehouse);

router.route('/update-warehouse')
    .post(passportJWT, WarehouseController.editWarehouse);

router.route('/getbyid-warehouse')
    .post(passportJWT, WarehouseController.getByIDWarehouse);

module.exports = router;