<template>
  <!-- 选择款式 -->
  <div id="chooseStyle">
    <Search @onSearch="onSearch" placeholder="请输入款式代号或名称"></Search>
  
    <scroll-view 
      scroll-y 
      :style="{ height: scrollHeight }" 
      @scrolltolower="scrolltolower">
      <van-radio-group :value="selectedId" v-if="listData.length > 0">
        <van-cell-group>
          <van-cell 
            v-for="(item, index) in listData"
            :key="item.index" 
            :title="item.fStyleName" 
            clickable
            :data-name="item.fStyleId" 
            @click="radio_click">
            <van-radio :name="item.fStyleId" />
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
import localScrollLoad from '@/mixin/localScrollLoad.js';
export default {
  components: {
    Search,
    Tips
  },
  mixins: [localScrollLoad],
  data() {
    return {
      selectedId: '',     // 记录选中的id
      scrollHeight: 0,    // 滚动区域的高度
      pageSize: 15,       // 每次加载显示15条数据
      getDataApi: '/api/CrmMobile/GetSaleableFgStyle',  // 获取数据的接口
    }
  },
  onReady() {   // 首次加载页面
    this._initScrollHeight()
  },
  onUnload() {    // 页面销毁时数据还原
    this.selectedId = '';     
  },
  methods: {
    // 初始化滚动区域的高度
    _initScrollHeight() {
      let windowHeight = wx.getSystemInfoSync().windowHeight;   // 获取window高度
      this.scrollHeight = (windowHeight - 55) + 'px';           // 减去搜索栏高度
    },
    // 点击单选按钮
    radio_click(event) {
      this.selectedId = event.currentTarget.dataset.name;
      // 页面重定向
      wx.redirectTo({
        url: `../chooseProduct/main?id=${this.selectedId}`
      })
    },
    // 搜索
    onSearch(searchKey) {
      if (!searchKey) {
        this.pageIndex = 1;
        this.listData = this.serverData.slice(0, this.pageSize)
        return;
      }

      wx.showLoading({ title: '加载中..'})
      let styleKey = searchKey.toUpperCase()
      let tmpData = this.serverData.filter(item => {
        if (item.fStyleName) {
          return (item.fStyleName.toUpperCase().indexOf(styleKey) !== -1 || item.fStyleCode.toUpperCase().indexOf(styleKey) !== -1)
        }
      })
      this.listData = tmpData;
      wx.hideLoading()
    }
  }
}
</script>