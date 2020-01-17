<template>
  <div id="mine">
    <div class="icon-bg">
      <div class="icon">
        <span class="iconfont icon-kehu1"></span>
      </div>
      <span class="text" v-text="userName"></span>
    </div>

    <div class="action">
      <van-cell title="我的资料" @click="pageSkipping('info')" is-link></van-cell>  
      <van-cell title="客户管理" @click="pageSkipping('customer')" is-link></van-cell>  
    </div>

    <van-cell title="退出登录" @click="logout" is-link></van-cell>  
  </div>
</template>

<script>
export default {
  data() {
    return {
      userName: ''
    }
  },
  mounted() {
    let userInfo = wx.getStorageSync('crmUserInfo')
    this.userName = userInfo.UserName
  },
  methods: {
    // 进入客户我的资料
    // jumpToInfo() {
    //   // wx.navigateTo({ url: '../info/main'})
    // },
    // // 进入客户管理页面
    // jumpToCustomer() {
    //   // wx.navigateTo({ url: '/pages/customerManage/home/main'})
    // },
    // 页面跳转
    pageSkipping(pageName) {
      let url = '';
      switch (pageName) {
        case 'info':
          url = '../info/main';
          break;
        case 'customer':
          url = '../customer/main';
          break;
      }
      wx.navigateTo({ url: url })
    },
    // 退出登录
    logout() {
      wx.showModal({
        title: '提示',
        content: '您确定要退出吗',
        success: (res) => {
          if (res.confirm) {
            this.$http.post('/api/CrmMobile/UserOutLogin',{}).then(res => {
              wx.removeStorageSync('crmUserInfo')
              wx.reLaunch({url: '/pages/login/main'})
            })
          }
        }
      })
    },
  }
}
</script>

<style lang="less">
@import "~less/base-color.less";
#mine {
  height: 100%;
  background-color: @background-color;
  .icon-bg {
    height: 200px;
    background-color: @main-color;
    text-align: center;
    box-sizing: border-box;
    padding-top: 20px;
    .icon {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      background-color: #fff;
      margin: 0 auto;
      text-align: center;
      line-height: 100px;
      overflow: hidden;
      .iconfont {
        color: @main-color;
        font-size: 75px;
      }
    }
    .text {
      margin-top: 15px;
      display: inline-block;
      font-size: 22px;
      font-weight: 700;
      color: #f4f4f4;
    }
  }
  .action {
    margin-bottom: 10px;
  }
}
</style>

