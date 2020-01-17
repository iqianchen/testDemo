<template>
  <div id="personalPerformance" style="height: 100%">
    <ReportModel v-if="showReport" ref="reportModel" :hasStore="hasStore" :getApi="getApi" @returnRes="returnRes" @onChange="onChange"></ReportModel>
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
      getApi: '/api/CrmMobile/GetCrmStoreSellProductRank',
      hasStore: false,
      showReport: true,
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
      this.chartData = data.map(item => {
        return { value: item.Amt, name: item.GoodsName }
      })
      this.type = 'pie'
      this.$refs.reportModel.createEchars(this.chartData, this.type)
    },
    // 处理成表格数据
    _handleTableData(data) {
      let tableData = data.map((item,index) => {
        return {
          GoodsCode: item.GoodsCode,
          GoodsName: item.GoodsName,
          Amt: item.Amt,
          Percent: item.Percent,
          Rank: index + 1
        }
      })
      let list = {
        title: {
          key: 'GoodsName',
          label: '业务员'
        },
        subTitle: {
          key: 'GoodsCode',
          label: '产品代号'
        },
        desc: [
          {
            key: 'Amt',
            label: '销售业绩'
          }, {
            key: 'Percent',
            label: '总销售占比'
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
            },500)
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