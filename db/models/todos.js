import Bookshelf from '../bookshelf.js';
import User from './users.js';

export default class Todos extends Bookshelf.Model {
  constructor(...args) {
    super(...args);
    this.tableName = 'todos';
    this.idAttribute = 'id';
  }

  user() {
    return this.belongsTo(User, 'id');
  }
}
