<template>
    <div class="product-publish">
        <div class="form-container">
            <h2>修改产品</h2>
            <!-- <button @click="$emit('go-back')" class="link-button">返回</button> -->
            <form @submit.prevent="handlePublish">
                <div class="form-group">
                    <label for="productName">产品标题:</label>
                    <input type="text" v-model="productName" required />
                </div>
                <div class="form-group">
                    <label for="departureTime">发团时间:</label>
                    <date-picker v-model="departureTime" valueType="format"></date-picker>
                </div>
                <div class="form-group">
                    <label for="cutoffTime">截团时间:</label>
                    <date-picker v-model="cutoffTime" valueType="format"></date-picker>
                </div>
                <div class="form-group">
                    <label for="productFeatures">产品特色:</label>
                    <textarea rows="5" v-model="productFeatures" required></textarea>
                </div>
                <div class="form-group">
                    <label for="productTheme">产品主题:</label>
                    <input type="text" v-model="productTheme" required />
                </div>
                <div class="form-group">
                    <label for="departureLocation">出发地:</label>
                    <input type="text" v-model="departureLocation" required />
                </div>
                <div class="form-group">
                    <label for="destination">目的地:</label>
                    <input type="text" v-model="destination" required />
                </div>
                <div class="form-group">
                    <label for="maxCapacity">最大容纳人数:</label>
                    <input type="number" v-model="maxCapacity" required />
                </div>
                <div class="form-group">
                    <label for="productType">产品类型:</label>
                    <select v-model="productType" required>
                        <option value="跟团游">跟团游</option>
                        <option value="自由行">自由行</option>
                        <option value="定制游">定制游</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="price">产品价格:</label>
                    <input type="number" v-model="price" required />
                </div>
                <!-- 新增图片 URL 输入框 -->
                <div class="form-group">
                    <label for="imageUrl">产品图片 URL:</label>
                    <input type="url" v-model="imageUrl" placeholder="请输入图片的 URL 地址" required />
                </div>
                <div class="button-group">
                    <button type="submit">提交修改</button>
                    <button type="button" @click="$emit('go-back')">放弃修改</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import DatePicker from 'vue3-datepicker'; // 确认使用的日期选择器包

export default {
    name: 'ProductUpdate',
    components: {
        DatePicker
    },
    props: {
        productId: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            productName: '',
            departureTime: null,
            cutoffTime: null,
            productFeatures: '',
            productTheme: '',
            departureLocation: '',
            destination: '',
            maxCapacity: '0',
            productType: '跟团游',
            price: '0',
            imageUrl: '',
        };
    },
    created() {
        this.fetchProductDetails();
    },
    methods: {
        async fetchProductDetails() {
            // 使用 productId 获取产品详细信息
            try {
                const productId = localStorage.getItem('editted_ProductId');
                const response = await axios.get(`/api/v1/TravelProduct/${productId}`);
                if (response.data.success) {
                    const product = response.data.data;
                    this.productName = product.title;
                    this.departureTime = new Date(product.startDate); // 转换为 Date 对象
                    this.cutoffTime = new Date(product.endDate); // 转换为 Date 对象
                    this.productFeatures = product.features;
                    this.productTheme = product.theme;
                    this.departureLocation = product.departureLocation;
                    this.destination = product.destination;
                    this.maxCapacity = product.maxCapacity;
                    this.productType = product.productType;
                    this.price = product.price;
                    this.imageUrl = product.imageUrl;
                } else {
                    alert('获取产品信息失败：' + response.data.errorMsg);
                }
            } catch (error) {
                console.error('获取产品信息请求出错：', error);
                alert('获取产品信息时发生错误，请稍后重试。');
            }
        },
        async handlePublish() {
            try {
                // 构造请求数据
                const productDTO = {
                    // userID:
                    title: this.productName,
                    startDate: this.departureTime,
                    endDate: this.cutoffTime,
                    features: this.productFeatures,
                    theme: this.productTheme,
                    departureLocation: this.departureLocation,
                    destination: this.destination,
                    maxCapacity: this.maxCapacity,
                    productType: this.productType,
                    price: this.price,
                    imageUrl: this.imageUrl,
                };

                // 发送 POST 请求到服务器的产品发布接口
                const productId = localStorage.getItem('editted_ProductId');
                const response = await axios.put(`/api/v1/TravelProduct/${productId}`, productDTO);

                if (response.data.success) {
                    alert('产品修改成功！');
                    // 清空表单
                    this.productName = '';
                    this.departureTime = '';
                    this.cutoffTime = '';
                    this.productFeatures = '';
                    this.productTheme = '';
                    this.departureLocation = '';
                    this.destination = '';
                    this.maxCapacity = '';
                    this.productType = '';
                    this.price = '';
                    this.imageUrl = ''; // 清空图片 URL
                    this.$emit('go-back');
                } else {
                    alert('产品修改失败：' + response.data.errorMsg);
                }
            } catch (error) {
                console.error('产品修改请求出错：', error);
                alert('产品修改时发生错误，请稍后重试。');
            }
        },

    },
};
</script>

<style scoped>
html,
body {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
}

.product-publish {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    background-color: #f8f9fa;
}

.form-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-color: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    /* max-width: 500px; */
    box-sizing: border-box;
}

.form-container h2 {
    color: #333;
    text-align: center;
    font-size: 24px;
    margin-bottom: 20px;
}


.form-group {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
}

.form-group label {
    margin-right: 10px;
    color: #333;
    font-weight: bold;
    width: 120px;
    text-align: right;
}

.form-group input,
.form-group textarea,
.form-group select,
.form-group date-picker {
    flex: 1;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    max-width: 40%;
    width: 100%;
    box-sizing: border-box;
}

.form-group textarea {
    height: 100px;
}

.button-group {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
}

.button-group button {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    transition: background-color 0.3s ease;
    margin-right: 10px;
}

.button-group button:last-child {
    margin-right: 0;
}

.button-group button[type="submit"] {
    background-color: #007bff;
    color: white;
}

.button-group button[type="button"] {
    background-color: #dc3545;
    color: white;
}

.button-group button:hover {
    opacity: 0.8;
}
</style>