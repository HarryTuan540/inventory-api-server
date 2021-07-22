var router = require('express-promise-router')();
const passport = require('passport');

const DriversController = require('../controllers/driver');

const passportJWT = passport.authenticate('jwt', { session: false });

router.route('/createinfodriver')
  .post(passportJWT, DriversController.createInfoDriver);

router.route('/getlist-driver')
  .get(passportJWT, DriversController.getListDriver);

router.route('/delete-driver')
  .post(passportJWT, DriversController.deleteDriver);

router.route('/update-driver')
  .post(passportJWT, DriversController.editDriver);
module.exports = router;