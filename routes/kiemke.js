var router = require('express-promise-router')();
const passport = require('passport');

const KiemKeController = require('../controllers/kiemke');

const passportJWT = passport.authenticate('jwt', { session: false });

router.route('/createkiemke')
    .post(passportJWT, KiemKeController.createKiemKe);

router.route('/getdetail')
    .post(passportJWT, KiemKeController.getdetail);

module.exports = router;