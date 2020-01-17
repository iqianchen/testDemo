<template>
  <div id="reimbursement" class="panel">
    <div class="search time">
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
              <span v-text="item.fbillno"></span>
            </div>
            <div class="status" :class="{ computed: item.fappdate }" v-text="item.fappdate ? '已审核' : '未审核'"></div>
          </div>
          <div class="desc">
              <div>
                <span>报销人:</span>
                <span v-text="item.freimbursername"></span>
              </div>
              <div>
                <span>报销时间:</span>
                <span v-text="item.fdate"></span>
              </div>
              <div>
                <span>报销部门:</span>
                <span v-text="item.fdeptname || ''"></span>
              </div>
              <div>
                <span>报销金额:</span>
                <span v-text="item.ftotalamt"></span>
              </div>
          </div>
          <view slot="footer">
            <div class="btn">
              <van-button v-if="!item.AppDate && permission.edit" size="small" @click="updateBtn(item.frowid)" type="warning">修改</van-button>
              <van-button v-if="!item.AppDate && permission.delete" custom-class="actionBtn" size="small" @click="deleteBtn(item.frowid)" type="danger">删除</van-button>
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

    <div class="float-button" v-if="permission.add" @click="addSalesOrder">
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
import permission from '@/mixin/permission.js'
let dateRange = dateFormula.getMonthStartAndEnd(0)
import { updateKey } from '@js/pageValue'
export default {
  mixins: [permission],
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
      loading: false,
      showPopup: false,
      showDate: false,
      dateType: '',
      currentDate: new Date().getTime(),
      radio: '',

    }
  },
  mounted() {
    this.getData()
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
      this.showPopup = false
      this.showDate = false
      this.dateType = ''
      this.radio = ''
      this.currentDate = new Date().getTime(),
      this.params = {
        PageIndex: 1,
        PageSize: 20,
        FromDate: dateRange[0],
        ToDate: dateRange[1]
      }
    },
    // 获取数据
    async getData (type) {
      if (type === 'up') {
        if (this.loading) return
        this.loading = true
      } else {
        wx.showLoading({title: '加载中'})
      }

      let result = await this.$http.post('/api/CrmMobile/GetReimbursement', Object.assign(this.params, { SearchKey: this.searchKey }))
      result = this._hanleData(result)
      this.loading = false
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
    _hanleData(result) {
      if (!result) return
      if (result.Data) {
        result.Data.forEach(item => {
          item.fdate = dateFormula.format(new Date(item.fdate), 'yyyy-MM-dd')
        })
      }
      return result
    },
    onChange(event) {
      this.radio = event.detail
    },
    reset() {
      this.params.FromDate = ''
      this.params.ToDate = ''
      this.getData()
      this.showPopup = false
    },
    confirm() {
      this.getData()
      this.showPopup = false
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
    // 进入修改界面
    updateBtn(id) {
      wx.navigateTo({ url: "../detail/main?type=update&id=" + id})
    },
    addSalesOrder(id) {
      wx.navigateTo({ url: "../detail/main?type=add&id=" + id})
    },
    // 删除
    deleteBtn(id) {
      wx.showModal({
        title: '提示',
        content: '您确定要取消该报销单吗',
        success: (res) => {
          if (res.confirm) {
            let params = { ReimbursementId: id }
            this.$http.post('/api/CrmMobile/DeleteReimbursement', params).then(result => {
              if (result) {
                this.params.PageIndex = 1
                this.getData() 
              }
            })
          }
        }
      })
    },
    // 显示详情页
    showDetail(id) {
      wx.navigateTo({ url: `../detail/main?type=detail&id=${id}&permission=${JSON.stringify(this.permission)}`})
    },
    // 显示附件
    showFiles() {}
  }
}
</script>

<style lang="less">
@import "~less/base-color.less";
#reimbursement {
  padding-top: 32px;
  .content {
    .list-item {
      margin: 6px 0;
    }
    .desc {
      font-size: 14px;
      padding: 6px 10px;
    }
  }
}
</style>

