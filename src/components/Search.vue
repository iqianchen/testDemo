<template>
  <div class="my-search">
    <div class="search-content">
      <span class="iconfont icon-sousuo"></span>
      <input 
        class="search-body" 
        :value="searchKey" 
        type="text" 
        @blur="changeSearchKey" 
        :placeholder="placeholder" 
        @confirm="onSearch" />
    </div>
    <div class="search-action">
      <span @click="onSearch">搜索</span>
      <span 
        v-for="(item, index) in actionButton"
        :key="index"
        v-text="item.text"
        @click="item.method">
      </span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchKey: ''
    }
  },
  props: {
    placeholder: {
      type: String,
      default: '请输入搜索关键词'
    },
    actionButton: {   // 扩展的功能按钮
      type: Array,
      default() {
        return []
      }
    }
  },
  onUnload() {
    this.searchKey = '';
  },
  methods: {
    // 初始化searchKey的值
    initSearchKey(value) {
      this.searchKey = value;
    },
    // 改变搜索值
    changeSearchKey(event) {
      this.searchKey = event.mp.detail.value;
    },
    // 搜索
    onSearch() {
      setTimeout(() => {    // 为防止移除焦点事件后关键字未更新就调用事件， 在这里添加50毫秒延迟
        this.$emit('onSearch', this.searchKey)
      }, 50)
    }
  }
}
</script>

<style lang="less">
@import '~less/base-color.less';
.my-search {
  height: 54PX;     // mpvue会默认将px转换成rpx，单位为大写的PX时则为单位为px
  box-sizing: border-box;
  width: 100%;
  padding: 10PX 6PX 10PX 12PX;
  background-color: @white;
  display: flex;
  .search-content {
    background-color: @search-bg-color;
    padding: 5PX 8PX;
    flex: 1;
    display: flex;
    font-size: 14PX;
    line-height: 24PX;
    .iconfont {
      margin-right: 5PX;
      padding-top: 1PX;
    }
    .search-body {
      flex: 1;
      text-align: left;
      border: none;
      border-radius: 0;
    }
  }
  .search-action {
    >span {
      padding: 0 8PX;
      color: @text-color;
      font-size: 14PX;
      line-height: 34PX
    }
  }
}
</style>