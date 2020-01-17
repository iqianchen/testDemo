<template>
  <div id="submarine" class="panel">
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
            <div class="title">
              <span v-text="item.fcontact || ''"></span>
              <div class="subTitle">手机号码：{{item.fmobile || ''}}</div>
            </div>
            <!-- <div class="status" :class="{ computed: item.AppDate }" v-text="item.AppDate ? '已审核' : '未审核'"></div> -->
          </div>
          <div class="desc">
            <div>
              <span class="label">客户来源</span>：
              <span v-text="item.fsourcename || ''"></span>
            </div>
            <div>
              <span class="label">跟进状态</span>：
              <span v-text="item.fstagename || ''"></span>
            </div>
            <div>
              <span class="label">客户类别</span>：
              <span v-text="item.fcustflagtext || ''"></span>
            </div>
          </div>
          <view slot="footer">
            <div class="btn">
              <van-button size="small" v-if="item.fistochance && permission.edit" @click="changeToNiche(item.frowid)" type="info">转换商机</van-button>
              <van-button size="small" custom-class="actionBtn" v-if="permission.edit" @click="updateBtn(item.frowid)" type="warning">修改</van-button>
              <van-button size="small" custom-class="actionBtn" v-if="permission.delete" @click="deleteBtn(item.frowid)" type="danger">删除</van-button>
              <van-button size="small" custom-class="actionBtn" @click="showDetail(item.frowid)" type="primary">详情</van-button>
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

    <div class="float-button" @click="addBtn">
      <span class="iconfont icon-add"></span>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import { updateKey } from '@js/pageValue'
import permission from '@/mixin/permission.js'
export default {
  mixins: [permission],
  data() {
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
  onUnload() {
    this.initPage()
  },
  onShow() {
    let update = updateKey('update', this)
    if (update) {
      this.getData()
    }
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
      if (this.loading) return
      if (type === 'up') {
        this.loading = true
      }
      let loading = type == 'up' ? false : true
      let params = Object.assign(this.params, { SearchKey: this.searchKey })
      let result = await this.$http.post('/api/CrmMobile/GetCrmProspectiveCust', params, loading)
      result = this._handleData(result)
      this.rowCount = result.RowCount
      this.loading = false
      if (type === 'up') {
        this.listData = this.listData.concat(result.Data)
      } else {
        this.listData = result.Data
      }
      this.noMore = false
      if (this.listData.length == 0) this.noData = true
    },
    _handleData(result) {
      result.Data.forEach(item => {
        if (item.fcustflag !== null && item.fcustflag !== undefined) {
          switch (parseInt(item.fcustflag)) {
            case 0:
              item.fcustflagtext = '个人客户'
              break;
            case 1:
              item.fcustflagtext = '公海客户'
              break;
          }
        }
      })
      return result
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
    addBtn() {
      wx.navigateTo({ url: '../detail/main'})
    },
    updateBtn(id) {
      wx.navigateTo({ url: '../detail/main?type=update&id='+id})
    },
    showDetail(id) {
      wx.navigateTo({ url: '../detail/main?type=detail&id='+id})
    },
    deleteBtn(id) {
      wx.showModal({
        title: '提示',
        content: '您确定要删除该潜客',
        success: (res) => {
          if (res.confirm) {
            let params = { ProspectiveCustId: id }
            this.$http.post('/api/CrmMobile/DeleteCrmProspectiveCust', params).then(result => {
              if (result) {
                this.params.PageIndex = 1
                this.getData() 
              }
            })
          }
        }
      })
    },
    // 转换商机
    async changeToNiche(id) {
      let params = {
        ProspectiveCustId: id
      }
      wx.showLoading({title: '加载中'})
      let result = await this.$http.post('/api/CrmMobile/CrmProspectiveCustToChance', params)
      wx.hideLoading()
      if (result) {
        wx.showToast({ title: '转换成功', duration: 1200})
        this.getData()
      }
    }
  }
}
</script>


<style lang="less">
@import "~less/base-color.less";
#submarine {
  min-height: 100%;
  background-color: @background-color;
  .list-item {
    margin: 6px 0;
    .desc {
      padding: 0px 15px 5px;
      color: #333;
      font-size: 14px;
      .label {
        display: inline-block;
        width: 60px;
        text-align: justify;
        text-align-last: justify;
      }
    }
    .btn {
      text-align: right;
      .actionBtn {
        margin-left: 6px;
      }
    }
  }
}
</style>

