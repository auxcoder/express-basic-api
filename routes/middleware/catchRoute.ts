import createError from "http-errors";
import {Request, Response, NextFunction} from 'express';

export default function(req: Request, res: Response, next: NextFunction) {
  next(createError(404, 'Route not found'));
}
