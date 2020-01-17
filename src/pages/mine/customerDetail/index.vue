<template>
  <div id="customerDetail">
    <van-cell-group 
      v-for="(item, i) in groupData"
      custom-class="custom-cell-group"
      :key="i"
      :title="item.title"
    >
      <van-field 
        v-for="subItem in item.data"
        :key="subItem.key"
        :label="subItem.label"
        :required="item.required"
        :value="queryData[subItem.key]"
        :type="subItem.type || 'text'"
        :readonly="pageType == 'detail' || subItem.isPopup"
        :placeholder="pageType !== 'detail' ? subItem.placeholder : ''"
        :is-link="subItem.isPopup && pageType !== 'detail'"
        @blur="!subItem.isPopup ? changeFieldValue($event, subItem.key) : null"
        @click="subItem.isPopup ? changePickerShow(subItem.key) : null"
      >
      </van-field>
    </van-cell-group>

    <div class="submit-button" v-if="pageType !== 'detail'">
      <van-button
        size="large"
        type="info"
        :disabled="submitOptions.loading"
        :loading="submitOptions.loading"
        :loading-text="submitOptions.loadingText"
        @click="submit_click"
      >
        确认
      </van-button>
    </div>

    <van-popup :show="showPicker" position="bottom" >
      <van-picker 
        show-toolbar 
        :columns="pickerData" 
        :defaultIndex="pickerDefaultIndex"
        :loading="pickerLoading"
        @confirm="pickerConfirm" 
        @cancel="showPicker = false" 
      />
    </van-popup>
  </div>
</template>

