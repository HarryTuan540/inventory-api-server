var express = require('express');
var router = require('express-promise-router')();
const passport = require('passport');
const passportConf = require('../config/passport');

const { validateBody, schemas } = require('../helpers/routeHelpers');

const UsersController = require('../controllers/users');
const { session } = require('passport');

const passportSignIn = passport.authenticate('local', { session: false });
const passportJWT = passport.authenticate('jwt', { session: false });

router.route('/signup')
  .post(validateBody(schemas.authSchema), UsersController.signUp);

router.route('/signin')
  .post(validateBody(schemas.authSchema), passportSignIn, UsersController.signIn);

router.route('/secret')
  .get(passportJWT, UsersController.secret);

router.route('/getall')
  .get(passportJWT, UsersController.getListUser);

router.route('/delete-user')
  .post(passportJWT, UsersController.deleteUser);

router.route('/update-user')
  .post(passportJWT, UsersController.editUser);

router.route('/getby-user')
  .post(passportJWT, UsersController.getbyUser);

module.exports = router;
