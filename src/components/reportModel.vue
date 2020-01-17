<template>
  <div id="reportModel">
    <van-tabs class="tabs" custom-class="menu-tab" :active="active" @change="onChange" color="#2986c3" swipeable="true">
      <van-tab v-for="(item, index) in options" v-if="item.show" :title="item.title" :key="index">
        <div v-if="!item.custom " class="search">
          <div class="prev" @click="prev(item.title)" v-text="item.prev"></div>
          <div class="current" v-text="item.current"></div>
          <div class="next" @click="next(item.title)" v-text="item.next"></div>
        </div>
        <div v-if="item.custom" class="customSearch">
          <div>
            <span>开始</span>
            <span class="startDate" v-text="item.startDate" @click="choseDate('start')"></span>
          </div>
          <div>
            <span>结束</span>
            <span class="endDate" v-text="item.endDate" @click="choseDate('end')"></span>
          </div>
        </div>
        <div class="filter" v-if="hasStore">
          <van-field :value="selectedStore.text" label="门店" @click="choseStore" readonly placeholder="请选择门店"></van-field>
        </div>
        <!-- <div :style="'visibility:hidden; height:'+hideElemHeight" id="hideElem"></div> -->
      </van-tab>
    </van-tabs>

    <div class="card" :style="'height:'+cardHeight" v-if="cardHeight !== '0px'">
      <van-tabs type="card" :active="activeCard" @change="onChangeCard">
        <van-tab title="图表" class="echart">
          <div style="height: 400px" v-if="showChart && activeCard === 0">
            <mpvue-echarts :echarts="echarts" :onInit="initChart" canvasId="canvas" />
          </div>
          <div style="height: 400px" v-if="!showChart && !noData">
             <img style="height: 100%" :src="tempImage" alt="">
          </div>
          <div v-if="noData" class="noData">
            <span class="iconfont icon-ico_meiyoushuju"></span>
            <span class="text">暂无数据</span>
          </div>
        </van-tab>
        <van-tab title="列表">
          <scroll-view scroll-y :style="{ height: listHeight }">
            <report-list v-if="!noData" :list="tableList" :data="tableData"></report-list>
            <div v-if="noData" class="noData">
              <span class="iconfont icon-ico_meiyoushuju"></span>
              <span class="text">暂无数据</span>
            </div>
          </scroll-view>
        </van-tab>
      </van-tabs>  
    </div>

    <!-- <div class="bar-line"></div> -->
    <van-popup custom-class="date-picker" :show="showDate" position="bottom" >
      <van-datetime-picker type="date" :value="selectedDate" @confirm="changeDate" @cancel="cancel" />
    </van-popup>
    <van-popup v-if="hasStore" :show="showPicker" position="bottom" >
      <van-picker :columns="store" show-toolbar @confirm="changePicker" @cancel="showPicker = false"/>
    </van-popup>
  </div>
</template>

<script>
/* eslint-disable */
import dateFormula from '@js/dateFormula.js'
import mpvueEcharts from 'mpvue-echarts'
import * as echarts from '../../static/echarts/echarts.min.js';
import reportList from '@/components/reportList'

