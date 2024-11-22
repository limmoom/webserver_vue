<template>
    <div class="product-publish">
        <div class="form-container">
            <h2>发布产品</h2>
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
                <div class="button-group">
                    <button type="submit">提交</button>
                    <button type="button" @click="handleDelete">清空</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import DatePicker from 'vue3-datepicker'; // 确认使用的日期选择器包

export default {
    name: 'ProductPublish',
    components: {
        DatePicker
    },

    data() {
        return {
            productName: '',
            departureTime: new Date(),
            cutoffTime: new Date(),
            productFeatures: '',
            productTheme: '',
            departureLocation: '',
            destination: '',
            maxCapacity: '0',
            productType: '跟团游',
            price: '0',
            userId: '' // 从路由参数中获取用户ID
        };
    },
    created(){
        this.userId = this.$route.query.userID;
    },
    methods: {
        async handlePublish() {
            try {
                // 构造请求数据
                const productDTO = {
                    userId: this.userId,
                    title: this.productName,
                    startDate: this.departureTime.toISOString().substring(0, 10),
                    endDate: this.cutoffTime.toISOString().substring(0, 10),
                    features: this.productFeatures,
                    theme: this.productTheme,
                    departureLocation: this.departureLocation,
                    destination: this.destination,
                    maxCapacity: this.maxCapacity,
                    productType: this.productType,
                    price: this.price
                };

                console.log("product publish object", productDTO);

                // 发送 POST 请求到服务器的产品发布接口
                const response = await axios.post('/api/v1/TravelProduct', productDTO);
                console.log(response);

                if (response.data.success) {
                    alert('产品发布成功！');
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
                } else {
                    alert('产品发布失败：' + response.data.errorMsg);
                }
            } catch (error) {
                console.error('产品发布请求出错：', error);
                alert('产品发布时发生错误，请稍后重试。');
            }
        },
        handleDelete() {
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
        }
    }
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