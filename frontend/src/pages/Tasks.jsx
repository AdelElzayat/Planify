import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FiPlus, FiMoreHorizontal, FiCalendar, FiUser, FiX, FiTrash2, FiStar, FiInbox } from 'react-icons/fi';
import useTeamStore from '../stores/useTeamStore';
import useTaskStore from '../stores/useTaskStore';
import Avatar from '../components/common/Avatar';

const columns = [
  { id: 'backlog', title: 'Backlog', gradient: 'from-slate-400 to-slate-500', light: 'bg-slate-50 dark:bg-slate-900/40', icon: '📦' },
  { id: 'todo', title: 'To Do', gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-50/60 dark:bg-blue-950/20', icon: '📝' },
  { id: 'in_progress', title: 'In Progress', gradient: 'from-amber-500 to-amber-600', light: 'bg-amber-50/60 dark:bg-amber-950/20', icon: '⚡' },
  { id: 'testing', title: 'Testing', gradient: 'from-primary-500 to-primary-600', light: 'bg-primary-50/60 dark:bg-primary-950/20', icon: '🧪' },
  { id: 'completed', title: 'Completed', gradient: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50/60 dark:bg-emerald-950/20', icon: '✅' },
];

const priorityConfig = {
  low: { gradient: 'from-slate-400 to-slate-500', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' },
  medium: { gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  high: { gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  urgent: { gradient: 'from-red-500 to-rose-500', bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
};

const columnAccent = {
  backlog: { bg: 'bg-slate-500', text: 'text-slate-600 dark:text-slate-400', soft: 'bg-slate-100 dark:bg-slate-800' },
  todo: { bg: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400', soft: 'bg-blue-50 dark:bg-blue-950/30' },
  in_progress: { bg: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', soft: 'bg-amber-50 dark:bg-amber-950/30' },
  testing: { bg: 'bg-primary-500', text: 'text-primary-600 dark:text-primary-400', soft: 'bg-primary-50 dark:bg-primary-950/30' },
  completed: { bg: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', soft: 'bg-emerald-50 dark:bg-emerald-950/30' },
};

function TaskCard({ task, index, onDelete }) {
  const [showActions, setShowActions] = useState(false);
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const accent = columnAccent[task.status] || columnAccent.todo;

  return (
    <Draggable key={task._id} draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`
              group relative p-4 rounded-2xl cursor-grab active:cursor-grabbing
              bg-white dark:bg-[#1a1c26]
              border border-dark-100 dark:border-dark-800/60
              transition-all duration-200 will-change-transform
              ${snapshot.isDragging
                ? 'shadow-xl shadow-primary-500/10 rotate-[0.5deg] scale-[1.03] border-primary-300/50 dark:border-primary-700/50 z-50 ring-2 ring-primary-500/10'
                : 'shadow-sm hover:shadow-lg hover:shadow-dark-200/20 dark:hover:shadow-dark-900/40 hover:-translate-y-0.5 hover:border-dark-200 dark:hover:border-dark-700/80'
              }
            `}
          >
            {/* Priority gradient bar */}
            <div className={`absolute top-0 left-4 right-4 h-1 rounded-b-full bg-gradient-to-r ${priority.gradient} shadow-sm`} />

            <div className="flex items-start justify-between mb-3 pt-1.5">
              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider border ${priority.bg} ${priority.text} ${priority.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${priority.gradient}`} />
                {task.priority}
              </span>
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1.5 rounded-lg text-dark-300 hover:text-dark-600 dark:hover:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800/60 opacity-0 group-hover:opacity-100 transition-all duration-150"
                >
                  <FiMoreHorizontal className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {showActions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-1.5 z-30 w-40 card py-1.5 shadow-xl border-dark-200 dark:border-dark-700"
                    >
                      <button
                        onClick={() => { onDelete(task._id); setShowActions(false); }}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors duration-150"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" /> Delete task
                      </button>
                    </motion.div>
                )}
                </AnimatePresence>
              </div>
            </div>

            <h4 className="text-sm font-semibold text-dark-900 dark:text-dark-100 mb-2 leading-snug">
              {task.title}
            </h4>

            {task.description && (
              <p className="text-xs text-dark-500 dark:text-dark-400 leading-relaxed mb-3.5 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {task.assignedTo && (
                  <div className="flex items-center gap-1.5 pl-1">
                    <Avatar user={task.assignedTo} size="xs" />
                    <span className="text-[11px] font-medium text-dark-500 dark:text-dark-400 truncate max-w-[70px]">
                      {task.assignedTo?.name?.split(' ')[0] || 'Unassigned'}
                    </span>
                  </div>
                )}
              </div>
              {task.dueDate && (
                <div className={`flex items-center gap-1.5 text-[11px] font-medium ${accent.text}`}>
                  <FiCalendar className="w-3 h-3" />
                  <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </Draggable>
  );
}

function ColumnHeader({ column, count }) {
  return (
    <div className="flex items-center justify-between mb-3 px-1">
      <div className="flex items-center gap-2.5">
        <span className="text-base">{column.icon}</span>
        <h3 className="font-semibold text-sm text-dark-900 dark:text-dark-100 tracking-tight">{column.title}</h3>
      </div>
      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${columnAccent[column.id]?.soft} ${columnAccent[column.id]?.text}`}>
        {count}
      </span>
    </div>
  );
}

function EmptyColumn({ column }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${column.gradient} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center mb-3`}>
        <FiInbox className="w-5 h-5 text-white/80" />
      </div>
      <p className="text-xs font-medium text-dark-400 dark:text-dark-500">No tasks yet</p>
      <p className="text-[10px] text-dark-300 dark:text-dark-600 mt-0.5">Drag tasks here</p>
    </div>
  );
}

export default function Tasks() {
  const { team, fetchMyTeam } = useTeamStore();
  const { tasks, fetchTasks, createTask, updateTaskStatus, deleteTask } = useTaskStore();
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
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center mx-auto mb-3">
            <FiInbox className="w-7 h-7 text-primary-500/50" />
          </div>
          <p className="text-dark-500 dark:text-dark-400 font-medium">Join or create a team to manage tasks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100 tracking-tight">Task Board</h1>
          <p className="text-sm text-dark-500 dark:text-dark-400 mt-1.5">
            Drag and drop to update task status
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreate(true)}
          className="btn-primary self-start sm:self-auto"
        >
          <FiPlus className="w-4 h-4" /> New Task
        </motion.button>
      </motion.div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto pb-4 -mx-1 px-1 sm:mx-0 sm:px-0">
          {columns.map((column) => {
            const columnTasks = tasks.filter((t) => t.status === column.id);

            return (
              <motion.div
                key={column.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="min-w-[260px] sm:min-w-0 flex flex-col snap-start"
              >
                <ColumnHeader column={column} count={columnTasks.length} />

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`
                        flex-1 space-y-3 min-h-[200px] p-2 rounded-2xl
                        transition-all duration-200
                        ${snapshot.isDraggingOver
                          ? `bg-gradient-to-b ${column.light} ring-2 ring-primary-500/10`
                          : 'bg-dark-50/50 dark:bg-dark-900/10'
                        }
                      `}
                    >
                      {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                        <EmptyColumn column={column} />
                      )}
                      {columnTasks.map((task, index) => (
                        <TaskCard
                          key={task._id}
                          task={task}
                          index={index}
                          onDelete={handleDelete}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/70 backdrop-blur-md"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="card p-6 w-full max-w-lg mx-4 shadow-2xl shadow-dark-900/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-dark-900 dark:text-dark-100">New Task</h3>
                  <p className="text-xs text-dark-500 dark:text-dark-400 mt-0.5">Fill in the details below</p>
                </div>
                <button
                  onClick={() => setShowCreate(false)}
                  className="p-2 rounded-xl text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors duration-150"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-700 dark:text-dark-300 mb-2 uppercase tracking-wider">Title</label>
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
                  <label className="block text-xs font-semibold text-dark-700 dark:text-dark-300 mb-2 uppercase tracking-wider">Description</label>
                  <textarea
                    placeholder="Describe the task (optional)"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="textarea"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-dark-700 dark:text-dark-300 mb-2 uppercase tracking-wider">Priority</label>
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
                    <label className="block text-xs font-semibold text-dark-700 dark:text-dark-300 mb-2 uppercase tracking-wider">Due Date</label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-700 dark:text-dark-300 mb-2 uppercase tracking-wider">Assign To</label>
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

                <div className="flex gap-3 pt-3">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || !newTask.title.trim()}
                    whileTap={{ scale: 0.98 }}
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
                  </motion.button>
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