<template>
    <div class="product-detail">
        <h2>产品详情</h2>
        <div v-if="product" class="product-info">
            <p><strong>标题：</strong>{{ product.title }}</p>
            <p><strong>出发日期：</strong>{{ product.startDate }}</p>
            <p><strong>结束日期：</strong>{{ product.endDate }}</p>
            <p><strong>特色：</strong>{{ product.features }}</p>
            <p><strong>主题：</strong>{{ product.theme }}</p>
            <p><strong>出发地点：</strong>{{ product.departureLocation }}</p>
            <p><strong>目的地：</strong>{{ product.destination }}</p>
            <p><strong>最大容量：</strong>{{ product.maxCapacity }}</p>
            <p><strong>产品类型：</strong>{{ product.productType }}</p>
            <p><strong>价格：</strong>¥{{ product.price }}</p>
            <p><strong>创建时间：</strong>{{ product.createdAt }}</p>
            <p><strong>更新时间：</strong>{{ product.updatedAt }}</p>
        </div>
        <div v-else>
            <p>加载产品信息中...</p>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'ProductDetail',
    data() {
        return {
            product: null,
            errorMessage: null,
        };
    },
    mounted() {
        this.fetchProductDetails(1); // 假设产品ID为1
    },
    methods: {
        async fetchProductDetails(productId) {
            try {
                // 发送 GET 请求获取产品信息
                const response = await axios.get(`/api/v1/TravelProduct/${productId}`);
                
                if (response.data.success) {
                    this.product = response.data.data; // 获取返回的产品数据
                } else {
                    this.errorMessage = response.data.errorMsg; // 获取错误信息
                }
            } catch (error) {
                console.error('获取产品信息时出错：', error);
                this.errorMessage = '加载产品信息失败，请稍后重试。';
            }
        }
    }
};
</script>

<style scoped>
.product-detail {
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    max-width: 600px;
    margin: 20px auto;
    font-family: 'Arial', sans-serif;
}

.product-detail h2 {
    text-align: center;
    font-size: 24px;
    margin-bottom: 20px;
    color: #333;
}

.product-info p {
    font-size: 16px;
    line-height: 1.5;
    margin: 10px 0;
}

.product-info strong {
    color: #007bff;
    font-weight: bold;
}

.product-info {
    background-color: #ffffff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.product-info p {
    color: #555;
}

</style>
