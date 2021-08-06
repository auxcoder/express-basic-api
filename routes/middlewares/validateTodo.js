const { check } = require('express-validator');
const validateTodo = () => {
  return [
    check('title', `Title field min length should be ${5}`).isLength({ min: 5 }),
    check('completed', 'Completed field should be a boolean').isBoolean()
  ]
}

module.exports = {
  validateTodo
};
