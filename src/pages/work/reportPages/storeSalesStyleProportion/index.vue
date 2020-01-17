<template>
  <div id="storeSalesStyleProportion" style="height: 100%">
    <ReportModel v-if="showReport" :hasStore="hasStore" ref="reportModel" :getApi="getApi" @returnRes="returnRes" @onChange="onChange"></ReportModel>
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
      getApi: '/api/CrmMobile/GetCrmStoreStyleSalePercentAnalysis',
      showReport: true,
      hasStore: false,
      hideTabs: [],
      chartData: [],
      type: ''
    }
  },
  onLoad() {
    this.isBranchOffice()
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
      let styleName = ['styleName','本期销售额','上年本期销售额']
      this.chartData = data.map(item => {
        let simpleName = item.StyleName ? item.StyleName : ''
        return [simpleName, item.Amt, item.Amt2]
      })
      this.chartData.unshift(styleName)
      this.type = 'bars'
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
            label: '本期销售业额'
          }, {
            key: 'Amt2',
            label: '上年本年销售额'
          }
        ],
        rank: true
      }
      this.$refs.reportModel.createTable(list, tableData)
    },
    // 是否是导购
    isBranchOffice () {
      let _this = this
      let userInfo = wx.getStorageSync('crmUserInfo')
      let newArr = userInfo.StoreId.split(',')
      if (newArr && newArr.length > 1) {
        let currentOrgId = newArr[newArr.length-1]
        for (let key in userInfo.organize) {
          let item  = userInfo.organize[key]
          if (item.fOrgId == currentOrgId) {
            setTimeout(() => {
              _this.$refs.reportModel.setSelectedStore(item.fOrgId, item.FullName)
            },300)
            if (item.Category == "BranchOffice") {
              _this.hasStore = false
              return;
            }
          }
        }
        this.hasStore = true
      }
    },
    onChange() {
      setTimeout(()=>{
        this.$refs.reportModel.createEchars(this.chartData, this.type)
      },200)
    }
  }
}
</script>