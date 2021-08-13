
import express from 'express';
import Todos from '../../db/models/todos.js';
import {validateTodo}  from '../middlewares/validateTodo.js';
import validate from '../middlewares/validate.js';
const router = express.Router();

// READ
router.get('/', (req, res) => {
  Todos.fetchAll()
    .then(data => res.json({ errors: false, data: data }))
    .catch(err => res.status(500).json({ errors: [err.message], data: {} }));
});
// CREATE
router.post('/', validateTodo(), validate, (req, res) => {
  new Todos({
    title: req.body.title,
    completed: req.body.completed,
  })
    .save()
    .then(data => res.status(201).json({ errors: false, data: data }))
    .catch(err => res.status(500).json({ errors: [err.message], data: {} }));
});
// READ
router.get('/:id([0-9]+)', (req, res) => {
  if (!req.params.id) console.error('quote ID is required');
  Todos.where('id', req.params.id)
    .fetch()
    .then(data => {
      if (!data) {
        res.status(404).json({ errors: true, data: {} });
      } else {
        res.json({ errors: false, data: data });
      }
    })
    .catch(err => res.status(500).json({ errors: [err.message], data: {} }));
});
// UPDATE
router.patch('/:id([0-9]+)', validateTodo(), validate, (req, res) => {
  if (!req.params.id) console.error('todo ID is required');
  new Todos('id', req.params.id)
    .fetch({ require: true })
    .then(todo => {
      todo
        .save({
          title: req.body.title || todo.title,
          completed: req.body.completed || todo.completed,
          updated_at: new Date().toISOString(),
        })
        .then(data => res.json({ errors: false, data: data, message: 'Todo updated' }));
    })
    .catch(err => res.status(500).json({ errors: [err.message] }));
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
