const app = require('../../server');
const assert = require('assert');
const jwt = require('jsonwebtoken');
var chance = require('chance').Chance();
const request = require('supertest').agent(app.listen());
const newObj = {
  username: `test${chance.word({ length: 4 })}`,
  email: chance.email(),
  password: `${chance.character({ casing: 'upper' })}${chance.word({ length: 5 })}${chance.natural({
    min: 1,
    max: 9,
  })}${chance.character({ symbols: true })}`,
};
let userId;
let bearerToken;
const testUser = {
  email: 'kiubmen@gmail.com',
  username: 'kiubmen',
  password: 'password',
  ttl: 86400,
};
// REGISTER
describe('POST /register', () => {
  it('should register a new user', done => {
    request
      .post('/api/auth/register')
      .send(
        Object.assign(newObj, {
          client: {
            host: 'http://localhost:3000',
            action_url: '/verify',
            login_url: '/login',
            help_url: '/help',
          },
        })
      )
      .expect(201)
      .expect(res => {
        userId = res.body.data.id;
        assert.equal(res.body.errors, false);
      })
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
});
// LOGIN
describe('POST /login', () => {
  it('should return a valid JWT', done => {
    request
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password, ttl: 86400 })
      .expect(201)
      .expect(res => {
        bearerToken = res.body.data.id;
        assert.equal(res.body.errors, false);
        assert(typeof res.body.data.id == 'string');
        jwt.verify(res.body.data.id, 'secret', function(err, decoded) {
          assert(!err);
          assert.equal(decoded.email, testUser.email);
          assert.equal(decoded.sub, 'auth');
        });
      })
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
});
// READ exist by email
describe('GET /auth/exist/<email>', () => {
  it('should find if email exist', done => {
    request
      .get(`/api/auth/exist/kiubmen@gmail.com`)
      .expect(200)
      .expect(res => {
        assert.equal(res.body.errors, false);
      })
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
  it('should have status 400, email not found', done => {
    request.get(`/api/auth/exist/xxx@gmail.com`).expect(404, done);
  });
});
// VERIFY
describe('GET /auth/verify', () => {
  let verificationToken;
  // get user
  it('should verify account', done => {
    request
      .get(`/api/users/${userId}`)
      .set('Authorization', `bearer ${bearerToken}`)
      .expect(200)
      .expect(res => {
        verificationToken = res.body.data.veroken;
      })
      .end(function(err, res) {
        if (err) done(err);
        done();
      });
  });
  // verify by token
  it('should verify account', done => {
    request
      .post(`/api/auth/verify`)
      .send({ token: verificationToken })
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
// LOGOUT
describe('GET /auth/logout', () => {
  it('should have status 200 and token deleted', done => {
    request
      .get(`/api/auth/logout`)
      .set('Authorization', `bearer ${bearerToken}`)
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
