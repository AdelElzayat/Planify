import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FiPlus, FiMoreHorizontal, FiCalendar, FiUser, FiClock, FiCheck, FiX, FiTrash2, FiStar, FiMessageSquare, FiEdit2 } from 'react-icons/fi';
import useTeamStore from '../stores/useTeamStore';
import useTaskStore from '../stores/useTaskStore';
import useAuthStore from '../stores/useAuthStore';
import Avatar from '../components/common/Avatar';

const columns = [
  { id: 'backlog', title: 'Backlog', color: 'from-dark-400 to-dark-500', dotColor: 'bg-dark-400' },
  { id: 'todo', title: 'To Do', color: 'from-blue-500 to-blue-600', dotColor: 'bg-blue-500' },
  { id: 'in_progress', title: 'In Progress', color: 'from-amber-500 to-orange-500', dotColor: 'bg-amber-500' },
  { id: 'testing', title: 'Testing', color: 'from-purple-500 to-pink-500', dotColor: 'bg-purple-500' },
  { id: 'completed', title: 'Completed', color: 'from-emerald-500 to-green-600', dotColor: 'bg-emerald-500' },
];

const priorityConfig = {
  low: { color: 'bg-dark-300 dark:bg-dark-600', label: 'Low', textColor: 'text-dark-500 dark:text-dark-400' },
  medium: { color: 'bg-blue-400', label: 'Medium', textColor: 'text-blue-600 dark:text-blue-400' },
  high: { color: 'bg-amber-400', label: 'High', textColor: 'text-amber-600 dark:text-amber-400' },
  urgent: { color: 'bg-red-400', label: 'Urgent', textColor: 'text-red-600 dark:text-red-400' },
};

function ConfettiEffect() {
  const particles = Array.from({ length: 8 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            background: ['#7c3aed', '#22d3ee', '#10b981', '#f59e0b', '#ef4444'][i % 5],
            left: `${25 + Math.random() * 50}%`,
            top: `${45 + Math.random() * 20}%`,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [1, 1, 0],
            y: [-10, -30 - Math.random() * 30],
            x: [0, (Math.random() - 0.5) * 40],
          }}
          transition={{
            duration: 0.5 + Math.random() * 0.3,
            delay: Math.random() * 0.1,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

function TaskCard({ task, index, onDelete }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <Draggable key={task._id} draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          layout
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
          }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.12 } }}
          className={`
            group relative p-3.5 rounded-xl cursor-grab active:cursor-grabbing
            bg-white dark:bg-[#1a1c26]
            border border-dark-100 dark:border-dark-800/60
            transition-shadow duration-150
            ${snapshot.isDragging
              ? 'shadow-2xl shadow-primary-500/10 rotate-1 scale-[1.03] border-primary-300/50 dark:border-primary-700/50'
              : 'shadow-sm hover:shadow-md hover:border-dark-200 dark:hover:border-dark-700/80'
            }
          `}
        >
          {/* Priority bar */}
          <div className={`absolute top-0 left-3 right-3 h-0.5 rounded-full ${priorityConfig[task.priority]?.color}`} />

          <div className="flex items-start justify-between mb-2.5 pt-1">
            <div className={`flex items-center gap-1.5 ${priorityConfig[task.priority]?.textColor}`}>
              <FiStar className="w-3 h-3" />
              <span className="text-[10px] font-medium uppercase tracking-wider">
                {priorityConfig[task.priority]?.label}
              </span>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 rounded-lg text-dark-300 hover:text-dark-600 dark:hover:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              >
                <FiMoreHorizontal className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {showActions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 top-full mt-1 z-20 w-36 card p-1 shadow-xl border-dark-200 dark:border-dark-700"
                  >
                    <button
                      onClick={() => { onDelete(task._id); setShowActions(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors duration-150"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" /> Delete task
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <h4 className="text-sm font-medium text-dark-900 dark:text-dark-100 mb-1">
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-dark-500 dark:text-dark-400 line-clamp-2 mb-3">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-dark-400">
            {task.assignedTo && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-dark-50 dark:bg-dark-800/50">
                <Avatar user={task.assignedTo} size="sm" />
                <span className="truncate max-w-[80px]">{task.assignedTo?.name || 'Unassigned'}</span>
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <FiCalendar className="w-3 h-3" />
                <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            )}
          </div>

          {/* Task completion animation */}
          {task.status === 'completed' && snapshot.isDragging && <ConfettiEffect />}
        </motion.div>
      )}
    </Draggable>
  );
}

