<template>
  <div id="leaveOrder">
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
      <!-- <van-search :value="searchKey" @change="changeSearchKey" use-action-slot placeholder="请输入搜索关键词" @search="onSearch">
        <div slot="action" @tap="onSearch">搜索</div>
      </van-search> -->
    </div>
    <van-tabs swipeable custom-class="leaveOrder-tab" :active="active" @change="onChange">
      <van-tab title="请假单">
        <scroll-view scroll-y :style="{height: scrollHeight}" @scrolltolower="onReachBottom">
          <div class="list">
            <div class="list-item" v-for="(item, index) in tabs[0].listData" :key="index">
              <van-panel use-footer-slot>
                <div slot="header" class="list-header">
                  <div class="title">
                    <span style="font-weight:700" v-text="item.fbillno"></span>
                  </div>
                  <div class="status" :class="{ computed: item.fappdate }" v-text="item.fappdate ? '已审核' : '未审核'"></div>
                </div>
                <div class="desc">
                  <div>
                    <span class="label">请假类型：</span>
                    <span class="value" v-text="item.fleavetypename"></span>
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
                    <span class="label">请假原因：</span>
                    <span class="value" v-text="item.fleavereasonname"></span>
                  </div>
                </div>
                <div class="btn" slot="footer">
                  <van-button size="small" v-if="!item.fappdate && permission.edit" type="warning" @click="updateBtn(item.frowid)">修改</van-button>
                  <van-button size="small" v-if="!item.fappdate && permission.delete" type="danger" custom-class="actionBtn" @click="deleteBtn(item.frowid)">删除</van-button>
                  <van-button size="small" type="primary" custom-class="actionBtn" @click="showDetail(item.frowid)">详情</van-button>
                </div>
              </van-panel>
            </div>
            <div v-if="tabs[0].loading" class="loading">加载中...</div>
            <div v-if="tabs[0].noMore" class="noMore">没有更多数据了</div>
            <div v-if="tabs[0].listData.length == 0 && tabs[0].noData" class="noData">
              <span class="iconfont icon-ico_meiyoushuju"></span>
              <span class="text">暂无数据</span>
            </div>
          </div>
        </scroll-view>
      </van-tab>
      <van-tab title="出差单">
        <scroll-view scroll-y :style="{height: scrollHeight}" @scrolltolower="onReachBottom">
          <div class="list">
            <div class="list-item" v-for="(item, index) in tabs[1].listData" :key="index">
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
                <div class="btn" slot="footer">
                  <van-button size="small" v-if="!item.fappdate" type="warning" @click="updateBtn(item.frowid)">修改</van-button>
                  <van-button size="small" v-if="!item.fappdate" type="danger" custom-class="actionBtn" @click="deleteBtn(item.frowid)">删除</van-button>
                  <van-button size="small" type="primary" custom-class="actionBtn" @click="showDetail(item.frowid)">详情</van-button>
                </div>
              </van-panel>
            </div>
            <div v-if="tabs[1].loading" class="loading">加载中...</div>
            <div v-if="tabs[1].noMore" class="noMore">没有更多数据了</div>
            <div v-if="tabs[1].listData.length == 0 && tabs[1].noData" class="noData">
              <span class="iconfont icon-ico_meiyoushuju"></span>
              <span class="text">暂无数据</span>
            </div>
          </div>
        </scroll-view>
      </van-tab>
    </van-tabs>

    <div v-if="permission.add" class="float-button" @click="addBtn">
      <span class="iconfont icon-add"></span>
    </div>

    <van-popup :show="showDate" position="bottom" >
      <van-datetime-picker type="date" :value="currentDate" @confirm="changeDate" @cancel="showDate = false" />
    </van-popup>
  </div>
</template>

