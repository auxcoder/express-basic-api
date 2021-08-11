# README

## Install

Create a Sqlite DB for development

```sh
$ sqlite3 test.db
```

Install and run

```sh
npm install
npm start
```

## [Knex Migrations](https://knexjs.org/#Migrations)

### Create a new migration

```sh
knex migrate:make migration_name
```

### Run latest migration

```sh
knex migrate:latest
```

### To rollback the last batch of migrations

```sh
knex migrate:rollback
```



---

## Running tests

Currently to make sure that your tests doesn’t listen “twice” from the `server.js` a check is done

```js
if (!module.parent) {
  app.listen(port);
}
```

Another options is using Nodemon, as a npm package script:

```js
"test": "nodemon --exec \"mocha --recursive\""
```

---

## JWT

[JSON Web Token Claims](https://www.iana.org/assignments/jwt/jwt.xhtml)

---

## Logs

Logs gets writen to file from level `debug` and up in the `all-logs.log` files under **/logs** dir. Errors get logged too into `errors.log` files.
Related logic in `/core/logger`, using **[Winston](https://github.com/winstonjs/winston)**.

TODO:

- [Jwt Authentication Tutorial With Example Api](http://jasonwatmore.com/post/2018/08/06/nodejs-jwt-authentication-tutorial-with-example-api)
- [Using Jwt With Passport Authentication](https://medium.com/front-end-weekly/learn-using-jwt-with-passport-authentication-9761539c4314)
- [Authentication In Spa](https://medium.com/@jcbaey/authentication-in-spa-reactjs-and-vuejs-the-right-way-e4a9ac5cd9a3)
- [Module Best Practices](https://github.com/mattdesl/module-best-practices)
- [Authentication PERN](https://github.com/danscratch/pern/blob/master/backend/src/db/user.js)

- [ACL / Roles + Permissions](https://gist.github.com/facultymatt/6370903)
- [Access Control Lists for Node](https://github.com/optimalbits/node_acl)
- [Role and Attribute based Access Control](https://github.com/onury/accesscontrol)

- [How To Structure Bookshelf models](http://billpatrianakos.me/blog/2015/11/30/how-to-structure-bookshelf-dot-js-models/)
- [Bookshelf Js A Node Js Orm](https://stackabuse.com/bookshelf-js-a-node-js-orm/)
- [Bookshelf Modelbase](https://github.com/bsiddiqui/bookshelf-modelbase)
- [Assert NodeJS](https://unitjs.com/guide/assert-node-js.html)

- [Tests, Superagent](http://visionmedia.github.io/superagent/#authentication)

### Relations

- [Issue 83](https://github.com/bookshelf/bookshelf/issues/83)
- [Issue 1088](https://github.com/bookshelf/bookshelf/issues/1088)

### Refs

- [Building A Node Js Rest Api With Express - Part 1](https://medium.com/@jeffandersen/building-a-node-js-rest-api-with-express-46b0901f29b6)
- [Building A Node Js Rest Api With Express - Part 2](https://medium.com/@jeffandersen/building-a-node-js-rest-api-with-express-part-two-9152661bf47)

#### Docs

- [BookshelfJS](https://bookshelfjs.org/api.html)
- [BookshelfJS 'registry' plugin](https://github.com)
- [KnexJS](https://knexjs.org/)
- [SQLite](http://www.sqlitetutorial.net/)
- [WinstonJS](https://github.com/winstonjs/winston)
- [express-validator](https://github.com/express-validator/express-validator)
- [Validator](https://github.com/chriso/validator.js)

---

## Project structure

```sh
├── config                # App configuration files
│  ├─ sequalize.json      # Sequalize config
│  ├─ serviceOne.json     # ServiceOne config
│  └─ ...                 # Other configurations
├── routes
│  ├─ controllers         # Request managers
│  ├─ middlewares         # Request middlewares
│  └─ routes.js           # Define routes and middlewares here
├── services              # External services implementation
│  ├─ serviceOne
│  └─ serviceTwo
│  └─ ...                 # Other services
├── db                    # Data access stuff  (Sequalize mostly)
│  ├─ models              # Models
│  ├─ migrations          # Migrations
│  ├─ seeds               # Seeds
│  └─ index.js            # Sequalize instantiation
├── core                  # Business logic implementation
│  ├─ accounts.js
│  ├─ sales.js
│  ├─ comments.js
│  └─ ...                 # Other business logic implementations
├─ utils                  # Util libs (formats, validation, etc)
├─ tests                  # Testing
├─ scripts                # Standalone scripts for dev uses
├─ pm2.js                 # pm2 init
├─ shipitfile.js          # deployment automation file
├─ package.json
├─ README.md
└─ app.js                 # App starting point
```

---

### HTTP status codes

- **200**  OK, The request was successful
- **201**  CREATED, A new resource object was successfully created
- **404**  NOT FOUND, The requested resource could not be found
- **400** BAD REQUEST, The request was malformed or invalid
- **500**  INTERNAL SERVER ERROR, Unknown server error has occurred

---

### Examples of bookshelf

```js
var sqlite3 = require('sqlite3').verbose();
const dbname = 'test';
var db = new sqlite3.Database(`./${dbname}.db`, err => {
  if (err) return console.error(err.message);
  console.log(`Connected to the ${dbname} SQlite database.`);
});

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS quotes(
      id INTEGER PRIMARY KEY,
      quote TEXT,
      author VARCHAR(255),
      year VARCHAR(255)
    )`
  );
});

app.post('/:id', function(req, res) {
  var columnsList = Object.keys(req.body)
    .map(key => {
      return ` ${key} = '${req.body[key]}'`;
    })
    .join(',');
  db.serialize(() => {
    db.run(
      `UPDATE quotes
      SET ${columnsList}
      WHERE id = ?`,
      req.params.id,
      function(err, row) {
        if (err) console.error(err);
        db.serialize(() => {
          db.get(
            `Select * FROM quotes
            WHERE id = ?`,
            req.params.id,
            function(err, row) {
              if (err) console.error(err);
              res.send(row);
            }
          );
        });
      }
    );
  });
});

app.post('/:id', function(req, res) {
  if (!req.params.id) console.error('quote ID is required');
  db.serialize(() => {
    db.run(
      `DELETE FROM quotes
      WHERE id = ?`,
      req.params.id,
      function(err, row) {
        if (err) console.error(err);
        res.send('');
      }
    );
  });
});
```

```js
Todos.forge('id', req.params.id)
  .fetch({ require: true })
  .then(todo => {
    todo.destroy().then(() => res.json({ error: false, data: { message: 'Quote deleted' } }));
  });
```
