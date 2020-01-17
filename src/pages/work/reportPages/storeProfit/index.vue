<template>
  <div id="storeProfit" style="height: 100%">
    <ReportModel v-if="showReport" ref="reportModel" :getApi="getApi" @returnRes="returnRes" @onChange="onChange"></ReportModel>
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
      getApi: '/api/CrmMobile/GetCrmStoreProfitRank',
      showReport: true,
      hideTabs: [],
      chartData: [],
      type: ''
    }
  },
  onUnload() {
    this.hideTabs = []
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
      this.chartData = data.map(item => {
        return { value: item.Percent, name: item.StoreName }
      })
      this.type = 'pie'
      this.$refs.reportModel.createEchars(this.chartData, this.type)
    },
    // 处理成表格数据
    _handleTableData(data) {
      let tableData = data.map((item,index) => {
        return {
          StoreCode: item.StoreCode,
          StoreName: item.StoreName,
          Income: item.Income,
          Cost: item.Cost,
          Fee: item.Fee,
          GrossProfit: item.GrossProfit,
          NetProfit: item.NetProfit,
          Percent: item.Percent,
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
            key: 'Income',
            label: '营业收入'
          }, {
            key: 'Cost',
            label: '营业成本'
          }, {
            key: 'Fee',
            label: '费用'
          }, {
            key: 'GrossProfit',
            label: '毛利润'
          }, {
            key: 'NetProfit',
            label: '净利润'
          }, {
            key: 'Percent',
            label: '总利润占比'
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