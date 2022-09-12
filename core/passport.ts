import passport from 'passport';
import localPkg from 'passport-local';
import jwtPkg from 'passport-jwt';
import bcrypt from 'bcryptjs';
import prisma from '../db/prisma'
const {Strategy: LocalStrategy} = localPkg;
const {Strategy: JWTStrategy, ExtractJwt} = jwtPkg;

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      session: false,
    },
    async (email, password, done) => {
      const user = await prisma.user.findUnique( {
        where: {email: email},
        select: { id: true, verified: true, username: true, email: true, role: true, password: true }
      });

      if (user === null) return done(null, false, {message: 'LocalStrategy user not found.'});
      if (!bcrypt.compareSync(password, user.password)) return done(null, false, {message: 'Wrong password.'});

      return done(null, user, {message: 'Logged In Successfully'});
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret',
    },
    async function(jwtPayload, done) {
      const user = await prisma.user.findUnique( {
        where: {email: jwtPayload.email},
        select: {verified: true, username: true, email: true, role: true }
      });

      if (user === null) return done(null, false, {message: 'LocalStrategy user not found.'});

      if (user.email === jwtPayload.email && jwtPayload.sub === 'auth') {
        done(null, user);
      } else {
        done(null, false, {message: 'Wrong claims'});
      }
    }
  )
);

export default passport;
