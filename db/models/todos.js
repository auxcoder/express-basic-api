import Bookshelf from '../bookshelf.js';
import Users from './users.js';

class Todos extends Bookshelf.Model {
  constructor(...args) {
    super(...args);
    this.tableName = 'todos';
  }

  user() {
    return this.belongsTo('Users');
  }
}
// module
export default Bookshelf.model('Todos', Todos);
