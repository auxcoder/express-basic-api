import passport from 'passport';
import localPkg from 'passport-local';
import jwtPkg from 'passport-jwt';
import bcrypt from 'bcryptjs';
import Users from '../db/models/users.js';
const {Strategy: LocalStrategy} = localPkg;
const {Strategy: JWTStrategy, ExtractJwt} = jwtPkg;

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
      return Users.where('email', decoded.email).fetch({
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

export default passport;
