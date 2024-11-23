// store.js
import { createStore } from 'vuex';

export default createStore({
    state: {
      users: [], // 存储多个用户信息
    },
    mutations: {
      ADD_USER(state, user) {
        state.users.push(user);
      },
      REMOVE_USER(state, userId) {
        state.users = state.users.filter(user => user.id !== userId);
      },
      SET_CURRENT_USER(state, user) {
        state.currentUser = user;
      },
    },
    actions: {
      addUser({ commit }, userData) {
        commit('ADD_USER', userData);
      },
      removeUser({ commit }, userId) {
        commit('REMOVE_USER', userId);
      },
      setCurrentUser({ commit }, user) {
        commit('SET_CURRENT_USER', user);
      },
    },
    getters: {
      currentUser: state => state.currentUser,
      allUsers: state => state.users,
    },
  });