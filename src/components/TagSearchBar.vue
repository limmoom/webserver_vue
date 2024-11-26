<template> 
    <div style="margin-bottom: 30px;"></div>
    <div class="search-bar">
      <!-- 搜索栏部分 -->
      <div class="search-section">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="搜索节点..."
          class="search-box"
        />
        <button @click="onSearch" class="search-button">搜索</button>
      </div>
  
      <div style="margin-bottom: 30px;"></div>
  
      <!-- 搜索结果部分 -->
      <div class="tag-results">
        <div v-if="loading" class="loading">在搜索框中输入节点，可搜索并订阅节点</div>
        <div v-if="!loading && tags.length === 0" class="no-results">没有找到相关节点</div>
        <div v-if="!loading" class="tag-list">
          <div
            v-for="(tag, index) in tags"
            :key="index"
            class="tag-summary-block"
          >
            <p>{{ tag.name }}</p>
            <button
              :class="['subscribe-button', isSubscribed(tag.id) ? 'subscribed' : '']"
              @click="toggleSubscription(tag.id)"
            >
              {{ isSubscribed(tag.id) ? '✔' : '✚' }}
            </button>
          </div>
        </div>
  
        <div style="margin-bottom: 50px;"></div>
  
        <!-- 分页部分 -->
        <div v-if="!loading" class="pagination">
          <button @click="changePage(currentPage - 1)" :disabled="currentPage === 0">上一页</button>
          <span>第 {{ currentPage + 1 }} 页</span>
          <button @click="changePage(currentPage + 1)" :disabled="currentPage >= totalPages - 1">下一页</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { mapGetters } from 'vuex';
  export default {
    name: "TagSearch",
    data() {
      return {
        searchQuery: "",
        tags: [], // 搜索结果
        loading: true, // 加载状态
        currentPage: 0, // 当前页
        pageSize: 10, // 每页显示的数量
        totalItems: 0, // 总结果数
        totalPages: 0, // 总页数
        userId: 0, // 当前用户ID
        userSubscriptions: [], // 用户已订阅的tagID列表
      };
    },
    computed: {
      ...mapGetters(['currentUser', 'getUserById']),
    },
    created() {
      this.userId = this.currentUser.id;
    },
    methods: {
      // 搜索方法
      onSearch() {
        this.fetchTags();
      },
  
      // 请求标签数据，按照搜索关键字
      async fetchTags() {
        //this.loading = true;
        const queryParams = {
          keyword: this.searchQuery,
          page: this.currentPage,
          size: this.pageSize,
        };
        const queryString = new URLSearchParams(queryParams).toString();
        try {
          const response = await fetch(`/api/v1/Tag/search?${queryString}`);
          const data = await response.json();
          if (data.success) {
            this.tags = data.data.data;
            this.totalItems = data.data.total_item;
            this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          } else {
            console.error("Error fetching tags:", data.errorMsg);
          }
        } catch (error) {
          console.error("API 请求失败", error);
        } finally {
          this.loading = false;
        }
      },
  
      // 分页控制
      changePage(page) {
        if (page >= 0 && page < this.totalPages) {
          this.currentPage = page;
          this.fetchTags(); // 每次分页时，根据当前页码重新请求数据
        }
      },
  
      // 检查用户是否已订阅该tag
      isSubscribed(tagId) {
        return this.userSubscriptions.includes(tagId);
      },
  
      // 切换订阅状态
      async toggleSubscription(tagId) {
        if (this.isSubscribed(tagId)) {
          // 取消订阅
          try {
            const response = await fetch(`/api/v1/UserSubTag/${this.userId}/${tagId}`, {
              method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
              // 更新用户订阅列表
              this.userSubscriptions = this.userSubscriptions.filter(id => id !== tagId);
            } else {
              console.error("Error unsubscribing:", data.errorMsg);
            }
          } catch (error) {
            console.error("API 请求失败", error);
          }
        } else {
          // 添加订阅
          try {
            const response = await fetch(`/api/v1/UserSubTag/${this.userId}/${tagId}`, {
              method: 'POST',
            });
            const data = await response.json();
            if (data.success) {
              // 更新用户订阅列表
              this.userSubscriptions.push(tagId);
            } else {
              console.error("Error subscribing:", data.errorMsg);
            }
          } catch (error) {
            console.error("API 请求失败", error);
          }
        }
      },
  
      // 获取用户的订阅列表
      async fetchUserSubscriptions() {
        try {
          const response = await fetch(`/api/v1/UserSubTag/${this.userId}/subscriptions`);
          const data = await response.json();
          if (data.success) {
            this.userSubscriptions = data.data.map(sub => sub.tagId);
          } else {
            console.error("Error fetching user subscriptions:", data.errorMsg);
          }
        } catch (error) {
          console.error("API 请求失败", error);
        }
      },
    },
  
    watch: {
      searchQuery() {
        this.currentPage = 0; // 每次搜索时，重置为第一页
      },
    },
  
    mounted() {
      // 获取用户的订阅列表
      this.fetchUserSubscriptions();
    },
  };
  </script>
  
  <style scoped>
  .search-section {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .search-box {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 120%;
    max-width: 600px;
  }
  
  .search-button {
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 1px; /* 搜索框和按钮之间的间距 */
  }
  
  .search-button:hover {
    background-color: #0056b3;
  }
  
  .tag-results {
    padding-left: 110px;
  }
  
  .tag-list {
    display: flex;
    justify-content: flex-start; /* 左对齐 */
    flex-wrap: wrap; /* 多行显示 */
    gap: 20px; /* 项目之间的间距 */
  }
  
  .tag-summary-block {
    position: relative; /* 为订阅按钮定位 */
    width: 120px;
    height: 50px;
    background-color: #a3d8f4; /* 浅蓝色背景 */
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease; /* 增加平滑过渡 */
  }
  
  .tag-summary-block p {
    margin: 0; /* 清除默认外边距 */
  }
  
  .tag-summary-block:hover {
    transform: scale(1.1); /* 鼠标悬停时放大 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 添加阴影效果 */
  }
  
  .subscribe-button {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 24px;
    height: 24px;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    color: black;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
  }
  
  .pagination button {
    padding: 5px 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .pagination button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  </style>
  