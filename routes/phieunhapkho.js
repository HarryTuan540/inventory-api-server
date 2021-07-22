var router = require('express-promise-router')();
const passport = require('passport');

const PhieuNhapKhoController = require('../controllers/phieunhapkho');

const passportJWT = passport.authenticate('jwt', { session: false });

router.route('/create-pnk')
    .post(passportJWT, PhieuNhapKhoController.createPNK);

router.route('/getbyuser-pnk')
    .post(passportJWT, PhieuNhapKhoController.getListPNK);

router.route('/getbymalohang-pnkdetail')
    .post(passportJWT, PhieuNhapKhoController.getPNKChiTiet);

router.route('/search-pnk')
    .post(passportJWT, PhieuNhapKhoController.searchPNK);

router.route('/edit-pnk')
    .post(passportJWT, PhieuNhapKhoController.editPNK);

router.route('/delete-pnk')
    .post(passportJWT, PhieuNhapKhoController.deletePNK);

router.route('/get-khtk')
    .post(passportJWT, PhieuNhapKhoController.getListKHTK);

router.route('/getdetail-khtk')
    .post(passportJWT, PhieuNhapKhoController.getDetailKHTKByID);

router.route('/check-create')
    .post(passportJWT, PhieuNhapKhoController.checkcreate);

module.exports = router;