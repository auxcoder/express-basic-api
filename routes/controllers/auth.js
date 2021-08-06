const express = require('express');
const router = express.Router();
const passport = require('passport');
const Users = require('../../db/models/users');
const Tokens = require('../../db/models/tokens');
const userValidations = require('../middlewares/validateUser');
const validateAuth = require('../middlewares/validateAuth');
const jwtSign = require('../../utils/jwtSign');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const verifyAsync = promisify(jwt.verify);
const buildUserAttrs = require('../../utils/buildUserAtts');
const hashPassword = require('../../utils/hashPass');
const buildTemplateModel = require('../../utils/buildTemplateModel');
const emailRepository = require('../../core/email');
const constants = require('../../config/constants');
// READ exist
router.get('/exist/:email', userValidations.existUser, (req, res) => {
  Users.findByEmail(req.params.email, {
    require: true,
    columns: ['email', 'verified'],
  })
    .then(data => {
      res.json({ errors: false, data: data });
    })
    .catch(err => {
      res.status(404).json({ errors: [err.message], data: {} });
    });
});
// REGISTER
router.post('/register', userValidations.newUser, async (req, res) => {
  try {
    let newUserId;
    const user = await Users.findByEmail(req.body.email, {
      // required: true,
      columns: ['id', 'email', 'verified'],
    });

    if (user) {
      const messages = [`Email in use: ${user.get('email')}`];
      if (!user.get('verified')) messages.push(`Email not veryfied: ${user.get('verified')}`);
      // response with errors, user exist &|| not verified
      return res.status(400).json({ errors: messages, data: {} });
    }
    const hash = await hashPassword(req.body.password, constants.saltRounds);
    const model = await Users.forge(buildUserAttrs(req.body, hash)).save();
    newUserId = model.get('id');
    const welcomeEmail = await emailRepository.sendWelcome(
      'noreplay@auxcoder.com',
      model.get('email'),
      buildTemplateModel(model.toJSON(), req.body.client)
    );
    res.status(201).json({ errors: false, data: { id: newUserId } });
  } catch (error) {
    res.json({ errors: [error.message], data: {} });
  }
});
// LOGIN
router.post('/login', (req, res, next) => {
  const credentials = req.body;
  if(!credentials.email) return res.status(422).json({errors: {email: 'is required'}});
  if(!credentials.password) return res.status(422).json({errors: {password: 'is required'}});

  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(404).json({error: ['User not found', info], data: {}});

    req.login(user, {session: false}, err => {
      if (err) res.send(err);
      const token = jwtSign(user, 'auth', constants.ttlAuth);
      Tokens.forge({id: token, user_id: user.id})
        .save(null, {method: 'insert'})
        .then(model => {
          return res.status(201).json({errors: false, data: model});
        })
        .catch(err => {
          return res.status(500).json({errors: [err.message], data: {}});
        });
    });
  })(req, res, next);
});
// LOGOUT
router.get('/logout', validateAuth.hasAuthToken, (req, res) => {
  const token = req.headers.authorization.replace(/bearer\s+/, '');
  Tokens.forge({ id: token })
    .destroy({ required: true })
    .then(() => {
      // Model#destroy() resolves to empty model
      res.json({ errors: false, data: {} });
    })
    .catch(err => {
      if (err.message === 'No Rows Deleted') {
        res.status(404).json({ errors: [err.message], data: {} });
      } else {
        res.json({ errors: [err], data: {} });
      }
    });
});
// VERIFY
router.post('/verify', validateAuth.verifyEmail, (req, res) => {
  const verifyToken = req.body.token;
  verifyAsync(verifyToken, 'secret')
    .then(decoded => {
      return Users.findByEmail(decoded.email, { required: true });
    })
    .then(model => {
      model.set({ verified: true });
      return model.save();
    })
    .then(model => {
      res.json({ errors: false, data: model });
    })
    .catch(err => {
      res.json({ errors: [err.message], data: {} });
    });
});
// module
module.exports = router;
