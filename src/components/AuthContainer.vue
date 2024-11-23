<template>
  <div class="page-container">
    <div class="auth-container">
      <button @click="toggleAuth" class="toggle-button">
        {{ isLogin ? '没有帐户? 去注册' : '已有帐户? 去登录' }}
      </button>
      <LoginForm v-if="isLogin" />
      <RegisterForm v-else @switch-to-login="switchToLogin" />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import LoginForm from './LoginForm.vue';
import RegisterForm from './RegisterForm.vue';

export default {
  name: 'AuthContainer',
  components: { LoginForm, RegisterForm },
  setup() {
    const isLogin = ref(true);

    const toggleAuth = () => {
      isLogin.value = !isLogin.value;
    };

    const switchToLogin = () => {
      isLogin.value = true;
    };

    return { isLogin, toggleAuth, switchToLogin };
  }
};
</script>

<style scoped>
.page-container {
  height: 100vh; /* 占满整个视口高度 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-container {
  background-color: #f0f8ff; /* 浅蓝色背景 */
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  text-align: center;
  font-family: 'Arial', sans-serif; /* 使用无衬线字体 */
}

.toggle-button {
  margin-bottom: 20px;
  padding: 8px 16px; /* 调整按钮内边距 */
  background-color: #007bff; /* 蓝色按钮 */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px; /* 调整按钮字体大小 */
  transition: background-color 0.3s ease; /* 按钮悬停效果过渡 */
}

.toggle-button:hover {
  background-color: #0056b3; /* 按钮悬停效果 */
}
</style>