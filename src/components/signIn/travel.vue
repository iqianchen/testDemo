<template>
  <div id="travel">
    <div class="search time">
      <div class="date">
        <div>
          <span>开始</span>
          <span @click="choseDate('start')" v-text="params.StartDate"></span>
        </div>
        <div>
          <span>结束</span>
          <span @click="choseDate('end')" v-text="params.EndDate"></span>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="list-item" v-for="(item, index) in listData" :key="index" @click="showDetail(item.frowid)">
        <van-panel use-footer-slot>
          <div slot="header" class="list-header">
            <div class="title">
              <span style="font-weight:700" v-text="item.fbillno"></span>
            </div>
            <div class="status" :class="{ computed: item.fappdate }" v-text="item.fappdate ? '已审核' : '未审核'"></div>
          </div>

          <div class="desc">
            <div>
              <span class="label">出差标题：</span>
              <span class="value" v-text="item.ftitle"></span>
            </div>
            <div>
              <span class="label">开始时间：</span>
              <span class="value" v-text="item.fstartdate"></span>
            </div>
            <div>
              <span class="label">结束时间：</span>
              <span class="value" v-text="item.fenddate"></span>
            </div>
            <div>
              <span class="label">出差人数：</span>
              <span class="value" v-text="item.ftravelnum"></span>
            </div>
            <div>
              <span class="label">出差地址：</span>
              <span class="value" v-text="item.faddress"></span>
            </div>
          </div>
        </van-panel>
      </div>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-if="noMore" class="noMore">没有更多数据了</div>
      <div v-if="listData.length == 0 && noData" class="noData">
        <span class="iconfont icon-ico_meiyoushuju"></span>
        <span class="text">暂无数据</span>
      </div>
    </div>
    <div class="float-button addBtn" @click="addDetail">
      <span class="iconfont icon-add"></span>
    </div>

    <van-popup :show="showDate" position="bottom" >
      <van-datetime-picker type="date" :value="currentDate" @confirm="changeDate" @cancel="showDate = false" />
    </van-popup>
  </div>
</template>

<script>
/* eslint-disable */
import dateFormula from '@/utils/dateFormula.js'

let dateRange = dateFormula.getMonthStartAndEnd(0)
export default {
  data() {
    return {
      params: {
        PageIndex: 1,
        PageSize: 20,
        StartDate: dateRange[0],
        EndDate: dateRange[1]
      },
      rowCount: 0,
      listData: [],
      loading: false,
      noMore: false,
      noData: false,
      showDate: false,
      currentDate: new Date().getTime(),
      dateType: ''
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
      this.params = {
        PageIndex: 1,
        PageSize: 20,
        StartDate: dateRange[0],
        EndDate: dateRange[1]
      }
      this.rowCount = 0
      this.listData = []
      this.loading = false
      this.noMore = false
      this.noData = false
      this.showDate = false
      this.currentDate = new Date().getTime()
      this.dateType = ''
    },
    onReachBottom() {
      if (this.rowCount <= this.params.PageIndex * this.params.PageSize) {
        this.noMore = true
        return
      }
      this.params.PageIndex++
      this.getData('up')
    },
    // 获取数据
    async getData(type) {
      if (type === 'up') {
        if (this.loading) return
      } else {
        wx.showLoading({title: '加载中'})
      }
      let result = await this.$http.post('/api/CrmMobile/GetTravelOrder', this.params)
      result = this._handleData(result)
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
    _handleData(result) {
      if (result.Data) {
        result.Data.forEach(item => {
          item.fstartdate = dateFormula.format(new Date(item.fstartdate), 'yyyy-MM-dd')
          item.fenddate = dateFormula.format(new Date(item.fenddate), 'yyyy-MM-dd')
        })
      }
      return result
    },
    // 改变日期
    changeDate(event) {
      let stringDate = dateFormula.format(new Date(event.mp.detail), 'yyyy-MM-dd')
      switch (this.dateType) {
        case 'start':
          if (this.params.EndDate && new Date(stringDate) > new Date(this.params.EndDate)) {
            wx.showToast({ title: '开始日期不能大于结束日期', icon: 'none'})
            return;
          } 
          this.params.StartDate = stringDate
          break;
        case 'end':
          if (this.params.StartDate && new Date(stringDate) < new Date(this.params.StartDate)) {
            wx.showToast({ title: '开始日期不能大于结束日期', icon: 'none'})
            return;
          }
          this.params.EndDate = stringDate
          break
      }
      this.showDate = false
      if (this.params.EndDate && this.params.StartDate) {
        this.params.PageIndex = 1
        this.getData()
      }
    },
    choseDate(type) {
      this.dateType = type
      this.showDate = true
      switch (type) {
        case 'start':
          if (this.params.StartDate) this.currentDate = new Date(this.params.StartDate).getTime()
          break;
        case 'end':
          if (this.params.EndDate) this.currentDate = new Date(this.params.EndDate).getTime()
          break;
      }
    },
    // 新增
    addDetail() {
      wx.navigateTo({ url: '/pages/taskPages/signIn/travelDetail/main'})
    },
    // 查看详情
    showDetail(id) {
      wx.navigateTo({ url: '/pages/taskPages/signIn/travelDetail/main?type=detail&id='+id})
    }
  }
}
</script>

<style lang="less">
@import "~less/base-color.less";
#travel {
  min-height: 100%;
  box-sizing: border-box;
  padding-top: 32px;
  background-color: @background-color;
  .content {
    .list-item {
      margin: 6px 0;
      background-color: #fff;
      font-size: 14px;
      .desc {
        padding: 0 15px 15px;
      }
    }
    .loading,
    .noMore {
      font-size: 16px;
      color: @help-color;
      text-align: center;
      padding: 8px 0;
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
  .addBtn {
    bottom: 70px
  }
}
</style>
