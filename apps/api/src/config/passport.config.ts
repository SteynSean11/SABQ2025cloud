import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { PrismaClient } from '@prisma/client';
import passport from 'passport';

const prisma = new PrismaClient();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in the environment variables.');
}

const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload: { id: string }, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: jwt_payload.id,
        },
      });
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;