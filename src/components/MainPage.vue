<template>
  <div class="main-page">
    <header class="top-bar">
      <button @click="toggleSidebar" class="sidebar-toggle-button">
        {{ isSidebarCollapsed ? '展开侧边栏' : '收起侧边栏' }}
      </button>
      <div class="spacer"></div> <!-- 占位元素，帮助推送铃铛图标到右侧 -->
      <i class="fa fa-bell"></i> <!-- 铃铛图标 -->
      <button @click="showUserProfile" class="profile-button">
        个人主页
      </button>
    </header>
    <div class="content-container">
      <aside v-if="!isSidebarCollapsed" class="sidebar">
        <ul>
          <li><a href="#" @click.prevent="navigateToComponent('SearchBar')">产品搜索</a></li>
          <li><a href="#" @click.prevent="navigateToComponent('Subscribe')">我的订阅</a></li>
          <li><a href="#" @click.prevent="navigateToComponent('UserProfile')">个人主页</a></li>
          <li><a href="#" @click.prevent="navigateToComponent('ChatPage')">聊天信息</a></li>
          <li><a href="#" @click.prevent="navigateToComponent('ProductPublish')">新信息发布</a></li>
        </ul>
      </aside>
      <div class="content">
        <component :is="currentComponent" v-bind="currentComponentProps" userId="userId"></component>
      </div>
    </div>
  </div>
</template>

<script>
import UserProfile from '@/components/UserProfile.vue';
import SearchBar from '@/components/SearchBar.vue';
import ProductPublish from './ProductPublish.vue';
import ProductDetail from './ProductDetail.vue';
import ProductUpdate from './ProductUpdate.vue';
import Subscribe from './Subscribe.vue';
import ChatPage from './ChatPage.vue';

export default {
  name: 'MainPage',
  components: {
    UserProfile,
    SearchBar,
    ProductPublish,
    ProductDetail,
    ProductUpdate,
    Subscribe,
    ChatPage
  },
  created() {
    // 从路由查询参数中获取 userID
    this.userId = this.$route.query.userID;
    console.log('MainPage created with userId:', this.userId);
    // 如果 userID 不存在，可以选择重定向回登录页面或显示错误信息
    if (!this.userId) {
      alert('用户ID缺失，请重新登录。');
      this.$router.push('/login');
    }
  },
  data() {
    return {
      currentComponent: 'SearchBar',
      userId: null,
      isSidebarCollapsed: false,
      productId: '',
    };
  },
  watch: {
    '$route.query.component': {
      immediate: true,
      handler(newComponent) {
        console.log('检测到路由参数 component 变化：', newComponent);
        if (newComponent) {
          this.currentComponent = newComponent;
        } else {
          // 设置默认组件
          this.currentComponent = 'SearchBar';
        }
      }
    },
    '$route.query.userId': {
      immediate: true,
      handler(newUserId) {
        console.log('检测到路由参数 userId 变化：', newUserId);
        this.userId = newUserId;
      }
    }
  },
  computed: {
    currentComponentProps() {
      if (this.currentComponent === 'ChatPage') {
        return { userId: this.userId };
      } else {
        return {};
      }
    },
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    showUserProfile() {
      this.currentComponent = 'UserProfile';
    },
    handleEditProduct(productId) {
      this.currentComponent = 'ProductUpdate';
      // 你可以在这里传递 productId 给 ProductUpdate 组件
      this.productId = productId;
      localStorage.setItem('editted_ProductId', productId);
    },
    handleGoBack() {
      this.currentComponent = 'UserProfile';
    },
    navigateToComponent(componentName) {
      this.$router.push({
      name: 'mainpage',
      query: {
        component: componentName,
        userID: this.userId,
      }
    });
    },
    
  },
};
</script>

<style scoped>
.main-page {
  display: flex;
  flex-direction: column;
  height: 90vh;
}

.top-bar {
  display: flex;
  justify-content: space-between; /* 保证��右两端的元素对齐 */
  align-items: center;
  background-color: #007bff; /* 蓝色背景 */
  color: white;
  padding: 10px 20px;
}

.spacer {
  flex-grow: 1; /* 使用占位元素推送后续元素到右边 */
}

i {
  font-size: 20px;
  color: #f39c12;
  cursor: pointer;
  margin-right: 10px; /* 可以添加一些右边距 */
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
