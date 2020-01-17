<template>
  <div id="login">
    <div class="logo">
      <div class="icon">
        <img src="/static/images/zuoyou-sofa.png" alt="">
      </div>
      <div class="login-text">左右微店</div>
    </div>
    <div class="login-form">
      <div class="input-group">
        <div class="input-row">
          <span class="input-label require">用户名</span>
          <input type="text" :value="userName" @blur="changeUserName" placeholder="请输入用户名">
        </div>
        <div class="input-row">
          <span class="input-label require">密码</span>
          <input type="password" :value="password" @blur="changePassword" placeholder="请输入密码">
        </div>
      </div>
    </div>

    <div class="submit-button">
      <van-button size="large" type="info" @click="userLogin" :disabled="loading" :loading="loading" :loading-text="loadingText">登录</van-button>
    </div>
    <div class="copy-right">
      &copy;深圳左右家私有限公司
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import { base64encode, base64decode } from '@/utils/base64encode.js'
export default {
  name: 'login',
  data () {
    return {
      userName: '',
      password: '',
      loading: false,
      loadingText: '加载中...'
    }
  },
  onShow() {
    this.userName = '';
    this.password = '';
  },
  mounted () {
    // 已经登录过的用户不用重复登录
    // let crmUser = wx.getStorageSync('crmUserInfo').UserId
    // if (crmUser) {
    //   wx.switchTab({ url: '../home/main' })
    // }
  },
  methods: {
    // 用户登录
    userLogin () {
      setTimeout(()=>{
        let validate = this.validate()
        if (!validate || this.loading) return
        this.loading = true
        let password = base64encode(this.password)
        let url = '/api/CrmMobile/UserLogin'
        let params = {
          UserCode: this.userName,
          Password: password
        }
        this.$http.post(url, params).then(res => {
          this.loading = false
          if (res && res.UserId) {
            res = Object.assign(res, {
              UserPwd: password
            })
            if (res.ClientData) {
              let jsonStr = res.ClientData.slice(1, -5)
              let datas = JSON.parse(jsonStr)
              res.authorizeMenu = datas.authorizeMenu
              res.authorizeButton = datas.authorizeButton
              res.organize = datas.organize
              delete res.ClientData
            }
            wx.setStorageSync('crmUserInfo', res)
            wx.switchTab({ url: '../home/main' })
          }
        }).catch( err => {
          this.loading = false
        })
      },100)
    },
    // 改变用户名
    changeUserName (event) {
      this.userName = event.mp.detail.value
    },
    // 改变密码
    changePassword (event) {
      this.password = event.mp.detail.value
    },
    // 验证
    validate () {
      if (!this.userName) {
        wx.showToast({
          title: '用户名不能为空',
          icon: 'none'
        })
        return false
      } else if (!this.password) {
        wx.showToast({
          title: '密码不能为空',
          icon: 'none'
        })
        return false
      }
      return true
    }
  }
}
</script>

<style lang="less">
page {
  background: #fff;
}
#login {
  height: 100%;
  box-sizing: border-box;
  .input-group {
    margin-bottom: 30px;
    border-bottom: 1px solid #eee;
    .input-row {
      position: relative;
      display: flex;
      width: 100%;
      padding: 10px 15px;
      font-size: 14px;
      line-height: 24px;
      color: #333;
      background-color: #fff;
      box-sizing: border-box;
      .input-label {
        max-width: 90px;
        min-width: 90px;
        display: inline-block;
        &.require::after {
          position: absolute;
          left: 7px;
          font-size: 14px;
          color: #f44;
          content: "*";
        }
      }
      input {
        flex: 1;
        overflow: hidden;

      }
      &:first-child::after {
        content: " ";
        position: absolute;
        pointer-events: none;
        box-sizing: border-box;
        -webkit-transform-origin: center;
        transform-origin: center;
        top: auto;
        left: 15px;
        right: 0;
        bottom: 0;
        -webkit-transform: scaleY(.5);
        transform: scaleY(.5);
        border-bottom: 1px solid #eee;
      }
    }
  }

  .logo {
    text-align: center;
    font-weight: 700;
    font-size: 32px;
    font-family: "宋体";
    padding: 20px 0;
    background-color: #2986c3;
    .icon {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      display: inline-block;
      background-color: #fff;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .login-text {
      color: #fff;
      margin-top: 10px;
    }
  }
  .login-form {
    margin-bottom: 20px;
  }
  .copy-right {
    position: fixed;
    width: 100%;
    bottom: 10px;
    text-align: center;
    font-size: 12px;
    color: #515a6e;
  }
}
</style>

