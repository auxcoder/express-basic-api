import express from 'express';
import apiRoutes from './routes/index.js';
import miscRoutes from './routes/misc.js';
import validateReqBody from './routes/middlewares/validateReqBody.js';
import catchRoute from './routes/middlewares/catchRoute.js';
import passport from './core/passport.js';
import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') dotenv.config();
// import logger from './core/logger.js';

var app = express();
var port = process.env.PORT || 5000;

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// parse application/json
app.use(express.json());
// validate post/put/patch req.body
app.use(validateReqBody);
// passport
app.use(passport.initialize());
// api routes
app.use('/', miscRoutes);
app.use('/api', apiRoutes);
// catch 404 and forward to error handler
app.use(catchRoute);
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).json({ error: true, data: { message: err.message } });
});
// todo: check if a process is running for mocha with --watch flag
app.listen(port, function() {
  console.log(`Express listening on port: ${port}`);
});

export default app;
