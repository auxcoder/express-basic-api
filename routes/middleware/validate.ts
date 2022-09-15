import {Request, Response, NextFunction} from 'express';
import { validationResult } from 'express-validator';

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next()

  const extractedErrors: {[x: string]: string;}[] = []
  errors.array().map(err => extractedErrors.push({[err.param]: err.msg}));
  return res.status(400).json({errors: extractedErrors});
}

export default validate;
