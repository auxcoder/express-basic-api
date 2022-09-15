import express, {NextFunction} from 'express';
import createError from "http-errors";

export default function validateReqBody(req: express.Request, res: express.Response, next: NextFunction) : void {
  function requireBodyAttr(method: string) {
    return ['PATCH', 'PUT', 'POST'].indexOf(method) !== -1;
  }

  if (requireBodyAttr(req.method) && Object.keys(req.body).length === 0) {
    next(createError(400, `Invalid request, method ${req.method} requires attributes in body`));
  }
  next();
}