let chart = null
let currentDay = dateFormula.format(new Date(), 'yyyy-MM-dd')                                         // 当天日期
let currentWeenk = [dateFormula.getWeekStartAndEnd(0)[0], dateFormula.getWeekStartAndEnd(0)[1]]       // 当前周的起始日期
let currentMonth = [dateFormula.getMonthStartAndEnd(0)[0], dateFormula.getMonthStartAndEnd(0)[1]]     // 当前月的起始日期
let currentSeason = [dateFormula.getSeasonStartAndEnd(0)[0], dateFormula.getSeasonStartAndEnd(0)[1]]  // 当前季的起始日期
let currentYear = [dateFormula.getYearStartAndEnd(0)[0], dateFormula.getYearStartAndEnd(0)[1]]        // 当前年的起始日期
export default {
  name: 'reportModel',
  components: {
    mpvueEcharts,
    reportList
  },
  props: {
    getApi: {
      type: String,
      default: ''
    },
    hasStore: {
      type: Boolean,
      default: false
    },
    hideTabs: {
      type: Array,
      default: []
    }
  },
  data () {
    return {
      active: 0,
      activeCard: 0,
      options: [
        {
          title: '日',
          prev: '前一天',
          show: true,
          showData: false,
          currentIndex: 0,
          current: currentDay,
          startDate: currentDay,
          endDate: currentDay,
          next: '后一天'
        }, {
          title: '周',
          prev: '上一周',
          show: true,
          showData: false,
          currentIndex: 0,
          current: currentWeenk[0] + ' ~ ' + currentWeenk[1],
          startDate: currentWeenk[0],
          endDate: currentWeenk[1],
          next: '下一周'
        }, {
          title: '月',
          prev: '上一月',
          show: true,
          showData: false,
          currentIndex: 0,
          current: dateFormula.format(new Date(), 'yyyy-MM'),
          startDate: currentMonth[0],
          endDate: currentMonth[1],
          next: '下一月'
        }, {
          title: '季',
          prev: '上一季',
          show: true,
          showData: false,
          currentIndex: 0,
          current: currentSeason[0] + '~' + currentSeason[1],
          startDate: currentSeason[0],
          endDate: currentSeason[1],
          next: '下一季'
        }, {
          title: '年',
          prev: '上一年',
          show: true,
          showData: false,
          currentIndex: 0,
          current: dateFormula.format(new Date(), 'yyyy'),
          startDate: currentYear[0],
          endDate: currentYear[1],
          next: '下一年'
        }, {
          title: '自定义',
          show: true,
          showData: false,
          custom: true,
          startDate: currentDay,
          endDate: currentDay
        }
      ],
      echarts: echarts,
      showChart: true,
      selectedDate: new Date().getTime(),
      showDate: false,
      showPicker: false,
      noData: false,
      store: [],
      selectedStore: {
        value: '',
        text: ''
      },
      tableList: {},    // 表格列
      tableData: [],      // 表格数据
      cardHeight: '0px',
      listHeight: '0px',
      tempImage: '',
      echartsLoad: false,  // 当echart图表加载过一次后显示为true
    }
  },
  onLoad() {
    if (this.hideTabs.length > 0) {
      this.hideTabs.forEach(item => {
        this.options.forEach(val => {
          if (item == val.title) {
            val.show = false
          }
        })
      })
    }

    let newArr = this.options.filter( item => {
      return item.show == true
    })
    setTimeout(()=>{
      this._initData(newArr[0].title)
      this._setHeight()
    },200)
  },
  onUnload() {
    this._initPage()
  },
  methods: {
    _setHeight() {
      let windowHeight = wx.getSystemInfoSync().windowHeight
      let topHeight = 35 + 35
      let paddingHeight = 15
      if (this.hasStore) {
        topHeight += 35
      }
      this.cardHeight = windowHeight - topHeight - paddingHeight + 'px'
      this.listHeight = (windowHeight - topHeight - paddingHeight - 55) + 'px'
    },
    onChange (event) {
      this.active = event.mp.detail.index
      let currentTitle = event.mp.detail.title
      this.options.forEach( item => {
        if (item.title == currentTitle) {
          this._initData(item.title)
        }
      })
    },
    // 获取数据
    async getData (query) {
      // 获取当前机构id
      let userInfo = wx.getStorageSync('crmUserInfo')
      let store = userInfo.StoreId.split(',')
      let orgId = store[store.length - 1]
      // 参数
      let params = {
        PageIndex: 1,
        PageSize: 10,
        OrgId: orgId
      }
      if (query) params = Object.assign(params,query)
      if (this.hasStore) params = Object.assign(params, { OrgId: this.selectedStore.value })
      // 如果是首次加载eachts图表则显示Loading
      let loading = this.echartsLoad ? false : true
      let result = await this.$http.post(this.getApi, params, loading)

      if (Array.isArray(result) && result.length > 50) {
        result = result.splice(0,50)
      }
      if (!result || result.length == 0) {
        this.noData = true
        this.showChart = false
        return
      } else {
        this.noData = false
        this.showChart = true
      }
      // 由父组件统一来处理数据
      setTimeout(() => {
        this.$emit('returnRes', result)
      },100)
    },
    // 获取门店
    getStore() {
      let userInfo = wx.getStorageSync('crmUserInfo')
      let store = []
      if (userInfo.organize) {
        for (let key in userInfo.organize) {
          store.push({
            value: userInfo.organize[key].fOrgId,
            text: userInfo.organize[key].FullName
          })
        }
      }
      this.store = store
    },
    // 显示门店
    choseStore() {
      this.getStore()
      this.showPicker = true
    },
    // 设置选中的门店
    setSelectedStore(value, text) {
      this.selectedStore.value = value
      this.selectedStore.text = text
    },
    // 修改门店
    changePicker(event) {
      let currentValue = event.target.value
      this.selectedStore.value = currentValue.value
      this.selectedStore.text = currentValue.text
      this.showPicker = false
      let params = {
        OrgId: this.selectedStore.value,
        BeginDate: this.options[this.active].startDate,
        EndDate: this.options[this.active].endDate,
      }
      this.getData(params)
    },
    // 上一个
    prev (title) {
      let currentIndex;
      switch (title) {
        case '日':
          currentIndex = this.options[0].currentIndex -= 1
          break
        case '周':
          currentIndex = this.options[1].currentIndex -= 1
          break
        case '月':
          currentIndex = this.options[2].currentIndex -= 1
          break
        case '季':
          currentIndex = this.options[3].currentIndex -= 1
          break
        case '年':
          currentIndex = this.options[4].currentIndex -= 1
          break
      }
      this._changeCurrent(currentIndex,title)
    },
    // 下一个
    next (title) {
      let currentIndex
      switch (title) {
        case '日':
          currentIndex = this.options[0].currentIndex += 1
          break
        case '周':
          currentIndex = this.options[1].currentIndex += 1
          break
        case '月':
          currentIndex = this.options[2].currentIndex += 1
          break
        case '季':
          currentIndex = this.options[3].currentIndex += 1
          break
        case '年':
          currentIndex = this.options[4].currentIndex += 1
          break
      }
      this._changeCurrent(currentIndex,title)
    },
    // 改变当前日期
    _changeCurrent (currentIndex,title) {
      currentIndex = parseInt(currentIndex)
      let query;
      switch (title) {
        case '日':
          this.options[0].current = dateFormula.format(new Date(new Date().getTime() + currentIndex*24*60*60*1000), 'yyyy-MM-dd')
          this.options[0].startDate = this.options[0].current
          this.options[0].endDate = this.options[0].current
          query = {
            BeginDate: this.options[0].current,
            EndDate: this.options[0].current
          }
          break
        case '周':
          let fistDay1 = dateFormula.getWeekStartAndEnd(currentIndex)[0]
          let lastDay1 = dateFormula.getWeekStartAndEnd(currentIndex)[1]
          this.options[1].current = fistDay1 + ' ~ ' + lastDay1
          this.options[1].startDate = fistDay1
          this.options[1].endDate = lastDay1
          query = {
            BeginDate: fistDay1,
            EndDate: lastDay1
          }
          break
        case '月':
          let fistDay2 = dateFormula.getMonthStartAndEnd(currentIndex)[0]
          let lastDay2 = dateFormula.getMonthStartAndEnd(currentIndex)[1]
          this.options[2].current = dateFormula.format(new Date(fistDay2), 'yyyy-MM')
          this.options[2].startDate = fistDay2
          this.options[2].endDate = lastDay2
          query = {
            BeginDate: fistDay2,
            EndDate: lastDay2
          }
          break
        case '季':
          let fistDay3 = dateFormula.getSeasonStartAndEnd(currentIndex)[0]
          let lastDay3 = dateFormula.getSeasonStartAndEnd(currentIndex)[1]
          this.options[3].current = fistDay3 + '~' + lastDay3
          this.options[3].startDate = fistDay3
          this.options[3].endDate = lastDay3
          query = {
            BeginDate: fistDay3,
            EndDate: lastDay3
          }
          break
        case '年':
          let fistDay4 = dateFormula.getYearStartAndEnd(currentIndex)[0]
          let lastDay4 = dateFormula.getYearStartAndEnd(currentIndex)[1]
          this.options[4].current = dateFormula.format(new Date(fistDay4), 'yyyy')
          this.options[4].startDate = fistDay4
          this.options[4].endDate = lastDay4
          query = {
            BeginDate: fistDay4,
            EndDate: lastDay4
          }
      }
      
      this.getData(query)
    },
    // 显示日期组件
    choseDate (type) {
      this.handleCanvarToImg()

      let selectedValue;
      switch (type) {
        case 'start':
          selectedValue = this.options[5].startDate
          this.type = 'start'
          break
        case 'end':
          this.type = 'end'
          selectedValue = this.options[5].endDate
          break
      }
      this.showDate = true
      this.selectedDate = new Date(selectedValue).getTime()
    },
    // 改变开始日期
    changeDate (event) {
      let stringDate = dateFormula.format(new Date(event.mp.detail), 'yyyy-MM-dd')
      if (this.type === 'start') {
        if (new Date(stringDate) > new Date(this.options[5].endDate)) {
          wx.showToast({
            title: '开始日期不能大于结束日期',
            icon: 'none',
            duration: 2000
          })
          return
        }
        this.options[5].startDate = stringDate
      }else {
        if (new Date(stringDate) < new Date(this.options[5].startDate)) {
          wx.showToast({
            title: '开始日期不能大于结束日期',
            icon: 'none',
            duration: 2000
          })
          return
        }
        this.options[5].endDate = stringDate
      }
      let params = {
        BeginDate: this.options[5].startDate,
        EndDate: this.options[5].endDate
      }
      this.showChart = false
      this.getData(params, '自定义')
      this.showDate = false
    },
    onChangeCard (event) {
      this.activeCard = event.mp.detail.index
      if (event.mp.detail.index === 0) {
        this.$emit('onChange', event)
      }
    },
    // 取消
    cancel () {
      this.showChart = false
      this.showDate = false
    },
    // 初始化数据
    _initData (title) {
      let params = {}
      switch (title) {
        case '日':
          params = {
            BeginDate: this.options[0].startDate,
            EndDate: this.options[0].endDate
          }
          break;
        case '周':
          params = {
            BeginDate: this.options[1].startDate,
            EndDate: this.options[1].endDate
          }
          break;
        case '月':
          params = {
            BeginDate: this.options[2].startDate,
            EndDate: this.options[2].endDate
          }
          break;
        case '季':
          params = {
            BeginDate: this.options[3].startDate,
            EndDate: this.options[3].endDate
          }
          break;
        case '年':
          params = {
            BeginDate: this.options[4].startDate,
            EndDate: this.options[4].endDate
          }
          break;
        case '自定义':
          params = {
            BeginDate: this.options[5].startDate,
            EndDate: this.options[5].endDate
          }
          break;
      }
      this.getData(params)
    },
    // 初始化页面
    _initPage() {
      this.active = 0
      this.activeCard = 0
      this.options = [
        {
          title: '日',
          prev: '前一天',
          show: true,
          showData: false,
          currentIndex: 0,
          current: currentDay,
          startDate: currentDay,
          endDate: currentDay,
          next: '后一天'
        }, {
          title: '周',
          prev: '上一周',
          show: true,
          showData: false,
          currentIndex: 0,
          current: currentWeenk[0] + ' ~ ' + currentWeenk[1],
          startDate: currentWeenk[0],
          endDate: currentWeenk[1],
          next: '下一周'
        }, {
          title: '月',
          prev: '上一月',
          show: true,
          showData: false,
          currentIndex: 0,
          current: dateFormula.format(new Date(), 'yyyy-MM'),
          startDate: currentMonth[0],
          endDate: currentMonth[1],
          next: '下一月'
        }, {
          title: '季',
          prev: '上一季',
          show: true,
          showData: false,
          currentIndex: 0,
          current: currentSeason[0] + '~' + currentSeason[1],
          startDate: currentSeason[0],
          endDate: currentSeason[1],
          next: '下一季'
        }, {
          title: '年',
          prev: '上一年',
          show: true,
          showData: false,
          currentIndex: 0,
          current: dateFormula.format(new Date(), 'yyyy'),
          startDate: currentYear[0],
          endDate: currentYear[1],
          next: '下一年'
        }, {
          title: '自定义',
          show: true,
          showData: false,
          custom: true,
          startDate: currentDay,
          endDate: currentDay
        }
      ],
      this.echarts = echarts
      this.showChart = true
      this.selectedDate = new Date().getTime()
      this.showDate = false
      this.showPicker = false
      this.noData = false
      this.store = []
      this.selectedStore = {
        value: '',
        text: ''
      }
      this.tableOptions = []
      this.tempImage = ''
      this.hasStore = false
      this.echartsLoad = false  // 当echart图表加载过一次后显示为true
    },
    // 初始化echarts控件
    initChart(canvas, width, height) {
      chart = echarts.init(canvas, null, {
        width: width,
        height: height
      })
      canvas.setChart(chart)
      return chart
    },
    // 生成图表
    createEchars (data, type) {
      let tmpData = data;
      if (type === 'bars' && data.length > 6) {
        tmpData = data.slice(0,6);
      } else if (type === 'bar' && data.length > 10) {
        tmpData = data.slice(0,10);
      } else if (type === 'pie' && data.length > 10) {
        tmpData = data.slice(0,9);
        let otherData = data.slice(10)
        // 核算其他数据的总值
        let otherAllValue = otherData.reduce((prev, cur) => {
          return parseFloat(prev) + parseFloat(cur.value);
        }, 0)
        tmpData.push({
          name: '其它',
          value: otherAllValue
        })
      }

      let legendData = tmpData.map(item => { 
        return item.name || ''
      })
      let option;
      if (type === 'pie') {
        option = {
          legend: {
            bottom: 10,
            left: 'center',
            data: legendData,
            formatter: function(name) {
              // 名称长度大于9超出的部分用省略号显示
              if (name && name.length > 9) {
                return name.slice(0, 8) + '...'
              } else {
                return name
              }
            },
            padding: [30,0,0,0]
          },
          series: [{
            type: 'pie',
            radius: '65%',
            center: ['45%', '35%'],
            selectedMode: 'single',
            label: {
              normal: { 
                show: true,
                position: 'inside',
                formatter: '{d}%'
              }
            },
            labelLine: {
              normal: { show: false }
            },
            data: tmpData
          }]
        }
      } else if (type === 'bar') {
        let barData = tmpData.map(item => { return item.value })
        option = {
          legend: {
            data: ['转化率']
          },
          grid: {
              left: '0%',
              right: '0%',
              bottom: '3%',
              containLabel: true
          },
          xAxis: {
            type: 'value',
            splitNumber: 4,
            boundaryGap: [0, 0.01],
            label: {
              normal: {
                show: true
              }
            }
          },
          yAxis: {
            type: 'category',
            data: legendData,
            inverse: true,
            axisLabel: {
              formatter: function(value) {
                return value.length > 6 ? value.substring(0,6)+'...' : value;
              }
            }
          },
          series: [{
            name: '比例',
            type: 'bar',
            data: barData,
            label: {
              normal: {
                show: true,
                position: 'inside',
              }
            }
          }]
        }
      } else if (type === 'bars') {
        option = {
          dataset: {
            source: tmpData
          },
          xAxis: {
            splitNumber: 4
          },
          yAxis: {
            type: 'category',
            axisLabel: {
              formatter: function(value) {
                return value.length > 6 ? value.substring(0,6)+'...' : value;
              }
            }
          },
          grid: [
            { left: '25%' },
            { top: '5%' },
            { right: '0%' }
          ],
          series: [
            {
              type: 'bar',
              label: {
                normal: {
                  show: true
                }
              }
            },{
              type: 'bar',
              label: {
                normal: {
                  show: true
                }
              }
            }
          ]
        }
      }
      chart.setOption(option)
      this.echartsLoad = true
    },
    // 生成表格
    createTable(tableList, tableData) {
      this.tableList = tableList
      this.tableData = tableData
    },
    handleCanvarToImg() {
        let _this = this;
        wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            height: 300,
            canvasId: 'canvas',
            success: function(res) {
                _this.tempImage = res.tempFilePath
                _this.showChart = false
            }
        });
    },
  },
  watch: {
    getApi () {
      let newArr = this.options.filter( item => {
        return item.show == true
      })
      this._initData(newArr[0].title)
    }
  }
}
</script>

