<template>
  <div id="afterSales" class="panel">
    <div class="search">
      <!-- <van-search :value="searchKey" @change="changeSearchKey" use-action-slot placeholder="请输入搜索关键词" @search="onSearch">
        <div slot="action" @tap="onSearch">搜索</div>
      </van-search> -->
      <div class="my-search">
        <div class="search-content">
          <span class="iconfont icon-sousuo"></span>
          <input class="search-body" :value="searchKey" type="text" @blur="changeSearchKey" placeholder="请输入搜索关键词" @confirm="onSearch">
        </div>
        <div class="search-action" @click="onSearch">搜索</div>
      </div>
    </div>

    <div class="content"> 
      <div class="list-item" v-for="(item, index) in listData" :key="index">
        <van-panel use-footer-slot>
          <div slot="header" class="list-header">
            <div class="title" @click="showCustomerDetail(item.CustomerId)">
              <span v-text="item.CustomerName || ''"></span>
              <div class="subTitle">手机号码：{{item.Mobile || ''}}</div>
            </div>
            <div class="status" :class="{ computed: item.AppDate }" v-text="item.AppDate ? '已审核' : '未审核'"></div>
          </div>
          <van-card @click="showGoodsDetail(item.ServiceOrderId, i)" v-for="(val, i) in item.Details" :key="i" :title="val.GoodsName" :thumb="val.PicPath || '/static/images/default.jpg'" >
            <div slot="desc" class="desc">
              <div v-if="val.SpecDesc">
                <span>规格描述:</span>
                <span v-text="val.SpecDesc || ''"></span>
              </div>
              <div>
                <span>数量:</span>
                <span v-text="val.Qty || ''"></span>
              </div>
              <div>
                <span>单价:</span>
                <span v-text="val.UnitPrice || ''"></span>
              </div>
              <div>
                <span>折扣:</span>
                <span v-text="val.Discount ? val.Discount+'%' : '100.00%'"></span>
              </div>
              <div>
                <span>折后金额:</span>
                <span v-text="val.Amt || ''"></span>
              </div>
            </div>
          </van-card>
          <view slot="footer">
            <div class="info">
              <div class="left">
                <div>
                  <span>客户诉求:</span>
                  <span v-text="item.Appeal || ''"></span>
                </div>
                <div>
                  <span>处理人:</span>
                  <span v-text="item.CustomerName || ''"></span>
                </div>
                <div>
                  <span>处理阶段:</span>
                  <span>已完成</span>
                </div>
              </div>
              <div class="right">
                <div>
                  <span>售后受理日期:</span>
                  <span v-text="item.AcceptDate || ''"></span>
                </div>
                <div>
                  <span>要求完成日期:</span>
                  <span v-text="item.RequireDate || ''"></span>
                </div>
                <div>
                  <span>售后解决日期:</span>
                  <span v-text="item.AcceptDate || ''"></span>
                </div>
              </div>
            </div>
            <div class="btn">
              <van-button size="small" v-if="!item.AppDate && permission.edit" @click="updateSalesOrder(item.Id)" type="warning">修改</van-button>
              <van-button custom-class="actionBtn" v-if="!item.AppDate && permission.add" size="small" @click="deleteCustomer(item.Id)" type="danger">删除</van-button>
              <van-button custom-class="actionBtn" size="small" @click="showHanleDetail(item.Id)" type="info">处理详情</van-button>
              <van-button custom-class="actionBtn" size="small" @click="showDetail(item.Id)" type="primary">详情</van-button>
            </div>
          </view>
        </van-panel>
        
      </div>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-if="noMore" class="noMore">没有更多数据了</div>
      <div v-if="listData.length == 0 && noData" class="noData">
        <span class="iconfont icon-ico_meiyoushuju"></span>
        <span class="text">暂无数据</span>
      </div>
    </div>

    <div class="float-button" v-if="permission.add" @click="addSalesOrder">
      <span class="iconfont icon-add"></span>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import permission from '@/mixin/permission.js'
