<template>
  <div id="orderDetail">
    <div class="userInfo card">
      <div class="title">
        <span class="iconfont icon-kehu"></span>
        <span>客户信息</span>
      </div>
      <div class="content">
        <div class="icon">
          <span class="iconfont icon-location"></span>
        </div>
        <div>
          <div>名称：{{datas.CustomerName}}</div>
          <div>手机：{{datas.Mobile}}</div>
          <div v-if="address">地址：{{address}}</div>
        </div>
      </div>
    </div>

    <div class="goods">
      <van-panel :title="'销售单号：'+datas.SaleOrderNo" use-footer-slot>
        <van-card v-for="(item, index) in datas.Details" @click="showGoodsDetail(datas.Id, index)" :key="index" :title="item.GoodsName" :thumb="item.PicPath || defaultImg">
          <div class="goodsDetail" slot="desc">
            <div>
              <span>规格描述</span>:
              <span v-text="item.SpecDesc || ''"></span>
            </div>
            <div>
              <span>数量</span>:
              <span v-text="item.Qty || ''"></span>
            </div>
            <div>
              <span>单价</span>:
              <span v-text="item.UnitPrice || ''"></span>
            </div>
            <div>
              <span>折扣</span>:
              <span v-text="item.Discount"></span>
            </div>
            <div>
              <span>成交金额</span>:
              <span v-text="item.AmtAfOff || ''"></span>
            </div>
          </div>
        </van-card>
        <div slot="footer">
          <span class="goods-footer">共{{datas.Details.length}}件商品，成交金额合计：{{datas.TotalAmt}}</span>
        </div>
      </van-panel>
    </div>

    <div class="info card">
      <div class="title">
        <span class="iconfont icon-dingdan"></span>
        <span>订单信息</span>
      </div>
      <div class="content">
        <div>
          <span class="label">销售单号</span>：
          <span v-text="datas.SaleOrderNo"></span>
        </div>
        <div>
          <span class="label">订单状态</span>：
          <span v-text="datas.AppState"></span>
        </div>
        <div class="align-center" v-if="datas.AppDate">
          <span class="label">审核时间</span>：
          <span v-text="datas.AppDate"></span>
        </div>
        <div class="align-center">
          <span class="label">整单折扣</span>：
          <span v-text="datas.DiscountRate"></span>
        </div>
        <div class="align-center">
          <span class="label">成交金额</span>：
          <span v-text="datas.TotalAmt"></span>
        </div>
        <div class="align-center">
          <span class="label">未付金额</span>：
          <span v-text="datas.NoPayAmt"></span>
        </div>
        <div class="align-center">
          <span class="label">已付金额</span>：
          <span v-text="datas.PaiedAmt"></span>
        </div>
        <div class="align-center">
          <span class="label">送货日期</span>：
          <span v-text="datas.SaleOrderDate"></span>
        </div>
        <div v-if="datas.TicketNo">
          <span class="label">商场单号</span>：
          <span v-text="datas.TicketNo"></span>
        </div>
        <div v-if="datas.Remark">
          <span class="label">备注</span>：
          <span v-text="datas.Remark"></span>
        </div>
      </div>
    </div>

    <div class="button-group">
      <van-button size="large" v-if="!datas.CloseDate && !datas.AppDate && permission.approve" type="primary" @click="approveAction('Approve','loading1')" :loading="loading" :disabled="loading || loading2" :loading-text="loadingText">审核</van-button>
      <van-button size="large" v-if="datas.AppDate && permission.unApprove" type="danger" @click="approveAction('UnApprove','loading1')" :loading="loading" :disabled="loading || loading2" :loading-text="loadingText">反审核</van-button>

      <van-button size="large" v-if="datas.AppDate && permission.endCase" type="primary" @click="approveAction('EndCase','loading2')" :loading="loading2" :disabled="loading || loading2" :loading-text="loadingText">结案</van-button>
      <van-button size="large" v-if="datas.CloseDate && permission.unEndCase" type="danger" @click="approveAction('UnendCase','loading2')" :loading="loading2" :disabled="loading || loading2" :loading-text="loadingText">反结案</van-button>
    </div>
  </div>
</template>

