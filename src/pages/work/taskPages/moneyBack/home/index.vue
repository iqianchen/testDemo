<template>
  <div id="moneyBack">
    <div class="scroll-content">
      <scroll-view scroll-y :style="{ height: scrollHeight }" @scrolltolower="onReachBottom">
        <div class="content-item" v-if="active == 0">
          <!-- 统计 -->
          <van-cell-group custom-class="custom-cell-group" title="本月回款统计">
            <van-cell title="开单数" :value="statisticData.fordnum" />
            <van-cell title="接待客户" :value="statisticData.fprospectivecustnum" />
            <van-cell title="新增商机" :value="statisticData.fchancenum" />
            <van-cell title="销售金额" :value="statisticData.ftotalamt" />
            <van-cell title="回款金额" :value="statisticData.fpaiedamt" />
            <van-cell title="未收金额" :value="statisticData.fnopayamt" />
            <van-cell title="商机转换率(%)" :value="statisticData.fchanceconvertrate" />
            <van-cell title="客户成交率(%)" :value="statisticData.fsuccessrate" />
          </van-cell-group>
        </div>

        <div class="content-item detail" v-if="active == 1">
          <!-- 明细 -->
          <div class="search time">
            <div class="date">
              <div>
                <span>开始</span>
                <span @click="choseDate('start')" v-text="details.params.StartDate"></span>
              </div>
              <div>
                <span>结束</span>
                <span @click="choseDate('end')" v-text="details.params.EndDate"></span>
              </div>
            </div>
            <!-- <van-search :value="details.params.SearchKey" @change="changeSearchKey" use-action-slot placeholder="请输入客户名称" @search="onSearch">
              <div slot="action" @tap="onSearch">搜索</div>
            </van-search> -->
            <div class="my-search">
              <div class="search-content">
                <span class="iconfont icon-sousuo"></span>
                <input class="search-body" :value="details.params.SearchKey" type="text" @blur="changeSearchKey" placeholder="请输入客户名称" @confirm="onSearch">
              </div>
              <div class="search-action" @click="onSearch">搜索</div>
            </div>
          </div>
          <div class="content">
            <div class="list" v-for="(item, index) in details.data" :key="index" >
              <div class="title">
                <span v-text="item.fcustname"></span>
              </div>
              <div class="desc">
                <div>
                  <span class="label">销售订单：</span>
                  <span v-text="item.fbillno || ''"></span>
                </div>
                <div>
                  <span class="label">开单金额：</span>
                  <span v-text="item.ftotalamt || ''"></span>
                </div>
                <div>
                  <span class="label">回款金额：</span>
                  <span v-text="item.fpaiedamt || ''"></span>
                </div>
                <div>
                  <span class="label">未收金额：</span>
                  <span v-text="item.fnopayamt || ''"></span>
                </div>
              </div>
            </div>
            <div v-if="details.loading" class="loading">加载中...</div>
            <div v-if="details.noMore" class="noMore">没有更多数据了</div>
            <div v-if="details.data.length == 0 && details.noData" class="noData">
              <span class="iconfont icon-ico_meiyoushuju"></span>
              <span class="text">暂无数据</span>
            </div>
          </div>
        </div>
      </scroll-view>
    </div>
    <van-tabbar :active="active" @change="onChange">
      <van-tabbar-item>
        <i slot="icon" class="iconfont icon-tongji"></i>
        <i slot="icon-active" class="iconfont icon-tongji"></i>
        统计
      </van-tabbar-item>
      <van-tabbar-item>
        <i slot="icon" class="iconfont icon-mingxichaxun"></i>
        <i slot="icon-active" class="iconfont icon-mingxichaxun"></i>
        明细
      </van-tabbar-item>
    </van-tabbar>

    <van-popup :show="showDate" position="bottom" >
      <van-datetime-picker type="date" :value="currentDate" @confirm="changeDate" @cancel="showDate = false" />
    </van-popup>
  </div>
</template>

<script>
/* eslint-disable */
import permission from '@/mixin/permission.js'
import { updateKey } from '@js/pageValue'
import dateFormula from "@js/dateFormula.js";

