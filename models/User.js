const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "El formato del email no es válido"],
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "developer", "qa", "designer"],
        message: "El rol debe ser: admin, developer, qa o designer",
      },
      default: "developer",
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: [true, "Todo usuario debe pertenecer a un equipo"],
    },
  },
  { timestamps: true, collection: "Users" }
);

module.exports = model("User", userSchema);
