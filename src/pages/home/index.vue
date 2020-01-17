<template>
  <div id="home">
    <van-tabs custom-class="menu-tab" class="tabs" :active="active" @change="onChange" color="#2986c3" swipeable="true">
      <van-tab class="tab-item"  v-for="(item, index) in chartsData" :key="index" :title="item.tab">
        <div class="home-table">
          <list-table v-if="item.show" :listData="item.listData" :listTitle="item.listTitle"></list-table>
        </div>
        <div class="home-echarts">
          <div class="pie" v-if="item.show" style="height:180px">
            <mpvue-echarts :echarts="echarts" :onInit="item.chart1" :canvasId="'pie-canvas'+index" />
          </div>
          <div style="height:170px" v-if="index == 3"></div>
          <div class="line" v-if="item.show && index != 3" style="height:170px; margin-top: -30px; margin-bottom: 10px;">
            <mpvue-echarts  :echarts="echarts" :onInit="item.chart2" :canvasId="'line-canvas'+index" />
          </div>
          <div class="line" v-if="item.show && index == 4" style="height:170px; margin-top: -40px">
            <mpvue-echarts :echarts="echarts" :onInit="item.chart3" :canvasId="'line-canvas2'+index" />
          </div>
        </div>
      </van-tab>
    </van-tabs>

    <div class="bar-line"></div>
  </div>
</template>

<script>
/* eslint-disable */
import listTable from '@/components/list-table'
import * as echarts from '../../../static/echarts/echarts.min.js';
import mpvueEcharts from 'mpvue-echarts'

let chart = null

