const Bookshelf = require('../bookshelf');
require('./users');
const Tokens = {
  tableName: 'tokens',
  user() {
    return this.belongsTo('Users');
  },
};
// module
module.exports = Bookshelf.model('Tokens', Tokens);
