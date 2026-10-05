const mongoose = require("mongoose");

// Formato consistente de respuestas de error
function errorResponse(res, statusCode, message, errors = null) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}

// 404 para rutas que no existen
function notFound(req, res, next) {
  errorResponse(res, 404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`);
}

// Middleware de errores centralizado: captura TODO lo que llega con next(err)
function errorHandler(err, req, res, next) {
  console.error("Error:", err.message);

  // 400 - ID de Mongo inválido (CastError)
  if (err instanceof mongoose.Error.CastError) {
    return errorResponse(res, 400, `El id "${err.value}" no es válido`);
  }

  // 400 - Validación del esquema (required, enum, min/max, match...)
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => e.message);
    return errorResponse(res, 400, "Error de validación", errors);
  }

  // 409 - Registro duplicado (email único, nombre de equipo único)
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue || {})[0] || "campo";
    return errorResponse(res, 409, `Ya existe un registro con ese ${campo}`);
  }

  // 404 - Error personalizado lanzado desde los controladores
  if (err.statusCode) {
    return errorResponse(res, err.statusCode, err.message);
  }

  // 500 - Errores inesperados
  return errorResponse(res, 500, "Error interno del servidor");
}

module.exports = { notFound, errorHandler };
