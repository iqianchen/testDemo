<template>
  <div id="businessOpportunity" class="panel">
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
      <div class="source">
        <van-field :value="params.SourceName" label="商机来源" @click="choseSource" @clear="getData" readonly placeholder="请选择商机来源" clearable />
      </div>
      <!-- <van-search :value="searchKey" @change="changeSearchKey" use-action-slot placeholder="请输入搜索关键词" @search="onSearch">
        <div slot="action" @tap="onSearch">搜索</div>
      </van-search> -->
    </div>

    <div class="content"> 
      <div class="list-item" v-for="(item, index) in listData" :key="index" >
        <van-panel use-footer-slot>
          <div slot="header" class="list-header">
            <div class="title">
              <span v-text="item.fcontacts || ''"></span>
              <!-- <div class="subTitle">手机号码：{{item.fmobile || ''}}</div> -->
            </div>
            <!-- <div class="status" :class="{ computed: item.AppDate }" v-text="item.AppDate ? '已审核' : '未审核'"></div> -->
          </div>
          <div class="desc">
            <div>
              <span class="label">客户名称</span>：
              <span v-text="item.fcontacts || ''"></span>
            </div>
            <div>
              <span class="label">手机号码</span>：
              <span v-text="item.fmobile || ''"></span>
            </div>
            <div>
              <span class="label">商机来源</span>：
              <span v-text="item.fsourcename || ''"></span>
            </div>
            <div>
              <span class="label">客户类别</span>：
              <span v-text="item.fcustflagtext || ''"></span>
            </div>
            <div>
              <span class="label">建立人</span>：
              <span v-text="item.fcreatorname || ''"></span>
            </div>
          </div>
          <view slot="footer">
            <div class="btn">
              <van-button size="small" v-if="item.fistocustom && permission.edit" @click="changeToCustom(item.fchanceid)" type="info">转换客户</van-button>
              <!-- <van-button size="small" custom-class="actionBtn" v-if="permission.edit" @click="updateBtn(item.fchanceid)" type="warning">修改</van-button>
              <van-button size="small" custom-class="actionBtn" v-if="permission.delete" @click="deleteBtn(item.fchanceid)" type="danger">删除</van-button> -->
              <van-button size="small" custom-class="actionBtn" @click="transferToBtn(item.fchanceid)" type="primary">分配</van-button>
              <van-button size="small" custom-class="actionBtn" @click="share(item.fchanceid)" type="warning">共享</van-button>
              <van-button size="small" custom-class="actionBtn" @click="showDetail(item.fchanceid)" type="primary">详情</van-button>
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

    <div class="float-button" v-if="permission.add" @click="addBtn">
      <span class="iconfont icon-add"></span>
    </div>

    <van-popup :show="showDate" position="bottom" >
      <van-datetime-picker type="date" :value="currentDate" @confirm="changeDate" @cancel="showDate = false" />
    </van-popup>
    <van-popup :show="showPicker" position="bottom" >
      <!-- <van-datetime-picker type="date" :value="currentDate" @confirm="changeDate" @cancel="showDate = false" /> -->
      <van-picker :columns="source" show-toolbar @confirm="changePicker" @cancel="showPicker = false"/>
    </van-popup>
  </div>
</template>

<script>
/* eslint-disable */
import { updateKey } from '@js/pageValue'
import permission from '@/mixin/permission.js'
import dateFormula from "@js/dateFormula.js";

