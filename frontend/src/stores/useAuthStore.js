import { create } from 'zustand';
import api from '../services/api';

const storedToken = localStorage.getItem('token');

const useAuthStore = create((set, get) => ({
  user: null,
  token: storedToken,
  loading: false,
  error: null,
  initialized: !!storedToken,

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', userData);
      localStorage.setItem('token', data.token);
      const { avatar, ...safeUser } = data.user;
      try { localStorage.setItem('user', JSON.stringify(safeUser)); } catch { localStorage.removeItem('user'); }
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      const { avatar, ...safeUser } = data.user;
      try { localStorage.setItem('user', JSON.stringify(safeUser)); } catch { localStorage.removeItem('user'); }
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  refreshUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { data } = await api.get('/auth/me');
      const { avatar, ...safeUser } = data;
      try { localStorage.setItem('user', JSON.stringify(safeUser)); } catch { localStorage.removeItem('user'); }
      set({ user: data });
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null });
    }
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) { set({ user: null }); return; }
    try {
      const { data } = await api.get('/auth/me');
      const { avatar, ...safeUser } = data;
      try { localStorage.setItem('user', JSON.stringify(safeUser)); } catch { localStorage.removeItem('user'); }
      // Keep avatar in the live store so it displays after refresh
      set({ user: data });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null });
    }
  },

  updateProfile: async (profileData) => {
    try {
      const { data } = await api.put('/auth/profile', profileData);
      const { avatar, ...safeUser } = data;
      try { localStorage.setItem('user', JSON.stringify(safeUser)); } catch { localStorage.removeItem('user'); }
      set({ user: data });
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Update failed';
    }
  },

  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await api.post('/auth/avatar', formData);
      const { avatar, ...safeUser } = data.user;
      try { localStorage.setItem('user', JSON.stringify(safeUser)); } catch { localStorage.removeItem('user'); }
      set({ user: data.user });
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Upload failed';
    }
  },

  removeAvatar: async () => {
    try {
      const { data } = await api.delete('/auth/avatar');
      const { avatar, ...safeUser } = data.user;
      try { localStorage.setItem('user', JSON.stringify(safeUser)); } catch { localStorage.removeItem('user'); }
      set({ user: data.user });
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to remove avatar';
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));

if (storedToken) {
  useAuthStore.getState().loadUser();
}

export default useAuthStore;