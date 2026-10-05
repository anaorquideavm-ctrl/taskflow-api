const Task = require("../models/Task");
const catchAsync = require("../middleware/catchAsync");

// GET /api/tasks - CONSULTA AVANZADA: filtros + orden + paginación
// Ejemplos:
//   GET /api/tasks?status=todo&priority=5
//   GET /api/tasks?teamId=...&assignedTo=...
//   GET /api/tasks?sort=-priority          (prioridad mayor primero)
//   GET /api/tasks?sort=createdAt          (más antiguas primero)
//   GET /api/tasks?page=1&limit=5
exports.getTasks = catchAsync(async (req, res, next) => {
  const { status, priority, teamId, assignedTo, sort, page = 1, limit = 10 } = req.query;

  // 1. Construir el filtro solo con los parámetros que lleguen
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = Number(priority);
  if (teamId) filter.teamId = teamId;
  if (assignedTo) filter.assignedTo = assignedTo;

  // 2. Orden: sort=-priority -> { priority: -1 }; sort=createdAt -> { createdAt: 1 }
  const sortBy = {};
  if (sort) {
    const field = sort.startsWith("-") ? sort.slice(1) : sort;
    sortBy[field] = sort.startsWith("-") ? -1 : 1;
  } else {
    sortBy.createdAt = -1; // por defecto: las más recientes primero
  }

  // 3. Paginación
  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 100);
  const skip = (pageNum - 1) * limitNum;

  // 4. Consulta
  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum)
      .populate("assignedTo", "name email")
      .populate("teamId", "name"),
    Task.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: tasks.length,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
    data: tasks,
  });
});

// GET /api/tasks/:id - obtener una tarea
exports.getTaskById = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id)
    .populate("assignedTo", "name email")
    .populate("teamId", "name");
  if (!task) {
    return res.status(404).json({ success: false, message: "Tarea no encontrada" });
  }
  res.status(200).json({ success: true, data: task });
});

// POST /api/tasks - crear tarea
exports.createTask = catchAsync(async (req, res, next) => {
  const task = await Task.create(req.body); // create() sí dispara pre('save')
  res.status(201).json({ success: true, data: task });
});

// PUT /api/tasks/:id - actualizar tarea
// OJO: findByIdAndUpdate NO dispara pre('save'). Si el status pasa a "done",
// llenamos completedAt aquí explícitamente.
exports.updateTask = catchAsync(async (req, res, next) => {
  if (req.body.status === "done") {
    req.body.completedAt = new Date();
  }

  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!task) {
    return res.status(404).json({ success: false, message: "Tarea no encontrada" });
  }
  res.status(200).json({ success: true, data: task });
});

// DELETE /api/tasks/:id - eliminar tarea
exports.deleteTask = catchAsync(async (req, res, next) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, message: "Tarea no encontrada" });
  }
  res.status(200).json({ success: true, message: "Tarea eliminada" });
});
