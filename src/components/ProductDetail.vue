<template>    
    <div class="product-detail">
        <div>
            <button @click="goBack" class="arrow-button">← 返回</button>
        </div>
        <div v-if="product" class="product-info">
            <!-- 左侧图片 -->
            <div class="product-image"></div>
            <!-- 右侧标题和价格 -->
            <div class="product-summary">
                <h3>{{ product.title }}</h3>
                <p><strong>价格：</strong>¥{{ product.price }}</p>
            </div>

            <!-- 分割线 -->
            <div class="tableTitle"></div>

            <div class="detail_font">
                <h4>产品信息</h4>
            </div>

            <!-- 产品基本信息 -->
            <div class="product-details">
                <div class="info-column left-column">
                    <p><strong>出发日期：</strong>{{ product.startDate }}</p>
                    <p><strong>结束日期：</strong>{{ product.endDate }}</p>
                    <p><strong>出发地：</strong>{{ product.departureLocation }}</p>
                    <p><strong>目的地：</strong>{{ product.destination }}</p>
                    <p><strong>最大容量：</strong>{{ product.maxCapacity }}</p>
                </div>
                <div class="info-column right-column">
                    <p><strong>特色：</strong>{{ product.features }}</p>
                    <p><strong>主题：</strong>{{ product.theme }}</p>
                    <p><strong>产品类型：</strong>{{ product.productType }}</p>
                </div>
            </div>
        </div>

        <!-- 分割线 -->
        <div class="tableTitle"></div>

        <!-- 发布者信息部分 -->
        <div v-if="publisher" class="publisher-info">
            <h4>发布者信息</h4>
            <p><strong>用户名：</strong>
                <router-link :to="{ name: 'OtherProfile', params: { id: publisher.id } }">
                    {{ publisher.name }}
                </router-link>
            </p>
            <p><strong>邮箱：</strong>{{ publisher.email }}</p>
            <p><strong>公司名称：</strong>{{ publisher.companyName }}</p>
        </div>

        <div v-else>
            <p>加载产品信息中...</p>
        </div>

        <div class="tableTitle"></div>

        <!-- 评论区 -->
        <div class="comments-section">
            <h4>评论区</h4>

            <!-- 输入评论的文本框和按钮 -->
            <div class="comment-input">
                <textarea v-model="newComment" placeholder="请输入评论内容" rows="4"></textarea>
                <button @click="submitComment" :disabled="!newComment.trim()">发送评论</button>
            </div>

            <!-- 评论列表 -->
            <div class="comments-list">
                <div v-if="comments.length === 0" class="no-comments">暂无评论</div>
                
                <div v-for="comment in comments" :key="comment.id" class="comment-item">
                    <p class="comment-author">
                        <router-link :to="{ name: 'OtherProfile', params: { id: comment.userId } }">
                            {{ comment.userName }}
                        </router-link>
                        <span class="comment-time">{{ formatDate(comment.issuedAt) }}</span>
                        <button v-if="!replyingToComment" @click="startReply(comment)">回复</button>
                    </p>
                    <p class="comment-content">{{ comment.content }}</p>

                    <!-- 二级评论 -->
                    <div v-if="comment.replies && comment.replies.length > 0">
                        <div v-for="reply in comment.replies" :key="reply.id" class="comment-item reply">
                            <p class="comment-author">
                                <router-link :to="{ name: 'OtherProfile', params: { id: reply.userId } }">
                                    {{ reply.userName }}
                                </router-link>
                                <span class="comment-time">{{ formatDate(reply.issuedAt) }}</span>
                            </p>
                            <p class="comment-content">{{ reply.content }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        

    </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ProductDetail',
  data() {
    return {
      product: null,
      publisher: null,
      errorMessage: null,
      comments: [],
      newComment: "",  // 用户输入的新评论内容
      replyingToComment: null,  // 当前回复的评论
    };
  },
  mounted() {
    const productId = this.$route.params.id;
    this.fetchProductDetails(productId);
    this.fetchComments(productId);
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    async fetchProductDetails(productId) {
      try {
        const response = await axios.get(`/api/v1/TravelProduct/${productId}`);
        if (response.data.success) {
          this.product = response.data.data;
          this.fetchPublisherInfo(this.product.userId);
        } else {
          this.errorMessage = response.data.errorMsg;
        }
      } catch (error) {
        console.error('获取产品信息时出错：', error);
        this.errorMessage = '加载产品信息失败，请稍后重试。';
      }
    },

    async fetchPublisherInfo(userId) {
      try {
        const response = await axios.get(`/api/v1/User/${userId}`);
        if (response.data.success) {
          this.publisher = response.data.data;
        } else {
          console.error('获取发布者信息失败：', response.data.errorMsg);
        }
      } catch (error) {
        console.error('获取发布者信息时出错：', error);
      }
    },

    async fetchComments(productId) {
      try {
        const response = await axios.get(`/api/v1/TravelProduct/${productId}/Comments`);
        if (response.data.success) {
          this.comments = response.data.data;

          // 对评论按发布时间排序（从新到旧）
          this.comments.sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));

          // 获取每个评论的发布者信息，并排序二级评论
          for (let comment of this.comments) {
            this.fetchCommentPublisherInfo(comment.userId, comment);
            if (comment.replies) {
              // 对每个一级评论的二级评论按发布时间排序
              comment.replies.sort((a, b) => new Date(a.issuedAt) - new Date(b.issuedAt));
              for (let reply of comment.replies) {
                this.fetchCommentPublisherInfo(reply.userId, reply);
              }
            }
          }
        } else {
          console.error('获取评论数据失败：', response.data.errorMsg);
        }
      } catch (error) {
        console.error('获取评论数据时出错：', error);
      }
    },

    async fetchCommentPublisherInfo(userId, comment) {
      try {
        const response = await axios.get(`/api/v1/User/${userId}`);
        if (response.data.success) {
          comment.userName = response.data.data.name;
        } else {
          console.error('获取评论者信息失败：', response.data.errorMsg);
        }
      } catch (error) {
        console.error('获取评论者信息时出错：', error);
      }
    },

    startReply(comment) {
      this.replyingToComment = comment;
      this.newComment = `@ ${comment.userName}：`;  // 显示@用户名
    },

    async submitComment() {
      if (this.newComment.trim()) {
        const productId = this.$route.params.id;
        const commentData = {
          content: this.newComment,
          parentId: productId,
          replyId: this.replyingToComment ? this.replyingToComment.id : null, // 如果是回复评论，则传递replyId
          userId: localStorage.getItem('UserID'),
        };

        try {
          const response = await axios.post(`/api/v1/TravelProduct/${productId}/Comments`, commentData);
          if (response.data.success) {
            if (this.replyingToComment) {
              // 如果是回复，则将该评论添加到对应的一级评论的回复中
              const newReply = response.data.data;
              this.replyingToComment.replies = this.replyingToComment.replies || [];
              this.replyingToComment.replies.unshift(newReply);
              // 二级评论按时间排序
              this.replyingToComment.replies.sort((a, b) => new Date(a.issuedAt) - new Date(b.issuedAt));
            } else {
              // 否则是新评论，直接添加到评论列表
              this.comments.unshift(response.data.data);
            }

            this.newComment = ""; // 清空评论框
            this.replyingToComment = null; // 清空当前回复的评论
          } else {
            console.error('发布评论失败：', response.data.errorMsg);
          }
        } catch (error) {
          console.error('发布评论时出错：', error);
        }
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString();
    }
  }
};
</script>

