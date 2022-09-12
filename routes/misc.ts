import express from 'express';
const router = express.Router();

// 'server_status' is used by the AWS load balancer for verifying that the backend is up and running
router.get('/', (req, res) => res.send('Get request received at "/"'));
// It's separate from /api/ping in case we need to change it at some point
router.get('/server_status', (req, res) => res.sendStatus(200));
// 'ping' is solely for verifying that the backend is up and running
router.get('/ping', (req, res) => res.sendStatus(200));

export default router;
