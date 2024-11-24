<template>
  <div class="user-profile">
    <h2>个人主页</h2>
    <div class="profile-info">
      <div class="profile-row">
        <p>
          <strong>用户名:</strong> {{ user.username }}
          <button @click="showEditUsername" class="link-button">修改</button>
        </p>
        <p>
          <strong>邮箱:</strong> {{ user.email }}
          <button @click="showEditEmail" class="link-button">修改</button>
        </p>
      </div>
      <div class="profile-row">
        <p>
          <strong>公司:</strong> {{ user.company }}
          <button @click="showEditCompany" class="link-button">修改</button>
        </p>
      </div>
    </div>
    <div class="product-list">
      <h3>发布的旅游产品</h3>
      <div class="product-results">
        <div v-for="product in products" :key="product.id" class="product-summary-block">
          <div @click="goToProductDetail(product.id)">
            <h4>{{ product.title }}</h4>
            <!-- <p><strong>发团时间:</strong> {{ product.startDate }}</p>
            <p><strong>截团时间:</strong> {{ product.endDate }}</p>
            <p><strong>价格:</strong> {{ product.price }}</p>
            <p><strong>出发地:</strong> {{ product.departureLocation }}</p>
            <p><strong>目的地:</strong> {{ product.destination }}</p>
            <p><strong>产品特色:</strong> {{ product.features }}</p>
            <p><strong>产品主题:</strong> {{ product.theme }}</p>
            <p><strong>最大容量:</strong> {{ product.maxCapacity }}</p>
            <p><strong>产品类型:</strong> {{ product.productType }}</p> -->
          </div>
          <div class="button-container">
            <button @click="$emit('edit-product', product.id)" class="link-button">修改产品</button>
            <div class="button-spacer"></div> <!-- 添加空格 -->
            <button @click="deleteProduct(product.id)" class="link-button">删除产品</button>
          </div>
        </div>
      </div>
      <!-- 分页部分 -->
      <div v-if="!loading" class="pagination">
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 0">上一页</button>
        <span>第 {{ currentPage + 1 }} 页，共 {{ totalPages }} 页</span>
        <button @click="changePage(currentPage + 1)" :disabled="currentPage >= totalPages - 1">下一页</button>
      </div>
    </div>

    <!-- 自定义修改用户名界面 -->
    <div v-if="isEditingUsername" class="edit-overlay">
      <div class="edit-container">
        <h3>修改用户名</h3>
        <div class="form-group">
          <label for="currentUsername">当前用户名:</label>
          <input type="text" id="currentUsername" v-model="user.username" disabled />
        </div>
        <div class="form-group">
          <label for="newUsername">新用户名:</label>
          <input type="text" id="newUsername" v-model="newUsername" />
        </div>
        <div class="form-actions">
          <button @click="updateUsername" class="btn btn-primary">确定</button>
          <button @click="cancelEditUsername" class="btn btn-secondary">取消</button>
        </div>
      </div>
    </div>

    <!-- 自定义修改邮箱界面 -->
    <div v-if="isEditingEmail" class="edit-overlay">
      <div class="edit-container">
        <h3>修改邮箱</h3>
        <div class="form-group">
          <label for="currentEmail">当前邮箱:</label>
          <input type="text" id="currentEmail" v-model="user.email" disabled />
        </div>
        <div class="form-group">
          <label for="newEmail">新邮箱:</label>
          <input type="text" id="newEmail" v-model="newEmail" />
        </div>
        <div class="form-actions">
          <button @click="updateEmail" class="btn btn-primary">确定</button>
          <button @click="cancelEditEmail" class="btn btn-secondary">取消</button>
        </div>
      </div>
    </div>

    <!-- 自定义修改公司界面 -->
    <div v-if="isEditingCompany" class="edit-overlay">
      <div class="edit-container">
        <h3>修改公司</h3>
        <div class="form-group">
          <label for="currentCompany">当前公司:</label>
          <input type="text" id="currentCompany" v-model="user.company" disabled />
        </div>
        <div class="form-group">
          <label for="newCompany">新公司:</label>
          <input type="text" id="newCompany" v-model="newCompany" />
        </div>
        <div class="form-actions">
          <button @click="updateCompany" class="btn btn-primary">确定</button>
          <button @click="cancelEditCompany" class="btn btn-secondary">取消</button>
        </div>
      </div>
    </div>

    <div>
      <h2>我的动态</h2>
      <ul v-if="dynamics.length > 0">
        <li v-for="dynamic in sortedDynamics" :key="dynamic.id">
          <h3>{{ dynamic.title }}</h3>
          <p>{{ dynamic.content }}</p>
          <p><strong>发布时间：</strong>{{ new Date(dynamic.issuedAt).toLocaleString() }}</p>
          <p><strong>Tag: </strong>
            <span>
              {{ dynamic.tags && dynamic.tags.length > 0
                ? dynamic.tags.map(tag => `#${tag.name}`).join(', ')
                : '无' }}
            </span>
          </p>
          <p v-if="dynamic.urlId">
            <strong>相关产品: </strong>
            <a
              href="javascript:void(0)"
              @click="navigateToProductDetail(dynamic.urlId)"
            >
              {{ dynamic.linkedProductName || '加载中...' }}
            </a>
          </p>
          <!-- 修改和删除按钮 -->
          <button @click="editDynamic(dynamic.id)" class="btn btn-edit">修改</button>
          <button @click="deleteDynamic(dynamic.id)" class="btn btn-delete">删除</button>
          <hr />
        </li>
      </ul>
      <p v-else>暂无动态</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';

