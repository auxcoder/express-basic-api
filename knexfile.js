'use strict';

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: 'test.db'
    },
    useNullAsDefault: true
  },
  staging: {
    client: 'postgresql',
    connection: {
      database: 'stg_db',
      user: 'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    }
  },
  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    }
  }
};
