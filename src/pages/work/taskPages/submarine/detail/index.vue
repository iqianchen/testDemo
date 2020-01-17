<template>
  <div id="submarineDetail">
    <div v-if="actionType === 'update'" class="action-btn">
      <van-button size="small" @click="share" type="primary">共享</van-button>
      <van-button size="small" @click="transferToBtn" type="warning">转给</van-button>
      <van-button size="small" @click="loss" v-if="showLoss" type="danger">流失</van-button>
    </div>
    <van-cell-group>
      <van-field required label="联系人" @blur="changeContact" :value="queryData.fcontact" :readonly="actionType == 'detail'" :placeholder="actionType == 'detail' ? '': '请输入联系人'" />
      <van-field required label="手机" type="number" @blur="changeMobile" :value="queryData.fmobile" :readonly="actionType == 'detail'" :placeholder="actionType == 'detail' ? '': '请输入手机号'" />
      <van-field label="客户来源" required readonly @click="choseSource" :value="queryData.fsourcename" :is-link="actionType !== 'detail'" :placeholder="actionType == 'detail' ? '': '请选择客户来源'" />
      <van-field label="跟进状态" required readonly @click="choseStage" :value="queryData.fstagename" :is-link="actionType !== 'detail'" :placeholder="actionType == 'detail' ? '': '请选择跟进状态'" />
      <van-field label="客户类别" readonly @click="choseCustflag" :value="queryData.fcustflagText" :is-link="actionType !== 'detail'" :placeholder="actionType == 'detail' ? '': '请选择客户类别'" />
      <van-field label="年龄" type="number" @blur="changeAge" :value="queryData.fage" :readonly="actionType == 'detail'" :placeholder="actionType == 'detail' ? '': '请输入年龄'" />   
      <van-field label="性别" readonly @click="choseGender" :value="queryData.fgenderText" :placeholder="actionType == 'detail' ? '': '请选择性别'" />
      <van-field label="省份" @click="choseProvince" :value="queryData.fprovincename" readonly :is-link="actionType !== 'detail'" :placeholder="actionType === 'detail' ? '': '请选择省份'" />
      <van-field label="城市" @click="choseCity" :value="queryData.fcityname" readonly :is-link="actionType !== 'detail'" :placeholder="actionType === 'detail' ? '': '请选择城市'" />
      <van-field label="区县" @click="choseCount" :value="queryData.fcountyname" readonly :is-link="actionType !== 'detail'" :placeholder="actionType === 'detail' ? '': '请选择区县'" />
      <van-field label="详细地址" @blur="changeAddress" :value="queryData.faddress" :readonly="actionType == 'detail'" :placeholder="actionType == 'detail' ? '': '请输入详细地址'" />
      <van-field label="备注" v-if="showTextarea" input-class="textarea-class" type="textarea" autosize @blur="changeDesc" :value="queryData.fdescription" :readonly="actionType == 'detail'" :placeholder="actionType == 'detail' ? '' : '请输入备注'" />
      <div class="textarea-box" v-if="!showTextarea">
        <span class="label">备注</span>
        <span class="my-textarea" v-text="queryData.fdescription"></span>
      </div>
    </van-cell-group>
    <div class="commit" v-if="actionType !== 'detail'">
      <van-button size="large" type="primary" @click="submit" :disabled="loading" :loading="loading" :loading-text="loadingText">提交</van-button>
    </div>

    <van-popup :show="showPicker" position="bottom" >
      <van-picker show-toolbar :columns="currentColumns" @confirm="changePicker" @cancel="showPicker = false" />
    </van-popup>
  </div>
</template>

