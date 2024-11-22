import { createRouter, createWebHistory } from 'vue-router';
import AuthContainer from '../components/AuthContainer.vue';
import MainPage from '../components/MainPage.vue';
import LoginForm from '@/components/LoginForm.vue';
import ProductDetail from '@/components/ProductDetail.vue';
import OtherProfile from '@/components/OtherProfile.vue';
// import ChatPage from '@/components/ChatPage.vue';

const routes = [
  { path: '/', component: AuthContainer },
  { path: '/main', component: MainPage },
  { path: '/login', component: LoginForm },
  { path: '/product-detail/:id', component: ProductDetail, name: 'ProductDetail' }, // 修改为支持动态 id 参数
  { path: '/other-profile/:id', name: 'OtherProfile', component: OtherProfile },
  {
    path: '/mainpage',
    name: 'mainpage',
    component: MainPage,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
