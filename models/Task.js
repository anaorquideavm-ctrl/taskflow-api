const { Schema, model } = require("mongoose");

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "El título de la tarea es obligatorio"],
      minlength: [3, "El título debe tener al menos 3 caracteres"],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["todo", "in-progress", "done"],
        message: "El estado debe ser: todo, in-progress o done",
      },
      default: "todo",
    },
    priority: {
      type: Number,
      min: [1, "La prioridad mínima es 1"],
      max: [5, "La prioridad máxima es 5"],
      default: 3,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: [true, "La tarea debe pertenecer a un equipo"],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    completedAt: Date,
  },
  { timestamps: true, collection: "Tasks" }
);

// Mongoose 9: el hook NO recibe next
// pre('save') corre con create() y save(), NO con findByIdAndUpdate
taskSchema.pre("save", function () {
  if (this.status === "done" && !this.completedAt) {
    this.completedAt = new Date();
  }
});

module.exports = model("Task", taskSchema);
