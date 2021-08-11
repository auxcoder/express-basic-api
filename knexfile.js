export default {
  development: {
    client: 'sqlite3',
    connection: {
      filename: 'test.db',
    },
    migrations: {
      directory: `./db/migrations`,
    },
    seeds: {
      directory: `./db/seeds`,
    },
    useNullAsDefault: true,
  },
  staging: {
    client: 'postgresql',
    connection: {
      database: 'stg_db',
      user: 'username',
      password: 'password',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: `./db/migrations`,
    },
  },
  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: `./db/migrations`,
    },
  },
};
