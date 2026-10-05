// Script para poblar la base con datos de ejemplo.
// Uso: npm run seed
require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Team = require("../models/Team");
const User = require("../models/User");
const Task = require("../models/Task");

async function seed() {
  await connectDB();

  console.log("Limpiando colecciones...");
  await Promise.all([Task.deleteMany({}), User.deleteMany({}), Team.deleteMany({})]);

  console.log("Creando equipos...");
  const backend = await Team.create({ name: "Backend", description: "API y base de datos" });
  const frontend = await Team.create({ name: "Frontend", description: "Interfaz React" });

  console.log("Creando usuarios...");
  const carlos = await User.create({
    name: "Carlos Pérez",
    email: "carlos@taskflow.com",
    role: "developer",
    teamId: backend._id,
  });
  const ana = await User.create({
    name: "Ana Veloz",
    email: "ana@taskflow.com",
    role: "admin",
    teamId: frontend._id,
  });

  console.log("Creando tareas...");
  await Task.create([
    {
      title: "Implementar autenticación JWT",
      status: "in-progress",
      priority: 5,
      teamId: backend._id,
      assignedTo: carlos._id,
    },
    {
      title: "Crear endpoints REST",
      status: "todo",
      priority: 4,
      teamId: backend._id,
      assignedTo: carlos._id,
    },
    {
      title: "Diseñar pantalla de login",
      status: "done",
      priority: 3,
      teamId: frontend._id,
      assignedTo: ana._id,
    },
    {
      title: "Pruebas unitarias de la API",
      status: "todo",
      priority: 2,
      teamId: backend._id,
    },
  ]);

  console.log("✅ Datos de ejemplo creados");
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error("❌ Error en el seed:", err.message);
  await mongoose.disconnect();
  process.exit(1);
});
