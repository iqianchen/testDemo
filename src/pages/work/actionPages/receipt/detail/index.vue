<template>
  <div id="customerDetail">
    <van-field 
      v-for="item in fieldData"
      v-if="!item.hidden"
      :key="item.key"
      :label="item.label"
      :required="item.required"
      :value="queryData[item.key]"
      :type="item.type || 'text'"
      :readonly="pageType == 'detail' || item.isPopup || item.readonly"
      :placeholder="pageType !== 'detail' ? item.placeholder : ''"
      :is-link="item.isPopup && pageType !== 'detail'"
      @blur="!item.isPopup ? changeFieldValue($event, item.key) : null"
      @click="item.isPopup ? changePickerShow(item.key) : null"
    >
    </van-field>

    <UploadImg ref="uploadImg" :readonly="pageType === 'detail'"></UploadImg>

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
import { updateKey, prevPageSetData } from '@js/pageValue';
import UploadImg from '#/UploadImg';

export default {
  components: {
    UploadImg
  },
  data() {
    return {
      pageType: 'add',      // 当前页面的编辑状态
      fieldData: [
        { label: '收款单号', key: 'ReceiptOrderNo', required: true, hidden: true },
        { label: '收款客户', key: 'CustomerName', placeholder: '请选择收款客户', required: true },
        { label: '手机', key: 'Mobile', placeholder: '根据所选客户带出手机号码', readonly: true },
        { label: '订单号', key: 'SourceNo', placeholder: '请选择订单号', isPopup: true },
        { label: '应收金额', key: 'Amt1', readonly: true },
        { label: '实收金额', key: 'Amt2', placeholder: '请输入实收金额', required: true },
        { label: '商场订单号', key: 'TicketNo', placeholder: '请输入商场订单号' },
        { label: '收款类别', key: 'CollectTypeName', placeholder: '请选择收款类别', isPopup: true },
        { label: '支付方式', key: 'PayName', placeholder: '请选择支付方式', isPopup: true, required: true },
      ],
      apiList: {
        getSaleOrderApi: '/api/CrmMobile/GetSaleOrder',           // 获取销售单据
        getCollectTypeApi: '/api/CrmMobile/GetCollectType',       // 获取收款类别
        getDetailApi: '/api/CrmMobile/GetSaleOrderById',          // 获取明细数据
        addReceiptOrderApi: '/api/CrmMobile/AddReceiptOrder',     // 添加收款单
        updateReceiptApi: '/api/CrmMobile/UpdateReceiptOrder/',   // 修改收款单
        

        // getSourceApi: '/api/CrmMobile/GetCustomerSource',     // 获取客户来源
        // getFollowStatusApi: '/api/CrmMobile/GetFollowStatus', // 获取跟进状态
        // getAreaApi: '/api/CrmMobile/GetArea',     // 获取地区
        // addCustomerApi: '/api/CrmMobile/AddCustomer',   // 新增客户
        // updateCustomerApi: '/api/CrmMobile/UpdateCustomer/',   // 修改客户
        // getCustomerApi: '/api/CrmMobile/GetCustomerById'    // 获取用户信息
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
        this.getDetailData(query.id)
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
        ReceiptOrderId: "",
        ReceiptOrderNo: "",
        ReceiptOrderDate: "",
        CustomerId: "",
        CustomerName: "",
        Mobile: "",
        Email: "",
        Address: "",
        Source: "",
        SourceId: "",
        SourceNo: "",
        Amt1: "",
        Amt2: "",
        CollectTypeId: "",
        CollectTypeName: "",
        PayId: "",
        PayName: "",
        TicketNo: '',
        AppDate: '',
        Details: []
      }
    },
    // 获取详情数据
    async getDetailData(id) {
      let params = { SaleOrderId: id }
      try {
        let result = await this.$http.post(this.apiList.getDetailApi, params, true)
        let tmpData = this._handleResponseData(result)
        this.queryData = tmpData;
      } catch(e) {
        new Error('获取用户详情数据出错，错误详情：' + e)
      }
    },
    // 处理服务器返回的数据
    _handleResponseData(result) {
      result.Amt1 = result.NoPayAmt;
      result.Amt2 = result.NoPayAmt;
      result.SourceNo = result.SaleOrderNo;
      result.SourceId = result.SaleOrderId
      return result;
    },
    // 字段值改变
    changeFieldValue(event, name) {
      let value = event.mp.detail.value;    // 获取修改后的值
      switch (name) {
        case 'Amt2':
        case 'TicketNo':
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
          case 'CustomerName':      // 客户
            // wx.navigateTo({ url: ''})
            return;
          case 'SourceNo':        // 订单号
            if (!this.queryData.CustomerName) errorMsg = '清先选择客户';
            else {
              url = this.apiList.getSaleOrderApi;
              params = {
                CustomerId: this.queryData.CustomerId,
                IsGathering: true,
                PageIndex:1,
                PageSize: 100
              }
            }
            break;
          case 'CollectTypeName':     // 收款类别
            url = this.apiList.getCollectTypeApi;
            params = { PageIndex: 1, PageSize: 100 }
            break;
          case 'PayName':    // 支付方式
            this.showPicker = true;
            let data = [
              { value: 0, text: '现金' },
              { value: 1, text: '银行存款' },
              { value: 2, text: '支付宝' },
              { value: 3, text: '微信' },
              { value: 4, text: '商场代收' },
              { value: 5, text: '门店收款' }
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
        case 'SourceNo':      // 订单号
          this.queryData.SourceId = selected.value;
          this.queryData.SourceNo = selected.text;
          break;
        case 'CollectTypeName':        // 收款类别
          this.queryData.CollectTypeId = selected.value;
          this.queryData.CollectTypeName = selected.text;
          break;
        case 'PayName':     // 支付方式
          this.queryData.PayId = selected.value;
          this.queryData.PayName = selected.text;
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
        case 'CollectTypeName':   // 收款类别
          textField = 'CollectTypeName';
          valueField = 'CollectTypeId';
          break;
        case 'SourceNo':    // 订单号
          textField = 'SaleOrderNo';
          valueField = 'Id';
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
          params.ReceiptOrderDate = new Date().format('yyyy-MM-dd')
          url = this.apiList.addReceiptOrderApi;
          method = 'post';
        } else if (this.pageType == 'update') {  // 修改
          params.AppState = '';
          url = this.apiList.updateReceiptApi + this.queryData.Id;
          method = 'put';
        }
        console.log('url', url)
        console.log('params', params)
        console.log('method', method)
        let result = await this.$http[method](url, params, method)
        if (result && result.ReceiptOrderId) {
          // 新增单据成功后图片
          let uploadResult = await this.$refs.uploadImg('GatheringFiles', result.ReceiptOrderId)
          if (uploadResult == true) {
            wx.showToast({ title: '提交成功', duration: this.$setting.toastDuration })
          }

          setTimeout(() => {
            this.submitOptions.loading = false;
            prevPageSetData('reset', true)
            wx.navigateBack({ delta: 1})
          }, this.$setting.toastDuration)
        }
        // wx.showToast({ title: '提交成功', duration: this.$setting.toastDuration })
        // setTimeout(() => {
        //   this.submitOptions.loading = false;
        //   prevPageSetData('reset', true)
        //   wx.navigateBack({ delta: 1})
        // }, this.$setting.toastDuration)
      // } catch(e) {
      //   new Error('提交数据出错，错误详情：' + e)
      // }
    },
    // 验证规则
    validRules() {
      let errorMsg = '';
      if (!this.queryData.CustomerName) errorMsg = '客户名不能为空';
      else if (!this.queryData.CollectTypeName) errorMsg = '收款类别不能为空';
      else if (!this.queryData.PayName) errorMsg = '支付方式不能为空';
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