function ColumnHeader({ column, count }) {
  return (
    <div className="flex items-center gap-2 mb-3 px-1">
      <div className={`w-2.5 h-2.5 rounded-full ${column.dotColor}`} />
      <h3 className="font-semibold text-sm text-dark-900 dark:text-dark-100">{column.title}</h3>
      <motion.span
        key={count}
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="ml-auto text-xs px-2 py-0.5 rounded-full bg-dark-100 dark:bg-dark-800 text-dark-500 dark:text-dark-400 font-medium"
      >
        {count}
      </motion.span>
    </div>
  );
}

export default function Tasks() {
  const { team, fetchMyTeam } = useTeamStore();
  const { tasks, fetchTasks, createTask, updateTask, updateTaskStatus, deleteTask } = useTaskStore();
  const user = useAuthStore((s) => s.user);
  const [showCreate, setShowCreate] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMyTeam();
  }, []);

  useEffect(() => {
    if (team?._id) {
      fetchTasks(team._id);
    }
  }, [team?._id]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    await updateTaskStatus(draggableId, destination.droppableId, destination.index);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!team?._id) return;
    setIsSubmitting(true);
    await createTask(team._id, newTask);
    setShowCreate(false);
    setNewTask({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '' });
    setIsSubmitting(false);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      await deleteTask(taskId);
    }
  };

  if (!team) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-dark-400">Join or create a team to manage tasks</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Task Board</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Drag and drop tasks to update their status</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <FiPlus className="w-4 h-4" /> Add Task
        </button>
      </motion.div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto pb-4 no-scrollbar">
          {columns.map((column) => {
            const columnTasks = tasks.filter((t) => t.status === column.id);

            return (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                className="min-w-[240px] flex flex-col"
              >
                <ColumnHeader column={column} count={columnTasks.length} />

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      layout
                      className={`
                        flex-1 space-y-2.5 min-h-[150px] p-2 rounded-xl
                        transition-colors duration-200 border-2 border-dashed
                        ${snapshot.isDraggingOver
                          ? 'border-primary-300/40 dark:border-primary-700/40 bg-primary-50/30 dark:bg-primary-950/20'
                          : 'border-transparent bg-dark-50/30 dark:bg-dark-900/20'
                        }
                      `}
                    >
                      <AnimatePresence mode="popLayout">
                        {columnTasks.map((task, index) => (
                          <TaskCard
                            key={task._id}
                            task={task}
                            index={index}
                            onDelete={handleDelete}
                          />
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}
                    </motion.div>
                  )}
                </Droppable>
              </motion.div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 12 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="card p-6 w-full max-w-lg mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Create New Task</h3>
                <button
                  onClick={() => setShowCreate(false)}
                  className="p-1.5 rounded-lg text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors duration-150"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Title</label>
                  <input
                    type="text"
                    placeholder="Enter task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="input"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Description</label>
                  <textarea
                    placeholder="Describe the task (optional)"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="textarea"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="select"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Due Date</label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Assign To</label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="select"
                  >
                    <option value="">Unassigned</option>
                    {team?.members?.map((member) => (
                      <option key={member.user?._id} value={member.user?._id}>
                        {member.user?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !newTask.title.trim()}
                    className="btn-primary flex-1"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating...
                      </span>
                    ) : (
                      'Create Task'
                    )}
                  </button>
                  <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}