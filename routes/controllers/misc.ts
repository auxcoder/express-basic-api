import express, { Request, Response } from 'express'
const router = express.Router()

// It's separate from /api/ping in case we need to change it at some point
router.get('/', (req: Request, res: Response) => res.status(200).json({ data: 'Get request received at "/"' }))

// 'server_status' is used by the AWS load balancer for verifying that the backend is up and running
router.get('/server_status', (req: Request, res: Response) => res.sendStatus(200))

// 'ping' is solely for verifying that the backend is up and running
router.get('/ping', (req: Request, res: Response) => res.status(200).json({ data: 'Ok' }))

export default router
