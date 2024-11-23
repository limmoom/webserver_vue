// main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import 'font-awesome/css/font-awesome.min.css';

const app = createApp(App);
app.use(store);
store.dispatch('initializeStore');

app.use(router).mount('#app');
