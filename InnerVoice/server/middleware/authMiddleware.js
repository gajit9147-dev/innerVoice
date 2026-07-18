export function protect(req, _res, next) {
  req.user = null;
  next();
}