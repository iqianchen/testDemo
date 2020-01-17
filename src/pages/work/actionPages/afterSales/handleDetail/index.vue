<template>
  <div id="handlingDetail">
    <van-cell-group custom-class="custom-cell-group" title="售后">
      <van-cell title="售后类型" :value="queryData.AppealText" @click="choseAppeal" is-link />
      <van-cell title="售后满意度" :value="queryData.SatisfactionText" @click="choseSatisfaction" is-link />
      <van-cell title="解决日期" :value="queryData.ResolveDate" @click="choseResolveDate" is-link />
      <van-cell title="处理人" :value="queryData.PersonName" @click="choseHandle" is-link />
    </van-cell-group>
    
    <van-cell-group custom-class="custom-cell-group" title="原因">
      <van-field v-if="showTextarea" type="textarea" input-class="textarea-class" :value="queryData.Reason"  @blur="changeReason" label="原因分析" autosize placeholder="请输入原因分析"></van-field>
      <div class="textarea-box" v-if="!showTextarea">
        <span class="label">原因分析</span>
        <span class="my-textarea" v-text="queryData.Reason || ''"></span>
      </div>

      <van-field v-if="showTextarea" type="textarea" input-class="textarea-class" :value="queryData.Solution"  @blur="changeSolution" label="解决方案" autosize placeholder="请输入解决方案"></van-field>
      <div class="textarea-box" v-if="!showTextarea">
        <span class="label">解决方案</span>
        <span class="my-textarea" v-text="queryData.Solution || ''"></span>
      </div>

      <van-field v-if="showTextarea" type="textarea" input-class="textarea-class" :value="queryData.FactoryComment"  @blur="changeFactoryComment" label="工厂意见" autosize placeholder="请输入工厂意见"></van-field>
      <div class="textarea-box" v-if="!showTextarea">
        <span class="label">工厂意见</span>
        <span class="my-textarea" v-text="queryData.FactoryComment || ''"></span>
      </div>
    </van-cell-group>

    <div class="button-group">
      <van-button size="large" v-if="actionType == 'modify'" type="info" @click="submit">确定</van-button>
    </div>

    <van-popup :show="showDate" position="bottom" >
      <van-datetime-picker type="date" :value="currentDate" @confirm="changeDate" @cancel="showDate = false" />
    </van-popup> 
    <van-popup :show="showPicker" position="bottom" >
      <van-picker show-toolbar :columns="currentColumns" @confirm="changePicker" @cancel="showPicker = false" />
    </van-popup>
    <van-transition custom-class="popup" :show="showPopup" name="slide-right">
      <chose-customer  ref="customer" @cancel="showPopup = false" @confirm="selectedCustomer"></chose-customer>
    </van-transition>
  </div>
</template>