export default {
  components: {
    mpvueEcharts,
    listTable
  },
  data () {
    return {
      echarts,
      active: 0,
      chartsData: [
        { show: false, img1: false, img2: false, title: '月度业绩统计表', tab: '月度' },
        { show: false, img1: false, img2: false, title: '季度业绩统计表', tab: '季度' },
        { show: false, img1: false, img2: false, title: '年度业绩统计表', tab: '年度' },
        { show: false, img1: false, img2: false, title: '个人业绩统计表', tab: '个人' },
        { show: false, img1: false, img2: false, title: '客户业绩统计表', tab: '商机' }
      ]
    }
  },
  mounted () {
    this.getReport(0)
  },
  onUnload () {
    this.initPage()
  },
  methods: {
    // 初始化页面
    initPage() {
      this.active = 0
      this.chartsData = [
        { show: false, img1: false, img2: false, title: '月度业绩统计表', tab: '月度' },
        { show: false, img1: false, img2: false, title: '季度业绩统计表', tab: '季度' },
        { show: false, img1: false, img2: false, title: '年度业绩统计表', tab: '年度' },
        { show: false, img1: false, img2: false, title: '个人业绩统计表', tab: '个人' },
        { show: false, img1: false, img2: false, title: '客户业绩统计表', tab: '商机' }
      ]
    },
    onChange (event) {
      let currentIndex = event.target.index
      if (!this.chartsData[currentIndex].show) {
        this.getReport(currentIndex)
      }
    },
    // 获取业绩排行
    async getReport (index) {
      let currentIndex = parseFloat(index)
      let year = new Date().getFullYear()
      let month = new Date().getMonth() + 1
      year = year + ''
      month = month.length > 1 ? '' + month : '0' + month

      let getApi,params
      switch (currentIndex) {
        case 3:
          getApi = '/api/CrmMobile/GetPersonPerformRank'
          params = {
            QueryTimeType: 0,
            QueryTime: year + '+' + month,
            PageIndex: 1,
            PageSize: 20,
            UserToken: wx.getStorageSync('crmUserInfo').UserToken
          }
          break
        case 4:
          getApi = '/api/CrmMobile/GetCustomerPerform'
          params = {
            QueryTimeType: 0,
            QueryTime: year + '+' + month,
            PageIndex: 1,
            PageSize: 20,
            UserToken: wx.getStorageSync('crmUserInfo').UserToken
          }
          break
        default:
          getApi = '/api/CrmMobile/GetPerformStatis'
          params = this._requestParams(currentIndex)
          break;
      }
      wx.showLoading({title: '加载中'})
      let result = await this.$http.post(getApi,params)
      wx.hideLoading()
      this._createItem(result, index)
    },
    // 请求参数
    _requestParams (index) {
      let year = new Date().getFullYear()
      let month = new Date().getMonth() + 1
      year = year + ''
      month = month.length > 1 ? '' + month : '0' + month

      let params = {}
      switch (index) {
        case 0:
          params.QueryTimeType = 0
          params.QueryTime = year + '+' + month
          break;
        case 1:
          params.QueryTimeType = 1
          params.QueryTime = year
          break;
        case 2:
          params.QueryTimeType = 2
          params.QueryTime = 1
          break;
      }
      params = Object.assign(params,{
        PageIndex: 1,
        PageSize: 1,
        UserToken: wx.getStorageSync('userToken')
      })
      
      return params
    },
    // 创建子页面
    _createItem (result, index) {
      // 如果元素已存在则不创建
      if (this.chartsData[index].show) return
      let data1, data2, chart1, chart2
      switch (index) {
        case 0:
          data1 = [
            { value: result.IndexAchieveRate, name: '业绩指标达成率'},
            { value: 100 - parseFloat(result.IndexAchieveRate), name: '业绩指标未达成率'}
          ]
          data2 = [
            { value: result.SaleAmount, name: '本月销售业绩' },
            { value: result.SaleAmount2, name: '去年本月销售业绩'}
            // { value: result.GrowthRate, name: '同比上年本月销售增长率'}
          ]
          chart1 = this._createEchars(data1, 'pie')
          chart2 = this._createEchars(data2, 'bar')
          let that = this
         

          this.chartsData[0].chart1 = chart1
          this.chartsData[0].chart2 = chart2
          this.chartsData[0].listData = [
            { label: '本月销售额', value: result.SaleAmount, icon: 'icon-money' },
            { label: '本月目标业绩', value: result.TargetAmount, icon: 'icon-money' },
            { label: '本月业绩指标达成率', value: result.IndexAchieveRate + '%', icon: 'icon-icon-test' },
            { label: '上年本月销售额', value: result.SaleAmount2, icon: 'icon-money' },
            { label: '同比上年本月销售增长率', value: result.GrowthRate + '%', icon: result.GrowthRate > 0 ? 'icon-up' : 'icon-down'},
          ]
          this.chartsData[0].listTitle = '月度业绩统计'
          this.chartsData[0].show = true
          break;
        case 1:
          data1 = [
            { value: result.IndexAchieveRate, name: '业绩指标达成率'},
            { value: 100 - parseFloat(result.IndexAchieveRate), name: '业绩指标未达成率'}
          ]
          data2 = [
            { value: result.SaleAmount, name: '本季销售业绩' },
            { value: result.SaleAmount2, name: '去年本季销售业绩'}
            // { value: result.GrowthRate, name: '同比上年本季销售增长率'}
          ]
          chart1 = this._createEchars(data1, 'pie')
          chart2 = this._createEchars(data2, 'bar')

          this.chartsData[1].chart1 = chart1
          this.chartsData[1].chart2 = chart2
          this.chartsData[1].listData = [
            { label: '本季销售额', value: result.SaleAmount, icon: 'icon-money' },
            { label: '本季目标业绩', value: result.TargetAmount, icon: 'icon-money' },
            { label: '本季业绩指标达成率', value: result.IndexAchieveRate + '%', icon: 'icon-icon-test' },
            { label: '上年本季销售额', value: result.SaleAmount2, icon: 'icon-money' },
            { label: '同比上年本季销售增长率', value: result.GrowthRate + '%', icon: result.GrowthRate > 0 ? 'icon-up' : 'icon-down' },
          ]
          this.chartsData[1].listTitle = '季度销售业绩'
          this.chartsData[1].show = true
          break;
        case 2:
          data1 = [
            { value: result.IndexAchieveRate, name: '业绩指标达成率'},
            { value: 100 - parseFloat(result.IndexAchieveRate), name: '业绩指标未达成率'}
          ]
          data2 = [
            { value: result.SaleAmount, name: '本年销售业绩' },
            { value: result.SaleAmount2, name: '去年本月销售业绩'}
            // { value: result.GrowthRate, name: '同比上年本季销售增长率'}
          ]
          chart1 = this._createEchars(data1, 'pie')
          chart2 = this._createEchars(data2, 'bar')
          this.chartsData[2].chart1 = chart1
          this.chartsData[2].chart2 = chart2

          this.chartsData[2].listData = [
            { label: '本年销售额', value: result.SaleAmount, icon: 'icon-money' },
            { label: '本年目标业绩', value: result.TargetAmount, icon: 'icon-money' },
            { label: '本年业绩指标达成率', value: result.IndexAchieveRate + '%', icon: 'icon-icon-test' },
            { label: '上年本年销售额', value: result.SaleAmount2, icon: 'icon-money' },
            { label: '同比上年本年销售增长率', value: result.GrowthRate + '%', icon: result.GrowthRate > 0 ? 'icon-up' : 'icon-down' },
          ]
          this.chartsData[2].listTitle = '年度销售业绩'
          this.chartsData[2].show = true
          break;
        case 3:
          data1 = [
            { value: result.Percent, name: '个人业绩占比' },
            { value: 100 - parseFloat(result.Percent), name: '门店业绩占比' }
          ]
          chart1 = this._createEchars(data1, 'pie')

          this.chartsData[3].chart1 = chart1
          this.chartsData[3].listData = [
            { label: '本店排名', value: result.Rank, icon: 'icon-renkou' },
            { label: '本月开单数量', value: result.OrderQty, icon: 'icon-ico_kufangguanli_danjuchaxun' },
            { label: '本月开单金额', value: result.OrderAmount, icon: 'icon-money' },
            { label: '占本店业绩百分比', value: result.Percent + '%', icon: 'icon-icon-test' }
          ]
          this.chartsData[3].listTitle = '个人销售业绩'
          this.chartsData[3].show = true
          break
        case 4:
          data1 = [
            { value: result.PotentCustomerQty, name: '潜客占比'},
            { value: result.SoldCustomerQty, name: '成交客户占比'}
          ]
          data2 = [
            { value: result.PotentCustomerQty, name: '潜客数量'},
            { value: result.PotentCustomerQty2, name: '去年同期潜客数'}
            // { value: result.GrowthRate, name: '同比增长率'}
          ]
          let data3 = [
            { value: result.SoldCustomerQty, name: '成交客户数量'},
            { value: result.SoldCustomerQty2, name: '去年同期成交客户数'}
            // { value: result.GrowthRate2, name: '同比增长率'}
          ]
          chart1 = this._createEchars(data1, 'pie')
          chart2 = this._createEchars(data2, 'bar')
          let chart3 = this._createEchars(data3, 'bar')

          this.chartsData[4].chart1 = chart1
          this.chartsData[4].chart2 = chart2
          this.chartsData[4].chart3 = chart3
          this.chartsData[4].listData = [
            { label: '潜客数量', value: result.PotentCustomerQty, icon: 'icon-renkou' },
            { label: '成交客户数量', value: result.SoldCustomerQty, icon: 'icon-renkou' },
            { label: '成交客户转化率', value: result.ConvertRate + '%', icon: 'icon-icon-test' },
            { label: '去年同期潜客数', value: result.PotentCustomerQty2, icon: 'icon-renkou' },
            { label: '同比去年同期潜客增长率', value: result.GrowthRate + '%', icon: result.GrowthRate > 0 ? 'icon-up' : 'icon-down' },
            { label: '去年同期成交客户数', value: result.SoldCustomerQty2, icon: 'icon-renkou' },
            { label: '同比去年同期成交客户增长率', value: result.GrowthRate2 + '%', icon: result.GrowthRate2 > 0 ? 'icon-up' : 'icon-down' },
          ]
          this.chartsData[4].listTitle = '客户销售业绩'
          this.chartsData[4].show = true
          break;
      }
      // this.handleCanvarToImg(index)
    },
    // 创建图表
    _createEchars(data, type) {
      let legendData = []
      let valueData = []
      data.forEach( item => {
        legendData.push(item.name)
        valueData.push(item.value)
      })
      let option = {}
      if (type === 'pie') {
        option = {
          legend: {
            bottom: 10,
            left: 'center',
            data: legendData,
            padding: [30,0,0,0]
          },
          series: [{
            type: type || 'pie',
            radius: '65%',
            center: ['50%', '45%'],
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
            data: data
          }]
        }
      } else if (type === 'bar') {
        option = {
          color: ['#c23531'],
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis : [{
            type : 'category',
            data : legendData,
            axisTick: {
              alignWithLabel: true
            }
          }],
          yAxis : [{
            type : 'value'
          }],
          series : [{
            // name:'直接访问',
            type:'bar',
            barWidth: '80%',
            label: {
              normal: {
                show: true,
                position: 'inside',
                formatter: '{c}'
              }
            },
            data: valueData
          }]
        }
      }
      function initChart(canvas, width, height) {
        chart = echarts.init(canvas, null, {
          width: width,
          height: height
        })
        canvas.setChart(chart)
        chart.setOption(option)
        return chart // 返回 chart 后可以自动绑定触摸操作
      }
      return initChart
    }
  }
}
</script>

