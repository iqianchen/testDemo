<template>
  <div id="signIn">
    <div class="sign-content">
      <scroll-view scroll-y :style="{height: scrollHeight}" @scrolltolower="onReachBottom">
        <div class="content-item" v-if="active == 0">
          <!-- 打卡页面 -->
          <clockIn></clockIn>
        </div>
        <div class="content-item" v-else-if="active == 1">
          <!-- 打卡统计 -->
          <statistics></statistics>
        </div>
        <div class="content-item" v-else-if="active == 2">
          <!-- 请假 -->
          <leave ref="leave"></leave>
        </div>
        <div class="content-item" v-else-if="active == 3">
          <!-- 出差 -->
          <travel ref="travel"></travel>
        </div>
      </scroll-view>
    </div>
    <van-tabbar :active="active" @change="onChange">
      <van-tabbar-item>
        <i slot="icon" class="iconfont icon-daqia"></i>
        <i slot="icon-active" class="iconfont icon-daqia"></i>
        打卡
      </van-tabbar-item>
      <van-tabbar-item>
        <i slot="icon" class="iconfont icon-tongji"></i>
        <i slot="icon-active" class="iconfont icon-tongji"></i>
        打卡统计
      </van-tabbar-item>
      <van-tabbar-item>
        <i slot="icon" class="iconfont icon-qingjia1"></i>
        <i slot="icon-active" class="iconfont icon-qingjia1"></i>
        请假
      </van-tabbar-item>
      <van-tabbar-item>
        <i slot="icon" class="iconfont icon-waichuchucha"></i>
        <i slot="icon-active" class="iconfont icon-waichuchucha"></i>
        出差
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
/* eslint-disable */
import DateFormula from "@js/dateFormula.js";
import { updateKey } from "@js/pageValue";
import clockIn from "@/components/signIn/clockIn";
import statistics from "@/components/signIn/statistics";
import leave from '@/components/signIn/leave';
import travel from '@/components/signIn/travel';
export default {
  name: "signIn",
  components: {
    clockIn,
    statistics,
    leave,
    travel
  },
  data() {
    return {
      scrollHeight: 0,
      active: 0
    };
  },
  mounted() {
    this._setScrollHeight();
  },
  onUnload() {
    this.active = 0
  },
  onShow() {
    let update = updateKey('update', this)
    if (update) {
      switch (this.active) {
        case 2:
          this.$refs.leave.getData()
          break;
        case 3:
          this.$refs.travel.getData()
          break
      }
    }
  },
  methods: {
    // 设置滚动高度
    _setScrollHeight() {
      wx.getSystemInfo({
        success: res => {
          let windowHeight = res.windowHeight;
          this.scrollHeight = windowHeight - 50 + "px";
        }
      });
    },
    // 改变tabbar
    onChange(event) {
      this.active = event.mp.detail;
    },
    // 上拉加载  事件传递
    onReachBottom() {
      switch (this.active) {
        case 2:
          this.$refs.leave.onReachBottom()
          break;
        case 3:
          this.$refs.travel.onReachBottom()
          break;
      }
    }
  }
};
</script>

<style lang="less" scoped>
#signIn {
  .content-item {
    height: 100%;
    box-sizing: border-box;
    // padding-top: 20px;
    
  }
}
</style>

