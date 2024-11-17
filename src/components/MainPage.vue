<template>
  <div class="main-page">
    <header class="top-bar">
      <button @click="toggleSidebar" class="sidebar-toggle-button">
        {{ isSidebarCollapsed ? '展开侧边栏' : '收起侧边栏' }}
      </button>
      <button @click="showUserProfile" class="profile-button">
        个人主页
      </button>
    </header>
    <div class="content-container">
      <aside v-if="!isSidebarCollapsed" class="sidebar">
        <ul>
          <li><a href="#" @click.prevent="currentComponent = 'SearchBar'">产品信息</a></li>
          <li><a href="#" @click.prevent="currentComponent = ''">菜单项2</a></li>
          <li><a href="#" @click.prevent="currentComponent = 'UserProfile'">个人主页</a></li>
          <li><a href="#" @click.prevent="currentComponent = 'ProductPublish'">新信息发布</a></li>
        </ul>
      </aside>
      <div class="content">
        <component :is="currentComponent" />
      </div>
      
    </div>
    <div class="product-summary-block" @click.prevent="currentComponent = 'ProductDetail'">
      <p1>旅游产品1</p1>
    </div>
  </div>
</template>

<script>

import UserProfile from '@/components/UserProfile.vue';
import SearchBar from '@/components/SearchBar.vue';
import ProductPublish from './ProductPublish.vue';
import ProductDetail from './ProductDetail.vue';

export default {
  name: 'MainPage',
  components: {
    UserProfile,
    SearchBar,
    ProductPublish,
    ProductDetail
  },
  data() {
    return {
      isSidebarCollapsed: false,
      currentComponent: 'SearchBar', // 默认显示的组件
    };
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    showUserProfile() {
      this.currentComponent = 'UserProfile';
    },

  },
};  
</script>

<style scoped>
.main-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #007bff; /* 蓝色背景 */
  color: white;
  padding: 10px 20px;
}

.sidebar-toggle-button,
.profile-button {
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
}

.content-container {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 200px;
  background-color: #f0f8ff; /* 浅蓝色背景 */
  padding: 20px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  margin-bottom: 15px;
}

.sidebar a {
  text-decoration: none;
  color: #333;
  cursor: pointer;
}

.content {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.site-name {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.product-summary-block {
  width: 200px; /* 宽度 */
  height: 50px; /* 长度 */
  background-color: #ccc; /* 灰色底 */
  color: #333; /* 文字颜色 */
  text-align: center; /* 文字居中 */
  line-height: 30px; /* 使文字垂直居中 */
  border-radius: 5px; /* 可选：边角圆滑 */
  transition: all 0.3s ease; /* 添加平滑的过渡效果 */
  cursor: pointer; /* 鼠标悬停时显示手型光标 */
  }

  .product-summary-block:hover {
  background-color: #aaa; /* 鼠标悬停时背景颜色变暗 */
  transform: scale(1.1); /* 鼠标悬停时放大 */
  }
</style>