<style lang="less">
@import '~less/custom-vant.less';
#home {
  height: 100%;
  position: relative;

  swiper {
    height: 100%;
  }
  .search {
    position: fixed;
    z-index: 99;
    right: 15px;
    top: 35px;
    border: 1px solid orange;
    border-radius: 12px;
    text-align: center;
    overflow: hidden;
    .listItem {
      height: 25px;
      line-height: 25px;
      border-bottom: 1px solid #ccc;
      &:last-child {
        border-bottom: none;
      }
      &.selected {
        color: #2db7f5;
      }
    }
  }

  .tab-item {
    height:100%;
    display: flex;
    display: -webkit-flex;
    flex-direction: column;
    .home-title {
      text-align: center;
      display: block;
      margin: 8px 0;
    }
    img {
      width: 250px;
      height: 160px;
    }
    .home-table {
      width: 100%;
      .home-th,
      .home-tr {
        display: flex;
        display: -webkit-flex;
        border: 1px solid #eee;
        .home-td {
          padding: 5px;
          display: inline-block;
          min-height: 20px;
          font-size: 14px;
        }
      }
    }
    .home-echarts {
      flex: 1;
      >div {
        height: 50%;
        max-height: 170px;
        text-align: center;
      }
      .line {
        margin-top: 10px;
      }
    }
  }

  .bar-line {
    position: fixed;
    z-index: 10;
    width: 100%;
    height: 1px;
    background: #8899a1;
    top: 34px;
  }

}
</style>