<style lang="less">
@import '~less/custom-vant.less';
#reportModel {
  height: 100%;
  background-color: #f0eff4;
  .search {
    box-sizing: border-box;
    background-color: #2986c3;
    display: flex;
    font-size: 14PX;
    color: #fff;
    justify-content: space-between;
    height: 35PX;
    border-top: 1PX solid #000;
    .prev,
    .next {
      padding: 0 8PX;
      line-height: 34PX;
    }
    .current {
      line-height: 34PX;
    }
  }
  .filter {
    height: 35PX;
    box-sizing: border-box;
    .van-cell {
      padding: 6PX 10PX;
    }
  }
  .tabs {
    .van-tab__pane {
      overflow-y: hidden;
    }
  }

  .card {
    margin: 6PX auto 0;
    background: #fff;
    width: 95%;
    padding-top: 10PX;
    box-sizing: border-box;
    border-radius: 4PX;
    border: 1PX solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 1PX 3PX rgba(0, 0, 0, 0.1);
    min-height: 350PX;

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

  .echart {
    width: 100%;
    height: 300PX;
  }
}

</style>

<style>
.date-picker {
  width: 100%;
  position: fixed;
  bottom: 0;
}
#reportModel .van-tabs--card .van-tabs__scroll--card {
  border:1px solid #00aff2 !important;
}
#reportModel .van-tabs__nav--card .van-tab.van-tab--active {
  background-color: #00aff2 !important;
  color: #fff !important;
}
#reportModel .van-tabs__nav--card .van-tab {
  color: #00aff2 !important;
  border-right: none !important;
}
#reportModel .van-tabs--card .van-tabs__wrap {
  pointer-events: auto;
}
#reportModel .van-tabs--card {
  margin: 0 10PX;
}
</style>