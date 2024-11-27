<template>
    <div class="dynamic-publish">
        <div class="form-container">
            <h2>发布动态</h2>
            <form @submit.prevent="handlePublish">
                <div class="form-group">
                    <label for="title">标题:</label>
                    <input type="text" v-model="title" required />
                </div>
                <div class="form-group">
                    <label for="content">内容:</label>
                    <textarea rows="5" v-model="content" required></textarea>
                </div>
                <div class="form-group">
                    <label for="tags">节点 (请选择):</label>
                    <select v-model="selectedTag" required>
                        <option value="">请选择节点</option>
                        <option v-for="(tag, index) in tags" :key="index" :value="tag">
                            {{ tag }}
                        </option>
                    </select>
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
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useStore } from 'vuex';

export default {
    name: 'DynamicPublish',
    setup() {
        const title = ref('');
        const content = ref('');
        const selectedTag = ref('');
        const tags = ref([]);
        const store = useStore();
        const currentUser = computed(() => store.getters.currentUser);
        const userId = currentUser.value ? currentUser.value.id : null;

        // 获取节点列表
        const fetchTags = async () => {
            try {
                const response = await axios.get('/api/v1/Tag/list');
                if (response.data.success) {
                    tags.value = response.data.data;
                } else {
                    console.error('获取节点失败:', response.data.errorMsg);
                }
            } catch (error) {
                console.error('请求节点列表时出错:', error);
            }
        };

        // 组件挂载时获取节点列表
        onMounted(() => {
            fetchTags();
        });

        const handlePublish = async () => {
            try {
                // 只传递选中的节点作为数组
                const dynamicDTO = {
                    title: title.value,
                    content: content.value,
                    userId: userId,
                };

                const queryParams = selectedTag.value ? `tags=${encodeURIComponent(selectedTag.value)}` : '';
                const url = `/api/v1/Dynamic?${queryParams}`;
                console.log(url); // 确认提交的 URL 和数据

                const response = await axios.post(url, dynamicDTO);
                if (response.data.success) {
                    alert('动态发布成功！');
                    title.value = '';
                    content.value = '';
                    selectedTag.value = '';
                } else {
                    alert('动态发布失败：' + response.data.errorMsg);
                }
            } catch (error) {
                console.error('动态发布请求出错：', error);
                alert('发布动态时发生错误，请稍后重试。');
            }
        };

        const handleClear = () => {
            title.value = '';
            content.value = '';
            selectedTag.value = '';
        };

        return {
            title,
            content,
            selectedTag,
            tags,
            handlePublish,
            handleClear,
        };
    },
};
</script>

<style scoped>
/* 与 ProductPublish.vue 相同的样式 */
html,
body {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
}

.dynamic-publish {
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
.form-group textarea,
.form-group select {
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
