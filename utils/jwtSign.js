import jwt from 'jsonwebtoken';

function jwtSign(user, sub, ttl) {
  return jwt.sign(
    {
      name: user.username,
      email: user.email,
      role: user.role,
      vrf: user.verified,
    },
    'secret',
    { algorithm: 'HS256', expiresIn: ttl, subject: sub }
  );
}
// module
export default jwtSign;
