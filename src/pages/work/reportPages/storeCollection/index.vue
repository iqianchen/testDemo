<template>
  <div id="storeCollection" style="height: 100%">
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
      getApi: '/api/CrmMobile/GetCrmStoreCollectRank',
      showReport: true,
      hideTabs: [],
      chartData: [],
      type: ''
    }
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
          Amt: item.Amt,
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
            key: 'Amt',
            label: '销售业绩'
          }, {
            key: 'Percent',
            label: '总收款占比'
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
