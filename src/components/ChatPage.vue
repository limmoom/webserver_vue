<template>
    <div class="chat-container">
        <!-- 左侧联系人列表 -->
        <div class="contact-list">
            <div v-for="contact in contacts" :key="contact.id" class="contact-item"
                :class="{ active: contact.id === activeContactId }" @click="selectContact(contact.id)">
                <div class="contact-name">{{ contact.name }}</div>
                <div class="contact-status">{{ contact.status }}</div>
            </div>
        </div>

        <!-- 右侧聊天界面 -->
        <div class="chat-window">
            <div class="chat-history">
                <div v-for="message in chatHistory" :key="message.id" class="message"
                    :class="{ 'message-sent': message.sender === 'me', 'message-received': message.sender !== 'me' }">
                    <div class="message-content">{{ message.content }}</div>
                </div>
            </div>

            <!-- 消息发送栏 -->
            <div class="message-input">
                <textarea v-model="newMessage" placeholder="请输入消息..." @keyup.enter="sendMessage"></textarea>
                <button @click="sendMessage">发送</button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';

export default {
    props: {
        userId: {
            type: [String, Number],
            required: true,
        },
    },
    data() {
        return {
            contacts: [],
            activeContactId: null,
            newMessage: '',
            chatHistory: [],
            contactName: '',
            websocket: null, // WebSocket 对象
            curUserId: null, // 添加当前用户ID
            wsid: null,
        };
    },
    computed: {
    ...mapGetters(['currentUser', 'getUserById']),
    },
    created() {
        // this.curUserId = localStorage.getItem('UserID');
        this.curUserId = this.currentUser.id;
        this.initializeWebSocket();
        const userId = this.userId;
        console.log('userId chatpage:', userId);
        if (userId) {
            this.activeContactId = userId;
            this.loadChatHistory(userId);
            localStorage.setItem(`lastContactId_${this.curUserId}_${userId}`, userId);
            for (let i = 0; i < localStorage.length; i++) {
                if (userId == localStorage.key(i)) {
                    continue;
                }
                const key = localStorage.key(i);
                if (key.startsWith(`chatHistory_${this.curUserId}_`)) {
                    const contactId = key.replace(`chatHistory_${this.curUserId}_`, '');
                    this.loadChatHistory(contactId);
                }
            }
        } else {
            const lastContactId = localStorage.getItem(`lastContactId_${this.curUserId}`);
            if (lastContactId) {
                this.activeContactId = lastContactId;
            } else {
                this.activeContactId = null;
            }

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(`chatHistory_${this.curUserId}_`)) {
                    const contactId = key.replace(`chatHistory_${this.curUserId}_`, '');
                    this.loadChatHistory(contactId);
                }
            }
        }
    },
    watch: {
        activeContactId: {
            immediate: true,
            handler(newContactId) {
                if (newContactId) {
                    this.loadChatHistory(newContactId);
                    localStorage.setItem(`lastContactId_${this.curUserId}_${newContactId}`, newContactId);
                }
            },
        },
    },
    methods: {
        initializeWebSocket() {
            if (this.curUserId == 29) {
                this.wsid = 111;
            } else {
                this.wsid = 222;
            }
            // const url = `ws://43.143.213.221:8080/websocket/${this.curUserId}`;
            const url = `ws://43.143.213.221:8080/websocket/${this.wsid}`;
            this.websocket = new WebSocket(url);

            this.websocket.onopen = this.handleOpen;
            this.websocket.onmessage = this.handleMessage;
            this.websocket.onclose = this.handleClose;
            this.websocket.onerror = this.handleError;
        },
        handleOpen(event) {
            console.log('WebSocket连接已打开:', event);
        },
        handleMessage(event) {
            console.log('接收到消息:', event.data);
            try {
                const data = JSON.parse(event.data);
                const { contactId, content, sender } = data;
                if (contactId === this.activeContactId) {
                    const message = {
                        id: Date.now(),
                        sender: sender === this.curUserId ? 'me' : 'them',
                        content: content,
                    };
                    this.chatHistory.push(message);
                    this.saveChatHistory();
                    this.scrollToBottom();
                } else {
                    // 如果消息来自其他联系人，存储到本地
                    const contact = this.contacts.find(c => c.id == contactId);
                    if (contact) {
                        const message = {
                            id: Date.now(),
                            sender: sender === this.curUserId ? 'me' : 'them',
                            content: content,
                        };

                        // 获取对应联系人的聊天记录
                        let chatData = localStorage.getItem(`chatHistory_${this.curUserId}_${contactId}`);
                        if (chatData) {
                            chatData = JSON.parse(chatData);
                            chatData.chatHistory.push(message);
                        } else {
                            chatData = {
                                contactName: contact.name || '未知联系人',
                                chatHistory: [message],
                            };
                            // 如果没有聊天记录，确保联系人已在contacts列表中
                            if (!this.contacts.find(c => c.id == contactId)) {
                                this.contacts.push({
                                    id: contactId,
                                    name: contact.name || '未知联系人',
                                });
                            }
                        }

                        // 保存回本地存储
                        localStorage.setItem(`chatHistory_${this.curUserId}_${contactId}`, JSON.stringify(chatData));
                    } else {
                        console.warn(`未找到 contactId: ${contactId} 的联系人`);
                        // 可选：根据需要处理未找到联系人的情况
                        this.fetchAndStoreContact(contactId, content, sender);
                    }
                }
            } catch (error) {
                console.error('解析消息失败:', error);
            }
        },
        async fetchAndStoreContact(contactId, content, sender) {
            try {
                const response = await axios.get(`/api/v1/User/${contactId}`);
                if (response.data.success) {
                    const contactName = response.data.data.name || '未知联系人';
                    const message = {
                        id: Date.now(),
                        sender: sender === this.curUserId ? 'me' : 'them',
                        content: content,
                    };
                    const chatData = {
                        contactName: contactName,
                        chatHistory: [message],
                    };
                    this.contacts.push({
                        id: contactId,
                        name: contactName,
                    });
                    localStorage.setItem(`chatHistory_${this.curUserId}_${contactId}`, JSON.stringify(chatData));
                } else {
                    console.warn('获取用户信息失败：', response.data.errorMsg);
                }
            } catch (error) {
                console.error('获取用户信息失败：', error);
            }
        },
        handleClose(event) {
            console.log('WebSocket连接已关闭:', event);
            // 可选择性重连
        },
        handleError(error) {
            console.error('WebSocket出现错误:', error);
        },
        selectContact(contactId) {
            this.activeContactId = contactId;
        },
        sendMessage() {
            if (!this.newMessage.trim()) return;

            const message = {
                id: Date.now(),
                sender: 'me',
                content: this.newMessage,
            };

            this.chatHistory.push(message);
            this.saveChatHistory();
            this.scrollToBottom();

            // 通过 WebSocket 发送消息
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                if (this.wsid == 111) {
                    var payload = {
                        receiverId: 222,
                        content: this.newMessage,
                        senderId: 111,
                    }
                } else {
                    payload = {
                        receiverId: 111,
                        content: this.newMessage,
                        senderId: 222,
                    }
                }
                console.log('payload:', payload);
                // const payload = {
                //     receiverId: this.activeContactId,
                //     content: this.newMessage,
                //     senderId: this.curUserId,
                // };
                this.websocket.send(JSON.stringify(payload));
            } else {
                console.warn('WebSocket未连接，无法发送消息');
            }

            // 清空输入框
            this.newMessage = '';
        },
        async loadChatHistory(contactId) {
            if (!contactId) return;

            const history = localStorage.getItem(`chatHistory_${this.curUserId}_${contactId}`);
            if (history) {
                const parsedHistory = JSON.parse(history);
                this.chatHistory = Array.isArray(parsedHistory.chatHistory) ? parsedHistory.chatHistory : [];
                this.contactName = parsedHistory.contactName || '未知联系人';

                const existingContact = this.contacts.find(contact => contact.id == contactId);
                if (!existingContact) {
                    const contact = {
                        id: contactId,
                        name: this.contactName || '未知联系人',
                    };
                    this.contacts.push(contact);
                }
            } else {
                const chatData = {
                    contactName: '',
                    chatHistory: [],
                };

                this.chatHistory = [];
                this.contactName = '未知联系人';

                if (!this.contacts.find(contact => contact.id == contactId)) {
                    const contact = {
                        id: contactId,
                        name: this.contactName,
                    };
                    this.contacts.push(contact);
                }

                try {
                    const response = await axios.get(`/api/v1/User/${contactId}`);
                    if (response.data.success) {
                        const contact = this.contacts.find(contact => contact.id == contactId);
                        if (contact) {
                            contact.name = response.data.data.name || '未知联系人';
                            this.contactName = contact.name;
                        }
                        chatData.contactName = this.contactName;
                        localStorage.setItem(`chatHistory_${this.curUserId}_${contactId}`, JSON.stringify(chatData));
                    } else {
                        console.warn('获取用户信息失败：', response.data.errorMsg);
                        localStorage.setItem(`chatHistory_${this.curUserId}_${contactId}`, JSON.stringify(chatData));
                    }
                } catch (error) {
                    console.error('获取用户信息失败：', error);
                    localStorage.setItem(`chatHistory_${this.curUserId}_${contactId}`, JSON.stringify(chatData));
                }
            }

            this.updateContactName(contactId);
            this.scrollToBottom();
        },
        saveChatHistory() {
            const chatData = {
                contactName: this.contactName,
                chatHistory: this.chatHistory,
            };
            localStorage.setItem(`chatHistory_${this.curUserId}_${this.activeContactId}`, JSON.stringify(chatData));
        },
        updateContactName(contactId) {
            const contact = this.contacts.find(contact => contact.id == contactId);
            if (contact) {
                contact.name = this.contactName || '未知联系人';
            }
        },
        scrollToBottom() {
            this.$nextTick(() => {
                const chatHistoryElement = this.$el.querySelector('.chat-history');
                if (chatHistoryElement) {
                    chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
                }
            });
        },
    },
};

