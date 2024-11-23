// store.js
import { createStore } from 'vuex';

export default createStore({
  state: {
    users: [], // 存储多个用户信息
    currentUser: null, // 当前用户
  },
  mutations: {
    ADD_USER(state, user) {
      // 检查用户是否已存在
      const exists = state.users.find(u => u.id === user.id);
      if (!exists) {
        state.users.push(user);
      }
    },
    REMOVE_USER(state, userId) {
      state.users = state.users.filter(user => user.id !== userId);
      if (state.currentUser && state.currentUser.id === userId) {
        state.currentUser = null;
      }
    },
    SET_CURRENT_USER(state, user) {
      state.currentUser = user;
    },
    LOAD_USERS(state, users) {
      state.users = users;
    },
    LOAD_CURRENT_USER(state, user) {
      state.currentUser = user;
    },
  },
  actions: {
    addUser({ commit, dispatch }, userData) {
      commit('ADD_USER', userData);
      dispatch('saveUsers');
    },
    removeUser({ commit, dispatch }, userId) {
      commit('REMOVE_USER', userId);
      dispatch('saveUsers');
    },
    setCurrentUser({ commit, dispatch }, user) {
      commit('SET_CURRENT_USER', user);
      dispatch('saveCurrentUser');
    },
    initializeStore({ commit }) {
      const users = JSON.parse(localStorage.getItem('Users')) || [];
      const currentUser = JSON.parse(localStorage.getItem('CurrentUser'));
      commit('LOAD_USERS', users);
      commit('LOAD_CURRENT_USER', currentUser);
    },
    saveUsers({ state }) {
      localStorage.setItem('Users', JSON.stringify(state.users));
    },
    saveCurrentUser({ state }) {
      localStorage.setItem('CurrentUser', JSON.stringify(state.currentUser));
    },
  },
  getters: {
    currentUser: state => state.currentUser,
    allUsers: state => state.users,
    isAuthenticated: state => !!state.currentUser,
    getUserById: (state) => (id) => {
        return state.users.find(user => user.id === id);
    },
  },
});