export default {
  name: 'UserProfile',
  data() {
    return {
      user: {
        id: '',
        username: '',
        email: '',
        company: '', // 默认值
      },
      products: [], // 用于存储用户发布的旅游产品信息
      isEditingUsername: false, // 控制修改用户名界面的显示
      newUsername: '', // 存储新的用户名
      isEditingEmail: false, // 控制修改邮箱界面的显示
      newEmail: '', // 存储新的邮箱
      isEditingCompany: false, // 控制修改公司的显示
      newCompany: '', // 存储新的公司名称
      currentPage: 0, // 当前页
      pageSize: 5, // 每页显示的数量
      totalItems: 0, // 总结果数
      totalPages: 0, // 总页数
      loading: false, // 加载状态
      dynamics: [], // 当前用户的动态
    };
  },
  computed: {
    ...mapGetters(['currentUser', 'getUserById']),
    // user() {
    //   return this.currentUser;
    // },
    // 按发布时间从新到旧排序动态
    sortedDynamics() {
      return [...this.dynamics].sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
    },
  },
  created() {
    if (this.currentUser && this.currentUser.id) {
      this.user.id = this.currentUser.id;
      this.fetchUserInfo(this.currentUser.id);
      this.fetchUserProducts(this.currentUser.id); // 获取用户发布的旅游产品信息
    } else {
      console.log('当前没有登录用户。');
    }

    // this.user.id = this.userId;
    // console.log('UserProfile created with userId:', this.userId);
    // if (this.userId) {
    //   this.fetchUserInfo(this.userId);
    //   this.fetchUserProducts(this.userId); // 获取用户发布的旅游产品信息
    // }
    // 获取当前用户的动态
    this.fetchUserDynamics();
  },
  methods: {
    async fetchUserInfo(UserId) {
      const response = await axios.get(`/api/v1/User/${UserId}`);
      console.log(response);
      if (response.data.success) {
        this.user.username = response.data.data.name;
        this.user.email = response.data.data.email;
        this.user.company = response.data.data.companyName;
      } else {
        alert('获取用户信息失败：' + response.data.errorMsg);
      }
    },
    async fetchUserProducts(userId) {
      this.loading = true;
      const queryParams = {
        userId: userId,
        page: this.currentPage,
        size: this.pageSize,
      };
      const queryString = new URLSearchParams(queryParams).toString();
      try {
        const response = await axios.get(`/api/v1/TravelProduct/search?${queryString}`);
        if (response.data.success) {
          this.products = response.data.data.data;
          this.totalItems = response.data.data.total_item;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        } else {
          alert('获取旅游产品信息失败：' + response.data.errorMsg);
        }
      } catch (error) {
        console.error('获取旅游产品信息请求出错：', error);
        alert('获取旅游产品信息时发生错误，请稍后重试。');
      } finally {
        this.loading = false;
      }
    },
    async fetchUserDynamics() {
      try {
        const response = await axios.get(`/api/v1/User/${this.user.id}/Dynamics`);
        if (response.data.success) {
          this.dynamics = response.data.data.data.map((dynamic) => ({
            ...dynamic,
            linkedProductName: null, // 初始化链接产品名称
          }));
          // 获取相关产品名称
          this.fetchAllProductNames();
        } else {
          console.error("获取动态失败：", response.data.errorMsg);
        }
      } catch (error) {
        console.error("获取动态出错：", error);
      }
    },
    // 获取所有相关产品的名称
    async fetchAllProductNames() {
      try {
        const productIds = this.dynamics
          .filter((dynamic) => dynamic.urlId)
          .map((dynamic) => dynamic.urlId);

        // 并行请求所有产品名称
        const requests = productIds.map((id) =>
          axios.get(`/api/v1/TravelProduct/${id}`)
        );
        const responses = await Promise.all(requests);

        // 更新动态的 linkedProductName
        responses.forEach((response, index) => {
          if (response.data.success) {
            const productId = productIds[index];
            const productName = response.data.data.title;
            this.dynamics = this.dynamics.map((dynamic) =>
              dynamic.urlId === productId
                ? { ...dynamic, linkedProductName: productName }
                : dynamic
            );
          }
        });
      } catch (error) {
        console.error("获取产品名称出错：", error);
      }
    },
    // 跳转到产品详情页
    navigateToProductDetail(productId) {
      this.$router.push(`/product-detail/${productId}`);
    },
    // 编辑动态
    editDynamic(dynamicId) {
      // 跳转到动态编辑页面，传递动态ID
      // this.$router.push({ name: 'DynamicEdit', params: { dynamicId: dynamicId } });
      this.$router.push({
        name: 'mainpage',
        query: {
          component: 'DynamicEdit',
          dynamicId: dynamicId
        }
      });
    },
    // 删除动态
    async deleteDynamic(dynamicId) {
      if (confirm('确定要删除这条动态吗？')) {
        try {
          const response = await axios.delete(`/api/v1/Dynamic/${dynamicId}`);
          if (response.data.success) {
            alert('动态删除成功！');
            // 重新获取动态列表
            this.fetchUserDynamics();
          } else {
            alert('删除动态失败：' + response.data.errorMsg);
          }
        } catch (error) {
          console.error('删除动态请求出错：', error);
          alert('删除动态时发生错误，请稍后重试。');
        }
      }
    },
    editProduct(productId) {
      // 切换到产品编辑组件
      this.$router.push({ name: 'ProductEdit', params: { id: productId } });
    },
    async deleteProduct(productId) {
      if (confirm('确定要删除该产品吗？')) {
        try {
          const response = await axios.delete(`/api/v1/TravelProduct/${productId}`);
          if (response.data.success) {
            alert('产品删除成功！');
            // 重新获取用户发布的旅游产品信息
            this.fetchUserProducts(this.user.id);
          } else {
            alert('删除产品失败：' + response.data.errorMsg);
          }
        } catch (error) {
          console.error('删除产品请求出错：', error);
          alert('删除产品时发生错误，请稍后重试。');
        }
      }
    },
    showEditUsername() {
      this.newUsername = this.user.username;
      this.isEditingUsername = true;
    },
    cancelEditUsername() {
      this.isEditingUsername = false;
      this.newUsername = '';
    },
    async updateUsername() {
      if (this.newUsername === this.user.username) {
        alert('新用户名不能与旧用户名相同');
        return;
      }
      if (this.newUsername.trim() === '') {
        alert('用户名不能为空');
        return;
      }
      this.user.username = this.newUsername;
      this.isEditingUsername = false;
      // 这里可以添加更新用户名的 API 调用
      const userDTO = {
        name: this.newUsername,
      };
      try {
        const response = await axios.put(`/api/v1/User/${this.user.id}`, userDTO);
        if (response.data.success) {
          localStorage.setItem('Username', this.newUsername);
          alert('用户名修改成功！');
        } else {
          alert('用户名修改失败：' + response.data.errorMsg);
        }
      } catch (error) {
        console.error('更新用户名请求出错：', error);
        alert('更新用户名时发生错误，请稍后重试。');
      }
    },
    showEditEmail() {
      this.newEmail = this.user.email;
      this.isEditingEmail = true;
    },
    cancelEditEmail() {
      this.isEditingEmail = false;
      this.newEmail = '';
    },
    async updateEmail() {
      if (this.newEmail === this.user.email) {
        alert('新邮箱不能与旧邮箱相同');
        return;
      }
      if (this.newEmail.trim() === '') {
        alert('邮箱不能为空');
        return;
      }
      this.user.email = this.newEmail;
      this.isEditingEmail = false;
      // 这里可以添加更新邮箱的 API 调用
      const userDTO = {
        email: this.newEmail,
      };
      try {
        const response = await axios.put(`/api/v1/User/${this.user.id}`, userDTO);
        if (response.data.success) {
          localStorage.setItem('Email', this.newEmail);
          alert('邮箱修改成功！');
        } else {
          alert('邮箱修改失败：' + response.data.errorMsg);
        }
      } catch (error) {
        console.error('更新邮箱请求出错：', error);
        alert('更新邮箱时发生错误，请稍后重试。');
      }
    },
    showEditCompany() {
      this.newCompany = this.user.company;
      this.isEditingCompany = true;
    },
    cancelEditCompany() {
      this.isEditingCompany = false;
      this.newCompany = '';
    },
    async updateCompany() {
      if (this.newCompany === this.user.company) {
        alert('新公司名称不能与旧公司名称相同');
        return;
      }
      if (this.newCompany.trim() === '') {
        alert('公司名称不能为空');
        return;
      }
      this.user.company = this.newCompany;
      this.isEditingCompany = false;
      // 这里可以添加更新公司名称的 API 调用
      const userDTO = {
        companyName: this.newCompany,
      };
      try {
        const response = await axios.put(`/api/v1/User/${this.user.id}`, userDTO);
        if (response.data.success) {
          localStorage.setItem('companyName', this.newCompany);
          alert('公司名称修改成功！');
        } else {
          alert('公司名称修改失败：' + response.data.errorMsg);
        }
      } catch (error) {
        console.error('更新公司名称请求出错：', error);
        alert('更新公司名称时发生错误，请稍后重试。');
      }
    },
    goToProductDetail(productId) {
      // 使用 Vue Router 跳转到详情页，传递产品 ID
      this.$router.push(`/product-detail/${productId}`);
    },
    changePage(page) {
      if (page >= 0 && page < this.totalPages) {
        this.currentPage = page;
        this.fetchUserProducts(this.user.id); // 每次分页时，根据当前页码重新请求数据
      }
    },
  },
};
</script>

