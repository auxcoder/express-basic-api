import bcrypt from 'bcryptjs';

type Payload = {
  salt: string;
  hash: string;
  itr: number;
}

export default async function hashPassword(pass: string, itr: number): Promise<Payload> {
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
