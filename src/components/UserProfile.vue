<template>
  <div class="user-profile">
    <h2>个人主页</h2>
    <div class="profile-info">
      <p>
        <strong>用户名:</strong> {{ user.username }}
        <button @click="showEditUsername" class="link-button">修改</button>
      </p>
      <p>
        <strong>邮箱:</strong> {{ user.email }}
        <button @click="showEditEmail" class="link-button">修改</button>
      </p>
      <p>
        <strong>公司:</strong> {{ user.company }}
        <button @click="showEditCompany" class="link-button">修改</button>
      </p>
    </div>
    <div class="product-list">
      <h3>发布的旅游产品</h3>
      <ul>
        <li v-for="product in products" :key="product.id" class="product-item">
          <div class="product-header">
            <h4>{{ product.title }}</h4>
            <div class="product-actions">
              <button @click="$emit('edit-product', product.id)" class="link-button">修改产品</button>
              <button @click="deleteProduct(product.id)" class="link-button">删除产品</button>
            </div>
          </div>
          <p><strong>发团时间:</strong> {{ product.startDate }}</p>
          <p><strong>截团时间:</strong> {{ product.endDate }}</p>
          <p><strong>价格:</strong> {{ product.price }}</p>
          <p><strong>出发地:</strong> {{ product.departureLocation }}</p>
          <p><strong>目的地:</strong> {{ product.destination }}</p>
          <p><strong>产品特色:</strong> {{ product.features }}</p>
          <p><strong>产品主题:</strong> {{ product.theme }}</p>
          <p><strong>最大容量:</strong> {{ product.maxCapacity }}</p>
          <p><strong>产品类型:</strong> {{ product.productType }}</p>
        </li>
      </ul>
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
          <button @click="updateEmail" class="btn btn-primary">确定</button>
          <button @click="cancelEditEmail" class="btn btn-secondary">取消</button>
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
      products: [], // 用于存储用户发布的旅游产品信息
      isEditingUsername: false, // 控制修改用户名界面的显示
      newUsername: '', // 存储新的用户名
      isEditingEmail: false, // 控制修改邮箱界面的显示
      newEmail: '', // 存储新的邮箱
      isEditingCompany: false, // 控制修改公司界面的显示
      newCompany: '', // 存储新的公司名称
    };
  },
  created() {
    // 从本地存储中获取用户信息
    const UserId = localStorage.getItem('UserID');
    const Username = localStorage.getItem('Username');
    const Email = localStorage.getItem('Email');
    const CompanyName = localStorage.getItem('companyName');
    console.log('UserID:', UserId);

    if (UserId) {
      this.user.id = UserId;
      this.user.username = Username;
      this.user.email = Email;
      this.user.company = CompanyName ? CompanyName : 'unknown';
      this.fetchUserProducts(UserId); // 获取用户发布的旅游产品信息
    }
  },
  methods: {
    async fetchUserProducts(userId) {
      try {
        const response = await axios.get('/api/v1/TravelProduct/search', {
          params: {
            userId: userId,
          },
        });
        if (response.data.success) {
          this.products = response.data.data.data;
        } else {
          alert('获取旅游产品信息失败：' + response.data.errorMsg);
        }
      } catch (error) {
        console.error('获取旅游产品信息请求出错：', error);
        alert('获取旅游产品信息时发生错误，请稍后重试。');
      }
    },
    // editProduct(productId) {
    //   // 切换到产品编辑组件
    //   this.$router.push({ name: 'ProductEdit', params: { id: productId } });
    // },

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
          alert('公司名称修改成功！');
        } else {
          alert('公司名称修改失败：' + response.data.errorMsg);
        }
      } catch (error) {
        console.error('更新公司名称请求出错：', error);
        alert('更新公司名称时发生错误，请稍后重试。');
      }
    },
  },
};
</script>

<style scoped>
.user-profile {
  padding: 20px;
  background-color: #f0f8ff;
  /* 浅蓝色背景 */
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  margin: 0 auto;
  width: 80%;
  height: auto;
  /* display: flex; */
  overflow: hidden;
  /* 禁用滚动 */
  font-family: 'Arial', sans-serif;
  /* 使用无衬线字体 */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-profile h2 {
  color: #333;
  text-align: center;
  font-size: 24px;
  /* 标题字体大小 */
  margin-bottom: 20px;
  /* 标题与内容之间的间距 */
}

.profile-info {
  display: flex;
  justify-content: space-between;
  width: 70%;
}

.profile-info p {
  margin: 10px 0;
  font-size: 16px;
  text-align: left;
}

.profile-info strong {
  color: #333;
}

.product-list {
  margin-top: 20px;
  width: 60%;
  /* display: flex; */
  align-items: center;
  flex-direction: column;
}

.product-list h3 {
  color: #333;
  font-size: 20px;
  margin-bottom: 10px;
  /* align-items: center; */
}

.product-list ul {
  list-style: none;
  padding: 0;
}

.product-list li {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  text-align: left;
  position: relative;
  /* 确保按钮定位正确 */
}

.product-list h4 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.product-list p {
  margin: 5px 0;
  font-size: 14px;
}

.product-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 10px;
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

.link-button .link-button:hover {
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

/* .btn-primary:hover {
  background-color: #0056b3;
} */

.btn-secondary {
  background-color: #dc3545;
  color: white;
}

/* .btn-secondary:hover {
  background-color: #5a6268;
} */

.form-actions button:hover {
  filter: brightness(0.8);
}
</style>