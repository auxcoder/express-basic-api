import Bookshelf from '../bookshelf.js';
import User from './users.js';

export default class Token extends Bookshelf.Model {
  constructor(...args) {
    super(...args);
    this.tableName = 'tokens';
    this.idAttribute = 'id';
  }

  user() {
    return this.belongsTo(User, 'id');
  }
}
