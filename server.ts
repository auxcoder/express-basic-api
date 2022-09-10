import express from 'express';
import apiRoutes from './routes/index';
import miscRoutes from './routes/misc';
import validateReqBody from './routes/middleware/validateReqBody.js';
import catchRoute from './routes/middleware/catchRoute.js';
import passport from './core/passport';
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
// app.use(function(err: any, req: express.Request, res: express.Request, next: express.Send) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500).json({ error: true, data: { message: err.message } });
// });
// todo: check if a process is running for mocha with --watch flag
app.listen(port, () => console.log(`Express listening on port: ${port}`));

export default app;
