<template>
    <div class="dynamic-edit">
        <div class="form-container">
            <h2>修改动态</h2>
            <form @submit.prevent="handleUpdate">
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
                    <button type="submit">提交修改</button>
                    <button type="button" @click="$emit('go-back')">放弃修改</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';

export default {
    name: 'DynamicEdit',
    // props: {
    //     dynamicId: {
    //         type: [String, Number],
    //         required: true,
    //     },
    // },
    data() {
        return {
            title: '',
            content: '',
            tagsInput: '',
            userId: null,
            dynamicId: null,
        };
    },
    watch: {
        '$route.query.dynamicId': {
            immediate: true,
            handler(newdynamicId) {
                // console.log('chatpage监听到路由参数 userId 变化：', newUserId);
                this.dynamicId = newdynamicId;
                // this.loadChatHistory(newUserId);
                // this.userId = newUserId;
            }
        },
    },
    computed: {
        ...mapGetters(['currentUser']),
    },
    created() {
        console.log('DynamicEdit created.'+this.dynamicId);
        if (this.currentUser) {
            this.userId = this.currentUser.id;
        }
        this.fetchDynamicDetails();
    },
    methods: {
        // 获取动态详情
        async fetchDynamicDetails() {
            try {
                const response = await axios.get(`/api/v1/Dynamic/${this.dynamicId}`);
                if (response.data.success) {
                    const dynamic = response.data.data;
                    this.title = dynamic.title;
                    this.content = dynamic.content;
                    // 将节点数组转换为字符串
                    this.tagsInput = dynamic.tags && dynamic.tags.length > 0
                        ? dynamic.tags.map(tag => `#${tag.name}`).join('')
                        : '';
                } else {
                    alert('获取动态信息失败：' + response.data.errorMsg);
                }
            } catch (error) {
                console.error('获取动态信息出错：', error);
                alert('获取动态信息时发生错误，请稍后重试。');
            }
        },
        // 提交修改
        async handleUpdate() {
            try {
                const dynamicDTO = {
                    title: this.title,
                    content: this.content,
                    userId: this.userId,
                };

                // 处理节点，将 tagsInput 按 '#' 分割
                const tagsArray = this.tagsInput.split('#').filter(tag => tag.trim() !== '');
                // 构建查询参数
                const queryParams = tagsArray.map(tag => `tags=${encodeURIComponent(tag.trim())}`).join('&');
                // 拼接请求 URL
                const url = `/api/v1/Dynamic/${this.dynamicId}?${queryParams}`;

                const response = await axios.put(url, dynamicDTO);

                if (response.data.success) {
                    alert('动态修改成功！');
                    this.$emit('go-back');
                } else {
                    alert('动态修改失败：' + response.data.errorMsg);
                }
            } catch (error) {
                console.error('动态修改请求出错：', error);
                alert('修改动态时发生错误，请稍后重试。');
            }
        },
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

.dynamic-edit {
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