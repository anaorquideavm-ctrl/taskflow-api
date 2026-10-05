const { Schema, model } = require("mongoose");

const teamSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del equipo es obligatorio"],
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      maxlength: [200, "La descripción no puede superar 200 caracteres"],
      trim: true,
    },
  },
  { timestamps: true, collection: "Teams" }
);

module.exports = model("Team", teamSchema);
