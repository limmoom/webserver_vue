<template>
  <div>
    <ul v-if="dynamics.length > 0">
      <li v-for="dynamic in sortedDynamics" :key="dynamic.id" class="dynamic-card">
        <!-- 动态标题，添加鼠标悬浮样式和点击跳转 -->
        <h3
          class="dynamic-title"
          @click="goToDynamicDetail(dynamic.id)"
        >
          {{ dynamic.title }}
        </h3>
        <p>{{ dynamic.content }}</p>
        <p><strong>发布者：</strong>{{ dynamic.publisherName || '加载中...' }}</p>
        <p><strong>发布时间：</strong>{{ new Date(dynamic.issuedAt).toLocaleString() }}</p>
        <p><strong>节点: </strong>
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
            {{'点此查看详情' }}
          </a>
        </p>
      </li>
    </ul>
    <p v-else>暂无关注用户的动态</p>
  </div>
</template>

<script>
import axios from "axios";
import { mapGetters } from "vuex";

export default {
  name: "UserSubscribe",
  data() {
    return {
      userIdFrom: "", // 当前用户的ID
      subscriptions: [], // 用户的关注列表
      dynamics: [], // 所有关注用户的动态
    };
  },
  computed: {
    ...mapGetters(["currentUser", "getUserById"]),
    // 按发布时间从新到旧排序动态
    sortedDynamics() {
      return [...this.dynamics].sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
    },
  },
  created() {
    this.userIdFrom = this.currentUser.id;

    this.fetchSubscriptions()
      .then(() => this.fetchDynamicsForSubscriptions())
      .then(() => {
        this.fetchAllProductNames();
        this.fetchPublisherNames();
      })
      .catch((error) => {
        console.error("Error fetching subscriptions or dynamics:", error);
      });
  },
  methods: {
    async fetchSubscriptions() {
      try {
        const response = await axios.get(`/api/v1/UserSubUser/${this.userIdFrom}/subscriptions`);
        if (response.data.success) {
          this.subscriptions = response.data.data;
        } else {
          console.error("Error fetching subscriptions:", response.data.errorMsg);
        }
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      }
    },
    async fetchDynamicsForSubscriptions() {
      try {
        const allDynamics = [];
        for (const subscription of this.subscriptions) {
          const userIdTo = subscription.userIdTo;
          const response = await axios.get(`/api/v1/User/${userIdTo}/Dynamics`);
          if (response.data.success) {
            const dynamics = response.data.data.data.map((dynamic) => ({
              ...dynamic,
              linkedProductName: null,
              publisherName: null,
            }));
            allDynamics.push(...dynamics);
          } else {
            console.error(`Error fetching dynamics for user ${userIdTo}:`, response.data.errorMsg);
          }
        }
        this.dynamics = allDynamics;
      } catch (error) {
        console.error("Error fetching dynamics:", error);
      }
    },
    async fetchAllProductNames() {
      try {
        const productIds = this.dynamics
          .filter((dynamic) => dynamic.urlId)
          .map((dynamic) => dynamic.urlId);

        const requests = productIds.map((id) =>
          axios.get(`/api/v1/TravelProduct/${id}`)
        );
        const responses = await Promise.all(requests);

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
        console.error("Error fetching product names:", error);
      }
    },
    async fetchPublisherNames() {
      try {
        const userIds = [...new Set(this.dynamics.map((dynamic) => dynamic.userId))];

        const requests = userIds.map((id) => axios.get(`/api/v1/User/${id}`));
        const responses = await Promise.all(requests);

        responses.forEach((response, index) => {
          if (response.data.success) {
            const userId = userIds[index];
            const userName = response.data.data.name;
            this.dynamics = this.dynamics.map((dynamic) =>
              dynamic.userId === userId
                ? { ...dynamic, publisherName: userName }
                : dynamic
            );
          }
        });
      } catch (error) {
        console.error("Error fetching publisher names:", error);
      }
    },
    navigateToProductDetail(productId) {
      this.$router.push(`/product-detail/${productId}`);
    },
    goToDynamicDetail(dynamicId) {
      // 使用 Vue Router 跳转到动态详情页，传递动态 ID
      this.$router.push(`/dynamic-detail/${dynamicId}`);
    },
  },
};
</script>

<style scoped>
/* 样式调整 */
ul {
  list-style: none;
  padding: 0;
}

li {
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 15px;
  width: 760px;
  margin-bottom: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.dynamic-card h3 {
  margin-bottom: 10px;
  cursor: pointer;
  color: #333;
  transition: color 0.3s ease, text-decoration 0.3s ease;
}

.dynamic-card h3:hover {
  color: #007bff;
  text-decoration: underline;
}

.dynamic-card p {
  margin: 5px 0;
}
</style>
