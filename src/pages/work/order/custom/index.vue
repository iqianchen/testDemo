<template>
  <div class="custom">
    <div class="product_area">
      <van-card
        currency="￥"
        :title="goodsInfo.GoodsName"
        :thumb="goodsInfo.PicPath || $setting.defaultImg"
        :price="goodsInfo.StandardUnitPrice"
      >
        <view slot="desc">
          <div class="product_detail">
            <span>规格描述:</span>
            <span v-text="goodsInfo.SpecDesc ? goodsInfo.SpecDesc : ''"></span>
          </div>
          <div class="product_detail">
            <span>品号:</span>
            <span v-text="goodsInfo.GoodsCode"></span>
          </div>
        </view>
        <view slot="footer">
          <div class="total_price">
            <span>合计：￥</span>
            <span v-text="goodsInfo.Amt || 0"></span>
          </div>
          <van-stepper :value="goodsInfo.Qty" @change="numComputed"/>
        </view>
      </van-card>
    </div>

    <div class="content_area">
      <van-cell-group>
        <van-field
          clearable
          :label="item.PartName"
          placeholder="请选择部件"
          :value="item.selectName"
          readonly
          @click="getPartsInfo(item, index)"
          v-for="(item, index) in goodsPartsInfo"
          :key="item.PartId"
          is-link
        >
        </van-field>
      </van-cell-group>
      <van-cell-group>
        <van-field 
          autosize 
          label="备注" 
          type="textarea" 
          v-if="showTextarea" 
          placeholder="请输入备注"
          input-class="textarea-class" 
          :value="goodsInfo.CustomDesc"  
          @blur="changDesc" 
        >
        </van-field>
        <div class="textarea-box" v-if="!showTextarea">
          <span class="label">备注</span>
          <span class="my-textarea" v-text="goodsInfo.CustomDesc"></span>
        </div>
      </van-cell-group>
    </div>

    <van-button custom-class="add_btn" type="primary" @click="addShopCard">加入购物车</van-button>
  </div>
</template>