<script>
/* eslint-disable */
import { prevPageSetData, updateKey } from '@js/pageValue'
export default {
  data() {
    return {
      queryData: {
        frowid: '',
        fcontact: '',
        fmobile: '',
        fdescription: '',
        fprovinceid: '',
        fprovincename: '',
        fcityid: '',
        fcityname: '',
        fcountyid: '',
        fcountyname: '',
        fsourceid: '',
        fsourcename: '',
        fstageid: '',
        fstagename: '',
        fgender: '',
        fgenderText: '',
        fcustflag: '',
        fcustflagText: '',
        fage: '',
        faddress: ''
      },
      actionType: 'add',
      showTextarea: true,
      showLoss: true,
      loading: false,
      showPicker: false,
      pickerType: '',
      currentColumns: [],
      loadingText: '正在提交'
    }
  },
  onLoad(query) {
    if (query && query.id) {
      this.actionType = query.type
      this.getDetail(query.id)
    }
  },
  onShow() {
    let user = updateKey('user', this)
    if (user && this.actionType === 'update') {
      this.transferTo(user.UserId)
    }
  },
  onUnload() {
    this.initPage()
  },
  methods: {
    initPage() {
      this.actionType = 'add'
      this.loading = false
      this.showTextarea = true
      this.showLoss = true
      this.showPicker = false
      this.pickerType = ''
      this.currentColumns = []
      this.queryData = {
        fcontact: '',
        fmobile: '',
        fdescription: '',
        fprovinceid: '',
        fprovincename: '',
        fcityid: '',
        fcityname: '',
        fcountyid: '',
        fcountyname: '',
        fsourceid: '',
        fsourcename: '',
        fstageid: '',
        fstagename: '',
        fgender: '',
        fgenderText: '',
        fcustflag: '',
        fcustflagText: '',
        fage: '',
        faddress: ''
      }
    },
    async getDetail(id) {
      let params = {
        ProspectiveCustId: id
      }
      let result = await this.$http.post('/api/CrmMobile/GetCrmProspectiveCustById', params, true)
      result = this._handleData(result)
      if (result) {
        this.queryData = result
      }
    },
    _handleData(result) {
      if (result.fgender !== null || result.fgender !== undefined) {
        switch (parseInt(result.fgender)) {
          case 0:
            result.fgenderText = '女';
            break;
          case 1:
            result.fgenderText = '男';
            break;
          case 2:
            result.fgenderText = '未知';
            break;
        }
      }
      if (result.fcustflag !== null || result.fcustflag !== undefined) {
        switch (parseInt(result.fcustflag)) {
          case 0:
            result.fcustflagText = '个人客户';
            break;
          case 1:
            result.fcustflagText = '公海客户';
            break;
        }
        if (result.fstageid === 'Loss') {
          this.showLoss = false
        }
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
      try {        
        let result = await this.$http.post('/api/CrmMobile/AddCrmProspectiveCust', this.queryData)
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
      } catch (e) {
        this.loading = false
      }
    },
    validRules() {
      if (!this.queryData.fcontact || !this.queryData.fmobile || !this.queryData.fsourceid || !this.queryData.fstageid) {
        wx.showToast({ title: '信息不完善', icon: 'none'})
        return false
      }
      return true
    },
    // 获取客户来源
    async getSource() {
      let result = await this.$http.post('/api/CrmMobile/GetDataItemDetail', { EnCode: 'CrmChanceSource'})
      this.currentColumns = result.map(item => {
        return {
          text: item.Text,
          value: item.Value
        }
      })
    },
    // 获取跟进状态
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
    // 共享
    async share() {
      let params = {
        ProspectiveCustId: this.queryData.frowid,
        CustFlag: 1
      }
      let result = await this.$http.post('/api/CrmMobile/CrmProspectiveCustSetCustFlag', params, true)
      if (result) {
        wx.showToast({ title: '共享成功',duration: 800})
        setTimeout(() => {
          prevPageSetData('update', true)
          wx.navigateBack({ delta: 1})
        }, 800)
      }
    },
    // 转给按钮
    transferToBtn() {
      wx.navigateTo({ url: '/pages/customerManage/user/main'})
    },
    // 转给
    async transferTo(userId) {
      let params = {
        ProspectiveCustId: this.queryData.frowid,
        BelongId: userId
      }
      let result = await this.$http.post('/api/CrmMobile/CrmProspectiveCustSetCustBelong', params, true)
      if (result) {
        wx.showToast({ title: '转给成功',duration: 800})
        setTimeout(() => {
          prevPageSetData('update', true)
          wx.navigateBack({ delta: 1})
        }, 800)
      }
    },
    // 流失
    async loss() {
      this.queryData.fstageid = 'Loss'
      this.queryData.fstagename = '流失'
      let result = await this.$http.post('/api/CrmMobile/AddCrmProspectiveCust', this.queryData, true)
      if (result) {
        wx.showToast({ title: '流失成功',duration: 800})
        setTimeout(() => {
          prevPageSetData('update', true)
          wx.navigateBack({ delta: 1})
        }, 800)
      }
    },
    changeContact(e) {
      this.queryData.fcontact = e.mp.detail.value
    },
    changeMobile(e) {
      this.queryData.fmobile = e.mp.detail.value
    },
    changeDesc(e) {
      this.queryData.fdescription = e.mp.detail.value
    },
    changeAddress(e) {
      this.queryData.faddress = e.mp.detail.value
    },
    changeAge(e) {
      this.queryData.fage = e.mp.detail.value
    },
    changePicker(event) {
      let currentValue = event.target.value
      switch (this.pickerType) {
        case 'Custflag':
          this.queryData.fcustflag = currentValue.value
          this.queryData.fcustflagText = currentValue.text
          break;
        case 'Gender':
          this.queryData.fgender = currentValue.value
          this.queryData.fgenderText = currentValue.text
          break;
        case 'Source':
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
      }
      this.showPicker = false
    },
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
    // 选择客户来源
    choseSource() {
      if (this.actionType === 'detail') return;
      this.pickerType = 'Source'
      this.currentColumns = []
      this.showPicker = true
      this.getSource()
    },
    // 选择跟进状态
    choseStage() {
      if (this.actionType === 'detail') return;
      this.pickerType = 'Stage'
      this.currentColumns = []
      this.showPicker = true
      this.getStage()
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
  },
  watch: {
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
  .action-btn {
    margin: 10px 0 15px;
    display: flex;
    justify-content: space-around;
  }
  .commit {
    margin: 30px auto;
    width: 90%;
  }
}
</style>
