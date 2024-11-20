<template>
    <div class="product-detail">
        <div v-if="product" class="product-info">
            <!-- 左侧图片 -->
            <div class="product-image"></div>
            <!-- 右侧标题和价格 -->
            <div class="product-summary">
                <h3>{{ product.title }}</h3>
                <p><strong>价格：</strong>¥{{ product.price }}</p>
            </div>

            <!-- 分割线 -->
            <div class="tableTitle"></div>

            <div class="detail_font"><h4>产品信息</h4></div>

            <!-- 产品基本信息 -->
            <div class="product-details">
                <div class="info-column left-column">
                    <p><strong>出发日期：</strong>{{ product.startDate }}</p>
                    <p><strong>结束日期：</strong>{{ product.endDate }}</p>
                    <p><strong>出发地：</strong>{{ product.departureLocation }}</p>
                    <p><strong>目的地：</strong>{{ product.destination }}</p>
                    <p><strong>最大容量：</strong>{{ product.maxCapacity }}</p>
                </div>
                <div class="info-column right-column">
                    <p><strong>特色：</strong>{{ product.features }}</p>
                    <p><strong>主题：</strong>{{ product.theme }}</p>
                    <p><strong>产品类型：</strong>{{ product.productType }}</p>
                </div>
            </div>
        </div>

        <!-- 分割线 -->
        <div class="tableTitle"></div>

        <!-- 发布者信息部分 -->
        <div v-if="publisher" class="publisher-info">
            <h4>发布者信息</h4>
            <p><strong>用户名：</strong>{{ publisher.name }}</p>
            <p><strong>邮箱：</strong>{{ publisher.email }}</p>
            <p><strong>公司名称：</strong>{{ publisher.companyName }}</p>
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
            publisher: null,  // 新增发布者信息
            errorMessage: null,
        };
    },
    mounted() {
        const productId = this.$route.params.id;
        this.fetchProductDetails(productId);
    },
    methods: {
        async fetchProductDetails(productId) {
            try {
                // 获取产品信息
                const response = await axios.get(`/api/v1/TravelProduct/${productId}`);
                
                if (response.data.success) {
                    this.product = response.data.data;
                    // 获取发布者信息
                    this.fetchPublisherInfo(this.product.userId);
                } else {
                    this.errorMessage = response.data.errorMsg;
                }
            } catch (error) {
                console.error('获取产品信息时出错：', error);
                this.errorMessage = '加载产品信息失败，请稍后重试。';
            }
        },
        
        async fetchPublisherInfo(userId) {
            try {
                const response = await axios.get(`/api/v1/User/${userId}`);
                
                if (response.data.success) {
                    this.publisher = response.data.data;
                } else {
                    console.error('获取发布者信息失败：', response.data.errorMsg);
                }
            } catch (error) {
                console.error('获取发布者信息时出错：', error);
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
    max-width: 800px;
    margin: 20px auto;
    font-family: 'Arial', sans-serif;
}

.product-info {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}

.product-image {
    background: url('https://youimg1.c-ctrip.com/target/0102a120004fhqcagB7E5_D_10000_1200.jpg?proc=autoorient');
    background-size: contain;
    width: 300px;
    height: 200px;
}

.product-summary {
    padding-left: 30px;
    flex: 2;
    min-width: 250px;
}

.product-summary h3 {
    font-size: 20px;
    margin-bottom: 10px;
    color: #333;
}

.product-summary p {
    font-size: 16px;
    color: #007bff;
}

.tableTitle {
    position: relative;
    margin-top: 30px;
    width: 800px;
    height: 1px;
    background-color: #d4d4d4;
    text-align: center;
    font-size: 16px;
    color: rgba(101, 101, 101, 1);
}

.detail_font {
    margin-top: 30px;
    padding-left: 20px;
    font-size: 18px;
}

.product-details {
    display: flex;
    justify-content: space-between;
}

.info-column {
    flex: 1;
    margin-left: 20px;
    margin-right: 20px;
}

.left-column {
    margin-right: 40px; /* 左侧列增加右边距 */
    gap: 10px;
}

.right-column {
    gap: 20px;
}

.info-column p {
    font-size: 16px;
    color: #555;
    margin-bottom: 10px;
}

.info-column strong {
    color: #007bff;
}

/* 发布者信息部分 */
.publisher-info {
    margin-top: 20px;
    padding: 20px;
    border-radius: 8px;
}

.publisher-info h4 {
    font-size: 18px;
    margin-bottom: 10px;
    color: #333;
}

.publisher-info p {
    font-size: 16px;
    color: #555;
}

.publisher-info strong {
    color: #007bff;
}

/* 响应式布局调整 */
@media (max-width: 768px) {
    .product-details {
        flex-direction: column;
    }

    .info-column {
        margin-right: 0;
        margin-bottom: 20px;
    }
}
</style>