<template>
    <div class="dynamic-detail">
      <div>
        <button @click="goBack" class="arrow-button">← 返回</button>
      </div>
      <div v-if="dynamic" class="dynamic-info">
        <h3 class="dynamic-title">{{ dynamic.title }}</h3>
        <p class="dynamic-content">{{ dynamic.content }}</p>
        <p><strong>发布者：</strong>
          <router-link :to="{ name: 'OtherProfile', params: { id: dynamic.userId } }">
            {{ publisherName || '加载中...' }}
          </router-link>
        </p>
        <p><strong>发布时间：</strong>{{ formatDate(dynamic.issuedAt) }}</p>
        <p><strong>Tag: </strong>
          <span>
            {{ dynamic.tags && dynamic.tags.length > 0
              ? dynamic.tags.map(tag => `#${tag.name}`).join(', ')
              : '无' }}
          </span>
        </p>
        <p v-if="dynamic.urlId">
          <strong>相关产品: </strong>
          <a
            href="javascript:void(0)"
            @click="navigateToProductDetail(dynamic.urlId)"
          >
            {{ linkedProductName || '加载中...' }}
          </a>
        </p>
      </div>
      <div v-else>
        <p>加载动态信息中...</p>
      </div>
  
      <!-- 分割线 -->
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
    name: 'DynamicDetail',
    data() {
      return {
        dynamic: null,
        publisherName: null,
        linkedProductName: null,
        errorMessage: null,
        comments: [],
        newComment: '',
        replyingToComment: null,
      };
    },
    mounted() {
      const dynamicId = this.$route.params.id;
      this.fetchDynamicDetails(dynamicId);
      this.fetchComments(dynamicId);
    },
    methods: {
      goBack() {
        this.$router.go(-1);
      },
      async fetchDynamicDetails(dynamicId) {
        try {
          const response = await axios.get(`/api/v1/Dynamic/${dynamicId}`);
          if (response.data.success) {
            this.dynamic = response.data.data;
            this.fetchPublisherName(this.dynamic.userId);
            if (this.dynamic.urlId) {
              this.fetchLinkedProductName(this.dynamic.urlId);
            }
          } else {
            this.errorMessage = response.data.errorMsg;
          }
        } catch (error) {
          console.error('获取动态信息时出错：', error);
          this.errorMessage = '加载动态信息失败，请稍后重试。';
        }
      },
      async fetchPublisherName(userId) {
        try {
          const response = await axios.get(`/api/v1/User/${userId}`);
          if (response.data.success) {
            this.publisherName = response.data.data.name;
          } else {
            console.error('获取发布者信息失败：', response.data.errorMsg);
          }
        } catch (error) {
          console.error('获取发布者信息时出错：', error);
        }
      },
      async fetchLinkedProductName(productId) {
        try {
          const response = await axios.get(`/api/v1/TravelProduct/${productId}`);
          if (response.data.success) {
            this.linkedProductName = response.data.data.title;
          } else {
            console.error('获取相关产品信息失败：', response.data.errorMsg);
          }
        } catch (error) {
          console.error('获取相关产品信息时出错：', error);
        }
      },
      navigateToProductDetail(productId) {
        this.$router.push(`/product-detail/${productId}`);
      },
      formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString();
      },
      async fetchComments(dynamicId) {
        try {
          const response = await axios.get(`/api/v1/Dynamic/${dynamicId}/Comments`);
          if (response.data.success) {
            this.comments = response.data.data;
  
            // 对评论按发布时间排序（从新到旧）
            this.comments.sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
  
            // 获取每个评论的发布者信息，并排序二级评论
            for (let comment of this.comments) {
              this.fetchCommentPublisherInfo(comment.userId, comment);
              if (comment.replies) {
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
        this.newComment = `@ ${comment.userName}：`; // 显示@用户名
      },
      async submitComment() {
        if (this.newComment.trim()) {
          const dynamicId = this.$route.params.id;
          const commentData = {
            content: this.newComment,
            parentId: dynamicId,
            replyId: this.replyingToComment ? this.replyingToComment.id : null,
            userId: localStorage.getItem('UserID'),
          };
  
          try {
            const response = await axios.post(`/api/v1/Dynamic/${dynamicId}/Comments`, commentData);
            if (response.data.success) {
              const newComment = response.data.data;
  
              if (this.replyingToComment) {
                const newReply = newComment;
                this.replyingToComment.replies = this.replyingToComment.replies || [];
                this.replyingToComment.replies.unshift(newReply);
                this.replyingToComment.replies.sort((a, b) => new Date(a.issuedAt) - new Date(b.issuedAt));
              } else {
                this.comments.unshift(newComment);
              }
  
              this.newComment = '';
              this.replyingToComment = null;
            } else {
              console.error('发布评论失败：', response.data.errorMsg);
            }
          } catch (error) {
            console.error('发布评论时出错：', error);
          }
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .dynamic-detail {
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    max-width: 800px;
    margin: 20px auto;
    font-family: 'Arial', sans-serif;
  }
  
  .dynamic-title {
    font-size: 24px;
    margin-bottom: 10px;
    color: #333;
  }
  
  .dynamic-content {
    font-size: 18px;
    color: #555;
    margin-bottom: 20px;
  }
  
  .dynamic-info p {
    font-size: 16px;
    color: #555;
    margin-bottom: 10px;
  }
  
  .dynamic-info strong {
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
  
  /* 评论区样式 */
  .comments-section {
    margin-top: 20px;
  }
  
  .comments-section h4 {
    font-size: 20px;
    color: #333;
    border-bottom: 2px solid #007bff;
    padding-bottom: 10px;
    margin-bottom: 20px;
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
    margin-left: 30px;
    background-color: #f9f9f9;
    border-left: 4px solid #007bff;
  }
  </style>
  