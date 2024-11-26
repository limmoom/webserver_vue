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
                    <label for="tags">节点 (用 '#' 分隔):</label>
                    <input type="text" v-model="tagsInput" placeholder="例如：#旅行#冒险" />
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
import { ref, computed } from 'vue';
import axios from 'axios';
import { useStore } from 'vuex';

export default {
    name: 'DynamicPublish',
    setup() {
        const title = ref('');
        const content = ref('');
        const tagsInput = ref('');
        const store = useStore();
        const currentUser = computed(() => store.getters.currentUser);
        if (!currentUser.value) {
            console.log('当前没有登录用户。');
            // 处理未登录情况
        }
        const userId = currentUser.value ? currentUser.value.id : null;

        const handlePublish = async () => {
            try {
                const dynamicDTO = {
                    title: title.value,
                    content: content.value,
                    userId: userId,
                };

                // 处理标签，将 tagsInput 按 '#' 分割
                const tagsArray = tagsInput.value.split('#').filter(tag => tag.trim() !== '');
                // 构建查询参数
                const queryParams = tagsArray.map(tag => `tags=${encodeURIComponent(tag.trim())}`).join('&');
                // 拼接请求 URL
                const url = `/api/v1/Dynamic?${queryParams}`;
                console.log(url);
                console.log(dynamicDTO);

                const response = await axios.post(url, dynamicDTO);
                console.log(response);

                if (response.data.success) {
                    alert('动态发布成功！');
                    // 清空表单
                    title.value = '';
                    content.value = '';
                    tagsInput.value = '';
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
            tagsInput.value = '';
        };

        return {
            title,
            content,
            tagsInput,
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