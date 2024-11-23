<template>
  <div>
    <ul v-if="dynamics.length > 0">
      <li v-for="dynamic in sortedDynamics" :key="dynamic.id">
        <h3>{{ dynamic.title }}</h3>
        <p>{{ dynamic.content }}</p>
        <p><strong>发布时间：</strong>{{ new Date(dynamic.issuedAt).toLocaleString() }}</p>
        <p><strong>Tag: </strong>
          <span>
            {{ dynamic.tags && dynamic.tags.length > 0
              ? dynamic.tags.map(tag => tag.name).join(', ')
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
        <hr />
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
    // 从本地存储中获取当前用户信息
    this.userIdFrom = this.currentUser.id;

    // 获取用户的关注列表和动态内容
    this.fetchSubscriptions()
      .then(() => this.fetchDynamicsForSubscriptions())
      .then(() => this.fetchAllProductNames()) // 在获取动态内容后立即调用，提前加载产品名称
      .catch((error) => {
        console.error("Error fetching subscriptions or dynamics:", error);
      });
  },
  methods: {
    // 获取当前用户的关注列表
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
    // 根据关注列表获取动态
    async fetchDynamicsForSubscriptions() {
      try {
        const allDynamics = [];
        for (const subscription of this.subscriptions) {
          const userIdTo = subscription.userIdTo;
          const response = await axios.get(`/api/v1/User/${userIdTo}/Dynamics`);
          if (response.data.success) {
            // 初始化动态的相关产品名称字段
            const dynamics = response.data.data.data.map((dynamic) => ({
              ...dynamic,
              linkedProductName: null, // 初始化链接产品名称
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
        console.error("Error fetching product names:", error);
      }
    },
    // 跳转到产品详情页
    navigateToProductDetail(productId) {
      this.$router.push(`/product-detail/${productId}`);
    },
  },
};
</script>

<style scoped>
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

hr {
  border: 1px solid #ccc;
}
</style>