let dateRange = dateFormula.getMonthStartAndEnd(0)
export default {
  mixins: [permission],
  data() {
    return {
      scrollHeight: 0,
      active: 0,
      showDate: false,
      currentDate: new Date().getTime(),
      statisticData: {
        fordnum: '',
        fprospectivecustnum: '',
        fchancenum: '',
        ftotalamt: '',
        fpaiedamt: '',
        fnopayamt: '',
        fchanceconvertrate: '',
        fsuccessrate: ''
      },
      statisticLoaded: false,
      // statistics: {
      //   loaded: false
      // },
      details: {
        data: [],
        params: {
          PageIndex: 1,
          PageSize: 20,
          SearchKey: '',
          StartDate: dateRange[0],
          EndDate: dateRange[1]
        },
        rowCount: 0,
        loaded: false,
        loading: false,
        noMore: false,
        noData: false
      }
    }
  },
  mounted() {
    this.getStatistics()
    this._setScrollHeight()
  },
  onUnload() {
    this.initPage()
  },
  onShow() {
    let customer = updateKey('customer', this)
    if (customer) {
      this.details.params.CustomerId = customer.Id
      this.details.params.CustomerName = customer.Name
      this.getDetails()
    }
  },
  methods: {
    initPage() {
      this.active = 0,
      this.showDate = false
      this.currentDate = new Date().getTime()
      this.statisticData = {
        fordnum: '',
        fprospectivecustnum: '',
        fchancenum: '',
        ftotalamt: '',
        fpaiedamt: '',
        fnopayamt: '',
        fchanceconvertrate: '',
        fsuccessrate: ''
      }
      this.statisticLoaded = false
      // this.statistics = {
      //   data: {
      //     fordnum: '',
      //     fprospectivecustnum: '',
      //     fchancenum: '',
      //     ftotalamt: '',
      //     fpaiedamt: '',
      //     fnopayamt: '',
      //     fchanceconvertrate: '',
      //     fsuccessrate: ''
      //   },
      //   loaded: false
      // },
      this.details = {
        data: [],
        params: {
          PageIndex: 1,
          PageSize: 20,
          SearchKey: '',
          StartDate: dateRange[0],
          EndDate: dateRange[1]
        },
        rowCount: 0,
        loaded: false,
        loading: false,
        noMore: false,
        noData: false
      }
    },
    // 设置滚动高度 
    _setScrollHeight() {
      wx.getSystemInfo({
        success: res => {
          let windowHeight = res.windowHeight;
          this.scrollHeight = windowHeight - 50 + "px";
        }
      });
    },
    // 获取个人月度回款
    async getStatistics() {
      if (this.statisticLoaded) return
      let result = await this.$http.post('/api/CrmMobile/GetMonthlyReturn', {}, true)
      this.statisticLoaded = true
      if (result) {
        // this.statisticData = {}
        this.statisticData = result
      }
    },
    // 获取回款明细
    async getDetails(type) {
      if (this.details.loaded && this.details.loading) return
      if (type == 'up') this.details.loading = true
      let loading = type == 'up' ? false : true
      let result = await this.$http.post('/api/CrmMobile/GetReturnDetails', this.details.params, loading)
      this.details.loaded = true
      this.details.rowCount = result.RowCount
      if (type == 'up') {
        this.details.loading = false
        this.details.data = this.details.data.concat(result.Data)
      } else {
        this.details.data = result.Data
      }
      this.details.noMore = false
      if (this.details.data.length == 0) this.details.noData = true
    },
    // 更改日期
    changeDate(event) {
      let stringDate = dateFormula.format(new Date(event.mp.detail), 'yyyy-MM-dd')
      switch (this.dateType) {
        case 'start':
          if( this.details.params.EndDate && new Date(stringDate) > new Date(this.details.params.EndDate)) {
            wx.showToast({ title: '开始日期不能大于结束日期', icon: 'none'})
            return;
          }
          this.details.params.StartDate = stringDate
          break;
        case 'end':
          if (this.details.params.StartDate && new Date(stringDate) < new Date(this.details.params.StartDate)) {
            wx.showToast({ title: '开始日期不能大于结束日期', icon: 'none'})
            return;
          }
          this.details.params.EndDate = stringDate
          break;
      }
      this.showDate = false
      if (this.details.params.StartDate && this.details.params.EndDate) {
        this.details.params.PageIndex = 1
        this.getDetails()
      }
    },
    choseDate(type) {
      this.dateType = type
      this.showDate = true
      switch (type) {
        case 'start':
          if (this.details.params.StartDate) this.currentDate = new Date(this.details.params.StartDate).getTime()
          break;
        case 'end':
          if (this.details.params.EndDate) this.currentDate = new Date(this.details.params.EndDate).getTime()
          break;
      }
    },
    onSearch() {
      setTimeout(()=>{
        this.details.params.PageIndex = 1
        this.getDetails()
      },100)
    },
    changeSearchKey(event) {
      this.details.params.SearchKey = event.mp.detail.value
    },
    // 改变tabbar
    onChange(event) {
      this.active = event.mp.detail;
      switch (this.active) {
        case 0:
          this.getStatistics()
          break;
        case 1:
          this.getDetails()
          break
      }
    },
    // 下拉事件
    onReachBottom() {
      if (this.active == 1) {
        if (this.details.rowCount <= this.details.params.PageIndex * this.details.params.PageSize) {
          this.details.noMore = true
          return
        }
        this.details.params.PageIndex++
        this.getDetails('up')
      }
    }
  }
}
</script>

<style lang="less">
@import "~less/base-color.less";
#moneyBack {
  .scroll-content {
    background-color: @background-color;
    .content-item {
      &.detail {
        padding-top: 87px;
        padding-bottom: 6px;
        .search {
          box-sizing: border-box;
          height: 87px;
          background-color: #fff;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 10;
          width: 100%;
          border-bottom: 1px solid #f7f7f7;
          font-size:14px;
        }
        .content {
          .list {
            background-color: #fff;
            font-size: 14px;
            margin: 6px 0;
            .title {
              padding: 6px 15px;
              font-weight: 700
            }
            .desc {
              padding: 8px 15px;
              line-height: 1.5em;
            }
          }
          .loading,
          .noMore {
            font-size: 16px;
            color: @help-color;
            text-align: center;
            margin: 8px 0;
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
      }
    }
  }
}
</style>

