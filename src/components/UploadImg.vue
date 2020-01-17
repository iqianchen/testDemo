<template>
  <div class="uploadImg">
    <div class="upload-title">
      <span>图片上传</span>
      <span>{{files.length}}/{{maxImageLength}}</span>
    </div>
    <div class="upload-images">
      <div
        v-for="(item, index) in files"
        :key="index"
        class="image-item image"
        :style="{ backgroundImage: 'url('+item.path+')'}"
        @click.stop="previewImage(item)"  
      >
        <span class="icon" @click.stop="cancelImage(index)" v-if="!readonly">
          <span class="iconfont icon-guanbi"></span>
        </span>
      </div>

      <div class="addImage image-item" @click="chooseImage"  v-if="files.length < maxImageLength && !readonly">
        <span class="iconfont icon-mn_shangchuantupian"></span>
      </div>
    </div>

    <van-popup :show="showImage" @close="showImage = false">
      <div class="preview">
        <image @click="showImage = false" class="img" :src="currentImage" mode="widthFix"></image>
      </div>
    </van-popup>
  </div>
</template>

<script>
export default {
  data() {
    return {
      files: [],          // 记录上传的文件 
      showImage: false,   // 是否显示图片预览
      currentImage: '',   // 记录当前选中的图片
      uploadApi: '/api/CrmMobile/CrmFileUplad'    // 上传附件的接口
    }
  },
  props: {
    maxImageLength: {   // 最大上传文件个数
      type: Number,
      default: 4
    },
    maxFileSize: {    // 图片上传的最大文件大小（单位兆）
      type: Number,
      default: 20
    },
    readonly: {      // 只读状态
      type: Boolean,
      default: false
    }
  },
  methods: {
    // 设置文件初始值
    setFiles(files) {
      this.files = files;
    },
    // 图片预览
    previewImage(item) {
      this.showImage = true;
      this.currentImage = item.path;
    },
    // 图片删除
    cancelImage(index) {
      this.files.splice(index, 1)
    },
    // 选择要上传的图片
    chooseImage() {
      let _this = this;
      wx.chooseImage({
        count: 1,
        success: res => {
          let ext, filePath = res.tempFilePaths[0], file = res.tempFiles[0], errorMsg = '';
          ext = _this._getExtension(filePath).toLowerCase()
          let maxSize = _this.maxFileSize * 1024;
          if (!(ext in { png: 1, jpeg: 1, jpg: 1, bmp: 1 })) {  // 限制图片类型
            errorMsg = '只允许上传png,jpeg,jpg,bmp文件';
          } else if (file.size / 1024 > maxSize) {    // 限制图片大小
            errorMsg = `图片文件不能超过${_this.maxFileSize}M`;
          } 
          // 错误提示
          if (errorMsg) {
            return wx.showModel({
              title: '出错了',
              content: errorMsg
            })
          }
          wx.getFileSystemManager().readFile({
            filePath: filePath,
            encoding: 'base64',
            success: result => {
              let base64 = result.data;
              let timestamp = Date.parse(new Date())
              let fileName = (timestamp / 1000) + '.' + ext;
              let img = {
                name: fileName,
                path: filePath,
                base64: base64
              }
              _this.files.push(img)
              _this.imagesCount = _this.files.length;
            }
          })
        }
      })
    },
    _getExtension(path) {
      let _type = '';
      let parts = path.split('.');
      if (path.lastIndexOf('.') >= 0) {
        _type = parts.slice(-1)[0]
      }
      return _type
    },
    /**
     * 上传图片
     * @param {String} fileNames  保存到服务器的文件名
     * @param {String} id     当前单据的主键id
     * @param {Number} index  当前上传图片的索引 默认为0
     * @param {Function} callBack  全部上传成功后执行的回调函数
     */
    async uploadImg(fileNames, id, index = 0, callBack) {
      if (index > this.files.length - 1) {
        if (callBack && typeOf(callBack) == 'function') callBack();
        return true;
      }

      let item = this.files[index];
      if (!item.base64) {
        this.uploadImg(fileNames, id, index+1, callBack)
        return
      }
      let params = {
        KeyType: fileNames,
        KeyName: id,
        KeyValue: item.name,
        FileData: item.base64
      }
      let result = this.$http.post(this.uploadApi, params)
      if (result) this.uploadImg(fileNames, id, index+1, callBack)
      else {
        wx.showToast({ title: '图片上传失败', icon: 'none', duration: this.$setting.toastDuration })
        return false;
      }
    }
  }
}
</script>

<style lang="less">
@import '~less/base-color.less';

.uploadImg {
  background-color: @white;
  padding: 15px;
  margin-top: 6px;
  .upload-title {
    display: flex;
    font-size: 14px;
    justify-content: space-between;
    color: @text-subTitle-color;
  }

  .upload-images {
    margin-top: 15px;
    display: flex;
    flex-wrap: wrap;
    box-sizing: border-box;
    .image-item {
      margin-right: 10px;
      box-sizing: border-box;
      width: 78px;
      height: 78px;
      &:last-child {
        margin-right: 0px;
      }
    }
    .image {
      position: relative;
      background-size:cover;
      background-position:center;
      background-repeat:no-repeat;
      .icon {
        position: absolute;
        background-color:rgba(0, 0, 0, 0.5);
        padding: 3px 6px;
        color: @white;
        top: 0;
        right: 0;
        .iconfont {
          font-size: 18px;
        }
      }
    }
    .addImage {
      border: 2px solid @line-color;
      display: flex;
      color: @line-color;
      align-items: center;
      justify-content: center;
      .iconfont {
        font-size: 36px;
      }
    }
  }
}
</style>