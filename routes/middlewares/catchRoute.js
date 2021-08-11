import createError from "http-errors";

export default function(req, res, next) {
  next(createError(404, 'route not found'));
};