<script>
// import DateFormula from '@/utils/dateFormula.js'
import { prevPageSetData } from '@/assets/js/pageValue'
export default {
  data() {
    return {
      datas: {
        Details: []
      },
      address: '',
      defaultImg: this.$setting.defaultImg,
      permission: {},
      loading: false,
      loading2: false,
      loadingText: '正在提交',
    }
  },
  onLoad(query) {
    console.log('query', query)
    if (query && query.id) {
      this.getData(query.id)
      this.permission = JSON.parse(query.permission)
    }
  },
  onUnload() {
    this.initPage()
  },
  methods: {
    initPage() {
      this.datas = {
        Details: []
      }
      this.address = '',
      this.permission = {}
      this.loading = false
      this.loading2 = false
      this.loadingText = '正在提交'
    },
    // 获取数据
    async getData(id) {
      let params = {
        SaleOrderId: id
      }
      wx.showLoading({title: '加载中'})
      let result = await this.$http.post('/api/CrmMobile/GetSaleOrderById', params)
      wx.hideLoading()
      result = this._hanleData(result)
      this.datas = result
    },
    // 处理数据
    _hanleData(result) {
      if (!result) return
      let address = '';
      if (result.ProvinceName) address += result.ProvinceName;
      if (result.CityName) address += result.CityName;
      if (result.CountryName) address += result.CountryName;
      if (result.Address) address += result.Address;
      this.address = address;
      result.DiscountRate = result.DiscountRate ? result.DiscountRate.toFixed(2) + '%' : '100.00%';
      result.NoPayAmt = result.NoPayAmt ? result.NoPayAmt.toFixed(2) : '0.00';
      result.PaiedAmt = result.PaiedAmt ? result.PaiedAmt.toFixed(2) : '0.00';
      result.TotalAmt = result.TotalAmt ? result.TotalAmt.toFixed(2) : '0.00';
      // result.SaleOrderDate = DateFormula.format(new Date(result.SaleOrderDate), 'yyyy-MM-dd')
      result.SaleOrderDate = new Date(result.SaleOrderDate).format('yyyy-MM-dd');
      if (result.AppDate) {
        // result.AppDate = DateFormula.format(new Date(result.AppDate), 'yyyy-MM-dd')
        result.AppDate = new Date(result.AppDate).format('yyyy-MM-dd hh:mm:ss');
        result.AppState = '已审核';
      } else {
        result.AppState = '未审核';
      }
      result.Details.forEach(item => {
        item.UnitPrice = item.UnitPrice ? item.UnitPrice.toFixed(2) : '0.00';
        item.AmtAfOff = item.AmtAfOff ? item.AmtAfOff.toFixed(2) : '0.00';
        item.Discount = item.Discount ? item.Discount.toFixed(2) + '%' : '100.00%';
        if (item.PicPath) item.PicPath = item.PicPath.replace(this.$setting.regReplaceUrl, this.$setting.baseImgUrl);
      })
      return result;
    },
    // 商品详情页
    showGoodsDetail(id, index) {
      wx.navigateTo({ url: `../goodsDetail/main?id=${id}&index=${index}`})
    },
    async approveAction(ApproveMethod, loadingType) {
      if (loadingType === 'loading1') {
        if (this.loading) return
        this.loading = true
      } else if(loadingType === 'loading2') {
        if (this.loading2) return
        this.loading2 = true
      }
      let params = {
        SaleOrderId: this.datas.SaleOrderId,
        ApproveMethod: ApproveMethod,
      }
      try {
        await this.$http.post('/api/CrmMobile/ApproveSaleOrder', params)
        this.loading = false
        this.loading2 = false
        wx.showToast({ title: '成功', duration: 800})
        setTimeout(()=>{
          prevPageSetData('update', true)
          wx.navigateBack({ delta: 1})
        }, 800)
      } catch(err) {
        this.loading = false
        this.loading2 = false
      }
    }
  }
}
</script>

<style lang="less">
@import '~less/base-color.less';
#orderDetail {
  min-height: 100%;
  background: @background-color;
  .userInfo {
    .content {
      display: flex;
      align-items: center;
      .icon {
        flex-basis: 40px;
        .iconfont {
          font-size: 28px;
          color: @green;
        }
      }
    }
    >div:last-child {
      flex: 1
    }
  }
  .goods {
    margin: 12px 0;
    .goodsDetail >div,
    .van-card__title {
      overflow: hidden;
      text-overflow:ellipsis;
      white-space: nowrap;
    }
    .goods-footer {
      font-size: 12px;
    }
  }
  .info {
    margin-bottom: 12px;
    .content {
      padding-left: 10px;
      >div {
        display: flex;
        line-height: 1.6em;
        .label {
          width: 60px;
          display: inline-block;
          text-align: justify;
          text-align-last: justify;
        }
        >span:last-child {
          flex: 1
        }
        &.align-center {
          align-items: center;
        }
      }
    }
  }
  .card {
    background: #fff;
    padding: 10px 15px;
    font-size: 14px;
    .title {
      font-weight: 700;
      font-size: 16px;
      margin-bottom: 10px;
      display: flex;
      .iconfont {
        font-size: 20px;
        color: @main-color;
        margin-right: 8px;
      }
    }
  }
}
</style>