<script>
import { updateKey, prevPageSetData } from '@js/pageValue'
export default {
  data() {
    return {
      pageType: 'add',      // 当前页面的编辑状态
      groupData: [{
        title: '基本信息',
        data: [
          { label: '客户名', key: 'Name', placeholder: '请输入用户名', required: true },
          { label: '手机', key: 'Mobile', placeholder: '请输入手机号', required: true }
        ]
      },{
        title: '详情',
        data: [
          { label: '年龄', key: 'Age', type: 'number', placeholder: '请输入年龄' },
          { label: '性别', key: 'GenderText', placeholder: '请选择性别', isPopup: true },
          { label: '省份', key: 'ProvinceName', placeholder: '请选择省份', isPopup: true },
          { label: '城市', key: 'CityName', placeholder: '请选择城市', isPopup: true },
          { label: '区县', key: 'CountryName', placeholder: '请选择区县', isPopup: true },
          { label: '地址', key: 'Address', placeholder: '请输入地址' },
          { label: '邮箱', key: 'Email', placeholder: '请输入邮箱' },
          { label: '客户来源', key: 'CustomerSourceName', placeholder: '请选择客户来源', isPopup: true },
          // { label: '客户介绍人', key: 'IntroduceUserName', placeholder: '请选择客户介绍人', isPopup: true },
        ]
      }],
      apiList: {
        getSourceApi: '/api/CrmMobile/GetCustomerSource',     // 获取客户来源
        getFollowStatusApi: '/api/CrmMobile/GetFollowStatus', // 获取跟进状态
        getAreaApi: '/api/CrmMobile/GetArea',     // 获取地区
        addCustomerApi: '/api/CrmMobile/AddCustomer',   // 新增客户
        updateCustomerApi: '/api/CrmMobile/UpdateCustomer/',   // 修改客户
        getCustomerApi: '/api/CrmMobile/GetCustomerById'    // 获取用户信息
      },
      submitOptions: {
        loading: false,
        loadingText: '正在提交...'
      },
      showPicker: false,        // 显示弹窗组件
      currentPicker: '',        // 记录当前显示的弹窗
      pickerLoading: false,     // 弹窗时显示loading
      pickerData: {},           // 弹窗显示的数据
      pickerLoadData: [],       // 用来存储弹窗数据
      pickerDefaultIndex: 0,    // 记录弹窗选中数据的索引
      queryData: {},
    }
  },
  onLoad(query) {
    if (query && query.type) {
      this.pageType = query.type;
      if (this.pageType == 'detail' || this.pageType == 'update') {  // 查看或修改
        this.getCustomerDetail(query.id)
      }
    }
    this._initPage()
  },
  methods: {
    // 初始化页面
    _initPage() {
      this.showPicker = false;
      this.submitOptions.loading = false;
      this.queryData = {
        Name: '',
        Mobile: '',
        Email: '',
        Address: '',
        CustomerSourceId: '',
        CustomerSourceName: '',
        IntroduceUserId: '',
        IntroduceUserName: '',
        FollowStatusId: '',
        FollowStatusName: '',
        Desc: '',
        ProvinceId: '',
        ProvinceName: '',
        CityId: '',
        CityName: '',
        CountryId: '',
        CountryName: '',
        Age: '',
        Gender: '',
        GenderText: '',
        CustomerType: '',
        CustomerTypeName: ''
      }
    },
    // 获取用户详情
    async getCustomerDetail(id) {
      let params = { CustomerId: id }
      try {
        let result = await this.$http.post(this.apiList.getCustomerApi, params, true)
        let tmpData = this._handleResponseData(result)
        this.queryData = tmpData;
      } catch(e) {
        new Error('获取用户详情数据出错，错误详情：' + e)
      }
    },
    // 处理服务器返回的数据
    _handleResponseData(result) {
      if (result.Gender) {
        switch(parseInt(result.Gender)) {
          case 0:
            result.GenderText = '女';
            break;
          case 1:
            result.GenderText = '男';
            break;
          case 2:
            result.GenderText = '未知'
            break
        }
      }
      return result;
    },
    // 字段值改变
    changeFieldValue(event, name) {
      let value = event.mp.detail.value;    // 获取修改后的值
      switch (name) {
        case 'Name':
        case 'Mobile':
        case 'Age':
        case 'Address':
        case 'Email':
          this.queryData[name] = value;
          break;
      }
    },
    // 改变显示的弹窗组件
    changePickerShow(name) {
      if (this.pageType === 'detail') return;
      this.currentPicker = name;
      if (this.pickerLoadData[name]) {    // 判断是否有缓存数据
        // console.log('this.pickerLoadData[name]', this.pickerLoadData[name])
        this.pickerDefaultIndex = this.pickerLoadData[name].defaultIndex;
        this.pickerData = this.pickerLoadData[name].data;
        this.showPicker = true;
        console.log('this.pickerDefaultIndex', this.pickerDefaultIndex)
      } else {
        // 请求数据
        let url = '', params = {}, errorMsg = '';
        switch(name) {
          case 'ProvinceName':      // 省份
            url = this.apiList.getAreaApi;
            params = { ParentId: 0 };
            break;
          case 'CityName':        // 城市
            if (!this.queryData.ProvinceId) errorMsg = '清先选择省份';
            else {
              url = this.apiList.getAreaApi;
              params = { ParentId: this.queryData.ProvinceId }
            }
            break;
          case 'CountryName':     // 区县
            if (!this.queryData.CityId) errorMsg = '清先选择城市';
            else {
              url = this.apiList.getAreaApi;
              params = { ParentId: this.queryData.CityId }
            }
            break;
          case 'CustomerSourceName':    // 客户来源
            url = this.apiList.getSourceApi;
            params = { PageIndex: 1, PageSize: 200 }
            break;
          case 'GenderText':      // 性别
            this.showPicker = true;
            let data = [
              { value: 0, text: '女'},
              { value: 1, text: '男'},
              { value: 2, text: '未知'}
            ]
            this.pickerData = data;
            this.pickerLoadData[name] = {
              defaultIndex: 0,
              data: data
            }
            return;
        }
        if (errorMsg) { // 显示错误信息
          wx.showToast({
            title: errorMsg,
            icon: 'none'
          })
          return;
        }

        this.showPicker = true;
        this.getPickerData(url, name, params)
      }
    },
    // 选中弹窗数据
    pickerConfirm(event) {
      let selected = event.target.value;
      let _index = event.target.index;
      // 存储选中的索引
      if (this.pickerLoadData[this.currentPicker]) {
        this.pickerLoadData[this.currentPicker].defaultIndex = _index;
      }

      switch (this.currentPicker) {
        case 'ProvinceName':      // 省份
          this.queryData.ProvinceId = selected.value;
          this.queryData.ProvinceName = selected.text;
          // 将城市和区县内容清空
          this.queryData.CityId = '';
          this.queryData.CityName = '';
          this.queryData.CountryId = '';
          this.queryData.CountryName = '';
          this.pickerLoadData.CityName = null;
          this.pickerLoadData.CountryName = null;
          break;
        case 'CityName':        // 城市
          this.queryData.CityId = selected.value;
          this.queryData.CityName = selected.text;
          this.queryData.CountryId = '';
          this.queryData.CountryName = '';
          this.pickerLoadData.CountryName = null;
          break;
        case 'CountryName':     // 区县
          this.queryData.CountryId = selected.value;
          this.queryData.CountryName = selected.text;
          break;
        case 'CustomerSourceName':    // 客户来源
          this.queryData.CustomerSourceId = selected.value;
          this.queryData.CustomerSourceName = selected.text;
          break;
        case 'GenderText':    // 性别
          this.queryData.Gender = selected.value;
          this.queryData.GenderText = selected.text;
          break;
      }
      this.showPicker = false;
    },
    // 获取弹窗显示的数据
    async getPickerData(url, name, params = {}) {
      this.pickerLoading = true;
      try {
        let result = await this.$http.post(url, params)
        let tmpData = this._handlePickerData(result, name);
        this.pickerLoading = false;
        this.pickerData = tmpData;
        this.pickerLoadData[name] = {
          defaultIndex: 0,
          data: tmpData
        };
      } catch(e) {
        this.pickerData = [];
        this.pickerLoading = false;
        new Error('请求弹窗数据出错，错误详情：'+ e)
      }
    },
    // 处理弹窗数据
    _handlePickerData(result, name) {
      if (!result) return [];
      let serverData = [], tmpData = [], textField = '', valueField = '';
      // 服务器返回的数据有返回字段Data，则取Data里的数据,否则直接取返回的数据
      if (Array.isArray(result)) serverData = result;
      else serverData = result.Data;
      switch (name) {
        case 'ProvinceName':
        case 'CityName':
        case 'CountryName':
          textField = 'AreaName';
          valueField = 'AreaId';
          break;
        case 'CustomerSourceName':    // 客户来源
          textField = 'Text';
          valueField = 'Value';
          break;
      }
      tmpData = serverData.map(item => {
        return {
          text: item[textField],
          value: item[valueField]
        }
      })
      return tmpData;
    },
    // 点击提交
    submit_click() {
      setTimeout(() => {   // 等待blur事件完成
        this.submit()
      }, 100)
    },
    // 提交
    async submit() {
      if (this.submitOptions.loading || !this.validRules()) return;
      this.submitOptions.loading = true;
      // try {
        let url = '', params = this.queryData, method = '';
        if (this.pageType == 'add') {   // 新增
          url = this.apiList.addCustomerApi;
          method = 'post';
        } else if (this.pageType == 'update') {  // 修改
          url = this.apiList.updateCustomerApi + this.queryData.Id;
          method = 'put';
        }
        // console.log('url', url)
        // console.log('params', params)
        // console.log('method', method)
        let result = await this.$http[method](url, params, method)
        wx.showToast({ title: '提交成功', duration: this.$setting.toastDuration })
        setTimeout(() => {
          this.submitOptions.loading = false;
          prevPageSetData('reset', true)
          wx.navigateBack({ delta: 1})
        }, this.$setting.toastDuration)
      // } catch(e) {
      //   new Error('提交数据出错，错误详情：' + e)
      // }
    },
    // 验证规则
    validRules() {
      let errorMsg = '';
      if (!this.queryData.Name) errorMsg = '客户名不能为空';
      if (!this.queryData.Mobile) errorMsg = '手机号不能为空';
      if (errorMsg) {
        wx.showToast({
          title: errorMsg,
          icon: none
        })
        return false;
      }
      return true;
    }
  }
}
</script>