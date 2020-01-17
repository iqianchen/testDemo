<template>
  <div id="notice">
    <!-- 通知 -->
    <div class="card-box" v-for="(item, index) in listData" :key="index">
      <div class="time" v-text="item.CreateDate"></div>
      <div class="card">
        <div class="card-title">
          <div class="title" :style="{color: item.TitleColor ? item.TitleColor : '#888'}" v-text="item.Title"></div>
        </div>
        <div class="card-content">
          <rich-text class="rich-text" :nodes="item.Nodes"></rich-text>
        </div>
      </div>
    </div>

    <Tips :tipsType="tipsType"></Tips>
  </div>
</template>

<script>
import Tips from '#/Tips';
import pageScrollLoad from '@/mixin/pageScrollLoad.js'
export default {
  name: 'notice',
  mixins: [pageScrollLoad],
  data() {
    return {
      getDataApi: '/api/CrmMobile/GetNotice',
      params: {         // 参数
        PageIndex: 1,
        PageSize: 5
      }
    }
  },
  components: {
    Tips
  },
  methods: {
    // 处理响应的数据
    _handleResponseData(result) {
      if (result.length == 0) return result
      result.forEach(item => {
        item.CreateDate = item.CreateDate.replace(/T/g, ' ')
        item.Nodes = this.escape2Html(item.Content)
      })
      return result
    },
    //转义方法
    escape2Html(str) {
      var arrEntities = { 'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"' };
      return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function (all, t) { return arrEntities[t]; }).replace('<section', '<div').replace('<img', '<img style="max-width:100%;height:auto" ');
    },
  }
}
</script>

<style lang="less">
@import '~less/base-color.less';
#notice {
  background-color: #f5f5f5;
  min-height: 100%;
  padding-top: 1px;
  box-sizing: border-box;
  .card-box {
    width: 92%;
    margin: 15px auto 30px;
    .time {
      text-align: center;
      font-size: 12px;
      color: #c5c8ce;
    }
    .card {
      background-color: #fff;
      box-sizing: border-box;
      width: 100%;
      margin-top: 6px;
      background-color: #fff;
      border: 1px solid rgba(0, 0, 0, 0.1);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border-radius: 4px;
      padding: 8px 10px;
      .card-title {
        position: relative;
        padding-bottom: 5px;
        padding-left: 10px;
        .title {
          text-align: center;
          font-size: 16px;
          font-weight: 700;
          margin: 5px 0;
        }
        .subTitle {
          text-align: right;
          span {
            font-size: 12px;
            color: #c5c8ce;
          }
        }
        .card-title-line {
          position: absolute;
          right: -10px;
          bottom: 0;
          height: 1px;
          background-color: #e8eaec;
          width: 100%;
        }
      }
      .card-content {
        padding-top: 10px;
        font-size: 14px;
        text-indent: 2em;
        line-height: 1.8em;
        color: #515a6e;
      }
    }
  }
}
</style>