<script>
/* eslint-disable */
import { updateKey } from "@js/pageValue";
import dateFormula from "@js/dateFormula.js";
import permission from '@/mixin/permission.js'
let dateRange = dateFormula.getMonthStartAndEnd(0)
export default {
  mixins: [permission],
  data() {
    return {
      active: 0,
      searchKey: '',
      scrollHeight: 0,
      showDate: false,
      currentDate: new Date().getTime(),
      dateType: '',
      params: {
        StartDate: dateRange[0],
        EndDate: dateRange[1]
      },
      tabs: [
        {
          params: {
            PageIndex: 1,
            PageSize: 20
          },
          listData: [],
          title: '',
          getApi: '/api/CrmMobile/GetLeave',
          rowCount: 0,
          loaded: false,  // 是否已缓存
          loading: false, // 是否正在加载
          noMore: false,  // 没有更多数据
          noData: false   // 没有数据
        }, {
          params: {
            PageIndex: 1,
            PageSize: 20
          },
          listData: [],
          title: '',
          getApi: '/api/CrmMobile/GetTravelOrder',
          rowCount: 0,
          loaded: false,  // 是否已缓存
          loading: false, // 是否正在加载
          noMore: false,  // 没有更多数据
          noData: false   // 没有数据
        }
      ]
    }
  },
  onShow() {
    let update = updateKey('update', this)
    if (update) this.getData()
  },
  onLoad() {
    this._setScrollHeight()
    this.getData()
  },
  onUnload() {
    this.initPage()
  },
  methods: {
    initPage() {
      this.active = 0
      this.searchKey = ''
      this.showDate = false
      this.currentDate = new Date().getTime()
      this.dateType = ''
      this.tabs = [
        {
          params: {
            PageIndex: 1,
            PageSize: 20
          },
          listData: [],
          title: '',
          getApi: '/api/CrmMobile/GetLeave',
          rowCount: 0,
          loaded: false,  // 是否已缓存
          loading: false, // 是否正在加载
          noMore: false,  // 没有更多数据
          noData: false   // 没有数据
        }, {
          params: {
            PageIndex: 1,
            PageSize: 20
          },
          listData: [],
          title: '',
          getApi: '/api/CrmMobile/GetTravelOrder',
          rowCount: 0,
          loaded: false,  // 是否已缓存
          loading: false, // 是否正在加载
          noMore: false,  // 没有更多数据
          noData: false   // 没有数据
        }
      ]
    },
    // 获取数据
    async getData(type) {
      let currentTab = this.tabs[this.active]
      if (currentTab.loading) return
      if (type === 'up') currentTab.loading = true
      let loading = type === 'up' ? false : true
      let params = Object.assign(currentTab.params, this.params)
      try {
        let result = await this.$http.post(currentTab.getApi, params, loading)
        result = this._hanleData(result)
        currentTab.rowCount = result.RowCount
        currentTab.loaded = true
        if (type === 'up') {
          currentTab.listData = currentTab.listData.concat(result.Data)
          currentTab.loading = false
        } else {
          currentTab.listData = result.Data
        }
        currentTab.noMore = false
        if (currentTab.listData.length == 0) currentTab.noData = true
      } catch(e) {
        currentTab.loading = false
      }
    },
    // 处理数据
    _hanleData(result) {
      if (result.Data) {
        switch(this.active) {
          case 0:
            result.Data.forEach(item => {
              item.fstartdate = dateFormula.format(new Date(item.fstartdate), 'yyyy-MM-dd hh:mm:ss')
              item.fenddate = dateFormula.format(new Date(item.fenddate), 'yyyy-MM-dd hh:mm:ss')
            })
            break;
          case 1:
            result.Data.forEach(item => {
              item.fstartdate = dateFormula.format(new Date(item.fstartdate), 'yyyy-MM-dd')
              item.fenddate = dateFormula.format(new Date(item.fenddate), 'yyyy-MM-dd')
            })
            break;
        }
      }
      return result
    },
    // 设置滚动高度
    _setScrollHeight() {
      let _this = this
      wx.getSystemInfo({
        success: res => {
          let windowHeight = res.windowHeight;
          _this.scrollHeight = windowHeight - 32 - 44 + 'px'
        }
      })
    },
    // 上拉加载
    onReachBottom() {
      let currentTab = this.tabs[this.active]
      if (currentTab.rowCount <= currentTab.params.PageIndex * currentTab.params.PageSize) {
        currentTab.noMore = true
        return;
      }
      currentTab.params.PageIndex++
      this.getData('up')
    },
    // 显示日期控件
    choseDate(type) {
      this.dateType = type
      this.showDate = true
      switch (type) {
        case 'start':
          if (this.params.StartDate) this.currentDate = new Date(this.params.StartDate).getTime()
          break;
        case 'end':
          if (this.params.EndDate) this.currentDate = new Date(this.params.EndDate).getTime()
          break
      }
    },
    // 选择日期范围
    changeDate(event) {
      let stringDate = dateFormula.format(new Date(event.mp.detail), 'yyyy-MM-dd')
      switch (this.dateType) {
        case 'start':
          if (this.params.EndDate && new Date(stringDate) > new Date(this.params.EndDate)) {
            wx.showToast({ title: '开始日期不能大于结束日期', icon: 'none'})
            return;
          }
          this.params.StartDate = stringDate
          if (this.params.EndDate) {
            // this.active
            this.tabs.forEach((item, index) => {
              if (index != this.active) {
                item.loaded = false
              }
            })
            this.getData()
          }
          break;
        case 'end':
          if (this.params.StartDate && new Date(stringDate) < new Date(this.params.StartDate)) {
            wx.showToast({ title: '开始日期不能大于结束日期', icon: 'none'})
            return;
          }
          this.params.EndDate = stringDate
          if (this.params.StartDate) {
            this.tabs.forEach((item, index) => {
              if (index != this.active) {
                item.loaded = false
              }
            })
            this.getData()
          }
          break
      }
      this.showDate = false
    },
    // 切换页签
    onChange(event) {
      let index = event.mp.detail.index
      this.active = index
      let currentTab = this.tabs[index]
      if (currentTab.loaded) return
      this.getData()
    },
    // 删除
    deleteBtn(id) {
      wx.showModal({
        title: '提示',
        content: '您确定要删除吗',
        success: (res) => {
          if (res.confirm) {
            let deleteApi = ''
            let params;
            switch(this.active) {
              case 0:
                deleteApi = '/api/CrmMobile/DeleteLeave';
                params = {
                  LeaveId: id
                }
                break;
              case 1:
                deleteApi = '/api/CrmMobile/DeleteTravelOrder';
                params = {
                  TravelOrderId: id
                }
                break;
            }
            this.$http.post(deleteApi, params).then(res => {
              if (res) {
                this.getData()
              }
            })
          }
        }
      })
    },
    updateBtn(id) {
      switch (this.active) {
        case 0:
          wx.navigateTo({ url: '../../signIn/leaveDetail/main?type=update&id='+id })
          break;
        case 1:
          wx.navigateTo({ url: '../../signIn/travelDetail/main?type=update&id='+id })
          break;
      }
    },
    showDetail(id) {
      switch (this.active) {
        case 0:
          wx.navigateTo({ url: `../../signIn/leaveDetail/main?type=detail&id=${id}&permission=${JSON.stringify(this.permission)}` })
          break;
        case 1:
          wx.navigateTo({ url: `../../signIn/travelDetail/main?type=detail&id=${id}&permission=${JSON.stringify(this.permission)}` })
          break;
      }
    },
    addBtn() {
      switch (this.active) {
        case 0:
          wx.navigateTo({ url: '../../signIn/leaveDetail/main'})
          break;
        case 1:
          wx.navigateTo({ url: '../../signIn/travelDetail/main'})
          break;
      }
    },
    // 改变关键字
    changeSearchKey(event) {
      this.searchKey = event.mp.detail
    },
    // 点击搜索
    onSearch() {
      let currentTab = this.tabs[this.active]
      currentTab.title = this.searchKey
      currentTab.params.PageIndex = 1
      this.getData()
    }
  }
}
</script>

<style lang="less">
@import "~less/base-color.less";
#leaveOrder {
  height: 100%;
  background-color: @background-color;
  .search.time {
    height: 32px;
    position: relative;
  }
  .van-tabs__nav {
    background-color: #fff;
  }
  .leaveOrder-tab {
    .list {
      min-height: 100%;
      // padding: 1px 0;
      .list-item {
        margin: 6px 0;
        background-color: #fff;
        font-size: 14px;
        .desc {
          padding: 0 15px 15px;
        }
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
}
</style>
