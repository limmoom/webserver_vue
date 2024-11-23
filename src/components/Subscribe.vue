<template>
  <div class="subscribe-page">
    <header class="selection-bar">
      <div
        class="selection-option"
        :class="{ active: currentComponent === 'UserSubscribe' }"
        @click.prevent="currentComponent = 'UserSubscribe'"
      >
        用户动态
      </div>
      <div
        class="selection-option"
        :class="{ active: currentComponent === 'TagSubscribe' }"
        @click.prevent="currentComponent = 'TagSubscribe'"
      >
        节点动态
      </div>
    </header>

    <div class="content-container">
      <component :is="currentComponent" />
    </div>
  </div>
</template>

<script>
import UserSubscribe from './UserSubscribe.vue';
import TagSubscribe from './TagSubscribe.vue';

export default {
  name: 'SubscribePage',
  components: {
    UserSubscribe,
    TagSubscribe
  },
  data() {
    return {
      currentComponent: 'UserSubscribe', // 默认加载 UserSubscribe
    };
  },
};
</script>

<style scoped>
.subscribe-page {
  display: flex;
  flex-direction: column;
  width: 800px;
  height: 100vh;
  margin: 0 auto;
}

.selection-bar {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  background-color: #007bff; /* 蓝色背景 */
  color: white;
  height: 50px;
  width: 800px;
  margin: 0 auto;
}

.selection-option {
  cursor: pointer;
  padding: 10px 20px;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.selection-option:hover {
  background-color: #0056b3;
}

.selection-option.active {
  background-color: #0056b3; /* 高亮当前选中的按钮 */
}

.content-container {
  flex: 1;
  padding: 20px;
  overflow: auto;
}
</style>
