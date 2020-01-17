<template>
  <div id="study">
    <div class="search">
      <!-- <van-search :value="searchKey" @change="changeSearchKey" use-action-slot placeholder="请输入搜索关键词" @search="onSearch">
        <div slot="action" @tap="onSearch">搜索</div>
      </van-search> -->
      <div class="my-search">
        <div class="search-content">
          <span class="iconfont icon-sousuo"></span>
          <input class="search-body" :value="searchKey" type="text" @blur="changeSearchKey" placeholder="请输入搜索关键词" @confirm="onSearch">
        </div>
        <div class="search-action" @click="onSearch">搜索</div>
      </div>
    </div>
    <van-tabs swipeable custom-class="study-tab" :active="active" @change="onChange">
      <van-tab title="学习文档">
        <scroll-view scroll-y :style="{height: scrollHeight}" @scrolltolower="onReachBottom">
          <div class="list">
            <div class="list-item" v-for="(item, index) in tabs[0].listData" :key="index">
              <span v-text="item.ftitle"></span>
              <span @click="downLoadFile(item)" class="iconfont icon-xiazai"></span>
            </div>
            <div v-if="tabs[0].loading" class="loading">加载中...</div>
            <div v-if="tabs[0].noMore" class="noMore">没有更多数据了</div>
            <div v-if="tabs[0].listData.length == 0 && tabs[0].noData" class="noData">
              <span class="iconfont icon-ico_meiyoushuju"></span>
              <span class="text">暂无数据</span>
            </div>
          </div>
        </scroll-view>
      </van-tab>
      <van-tab title="学习视频">
        <scroll-view scroll-y :style="{height: scrollHeight}" @scrolltolower="onReachBottom">
          <div class="list">
            <div class="list-item" v-for="(item, index) in tabs[1].listData" :key="index">
              <span v-text="item.ftitle"></span>
              <span class="iconfont icon-bofang" @click="createVideo(item)"></span>
            </div>
            <div v-if="tabs[1].loading" class="loading">加载中...</div>
            <div v-if="tabs[1].noMore" class="noMore">没有更多数据了</div>
            <div v-if="tabs[1].listData.length == 0 && tabs[1].noData" class="noData">
              <span class="iconfont icon-ico_meiyoushuju"></span>
              <span class="text">暂无数据</span>
            </div>
          </div>
        </scroll-view>
      </van-tab>
    </van-tabs>
    <video id="myVideo" @fullscreenchange="fullscreenchange" :src="videoPath" v-if="showVideo" :show-fullscreen-btn="true"></video>

    <van-toast id="custom-selector" />
    <van-toast id="custom-selector1" />
  </div>
</template>

