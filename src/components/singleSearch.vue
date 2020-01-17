<template>
  <div id="singleSearch">
    <div class="search">
      <!-- <van-search :value="searchKey" @change="changeSearchKey" use-action-slot placeholder="请输入搜索关键词" @search="onSearch">
        <view slot="action" @tap="onSearch">搜索</view>
      </van-search> -->
      <div class="my-search">
        <div class="search-content">
          <span class="iconfont icon-sousuo"></span>
          <input class="search-body" :value="searchKey" type="text" @blur="changeSearchKey" placeholder="请输入搜索关键词" @confirm="onSearch">
        </div>
        <div class="search-action" @click="onSearch">搜索</div>
      </div>
    </div>
    <scroll-view scroll-y :style="{ height: contentHeight}" @scrolltolower="onReachBottom">
      <van-radio-group :value="radio" v-if="listData.length > 0">
        <van-cell-group>
          <van-cell v-if="getApi == 'customer'" v-for="(item, index) in listData" :key="item.index" :title="item.Name" clickable :data-name="item.Id" @click="onClick">
            <van-radio :name="item.Id" />
          </van-cell>
          <van-cell v-if="getApi == 'user'" v-for="(item, index) in listData" :key="item.index" :title="item.UserName" clickable :data-name="item.UserId" @click="onClick">
            <van-radio :name="item.UserId" />
          </van-cell>
          <van-cell v-if="getApi == 'saleOrder'" v-for="(item, index) in listData" :key="item.index" :title="item.SaleOrderNo" clickable :data-name="item.SaleOrderId" @click="onClick">
            <van-radio :name="item.SaleOrderId" />
          </van-cell>
        </van-cell-group>
      </van-radio-group>

      <div v-if="loading" class="loading">加载中...</div>
      <div v-if="noMore" class="noMore">没有更多数据了</div>
      <div v-if="listData.length == 0 && noData" class="noData">
        <span class="iconfont icon-ico_meiyoushuju"></span>
        <span class="text">暂无数据</span>
      </div>
    </scroll-view>
  </div>
</template>

<script>
/* eslint-disable */
export default {
    name: 'singleSearch',
    data () {
      return {
        params: {
          PageIndex: 1,
          PageSize: 20
        },
        searchKey: '',
        listData: [],
        rowCount: 0,
        loaded: false,
        loading: false,
        noMore: false,
        noData: false,
        contentHeight: 0,
        url: ''
      }
    },
    props: {
      getApi: {
          type: String,
          default: ''
      },
      radio: {
        type: String,
        default: ''
      },
      otherParams: {
        type: Object,
        default() {
          return {}
        }
      }
    },
    mounted() {
      let windowHeight = wx.getSystemInfoSync().windowHeight
      this.contentHeight = (windowHeight - 54) + 'px'
    },
    onUnload() {
      this.initPage()
    },
    methods: {
      resetPage() {
        switch (this.getApi) {
          case 'user':
            this.url = '/api/CrmMobile/GetUser'
            break;
          case 'customer':
            this.url = '/api/CrmMobile/GetCustomer'
            break;
          case 'saleOrder':
            this.url = '/api/CrmMobile/GetSaleOrder'
            break
        }
        this.getData()
      },
      // 获取数据
      async getData(type) {
        if (type === 'up') {
          if (this.loading) return
          this.loading = true
        }
        let loading = type == 'up' ? false : true
        let params = Object.assign(this.params, this.otherParams)
        let result = await this.$http.post(this.url, params, loading)
        this.rowCount = result.RowCount
        this.noMore = false
        if (type === 'up') {
          this.loading = false
          this.listData = this.listData.concat(result.Data)
        } else {
          this.listData = result.Data
        }
        if (this.listData.length == 0) this.noData = true
      },
      // 上拉加载
      onReachBottom() {
        if (this.rowCount <= this.params.PageIndex * this.params.PageSize) {
          this.noMore = true
          return
        }
        this.params.PageIndex++
        this.getData('up')
      },
      // 改变关键字
      changeSearchKey (event) {
        this.searchKey = event.mp.detail.value
      },
      // 点击搜索
      onSearch (event) {
        setTimeout(()=>{
          this.params.PageIndex = 1
          switch (this.getApi) {
            case 'user':
              this.params.UserCode = this.searchKey;
              break;
            case 'customer':
              this.params.SearchKey = this.searchKey
              break;
            case 'saleOrder':
              this.params.SearchKey = this.searchKey
              break;
          }
          this.getData()
        },100)
      },
      initPage() {
        this.radio = ''
        this.searchKey = ''
        this.listData = []
        this.rowCount = 0
        this.loaded = false
        this.loading = false
        this.noMore = false
        this.noData = false
        this.params = {
          PageIndex: 1,
          PageSize: 20
        }
      },
      onClick (event) {
        this.radio = event.currentTarget.dataset.name
        let selectedData = this.listData.filter(item => {
          switch (this.getApi) {
            case 'user':
              return item.UserId == this.radio
            case 'saleOrder':
              return item.SaleOrderId == this.radio
            case 'customer':
              return item.Id == this.radio
          }
        })
        this.$emit('confirm', selectedData[0])
      }
    }
}
</script>


<style lang="less">
@import "~less/base-color.less";
#singleSearch {
  background-color: #fff;

  .loading,
  .noMore {
    font-size: 16px;
    color: @help-color;
    text-align: center;
    padding: 8px 0;
    background: #f7f8fa;
    color: #888;
  }
  .noData {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 70px;
    color: @help-color;
    .iconfont {
      font-size: 80px;
    }
    .text {
      margin-top: 20px;
      font-size: 20px
    }
  }
}
</style>

