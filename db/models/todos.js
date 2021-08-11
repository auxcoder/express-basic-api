import Bookshelf from '../bookshelf.js';
import Users from './users.js';

class Todos extends Bookshelf.Model {
  get tableName() { return 'todos' }
  user() {
    return this.belongsTo('Users');
  }
}
// const Todos = {
//   tableName: 'todos',
//   user() {
//     return this.belongsTo('Users');
//   },
// };
// module
export default Bookshelf.model('Todos', Todos);
