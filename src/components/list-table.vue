<template>
  <div id="list-table">
    <div class="list-title" v-text="listTitle"></div>
    <ul class="list">
      <li class="list-item" v-for="(item, index) in listData" :key="index">
        <div class="left">
          <span class="iconfont" :class="item.icon"></span>
          <span v-text="item.label"></span>
        </div>
        <div class="listValue" v-text="item.value"></div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'listTable',
  props: {
    listData: {
      type: Array,
      default () {
        return []
      }
    },
    listTitle: {
      type: String,
      default: '测试'
    }
  },
  mounted () {
  },
  data () {
    return {}
  }
}
</script>

<style lang="less" scoped>
#list-table {
  width: 85%;
  margin: 10px auto;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 12px;
  .list-title {
    text-align: center;
    padding: 5px 0;
  }

  .list {
    padding: 8px 0;
    .list-item {
      display: flex;
      line-height: 1.8em;
      justify-content: space-between;
      .left {
        .iconfont {
          margin-bottom: -5px;
          margin-right: 10px;
          line-height: 22px;

          &.icon-money {
            color: #f4cc13;
          }
          &.icon-icon-test {
            color: #0b94e2;
          }
          &.icon-down {
            color: #c23531
          }
          &.icon-up {
            color: #3cb54b
          }
          &.icon-renkou {
            color: #32b2c9
          }
          &.icon-ico_kufangguanli_danjuchaxun {
            color: #fe976f
          }
        }
      }
    }
  }
}
</style>
