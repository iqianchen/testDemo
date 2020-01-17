<template>
  <div id="statistics">
    <!-- <van-tabs custom-class="menu-tab" class="tabs" :active="tabsActive" @change="tabsChange" color="#2986c3" swipeable="true">
      <van-tab v-for="(item, index) in options" v-if="item.show" :title="item.title" :key="index">
        <div v-if="!item.custom " class="search">
          <div class="prev" @click="prev(item.title)" v-text="item.prev"></div>
          <div class="current" v-text="item.current"></div>
          <div class="next" @click="next(item.title)" v-text="item.next"></div>
        </div>
        <div v-if="item.custom" class="customSearch">
          <div>
            <span>开始</span>
            <span class="startDate" v-text="item.startDate" @click="showPicker('start')"></span>
          </div>
          <div>
            <span>结束</span>
            <span class="endDate" v-text="item.endDate" @click="showPicker('end')"></span>
          </div>
        </div>
      </van-tab>
    </van-tabs>
    <div class="tabs-item">
      <van-cell-group custom-class="custom-cell-group" title="打卡记录">
        <van-cell title="打卡次数" :value="datas.test1" />
        <van-cell title="漏卡次数" :value="datas.test2" />
        <van-cell title="出勤次数" :value="datas.test3" />
        <van-cell title="请假天数" :value="datas.test4" />
        <van-cell title="公休天数" :value="datas.test5" />
        <van-cell title="出差天数" :value="datas.test6" />
      </van-cell-group>
    </div>
    <van-popup custom-class="date-picker" :show="showDatePicker" position="bottom" >
      <van-datetime-picker type="date" :value="selectedDate" @confirm="changeDate" @cancel="showDatePicker = false" />
    </van-popup> -->
    <van-cell-group custom-class="custom-cell-group" title="本月打卡记录">
      <van-cell title="打卡次数" :value="datas.fuserclocknum" />
      <van-cell title="漏卡次数" :value="datas.fleaknum" />
      <van-cell title="出勤天数" :value="datas.fattenddays" />
      <van-cell title="请假天数" :value="datas.fleavedays" />
      <van-cell title="公休天数" :value="datas.frecessdays" />
      <van-cell title="出差天数" :value="datas.ftraveldays" />
    </van-cell-group>
  </div>
</template>

