const Team = require("../models/Team");
const Task = require("../models/Task");
const User = require("../models/User");
const catchAsync = require("../middleware/catchAsync");

// GET /api/teams - listar equipos
exports.getTeams = catchAsync(async (req, res, next) => {
  const teams = await Team.find();
  res.status(200).json({ success: true, count: teams.length, data: teams });
});

// GET /api/teams/:id - obtener un equipo con sus miembros
exports.getTeamById = catchAsync(async (req, res, next) => {
  const team = await Team.findById(req.params.id);
  if (!team) {
    return res.status(404).json({ success: false, message: "Equipo no encontrado" });
  }
  const members = await User.find({ teamId: team._id }).select("name email role");
  res.status(200).json({ success: true, data: { ...team.toObject(), members } });
});

// POST /api/teams - crear equipo
exports.createTeam = catchAsync(async (req, res, next) => {
  const team = await Team.create(req.body);
  res.status(201).json({ success: true, data: team });
});

// PUT /api/teams/:id - actualizar equipo
exports.updateTeam = catchAsync(async (req, res, next) => {
  // runValidators: los updates NO validan por defecto
  const team = await Team.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!team) {
    return res.status(404).json({ success: false, message: "Equipo no encontrado" });
  }
  res.status(200).json({ success: true, data: team });
});

// DELETE /api/teams/:id - eliminar equipo
exports.deleteTeam = catchAsync(async (req, res, next) => {
  const team = await Team.findByIdAndDelete(req.params.id);
  if (!team) {
    return res.status(404).json({ success: false, message: "Equipo no encontrado" });
  }
  res.status(200).json({ success: true, message: "Equipo eliminado" });
});

// GET /api/teams/:id/stats - CONSULTA AVANZADA con Aggregation Pipeline:
// cantidad de tareas por estado de un equipo
exports.getTeamStats = catchAsync(async (req, res, next) => {
  const team = await Team.findById(req.params.id);
  if (!team) {
    return res.status(404).json({ success: false, message: "Equipo no encontrado" });
  }

  const stats = await Task.aggregate([
    { $match: { teamId: team._id } },                    // filtrar por equipo
    { $group: { _id: "$status", total: { $sum: 1 } } }, // agrupar por estado
    { $sort: { total: -1 } },                           // ordenar de mayor a menor
    {
      $project: {
        _id: 0,
        status: "$_id",
        total: 1,
      },
    },
  ]);

  res.status(200).json({ success: true, data: { team: team.name, stats } });
});