<style scoped>
.product-detail {
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    max-width: 800px;
    margin: 20px auto;
    font-family: 'Arial', sans-serif;
}

.product-info {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}

.product-image {
    background: url('https://youimg1.c-ctrip.com/target/0102a120004fhqcagB7E5_D_10000_1200.jpg?proc=autoorient');
    background-size: contain;
    width: 300px;
    height: 200px;
}

.product-summary {
    padding-left: 30px;
    flex: 2;
    min-width: 250px;
}

.product-summary h3 {
    font-size: 20px;
    margin-bottom: 10px;
    color: #333;
}

.product-summary p {
    font-size: 16px;
    color: #007bff;
}

.tableTitle {
    position: relative;
    margin-top: 25px;
    width: 800px;
    height: 1px;
    background-color: #d4d4d4;
    text-align: center;
    font-size: 16px;
    color: rgba(101, 101, 101, 1);
}

.detail_font {
    width: 800px;
    margin-top: 15px;
    padding-left: 20px;
    font-size: 18px;
}

.product-details {
    display: flex;
    justify-content: space-between;
}

.info-column {
    flex: 1;
    margin-left: 20px;
    margin-right: 20px;
}

.left-column {
    width: 360px;
    gap: 10px;
}

.right-column {
    width: 360px;
    gap: 20px;
}

.info-column p {
    font-size: 16px;
    color: #555;
    margin-bottom: 10px;
}

.info-column strong {
    color: #007bff;
}

/* 发布者信息部分 */
.publisher-info {
    margin-top: 5px;
    padding: 20px;
    border-radius: 8px;
}

.publisher-info h4 {
    font-size: 18px;
    margin-bottom: 10px;
    color: #333;
}

.publisher-info p {
    font-size: 16px;
    color: #555;
}

.publisher-info strong {
    color: #007bff;
}

.arrow-button {
  background: none;
  border: none;
  color: blue;
  text-decoration: underline;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  margin: 10px 0;
}
.arrow-button:hover {
  color: darkblue;
}

/* 响应式布局调整 */
@media (max-width: 768px) {
    .product-details {
        flex-direction: column;
    }

    .info-column {
        margin-right: 0;
        margin-bottom: 20px;
    }
}

.comment-input {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.comment-input textarea {
  padding: 10px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
  resize: none;
}

.comment-input button {
  margin-top: 10px;
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.comment-input button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.comments-list {
  margin-top: 20px;
}

.comment-author {
  font-size: 14px;
  color: #007bff;
}

.comment-author .comment-time {
  margin-left: 10px;
  font-size: 12px;
  color: #aaa;
}

.comment-content {
  margin-top: 10px;
  font-size: 16px;
  color: #333;
}

.no-comments {
  font-size: 16px;
  color: #777;
}

.comment-author button {
  margin-left: 10px;
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
}

.comment-author button:hover {
  text-decoration: underline;
}

/* 二级评论缩进样式 */
.comment-item {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* 二级评论缩进和背景样式 */
.comment-item.reply {
  margin-left: 30px; /* 增加左侧缩进 */
  background-color: #f9f9f9; /* 设置二级评论的背景色 */
  border-left: 4px solid #007bff; /* 在左侧添加蓝色边框来突显 */
}

/* 评论区标题 */
.comments-section h4 {
  font-size: 20px;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
  margin-bottom: 20px;
}
</style>