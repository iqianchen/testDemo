<template>
  <div id="payOrder">
    <div class="top_text_area">
      <van-cell-group title="客户信息">
        <van-field :value="queryData.CustomerName" required clearable label="客户姓名" placeholder="请选择客户" :border="true" use-button-slot @blur="changeFieldValue($event, 'customerName')">
          <van-button slot="button" @click="pageTojump" size="mini" type="primary">选择用户</van-button>
        </van-field>
        <van-field :value="queryData.Mobile" label="联系方式" required placeholder="请输入联系方式" data-fileds="queryData.Mobile" :border="true" @blur="changeFieldValue($event, 'mobile')"/>
        <van-field label="省份" readonly :value="queryData.ProvinceName" @click="changePickerShow('province')"  placeholder="请选择省份" is-link />
        <van-field label="城市" readonly :value="queryData.CityName" @click="changePickerShow('city')"  placeholder="请选择城市" is-link />
        <van-field label="区县" readonly :value="queryData.CountryName" @click="changePickerShow('county')"  placeholder="请选择区县" is-link />
        <van-field :value="queryData.Address" label="详细地址" data-fileds="queryData.Address" autosize @blur="changeFieldValue($event, 'address')" placeholder="请输入详细地址"
          :border="true"/>
      </van-cell-group>
    </div>

    <div id="shop_list_area">
      <div class="shop_card_part" v-for="(item, index) in shopCartList" :key="item.Id">
        <van-card
          currency="￥"
          :title="item.GoodsName"
          :thumb="item.PicPath ? item.PicPath : $setting.defaultImg"
          :num="item.Qty"
          :price="item.UnitPrice"
          :custom-class="shopCardClass"
        >
          <view slot="footer" class="card_fotter">
            <van-cell-group v-if="item.IsCustom">
              <van-field
                :value="item.AccessoryNo"
                label="配套号"
                :data-index="index"
                placeholder="请输入配套号(规则：字母+数字)"
                @blur="changeFieldValue($event, 'accessoryNo')"
              />
            </van-cell-group>
          </view>

          <view slot="desc">
            <div class="product_detail">
              <span>规格描述:</span>
              <span v-text="item.SpecDesc"></span>
            </div>
            <div class="product_detail">
              <span>品号:</span>
              <span v-text="item.GoodsCode"></span>
            </div>
          </view>
        </van-card>
      </div>
      <div class="shop-footer">
        <span>共{{shopCartList.length}}件商品，订单金额：￥{{queryData.Amt}}</span><br/>
      </div>
    </div>

    <div class="bottom_text_area">
      <van-cell-group>
        <van-field label="整单折后金额" type="number" :value="queryData.TotalAmt" @blur="changeFieldValue($event, 'amt')"  placeholder="请输入整单折后金额" />
        <van-field label="折扣(1-100)" type="number" :value="queryData.DiscountRate" @blur="changeFieldValue($event, 'discountRate')"  placeholder="请输入折扣" />
        <van-field :value="queryData.DeliveryDate" label="送货日期" placeholder="请选择送货日期" @click="showDate = true" readonly is-link :border="true"/>
        <van-field :value="queryData.TicketNo" label="商场单号" placeholder="请输入商场单号" :border="true" @blur="changeFieldValue($event, 'ticketNo')"/>
        <van-field v-if="showTextarea" type="textarea" input-class="textarea-class" :value="queryData.Remark"  @blur="changeFieldValue($event, 'remark')" label="备注" autosize placeholder="请输入备注"></van-field>
        <div class="textarea-box" v-if="!showTextarea">
          <span class="label">备注</span>
          <span class="my-textarea" v-text="queryData.Remark"></span>
        </div>
      </van-cell-group>
    </div>

    <div id="foot_nav">
      <div class="nav_parts nav_parts_1">
        <div class="parts_1_2">
          <span>合计：￥</span>
          <span class="totalMoney" v-text="queryData.TotalAmt"></span>
        </div>
      </div>
      <div class="nav_parts nav_parts_2" @click="payOrder_click">
        提交订单(
        <span v-text="shopCartList.length"></span>)
      </div>
    </div>

    <van-popup :show="showDate" position="bottom">
      <van-datetime-picker
        type="date"
        :value="currentDate"
        @confirm="dateChange"
        @cancel="showDate = false"
      />
    </van-popup>
    <van-popup :show="showPicker" position="bottom" >
      <van-picker 
        show-toolbar 
        :default-index="defaultIndex" 
        :columns="pickerData" 
        @confirm="pickerConfirm" 
        @cancel="showPicker = false"
      />
    </van-popup>
  </div>
