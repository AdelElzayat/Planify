const Task = require('../models/Task');
const Notification = require('../models/Notification');

const createTask = async (req, res) => {
  try {
    const { title, description, priority, assignedTo, dueDate, labels } = req.body;
    const teamId = req.params.teamId;

    const task = await Task.create({
      team: teamId,
      title,
      description,
      priority,
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      createdBy: req.user._id,
      labels: labels || []
    });

    if (assignedTo) {
      await Notification.create({
        user: assignedTo,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned: ${title}`,
        data: { taskId: task._id, teamId },
        team: teamId
      });
    }

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ team: req.params.teamId })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .sort({ order: 1, createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { title, description, priority, status, assignedTo, dueDate, order } = req.body;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (order !== undefined) task.order = order;

    await task.save();

    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: assignedTo,
        type: 'task_updated',
        title: 'Task Updated',
        message: `Task "${task.title}" has been updated`,
        data: { taskId: task._id, teamId: task.team },
        team: task.team
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { status, order } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = status;
    if (order !== undefined) task.order = order;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask, updateTaskStatus };