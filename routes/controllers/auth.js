import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import Users from '../../db/models/users.js';
import Tokens from '../../db/models/tokens.js';
import { newUser, existUser } from '../middlewares/validateUser.js';
import { hasAuthToken, verifyEmail } from '../middlewares/validateAuth.js';
import validate from '../middlewares/validate.js';
import jwtSign from '../../utils/jwtSign.js';
import { promisify } from 'util';
import buildUserAttrs from '../../utils/buildUserAtts.js';
import hashPassword from '../../utils/hashPass.js';
import buildTemplateModel from '../../utils/buildTemplateModel.js';
import emailRepository from '../../core/email.js';
import constants from '../../config/constants.js';
const verifyAsync = promisify(jwt.verify);
const router = express.Router();
// READ exist
router.get('/exist/:email', existUser(), validate, (req, res) => {
  Users.where('email', req.params.email).fetch({
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
router.post('/register', newUser(), validate, async (req, res) => {
  try {
    const user = await Users.query({
      where: { email: req.body.email }
    }).fetch({require: true});

    if (user) {
      const messages = [`Email in use: ${user.get('email')}`];
      if (!user.get('verified')) messages.push(`Email not veryfied: ${user.get('verified')}`);
      // response with errors, user exist &|| not verified
      return res.status(400).json({errors: messages, data: {}});
    }
  } catch (error) {
    switch (error.message) {
      case ('EmptyResponse'):
        await createUser();
        break;
      default:
        res.json({errors: [error.message], data: {}});
    }
  }

  async function createUser() {
    try {
      const hash = await hashPassword(req.body.password, constants.saltRounds);
      const userObj = buildUserAttrs(req.body, hash)
      const model = await new Users(userObj).save();
      await emailRepository.sendWelcome(
        'noreplay@auxcoder.com',
        model.get('email'),
        buildTemplateModel(model.toJSON(), req.body.client)
      );
      res.status(201).json({ errors: false, data: {id: model.get('id')}});
    } catch (error) {
      console.log('error >> ', error.message); // eslint-disable-line
      res.json({errors: [error.message], data: {}});
    }
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
      new Tokens({id: token, user_id: user.id})
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
router.get('/logout', hasAuthToken(), validate, (req, res) => {
  const token = req.headers.authorization.replace(/bearer\s+/, '');
  new Tokens({id: token})
    .destroy({required: true})
    .then(() => {
      // Model#destroy() resolves to empty model
      res.json({errors: false, data: {}});
    })
    .catch(err => {
      if (err.message === 'No Rows Deleted') {
        res.status(404).json({errors: [err.message], data: {}});
      } else {
        res.json({errors: [err], data: {}});
      }
    });
});
// VERIFY
router.post('/verify', verifyEmail(), validate, (req, res) => {
  const verifyToken = req.body.token;
  verifyAsync(verifyToken, 'secret')
    .then(decoded => {
      return Users.where('email', decoded.email).fetch({required: true})
    })
    .then(model => {
      model.set({verified: true});
      return model.save();
    })
    .then(model => {
      res.json({errors: false, data: model});
    })
    .catch(err => {
      res.json({errors: [err.message], data: {}});
    });
});
// module
export default router;
