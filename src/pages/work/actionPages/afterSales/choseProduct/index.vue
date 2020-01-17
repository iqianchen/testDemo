<template>
  <div id="choseProduct">
    <div class="search">
      <div class="my-search">
        <div class="search-content">
          <span class="iconfont icon-sousuo"></span>
          <input class="search-body" :value="searchKey" type="text" @blur="changeSearchKey" placeholder="请输入搜索关键词" @confirm="onSearch">
        </div>
        <div class="search-action" @click="onSearch">搜索</div>
      </div>
    </div>
    <div class="content tips">
      <div class="list-item" v-for="(item, index) in goodsData" :key="index" @click="selectedGoods(item, index)">
        <van-radio-group :value="radio" @change="onChange" custom-class="radio-group">
          <van-radio :name="index">
            <van-card :title="item.GoodsName" :thumb="item.PicPath ? item.PicPath : '/static/images/default.jpg'" :currency="'￥'" :price="item.UnitPrice">
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
          </van-radio>
        </van-radio-group>
      </div>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-if="noMore" class="noMore">没有更多数据了</div>
      <div v-if="goodsData.length == 0 && noData" class="noData">
        <span class="iconfont icon-ico_meiyoushuju"></span>
        <span class="text">暂无数据</span>
      </div>
    </div>
  </div>
</template>

<script>
import { prevPageSetData } from '@js/pageValue'
export default {
  data() {
    return {
      searchKey: '',
      radio: '',
      goodsData: [],
      params: {
        PageIndex: 1,
        PageSize: 10
      },
      rowCount: 0,
      loading: false,
      noMore: false,
      noData: false
    }
  },
  mounted() {
    this.getData()
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
    initPage() {
      this.searchKey = ''
      this.radio = ''
      this.goodsData = []
      this.rowCount = 0
      this.loading = false
      this.noMore = false
      this.noData = false
      this.params = {
        PageIndex: 1,
        PageSize: 10
      }
    },
    // 获取所有产品数据
    async getData(type) {
      if (type === 'up') {
        if (this.loading) return
        this.loading = true
      }
      let loading = type === 'up' ? false : true
      let params = Object.assign(this.params, { SearchKey: this.searchKey })
      let result = await this.$http.post('/api/CrmMobile/GetProduct', params, loading)
      result.Data.forEach(item => {
        if (item.PicPath) item.PicPath = item.PicPath.replace(/http:\/\/192\.168\.3\.30:8066/, this.$baseImgUrl)
      })
      this.rowCount = result.RowCount
      if (type == 'up') {
        this.loading = false
        this.goodsData = this.goodsData.concat(result.Data)
      } else {
        this.goodsData = result.Data
      }
      this.noMore = false
      if (this.goodsData.length == 0) this.noData = true
    },
    onSearch() {},
    // 返回选中的商品
    selectedGoods(item, index) {
      this.radio = index + ''
      prevPageSetData('goodsItem', item)
      wx.navigateBack({
        detail: 1
      })
    },
    onChange() {
    }
  }
}
</script>

<style lang="less">
#choseProduct {
  .list-item {
    border-bottom: 1px solid #e4e4e4;
  }
}
#choseProduct .van-radio {
  display: flex;
  padding-left: 6px;
  align-items: center;
}
#choseProduct .van-radio__label {
  flex: 1;
}
</style>
