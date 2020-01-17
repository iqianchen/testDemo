<template>
  <div id="saleOrder">
    <!-- <singleSearch :customerId="customerId" getData="saleOrder" ref="singleSearch" @confirm="confirm"></singleSearch> -->
    <singleSearch getApi="saleOrder" :radio="keys" :otherParams="otherParams" ref="singleSearch" @confirm="confirm"></singleSearch>
  </div>
</template>

<script>
/* eslint-disable */
import singleSearch from '#/singleSearch'
import { prevPageSetData, prevPageGetData } from '@js/pageValue'
export default {
  name: 'saleOrder',
  components: {
    singleSearch
  },
  data () {
    return {
        keys: '',
        customerId: '',
        otherParams: {
          CustomerId: ''
        }
    }
  },
  onLoad (query) {
    if (query && query.type) {
      switch (query.type) {
        case 'choseSaleOrder':
          this.keys = prevPageGetData("queryData.SaleOrderId")
          this.pageType = 'choseSaleOrder'
          break; 
      }
      this.otherParams.CustomerId = query.customerId
    } 
  },
  onUnload() {
    this.initPage()
  },
  mounted() {
    this.$refs.singleSearch.resetPage()
  },
  methods: {
    initPage() {
      this.keys= ''
      this.customerId= ''
      this.otherParams= {
        CustomerId: ''
      }
    },
    // 返回选中的用户
    confirm (selectedSaleOrder) {
      prevPageSetData('saleOrder', selectedSaleOrder)
      wx.navigateBack({ delta: 1})
    }
  }
}
</script>


