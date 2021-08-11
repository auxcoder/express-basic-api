// #region
const app = require('../../server');
const assert = require('assert');
import jwtSign from '../utils/jwtSign.js';
// .agent(app.listen()) is used when the --watch flag is used with Mocha.
// but only when I ran that watching command as a npm script from package.json.
const request = require('supertest').agent(app.listen());
var chance = require('chance').Chance();
const todoObj = {
  title: chance.sentence({ words: 5 }),
  completed: chance.bool({ likelihood: 30 }),
};
let modelId;
const testUser = {
  email: 'kiubmen@gmail.com',
  username: 'kiubmen',
  password: 'password',
};
const token = jwtSign(
  {
    name: testUser.username,
    email: testUser.email,
    role: 1,
    vrf: testUser.verified,
  },
  'auth',
  60 * 60
);
// #endregion
// READ all/paginate
describe('GET /todos', () => {
  it('should get all todos records', done => {
    request
      .get('/api/todos')
      // by default
      // .set('Accept', 'application/json')
      .set('Authorization', `bearer ${token}`)
      .expect(200)
      .expect(res => {
        assert.equal(res.body.errors, false);
        assert.equal(res.body.data.length > 0, true);
      })
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
});
// CREATE
describe('POST /todos', () => {
  it('should create a new Todo', done => {
    request
      .post('/api/todos')
      .send(todoObj)
      .set('Authorization', `bearer ${token}`)
      .expect(201)
      .expect(res => {
        modelId = res.body.data.id;
        // check that the source data is in the res
        Object.keys(todoObj).forEach(key => {
          assert.equal(todoObj[key], res.body.data[key]);
        });
      })
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
});
// READ one
describe('GET /todos/<id>', () => {
  it('should get one record', done => {
    request
      .get(`/api/todos/${modelId}`)
      .set('Authorization', `bearer ${token}`)
      .expect(200)
      .expect(res => {
        Object.keys(todoObj).forEach(key => {
          assert.equal(todoObj[key], res.body.data[key]);
        });
      })
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
});
// UPDATE
describe('PATCH /todos/<id>', () => {
  it('should update a todo record', done => {
    request
      .patch(`/api/todos/${modelId}`)
      .set('Authorization', `bearer ${token}`)
      .send(Object.assign(todoObj, { completed: true }))
      .expect(200)
      .expect(res => {
        assert.equal(res.body.errors, false);
      })
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
});
// DELETE
describe('DELETE /todos/<id>', () => {
  it('should remove a todo record', done => {
    request
      .delete(`/api/todos/${modelId}`)
      .set('Authorization', `bearer ${token}`)
      .expect(200)
      .expect(res => {
        assert.equal(res.body.errors, false);
      })
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });

  it('should trow a 404', done => {
    request
      .delete(`/api/todos/${modelId}`)
      .set('Authorization', `bearer ${token}`)
      .expect(500)
      .end(done);
  });
});