<script>
import { updateKey } from "@js/pageValue";
import handleGoodsData from '@js/handleGoodsData.js';
import ShopCartStore from '@js/shopCartStore';
export default {
  data() {
    return {
      show: false,
      apiList: {
        getCurrentGoodApi: "/api/CrmMobile/GetProductById",
        getSelableApi: "/api/CrmMobile/GetSelableParts",
        getCurrentPartList: "/api/CrmMobile/GetSelableRng",
        getGoodsUpApi: "/api/CrmMobile/GetGoodsUp"
      },
      goodsInfo: {
        GoodsName: '',
        GoodsCode: '',
        PicPath: '',
        SpecDesc: '',
        StandardUnitPrice: '',
        Id: '',
        Qty: null,
        Amt: 0,
        CustomDesc: ''
      },
      goodsPartsInfo: [],
      RadioList: [],
      salAsmUp: [],
      popIndex: -1,
      queryData: {
        GoodsId: "",
        PageIndex: 1,
        PageSize: 20
      },
      SelableParts: [],
      showTextarea: true,
      computedParams: {
        SelablePtsRng: []
      }
    }
  },
  onShow() {
    let selectId = updateKey('selected', this)
    if (selectId) {
      this.goodsPartsInfo[selected.index].parts = selected.data
      this.goodsPartsInfo[selected.index].selectId = selected.data.ColorId;
      this.goodsPartsInfo[selected.index].selectName = selected.data.ColorName;
      this.redirectSpecDesc()
      let partsInfo = selected.data;
      // 如果已有选中部件则替换，没有则保存
      let currentPart = this.goodsPartsInfo.filter(item => {
        return item.PartId == selected.PartId
      })
      currentPart = currentPart[0]
      this.SelableParts.forEach(item => {
        if (item.PartId == currentPart.PartId) {
          item.CustomType = currentPart.CustomType
          item.PartCode = currentPart.PartCode
          item.PartName = currentPart.PartName
          item.ColorId = partsInfo.ColorId
          item.ColorCode = partsInfo.ColorCode
          item.ColorName = partsInfo.ColorName
          item.ColorPic = partsInfo.ColorPic
          this.salAsmUp.map(val => {
            if (this.queryData.GoodsId == val.GoodsId && val.SelablePtId == item.PartId && (val.ClrId == item.ColorId || val.ReviseSizeId == item.ColorId)) {
              item.SaleUp = val.StdSaleUp
              item.TakeUp = val.StdTakeUp
            }
          })
        } else {
          let obj = {
            PartId: currentPart.PartId,
            PartCode: currentPart.PartCode,
            PartName: currentPart.PartName,
            CustomType: currentPart.CustomType,
            ColorId: partsInfo.ColorId,
            ColorCode: partsInfo.ColorCode,
            ColorName: partsInfo.ColorName,
            ColorPic: partsInfo.ColorPic,
          }
          this.salAsmUp.map(val => {
            if (this.queryData.GoodsId == val.GoodsId && val.SelablePtId == item.PartId && (val.ClrId == item.ColorId || val.ReviseSizeId == item.ColorId)) {
              obj.SaleUp = val.StdSaleUp
              obj.TakeUp = val.StdTakeUp
            }
          })
          this.SelableParts.push(obj)
        }
      })
    }
  },
  onLoad(query) {
    if (query && query.id) {
      this.queryData.GoodsId = query.id;
      this.getGoodsInfo(query.id)
    } else {
      new Error('未获取到goodsId')
    }
  },
  onUnLoad() {
    // this.initPgae();
  },
  methods: {
    initPgae() {
      this.show = false;
      this.popIndex = -1;
      this.showTextarea = true;
      this.goodsPartsInfo = [];
      this.salAsmUp = [];
      this.RadioList = [];
      this.SelableParts = [];
      this.computedParams = {
        SelablePtsRng: []
      }
      this.goodsInfo = {
        GoodsName: '',
        GoodsCode: '',
        PicPath: '',
        SpecDesc: '',
        StandardUnitPrice: '',
        Id: '',
        Qty: null,
        Amt: 0,
        CustomDesc: ''
      }
    },
    changDesc(e) {
      this.goodsInfo.CustomDesc = e.mp.detail.value;
    },
    // 获取产品信息
    async getGoodsInfo(goodsId) {
      wx.showLoading({title: '加载中'})
      try {
        let result = await this.$http.post(this.apiList.getCurrentGoodApi, { GoodsId: goodsId })
        let goodsInfo = this._handleGoodsData(result)
        this.goodsInfo = goodsInfo;
        // console.log('this.goodsInfo', this.goodsInfo)
        // 获取产品部件
        this.getGoodsPartsInfo(goodsId)
      }
      catch(e) {
        wx.hideLoading()
      }
    },
    // 获取产品部件信息
    async getGoodsPartsInfo(goodsId) {
      try {
        let result = await this.$http.post(this.apiList.getSelableApi, { 
          GoodsId: goodsId,
          PageIndex: 1,
          PageSize: 20
        })
        console.log('result', result)
        this.goodsPartsInfo = this._handleGoodsPartsInfo(result)
        if (this.SelableParts.length > 0) {
          this.redirectSpecDesc('default')
        }
      } catch(e) {
        new Error(e)
      }
      wx.hideLoading()
    },
    // 处理商品信息
    _handleGoodsData(goods) {
      let tmpData = Object.assign({}, goods);
      tmpData.Qty = 1;
      tmpData.Amt = goods.StandardUnitPrice;
      tmpData.SelablePtIds = '';
      if (goods.Pic && goods.Pic[0] && goods.Pic[0].PicPath) {
        tmpData.PicPath = goods.Pic[0].PicPath.replace(this.$setting.regReplaceUrl, this.$setting.baseImgUrl)
      } else {
        tmpData.PicPath = this.$setting.defaultImg;
      }
      // debugger;
      // console.log('tmpData', tmpData)
      return tmpData;
    },
    // 处理部件数据
    _handleGoodsPartsInfo(data) {
      if (!data || data.length == 0) return [];
      data.forEach(item => {
        if (item.ColorId && item.ColorName) {
          // 如果有默认色板就设为默认值
          item.selectId = item.ColorId
          item.selectName = item.ColorName

          this.SelableParts.push({
            CustomType: item.CustomType,
            PartId: item.PartId,
            PartCode: item.PartCode,
            PartName: item.PartName,
            ColorId: item.ColorId,
            ColorCode: item.ColorCode,
            ColorName: item.ColorName,
            ColorPic: item.ColorPic,
            SaleUp: item.SaleUp,
            TakeUp: item.TakeUp
          })
          this.computedParams.SelablePtsRng.push({
            GoodsId: this.queryData.GoodsId,
            Qty: 1,
            CustomType: item.CustomType,
            PartId: item.PartId,
            ColorId: item.ColorId,
            Name: item.Name
          })
        }
      })
      return data;
    },
    // 获取选配部件范围
    getPartsInfo(partsInfo, index) {
      let params = {
        GoodsId: this.queryData.GoodsId,
        CustomType: partsInfo.CustomType,
        PartId: partsInfo.PartId
      }
      wx.navigateTo({ url: `../chooseParts/main?GoodsId=${params.GoodsId}&CustomType=${params.CustomType}&PartId=${params.PartId}&index=${index}`})
    },
    // 组合规格描述信息
    redirectSpecDesc(type) {
      let specDesc = "";
      let selablePtIds = '';
      this.goodsPartsInfo.forEach(item => {
        if (
          item.selectId != -1 &&
          item.selectId != "" &&
          item.selectId != undefined
        ) {
          if (
            this.goodsInfo.SpecDesc == "" ||
            this.goodsInfo.SpecDesc == undefined ||
            this.goodsInfo.SpecDesc == null
          ) {
            specDesc += `${item.PartName}:${item.selectName}`;
            selablePtIds += `${item.PartId}:${item.selectId}`
          } else {
            specDesc += `,${item.PartName}:${item.selectName}`;
            selablePtIds += `,${item.PartId}:${item.selectId}`
          }
        }
      });
      this.goodsInfo.SpecDesc = specDesc;
      if(selablePtIds.indexOf(',' == 0)){
        selablePtIds = selablePtIds.substring(1); 
      }
      this.goodsInfo.SelablePtIds = selablePtIds;

      if (type == 'default') {
      }else {
        this.redirectGoodsUpData();
      }
      this.computedSinglePrice();
    },
    redirectGoodsUpData() {
      this.goodsPartsInfo.forEach(item => {
        if (item.selectId && item.parts) {
          let addInfo = item.parts
          let noPartId = true
          this.computedParams.SelablePtsRng.forEach(value => {
            if (value.PartId == item.PartId) {
              noPartId = false
              value.CustomType = addInfo.CustomType
              value.GoodsId = this.queryData.GoodsId
              value.Qty = this.goodsInfo.Qty
              value.ColorId = addInfo.ColorId
              value.ColorName = addInfo.ColorName
            }
          })
          if (noPartId) {
            this.computedParams.SelablePtsRng.push({
              PartId: addInfo.PartId,
              CustomType: addInfo.CustomType,
              ColorId: addInfo.ColorId,
              GoodsId: this.queryData.GoodsId,
              Qty: this.goodsInfo.Qty
            })
          }
        }
      })
    },
    // 计算购买数量
    numComputed(e) {
      let value = e.mp.detail;
      this.goodsInfo.Qty = value;
      this.computedTotalPrice();
    },
    // 计算单价
    async computedSinglePrice() {
      if (this.computedParams.SelablePtsRng.length == 0) {
        return;
      }
      let res = await this.$http.post(
        this.apiList.getGoodsUpApi,
        this.computedParams
      );
      this.salAsmUp = res.SelAsmUp
      let info = res.DealerTakeUp.filter(item => {
        return item.GoodsId == this.queryData.GoodsId;
      });
      info = info[0];
      if (info.Discount == 0) {
        info.Discount = 100
      }
      this.goodsInfo.StandardUnitPrice = info.RetailPrice;
      this.goodsInfo.Discount = info.Discount;
      this.computedTotalPrice();
    },
    // 计算总价
    computedTotalPrice() {
      this.goodsInfo.Amt = this.goodsInfo.StandardUnitPrice * this.goodsInfo.Qty;
    },
    // 加入购物车
    addShopCard() {
      setTimeout(() => {
        let goodsInfo = Object.assign({}, this.goodsInfo)
        goodsInfo.IsCustom = true;
        goodsInfo.SelableParts = this.SelableParts;
        let goods = handleGoodsData(goodsInfo);
        console.log('addgoods', goods)
        let res = ShopCartStore.addShopCartByUser(goods)
        if (res) {
          wx.showToast({
            title: "加入购物车成功",
            icon: "success",
            duration: 1000
          });
          setTimeout(function() {
            wx.navigateBack({
              delta: 1
            });
          }, 1000);
        } else {
          wx.showToast({
            title: "加入购物车失败",
            icon: "none",
            duration: 1500
          });
        }
      },100)
    }
  },
  watch: {
    show (value) {
      setTimeout(() => {
        this.showTextarea = !val
      },100)
    }
  }
}
</script>

<style lang="less">
.custom {
  .parts {
    height: 80%;
    width: 100%;
    display: flex;
    flex-direction: column;
    .pop_close {
      position: absolute;
      top: 0;
      left: 0;
      width: 100px;
      height: 40px;
      z-index: 999;
    }
    .parts-list {
      flex: 1;
      overflow-y: auto;
    }
  }

  .add_btn {
    width: 80% !important;
    margin: 20px auto;
    display: block;
  }
  .total_price {
    padding: 5px 0;
    font-size: 14px;
    color: red;
  }
  .van-nav-bar {
    padding-top: 0 !important;
  }
  .content_area {
    .van-cell__title {
      max-width: 130px !important;
      min-width: 130px !important;
    }
    .textarea {
      position:relative;
      display:-webkit-flex;
      display:flex;
      width:100%;
      padding:10px 15px;
      font-size:14px;
      line-height:24px;
      color:#333;
      background-color:#fff;
      box-sizing:border-box;
      .label {
        max-width:260rpx !important;
        min-width:260rpx !important;
      }
      .value {
        flex: 1
      }
    }
  }
}
</style>