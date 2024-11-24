<template>
    <div style="margin-bottom: 30px;"></div>
    <div class="search-bar">
      <!-- 搜索栏部分 -->
      <div class="search-section">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="搜索tag..."
          class="search-box"
        />
        <button @click="onSearch" class="search-button">搜索</button>
      </div>
  
      <div style="margin-bottom: 30px;"></div>
  
      <!-- 搜索结果部分 -->
      <div class="tag-results">
        <div v-if="loading" class="loading">在搜索框中输入tag，可搜索并订阅标签</div>
        <div v-if="!loading && tags.length === 0" class="no-results">没有找到相关tag</div>
        <div v-if="!loading" class="tag-list">
          <div
            v-for="(tag, index) in tags"
            :key="index"
            class="tag-summary-block"
            @click="goToTagDetail(tag.id)"
          >
            <p>{{ tag.name }}</p>
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
      };
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
  
      // 点击标签跳转到详情页
      goToTagDetail(tagId) {
        // 使用 Vue Router 跳转到详情页，传递标签 ID
        this.$router.push(`/tag-detail/${tagId}`);
      },
    },
  
    watch: {
      // 监听 searchQuery 的变化，自动触发搜索
      searchQuery() {
        this.currentPage = 0; // 每次搜索时，重置为第一页
      },
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
  