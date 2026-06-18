import { create } from 'zustand';
import api from '../services/api';

const storedToken = localStorage.getItem('token');
let storedUser = null;
try {
  const raw = localStorage.getItem('user');
  if (raw) storedUser = JSON.parse(raw);
} catch { }

const useAuthStore = create((set, get) => ({
  user: storedUser,
  token: storedToken,
  loading: false,
  error: null,
  initialized: !!storedToken,

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', userData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
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
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null });
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      try {
        localStorage.setItem('user', JSON.stringify(data));
      } catch {
        localStorage.removeItem('user');
      }
      set({ user: data });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null });
    }
  },

  updateProfile: async (profileData) => {
    try {
      const { data } = await api.put('/auth/profile', profileData);
      localStorage.setItem('user', JSON.stringify(data));
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
      console.log('Uploading avatar file:', file.name, file.type, file.size);
      const { data } = await api.post('/auth/avatar', formData);
      console.log('Upload response:', data);
      try {
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch {
        localStorage.removeItem('user');
      }
      set({ user: data.user });
      return data;
    } catch (error) {
      console.error('Upload failed:', error.response?.data || error.message);
      throw error.response?.data?.message || 'Upload failed';
    }
  },

  removeAvatar: async () => {
    try {
      const { data } = await api.delete('/auth/avatar');
      localStorage.setItem('user', JSON.stringify(data.user));
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