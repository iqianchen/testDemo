<template>
  <div id="reportList">
    <div class="report-card" v-for="(item,index) in data" :key="index">
      <div class="report-header">
        <span class="sort" v-if="list.rank" v-text="index+1"></span>
        <div class="title-box">
          <div class="report-title" v-text="item[list.title.key]"></div>
          <div class="report-subTitle" v-if="list.subTitle">
            <span class="subTitle-label">{{list.subTitle.label}}:</span>
            <span>{{item[list.subTitle.key]}}</span>
          </div>
        </div>
      </div>
      <div class="report-desc">
        <div v-for="(val,i) in list.desc" :key="i">
          <span class="value" v-text="item[val.key]"></span>
          <span class="label" v-text="val.label"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  props: {
    data: {
      type: Array,
      default() {
        return []
      }
    },
    list: {
      type: Object,
      default() {
        return {}
      }
    }
  }
}
</script>


<style lang="less">
@import "~less/base-color.less";

#reportList {
  .report-card {
    padding: 5px 8px;
    border-bottom: 1px solid #eee;
    .report-header {
      display: flex;
      align-items: center;
      .sort {
        color: #888;
        font-weight: 700;
        font-size: 16px;
        padding: 0 16px 0 8px;
      }
      .title-box {
        flex: 1;
        overflow: hidden;
        .report-title {
          line-height: 22px;
          font-size: 14px;
          font-weight: 700;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
        }
        .report-subTitle {
          font-size: 12px;
          color: @help-color;
          .subTitle-label {
            margin-right: 3px;
          }
        }
      }
    }
    .report-desc {
      display: flex;
      flex-wrap: wrap;
      width: 100%;
      font-size: 14px;
      margin-top: 5px;
      >div {
        flex: 1;
        margin-top: 5px;
        min-width: 33%;
        box-sizing: border-box;
        border-right: 1px solid @orange;
        display: flex;
        flex-direction: column;
        align-items: center;
        .label {
          margin-top: 6px;
          color: #555;
        }
        .value {
          font-weight: 700;
          color: @red;
        }
        &:fist-child {
          color: @red;
        }
        &:last-child,
        &:nth-child(3n) {
          border-right: none;
        }
      }
    }
    // 第一名
    &:nth-child(1) {
      .sort {
        color: @red;
      }
    }
    // 第二名
    &:nth-child(2) {
      .sort {
        color: @orange;
      }
    }
    // 第三名
    &:nth-child(3) {
      .sort {
        color: @green;
      }
    }

    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
