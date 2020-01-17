<template>
  <div id="journal" class="panel">
    <div class="search time">
      <!-- <van-search :value="searchKey" @change="changeSearchKey" use-action-slot placeholder="请输入搜索关键词" @search="onSearch">
        <div slot="action">
          <span @tap="onSearch">搜索</span>
          <span class="more" @click="filterMore" v-text="filter.text"></span>
        </div>
      </van-search>
      <div :class="['filter', {show: filter.value}]">
        <div class="date">
          <span class="label">日期:</span>
          <span v-text="params.FromDate" @click="choseDate('from')"></span>
          —
          <span v-text="params.ToDate" @click="choseDate('to')"></span>
        </div>
      </div> -->
      <div class="date">
        <div>
          <span>开始</span>
          <span @click="choseDate('from')" v-text="params.FromDate"></span>
        </div>
        <div>
          <span>结束</span>
          <span @click="choseDate('to')" v-text="params.ToDate"></span>
        </div>
      </div>
    </div>
    <div class="content"> 
      <div class="list-item" v-for="(item, index) in listData" :key="index">
        <van-panel use-footer-slot>
          <div slot="header" class="list-header">
            <div class="title">
              <span v-text="item.ftitle"></span>
            </div>
            <!-- <div class="status" :class="{ computed: item.AppDate }" v-text="item.AppDate ? '已审核' : '未审核'"></div> -->
          </div>
          <div class="desc">
              <div>
                <span>建立人:</span>
                <span v-text="item.CreateUser || ''"></span>
              </div>
              <div>
                <span>建立时间:</span>
                <span v-text="item.fdate || ''"></span>
              </div>
          </div>
          <view slot="footer">
            <div class="btn">
              <van-button size="small" @click="showComment(item.frowid)" type="warning">评论</van-button>
              <van-button size="small" custom-class="actionBtn" @click="showDetail(item.frowid)" type="primary">详情</van-button>
              <!-- <van-button v-if="!item.AppDate" custom-class="actionBtn" size="small" @click="deleteBtn(item.frowid)" type="danger">删除</van-button> -->
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

    <div class="float-button" @click="addJourral">
      <span class="iconfont icon-add"></span>
    </div>

    <van-popup :show="showDate" position="bottom" >
      <van-datetime-picker type="date" :value="currentDate" @confirm="changeDate" @cancel="showDate = false" />
    </van-popup>
  </div>
</template>

<script>
/* eslint-disable */
import dateFormula from '@js/dateFormula.js'
import { updateKey } from "@js/pageValue";
let dateRange = dateFormula.getMonthStartAndEnd(0)
export default {
  data() {
    return {
      searchKey: '',
      params: {
        PageIndex: 1,
        PageSize: 20,
        FromDate: dateRange[0],
        ToDate: dateRange[1]
      },
      listData: [],
      rowCount: 0,
      noMore: false,
      noData: false,
      showDate: false,
      currentDate: new Date().getTime(),
      dateType: '',
      filter: {
        value: false,
        text: '展开'
      }
    }
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
  onShow() {
    let update = updateKey('update', this)
    if (update) {
      this.getData()
    }
  },
  mounted() {
    this.getData()
  },
  onUnload() {
    this.initPage()
  },
  methods: {
    initPage() {
      this.searchKey = ''
      this.listData = []
      this.rowCount = 0
      this.noMore = false
      this.noData = false
      this.showDate = false
      this.currentDate = new Date().getTime()
      this.dateType = ''
      this.params = {
        PageIndex: 1,
        PageSize: 20,
        FromDate: dateRange[0],
        ToDate: dateRange[1]
      }
      this.filter = {
        value: false,
        text: '展开'
      }
    },
    filterMore() {
      this.filter.value = !this.filter.value
      if (this.filter.value) {
        this.filter.text = '收起'
      } else {
        this.filter.text = '展开'
      }
    },
    choseDate(type) {
      this.dateType = type
      this.showDate = true
      switch (type) {
        case 'from':
          if (this.params.FromDate) this.currentDate = new Date(this.params.FromDate).getTime()
          break;
        case 'to':
          if (this.params.ToDate) this.currentDate = new Date(this.params.ToDate).getTime()
          break
      }
    },
    changeDate(event) {
      let stringDate = dateFormula.format(new Date(event.mp.detail), 'yyyy-MM-dd')
      switch (this.dateType) {
        case 'from':
          if (this.params.ToDate && new Date(stringDate) > new Date(this.params.ToDate)) {
            wx.showToast({ title: '开始日期不能大于结束日期', icon: 'none'})
            return;
          }
          this.params.FromDate = stringDate
          if (this.params.ToDate) this.getData()
          break;
        case 'to':
          if (this.params.FromDate && new Date(stringDate) < new Date(this.params.FromDate)) {
            wx.showToast({ title: '开始日期不能大于结束日期', icon: 'none'})
            return;
          }
          this.params.ToDate = stringDate
          if (this.params.FromDate) this.getData()
          break
      }
      this.showDate = false
    },
    // 获取数据
    async getData (type) {
      if (type === 'up') {
        if (this.loading) return
        this.loading = true
      } else {
        wx.showLoading({title: '加载中'})
      }

      let result = await this.$http.post('/api/CrmMobile/GetPersonalLog', Object.assign(this.params, { SearchKey: this.searchKey }))
      result = this._hanleData(result)
      this.loading = false
      this.rowCount = result.RowCount
      if (type === 'up') {
        this.listData = this.listData.concat(result.Data)
      } else {
        this.listData = result.Data
        wx.hideLoading()
      }
      if (this.listData.length == 0) this.noData = true
    },
    _hanleData(result) {
      result.Data.forEach(item => {
        if (item.fdate) item.fdate = item.fdate.split('T')[0]
      })
      return result
    },
    // 新增日志
    addJourral() {
      wx.navigateTo({ url: '../detail/main'})
    },
    showComment(id) {
      wx.navigateTo({ url: `../detail/main?id=${id}&comment=1`})
    },
    showDetail(id) {
      wx.navigateTo({ url: `../detail/main?id=${id}&actionType=detail`})
    }
  }
}
</script>

<style lang="less">
#journal{
  padding-top: 32px;
  .content {
    .list-item {
      background-color: #fff;
      margin: 6px 0;
      .desc {
        padding: 0px 15px;
        font-size: 14px;
      }
    }
  }
}
</style>