<script>
/* eslint-disable */
import Toast from '@/../static/vant/toast/toast';
export default {
  data() {
    return {
      active: 0,
      searchKey: '',
      scrollHeight: 0,
      propress: 0,
      videoPath: '',
      showVideo: false,
      videoContext: '',
      tabs: [
        {
          params: {
            PageIndex: 1,
            PageSize: 20
          },
          listData: [],
          title: '',
          ResourceType: '0',
          rowCount: 0,
          loaded: false,  // 是否已缓存
          loading: false, // 是否正在加载
          noMore: false,  // 没有更多数据
          noData: false   // 没有数据
        }, {
          params: {
            PageIndex: 1,
            PageSize: 20
          },
          listData: [],
          title: '',
          ResourceType: '1',
          rowCount: 0,
          loaded: false,  // 是否已缓存
          loading: false, // 是否正在加载
          noMore: false,  // 没有更多数据
          noData: false   // 没有数据
        }
      ]
    }
  },
  onLoad() {
    this._setScrollHeight()
    this.getData()
  },
  mounted() {
    this.videoContext = wx.createVideoContext('myVideo')
  },
  methods: {
    // 获取数据
    async getData(type) {
      let currentTab = this.tabs[this.active]
      if (type === 'up') {
        if (currentTab.loading) return
        currentTab.loading = true
      } else {
        wx.showLoading({title: '加载中'})
      }
      let params = Object.assign(currentTab.params, {
        Title: currentTab.title,
        ResourceType: currentTab.ResourceType
      })
      let result = await this.$http.post('/api/CrmMobile/GetLearnResource', params)
      currentTab.rowCount = result.RowCount
      currentTab.loaded = true

      if (type === 'up') {
        currentTab.listData = currentTab.listData.concat(result.Data)
        currentTab.loading = false
      } else {
        currentTab.listData = result.Data
        wx.hideLoading()
      }
      if (result.Data.length == 0) currentTab.noData = true
    },
    // 下载文件
    downLoadFile(item) {
      let _this = this
      let filePath = item.fattachfiles

      let arr = item.fattachfiles.split(',')
      let last = arr[arr.length]
      // 下载文件
      let downloadTask  = wx.downloadFile({
        url: filePath,
        success: (res) => {
          _this.saveFile(res.tempFilePath, last)
        },
        fail: err => {
          wx.showToast({ title: '下载文件出错', icon: 'none'})
        }
      })
      const toast = Toast({
        duration: 0,
        position: 'bottom',
        message: '下载进度0%',
        selector: '#custom-selector'
      })
      // 读取当前的下载进度
      downloadTask.onProgressUpdate(res => {
        // res.progress  下载进度百分比
        // res.totalBytesWritten 已经下载的数据长度，单位 Bytes
        // res.totalBytesExpectedToWrite 预期需要下载的数据总长度，单位 Bytes
        if (res.progress == 100) {
          Toast.clear();
        } else {
          toast.setData({
            message: `下载进度${res.progress}%`
          })
        }
      })
    },
    // 保存文件
    saveFile(tempFilePath, last) {
      wx.openDocument({
        filePath: tempFilePath,
        fileType: last,
        success: res => {},
        fail: err => {
          wx.showToast({ title: '不支持的文件格式', icon: 'none'})
        }
      })
    },
    // 生成video
    createVideo(item) {
      this.showVideo = true
      this.videoPath = item.fattachfiles
      // 进入全屏并播放
      this.videoContext.requestFullScreen()
      this.videoContext.play()
    },
    // 进入全屏和退出全屏时触发
    fullscreenchange(event) {
      // 当退出全屏时关闭视频
      if (!event.mp.detail.fullScreen) {
        this.videoContext.stop()
      }
    },
    // 设置滚动高度
    _setScrollHeight() {
      let _this = this
      wx.getSystemInfo({
        success: res => {
          let windowHeight = res.windowHeight;
          _this.scrollHeight = windowHeight - 54 - 44 + 'px'
        }
      })
    },
    // 上拉加载
    onReachBottom() {
      let currentTab = this.tabs[this.active]
      if (currentTab.rowCount <= currentTab.PageIndex * currentTab.PageSize) {
        currentTab.noMore = true
        return;
      }
      currentTab.params.PageIndex++
      this.getData('up')
    },
    // 切换页签
    onChange(event) {
      let index = event.mp.detail.index
      this.active = index
      let currentTab = this.tabs[index]
      if (currentTab.loaded) return
      this.getData()
    },
    // 改变关键字
    changeSearchKey(event) {
      this.searchKey = event.mp.detail.value
    },
    // 点击搜索
    onSearch() {
      setTimeout(() => {
        let currentTab = this.tabs[this.active]
        currentTab.title = this.searchKey
        currentTab.params.PageIndex = 1
        this.getData()
      },100)
    }
  }
}
</script>

<style lang="less">
@import "~less/base-color.less";
#study {
  height: 100%;
  .study-tab {
    .list {
      padding: 10px 15px;
      font-size: 14px;
      .list-item {
        padding: 8px 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        >span:first-child {
          width: 230px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .iconfont {
          font-size: 20px;
        }
      }
    }
  }
  .loading,
  .noMore {
    font-size: 16px;
    color: @help-color;
    text-align: center;
    margin: 8px 0;
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
