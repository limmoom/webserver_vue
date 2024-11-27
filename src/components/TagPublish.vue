<template>
    <div class="tag-publish">
      <div class="form-container">
        <h2>发布节点</h2>
        <form @submit.prevent="handlePublish">
          <div class="form-group">
            <label for="name">节点名称:</label>
            <input type="text" v-model="name" required />
          </div>
          <div class="form-group">
            <label for="description">节点描述:</label>
            <textarea rows="5" v-model="description" required></textarea>
          </div>
          <div class="button-group">
            <button type="submit">提交</button>
            <button type="button" @click="handleClear">清空</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { ref,computed } from 'vue';
  import axios from 'axios';
  import { useStore } from 'vuex';
  
  export default {
    name: 'TagPublish',
    setup() {
      const name = ref('');
      const description = ref('');
      const store = useStore();
      const currentUser = computed(() => store.getters.currentUser);
      const userId = currentUser.value ? currentUser.value.id : null;
  
      const handlePublish = async () => {
        try {
          const tagDTO = {
            name: name.value,
            description: description.value,
            userId: userId,
          };
  
          const response = await axios.post('/api/v1/Tag', tagDTO);
          if (response.data.success) {
            alert('节点发布成功！');
            name.value = '';
            description.value = '';
          } else {
            alert('节点发布失败：' + response.data.errorMsg);
          }
        } catch (error) {
          console.error('发布节点时发生错误：', error);
          alert('发布节点时发生错误，请稍后重试。');
        }
      };
  
      const handleClear = () => {
        name.value = '';
        description.value = '';
      };
  
      return {
        name,
        description,
        handlePublish,
        handleClear,
      };
    },
  };
  </script>
  
  <style scoped>
  /* 与 DynamicPublish.vue 相同的样式 */
  html,
  body {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
  }
  
  .tag-publish {
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
    height: 100%;
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
  .form-group textarea {
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
  