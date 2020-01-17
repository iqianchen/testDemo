<template>
  <div id="submarineDetail">
    <van-field required label="商机名称" @blur="changeFullname" :value="queryData.ffullname" :readonly="actionType === 'detail'" :placeholder="actionType === 'detail' ? '': '请输入商机名称'" />
    <van-field required label="商机来源" @click="choseSource" :value="queryData.fsourcename" readonly :is-link="actionType !== 'detail'" :placeholder="actionType === 'detail' ? '': actionType === 'detail' ? '': '请选择商机来源'" />
    <van-field required label="商机阶段" @click="choseStage" :value="queryData.fstagename" readonly :is-link="actionType !== 'detail'" :placeholder="actionType === 'detail' ? '': '请选择商机阶段'" />
    <van-field required label="联系人" @blur="changeContact" :value="queryData.fcontacts" :readonly="actionType === 'detail'" :placeholder="actionType === 'detail' ? '': '请输入联系人'" />
    <van-field required label="手机" type="number" @blur="changeMobile" :value="queryData.fmobile" :readonly="actionType === 'detail'" :placeholder="actionType === 'detail' ? '': '请输入手机号'" />
    <van-field required label="成功率(%)" type="number" @blur="changeSuccessRate" :value="queryData.fsuccessrate" :readonly="actionType === 'detail'" :placeholder="actionType === 'detail' ? '': '请输入成功率'" />
    <van-field required label="公司名称" @blur="changeCompany" :value="queryData.fcompanynaturename" :readonly="actionType == 'detail'" :placeholder="actionType === 'detail' ? '': '请输入公司名称'" />
    <van-field required label="跟进人员" @click="choseTraceuser" :value="queryData.ftraceusername" readonly :is-link="actionType !== 'detail'" :placeholder="actionType === 'detail' ? '': '请选择跟进人员'" />
    <van-field label="年龄" type="number" @blur="changeAge" :value="queryData.fage" :readonly="actionType == 'detail'" :placeholder="actionType == 'detail' ? '': '请输入年龄'" />   
    <van-field label="性别" readonly @click="choseGender" :value="queryData.fgenderText" :placeholder="actionType == 'detail' ? '': '请选择性别'" />
    <van-field label="客户类别" readonly @click="choseCustflag" :value="queryData.fcustflagText" :is-link="actionType !== 'detail'" :placeholder="actionType == 'detail' ? '': '请选择客户类别'" />
    <van-field label="预计成交日期" @click="choseDealdate" :value="queryData.fdealdate" readonly :is-link="actionType !== 'detail'" :placeholder="actionType === 'detail' ? '': '请选择预计成交日期'" />
    <van-field label="省份" @click="choseProvince" :value="queryData.fprovincename" readonly :is-link="actionType !== 'detail'" :placeholder="actionType === 'detail' ? '': '请选择省份'" />
    <van-field label="城市" @click="choseCity" :value="queryData.fcityname" readonly :is-link="actionType !== 'detail'" :placeholder="actionType === 'detail' ? '': '请选择城市'" />
    <van-field label="区县" @click="choseCount" :value="queryData.fcountyname" readonly :is-link="actionType !== 'detail'" :placeholder="actionType === 'detail' ? '': '请选择区县'" />
    <van-field label="详细地址" @blur="changeAddress" :value="queryData.fcompanyaddress" :readonly="actionType == 'detail'" :placeholder="actionType == 'detail' ? '': '请输入详细地址'" />
    <van-field label="备注" type="textarea" v-if="showTextarea" input-class="textarea-class" autosize @blur="changeDesc" :value="queryData.fdescription" :readonly="actionType == 'detail'" :placeholder="actionType === 'detail' ? '': '请输入备注'" />
    <div class="textarea-box" v-if="!showTextarea">
      <span class="label">备注</span>
      <span class="my-textarea" v-text="queryData.fdescription"></span>
    </div>

    <div class="commit" v-if="actionType !== 'detail'">
      <van-button size="large" type="primary" @click="submit" :disabled="loading" :loading="loading" :loading-text="loadingText">提交</van-button>
    </div>

    <van-popup :show="showDate" position="bottom" >
      <van-datetime-picker type="date" :value="currentDate" @confirm="changeDate" @cancel="showDate = false" />
    </van-popup> 
    <van-popup :show="showPicker" position="bottom" >
      <van-picker show-toolbar :columns="currentColumns" @confirm="changePicker" @cancel="showPicker = false" />
    </van-popup>
  </div>
</template>

