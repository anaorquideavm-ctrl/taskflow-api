const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("Falta MONGO_URI en el archivo .env");

  // dbName elige la base de datos sin modificar la URI de Atlas.
  // maxPoolSize controla cuántas conexiones simultáneas mantiene Mongoose.
  // serverSelectionTimeoutMS: si la IP no está autorizada, falla en 10s en vez de 30.
  await mongoose.connect(uri, {
    dbName: process.env.MONGO_DB_NAME || "taskflow_api",
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`✅ MongoDB conectado a la base "${mongoose.connection.name}"`);
}

module.exports = connectDB;
