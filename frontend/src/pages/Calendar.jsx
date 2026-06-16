import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiPlus, FiClock, FiChevronDown, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import useTeamStore from '../stores/useTeamStore';
import useTaskStore from '../stores/useTaskStore';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const priorityColors = {
  urgent: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
  high: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
  medium: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
  low: 'bg-gradient-to-r from-dark-400 to-dark-500 text-white',
};

export default function CalendarPage() {
  const { team, fetchMyTeam } = useTeamStore();
  const { tasks, fetchTasks } = useTaskStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    fetchMyTeam();
  }, []);

  useEffect(() => {
    if (team?._id) {
      fetchTasks(team._id);
    }
  }, [team?._id]);

  useEffect(() => {
    generateCalendar();
  }, [currentDate, tasks]);

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayTasks = tasks.filter((t) => {
        if (!t.dueDate) return false;
        const taskDate = new Date(t.dueDate);
        return taskDate.toDateString() === date.toDateString();
      });
      days.push({ day, tasks: dayTasks, date });
    }
    setCalendarDays(days);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDay(null);
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const upcomingTasks = tasks
    .filter((t) => t.dueDate && t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Calendar</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Track deadlines and milestones</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 card p-6"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <FiCalendar className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800/50 transition-colors"
              >
                <FiChevronLeft className="w-5 h-5 text-dark-500" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800/50 transition-colors"
              >
                <FiChevronRight className="w-5 h-5 text-dark-500" />
              </motion.button>
            </div>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-dark-500 dark:text-dark-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <motion.div
                key={index}
                whileHover={day ? { scale: 1.02 } : {}}
                onClick={() => day && setSelectedDay(selectedDay?.day === day.day ? null : day)}
                className={`relative min-h-[90px] p-2 rounded-xl border transition-all duration-200 ${
                  day
                    ? `${selectedDay?.day === day.day 
                        ? 'border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-950/20' 
                        : 'border-dark-100 dark:border-dark-800/60 hover:border-dark-200 dark:hover:border-dark-700/80 hover:bg-dark-50/50 dark:hover:bg-dark-800/20 cursor-pointer'
                      }`
                    : 'border-transparent'
                }`}
              >
                {day && (
                  <>
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium mb-1 ${
                      isToday(day.day)
                        ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-sm shadow-primary-500/30'
                        : 'text-dark-600 dark:text-dark-400'
                    }`}>
                      {day.day}
                    </div>

                    <div className="space-y-0.5">
                      {day.tasks.slice(0, 3).map((task) => (
                        <div
                          key={task._id}
                          className={`text-[9px] px-1.5 py-0.5 rounded-md truncate font-medium ${
                            task.priority === 'urgent'
                              ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                              : task.priority === 'high'
                              ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                              : 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          {task.title}
                        </div>
                      ))}
                      {day.tasks.length > 3 && (
                        <div className="text-[9px] text-dark-400 font-medium px-1.5">
                          +{day.tasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>

          {/* Selected day tasks */}
          <AnimatePresence>
            {selectedDay && selectedDay.tasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-dark-100 dark:border-dark-800/60 overflow-hidden"
              >
                <h4 className="text-sm font-medium text-dark-900 dark:text-dark-100 mb-3">
                  Tasks for {months[currentDate.getMonth()]} {selectedDay.day}
                </h4>
                <div className="space-y-2">
                  {selectedDay.tasks.map((task) => (
                    <motion.div
                      key={task._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-dark-50 dark:bg-dark-800/30"
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        task.priority === 'urgent' ? 'bg-red-500' :
                        task.priority === 'high' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      <span className="text-sm font-medium text-dark-900 dark:text-dark-100 flex-1">
                        {task.title}
                      </span>
                      <span className={`badge ${
                        task.priority === 'urgent' ? 'badge-danger' :
                        task.priority === 'high' ? 'badge-warning' : 'badge-info'
                      }`}>
                        {task.priority}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Upcoming Deadlines Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">
              <FiClock className="w-4 h-4 text-primary-500" />
              Upcoming
            </h3>
            <span className="text-xs text-dark-400">{upcomingTasks.length} tasks</span>
          </div>

          <div className="space-y-2">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task, idx) => {
                const isOverdue = new Date(task.dueDate) < new Date();
                return (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="group flex items-center gap-3 p-3 rounded-xl bg-dark-50 dark:bg-dark-800/30 hover:bg-dark-100 dark:hover:bg-dark-800/50 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      isOverdue ? 'bg-red-500' :
                      task.priority === 'urgent' ? 'bg-red-400' :
                      task.priority === 'high' ? 'bg-amber-400' : 'bg-blue-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-dark-900 dark:text-dark-100 truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <FiClock className="w-2.5 h-2.5 text-dark-400" />
                        <span className={`text-[10px] ${isOverdue ? 'text-red-500 font-medium' : 'text-dark-400'}`}>
                          {new Date(task.dueDate).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <span className={`badge flex-shrink-0 ${
                      task.priority === 'urgent' ? 'badge-danger' :
                      task.priority === 'high' ? 'badge-warning' : 'badge-info'
                    }`}>
                      {task.priority}
                    </span>
                  </motion.div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-dark-400">
                <FiCalendar className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm font-medium">No tasks scheduled</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}