</template>

<script>
import shopCartStore from '@js/shopCartStore';
import { updateKey } from '@js/pageValue';
export default {
  data() {
    return {
      showDate: false,      // 是否显示日期组件
      showPicker: false,    // 是否显示弹窗组件
      showTextarea: true,  // 为false时显示textarea替换文本框
      currentPicker: '',    // 记录当前显示的组件
      pickerLoadData: {},       // 用来存储弹窗数据
      pickerData: [],           // 弹窗显示的数据
      defaultIndex: 0,          // 记录弹窗选中数据的索引
      shopCartList: [],
      goodsNum: [],
      apiList: {
        getCustomerApi: '/api/CrmMobile/GetCustomer',   // 获取客户信息
        getMinDiscountApi: '/api/CrmMobile/GetMinDiscount',  // 获取最小折扣
        getAreaApi: '/api/CrmMobile/GetArea',         // 获取地区
        addSaleOrderApi: '/api/CrmMobile/AddSaleOrder',    // 添加订单
        addCustomerApi: '/api/CrmMobile/AddCustomer'       // 添加客户
      },
      currentDate: new Date().getTime(),   // 当前日期
      queryData: {
        DeliveryDate: new Date().format('yyyy-MM-dd'),
        CustomerId: '',
        CustomerCode: "",
        CustomerName: "",
        Mobile: "",
        ProvinceId: "",
        ProvinceName: "",
        CityId: "",
        CityName: "",
        CountryId: "",
        CountryName: "",
        Address: "",
        SendGdsContact:"",
        SendGdsTel: "",
        Remark: "",
        TicketNo: '',
        Amt: 0,
        TotalAmt: 0,
        DiscountRate: 100,
        Details: []
      }
    }
  },
  onLoad() {
    this.getShopCartList()
  },
  onShow() {
    let selectedCustomer = updateKey('selectedCustomer', this)
    if (selectedCustomer) this.setCustomerInfo(selectedCustomer)
  },
  methods: {
    // 获取购物车信息
    getShopCartList() {
      let list = shopCartStore.getShopCartByUser();
      let totalMoney = 0, goodsNum = [];
      let tmpList = list.filter(item => {
        if (item.selectActive) {
          totalMoney += item.Qty * item.UnitPrice;
          goodsNum.push(item.CurrentGoodsNumber);
        }
        return item.selectActive;
      });
      tmpList.forEach(item => {
        item.PicPath = item.PicPath ? item.PicPath.replace(this.$setting.regReplaceUrl, this.$setting.baseImgUrl) : this.$setting.defaultImg;
      })
      this.shopCartList = tmpList;
      this.goodsNum = goodsNum;
      this.queryData.Amt = totalMoney;
      this.queryData.TotalAmt = totalMoney * (this.queryData.DiscountRate / 100)
      // console.log('this.queryData', this.queryData)
    },
    // 字段值改变
    changeFieldValue(event, name) {
      let value = event.mp.detail.value;    // 获取修改后的值
      switch (name) {
        case 'customerName':    // 用户名称
          this.queryData.CustomerName = value;
          this.getCustomerInfo(value, 'Name');
          break;
        case 'mobile':         // 手机号码
          this.queryData.Mobile = value;
          this.getCustomerInfo(value, 'Mobile');
          break;
        case 'address':        // 地址
          this.queryData.Address = value;
          break;
        case 'amt':         // 金额
          this.changeAmt(value);
          break;
        case 'discountRate':    // 折扣
          this.changeZk(value)
          break;
        case 'accessoryNo':     // 配套号
          let _index = event.currentTarget.dataset.index;
          this.shopCartList[_index].AccessoryNo = value;
          break;
        case 'ticketNo':      // 商场单号
          this.queryData.TicketNo = value;
          break;
        case 'remark':      // 备注
          this.queryData.Remark = value;
          break;
      }
    },
    // 改变显示的弹窗组件
    changePickerShow(type) {
      switch (type) {
        case 'province':
          this.getArea('province')
          break;
        case 'city':
          if (!this.queryData.ProvinceId && !this.queryData.ProvinceName) {
            wx.showToast({
              title: '请先选择省份',
              icon: 'none'
            })
            return;
          }
          this.getArea('city')
          break; 
        case 'county':
          if (!this.queryData.CityId && !this.queryData.CityName) {
            wx.showToast({
              title: '请先选择省份',
              icon: 'none'
            })
            return;
          }
          this.getArea('county')
          break;   
      }
      this.currentPicker = type;
      this.showPicker = true;
    },
    // 获取客户信息
    async getCustomerInfo(searchKey, name) {
      let result = await this.$http.post(this.apiList.getCustomerApi, {
        PageIndex: 1,
        PageSize: 20,
        SearchKey: searchKey
      })
      if (result && result.Data.length > 0) {
        for(let i = 0; i < result.Data.length; i++) {
          let item = result.Data[i];
          if (item[name] === searchKey) {
            this.queryData.CustomerId = item.Id;
            this.queryData.CustomerName = item.Name;
            this.queryData.Mobile = item.Mobile;
            if (item.CustomerAddress && itme.CustomerAddress.length > 0) {
              this.queryData.ProvinceId = item.CustomerAddress[0].ProvinceId;
              this.queryData.ProvinceName = item.CustomerAddress[0].ProvinceName;
              this.queryData.CityId = item.CustomerAddress[0].CityId;
              this.queryData.CityName = item.CustomerAddress[0].CityName;
              this.queryData.CountryId = item.CustomerAddress[0].CountryId;
              this.queryData.CountryName = item.CustomerAddress[0].CountryName;
              this.queryData.Address = item.CustomerAddress[0].Address;
            } else {
              this.queryData.ProvinceId = '';
              this.queryData.ProvinceName = '';
              this.queryData.CityId = '';
              this.queryData.CityName = '';
              this.queryData.CountryId = '';
              this.queryData.CountryName = '';
              this.queryData.Address = '';
            }
            return;
          }
        }
      }
    },
    // 获取地区
    async getArea(type) {
      let parentId = 0;
      switch (type) {
        case 'province':
          parentId = 0;
          break;
        case 'city':
          parentId = this.queryData.ProvinceId;
          break;
        case 'county':
          parentId = this.queryData.CityId;
          break;
      }
      // 如果当前数据没有缓存，则请求数据并缓存
      if (!this.pickerLoadData[type]) {
        let params = { ParentId: parentId }
        let result = await this.$http.post(this.apiList.getAreaApi, params)

        let data = result.map((item, index) => {
          return {
            text: item.AreaName,
            value: item.AreaId
          }
        })
        this.pickerLoadData[type] = {
          defaultIndex: 0,
          data: data
        }
      }

      this.pickerData = this.pickerLoadData[type].data;
      this.defaultIndex = this.pickerLoadData[type].defaultIndex;
    },
    // 设置客户信息
    setCustomerInfo(customerData) {
      if (!customerData) return;
      this.queryData.CustomerId = customerData.Id;
      this.queryData.CustomerCode = customerData.Code;
      this.queryData.CustomerName = customerData.Name;
      this.queryData.Mobile = customerData.Mobile;
      if (customerData.CustomerAddress && customerData.CustomerAddress.length > 0) {
        // 默认第一个地址为默认地址
        let defaultAddress = customerData.CustomerAddress[0];
        this.queryData.ProvinceId = defaultAddress.ProvinceId || '';
        this.queryData.ProvinceName = defaultAddress.ProvinceName || '';
        this.queryData.CityId = defaultAddress.CityId || '';
        this.queryData.CityName = defaultAddress.CityName || '';
        this.queryData.CountryId = defaultAddress.CountryId || '';
        this.queryData.CountryName = defaultAddress.CountryName || '';
        this.queryData.Address = defaultAddress.Address || '';
        // this.queryData.SendGdsContact = defaultAddress.Contact || '';
        // this.queryData.SendGdsTel = defaultAddress.Mobile || '';
      } else {
        this.queryData.ProvinceId = '';
        this.queryData.ProvinceName = '';
        this.queryData.CityId = '';
        this.queryData.CityName = '';
        this.queryData.CountryId = '';
        this.queryData.CountryName = '';
        this.queryData.Address = '';
        // this.queryData.SendGdsContact = '';
        // this.queryData.SendGdsTel = '';
      }
    },
    //选中弹窗数据
    pickerConfirm(event) {
      let currentValue = event.target.value;
      switch (this.currentPicker) {
        case 'province':
          this.queryData.ProvinceId = currentValue.value;
          this.queryData.ProvinceName = currentValue.text;
          this.queryData.CityId = '';
          this.queryData.CityName = '';
          this.queryData.CountryId = '';
          this.queryData.CountryName = '';
          // 如果缓存了城市和区县的数据，则清空城市和区域的数据
          if (this.pickerLoadData['city']) this.pickerLoadData.city = null;
          if (this.pickerLoadData['county']) this.pickerLoadData.county = null;
          break;
        case 'city':
          this.queryData.CityId = currentValue.value;
          this.queryData.CityName = currentValue.text;
          this.queryData.CountryId = '';
          this.queryData.CountryName = '';
          // 如果缓存了区县的数据，则清空区域的数据
          if (this.pickerLoadData['county']) this.pickerLoadData.county = null;
          break;
        case 'county':
          this.queryData.CountryId = currentValue.value;
          this.queryData.CountryName = currentValue.text;
          break;
      }
      this.showPicker = false;
    },
    // 改变整单折扣金额
    changeAmt(value) {
      if (!value) return;
      let _this = this;
      let newAmt = parseFloat(value);
      let oldAmt = parseFloat(this.queryData.Amt);
      if (isNaN(newAmt)) {
        wx.showModal({
          title: '提示',
          content: '请输入数字',
          complete: () => {
            _this.queryData.TotalAmt = 0;
            _this.queryData.TotalAmt = oldAmt;
          }
        })
      } else if (newAmt > oldAmt) {
        wx.showModal({
          title: '提示',
          content: '不能大于订单金额',
          complete: () => {
            _this.queryData.TotalAmt = 0;
            _this.queryData.TotalAmt = amt;
            _this.queryData.DiscountRate = 100;
          }
        })
      } else if (newAmt < 0) {
        wx.showModal({
          title: '提示',
          content: '不能为负数',
          complete: () => {
            _this.queryData.TotalAmt = 0;
            _this.queryData.TotalAmt = amt;
            _this.queryData.DiscountRate = 100;
          }
        })
      } else {
        let discountRate = parseFloat( newAmt / parseFloat(oldAmt) * 100).toFixed(4);
        this.getMinDiscount(discountRate, newAmt, 'amt')
      }
    },
    // 改变某件商品的折扣
    changeZk(value) {
      let _this = this;
      let discount = parseFloat(value);
      let oldAmt = parseFloat(this.queryDat.DiscountRate);
      if (isNaN(discount)) {
        wx.showModal({
          title: '提示',
          content: '请输入数字',
          complete: () => {
            _this.queryData.DiscountRate = 0;
            _this.queryData.DiscountRate = 100;
          }
        })
      } else if (discount >= 1 && discount <= 100) {
        this.getMinDiscount(discount, discount, 'discount')
      } else {
        wx.showModal({
          title: '提示',
          content: '取值范围为1-100',
          complete: () => {
            _this.queryData.DiscountRate = 0;
            _this.queryData.DiscountRate = 100;
          }
        })
      }
    },
    // 开单日期修改
    dateChange(e) {
      let value = e.mp.detail;
      let date = new Date(value).format("yyyy-MM-dd");
      this.queryData.DeliveryDate = date;
      this.showDate = false;
    },
    /**
     * 获取最低折扣
     * @param {Number} discount     当前折扣
     * @param {Any} newValue        修改后的值
     * @param {String} type         类型
     */
    async getMinDiscount(discount, newValue, type) {
      let result = await this.$http.post(this.apiList.getMinDiscountApi, {
        SaleDate: new Date().format('yyyy-MM-dd')
      })
      let _this = this;
      if (discount < result) {
        wx.showModal({
          title: '提示',
          content: `不能超出最低折扣[${result}]，系统将自动取最低折扣！`,
          complete: () => {
            _this.queryData.DiscountRate = 0;
            _this.queryData.DiscountRate = result;
            _this.queryData.TotalAmt = _this.queryData.Amt * (_this.queryData.DiscountRate / 100);
          }
        })
      } else {
        let totalAmt, discountRate;
        if (type == 'amt') {
          totalAmt = parseFloat(newValue);
          discountRate = parseFloat(value / parseFloat(this.queryData.Amt) * 100);
          discountRate = discountRate == 100 ? discountRate : discountRate.toFixed(4);
        } else if (type == 'discount') {
          discountRate = parseFloat(newValue);
          totalAmt = this.queryData.Amt * (discountRate / 100);
        }
        this.queryData.TotalAmt = 0;
        this.queryData.DiscountRate = 0;
        // 由于值相同时没有实时更新，这里对值做了修改并还原
        this.queryData.TotalAmt = totalAmt;
        this.queryData.DiscountRate = discountRate;
      }
    },
    // 点击下单按钮
    payOrder_click() {
      setTimeout(() => {
        this.payOrder()
      }, 100)
    },
    // 下单
    async payOrder() {
      let result = this._verification();
      if (!result) return;

      this.queryData.Details = this.shopCartList;

      console.log('this.queryData', this.queryData)
      try {
        let res = await this.$http.post(this.apiList.addSaleOrderApi, this.queryData)
        if (res) {
          // 如果用户不存在就新增用户
          if (!this.queryData.CustomerId) this.addCustomer();
          wx.showToast({
            title: "提交订单成功",
            icon: "success",
            duration: 1500
          });
          setTimeout(() => {
            let pages = getCurrentPages()
            // 回到开单前的页面，并重新刷新数据
            let openOrder = pages[pages.length - 4]
            if (openOrder) {
              openOrder.setData({ ['reset']: true })
            }
            wx.navigateBack({ delta: 3 })
          }, 1500)
          // 下单成功后，清空购物车历史
          shopCartStore.clearShopCartByUser()
        }
      } catch (e) {
        new Error('错误详情：'+ e)
      }
    },
    // 验证
    _verification() {
      let result = true, errorMsg = '';
      if (!this.queryData.CustomerName) {
        errorMsg = '请选择客户';
        result = false;
      }
      for(let i = 0; i < this.shopCartList.length; i++) {
        let item = this.shopCartList[i];
        if (item.IsCustom && !item.AccessoryNo) {
          errorMsg = '您还有配套号为输入';
          result = false;
          break;
        }
      }
      if (result === false && errorMsg) {
        wx.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 2000
        })
      }
      return result;
    },
    // 添加客户
    async addCustomer() {
      let params = {
        Name: this.queryData.CustomerName,
        Mobile: this.queryData.Mobile,
        ProvinceId: this.queryData.ProvinceId || '',
        ProvinceName: this.queryData.ProvinceName || '',
        CityId: this.queryData.CityId || '',
        CityName: this.queryData.CityName || '',
        CountryId: this.queryData.CountryId || '',
        CountryName: this.queryData.CountryName || '',
        Address: this.queryData.Address || ''
      }
      let res = await this.$http.post(this.apiList.addCustomerApi, params)
    },
    // 页面跳转
    pageTojump() {
      wx.navigateTo({ url: '../chooseCustomer/main'})
    }
  }
}
</script>