<script>
/* eslint-disable */
import dateFormula from '@js/dateFormula.js'
import { updateKey, prevPageSetData } from '@js/pageValue'
export default {
  name: "queryData",
  data () {
    return {
      actionType: 'modify',
      datas: {},
      queryData: {
        Appeal: '',
        AppealText: '',
        Satisfaction: '',
        SatisfactionText: '',
        ResolveDate: dateFormula.format(new Date(), 'yyyy-MM-dd'),
        PersonId: '',
        PersonName: '',
        Reason: '',
        Solution: '',
        FactoryComment: ''
      },
      currentDate: new Date().getTime(),
      currentPicker: '',
      currentColumns: [],
      showDate: false,
      showPicker: false,
      showPopup: false,
      showTextarea: true
    }
  },
  onLoad (query) {
    if (query && query.id) {
      this.getData(query.id)
    }
  },
  onShow () {
    let user = updateKey('user', this)
    if (user) {
      this.queryData.PersonId = user.UserId
      this.queryData.PersonName = user.UserName
    }
  },
  methods: {
    // 初始化页面
    initPage () {
      this.queryData = {
        Appeal: '',
        AppealText: '',
        Satisfaction: '',
        SatisfactionText: '',
        ResolveDate: '',
        PersonId: '',
        PersonName: '',
        Reason: '',
        Solution: '',
        FactoryComment: ''
      }
      this.datas = {}
      this.showDate = false
      this.showPicker = false
      this.showPopup = false
      this.showTextarea = true
      this.currentDate = ''
      this.currentPicker = ''
      this.currentColumns = []
    },
    // 通过Id获取服务单详情
    async getData(id) {
      let result = await this.$http.post('/api/CrmMobile/GetServiceOrderById', { ServiceOrderId: id })
      this.datas = result
      let queryData = this._handleData(result)
      // this.serviceOrderId = id
      this.queryData = queryData
    },
    // 处理数据
    _handleData(result) {
      let queryData = {}
      if (result.ProcessDetails && result.ProcessDetails.length > 0) {
        queryData = result.ProcessDetails[0]
        queryData.Appeal = parseInt(queryData.Appeal)
        switch (queryData.Appeal) {
          case 0:
            queryData.AppealText = '换货';
            break;
          case 1:
            queryData.AppealText = '维修';
            break;
          case 2:
            queryData.AppealText = '退货';
            break;
        }
        queryData.Satisfaction = parseInt(queryData.Satisfaction)
        switch (queryData.Satisfaction) {
          case 0:
            queryData.SatisfactionText = '满意';
            break;
          case 1:
            queryData.SatisfactionText = '不满意';
            break;
          case 2:
            queryData.SatisfactionText = '非常满意';
            break;
        }

        if (!queryData.ResolveDate) queryData.ResolveDate = dateFormula.format(new Date(), 'yyyy-MM-dd')
        if (!queryData.PersonId || !queryData.PersonName) {
          let userInfo = wx.getStorageSync('crmUserInfo')
          queryData.PersonId = userInfo.UserId
          queryData.PersonName = userInfo.UserName
        }
      }
      return queryData
    },
    submit() {
      setTimeout(() => {
        this.commit()
      }, 200)
    },
    // 确定
    async commit () {
      this.datas.ProcessDetails[0] = this.queryData
      let result = await this.$http.put('/api/CrmMobile/UpdateServiceOrder/'+this.datas.Id, this.datas)
      wx.showToast({ title: '提交成功', duration: 800})
      setTimeout(()=>{
        prevPageSetData('update', true)
        wx.navigateBack({ delta: 1})
      }, 800)
    },
    // 选择处理人
    selectedCustomer (customer) {
      this.queryData.UserId = customer.Id
      this.queryData.UserName = customer.Name
      this.showPopup = false
    },
    changePicker (event) {
      let currentValue = event.target.value
      switch (this.currentPicker) {
        case 'appeal':
          this.queryData.Appeal = currentValue.value
          this.queryData.AppealText = currentValue.text
          break;
        case 'satisfaction':
          this.queryData.Satisfaction = currentValue.value
          this.queryData.SatisfactionText = currentValue.text
          break;
      }
      this.showPicker = false
    },
    changeDate (event) {
      let stringDate = dateFormula.format(new Date(event.mp.detail), 'yyyy-MM-dd')
      this.queryData.ResolveDate = stringDate
      this.showDate = false
    },
    // 选择处理人
    choseHandle () {
      wx.navigateTo({url: '/pages/customerManage/user/main?type=handingDetail'})
    },
    // 选择售后类型
    choseAppeal () {
      let currentColumn = [
        { text: '换货', value: 0 },
        { text: '维修', value: 1 },
        { text: '退货', value: 2 }
      ]
      this.currentPicker = 'appeal'
      this.currentColumns = currentColumn
      this.showPicker = true
    },
    // 选择售后满意度
    choseSatisfaction () {
      let currentColumn = [
        { text: '满意', value: 0 },
        { text: '不满意', value: 1 },
        { text: '非常满意', value: 2 }
      ]
      this.currentPicker = 'satisfaction'
      this.currentColumns = currentColumn
      this.showPicker = true
    },
    // 选择解决日期
    choseResolveDate () {
      this.showDate = true
    },
    // 原因分析值改变
    changeReason (event) {
      this.queryData.Reason = event.mp.detail.value
    },
    // 解决方案值改变
    changeSolution (event) {
      this.queryData.Solution = event.mp.detail.value
    },
    // 工厂意见值改变
    changeFactoryComment (event) {
      this.queryData.FactoryComment = event.mp.detail.value
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
};
</script>

<style lang="less" scoped>

#handlingDetail {
  min-height: 100%;
  background-color: #f2f3f5;
}
</style>

