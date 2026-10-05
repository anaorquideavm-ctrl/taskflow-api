const User = require("../models/User");
const Team = require("../models/Team");
const catchAsync = require("../middleware/catchAsync");

// GET /api/users - listar usuarios
exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().populate("teamId", "name");
  res.status(200).json({ success: true, count: users.length, data: users });
});

// GET /api/users/:id - obtener un usuario
exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate("teamId", "name");
  if (!user) {
    return res.status(404).json({ success: false, message: "Usuario no encontrado" });
  }
  res.status(200).json({ success: true, data: user });
});

// POST /api/users - crear usuario
exports.createUser = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
});

// PUT /api/users/:id - actualizar usuario
exports.updateUser = catchAsync(async (req, res, next) => {
  // runValidators: los updates NO validan por defecto
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return res.status(404).json({ success: false, message: "Usuario no encontrado" });
  }
  res.status(200).json({ success: true, data: user });
});

// DELETE /api/users/:id - eliminar usuario
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "Usuario no encontrado" });
  }
  res.status(200).json({ success: true, message: "Usuario eliminado" });
});
