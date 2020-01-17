<template>
  <div id="productDisplay" class="panel">
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
      <van-card custom-class="goods-list" v-for="(item, index) in listData" :key="index" :title="item.GoodsName" :thumb="item.Pic.length > 0 && item.Pic[0].PicPath ? item.Pic[0].PicPath : '/static/images/default.jpg'" >
        <div slot="desc">
          <div>
            <span>品牌:</span>
            <span v-text="item.BrandName"></span>
          </div>
          <div>
            <span>款式:</span>
            <span v-text="item.StyleName"></span>
          </div>
          <div>
            <span>系列:</span>
            <span v-text="item.SeriesName"></span>
          </div>
          <div>
            <span>产品类别:</span>
            <span v-text="item.ProductCategoryName"></span>
          </div>
        </div>
        <div slot="footer">
          <van-button size="small" @click="showGoodsDetail(item.Id)" round >查看详情</van-button>
          <van-button size="small" @click="pushGoods(item.Id)" round>推送</van-button> 
        </div>
      </van-card>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-if="noMore" class="noMore">没有更多数据了</div>
      <div v-if="listData.length == 0 && noData" class="noData">
        <span class="iconfont icon-ico_meiyoushuju"></span>
        <span class="text">暂无数据</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'productDisplay',
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

      let result = await this.$http.post('/api/CrmMobile/GetProduct', Object.assign(this.params, { SearchKey: this.searchKey }))
      this.loading = false
      this.rowCount = result.RowCount
      result.Data.forEach(item => {
        if (item.Pic && item.Pic[0].PicPath) {
          item.Pic[0].PicPath = item.Pic[0].PicPath.replace(/http:\/\/192\.168\.3\.30:8066/, this.$baseImgUrl)
        }
      })
      if (type === 'up') {
        this.listData = this.listData.concat(result.Data)
      } else {
        this.listData = result.Data
        wx.hideLoading()
      }
      if (this.listData.length == 0) this.noData = true
    },
    // 搜索
    onSearch () {
      setTimeout(() => {
        this.params.PageIndex = 1
        this.getData()
      },100)
    },
    // 改变所有关键字
    changeSearchKey (event) {
      this.searchKey = event.mp.detail.value
    },
    // 查看商品详情
    showGoodsDetail (goodsId) {
      wx.navigateTo({url: '../detail/main?goodsId='+goodsId})
    },
    // 进入推送页面
    pushGoods (goodsId) {
      wx.navigateTo({url: '../push/main?goodsId='+goodsId})
    }
  }
}
</script>


<style>
button.share-button {
  display:inline-block;
  height:30px;
  min-width:60px;
  padding:0 8px;
  font-size:12px;
  line-height:28px;
  border-radius:10em;
  -webkit-appearance:none;
  -webkit-text-size-adjust:100%;
  border:1px solid #eee;
  background:#fff;
  overflow: visible;
  color: #333;
  margin-left: 10px;
}
.goods-list {
  margin: 6px 0;
  background-color: #fff;
  padding-top: 10px;
  border-bottom: 1px solid #e4e4e4;
}
/* button[plain]{ border:0 } */
</style>

