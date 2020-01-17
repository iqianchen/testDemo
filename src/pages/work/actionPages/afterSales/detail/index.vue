<template>
  <div id="afterSalesDetail">
    <van-cell-group custom-class="custom-cell-group" title="基本信息">
      <van-field required readonly label="客户" @click="choseCustomers" :value="queryData.CustomerName" :placeholder="actionType !== 'detail' ? '请选择客户' : ''" :is-link="actionType !== 'detail'"/>
      <van-field required label="手机" @blur="changeMobile" :readonly="actionType == 'detail'" :value="queryData.Mobile" :placeholder="actionType !== 'detail' ? '请输入手机号' : ''" />
      <van-field label="省份" readonly @click="selectedProvince" :value="queryData.ProvinceName" :placeholder="actionType !== 'detail' ? '请选择省份' : ''" :is-link="actionType !== 'detail'" />
      <van-field label="城市" readonly @click="selecteCity" :value="queryData.CityName" :placeholder="actionType !== 'detail' ? '请选择城市' : ''"  :is-link="actionType !== 'detail'"/>
      <van-field label="区县" readonly @click="selecteCounty" :value="queryData.CountryName" :placeholder="actionType !== 'detail' ? '请选择区县' : ''" :is-link="actionType !== 'detail'" />
      <van-field label="地址" @blur="changeAddress" :value="queryData.Address" :placeholder="actionType !== 'detail' ? '请输入地址' : ''" />
    </van-cell-group>
    
    <van-cell-group custom-class="custom-cell-group" title="需求信息">
      <van-field label="客户诉求" readonly @click="choseAppeal" :value="queryData.AppealText" :placeholder="actionType !== 'detail' ? '请选择客户诉求' : ''" :is-link="actionType !== 'detail'" />
      <van-field label="发起日期" required readonly @click="choseAcceptDate" :value="queryData.AcceptDate" :placeholder="actionType !== 'detail' ? '请选择发起日期' : ''" :is-link="actionType !== 'detail'" />
      <van-field label="要求完成日期" required readonly @click="choseRequireDate" :value="queryData.RequireDate" :placeholder="actionType !== 'detail' ? '请选择要求完成日期' : ''" :is-link="actionType !== 'detail'" />
    </van-cell-group>

    <van-cell-group custom-class="custom-cell-group" title="选择商品">
      <van-cell title="销货单号" :value="queryData.SaleOrderNo" @click="choseOrderId" :is-link="actionType !== 'detail'" />
      <van-cell title="添加商品" @click="choseProduct" :is-link="actionType !== 'detail'" />
      <van-checkbox-group :value="selectedGoods">
        <div class="goodsItem" v-for="(item, index) in goodsData" :key="item.Id" @click="choseGoods(item.GoodsId)">
          <van-checkbox :name="item.GoodsId">
          <div class="goods-content">
            <div class="goods-image">
              <img :src="item.PicPath || '/static/images/default.jpg'" alt="">
            </div>
            <div class="goods-desc">
              <div class="title" v-text="item.GoodsName"></div>
              <div class="goods-line">
                <span>规格描述:</span>
                <span v-text="item.SpecDesc || ''"></span>
              </div>
              <div class="goods-line">
                <span>数量:</span>
                <span v-text="item.Qty || ''"></span>
              </div>
              <div class="goods-line">
                <span>单价:</span>
                <span v-text="item.Amt || ''"></span>
              </div>
              <div class="goods-line">
                <span>折扣:</span>
                <span v-text="item.Discount ? item.Discount+'%' : '100%'"></span>
              </div>
              <div class="goods-line">
                <span>成交金额:</span>
                <span v-text="item.UnitPrice || ''"></span>
              </div>
            </div>
          </div>
          </van-checkbox>
        </div>
      </van-checkbox-group>
    </van-cell-group>

    <van-cell-group custom-class="custom-cell-group" title="问题">
      <van-field input-class="textarea-class" v-if="showTextarea" :readonly="actionType == 'detail'" @blur="changeProblemDesc" required label="问题描述" type="textarea" autosize :value="queryData.ProblemDesc" :placeholder="actionType !== 'detail' ? '请输入描述信息' : ''" />
      <div class="textarea-box" v-if="!showTextarea">
        <span class="label">问题描述</span>
        <span class="my-textarea" v-text="queryData.ProblemDesc || ''"></span>
      </div>
      <van-field input-class="textarea-class" v-if="showTextarea" :readonly="actionType == 'detail'" @blur="changeAppealDesc" required label="客户诉求说明" type="textarea" autosize :value="queryData.AppealDesc" :placeholder="actionType !== 'detail' ? '请输入客户诉求' : ''" />
      <div class="textarea-box" v-if="!showTextarea">
        <span class="label">客户诉求说明</span>
        <span class="my-textarea" v-text="queryData.AppealDesc || ''"></span>
      </div>
    </van-cell-group>

    <div class="upLoad">
      <div class="title">
        <span>图片上传</span>
        <span>{{imagesCount}}/4</span>
      </div>
      <div class="images">
        <div @click="previewImage(item)" class="image box-item" v-for="(item,index) in files" :style="{backgroundImage: 'url('+item.path+')'}" :key="index">
          <span class="icon" @click.stop="cancelImage(index)" v-if="actionType !== 'detail'">
            <span class="iconfont icon-guanbi"></span>
          </span>
        </div>
        <div class="addImage box-item" @click="chooseImage"  v-if="imagesCount < 4 && actionType !== 'detail'">
          <span class="iconfont icon-mn_shangchuantupian"></span>
        </div>
      </div>
    </div>
    
    <div class="button-group">
      <van-button size="large" v-if="actionType !== 'detail'"  type="info" @click="submit" :disabled="loading" :loading="loading" :loading-text="loadingText">提交</van-button>
      <van-button size="large" v-if="actionType === 'detail' && !queryData.AppDate && permission.approve" type="primary" @click="approveAction('Approve')" :loading="loading" :disabled="loading" :loading-text="loadingText">审核</van-button>
      <van-button size="large" v-if="actionType === 'detail' && queryData.AppDate && permission.unApprove" type="danger" @click="approveAction('UnApprove')" :loading="loading" :disabled="loading" :loading-text="loadingText">反审核</van-button>
    </div>

    <van-popup :show="showDate" position="bottom" >
      <van-datetime-picker type="date" :value="currentDate" @confirm="changeDate" @cancel="showDate = false" />
    </van-popup> 
    <van-popup :show="showPicker" position="bottom" >
      <van-picker show-toolbar :columns="currentColumns" @confirm="changePicker" @cancel="showPicker = false" />
    </van-popup>

    <van-popup :show="showImage" @close="showImage = false">
      <div class="preview">
        <image @click="showImage = false" class="img" :src="currentImage" mode="widthFix"></image>
      </div>
    </van-popup>
  </div>
