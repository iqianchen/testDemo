<template>
  <div id="customerConversionRate" style="height: 100%">
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
      getApi: '/api/CrmMobile/GetCrmCutomerConvertRateRank',
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
        return { value: item.ConvertRate, name: item.StoreName }
      })
      this.type = 'bar'
      this.$refs.reportModel.createEchars(this.chartData, this.type)
    },
    // 处理成表格数据
    _handleTableData(data) {
      let tableData = data.map((item,index) => {
        return {
          StoreCode: item.StoreCode,
          StoreName: item.StoreName,
          ReceptionQty: item.ReceptionQty,
          TranQty: item.TranQty,
          ConvertRate: item.ConvertRate,
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
            key: 'ReceptionQty',
            label: '客户接待数'
          }, {
            key: 'TranQty',
            label: '成交客户数'
          }, {
            key: 'ConvertRate',
            label: '转化率'
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