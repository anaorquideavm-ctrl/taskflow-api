require("dotenv").config({ quiet: true });
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;

// La conexión a MongoDB se hace UNA SOLA VEZ al iniciar el servidor
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ TaskFlow API corriendo en http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error("❌ No se pudo iniciar el servidor:", err.message);
    process.exit(1);
  }
}

startServer();
