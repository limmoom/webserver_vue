<template>
  <div class="user-profile">
    <div>
      <button @click="goBack" class="arrow-button">← 返回</button>
    </div>
    <div class="header-row">
      <h2>个人主页</h2>
      <div class="header-buttons">
        <button @click="sendMessage" class="message-button">发消息</button>
        <button 
          @click="toggleSubscription" 
          class="subscribe-button" 
          :class="isSubscribed ? 'subscribed' : 'subscribe'">
          {{ isSubscribed ? '已订阅' : '订阅' }}
        </button>
      </div>
    </div>
    <div class="profile-info">
      <div class="profile-row">
        <p>
          <strong>用户名:</strong> {{ user.username }}
          <!-- <button @click="showEditUsername" class="link-button">修改</button> -->
        </p>
        <p>
          <strong>邮箱:</strong> {{ user.email }}
          <!-- <button @click="showEditEmail" class="link-button">修改</button> -->
        </p>
      </div>
      <div class="profile-row">
        <p>
          <strong>公司:</strong> {{ user.company }}
          <!-- <button @click="showEditCompany" class="link-button">修改</button> -->
        </p>
      </div>
    </div>
    <div class="product-list">
      <h3>发布的旅游产品</h3>
      <div class="product-results">
        <div v-for="product in products" :key="product.id" class="product-summary-block"
          @click="goToProductDetail(product.id)">
          <div>
            <h4>{{ product.title }}</h4>
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
  </div>
</template>

<script>
import axios from 'axios';

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
      userIdFrom: localStorage.getItem('UserID'),
      subscriptions: [], // 用户的关注列表
      isSubscribed: false, // 是否已订阅
      products: [], // 用于存储用户发布的旅游产品信息
      isEditingUsername: false, // 控制修改用户名界面的显示
      newUsername: '', // 存储新的用户名
      isEditingEmail: false, // 控制修改邮箱界面的显示
      newEmail: '', // 存储新的邮箱
      isEditingCompany: false, // 控制修改公司界面的显示
      newCompany: '', // 存储新的公司名称
      currentPage: 0, // 当前页
      pageSize: 12, // 每页显示的数量
      totalItems: 0, // 总结果数
      totalPages: 0, // 总页数
      loading: false, // 加载状态
    };
  },
  created() {
    // 从本地存储中获取用户信息
    const UserId = this.$route.params.id;
    this.user.id = UserId;
    this.fetchUserInfo(UserId);

    if (UserId) {
      this.fetchUserProducts(UserId); // 获取用户发布的旅游产品信息
      this.fetchUserSubscriptions(this.userIdFrom); // 获取本用户的关注列表
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    async fetchUserInfo(UserId) {
      const response = await axios.get(`/api/v1/User/${UserId}`);
      console.log('fetchUserInfoResponse:',response);
      if (response.data.success) {
        this.user.username = response.data.data.name;
        this.user.email = response.data.data.email;
        this.user.company = response.data.data.companyName;

      } else {
        alert('获取用户信息失败：' + response.data.errorMsg);
      }
    },
    async fetchUserSubscriptions(userId) {
      try {
        const response = await axios.get(`/api/v1/UserSubUser/${userId}/subscriptions`);
        if (response.data.success) {
          this.subscriptions = response.data.data; // 存储用户的关注列表
          console.log('fetchUserSubscriptionsResponse:', this.subscriptions);
          this.checkSubscriptionStatus(this.user.id);
        } else {
          alert('获取关注列表失败：' + response.data.errorMsg);
        }
      } catch (error) {
        console.error('获取关注列表请求出错：', error);
        alert('获取关注列表时发生错误，请稍后重试。');
      }
    },
    
    async toggleSubscription() {
      const userIdTo = this.user.id;

      if (this.isSubscribed) {
        // 取消关注
        try {
          const response = await axios.delete(`/api/v1/UserSubUser/${this.userIdFrom}/${userIdTo}`);
          if (response.data.success) {
            this.isSubscribed = false;
            alert('取消关注成功');
          } else {
            alert('取消关注失败：' + response.data.errorMsg);
          }
        } catch (error) {
          console.error('取消关注请求出错：', error);
          alert('取消关注时发生错误，请稍后重试。');
        }
      } else {
        // 订阅
        try {
          const response = await axios.post(`/api/v1/UserSubUser/${this.userIdFrom}/${userIdTo}`);
          if (response.data.success) {
            this.isSubscribed = true;
            alert('订阅成功');
          } else {
            alert('订阅失败：' + response.data.errorMsg);
          }
        } catch (error) {
          console.error('订阅请求出错：', error);
          alert('订阅时发生错误，请稍后重试。');
        }
      }
    },

    // 获取用户的关注状态
    checkSubscriptionStatus(userIdTo) {
      for (let i = 0; i < this.subscriptions.length; i++) {
        console.log('num:', i);
        if (this.subscriptions[i].userIdTo == userIdTo) {
            this.isSubscribed = true; // 找到匹配的订阅，设置为 true
            break; // 找到后可以直接退出循环
        }
      }
      console.log('userIdTo:', userIdTo);
      console.log('subscriptions:', this.subscriptions[0].userIdTo);
      console.log('isSubscribed:', this.isSubscribed);
    },


    async fetchUserProducts(userId) { // 获取用户发布的旅游产品信息
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
    sendMessage() {
      // 这里可以添加发送消息的逻辑
      // alert('发送消息功能尚未实现');
      const userId = this.user.id;
      console.log('userId:', userId);

      this.$router.push({
        name: 'mainpage',
        query: {
          component: 'ChatPage',
          userId: userId
        }
      });
    },
    subscribe() {
      // 这里可以添加订阅的逻辑
      alert('订阅功能尚未实现');
    }
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
  flex: 1 1 50%;
  /* 设置 flex-basis 为 45% */
  max-width: 50%;
  /* 设置最大宽度为 45% */
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.button-spacer {
  width: 10px;
  /* 根据需要调整空格宽度 */
}

.button-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-button {
  background: none;
  border: none;
  color: blue;
  text-decoration: underline;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  margin: 10px 0;
}

.arrow-button:hover {
  color: darkblue;
}

.message-button:hover {
  background-color: #0056b3;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.profile-details {
  flex: 1;
}

.header-buttons {
  display: flex;
  gap: 10px;
  width: 10%;
}

.message-button,
.subscribe-button {
  background-color: #007bff;
  color: black;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
  width: 100px;
  /* 设置按钮宽度 */
  text-align: center;
}

.subscribe-button:hover {
  background-color: #0056b3;
}

.subscribe {
  background-color: #007bff;
  color: black; /* 字体颜色保持为黑色 */
}

.subscribed {
  background-color: gray;
  color: black; /* 字体颜色保持为黑色 */
  border: 1px solid gray;
}
</style>