</script>

<style scoped>
.chat-container {
    display: flex;
    height: 100%;
}

.contact-list {
    width: 250px;
    border-right: 1px solid #ccc;
    overflow-y: auto;
}

.contact-item {
    padding: 10px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
}

.contact-item.active {
    background-color: #f0f0f0;
}

.contact-name {
    font-weight: bold;
}

.contact-status {
    font-size: 12px;
    color: #888;
}

.chat-window {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.chat-history {
    flex: 1;
    padding: 10px;
    overflow-y: auto;
}

.message {
    margin-bottom: 10px;
}

.message-sent {
    text-align: right;
}

.message-received {
    text-align: left;
}

.message-content {
    display: inline-block;
    padding: 8px 12px;
    border-radius: 15px;
    background-color: #e1f5fe;
    max-width: 70%;
}

.message-sent .message-content {
    background-color: #dcf8c6;
}

.message-input {
    display: flex;
    flex-direction: column;
    padding: 10px;
    border-top: 1px solid #ccc;
}

.message-input textarea {
    flex: 1;
    padding: 8px;
    border: none;
    /* 去掉边框 */
    border-radius: 4px;
    resize: none;
    /* 禁止用户调整大小 */
    margin-bottom: 10px;
    font-family: inherit;
    /* 继承字体 */
    font-size: inherit;
    /* 继承字体大小 */
    line-height: 1.4;
    /* 调整行高 */
    outline: none;
    /* 去掉点击时的黑框 */
}

.message-input button {
    align-self: flex-end;
    /* 按钮位于最下方 */
    padding: 8px 16px;
    border: none;
    background-color: #2196f3;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    outline: none;
    /* 去掉点击时的黑框 */
}

.message-input button:hover {
    background-color: #1976d2;
}
</style>