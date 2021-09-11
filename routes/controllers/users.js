import express from 'express';
import constants from '../../config/constants.js';
import User from '../../db/models/users.js';
import {newUser, patchUser} from '../middlewares/validateUser.js';
import jwtSign from '../../utils/jwtSign.js';
import hashPassword from '../../utils/hashPass.js';
import validate from '../middlewares/validate.js';
const router = express.Router();
// READ all
router.get('/', async (req, res) => {
  try {
    // knex query builder
    // {withRelated: ['tokens']}
    const data = await User.query().select().where({verified: true});
    return res.json({errors: false, data: data});
  } catch (err) {
    return res.status(500).json({ errors: [err.message], data: {} })
  }
});
// CREATE
router.post('/', newUser(), validate, async (req, res) => {
    try {
      const data = await hashPassword(req.body.password, constants.saltRounds);
      const dataMerged = Object.assign(
        {
          email: req.body.email,
          username: req.body.username,
          salt: data.salt,
          itr: data.itr,
          password: data.hash, // todo: should db field match "hash"
        },
        {
          verified: false,
          active: true,
          role: 1, // guess by default
          veroken: jwtSign(
            Object.assign(req.body, {role: 1, email_verified: false}),
            'verification',
            constants.ttlVerify
          ),
        }
      );
      const user = await new User(dataMerged).save();
      return res.status(201).json({ errors: false, data: {id: user.id }});
    } catch (err) {
      res.status(500).json({errors: [err.message], data: {}});
    }
});
// READ
router.get('/:id([0-9]+)', async (req, res) => {
  if (!req.params.id) console.error('quote ID is required');
  try {
    const data = await User.query({where: {id: req.params.id}}).fetch({require: true});
    if (!data) {
      res.status(404).json({errors: true, message: 'User not found'});
    } else {
      res.json({errors: false, data: data});
    }
  } catch (err) {
    res.status(500).json({errors: [err.message], data: {}})
  }
})
// UPDATE
router.patch('/:id([0-9]+)', patchUser(), validate, async (req, res) => {
  if (!req.params.id) console.error('user ID is required');

  try {
    const data = await User.query({where: {id: req.params.id}}).fetch({require: true});
    if (data) {
      const toUpdate = Object.assign(req.body, {updated_at: new Date().toISOString()})
      await new User({id: data.id}).save(toUpdate, {patch: true});
      return res.json({errors: false, data: toUpdate});
    } else {
      return res.status(404).json({ errors: 'User not found', data: {} });
    }
  } catch (err) {
    return res.status(500).json({ errors: [err.message], data: {} });
  }
});
// DELETE
router.delete('/:id([0-9]+)', (req, res) => {
  if (!req.params.id) console.error('user ID is required');
  let options = { require: true };
  // hard remove test record if env is dev
  if (process.env.NODE_ENV === 'test') options.hardDelete = true;
  new Users('id', req.params.id)
    .destroy(options)
    .then(() => res.json({ errors: false, message: 'User removed' }))
    .catch(err => res.status(500).json({ errors: [err.message], data: {} }));
});

export default router;
