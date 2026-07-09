import { create } from 'zustand';
import api from '../services/api';

const useTeamStore = create((set, get) => ({
  team: null,
  teams: [],
  loading: false,
  error: null,

  fetchMyTeam: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/teams/my');
      set({ team: data, loading: false });
      return data;
    } catch (error) {
      set({ team: null, loading: false });
      return null;
    }
  },

  fetchTeam: async (id) => {
    set({ loading: true });
    try {
      const { data } = await api.get(`/teams/${id}`);
      set({ team: data, loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message, loading: false });
      throw error;
    }
  },

  createTeam: async (teamData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/teams', teamData);
      set({ team: data, loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message, loading: false });
      throw error;
    }
  },

  joinTeam: async (inviteCode) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/teams/join', { inviteCode });
      set({ team: data, loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message, loading: false });
      throw error;
    }
  },

  updateTeam: async (id, teamData) => {
    try {
      const { data } = await api.put(`/teams/${id}`, teamData);
      set({ team: data });
      return data;
    } catch (error) {
      throw error.response?.data?.message;
    }
  },

  removeMember: async (teamId, memberId) => {
    try {
      const { data } = await api.delete(`/teams/${teamId}/members/${memberId}`);
      set({ team: data });
      return data;
    } catch (error) {
      throw error.response?.data?.message;
    }
  },

  fetchTeams: async () => {
    try {
      const { data } = await api.get('/teams');
      set({ teams: data });
      return data;
    } catch (error) {
      throw error.response?.data?.message;
    }
  },

  deleteTeam: async (teamId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.delete(`/teams/${teamId}`);
      set({ team: null, loading: false });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error.response?.data?.message;
    }
  },

  leaveTeam: async (teamId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post(`/teams/${teamId}/leave`);
      set({ team: null, loading: false });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error.response?.data?.message;
    }
  },

  clearTeam: () => set({ team: null, error: null }),
}));

export default useTeamStore;