<template>
  <div id="storeProfitRatio" style="height: 100%">
    <ReportModel v-if="showReport" ref="reportModel" :hideTabs="hideTabs" :getApi="getApi" @returnRes="returnRes" @onChange="onChange"></ReportModel>
  </div>
</template>

<script>
/* eslint-disable */
import ReportModel from '@/components/reportModel'
export default {
  components: {
    ReportModel
  },
  data () {
    return {
      getApi: '/api/CrmMobile/GetCrmStoreProfitPercentAnalysis',
      showReport: true,
      hideTabs: ['日','周'],
      chartData: [],
      type: ''
    }
  },
  onUnload() {
    this.hideTabs = ['日','周']
    this.chartData = []
    this.type = ''
  },
  methods: {
    // 返回的结果
    returnRes (result) {
      this._handleChartData(result)
      this._handleTableData(result)
    },
    // 处理成图表数据
    _handleChartData(data) {
      let title = ['StoreName','本期销售额', '上年本期销售额']
      this.chartData = data.map(item => {
        let simpleName = item.StoreName ? item.StoreName : ''
        // if (simpleName.length > 8) {
        //   simpleName = simpleName.slice(0,8) + '...'
        // }
        return [simpleName, item.NetProfit, item.NetProfit2]
      })
      this.chartData.unshift(title)
      this.type = 'bars'
      this.$refs.reportModel.createEchars(this.chartData, this.type)
    },
    // 处理成表格数据
    _handleTableData(data) {
      let tableData = data.map((item,index) => {
        return {
          StoreCode: item.StoreCode,
          StoreName: item.StoreName,
          NetProfit: item.NetProfit,
          NetProfit2: item.NetProfit2,
          GrowthRate: item.GrowthRate,
          Rank: index + 1
        }
      })
      let list = {
        title: {
          key: 'StoreName',
          label: '门店名称'
        }, 
        subTitle: {
          key: 'StoreCode',
          label: '门店代号'
        },
        desc: [
          {
            key: 'GrowthRate',
            label: '同比增长率'
          }, {
            key: 'NetProfit',
            label: '本期净利润'
          }, {
            key: 'NetProfit2',
            label: '上年本期净利润'
          }
        ],
        rank: true
      }
      this.$refs.reportModel.createTable(list, tableData)
    },
    onChange() {
      setTimeout(()=>{
        this.$refs.reportModel.createEchars(this.chartData, this.type)
      },200)
    }
  }
}
</script>