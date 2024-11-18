<template>
  <div class="search-bar">
    <!-- 搜索栏部分 -->
    <div class="search-section">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="搜索产品..."
        class="search-box"
      />
      <button @click="onSearch" class="search-button">搜索</button>
    </div>

    <!-- 筛选条件部分 -->
    <div class="filter-bar">
      <!-- 跟团方式筛选 -->
      <div class="filter-category">
        <span>跟团方式：</span>
        <button
          @click="addFilter('productType', '跟团游')"
          :class="{'selected': selectedFilters.productType === '跟团游'}"
        >
          跟团游
        </button>
        <button
          @click="addFilter('productType', '自由行')"
          :class="{'selected': selectedFilters.productType === '自由行'}"
        >
          自由行
        </button>
        <button
          @click="addFilter('productType', '定制游')"
          :class="{'selected': selectedFilters.productType === '定制游'}"
        >
          定制游
        </button>
      </div>

      <!-- 出发地筛选 -->
      <div class="filter-category">
        <span>出发地：</span>
        <button
          @click="addFilter('departureLocation', '北京')"
          :class="{'selected': selectedFilters.departureLocation === '北京'}"
        >
          北京
        </button>
        <button
          @click="addFilter('departureLocation', '上海')"
          :class="{'selected': selectedFilters.departureLocation === '上海'}"
        >
          上海
        </button>
        <button
          @click="addFilter('departureLocation', '昆明')"
          :class="{'selected': selectedFilters.departureLocation === '昆明'}"
        >
          昆明
        </button>
        <button
          @click="addFilter('departureLocation', '丽江')"
          :class="{'selected': selectedFilters.departureLocation === '丽江'}"
        >
          丽江
        </button>
      </div>

      <!-- 目的地筛选 -->
      <div class="filter-category">
        <span>目的地：</span>
        <button
          @click="addFilter('destination', '北京')"
          :class="{'selected': selectedFilters.destination === '北京'}"
        >
          北京
        </button>
        <button
          @click="addFilter('destination', '上海')"
          :class="{'selected': selectedFilters.destination === '上海'}"
        >
          上海
        </button>
        <button
          @click="addFilter('destination', '昆明')"
          :class="{'selected': selectedFilters.destination === '昆明'}"
        >
          昆明
        </button>
        <button
          @click="addFilter('destination', '丽江')"
          :class="{'selected': selectedFilters.destination === '丽江'}"
        >
          丽江
        </button>
      </div>
    </div>

    <!-- 搜索结果部分 -->
    <div class="product-results">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-if="!loading && products.length === 0" class="no-results">没有找到相关产品</div>
      <div v-if="!loading" class="product-list">
        <div
          v-for="(product, index) in products"
          :key="index"
          class="product-summary-block"
          @click="goToProductDetail(product.id)"
        >
          <p>{{ product.title }}</p>
        </div>
      </div>
      <!-- 分页部分 -->
      <div v-if="!loading" class="pagination">
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 0">上一页</button>
        <span>第 {{ currentPage + 1 }} 页</span>
        <button @click="changePage(currentPage + 1)" >下一页</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SearchBar",
  data() {
    return {
      searchQuery: "",
      selectedFilters: {}, // 当前筛选条件
      products: [], // 搜索结果
      loading: false, // 加载状态
      currentPage: 0, // 当前页
      pageSize: 4, // 每页显示的数量
      totalItems: 20, // 总结果数
    };
  },
  methods: {
    // 搜索方法
    onSearch() {
      this.fetchProducts();
    },
    
    // 处理筛选条件，增加或移除过滤器
    addFilter(key, value) {
      if (this.selectedFilters[key] === value) {
        // 如果条件已经被选中，移除该条件
        delete this.selectedFilters[key];
      } else {
        // 否则，添加该筛选条件
        this.selectedFilters[key] = value;
      }
      this.fetchProducts(); // 更新搜索结果
    },

    // 请求产品数据
    async fetchProducts() {
      this.loading = true;
      const queryParams = {
        ...this.selectedFilters,
        searchQuery: this.searchQuery,
        page: this.currentPage,
        size: this.pageSize,
      };
      const queryString = new URLSearchParams(queryParams).toString();
      try {
        const response = await fetch(`/api/v1/TravelProduct/search?${queryString}`);
        const data = await response.json();
        if (data.success) {
          this.products = data.data;
          this.totalItems = this.products.length;
          //console.log(this.totalItems);
        } else {
          console.error("Error fetching products:", data.errorMsg);
        }
      } catch (error) {
        console.error("API 请求失败", error);
      } finally {
        this.loading = false;
      }
    },

    // 分页控制
    changePage(page) {
      if (page >= 0 ) {
        this.currentPage = page;
        this.fetchProducts();
      }
    },

    // 点击搜索结果跳转到详情页
    goToProductDetail(productId) {
      // 使用 Vue Router 跳转到详情页，传递产品 ID
      this.$router.push(`/product-detail/${productId}`);
    },
  },

  watch: {
    searchQuery() {
      this.fetchProducts();
    },
  },
};
</script>

<style scoped>
.search-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 80%;
  max-width: 400px;
}

.search-button {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.search-button:hover {
  background-color: #0056b3;
}

.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.filter-category {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-category span {
  font-weight: bold;
}

.filter-category button {
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.filter-category button:hover {
  background-color: #0056b3;
}

.filter-category button.selected {
  background-color: #0056b3; /* 选择后变色 */
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.product-summary-block {
  width: 200px;
  height: 50px;
  background-color: #ccc;
  text-align: center;
  line-height: 50px;
  border-radius: 4px;
  cursor: pointer;
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