<style scoped>
.user-profile {
  padding-left: 110px;
  padding-right: 110px;
  padding-top: 20px;
}

.link-button {
  background: none;
  border: none;
  color: #007bff;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  font: inherit;
}

.link-button:hover {
  color: #0056b3;
}

.edit-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.edit-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 300px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

.form-actions {
  display: flex;
  justify-content: space-between;
}

.form-actions button {
  padding: 8px 16px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #dc3545;
  color: white;
}

.btn-secondary:hover {
  background-color: #c82333;
}

.product-results {
  display: flex;
  justify-content: flex-start;
  /* 左对齐 */
  flex-wrap: wrap;
  /* 多行显示 */
  gap: 20px;
  /* 项目之间的间距 */
}

.product-summary-block {
  width: 210px;
  height: 240px;
  background-color: #ccc;
  text-align: center;
  line-height: 50px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  /* 增加平滑过渡 */
}

.product-summary-block:hover {
  transform: scale(1.1);
  /* 鼠标悬停时放大 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  /* 添加阴影效果 */
}

.product-actions {
  position: fixed;
  /* 固定位置 */
  bottom: 20px;
  /* 距离底部 20px */
  right: 20px;
  /* 距离右侧 20px */
  display: flex;
  gap: 10px;
  /* 按钮之间的间距 */
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

.profile-info {
  display: flex;
  flex-wrap: wrap;
  /* gap: 5px; */
  margin-bottom: 20px;
  width: 100%;
  /* 确保父容器宽度为100% */
  flex-direction: column;
}

.profile-row {
  display: flex;
  flex: 1 1 45%;
  /* 设置 flex-basis 为 45% */
  max-width: 45%;
  /* 设置最大宽度为 45% */
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.button-spacer {
  width: 10px; /* 根据���要调整空格宽度 */
}

.button-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 可根据需要添加或修改样式 */
h2 {
  margin-bottom: 20px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 20px;
}

button {
  margin-right: 10px;
}

hr {
  border: 1px solid #ccc;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-right: 10px;
}

.btn-edit {
  background-color: #007bff;
  color: #fff;
}

.btn-edit:hover {
  background-color: #0056b3;
}

.btn-delete {
  background-color: #dc3545;
  color: #fff;
}

.btn-delete:hover {
  background-color: #c82333;
}
</style>