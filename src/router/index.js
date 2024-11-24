import { createRouter, createWebHistory } from 'vue-router';
import AuthContainer from '../components/AuthContainer.vue';
import MainPage from '../components/MainPage.vue';
import LoginForm from '@/components/LoginForm.vue';
import ProductDetail from '@/components/ProductDetail.vue';
import OtherProfile from '@/components/OtherProfile.vue';
import DynamicDetail from '@/components/DynamicDetail.vue';
// import ChatPage from '@/components/ChatPage.vue';

const routes = [
  { path: '/', component: AuthContainer },
  { path: '/main', component: MainPage },
  { path: '/login', component: LoginForm },
  { path: '/product-detail/:id', component: ProductDetail, name: 'ProductDetail' }, // 修改为支持动态 id 参数
  { path: '/dynamic-detail/:id', component: DynamicDetail, name: 'DynamicDetail' },
  { path: '/other-profile/:id', name: 'OtherProfile', component: OtherProfile },
  {
    path: '/mainpage',
    name: 'mainpage',
    component: MainPage,
  },
  // {
  //   path: '/mainpage',
  //   name: 'MainPage',
  //   component: MainPage,
  //   children: [
  //     {
  //       path: 'dynamicedit/:dynamicId',
  //       name: 'DynamicEdit',
  //       component: () => import('@/components/DynamicEdit.vue'),
  //       props: true,
  //     },
  //     // 可以在这里添加更多子路由
  //   ],
  // },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