<script>
/* eslint-disable */
import dateFormula from '@/utils/dateFormula.js'
export default {
  data() {
    return {
      datas: {}
      // tabsActive: 0,
      // selectedDate: new Date().getTime(),
      // showDatePicker: false,
      // datas: {
      //   test1: 22,
      //   test2: 6,
      //   test3: 25,
      //   test4: 23,
      //   test5: 4,
      //   test6: 3,
      // },
      // options: [
      //   {
      //     title: '月',
      //     prev: '上一月',
      //     show: true,
      //     showData: false,
      //     currentIndex: 0,
      //     current: dateFormula.format(new Date(), 'yyyy-MM'),
      //     next: '下一月'
      //   }, {
      //     title: '周',
      //     prev: '上一周',
      //     show: true,
      //     showData: false,
      //     currentIndex: 0,
      //     current: dateFormula.getWeekStartAndEnd(0)[0] + ' ~ ' + dateFormula.getWeekStartAndEnd(0)[1],
      //     next: '下一周'
      //   }, {
      //     title: '自定义',
      //     show: true,
      //     showData: false,
      //     custom: true,
      //     startDate: dateFormula.format(new Date(), 'yyyy-MM-dd'),
      //     endDate: dateFormula.format(new Date(), 'yyyy-MM-dd')
      //   }
      // ]
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    // 获取数据
    async getData() {
      // wx.showLoading({ title: '加载中...' })
      let result = await this.$http.post('/api/CrmMobile/ClockStatistics', {}, true)
      // wx.hideLoading()
      this.datas = result
    },
    // // 上一个
    // prev (title) {
    //   let currentIndex;
    //   switch (title) {
    //     case '周':
    //       currentIndex = this.options[1].currentIndex -= 1
    //       break
    //     case '月':
    //       currentIndex = this.options[0].currentIndex -= 1
    //       break
    //   }
    //   this._changeCurrent(currentIndex,title)
    // },
    // // 下一个
    // next (title) {
    //   let currentIndex
    //   switch (title) {
    //     case '周':
    //       currentIndex = this.options[1].currentIndex += 1
    //       break
    //     case '月':
    //       currentIndex = this.options[0].currentIndex += 1
    //       break
    //   }
    //   this._changeCurrent(currentIndex,title)
    // },
    // // 改变当前日期
    // _changeCurrent (currentIndex,title) {
    //   currentIndex = parseInt(currentIndex)
    //   let query;
    //   switch (title) {
    //     case '周':
    //       let fistDay1 = dateFormula.getWeekStartAndEnd(currentIndex)[0]
    //       let lastDay1 = dateFormula.getWeekStartAndEnd(currentIndex)[1]
    //       this.options[1].current = fistDay1 + ' ~ ' + lastDay1
    //       query = {
    //         BeginDate: fistDay1,
    //         EndDate: lastDay1
    //       }
    //       break
    //     case '月':
    //       let fistDay2 = dateFormula.getMonthStartAndEnd(currentIndex)[0]
    //       let lastDay2 = dateFormula.getMonthStartAndEnd(currentIndex)[1]
    //       this.options[0].current = dateFormula.format(new Date(fistDay2), 'yyyy-MM')
    //       query = {
    //         BeginDate: fistDay2,
    //         EndDate: lastDay2
    //       }
    //       break
    //   }
    //   // this.getData(query,title)
    // },
    // // 显示日期组件
    // showPicker (type) {
    //   let selectedValue;
    //   switch (type) {
    //     case 'start':
    //       selectedValue = this.options[2].startDate
    //       this.type = 'start'
    //       break
    //     case 'end':
    //       this.type = 'end'
    //       selectedValue = this.options[2].endDate
    //       break
    //   }
    //   this.showDatePicker = true
    //   this.selectedDate = new Date(selectedValue).getTime()
    // },
    // // 改变日期
    // changeDate(event) {
    //   let stringDate = dateFormula.format(new Date(event.mp.detail), 'yyyy-MM-dd')
    //   if (this.type === 'start') {
    //     if (new Date(stringDate) > new Date(this.options[2].endDate)) {
    //       wx.showToast({
    //         title: '开始日期不能大于结束日期',
    //         icon: 'none',
    //         duration: 2000
    //       })
    //       return
    //     }
    //     this.options[2].startDate = stringDate
    //   }else {
    //     if (new Date(stringDate) < new Date(this.options[2].startDate)) {
    //       wx.showToast({
    //         title: '开始日期不能大于结束日期',
    //         icon: 'none',
    //         duration: 2000
    //       })
    //       return
    //     }
    //     this.options[2].endDate = stringDate
    //   }
    //   let params = {
    //     BeginDate: this.options[2].startDate,
    //     EndDate: this.options[2].endDate
    //   }
    //   this.getData(params, '自定义')
    //   this.showDatePicker = false
    // }
  }
}
</script>


<style lang="less">
@import "~less/custom-vant.less";

#statistics {
  height: 100%;
  background-color: @background-color;
  .search {
    background-color: @main-color;
    display: flex;
    font-size: 14px;
    color: #fff;
    justify-content: space-between;
    height: 35px;
    border-top: 1px solid #000;
    .prev,
    .next {
      padding: 0 8px;
      line-height: 34px;
    }
    .current {
      line-height: 34px;
    }
  }
  .customSearch {
    display: flex;
    background-color: @main-color;
    border-top: 1px solid #000;
    font-size: 14px;
    color: #fff;
    height: 35px;
    padding: 0 8px;
    >div {
      width: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      span:last-child {
        flex-basis: 100px;
        margin-left: 15px;
      }
    }
  }
  .menu-tab .van-tabs__line {
    width: 66px !important;
  }
}
</style>

