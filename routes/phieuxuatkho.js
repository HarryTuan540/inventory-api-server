var router = require('express-promise-router')();
const passport = require('passport');

const PhieuXuatKhoController = require('../controllers/phieuxuatkho');

const passportJWT = passport.authenticate('jwt', { session: false });

router.route('/create-pxk')
    .post(passportJWT, PhieuXuatKhoController.createPNK);

router.route('/getbyuser-pxk')
    .post(passportJWT, PhieuXuatKhoController.getListPXK);

router.route('/getbymalohang-pxkdetail')
    .post(passportJWT, PhieuXuatKhoController.getPNKChiTiet);

router.route('/search-pxk')
    .post(passportJWT, PhieuXuatKhoController.searchPNK);

router.route('/report')
    .get(passportJWT, PhieuXuatKhoController.report);

router.route('/edit-pxk')
    .post(passportJWT, PhieuXuatKhoController.editPXK);

router.route('/delete-pxk')
    .post(passportJWT, PhieuXuatKhoController.deletePXK);

module.exports = router;