const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask, deleteTask, updateTaskStatus } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.get('/:teamId', protect, getTasks);
router.post('/:teamId', protect, createTask);
router.put('/:id', protect, updateTask);
router.patch('/:id/status', protect, updateTaskStatus);
router.delete('/:id', protect, deleteTask);

module.exports = router;