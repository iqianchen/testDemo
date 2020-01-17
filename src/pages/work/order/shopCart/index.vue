<template>
  <div id="shopCart">

    <div id="shop_list_area">
      <div class="shop_card_part" v-for="(item, index) in shopCardList" :key="item.Id">
        <div class="checkbox_area">
          <van-checkbox :value="item.selectActive" @change="selectGood(item, index)"></van-checkbox>
        </div>
        <van-card
          :title="item.GoodsName"
          :thumb="item.PicPath ? item.PicPath : $setting.defaultImg"
          :currency="'￥'"
          :price="item.UnitPrice"
          custom-class="shop_card_list"
        >
          <view slot="footer">
            <van-stepper
              :value="item.Qty"
              :data-currentNum="index"
              @change="numComputed"
              @plus="addNum(item)"
              @minus="reduceNum(item)"
            />
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
    </div>

    <div id="foot_nav">
      <div class="nav_parts nav_parts_1">
        <div class="parts_1_1">
          <van-checkbox :value="allCheckState" @change="choseAllGoods">全选</van-checkbox>
        </div>
        <div class="parts_1_2">
          <span>合计：￥</span>
          <span class="totalMoney" v-text="totalMoney"></span>
        </div>
      </div>
      <div class="nav_parts nav_parts_3" @click.stop="deletePayOrder">
        删除
      </div>
      <div class="nav_parts nav_parts_2" @click.stop="goPayOrder">
        去下单(
        <span v-text="checkBoxArr.length"></span>)
      </div>
    </div>
  </div>
</template>

<script>
import ShopCartStore from '@js/shopCartStore';
export default {
  data() {
    return {
      totalMoney: 0,
      shopCardList: [],
      checkBoxArr: [],
      allCheckState: false,
      apiList: {}
    }
  },
  mounted() {
    this.getShopCartList()
  },
  methods: {
    // 获取购物车信息
    getShopCartList() {
      // let list = this.$WxStorageInfo.getUserShopCard();
      let list = ShopCartStore.getShopCartByUser()
      let totalMoney = 0, selectedNum = 0, checkBoxArr = [];
      // 计算被选中的数量， 选中的总金额
      list.forEach(item => {
        if (item.selectActive) {
          selectedNum++
          totalMoney += item.Qty * item.UnitPrice;
          checkBoxArr.push(item.CurrentGoodsNumber);
        }
      })
      // 判断是否处于全部选中状态
      if (selectedNum !== 0 && selectedNum == list.length)  this.allCheckState = true;
      else  this.allCheckState = false;
      this.totalMoney = totalMoney;
      this.checkBoxArr = checkBoxArr;
      this.shopCardList = list;
      if (this.shopCardList.PicPath) {
        this.shopCardList.PicPath = this.shopCardList.PicPath.replace(this.$setting.regReplaceUrl, this.$setting.baseImgUrl)
      }
    },
    // 改变商品数量时 重新商品数据
    redirectGoodData(goodsInfo, num) {
      goodsInfo.Qty = num;
      goodsInfo.Amt = goodsInfo.UnitPrice * num;
      return goodsInfo;
    },
    // 增加减少商品数量
    numComputed(e) {
      let value = e.mp.detail;
      let index = e.mp.currentTarget.dataset.currentnum;
      let goodsInfo;
      // console.log('index', index)
      // console.log('value', value)
      // console.log('this.shopCardList', this.shopCardList[index])
      goodsInfo = this.redirectGoodData(this.shopCardList[index], value);
      this.shopCardList[index] = goodsInfo;
      // this.$WxStorageInfo.updateStoreCart(goodsInfo);
      ShopCartStore.updateStoreCartByUser(goodsInfo)
    },
    // 增加商品数量
    addNum(item) {
      if (!item.selectActive) return;
      this.totalMoney += item.UnitPrice;
    },
    // 减少商品数量
    reduceNum(item) {
      if (!item.selectActive) return;
      this.totalMoney -= item.UnitPrice;
    },
    // 循环购物车所有商品 为其赋予状态
    changeShopCarGoodsStatus(state) {
      let totalMoney = 0, checkBoxArr = [];
      this.shopCardList = this.shopCardList.map(item => {
        if (state == true) {
          checkBoxArr.push(item.CurrentGoodsNumber);
          totalMoney += item.Qty * item.UnitPrice;
        }
        item.selectActive = state;
        return item;
      });
      this.totalMoney = totalMoney;
      // this.$WxStorageInfo.updateStoreCart(this.shopCardList, true);
      ShopCartStore.updateStoreCartByUser(this.shopCardList)
      this.checkBoxArr = checkBoxArr;
    },
    // 全选商品
    choseAllGoods() {
      let currentState = this.allCheckState;
      this.allCheckState = !currentState;
      this.changeShopCarGoodsStatus(this.allCheckState);
    },
    // 选中商品
    selectGood(goods, index) {
      this.shopCardList[index].selectActive = !this.shopCardList[index].selectActive;
      // this.$WxStorageInfo.updateStoreCart(goods);
      console.log('goods',goods)
      console.log('this.shopCardList[index]',this.shopCardList[index])
      ShopCartStore.updateStoreCartByUser(goods)
      let activeGoodPosition = this.checkBoxArr.indexOf(
        goods.CurrentGoodsNumber
      );
      if (activeGoodPosition == -1) {
        this.checkBoxArr.push(goods.CurrentGoodsNumber);
        if (this.checkBoxArr.length == this.shopCardList.length) {
          this.allCheckState = true;
        }
        this.totalMoney += goods.Qty * goods.UnitPrice;
      } else {
        if (this.checkBoxArr.length == 1) {
          this.checkBoxArr = [];
          this.totalMoney = 0;
        } else {
          this.checkBoxArr.splice(activeGoodPosition, 1);
          this.totalMoney -= goods.Qty * goods.UnitPrice;
          if (this.totalMoney < 0) {
            this.totalMoney = 0;
          }
        }
        this.allCheckState = false;
      }
    },
    // 跳转下单页面
    goPayOrder() {
      if (this.checkBoxArr.length < 1) {
        wx.showToast({
          title: "请选择商品",
          icon: 'none',
          duration: 1500
        });
        return;
      }
      let url = "../payOrder/main";
      wx.navigateTo({ url });
    },
    // 删除购物车内容
    deletePayOrder() {
      wx.showModal({
        title: '提示',
        content: '您确定要删除购物订单',
        success: (res) => {
          if (res.confirm) {
            // this.$WxStorageInfo.deleteStoreCart(this.checkBoxArr)
            console.log('this.checkBoxArr', this.checkBoxArr)
            ShopCartStore.deleteShopCartByUser(this.checkBoxArr)
            this.getShopCartList()
          }
        }
      })
    }
  }
}
</script>

<style lang="less">
#shopCart {
  padding-bottom: 50px;
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
        padding-left: 40px !important;
        padding-top: 10px;
        padding-bottom: 10px;
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
      position: abosulte;
      left: 0;
      top: 0;
      right: 100px;
      .parts_1_1 {
        font-size: 14px;
        padding-left: 10px;
        float: left;
        width: 80px;
      }
      .parts_1_2 {
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
      background: red;
      color: white;
      text-align: center;
      width: 100px;
      font-size: 16px;
      position: absolute;
      top: 0;
      right: 0;
      z-index: 9;
    }
    .nav_parts_3 {
      position: absolute;
      top: 0;
      right: 100px;
      z-index: 9;
      // line-height: 50px;
      background-color: #ff976a;
      color: white;
      padding: 0 15px;
      font-size: 16px;
    }
  }
}
</style>