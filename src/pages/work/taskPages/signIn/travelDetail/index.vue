<template>
  <div id="leaveDetail">
    <van-field label="请假单号" v-if="actionType == 'detail'" :value="datas.fbillno" readonly/>
    <van-field required label="出差人" :value="datas.ftravelernames" @click="choseUsers" readonly :is-link="actionType !== 'detail'" />
    <van-field required label="出差标题" :value="datas.ftitle" @blur="changeTitle" placeholder="请输入出差标题" />
    <van-field required label="开始时间" :value="datas.fstartdate" readonly @click="changeStartDate"  placeholder="请选择开始时间" :is-link="actionType !== 'detail'"/>
    <van-field required label="结束时间" :value="datas.fenddate" readonly @click="changeEndDate"  placeholder="请选择结束时间" :is-link="actionType !== 'detail'" />
    <van-field required label="出差地址" :value="datas.faddress" @blur="changeAddress"  placeholder="请输入出差地址" :readonly="actionType === 'detail'" />
    <van-field required label="出差事由" v-if="showTextarea" input-class="textarea-class" type="textarea" autosize :value="datas.ftravelcause" @blur="changeTravelcause" :readonly="actionType === 'detail'"  placeholder="请输入请假事由" />
    <div class="textarea-box required" v-if="!showTextarea">
      <span class="label">出差事由</span>
      <span class="my-textarea" v-text="datas.ftravelcause"></span>
    </div>

    <!-- <div class="commit" v-if="actionType != 'detail'">
      <van-button :loading="loading" type="primary" size="large" :loading-text="loadingText" @click="submit">提交</van-button>
    </div> -->
    <div class="button-group">
      <van-button size="large" v-if="actionType !== 'detail'"  type="info" @click="submit" :disabled="loading" :loading="loading" :loading-text="loadingText">提交</van-button>
      <van-button size="large" v-if="actionType === 'detail' && !datas.fappdate && permission.approve" type="primary" @click="approveAction('Approve')" :loading="loading" :disabled="loading" :loading-text="loadingText">审核</van-button>
      <van-button size="large" v-if="actionType === 'detail' && datas.fappdate && permission.unApprove" type="danger" @click="approveAction('UnApprove')" :loading="loading" :disabled="loading" :loading-text="loadingText">反审核</van-button>
    </div>

    <van-popup :show="showDate" position="bottom" >
      <van-datetime-picker type="date" :value="currentDate" @confirm="changeDate" @cancel="showDate = false" />
    </van-popup>

  </div>
</template>

