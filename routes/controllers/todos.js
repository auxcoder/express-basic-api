
import express from 'express';
import Todo from '../../db/models/todos.js';
import {getTodos, getTodo, createTodo, patchTodo}  from '../middlewares/validateTodo.js';
import validate from '../middlewares/validate.js';
const router = express.Router();

// READ
router.get('/', getTodos(), validate, async (req, res) => {
  if (!req.body.user_id) console.error('quote ID is required');
  try {
    const data = await Todo.query().select().where({user_id: req.body.user_id});
    return res.json({errors: false, data: data})
  } catch (err) {
    res.status(500).json({errors: [err.message], data: {}})
  }
});
// CREATE
router.post('/', createTodo(), validate, async (req, res) => {
  try {
      const data = await new Todo({
        title: req.body.title,
        completed: req.body.completed,
        user_id: req.body.user_id
      }).save();
      return res.status(201).json({errors: false, data: data})
    } catch (err) {
      res.status(500).json({errors: [err.message], data: {}})
    }
});
// READ
router.get('/:id([0-9]+)', getTodo(), validate, async (req, res) => {
  if (!req.params.id) console.error('quote ID is required');
  try {
    const data = await Todo.where('id', req.params.id).fetch()
    if (!data) {
      return res.status(404).json({errors: true, data: {}});
    } else {
      return res.json({errors: false, data: data});
    }
  } catch (error) {
    return res.status(500).json({errors: [err.message], data: {}})
  }
});
// UPDATE
router.patch('/:id([0-9]+)', patchTodo(), validate, async (req, res) => {
  if (!req.params.id) console.error('todo ID is required');
  try {
    const data = await Todo.query({where: {id: req.params.id}}).fetch({require: true});
    if (data) {
      const toUpdate = Object.assign(req.body, {updated_at: new Date().toISOString()})
      await new Todo({id: data.id}).save(toUpdate, {patch: true});
      return res.json({ errors: false, data: data, message: 'Todo updated'})
    } else {
      return res.status(404).json({errors: 'User not found', data: {}});
    }
  } catch (err) {
    return res.status(500).json({ errors: [err.message] })
  }
});
// DELETE
router.delete('/:id([0-9]+)', (req, res) => {
  if (!req.params.id) console.error('todo ID is required');
  Todos.where('id', req.params.id)
    .destroy({ require: true })
    .then(data => res.json({ errors: false, data: data }))
    .catch(err => res.status(500).json({ errors: [err.message] }));
});

export default router;
