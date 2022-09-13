import { validationResult } from 'express-validator';
import {Request} from 'express-validator/src/base';

const validate = (req: Request, res: any, next: any) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) return next()

  const extractedErrors: {[x: string]: any;}[] = []
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))
  return res.status(422).json({errors: extractedErrors})
}

export default validate;
