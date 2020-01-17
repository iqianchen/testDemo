<template>
  <div id="clockIn">
    <div class="title">当天签到记录</div>
    <div class="noData" v-if="noData">今天还未开始签到呢</div>
    <stepIcon :data="steps"></stepIcon>
    <div class="btn-sign" @click="sign">
      <span>签到</span>
      <span v-text="currentTime"></span>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import DateFormula from "@/utils/dateFormula.js";
import stepIcon from "@/components/stepIcon"
export default {
  components: {
    stepIcon
  },
  data() {
    return {
      currentDate: DateFormula.format(new Date(), "yyyy-MM-dd hh:mm:ss"),
      userInfo: '',
      settingTime: [],
      noData: false,
      steps: []
    }
  },
  created() {
    this.getRecord()
  },
  onUnload() {
    this.initPage()
  },
  mounted() {
    let userInfo = wx.getStorageSync('crmUserInfo')
    this.userInfo = userInfo    
    wx.authorize({scope: "scope.userLocation"})
    
    // Lng:114.1271826171875
    // Lat:22.65110378689236
    // this.computedDistant(22.65110378689236,114.12717664930555,22.65141,114.1278)
  },
  methods: {
    initPage() {
      this.currentDate = DateFormula.format(new Date(), "yyyy-MM-dd hh:mm:ss")
      this.settingTime = []
      this.noData = false
      this.steps = []
    },
    // 设置计时器
    _setTime() {
      setInterval(() => {
        let oldTime = new Date(this.currentDate).getTime()
        let newTime = oldTime + 1000
        this.currentDate = new Date(newTime)
      }, 1000);
    },
    async getRecord() {
      let result = await this.$http.post('/api/CrmMobile/GetAttendanceSet', {})
      if (result.Data && result.Data.length > 0) {
        let setting = result.Data[0]
        this.currentDate = setting.fnow

        let datas = []
        if (setting.fefftime1 && setting.fendtime1) {
          datas.push({
            text: '上午上班',
            startTime: setting.fefftime1,
            endTime: setting.fendtime1
          })
        }
        if (setting.fefftime2 && setting.fendtime2) {
          datas.push({
            text: '上午下班',
            startTime: setting.fefftime2,
            endTime: setting.fendtime2
          })
        }
        if (setting.fefftime3 && setting.fendtime3) {
          datas.push({
            text: '下午上班',
            startTime: setting.fefftime3,
            endTime: setting.fendtime3
          })
        }
        if (setting.fefftime4 && setting.fendtime4) {
          datas.push({
            text: '下午下班',
            startTime: setting.fefftime4,
            endTime: setting.fendtime4
          })
        }
        if (setting.fefftime5 && setting.fendtime5) {
          datas.push({
            text: '晚上上班',
            startTime: setting.fefftime5,
            endTime: setting.fendtime5
          })
        }
        if (setting.fefftime6 && setting.fendtime6) {
          datas.push({
            text: '晚上下班',
            startTime: setting.fefftime6,
            endTime: setting.fendtime6
          })
        }

        this.settingTime = datas
      }
      this._setTime() 
      this.getAttendance()
    },
    // 获取考勤打卡记录
    async getAttendance() {
      wx.showLoading({title: '加载中'})
      let currentDate = DateFormula.format(new Date(), 'yyyy-MM-dd')
      let params = {
        ClockDate: currentDate,
        ClockUserId: this.userInfo.UserId
      }
      let result = await this.$http.post('/api/CrmMobile/GetAttendanceRecord', params)
      if (!result || result.Data.length == 0) this.noData = true
      wx.hideLoading()
      this._handleData(result)
    },
    _handleData(result) {
      let data = []
      result.Data.forEach(item => {
        let clockTime = DateFormula.format(new Date(item.fclocktime), "hh:mm:ss")
        let flag = false
        let currentValue;
        for (let i = 0; i <this.settingTime.length; i++) {
          let res = this.compareDate(clockTime, this.settingTime[i])
          if (res) {
            flag = true
            currentValue = this.settingTime[i]
            break;
          }
        }
        if (flag) {
          data.push({
            title: currentValue.text + '打卡',
            desc: '打卡时间：' + clockTime,
            icon: 'icon-true'
          })
        } else {
          data.push({
            title: '无效打卡',
            desc: '打卡时间：' + clockTime,
            icon: 'icon-guanbi',
            error: true
          })
        }
      })
      this.steps = data
    },
    // 获取当前地理位置
    getLocalPostion() {
      return new Promise(reslove => {
        wx.getLocation({
          // type: "wgs84",
          type: "gcj02",
          success(res) {
            reslove({
              lat: res.latitude,
              Lng: res.longitude
            });
          },
          fail() {
            wx.showToast({
              title: "获取地址失败",
              icon: "none",
              duration: 1200
            });
          }
        });
      });
    },
    async sign() {
      let position = await this.getLocalPostion();
      let userInfo = wx.getStorageSync('crmUserInfo')
      let params = {
        ClockUserId: this.userInfo.UserId,
        ClockDate: DateFormula.format(new Date(), "yyyy-MM-dd hh:mm:ss"),
        Lng: position.Lng,
        Lat: position.lat
      }
      let result = await this.$http.post('/api/CrmMobile/AddAttendanceRecord', params)
      if (result) {
        wx.showToast({
          title: "打卡成功",
          icon: "success",
          duration: 1200
        });
        this.getAttendance()
      }
    },
    /**
     * 判断某个时间点是否在一个时间段里面
     * time 时间点
     * timeSlot 时间段
     */
    compareDate(time, timeSlot) {
      let date = new Date()
      let startHous = timeSlot.startTime.split(':')[0]
      let startMin = timeSlot.startTime.split(':')[1]
      let endHous = timeSlot.endTime.split(':')[0]
      let endMin = timeSlot.endTime.split(':')[1]
      let hous = time.split(':')[0]
      let min = time.split(':')[1]
      if (date.setHours(startHous,startMin) < date.setHours(hous,min) && date.setHours(hous,min)  < date.setHours(endHous, endMin)) {
        return true
      } else {
        return false
      }
    }
     /**
     * 计算经纬度之间的距离公式
     * x1,x2是两个不同点的经度
     * y1,y2是两个不同点的纬度
     */
    // computedDistant(lat1, lng1, lat2, lng2) {
    //   var rad1 = lat1 * Math.PI / 180.0;
    //   var rad2 = lat2 * Math.PI / 180.0;
    //   var a = rad1 - rad2;
    //   var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    //   var r = 6378137;
    //   var distance =
    //     r *
    //     2 *
    //     Math.asin(
    //       Math.sqrt(
    //         Math.pow(Math.sin(a / 2), 2) +
    //           Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2)
    //       )
    //     );
    // },
  },
  computed: {
    currentTime() {
      let time = DateFormula.format(new Date(this.currentDate), "hh:mm:ss")
      if (!time) {
        return DateFormula.format(new Date(), "hh:mm:ss")
      }
      return  time
    }
  }
}
</script>

<style lang="less">
@import "~less/base-color.less";
#clockIn {
  .title {
    text-align: center;
    padding: 10px 0;
    font-size: 12px;
    color: @help-color;
  }
  .noData {
    text-align: center;
    font-size: 12px;
    color: #dfdfdf;
    margin-top: 15px;
  }
  .btn-sign {
    position:fixed; 
    right:10px; 
    bottom:60px; 
    z-index:10;

    margin: 0 auto;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
    color: #fff;
    background-color: #1989fa;
    font-size: 18px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    >span:last-child {
      color: #e4e4e4;
      margin-top: 10px;
      font-size: 14px;
    }
  }
}
</style>

