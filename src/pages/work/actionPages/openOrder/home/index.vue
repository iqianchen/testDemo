<template>
  <div id="openOrder">
    <Search @onSearch="onSearch" placeholder="请输入关键字"></Search>

    <div class="content-wrapper">
      <div class="card-list"  v-for="(item, index) in listData" :key="index">
        <van-panel use-footer-slot>
          <div slot="header" class="list-header">
            <div class="title" @click="pageSkipping('showCustomerDetail', item.CustomerId)">
              <span style="font-weight:700" v-text="item.CustomerName"></span>
              <div class="subTitle">销售单号：{{item.SaleOrderNo}}</div>
              <div class="subTitle">手机号码：{{item.Mobile}}</div>
            </div>
            <div class="status" :class="{ computed: item.AppDate }" v-text="item.AppDate ? '已审核' : '未审核'"></div>
          </div>
          <van-card v-for="(val, i) in item.Details" @click="pageSkipping('showGoodsDetail', item.Id, i)" :key="i" :title="val.GoodsName" :thumb="val.PicPath || defaultImg" >
            <div class="goodsDetail" slot="desc">
              <div>
                <span>规格描述</span>:
                <span v-text="val.SpecDesc || ''"></span>
              </div>
              <div>
                <span>数量</span>:
                <span v-text="val.Qty || ''"></span>
              </div>
              <div>
                <span>单价</span>:
                <span v-text="val.UnitPrice || ''"></span>
              </div>
              <div>
                <span>折扣</span>:
                <span v-text="val.Discount"></span>
              </div>
              <div>
                <span>成交金额</span>:
                <span v-text="val.AmtAfOff || ''"></span>
              </div>
            </div>
          </van-card>
          <view slot="footer">
            <div class="info">
              <!-- <span>参与活动: {{item.ActivityName}}</span> </br> -->
              <span>共{{item.Details.length}}件商品，成交金额合计：{{item.TotalAmt}}</span>
            </div>
            <div class="action-button">
              <van-button size="small" v-if="item.NoPayAmt > 0" @click="receivables(item.Id)" type="warning">收款</van-button>
              <van-button v-if="!item.AppDate && permission.delete" size="small" @click="deleteOrder(item.Id)" type="danger">取消订单</van-button>
              <van-button size="small" @click="pageSkipping('showDetail', item.Id)" type="primary">详情</van-button>
              <!-- <van-button size="small" @click="pageSkipping('orderFollow', item.SaleOrderId,item.CustomerId)" type="primary">订单跟踪</van-button> -->
            </div>
          </view>
        </van-panel>
      </div>
    
      <Tips :tipsType="tipsType"></Tips>
    </div>

    <div class="float-button" @click="pageSkipping('shopOrder')">
      <span class="iconfont icon-add"></span>
    </div>
  </div>
</template>

<script>
import Search from '#/Search';
import Tips from '#/Tips';
import pageScrollLoad from '@/mixin/pageScrollLoad.js'
import permission from '@/mixin/permission.js'
export default {
  mixins: [pageScrollLoad, permission],
  components: {
    Search,
    Tips
  },
  data() {
    return {
      branchOffice: false,      // 是否是导购
      isLoading: false,         // 是否处于加载状态
      searchKey: '',            // 搜索关键字
      defaultImg: this.$setting.defaultImg,
      getDataApi: '/api/CrmMobile/GetSaleOrder',
    }
  },
  created() {
    this.isBranchOffice()
  },
  methods: {
    // 搜索事件
    onSearch(searchKey) {
      this.searchKey = searchKey;
      this.getListData(null, { SearchKey: searchKey })
    },
    // 处理响应的数据
    _handleResponseData(result) {
      if (result.length == 0) return result;
      result.forEach(item => {
        item.Details.forEach(val => {
          if (val.PicPath) val.PicPath = val.PicPath.replace(this.$setting.regReplaceUrl, this.$setting.baseImgUrl)
          if (val.Discount) {
            val.Discount = parseFloat(val.Discount).toFixed(2) + '%'
            val.AmtAfOff = parseFloat(val.AmtAfOff).toFixed(2)
          } else {
            val.Discount = '100.00%'
          }
        })
      })
      return result;
    },
    // 是否是导购
    isBranchOffice() {
      let userInfo = wx.getStorageSync('crmUserInfo');
      let tmpStore = userInfo.StoreId.split(',');
      if (tmpStore && tmpStore.length > 0) {
        let currentOrgId = tmpStore[tmpStore.length-1];   // 获取当前用户的机构id
        for (let key in userInfo.organize) {
          let item  = userInfo.organize[key];
          if (item.fOrgId == currentOrgId && item.Category == "BranchOffice") {
            this.branchOffice = true
            return;
          }
        }
      }
    },
    /**
     * 页面跳转
     * @param {String} pageName  跳转的页面名称
     * @param {Any} params1      参数1
     * @param {Any} params2      参数2
     */
    pageSkipping(pageName, params1, params2) {
      let url = '';
      switch (pageName) {
        case 'shopOrder':   // 选配下单
          url = `/pages/work/order/chooseStyle/main`;
          break;
        case 'showCustomerDetail':  // 查看客户详情
          url = `/pages/customerManage/detail/main?id=${params1}`;
          break;
        case 'orderFollow':   // 订单跟踪
          url = `/pages/customerManage/tranProgress/main?type=orderFollow?saleOrderId=${params1}&customerId=${params2}`;
          break;
        case 'showGoodsDetail':   // 商品详情页
          url = `../goodsDetail/main?id=${params1}&index=${params2}`;
          break;
        case 'showDetail':    // 详情页
          url = `../detail/main?id=${params1}&permission=${JSON.stringify(this.permission)}`;
          break;
      }
      if (!url) {
        new Error('未匹配到跳转的页面')
        return;
      };
      console.log('url', url)
      wx.navigateTo({ url: url })
    },
    // 收款
    async receivables(saleOrderId) {
      let result = await this.$http.post('/api/CrmMobile/GetReceiptOrder', {
        OrdId: saleOrderId,
        UnApprove: true,
        PageIndex: 1,
        PageSize: 100
      })
      if (!result.Data || result.Data.length == 0) {
        wx.navigateTo({url: '../../receipt/detail/main?type=newOrder&id='+saleOrderId})
      } else if (result.Data && result.Data.length > 0) {
        wx.showToast({
          title: '该订单有未审核的收款单，不能收款',
          icon: 'none'
        })
      }
    },
    // 取消订单
    deleteOrder (saleOrderId) {
      wx.showModal({
        title: '提示',
        content: '您确定要取消订单吗',
        success: (res) => {
          if (res.confirm) {
            let params = { SaleOrderId: saleOrderId };
            this.$http.post('/api/CrmMobile/DeleteSaleOrder', params).then(result => {
              if (result) {
                this.params.PageIndex = 1;
                this.getListData(null, { SearchKey: this.searchKey })
              }
            })
          }
        }
      })
    }

  }
}
</script>

<style lang="less">
#openOrder{
  .content {
    padding-bottom: 60px;
    .list-item {
      margin: 6px 0;
      .goodsDetail {
        >div {
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
        }
      }
    }
    .info {
      font-size: 12px;
    }
    .btn {
      margin-top: 5px;
      display: flex;
      -webkit-display: flex;
      justify-content: flex-end; 
    }
  }
  #shop_order_btn{
    position: fixed;
    bottom: 20px;
    right: 20px;
    font-size:14px;
    border-radius:50%;
  }

  .van-card__header {
    align-items: center;
  }
  .van-card__title {
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
  }
}
</style>