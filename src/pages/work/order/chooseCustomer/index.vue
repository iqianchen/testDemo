<template>
  <div>
    <Search @onSearch="onSearch" placeholder="请输入客户名称"></Search>

    <scroll-view
      scroll-y 
      :style="{ height: scrollHeight }" 
      @scrolltolower="scrolltolower"
    >
      <van-radio-group :value="selectedId" v-if="listData.length > 0">
        <van-cell-group>
          <van-cell 
            v-for="item in listData"
            :key="item.Id" 
            :title="item.Name" 
            clickable
            :data-name="item.Id" 
            @click="radio_click">
            <van-radio :name="item.Id" />
          </van-cell>
        </van-cell-group>
      </van-radio-group>
      <Tips :tipsType="tipsType"></Tips>
    </scroll-view>
  </div>
</template>

<script>
import Search from  '#/Search';
import Tips from '#/Tips';
import elemScrollLoad from '@/mixin/elemScrollLoad';
import { prevPageSetData } from "@js/pageValue";

export default {
  mixins: [elemScrollLoad],
  components: {
    Search,
    Tips
  },
  data() {
    return {
      getDataApi: '/api/CrmMobile/GetCustomer',
      queryData: {}
    }
  },
  onReady() {
    this._initScrollHeight();
  },
  methods: {
    // 初始化滚动区域的高度
    _initScrollHeight() {
      let windowHeight = wx.getSystemInfoSync().windowHeight;   // 获取window高度
      this.scrollHeight = (windowHeight - 55) + 'px';           // 减去搜索栏高度
    },
    // 点击单选按钮
    radio_click(event) {
      this.radio = event.currentTarget.dataset.name;
      let selected = this.listData.filter(item => {
        return item.Id == this.radio
      })
      prevPageSetData('selectedCustomer', selected[0])

      wx.navigateBack({ delta: 1 })
    },
    // 搜索
    onSearch(searchKey) {
      let params = Object.assign({}, this.queryData, { SearchKey: searchKey })
      this.getListData(null, params)
    },

  }
}
</script>