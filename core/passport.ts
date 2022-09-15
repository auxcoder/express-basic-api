import passport from 'passport';
import localPkg from 'passport-local';
import * as jwtPkg from 'passport-jwt';
import prisma from '../db/prisma'
import {compareHash} from '../utils/jwtSign';
const {Strategy: LocalStrategy} = localPkg;
const {Strategy: JWTStrategy, ExtractJwt} = jwtPkg;
const {JWT_SECRET} = process.env;
const SECRET = JWT_SECRET || 'Secret!';

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      session: false,
    },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUniqueOrThrow( {
          where: {email: email},
          select: {id: true, verified: true, username: true, email: true, role: true, password: true}
        });
        if (!user) return done(null, false, {message: 'LocalStrategy user not found.'});
        if (!compareHash(password, user.password)) return done(null, false, {message: 'Wrong password.'});

        return done(null, user, {message: 'Logged In Successfully'});
      } catch (error) {
        if (error instanceof Error) return done(null, false, {message: error.message});
        return done(null, false, {message: 'Unexpected error'});
      }
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: SECRET,
    },
    async function(jwtPayload, done) {
      if (!jwtPayload) return done(null, false, {message: 'JWTStrategy fails with not payload.'});

      try {
        const user = await prisma.user.findFirstOrThrow( {
          where: {email: jwtPayload.email},
          select: {verified: true, username: true, email: true, role: true }
        });
        if (!user) return done(null, false, {message: 'JWTStrategy, user not found.'});
        if (user.email === jwtPayload.email && jwtPayload.sub === 'auth') return done(null, user);

        return done(null, user);
      } catch (error) {
        if (error instanceof Error) return done({message: error.message}, false);
        return done({message: 'Wrong claims'}, false);
      }
    }
  )
);

export default passport;
