<template>
    <div class="login-form">
        <h2>登录</h2>
        <form @submit.prevent="handleLogin">
            <div class="form-group">
                <label for="username">邮箱:</label>
                <input type="text" v-model="username" required />
            </div>
            <div class="form-group">
                <label for="password">密码:</label>
                <input type="password" v-model="password" required />
            </div>
            <button type="submit">登录</button>
        </form>
    </div>
</template>

<script>
import router from '@/router';
import { ref } from 'vue';
import axios from 'axios';
axios.defaults.baseURL = '';

export default {
    name: 'LoginForm',
    setup() {
        const username = ref('');
        const password = ref('');

        const handleLogin = async () => {
            try {
                // 构造请求数据
                const userDTO = {
                    email: username.value,
                    passwd: password.value,
                };

                // 发送 POST 请求到服务器的登录接口
                const response = await axios.post('/api/v1/User/login/ByEmail', userDTO);
                console.log(response);

                if (response.data.success) {
                    // 登录成功，获取返回的令牌或其他信息
                    const UserID = response.data.data.user.id;   
                    const Username = response.data.data.user.name;
                    const Email = response.data.data.user.email;
                    const companyName = response.data.data.user.companyName;

                    // 将令牌保存到本地存储，以备后续请求使用
                    localStorage.setItem('UserID', UserID);
                    localStorage.setItem('Username', Username);
                    localStorage.setItem('Email', Email);
                    localStorage.setItem('companyName', companyName);

                    // 跳转到主页面
                    router.push('/main');
                } else {
                    // 登录失败，显示错误信息
                    alert('登录失败：' + response.data.message);
                }
            } catch (error) {
                console.error('登录请求出错：', error);
                alert('登录时发生错误，请稍后重试。');
            }

            //router.push('/main');
        };

        return { username, password, handleLogin };
    }
};
</script>

<style scoped>
.login-form {
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

.login-form h2 {
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