<script>
/* eslint-disable */
import dateFormula from "@js/dateFormula.js";
import { updateKey,prevPageSetData } from "@js/pageValue";
export default {
  data() {
    return {
      actionType: 'add',
      loading: false,
      loadingText: '正在提交',
      showDate: false,
      currentDate:  new Date().getTime(),
      showTextarea: true,
      dateType: '',
      datas: {
        fappdate: '',
        ftravelerids: '',
        ftravelernames: '',
        fstartdate: '',
        fenddate: '',
        fleavetypeid: '',
        fleavetypename: '',
        fleavereasonname: ''
      },
      leaveType: [],
      permission: {}
    }
  },
  onShow() {
    let users = updateKey('users', this)
    if (users) {
      let ids = '', names = '';
      users.forEach((item,index) => {
        if (index == 0) {
          ids += item.UserId
          names += item.UserName
        } else {
          ids += ',' + item.UserId
          names += ',' + item.UserName
        }
      })
      this.datas.ftravelerids = ids
      this.datas.ftravelernames = names
    }
  },
  onLoad(query) {
    if (query && query.id) {
      this.actionType = query.type
      this.getDetail(query.id)
      if (query.type === 'detail') {
        this.permission = JSON.parse(query.permission) || {}
      }
    } else {
      this.getLeaveType()
      this.getUser()
    }
  },
  onUnload() {
    this.initPage()
  },
  methods: {
    initPage() {
      this.actionType = 'add'
      this.loading = false
      this.showDate = false
      this.currentDate =  new Date().getTime()
      this.dateType = ''
      this.showTextarea = true
      this.leaveType = []
      this.permission = {}
      this.datas = {
        fleaverid: '',
        fappdate: '',
        fleavername: '',
        fstartdate: '',
        fenddate: '',
        fleavetypeid: '',
        fleavetypename: '',
        fleavereasonname: ''
      }
    },
    getUser() {
      let userInfo = wx.getStorageSync('crmUserInfo')
      this.datas.ftravelerids = userInfo.UserId
      this.datas.ftravelernames = userInfo.UserName
    },
    async getDetail(id) {
      let params = {
        TravelOrderId: id
      }
      let result = await this.$http.post('/api/CrmMobile/GetTravelOrderById', params)
      result = this._handleData(result)
      if (result) {
        result.fstartdate = dateFormula.format(new Date(result.fstartdate), 'yyyy-MM-dd')
        result.fenddate = dateFormula.format(new Date(result.fenddate), 'yyyy-MM-dd')
      }
      this.datas = result
      this.getLeaveType()
    },
    async getLeaveType() {
      let result = await this.$http.post('/api/CrmMobile/GetDataItemDetail', {
        EnCode: 'FormLeave'
      })
      this.leaveType = result.map(item => {
        return {
          text: item.Text,
          value: item.Value
        }
      })
    },
    _handleData(result) {
      if (result.fstartdate) result.fstartdate.split('T')[0]
      if (result.fenddate) result.fenddate.split('T')[0]
      return result
    },
    submit() {
      setTimeout(() => {
        this.commit()
      }, 200)
    },
    // 审核和反审核
    async approveAction(ApproveMethod) {
      if (this.loading) return
      this.loading = true
      let params = {
        TravelOrderId: this.datas.frowid,
        ApproveMethod: ApproveMethod
      }
      try {
        this.$http.post('/api/CrmMobile/ApproveTravelOrder', params)
        this.loading = false
        wx.showToast({ title: '成功', duration: 800})
        setTimeout(()=>{
          prevPageSetData('update', true)
          wx.navigateBack({ delta: 1})
        }, 800)
      } catch(err) {
        this.loading = false
      }
    },
    // 提交
    async commit() {
      if (this.loading) return
      this.loading = true
      let result = await this.$http.post('/api/CrmMobile/AddTravelOrder',this.datas)
      this.loading = false
      wx.showToast({
        title: '提交成功',
        duration: 800
      })
      setTimeout(()=>{
        prevPageSetData('update', true)
        wx.navigateBack({ delta: 1})
      },800)
    },
    validRules() {
      if (!datas.fleavername || !datas.fstartdate || !datas.fenddate || !datas.fleavetypename || !datas.fleavereasonname) {
        wx.showToast({
          title: '信息不完善',
          icon: 'none'
        })
        return false
      }
      return true
    },
    changeDate(event) {
      let stringDate = dateFormula.format(new Date(event.mp.detail), 'yyyy-MM-dd')
      switch (this.dateType) {
        case 'start':
          this.datas.fstartdate = stringDate
          break;
        case 'end':
          this.datas.fenddate = stringDate
          break
      }
      this.showDate = false
    },
    choseUsers() {
      if (this.actionType === 'detail') return
      wx.navigateTo({ url: '/pages/customerManage/users/main'})
    },
    changeStartDate() {
      if (this.actionType == 'detail') return
      this.dateType = 'start'
      this.showDate = true
    },
    changeTravelcause(e) {
      this.datas.ftravelcause = e.mp.detail.value
    },
    changeTitle(e) {
      this.datas.ftitle = e.mp.detail.value
    },
    changeAddress(e) {
      this.datas.faddress = e.mp.detail.value
    },
    changeEndDate() {
      if (this.actionType == 'detail') return 
      this.dateType = 'end'
      this.showDate = true
    }
  },
  watch: {
    showDate(val) {
      setTimeout(() => {
        this.showTextarea = !val
      },100)
    }
  }
}
</script>

<style lang="less">
#leaveDetail {
  .commit {
    width: 90%;
    margin: 20px auto;
  }
}
</style>
