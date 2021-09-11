import Bookshelf from '../bookshelf.js';
import Token from './tokens.js';
import Todo from './todos.js';

export default class User extends Bookshelf.Model {
  constructor(...args) {
    super(...args);
    this.tableName = 'users';
    this.idAttribute = 'id';
    this.hidden = ['salt'];
  }

  tokens() {
    return this.hasMany(Token, 'user_id');
  }

  todos() {
    return this.hasMany(Todo, 'user_id');
  }
}
