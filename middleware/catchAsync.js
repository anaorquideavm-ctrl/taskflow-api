// Envuelve cada controlador async y envía cualquier error a next(err)
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
