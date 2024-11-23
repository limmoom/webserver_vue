const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://43.143.213.221:8080', // 后端服务器的地址和端口
        // changeOrigin: true,
        // pathRewrite: {
        //   '^/api': '/api', // 可选：如果后端接口没有 /api 前缀，可以重写路径
        // },
      },
    },
  },
})