<script>
/* eslint-disable */
import dateFormula from '@js/dateFormula.js'
import { updateKey,prevPageSetData } from '@js/pageValue'
export default {
  data() {
    return {
      queryData: {
        frowid: '',
        ffullname: '',
        fsourceid: '',
        fsourcename: '',
        fstageid: '',
        fstagename: '',
        fsuccessrate: '',
        fcompanynatureid: '',
        fcompanynaturename: '',
        ftraceuserid: '',
        ftraceusername: '',
        fdealdate: '',
        fcontacts: '',
        fmobile: '',
        fdescription: '',
        fprovinceid: '',
        fprovincename: '',
        fcityid: '',
        fcityname: '',
        fcountyid: '',
        fcountyname: '',
        fgender: '',
        fgenderText: '',
        fcustflag: '',
        fcustflagText: '',
        fcompanyaddress: '',
        fage: '',
      },
      showDate: false,
      showPicker: false,
      showTextarea: true,
      pickerType: '',
      currentDate: new Date().getTime(),
      currentColumns: [],
      actionType: 'add',
      loading: false,
      loadingText: '正在提交'
    }
  },
  onLoad(query) {
    if (query && query.id) {
      this.actionType = query.type
      this.getDetail(query.id)
    }
  },
  onUnload() {
    this.initPage()
  },
  onShow() {
    let user = updateKey('user', this)
    if (user) {
      this.queryData.ftraceuserid = user.UserId
      this.queryData.ftraceusername = user.UserName
    }
  },
  methods: {
    initPage() {
      this.actionType = 'add'
      this.loading = false
      this.showTextarea = true
      this.queryData = {
        frowid: '',
        ffullname: '',
        fsourceid: '',
        fsourcename: '',
        fstageid: '',
        fstagename: '',
        fsuccessrate: '',
        fcompanynatureid: '',
        fcompanynaturename: '',
        ftraceuserid: '',
        ftraceusername: '',
        fdealdate: '',
        fcontacts: '',
        fmobile: '',
        fdescription: '',
        fprovinceid: '',
        fprovincename: '',
        fcityid: '',
        fcityname: '',
        fcountyid: '',
        fcountyname: '',
        fgender: '',
        fgenderText: '',
        fcustflag: '',
        fcustflagText: '',
        fcompanyaddress: '',
        fage: '',
      }
    },
    async getDetail(id) {
      let params = {
        ChanceId: id
      }
      let result = await this.$http.post('/api/CrmMobile/GetCrmChanceById', params, true)
      result = this._handleData(result)
      if (result) {
        this.queryData = result
      }
    },
    _handleData(result) {
      debugger
      if (result.fgender !== null && result.fgender !== undefined) {
        switch(parseInt(result.fgender)) {
          case 0:
            result.fgenderText = '女'
            break;
          case 1:
            result.fgenderText = '男'
            break;
          case 3:
            result.fgenderText = '未知'
            break;
        }
      }
      if (result.fcustflag !== null && result.fcustflag !== undefined) {
        switch (parseInt(result.fcustflag)) {
          case 0:
            result.fcustflagText = '个人客户'
            break;
          case 1:
            result.fcustflagText = '公海客户'
            break;
        }
      }
      if (result.fdealdate) {
        result.fdealdate = dateFormula.format(new Date(result.fdealdate), 'yyyy-MM-dd')
      }
      return result
    },
    submit() {
      setTimeout(() => {
        this.commit()
      }, 200);
    },
    async commit() {
      if (this.loading || !this.validRules()) return
      this.loading = true
      let result = await this.$http.post('/api/CrmMobile/AddCrmChance', this.queryData)
      this.loading = false
      if (result) {
        wx.showToast({
          title: '成功',
          duration: 800
        })
        setTimeout(() => {
          prevPageSetData('update', true)
          wx.navigateBack({ delta: 1})
        }, 800)
      }
    },
    validRules() {
      if (!this.queryData.ffullname || !this.queryData.fsourcename || !this.queryData.fstagename || !this.queryData.fsuccessrate || !this.queryData.fcompanynaturename || !this.queryData.ftraceusername || !this.queryData.fcontacts || !this.queryData.fmobile) {
        wx.showToast({ title: '信息不完善', icon: 'none'})
        return false
      }
      return true
    },
    changeDate(event) {
      let stringDate = dateFormula.format(new Date(event.mp.detail), 'yyyy-MM-dd')
      this.queryData.fdealdate = stringDate
      this.showDate = false
    },
    changePicker(event) {
      let currentValue = event.target.value
      switch (this.pickerType) {
        case "Source":
          this.queryData.fsourceid = currentValue.value
          this.queryData.fsourcename = currentValue.text
          break;
        case 'Stage':
          this.queryData.fstageid = currentValue.value
          this.queryData.fstagename = currentValue.text
          break;
        case 'Province':
          this.queryData.fprovinceid = currentValue.value
          this.queryData.fprovincename = currentValue.text
          break;
        case 'City':
          this.queryData.fcityid = currentValue.value
          this.queryData.fcityname = currentValue.text
          break;
        case 'Count':
          this.queryData.fcountyid = currentValue.value
          this.queryData.fcountyname = currentValue.text
          break;
        case 'Gender':
          this.queryData.fgender = currentValue.value
          this.queryData.fgenderText = currentValue.text
          break;
        case 'Custflag':
          this.queryData.fcustflag = currentValue.value
          this.queryData.fcustflagText = currentValue.text
          break;
      }
      this.showPicker = false
    },
    // 获取商机来源
    async getSource() {
      let result = await this.$http.post('/api/CrmMobile/GetDataItemDetail', { EnCode: 'CrmChanceSource'})
      this.currentColumns = result.map(item => {
        return {
          text: item.Text,
          value: item.Value
        }
      })
    },
    // 获取商机阶段
    async getStage() {
      let result = await this.$http.post('/api/CrmMobile/GetDataItemDetail', { EnCode: 'CrmChancePhase'})
      this.currentColumns = result.map(item => {
        return {
          text: item.Text,
          value: item.Value
        }
      })
    },
    // 获取地址
    async getArea(ParentId) {
      // 不传ParentId为获取省份,传ParentId为获取城市
      let params = {
        ParentId: ParentId || 0
      }
      let result = await this.$http.post('/api/CrmMobile/GetArea', params)
      this.currentColumns = result.map(item => {
        return {
          text: item.AreaName,
          value: item.AreaId
        }
      })
    },
    // 选择商机来源
    choseSource() {
      if (this.actionType === 'detail') return;
      this.pickerType = 'Source'
      this.currentColumns = []
      this.showPicker = true
      this.getSource()
    },
    // 选择商机阶段
    choseStage() {
      if (this.actionType === 'detail') return;
      this.pickerType = 'Stage'
      this.currentColumns = []
      this.showPicker = true
      this.getStage()
    },
    // 选择跟进人员
    choseTraceuser() {
      if (this.actionType === 'detail') return;
      wx.navigateTo({ url: '/pages/customerManage/user/main?type=traceuser'})
    },
    // 选择预计成交日期
    choseDealdate() {
      if (this.actionType === 'detail') return;
      this.showDate = true
    },
    // 选择省
    choseProvince() {
      if (this.actionType === 'detail') return;
      this.pickerType = 'Province'
      this.currentColumns = []
      this.showPicker = true
      this.getArea()
    },
    // 选择市
    choseCity() {
      if (this.actionType === 'detail') return;
      if (!this.queryData.fprovinceid) {
        wx.showToast({ title: '请先选择省份', icon: 'none'})
        return
      }
      this.pickerType = 'City'
      this.currentColumns = []
      this.showPicker = true
      this.getArea(this.queryData.fprovinceid)
    },
    // 选择区/县
    choseCount() {
      if (this.actionType === 'detail') return;
      if (!this.queryData.fcityid) {
        wx.showToast({ title: '请先选择城市', icon: 'none'})
        return
      }
      this.pickerType = 'Count'
      this.currentColumns = []
      this.showPicker = true
      this.getArea(this.queryData.fcityid)
    },
    // 选择性别
    choseGender() {
      if (this.actionType === 'detail') return;
      this.pickerType = 'Gender'
      this.currentColumns = [
        { value: 0, text: '女'},
        { value: 1, text: '男'},
        { value: 2, text: '未知'}
      ]
      this.showPicker = true
    },
    // 选择客户类别
    choseCustflag() {
      if (this.actionType === 'detail') return;
      this.pickerType = 'Custflag'
      this.showPicker = true
      this.currentColumns = [
        { value: 0, text: '个人客户'},
        { value: 1, text: '公海客户'}
      ]
    },
    changeCompany(e) {
      this.queryData.fcompanynaturename = e.mp.detail.value
    },
    changeFullname(e) {
      this.queryData.ffullname = e.mp.detail.value
    },
    changeSuccessRate(e) {
      this.queryData.fsuccessrate = e.mp.detail.value
    },
    changeContact(e) {
      this.queryData.fcontacts = e.mp.detail.value
    },
    changeMobile(e) {
      this.queryData.fmobile = e.mp.detail.value
    },
    changeDesc(e) {
      this.queryData.fdescription = e.mp.detail.value
    },
    changeAddress(e) {
      this.queryData.fcompanyaddress = e.mp.detail.value
    },
    changeAge(e) {
      this.queryData.fage = e.mp.detail.value
    }
  },
  watch: {
    showDate(val) {
      setTimeout(() => {
        this.showTextarea = !val
      },200)
    },
    showPicker(val) {
      setTimeout(() => {
        this.showTextarea = !val
      },200)
    }
  }
}
</script>

<style lang="less">
#submarineDetail {
  .commit {
    margin: 30px auto;
    width: 90%;
  }
}
</style>
