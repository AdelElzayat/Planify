import { create } from 'zustand';
import api from '../services/api';

const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (teamId) => {
    set({ loading: true });
    try {
      const { data } = await api.get(`/tasks/${teamId}`);
      set({ tasks: data, loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message, loading: false });
      throw error;
    }
  },

  createTask: async (teamId, taskData) => {
    try {
      const { data } = await api.post(`/tasks/${teamId}`, taskData);
      set((state) => ({ tasks: [...state.tasks, data] }));
      return data;
    } catch (error) {
      throw error.response?.data?.message;
    }
  },

  updateTask: async (taskId, taskData) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, taskData);
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === taskId ? data : t)),
      }));
      return data;
    } catch (error) {
      throw error.response?.data?.message;
    }
  },

  updateTaskStatus: async (taskId, status, order) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === taskId ? { ...t, status, order } : t)),
    }));
    try {
      await api.patch(`/tasks/${taskId}/status`, { status, order });
    } catch (error) {
      // Silently fail — UI already updated optimistically
    }
    return true;
  },

  deleteTask: async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      set((state) => ({
        tasks: state.tasks.filter((t) => t._id !== taskId),
      }));
    } catch (error) {
      throw error.response?.data?.message;
    }
  },
}));

export default useTaskStore;