<style lang="less">
@import '~less/base-color.less';
#payOrder {
  padding-bottom: 50px;
  background-color: @background-color;
  .card_fotter {
    text-align: left;
  }
  #shop_list_area {
    .shop_card_part {
      position: relative;
      border-bottom: 1px solid #e5e5e5;
      .checkbox_area {
        position: absolute;
        left: 0;
        top: 0;
        width: 40px;
        height: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        z-index: 1;
      }
      .shop_card_list {
        padding-top: 10px;
        padding-bottom: 10px;
      }
    }
    .shop-footer {
      font-size: 12px;
      text-align: right;
      padding: 5px 15px 8px;
      background-color: #fafafa;
      .shop-input {
        display: flex;
        margin-top: 3px;
        span:first-child {
          display: inline-block;
          width: 200px;
          margin-right: 6px;
        }
      }
    }
  }
  #foot_nav {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50px;
    border-top: 1px solid #e5e5e5;
    z-index: 99;
    .nav_parts {
      line-height: 50px;
      height: 100%;
    }
    .nav_parts_1 {
      background: white;
      position: absolute;
      left: 0;
      top: 0;
      right: 100px;
      .parts_1_2 {
        padding: 0 10px;
        font-size: 14px;
        float: left;
        .totalMoney {
          font-size: 16px;
          font-weight: bold;
          color: black;
        }
      }
    }
    .nav_parts_2 {
      background: #f44;
      color: white;
      text-align: center;
      width: 100px;
      font-size: 16px;
      position: absolute;
      top: 0;
      right: 0;
      z-index: 9;
    }
  }
  .errorMessage {
    color: #f44
  }
}
</style>