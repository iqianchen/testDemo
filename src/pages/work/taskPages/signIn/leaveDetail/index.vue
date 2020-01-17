<template>
  <div id="leaveDetail">
    <van-field label="请假单号" v-if="actionType == 'detail'" :value="datas.fbillno" readonly/>
    <van-field required label="请假人" :value="datas.fleavername" readonly />
    <van-field required label="请假开始时间" :value="datas.fstartdate" readonly @click="choseDate('start')"  placeholder="请选择开始时间" :is-link="actionType !== 'detail'"/>
    <van-field required label="请假结束时间" :value="datas.fenddate" readonly @click="choseDate('end')"  placeholder="请选择结束时间" :is-link="actionType !== 'detail'" />
    <van-field required label="请假类型" :value="datas.fleavetypename" readonly @click="changeLeaveType"  placeholder="请选择请假类型" :is-link="actionType !== 'detail'" />
    <van-field required label="请假事由" v-if="showTextarea" input-class="textarea-class" type="textarea" autosize :value="datas.fleavereasonname" @blur="changeReeason" :readonly="actionType === 'detail'"  placeholder="请输入请假事由" />
    <div class="textarea-box required" v-if="!showTextarea">
      <span class="label">请假事由</span>
      <span class="my-textarea" v-text="datas.fleavereasonname"></span>
    </div>
    <!-- <div class="commit" v-if="actionType != 'detail'">
      <van-button :loading="loading" :disabled="loading" type="primary" size="large" :loading-text="loadingText" @click="submit">提交</van-button>
    </div> -->

    <div class="button-group">
      <van-button size="large" v-if="actionType !== 'detail'"  type="info" @click="submit" :disabled="loading" :loading="loading" :loading-text="loadingText">提交</van-button>
      <van-button size="large" v-if="actionType === 'detail' && !datas.fappdate && permission.approve" type="primary" @click="approveAction('Approve')" :loading="loading" :disabled="loading" :loading-text="loadingText">审核</van-button>
      <van-button size="large" v-if="actionType === 'detail' && datas.fappdate && permission.unApprove" type="danger" @click="approveAction('UnApprove')" :loading="loading" :disabled="loading" :loading-text="loadingText">反审核</van-button>
    </div>

    <van-popup :show="showDate" position="bottom" >
      <van-datetime-picker type="datetime" :value="currentDate" @confirm="changeDate" @cancel="showDate = false" />
    </van-popup>

    <van-popup :show="showPicker" position="bottom" >
      <van-picker show-toolbar :columns="leaveType" @confirm="onChange" @cancel="showPicker = false"/>
    </van-popup>
  </div>
</template>


<script>
/* eslint-disable */
import dateFormula from "@js/dateFormula.js";
import { prevPageSetData } from "@js/pageValue";
export default {
  data() {
    return {
      actionType: 'add',
      loading: false,
      loadingText: '正在提交',
      showDate: false,
      showPicker: false,
      currentDate:  new Date().getTime(),
      showTextarea: true,
      dateType: '',
      datas: {
        fleaverid: '',
        fleavername: '',
        fstartdate: '',
        fenddate: '',
        fappdate: '',
        fleavetypeid: '',
        fleavetypename: '',
        fleavereasonname: ''
      },
      leaveType: [],
      permission: {}
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
      this.showPicker = false
      this.showTextarea = true
      this.currentDate =  new Date().getTime()
      this.dateType = ''
      this.leaveType = []
      this.permission = {}
      this.datas = {
        fleaverid: '',
        fleavername: '',
        fstartdate: '',
        fenddate: '',
        fappdate: '',
        fleavetypeid: '',
        fleavetypename: '',
        fleavereasonname: ''
      }
    },
    getUser() {
      let userInfo = wx.getStorageSync('crmUserInfo')
      this.datas.fleaverid = userInfo.UserId
      this.datas.fleavername = userInfo.UserName
    },
    async getDetail(id) {
      let params = {
        LeaveId: id
      }
      let result = await this.$http.post('/api/CrmMobile/GetLeaveById', params)
      result = this._handleData(result)
      if (result) {
        result.fstartdate = dateFormula.format(new Date(result.fstartdate), 'yyyy-MM-dd hh:mm')
        result.fenddate = dateFormula.format(new Date(result.fenddate), 'yyyy-MM-dd hh:mm')
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
    // 审核和反审核
    async approveAction(ApproveMethod) {
      if (this.loading) return
      this.loading = true
      let params = {
        LeaveId: this.datas.frowid,
        ApproveMethod: ApproveMethod
      }
      try {
        this.$http.post('/api/CrmMobile/ApproveLeave', params)
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
    submit() {
      setTimeout(() => {
        this.commit()
      }, 200)
    },
    // 提交
    async commit() {
      if (this.loading) return
      this.loading = true
      try {
        let result = await this.$http.post('/api/CrmMobile/AddLeave',this.datas)
        this.loading = false
        wx.showToast({
          title: '提交成功',
          duration: 800
        })
        setTimeout(()=>{
          prevPageSetData('update', true)
          wx.navigateBack({ delta: 1})
        },800)
      } catch(e) {
        this.loading = false
      }
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
    onChange(event) {
      let currentValue = event.target.value
      this.datas.fleavetypeid = currentValue.value
      this.datas.fleavetypename = currentValue.text
      this.showPicker = false
    },
    changeLeaveType() {
      if (this.actionType == 'detail') return
      this.showPicker = true
    },
    changeDate(event) {
      let stringDate = dateFormula.format(new Date(event.mp.detail), 'yyyy-MM-dd hh:mm')
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
    choseDate(type) {
      if (this.actionType == 'detail') return
      this.dateType = type
      this.showDate = true
      switch (type) {
        case "start":
          if (this.datas.fstartdate) this.currentDate = new Date(this.datas.fstartdate).getTime()
          break;
        case "end":
          if (this.datas.fenddate) this.currentDate = new Date(this.datas.fenddate).getTime()
          break
      }
    },
    changeReeason(e) {
      this.datas.fleavereasonname = e.mp.detail.value
    },
  },
  watch: {
    showDate(val) {
      setTimeout(() => {
        this.showTextarea = !val
      },100)
    },
    showPicker(val) {
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
