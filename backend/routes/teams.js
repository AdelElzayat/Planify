const express = require('express');
const router = express.Router();
const {
  createTeam, joinTeam, getTeam, getMyTeam, updateTeam,
  removeMember, leaveTeam, inviteMember, assignSupervisor,
  addMilestone, completeMilestone, getAllTeams, deleteTeam
} = require('../controllers/teamController');
const { protect, teamLeaderOnly } = require('../middleware/auth');

router.get('/', protect, getAllTeams);
router.post('/', protect, createTeam);
router.post('/join', protect, joinTeam);
router.get('/my', protect, getMyTeam);
router.get('/:id', protect, getTeam);
router.put('/:id', protect, teamLeaderOnly, updateTeam);
router.post('/:id/invite', protect, teamLeaderOnly, inviteMember);
router.delete('/:id', protect, teamLeaderOnly, deleteTeam);
router.delete('/:id/members/:memberId', protect, teamLeaderOnly, removeMember);
router.post('/:id/leave', protect, leaveTeam);
router.post('/:id/supervisor', protect, teamLeaderOnly, assignSupervisor);
router.post('/:id/milestones', protect, addMilestone);
router.put('/:id/milestones/:milestoneId/complete', protect, completeMilestone);

module.exports = router;