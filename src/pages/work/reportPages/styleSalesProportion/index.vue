<template>
  <div id="styleSalesProportion" style="height: 100%">
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
      getApi: '/api/CrmMobile/GetCrmStyleSalePercentAnalysis',
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
        return { value: item.Amt, name: item.StyleName }
      })
      this.type = 'bar'
      this.$refs.reportModel.createEchars(this.chartData, this.type)
    },
    // 处理成表格数据
    _handleTableData(data) {
      let tableData = data.map((item,index) => {
        return {
          StyleCode: item.StyleCode,
          StyleName: item.StyleName,
          Amt: item.Amt,
          Amt2: item.Amt2,
          GrowthRate: item.GrowthRate,
          Rank: index + 1
        }
      })
      let list = {
        title: {
          key: 'StyleName',
          label: '款式名称'
        },
        subTitle: {
          key: 'StyleCode',
          label: '款式代号'
        },
        desc: [
          {
            key: 'GrowthRate',
            label: '同比增长率'
          }, {
            key: 'Amt',
            label: '本期销售额'
          }, {
            key: 'Amt2',
            label: '上年本期销售额'
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