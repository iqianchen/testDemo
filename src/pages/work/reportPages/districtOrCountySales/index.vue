<template>
  <div id="districtOrCountySales" style="height: 100%">
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
      getApi: '/api/CrmMobile/GetCrmDistrictSaleRank',
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
        return { value: item.Amt, name: item.DistrictName }
      })
      this.type = 'pie'
      this.$refs.reportModel.createEchars(this.chartData, this.type)
    },
    // 处理成表格数据
    _handleTableData(data) {
      let tableData = data.map((item,index) => {
        return {
          DistrictCode: item.DistrictCode,
          DistrictName: item.DistrictName,
          Amt: item.Amt,
          Percent: item.Percent,
          Rank: index + 1
        }
      })
      let list = {
        title: {
          key: 'DistrictName',
          label: '地区名称'
        },
        // subTitle: {
        //   key: 'DistrictCode',
        //   label: '地区代号'
        // },
        desc: [
          {
            key: 'Amt',
            label: '销售额'
          }, {
            key: 'Percent',
            label: '总销售占比'
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