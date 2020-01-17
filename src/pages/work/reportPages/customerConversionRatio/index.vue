<template>
  <div id="customerConversionRatio" style="height: 100%">
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
      getApi: '/api/CrmMobile/GetCrmCustomerConvertRatePercentAnalysis',
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
      let title = ['StoreName','本期销售额', '上年本期销售额']
      this.chartData = data.map(item => {
        let simpleName = item.StoreName ? item.StoreName : ''
        return [simpleName, item.ReceptionQty, item.ReceptionQty2]
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
          ReceptionQty: item.ReceptionQty,
          ReceptionQty2: item.ReceptionQty2,
          TranQty: item.TranQty,
          TranQty2: item.TranQty2,
          GrowthRate: item.GrowthRate,
          GrowthRate2: item.GrowthRate2,
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
            key: 'ReceptionQty2',
            label: '上年客户接待数'
          }, {
            key: 'TranQty',
            label: '成交客户数'
          }, {
            key: 'TranQty2',
            label: '上年成交客户数'
          }, {
            key: 'GrowthRate',
            label: '同比潜客增长率'
          }, {
            key: 'GrowthRate2',
            label: '同比客户增长率'
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