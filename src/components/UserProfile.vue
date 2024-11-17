<template>
  <div class="user-profile">
    <h2>个人主页</h2>
    <div class="profile-info">
      <p><strong>用户名:</strong> {{ user.username }}</p>
      <p><strong>邮箱:</strong> {{ user.email }}</p>
      <p><strong>公司:</strong> {{ user.company }}</p>
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
    };
  },
  created() {
    // 从本地存储中获取用户信息
    const UserId = localStorage.getItem('UserId');
    const Username = localStorage.getItem('Username');
    const Email = localStorage.getItem('Email');
    const CompanyName = localStorage.getItem('companyName');

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
          this.products = response.data.data;
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
  },
};
</script>

<style scoped>
.user-profile {
  padding: 20px;
  background-color: #f0f8ff; /* 浅蓝色背景 */
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  margin: 0 auto;
  width: 80%;
  height: auto;
  /* display: flex; */
  overflow: hidden; /* 禁用滚动 */
  font-family: 'Arial', sans-serif; /* 使用无衬线字体 */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-profile h2 {
  color: #333;
  text-align: center;
  font-size: 24px; /* 标题字体大小 */
  margin-bottom: 20px; /* 标题与内容之间的间距 */
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
  position: relative; /* 确保按钮定位正确 */
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

.link-button

.link-button:hover {
  color: #0056b3;
}
</style>