import { updateKey } from "@js/pageValue";
export default {
  name: 'customer',
  mixins: [permission],
  data () {
    return {
      searchKey: '',
      params: {
        PageIndex: 1,
        PageSize: 20
      },
      listData: [],
      rowCount: 0,
      noMore: false,
      noData: false,
      loading: false
    }
  },
  mounted () {
    this.getData()
  },
  onShow() {
    let update = updateKey('update', this)
    if (update) this.getData()
  },
  // 下拉刷新
  onPullDownRefresh () {
    this.noMore = false
    this.noData = false
    this.params.PageIndex = 1
    this.getData()
    wx.stopPullDownRefresh()
  },
  // 上拉加载
  onReachBottom () {
    if (this.rowCount <= this.params.PageIndex * this.params.PageSize) {
      this.noMore = true
      return
    }
    this.params.PageIndex++
    this.getData('up')
  },
  onUnload() {
    this.initPage()
  },
  methods: {
    // 初始化页面
    initPage() {
      this.searchKey = ''
      this.listData = []
      this.noMore = false
      this.noData = false
      this.loading = false
      this.params = {
        PageIndex: 1,
        PageSize: 20
      }
    },
    // 获取产品
    async getData (type) {
      if (type === 'up') {
        if (this.loading) return
        this.loading = true
      } else {
        wx.showLoading({title: '加载中'})
      }

      let result = await this.$http.post('/api/CrmMobile/GetServiceOrder', Object.assign(this.params, { SearchKey: this.searchKey }))
      this.loading = false
      result = this._hanleData(result)
      this.rowCount = result.RowCount
      if (type === 'up') {
        this.listData = this.listData.concat(result.Data)
      } else {
        this.listData = result.Data
        wx.hideLoading()
      }
      this.noMore = false
      if (this.listData.length == 0) this.noData = true
    },
    // 搜索
    onSearch () {
      setTimeout(() => {
        this.params.PageIndex = 1
        this.getData()
      }, 100)
    },
    // 改变所有关键字
    changeSearchKey (event) {
      this.searchKey = event.mp.detail.value
    },
    // 处理数据
    _hanleData(result) {
      if (result.Data.length == 0) return result
      result.Data.forEach(item => {
        switch (item.Appeal) {
          case '0':
            item.Appeal = '换货'
            break;
          case '1':
            item.Appeal = '维修'
            break;
          case '2':
            item.Appeal = '退货'
            break;
        }
        if (item.RequireDate) item.RequireDate = item.RequireDate.split('T')[0]
        if (item.ServiceOrderDate) item.ServiceOrderDate = item.ServiceOrderDate.split('T')[0]
        if (item.AcceptDate) item.AcceptDate = item.AcceptDate.split('T')[0]
        
      })
      return result
    },
    // 查看处理详情
    showHanleDetail(id) {
      wx.navigateTo({url: '../handleDetail/main?id='+id})
    },
    // 查看详情
    showDetail(id) {
      wx.navigateTo({url: `../detail/main?type=detail&id=${id}&permission=${JSON.stringify(this.permission)}`})
    },
    // 添加服务单
    addSalesOrder () {
      wx.navigateTo({url: '../detail/main?type=add'})
    },
    // 修改用户
    updateSalesOrder (id) {
      wx.navigateTo({url: '../detail/main?type=update&id='+id})
    },
    // 删除客户
    deleteCustomer (serviceOrderId) {
      wx.showModal({
        title: '提示',
        content: '您确定要删除该服务单吗',
        success: (res) => {
          if (res.confirm) {
            let params = { ServiceOrderId: serviceOrderId }
            this.$http.post('/api/CrmMobile/DeleteServiceOrder', params).then(result => {
              if (result) {
                this.params.PageIndex = 1
                this.getData() 
              }
            })
          }
        }
      })
    },
    // 显示商品详情
    showGoodsDetail(id, index) {
      // wx.navigateTo({url: '../../openOrder/goodsDetail/main?id='+ id + '&index='+index})
    },
    // 查看客户详情
    showCustomerDetail (customerId) {
      wx.navigateTo({url: '../../../customerManage/detail/main?id='+customerId})
    },
  }
}
</script>

<style lang="less">
#afterSales {
  .content {
    padding-bottom: 80px;
    .list-item {
      margin: 6px 0;
      .van-card__title {
        overflow: hidden;
        text-overflow:ellipsis;
        white-space: nowrap;
      }
      .van-card__header {
        align-items: center;
      }
      .desc {
        >div {
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }
      }
    }
    .info {
      font-size: 14px;
      color: #515a6e;
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 10px;
      >div {
        width: 50%;
        font-size: 12px;
      }
    }
  }
  .van-card__title {
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
  }
}
</style>


