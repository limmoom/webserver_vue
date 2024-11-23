<template>
    <div class="register-form">
        <h2>注册</h2>
        <form @submit.prevent="handleRegister">
            <div class="form-group">
                <label for="username">用户名:</label>
                <input type="text" v-model="username" required />
            </div>
            <div class="form-group">
                <label for="email">邮箱:</label>
                <input type="email" v-model="email" required />
            </div>
            <div class="form-group">
                <label for="password">密码:</label>
                <input type="password" v-model="password" required />
            </div>
            <button type="submit">注册</button>
        </form>
    </div>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';
// import router from '@/router';

export default {
    name: 'RegisterForm',
    setup(props, { emit }) {
        const username = ref('');
        const email = ref('');
        const password = ref('');

        const handleRegister = async () => {
            try {
                // 构造请求数据
                const userDTO = {
                    name: username.value,
                    email: email.value,
                    passwd: password.value,
                };
                // 发送 POST 请求到服务器的注册接口
                const response = await axios.post('/api/v1/User/register', userDTO);

                if (response.data.success) {
                    console.log(response.data);

                    // 触发事件通知父组件切换到登录组件
                    emit('switch-to-login');

                } else {
                    // 注册失败，显示错误信息
                    alert('注册失败：' + response.data.message);
                }
            } catch (error) {
                console.error('注册请求出错：', error);
                alert('注册时发生错误，请稍后重试。');
            }

            // emit('switch-to-login');
        };

        return { username, email, password, handleRegister };
    }
};
</script>

<style scoped>
.register-form {
    background-color: #f0f8ff;
    /* 浅蓝色背景 */
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    margin: 0 auto;
    font-family: 'Arial', sans-serif;
    /* 使用无衬线字体 */
}

.register-form h2 {
    color: #333;
    text-align: center;
    font-size: 24px;
    /* 标题字体大小 */
    margin-bottom: 20px;
    /* 标题与表单之间的间距 */
}

.form-group {
    margin-bottom: 20px;
    /* 表单组之间的间距 */
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    /* 标签与输入框之间的间距 */
    color: #333;
    font-weight: bold;
    /* 标签字体加粗 */
}

.form-group input {
    width: 80%;
    padding: 12px;
    /* 输入框内边距 */
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    /* 输入框字体大小 */
}

button {
    width: 86.5%;
    padding: 12px;
    /* 按钮内边距 */
    background-color: #007bff;
    /* 蓝色按钮 */
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    /* 按钮字体大小 */
    font-weight: bold;
    /* 按钮字体加粗 */
    transition: background-color 0.3s ease;
    /* 按钮悬停效果过渡 */
}

button:hover {
    background-color: #0056b3;
    /* 按钮悬停效果 */
}
</style>