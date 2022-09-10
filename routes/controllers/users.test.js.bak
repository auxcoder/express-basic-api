const app = require('../../server');
const assert = require('assert');
import {jwtSign} from '../../utils/jwtSign';
const request = require('supertest').agent(app.listen());
var chance = require('chance').Chance();
const newUser = {
  username: `test${chance.word({ length: 4 })}`,
  email: chance.email(),
  password: `${chance.character({ casing: 'upper' })}${chance.word({ length: 5 })}${chance.natural({
    min: 1,
    max: 9,
  })}${chance.character({ symbols: true })}`,
};
const testUser = {
  email: 'kiubmen@gmail.com',
  username: 'kiubmen',
  password: 'password',
};
let modelId;
const token = jwtSign(
  {
    username: testUser.username,
    email: testUser.email,
    role: 1,
    verified: testUser.verified,
  },
  'auth',
  String(60 * 60)
);

// READ all/paginate
describe('GET /users', () => {
  it('should get all users records', done => {
    request
      .get('/api/users')
      // .set('Accept', 'application/json') // by default
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
describe('POST /users', () => {
  it('should create a new User', done => {
    request
      .post('/api/users')
      .set('Authorization', `bearer ${token}`)
      .send(newUser)
      .expect(201)
      .expect(res => {
        modelId = res.body.data.id;
        assert.equal(res.body.errors, false);
      })
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
});
// READ
describe('GET /users/<id>', () => {
  it('should get a User by id', done => {
    request
      .get(`/api/users/${modelId}`)
      .set('Authorization', `bearer ${token}`)
      .expect(200)
      .expect(res => {
        modelId = res.body.data.id;
        assert.equal(res.body.errors, false);
      })
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
});
// UPDATE
describe('PATCH /users/<id>', () => {
  it('should update a user record', done => {
    request
      .patch(`/api/users/${modelId}`)
      .set('Authorization', `bearer ${token}`)
      .send(Object.assign(newUser, { email: chance.email() }))
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
describe('DELETE /users/<id>', () => {
  it('should remove a user record', done => {
    request
      .delete(`/api/users/${modelId}`)
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
      .delete(`/api/users/${modelId}`)
      .set('Authorization', `bearer ${token}`)
      .expect(500)
      .end(done);
  });
});
