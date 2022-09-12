import express from 'express';
import passport from 'passport';
import todosRoute from './controllers/todos';
import usersRoute from './controllers/users';
import authRoute from './controllers/auth';

// routes
const router = express.Router();
router.use('/auth', authRoute);
router.use('/todos', passport.authenticate('jwt', { session: false }), todosRoute);
router.use('/users', passport.authenticate('jwt', { session: false }), usersRoute);

export default router;
