const express = require("express");
const userRoutes = require("./routes/userRoutes");
const teamRoutes = require("./routes/teamRoutes");
const taskRoutes = require("./routes/taskRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Middlewares globales
app.use(express.json());

// Ruta de salud (útil para comprobar que la API responde)
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bienvenido a TaskFlow API",
    endpoints: ["/api/users", "/api/teams", "/api/tasks"],
  });
});

// Rutas de la API
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/tasks", taskRoutes);

// 404 para rutas que no existen
app.use(notFound);

// Middleware de errores: SIEMPRE al final
app.use(errorHandler);

module.exports = app;
