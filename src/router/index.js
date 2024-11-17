import { createRouter, createWebHistory } from 'vue-router';
import AuthContainer from '../components/AuthContainer.vue';
import MainPage from '../components/MainPage.vue';
import LoginForm from '@/components/LoginForm.vue';
import ProductDetail from '@/components/ProductDetail.vue';

const routes = [
  { path: '/', component: AuthContainer },
  { path: '/main', component: MainPage },
  { path: '/login', component: LoginForm },
  { path: '/product-detail/:id', component: ProductDetail, name: 'ProductDetail' }, // 修改为支持动态 id 参数
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
