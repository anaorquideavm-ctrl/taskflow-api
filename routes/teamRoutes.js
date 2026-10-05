const express = require("express");
const {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamStats,
} = require("../controllers/teamController");

const router = express.Router();

// El endpoint de agregación va ANTES de /:id para no capturarlo como id
router.get("/:id/stats", getTeamStats);
router.get("/", getTeams);
router.get("/:id", getTeamById);
router.post("/", createTeam);
router.put("/:id", updateTeam);
router.delete("/:id", deleteTeam);

module.exports = router;
