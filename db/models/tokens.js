import Bookshelf from '../bookshelf.js';
import Users from './users.js';

class Tokens extends Bookshelf.Model {
  get tableName() { return 'tokens'; }
  user() {
    return this.belongsTo('Users');
  }
}
// module
export default Bookshelf.model('Tokens', Tokens);