let dateRange = dateFormula.getMonthStartAndEnd(0)
export default {
  mixins: [permission],
  data() {
    return {
      showDate: false,
      showPicker: false,
      currentDate: new Date().getTime(),
      dateType: '',
      searchKey: '',
      params: {
        PageIndex: 1,
        PageSize: 20,
        StartDate: dateRange[0],
        EndDate: dateRange[1],
        SourceId: '',
        SourceName: ''
      },
      source: [],
      listData: [],
      selectedId: '',
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
    let user = updateKey('user', this)
    if (update) this.getData()
    if (user && this.selectedId) this.transferTo(user.UserId)
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
      this.showDate = false
      this.showPicker = false
      this.currentDate = new Date().getTime()
      this.dateType = ''
      this.searchKey = ''
      this.selectedId = ''
      this.listData = []
      this.source = []
      this.noMore = false
      this.noData = false
      this.loading = false
      this.params = {
        PageIndex: 1,
        PageSize: 20,
        StartDate: dateRange[0],
        EndDate: dateRange[1],
        SourceId: '',
        SourceName: ''
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

      let result = await this.$http.post('/api/CrmMobile/GetCrmChance', Object.assign(this.params, { SearchKey: this.searchKey }))
      this.loading = false
      this.rowCount = result.RowCount
      result = this._handleData(result)
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
      result.Data.forEach(item => {
        if (item.fcustflag !== null && item.fcustflag !== undefined) {
          switch(parseInt(item.fcustflag)) {
            case 0:
              item.fcustflagtext = '个人客户';
              break;
            case 1:
              item.fcustflagtext = '公海客户';
              break;
          }
        }
      })
      return result
    },
    // 获取商机来源
    async getSource() {
      let result = await this.$http.post('/api/CrmMobile/GetDataItemDetail', { EnCode: 'CrmChanceSource'})
      if (result) {
        this.source = result.map(item => {
          return {
            text: item.Text,
            value: item.Value
          }
        })
      }
    },
    // 分配按钮   
    transferToBtn(id) {
      this.selectedId = id
      wx.navigateTo({ url: '/pages/customerManage/user/main'})
    },
    // 分配
    async transferTo(userId) {
      let params = {
        ChanceId: this.selectedId,
        BelongId: userId
      }
      let result = await this.$http.post('/api/CrmMobile/CrmChanceSetCustBelong', params, true)
      if (result) {
        this.getData()
        wx.showToast({ title: '分配成功',duration: 600})
      }
    },
    // 共享
    async share(id) {
      let params = {
        ChanceId: id,
        CustFlag: 1
      }
      let result = this.$http.post('/api/CrmMobile/CrmChanceSetCustFlag', params, true)
      if (result) {
        this.getData()
        wx.showToast({ title: '共享成功',duration: 600})
      }
    },
    // 更改日期
    changeDate(event) {
      let stringDate = dateFormula.format(new Date(event.mp.detail), 'yyyy-MM-dd')
      switch (this.dateType) {
        case 'start':
          if( this.params.EndDate && new Date(stringDate) > new Date(this.params.EndDate)) {
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
          break;
      }
      this.showDate = false
      if (this.params.StartDate && this.params.EndDate) {
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
    choseSource() {
      this.getSource()
      this.showPicker = true
    },
    changePicker(event) {
      let currentValue = event.target.value
      this.params.SourceId = currentValue.value
      this.params.SourceName = currentValue.text
      this.showPicker = false
      this.getData()
    },
    // 搜索
    // onSearch () {
    //   this.params.PageIndex = 1
    //   this.getData()
    // },
    // 改变所有关键字
    changeSearchKey (event) {
      this.searchKey = event.mp.detail
    },
    addBtn() {
      wx.navigateTo({ url: '../detail/main'})
    },
    // updateBtn(id) {
    //   wx.navigateTo({ url: '../detail/main?type=update&id='+id})
    // },
    showDetail(id) {
      wx.navigateTo({ url: '../detail/main?type=detail&id='+id})
    },
    // deleteBtn(id) {
    //   wx.showModal({
    //     title: '提示',
    //     content: '您确定要删除该商机',
    //     success: (res) => {
    //       if (res.confirm) {
    //         let params = { ChanceId: id }
    //         this.$http.post('/api/CrmMobile/DeleteCrmChance', params).then(result => {
    //           if (result) {
    //             this.params.PageIndex = 1
    //             this.getData() 
    //           }
    //         })
    //       }
    //     }
    //   })
    // },
    // 转换商机
    async changeToCustom(id) {
      let params = {
        ChanceId: id
      }
      wx.showLoading({title: '加载中'})
      let result = await this.$http.post('/api/CrmMobile/CrmChanceToCustomer', params)
      wx.hideLoading()
      if (result) {
        wx.showToast({ title: '转换成功', duration: 500})
        this.getData()
      }
    }
  }
}
</script>


<style lang="less">
#businessOpportunity {
  padding-top: 76px;
  .source {
    .van-cell::after {
      left: 0px;
    }
  }
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