</template>

<script>
/* eslint-disable */
import dateFormula from '@js/dateFormula.js'
import { Setting } from '@/config/setting.js'
import { updateKey, prevPageSetData } from '@js/pageValue'
export default {
  name: 'afterSalesDetail',
  data () {
    return {
      files: [],
      showImage: false,
      imagesCount: 0,
      currentImage: '',
      queryData: {
        ServiceOrderDate: '',     // 服务单日期
        CustomerId: '',
        CustomerName: '',
        Mobile: '',
        ProvinceId: '',
        ProvinceName: '',
        CityId: '',
        CityName: '',
        CountryId: '',
        CountryName: '',
        Address: '',
        SendGdsContact: '',
        SendGdsTel: '',
        Appeal: '',       // 客户诉求
        AppealText: '',
        AcceptDate: '',   // 发起日期
        RequireDate: '',  // 要求完成日期
        ProblemDesc: '',  // 问题描述
        AppealDesc: '',   // 客户诉求说明
        Remark: '',       // 备注
        Details: [],
        Pic: [],
        AttachFiles: '',
        AppDate: '',
        ProcessDetails: []
      },
      actionType: 'add',
      showDate: false,
      showPicker: false,
      currentColumns: [],
      currentPicker: '',
      currentDate: new Date().getTime(),
      goodsData: [],
      loading: false,
      loadingText: '正在提交...',
      dataType: '',
      selectedGoods: [],
      showTextarea: true,
      isChooseImage: false,
      goodsDetails: [],
      permission: {}
    }
  },
  mounted() {
  },
  onLoad (query) {
    if (query && query.type) {
      this.actionType = query.type
      this.getSalesOrder(query.id)
      if (query.type === 'detail') {
        this.permission = JSON.parse(query.permission) || {}
      }
    } else {
      this.actionType = 'add'
      this.initPage()
    }
  },
  onUnload () {
    this.initPage()
  },
  onShow () {
    let customer = updateKey('customer', this)
    let saleOrder = updateKey('saleOrder', this)
    let goodsItem = updateKey('goodsItem', this)

    if (customer) {  
      this.queryData.CustomerId = customer.Id
      this.queryData.CustomerName = customer.Name
      this.queryData.Mobile = customer.Mobile
      if (customer.CustomerAddress && customer.CustomerAddress.length > 0) {
        // 默认第一个地址为默认地址
        let defaultAddress = customer.CustomerAddress[0]
        this.queryData.ProvinceId = defaultAddress.ProvinceId || ''
        this.queryData.ProvinceName = defaultAddress.ProvinceName || ''
        this.queryData.CityId = defaultAddress.CityId || ''
        this.queryData.CityName = defaultAddress.CityName || ''
        this.queryData.CountryId = defaultAddress.CountryId || ''
        this.queryData.CountryName = defaultAddress.CountryName || ''
        this.queryData.Address = defaultAddress.Address || ''
        this.queryData.SendGdsContact = defaultAddress.Contact || ''
        this.queryData.SendGdsTel = defaultAddress.Mobile || ''
      } else {
        this.queryData.ProvinceId = ''
        this.queryData.ProvinceName = ''
        this.queryData.CityId = ''
        this.queryData.CityName = ''
        this.queryData.CountryId = ''
        this.queryData.CountryName = ''
        this.queryData.Address = ''
        this.queryData.SendGdsContact = ''
        this.queryData.SendGdsTel = ''
      }
    }
    if (saleOrder) {
      this.queryData.SaleOrderId = saleOrder.SaleOrderId
      this.queryData.SaleOrderNo = saleOrder.SaleOrderNo    
      this.goodsData = saleOrder.Details || []
      if (!this.isChooseImage) {
        this.selectedGoods = []
      }
    }
    if (goodsItem) {
      goodsItem.GoodsId = goodsItem.Id
      if (!this.goodsData) this.goodsData = []
      if (this.goodsData.length == 0) this.goodsData.push(goodsItem)
      let exist = false
      this.goodsData.map(item => {
        if (item.GoodsId == goodsItem.Id) {
          exist = true
        }
      })
      if (!exist) this.goodsData.push(goodsItem)
    }
  },
  methods: {          
    // 初始化页面
    initPage () {
      let currentDateTime = dateFormula.format(new Date(), 'yyyy-MM-dd')
      this.actionType = 'add'
      this.showDate = false
      this.showPicker = false
      this.loading = false
      this.showTextarea = true
      this.currentColumns = []
      this.goodsData = []
      this.currentPicker = ''
      this.currentDate = new Date().getTime()
      this.files = []
      this.showImage = false
      this.selectedGoods = []
      this.imagesCount = 0
      this.currentImage = ''
      this.goodsDetails = []
      this.permission = {}
      this.queryData = {
        ServiceOrderDate: currentDateTime,     // 服务单日期
        CustomerId: '',
        CustomerName: '',
        Mobile: '',
        Email: '',
        Address: '',
        Appeal: '',                    // 客户诉求
        AppealText: '',
        AcceptDate: currentDateTime,   // 发起日期
        RequireDate: '',  // 要求完成日期
        ProblemDesc: '',               // 问题描述
        AppealDesc: '',                // 客户诉求说明
        Remark: '',                    // 备注
        AppDate: '',
        Details: [],
        Pic: [],
        ProcessDetails: []
      }
    },
    async getSalesOrder (ServiceOrderId) {
      let params = {
        ServiceOrderId: ServiceOrderId
      }
      let result = await this.$http.post('/api/CrmMobile/GetServiceOrderById', params, true)
      result = this._handleData(result)
      this.queryData = result
      this.goodsDetails = result.Details
      this.goodsData = this.queryData.Details
    },
    // 处理数据
    _handleData(result) {
      if (result.AttachFiles) {
        let arr = result.AttachFiles ? result.AttachFiles.split('|') : []
        result.AttachPath = result.AttachPath.replace(/http:\/\/192\.168\.3\.30:8066/, this.$baseImgUrl)
        arr.forEach(item => {
          if (item.indexOf('.png') !== -1 || item.indexOf('.jpeg') !== -1 || item.indexOf('.jpg') !== -1 || item.indexOf('.bmp') !== -1) {
            this.files.push({
              name: item,
              path: `${result.AttachPath}${result.Id}/${item}`
            })
          }
        })
        this.imagesCount = this.files.length
      }
      if (result.Appeal) {
        switch (result.Appeal) {
          case '0':
            result.AppealText = '换货';
            break;
          case '1':
            result.AppealText = '维修';
            break;
          case '2':
            result.AppealText = '退货';
            break;
        }
      }
      if (result.AcceptDate) result.AcceptDate = result.AcceptDate.split('T')[0]
      if (result.RequireDate) result.RequireDate = result.RequireDate.split('T')[0]
      if (result.Details && result.Details.length > 0) {
        result.Details.forEach(item => {
          this.selectedGoods.push(item.GoodsId)
        })
      }
      return result
    },
    // 获取地址
    async getArea(ParentId) {
      // 不传ParentId为获取省份,传ParentId为获取城市或区县
      let params = {
        ParentId: ParentId || 0
      }
      let result = await this.$http.post('/api/CrmMobile/GetArea', params)
      if (result) {
        this.currentColumns = result.map((item,index) =>{
          // this.defaultIndex = parseInt(index)
          return {
            text: item.AreaName,
            value: item.AreaId
          }
        })
        switch (this.currentPicker) {
          case 'province':
            this.Province = result
            break;
          case 'city':
            this.City = result
            break;
          case 'county':
            this.County = result
            break;
        }
      }
    },
    async approveAction(ApproveMethod) {
      if (this.loading) return
      this.loading = true
      let params = {
        ServiceOrderId: this.queryData.ServiceOrderId,
        ApproveMethod: ApproveMethod
      }
      try {
        this.$http.post('/api/CrmMobile/ApproveServiceOrder', params)
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
    // 选择商品
    choseGoods (GoodsId) {
      let strIndex = GoodsId + ''
      let result = this.selectedGoods.indexOf(strIndex)
      if (result == -1) {
        this.selectedGoods.push(strIndex)
      } else {
        this.selectedGoods.splice(result, 1)
      }
    },
    submit() {
      setTimeout(() => {
        this.commit()
      }, 200)
    },
    // 提交数据
    async commit () {
      // 验证
      if (!this.validRules() || this.loading) return
      let str = ''
      this.files.map(item => {
        str += item.name + '|'
      })
      this.queryData.AttachFiles = str.substr(0,str.length-1)
      let result;
      this.loading = true

      this.queryData.Details = []
      this.selectedGoods.forEach( item => {
        this.goodsData.forEach(val => {
          if (val.GoodsId === item) {
            this.queryData.Details.push({
              GoodsId: val.GoodsId,
              GoodsCode: val.GoodsCode || '',
              GoodsName: val.GoodsName || '',
              SpecDesc: val.SpecDesc || '',
              Qty: val.Qty || '',
              UnitPrice: val.UnitPrice || '',
              Discount: val.Discount || '',
              Amt: val.Amt || ''
            })
          }
        })
      })
      this.queryData.ServiceOrderDate = dateFormula.format(new Date(), 'yyyy-MM-dd')
      if (this.actionType == 'add') {
        result = await this.$http.post('/api/CrmMobile/AddServiceOrder', this.queryData)
      } else if (this.actionType == 'update') {

        this.goodsDetails.forEach(item => {
          if (this.selectedGoods.indexOf(item.GoodsId) == -1) {
            item.IsDelete = true
            this.queryData.Details.push(item)
          } else {
            this.queryData.Details.forEach(value => {
              if (value.GoodsId == item.GoodsId) {
                value.ServiceDetailId = item.GoodsId
              }
            })
          }
        })
        result = await this.$http.put('/api/CrmMobile/UpdateServiceOrder/'+this.queryData.Id, this.queryData)
      }
      let hasImage = false
      // 判断是否有新的图片上传
      this.files.forEach(item => {
        if (item.base64) hasImage = true
      })
      if (!hasImage) {
        this.loading = false
        wx.showToast({ title: '提交成功', duration: 800})
        setTimeout(()=>{
          prevPageSetData('update', true)
          wx.navigateBack({ delta: 1})
        }, 800)
      } else if (result.ServiceOrderId) {
        this.uploadImg(result.ServiceOrderId, 0)
      }
      this.loading = false
    },
    // 上传图片
    async uploadImg(ServiceOrderId, index) {
      if (index > this.files.length - 1) {
        wx.showToast({ title: '提交成功', duration: 800})
        setTimeout(()=>{
          prevPageSetData('update', true)
          wx.navigateBack({ delta: 1})
        }, 800)
        return
      }
      let item = this.files[index]
      if (!item.base64) {
        this.uploadImg(ServiceOrderId, index+1)
        return
      }
      let params = {
        KeyType: 'ServiceFiles',
        KeyName: ServiceOrderId,
        KeyValue: item.name,
        FileData: item.base64
      }
      let result = await this.$http.post('/api/CrmMobile/CrmFileUplad', params)
      if (result) {
        this.uploadImg(ServiceOrderId, index+1)
      } else {
        wx.showToast({ title: '图片上传失败', icon: 'none'})
      }
    },

    // 验证规则
    validRules () {
      if (!this.queryData.CustomerName || !this.queryData.Mobile || !this.queryData.AcceptDate || !this.queryData.RequireDate || !this.queryData.ProblemDesc) {
        wx.showToast({
          title: '信息不完善',
          icon: 'none'
        })
        return false
      }
      return true
    },
    // 改变日期
    changeDate (event) {
      let stringDate = dateFormula.format(new Date(event.mp.detail), 'yyyy-MM-dd')
      switch (this.dataType) {
        case 'acceptDate':
          this.queryData.AcceptDate = stringDate
          break;
        case 'requireDate':
          this.queryData.RequireDate = stringDate
          break;
      }
      this.showDate = false
    },
    _getExtension(path) {
      let _type = '';
      let parts = path.split('.');
      if (path.lastIndexOf('.') >= 0) {
        _type = parts.slice(-1)[0]
      }
      return _type
    },
    // 图片预览
    previewImage(item) {
      this.showImage = true
      this.currentImage = item.path
    },
    // 选择要上传的图片
    chooseImage () {
      if (this.actionType === 'detail') return
      this.isChooseImage = true
      let _this = this
      wx.chooseImage({
        count: 1,
        success(res) {
          let ext, filePath = res.tempFilePaths[0], file = res.tempFiles[0]
          ext = _this._getExtension(filePath).toLowerCase()
          if (!(ext in { png: 1, jpeg: 1, jpg: 1, bmp: 1 })) {
            return wx.showModel({
              title: '出错了',
              content: '只允许上传png,jpeg,jpg,bmp文件'
            })
          } else if (file.size / 1024 > 4096) {
            return wx.showModel({ title: '出错了', content: '图片文件不能超过4M'})
          } else {       
            wx.getFileSystemManager().readFile({
              filePath: filePath,
              encoding: 'base64',
              success: result => {
                let base64 = result.data
                let timestamp = Date.parse(new Date())
                let fileName = (timestamp / 1000) + '.' + ext
                let img = {
                  name: fileName,
                  path: filePath,
                  base64: base64
                }
                _this.files.push(img)
                _this.imagesCount = _this.files.length
              }
            })
          }
        },
        complete() {
          setTimeout(() => {
            _this.isChooseImage = false
          }, 500)
        }
      })
    },
    // 取消图片
    cancelImage (index) {
      this.files.splice(index, 1)
      this.imagesCount = this.files.length
    },
    // 选择客户
    choseCustomers () {
      if (this.actionType === 'detail') return
      wx.navigateTo({url: '/pages/customerManage/customer/main?type=choseCustomer'})
    },
    // 选择销货单号
    choseOrderId () {
      if (this.actionType === 'detail') return
      wx.navigateTo({url: '../saleOrder/main?type=choseSaleOrder&customerId='+this.queryData.CustomerId})
    },
    // 选择商品
    choseProduct () {
      if (this.actionType === 'detail') return
      wx.navigateTo({url: '../choseProduct/main'})
    },
    // 选择客户诉求
    choseAppeal () {
      if (this.actionType === 'detail') return
      this.currentColumns = [
        { text: '换货', value: 0 },
        { text: '维修', value: 1 },
        { text: '退货', value: 2 }
      ]
      this.currentPicker = 'appeal'
      this.showPicker = true
    },
    // 选择售理日期
    choseAcceptDate () {
      if (this.actionType === 'detail') return
      this.dataType = 'acceptDate'
      this.showDate = true
    },
    // 选择要求完成日期
    choseRequireDate () {
      if (this.actionType === 'detail') return
      this.dataType = 'requireDate'
      this.showDate = true
    },
    // 选择省份
    selectedProvince() {
      if (this.actionType === 'detail') return
      this.currentPicker = 'province'
      this.getArea()
      this.showPicker = true
    },
    // 选择城市
    selecteCity() {
      if (this.actionType === 'detail') return
      if (!this.queryData.ProvinceId && !this.queryData.ProvinceName) {
        wx.showToast({
          title: '请先选择省份',
          icon: 'none'
        })
        return
      }
      this.currentPicker = 'city'
      this.getArea(this.queryData.ProvinceId)
      this.showPicker = true
    },
    // 选择区县
    selecteCounty() {
      if (this.actionType === 'detail') return
      if (!this.queryData.CityId && !this.queryData.CityName) {
        wx.showToast({
          title: '请先选择城市',
          icon: 'none'
        })
        return
      }
      this.currentPicker = 'county'
      this.getArea(this.queryData.CityId)
      this.showPicker = true
    },
    // 改变弹出框的内容
    changePicker (event) {
      let currentValue = event.target.value
      switch (this.currentPicker) {
        case 'appeal':
          this.queryData.AppealText = currentValue.text
          this.queryData.Appeal = currentValue.value
          break;
        case 'province':
          this.queryData.ProvinceName = currentValue.text
          this.queryData.ProvinceId = currentValue.value
          break;
        case 'city':
          this.queryData.CityName = currentValue.text
          this.queryData.CityId = currentValue.value
          break;
        case 'county':
          this.queryData.CountryName = currentValue.text
          this.queryData.CountryId = currentValue.value
          break;
      }
      this.showPicker = false
    },
    changeMobile (event) {
      this.queryData.Mobile = event.mp.detail.value
    },
    changeAddress (event) {
      this.queryData.Address = event.mp.detail.value
    },
    changeProblemDesc (event) {
      this.queryData.ProblemDesc = event.mp.detail.value
    },
    changeAppealDesc (event) {
      this.queryData.AppealDesc = event.mp.detail.value
    },
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
    },
    showImage(val) {
      setTimeout(() => {
        this.showTextarea = !val
      },200)
    }
  }
}
</script>

<style lang="less">
#afterSalesDetail {
  background-color: #f2f3f5;
  .goodsItem {
    padding: 10px;
    .goods-content {
      margin-left: 10px;
      display: flex;
      align-items: center;
      .goods-image {
        width: 90px;
        height: 90px;
        img {
          width: 100%;
          max-height: 90px;
          max-width: 90px;
        }
      }
      .goods-desc {
        flex: 1;
        margin-left: 15px;
        font-size: 12px;
        .title {
          font-weight: 700;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
        }
        .goods-line {
          line-height: 18px;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }
      }
    }

  }

  .upLoad {
    background-color: #fff;
    padding: 15px;
    margin-top: 6px;
    .title {
      display: flex;
      font-size: 14px;
      justify-content: space-between;
      color: #888;
    }
    .images {
      margin-top: 15px;
      display: flex;
      flex-wrap: wrap;
      box-sizing: border-box;
      .box-item {
        margin-right: 10px;
        box-sizing: border-box;
        width: 78px;
        height: 78px;
        &:last-child {
          margin-right: 0px;
        }
      }
      .image {
        position: relative;
        background-size:cover;
        background-position:center;
        background-repeat:no-repeat;
        .icon {
          position: absolute;
          background-color:rgba(0, 0, 0, 0.5);
          padding: 3px 6px;
          color: #fff;
          top: 0;
          right: 0;
          .iconfont {
            font-size: 18px;
          }
        }
      }
      .addImage {
        border: 2px solid #ccc;
        display: flex;
        color: #ccc;
        align-items: center;
        justify-content: center;
        .iconfont {
          font-size: 36px;
        }
      }
    }
  }
  .preview {
    width: 375px;
    .img {
      width: 100%;
    }
  }

  .van-checkbox {
    display: flex;
    align-items: center;
  }
}

</style>

<style>
#afterSalesDetail .popup {
  z-index: 10;
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
}
</style>

