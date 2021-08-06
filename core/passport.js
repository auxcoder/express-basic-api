const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcryptjs');
const Users = require('../db/models/users');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      session: false,
    },
    (email, password, done) => {
      Users.where('email', email)
        .fetch({
          require: true,
          columns: ['id', 'verified', 'username', 'email', 'role', 'password'],
        })
        .then(model => {
          if (!model) return done(null, false, {message: 'LocalStrategy user not found.'});
          if (!bcrypt.compareSync(password, model.get('password'))) {
            return done(null, false, {message: 'Wrong password.'});
          }
          model.unset('password');
          return done(null, model.toJSON(), {message: 'Logged In Successfully'});
        })
        .catch(err => done(err));
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret',
    },
    function(jwtPayload, done) {
      return Users.findByEmail(jwtPayload.email, {
        require: true,
        columns: ['verified', 'username', 'email', 'role'],
      })
        .then(model => {
          if (model.get('email') === jwtPayload.email && jwtPayload.sub === 'auth') {
            done(null, model);
          } else {
            done(null, false, {message: 'Wrong claims'});
          }
        })
        .catch(err => done(err));
    }
  )
);
