<template>
  <div class="message">
    <div v-if="tipsType === 'loading'" class="loading">加载中...</div>
    <div v-else-if="tipsType === 'noMore'" class="noMore">没有更多数据了</div>
    <div v-else-if="tipsType === 'noData'" class="noData">
      <span class="iconfont icon-ico_meiyoushuju"></span>
      <span class="text">暂无数据</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    tipsType: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="less">
@import '~less/base-color.less';
.message {
  .loading,
  .noMore {
    font-size: 16px;
    color: @help-color;
    text-align: center;
    padding: 8px 0;
  }
  .noData {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 70px;
    color: @help-color;
    .iconfont {
      font-size: 80px;
    }
    .text {
      margin-top: 20px;
      font-size: 20px
    }
  }
}
</style>