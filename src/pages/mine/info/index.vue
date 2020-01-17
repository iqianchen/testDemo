<template>
  <div id="info">
    <van-field readonly label="公司" :value="datas.forgname"></van-field>
    <van-field readonly label="部门" :value="datas.deptName"></van-field>
    <van-field readonly label="账号" :value="datas.account"></van-field>
    <van-field readonly label="名称" :value="datas.nickname"></van-field>
    <van-field readonly label="职位" :value="datas.dutyname"></van-field>
    <van-field readonly label="手机" :value="datas.mobile"></van-field>
    <van-field readonly label="邮箱" :value="datas.email"></van-field>
  </div>
</template>

<script>
export default {
  data() {
    return {
      datas: {
        forgname: '',
        deptName: '',
        account: '',
        nickname: '',
        dutyname: '',
        mobile: '',
        email: ''
      }
    }
  },
  onLoad() {
    this.getData()
  },
  methods: {
    async getData() {
      let result = await this.$http.post('/api/CrmMobile/GetUserDetail',{}, true)
      if (result) {
        let userInfo = wx.getStorageSync('crmUserInfo')
        this.datas = result;
        this.datas.deptName = userInfo.DeptName
      }
    },
  }
}
</script>
