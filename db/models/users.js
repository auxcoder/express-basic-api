import Bookshelf from '../bookshelf.js';
import Tokens from './tokens.js';

class Users extends Bookshelf.Model {
  constructor(...args) {
    super(...args);
    this.tableName = 'users';
    this.idAttribute = 'id';
    this.gethidden = ['salt'];
  }

  tokens() {
    return this.hasMany('Tokens');
  }
}

// module
export default Users;
