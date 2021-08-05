const Bookshelf = require('../bookshelf');
require('./users');
const Todos = {
  tableName: 'todos',
  user() {
    return this.belongsTo('Users');
  },
};
// module
module.exports = Bookshelf.model('Todos', Todos);
