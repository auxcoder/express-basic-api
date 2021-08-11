import bcrypt from 'bcryptjs';

function bcryptSaltAndHash(pass, itr) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(itr, function(err, salt) {
      if (err) reject(err);
      bcrypt.hash(pass, salt, function(err, hash) {
        if (err) reject(err);
        resolve({
          salt: salt,
          hash: hash,
          itr: itr,
        });
      });
    });
  });
}

export default async function hashPassword(password, itr = 2) {
  const hashData = await bcryptSaltAndHash(password, itr);
  return hashData;
};
