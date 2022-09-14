import createError from "http-errors";

export default function(req: any, res: any, next: (arg0: createError.HttpError<404>) => void) {
  next(createError(404, 'route not found'));
}
