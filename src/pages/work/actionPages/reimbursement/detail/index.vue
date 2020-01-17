<template>
  <div id="remimBursementDetail">
    <van-cell-group custom-class="custom-cell-group" title="基本信息">
      <van-field v-if="actionType !== 'add'" label="报销单号" readonly :value="datas.fbillno"/>
      <van-field required label="报销人" readonly :value="datas.freimbursername"/>
      <van-field required label="报销部门" readonly :value="datas.fdeptname" />
      <van-field required label="报销时间" @click="selectDate" readonly :value="datas.fdate" :is-link="actionType !== 'detail'"  :placeholder="actionType !== 'detail' ? '请选择报销时间': ''"/>
      <van-field type="number" required label="报销总金额" readonly :value="datas.ftotalamt" :placeholder="actionType !== 'detail' ? '根据明细自动计算': ''" />
    </van-cell-group>

    <van-cell-group custom-class="custom-cell-group" :title="'明细'+(index+1)" v-for="(item,index) in datas.details" :key="index">
      <van-field :readonly="actionType === 'detail'" label="费用项目" readonly @click="choseExpenseprj(index)" :placeholder="actionType !== 'detail' ? '请输入费用项目': ''" :is-link="actionType !== 'detail'" :value="item.fexpenseprjname"/>
      <van-field :readonly="actionType === 'detail'" label="费用金额" required type="number" :placeholder="actionType !== 'detail' ? '请输入费用金额': ''" @blur="changeAmt($event,index)" :value="item.famt"/>
      <van-field :readonly="actionType === 'detail'" label="人数" type="number" :placeholder="actionType !== 'detail' ? '请输入人数': ''" @blur="changeNum($event,index)" :value="item.fnum"/>
      <van-field :readonly="actionType === 'detail'" label="发票号" :placeholder="actionType !== 'detail' ? '请输入发票号': ''" @blur="changeRefno($event,index)" :value="item.frefno"/>
      <van-field v-if="showTextarea" input-class="textarea-class" :readonly="actionType === 'detail'" label="费用说明" type="textarea" autosize :placeholder="actionType !== 'detail' ? '请输入费用说明': ''" @blur="changeDesc($event,index)" :value="item.fdesc"/>
      <div class="textarea-box" v-if="!showTextarea">
        <span class="label">费用说明</span>
        <span class="my-textarea" v-text="item.fdesc || ''"></span>
      </div>
      
      <div class="upLoad">
        <div class="title">
          <span>图片上传</span>
          <span>{{item.imagesCount}}/4</span>
        </div>
        <div class="images">
          <div @click="previewImage(val)" class="image box-item" v-for="(val,i) in item.files" :style="{backgroundImage: 'url('+val.path+')'}" :key="i">
            <span class="icon" @click.stop="cancelImage(index,i)" v-if="actionType !== 'detail'">
              <span class="iconfont icon-guanbi"></span>
            </span>
          </div>
          <div class="addImage box-item" @click="chooseImage(index)"  v-if="item.imagesCount < 4 && actionType !== 'detail'">
            <span class="iconfont icon-mn_shangchuantupian"></span>
          </div>
        </div>
      </div>
    </van-cell-group>

    <van-button custom-class="addDetail" size="large" @click="addDetail" v-if="actionType !== 'detail'">新增报销明细</van-button>

    <van-cell-group v-if="actionType === 'detail'">
      <van-field v-if="datas.fapprovername" label="审核人" readonly :value="datas.fapprovername"/>
      <van-field v-if="showTextarea && (datas.fappdate || permission.approve)" input-class="textarea-class" :readonly="!permission.approve" label="审批评论" type="textarea" autosize placeholder="请输入审批评论" @blur="changeAppComent" :value="datas.fappcomment"/>
      <div class="textarea-box" v-if="!showTextarea">
        <span class="label">审批评论</span>
        <span class="my-textarea" v-text="datas.fappcomment || ''"></span>
      </div>
    </van-cell-group>

    <div class="button-group">
      <van-button size="large" v-if="actionType !== 'detail'"  type="info" @click="submit" :disabled="loading" :loading="loading" :loading-text="loadingText">提交</van-button>
      <van-button size="large" v-if="actionType === 'detail' && !datas.fappdate && permission.approve" type="primary" @click="approveAction('Approve')" :loading="loading" :disabled="loading" :loading-text="loadingText">审核</van-button>
      <van-button size="large" v-if="actionType === 'detail' && datas.fappdate && permission.unApprove" type="danger" @click="approveAction('UnApprove')" :loading="loading" :disabled="loading" :loading-text="loadingText">反审核</van-button>
    </div>

    <van-popup :show="showDate" position="bottom" >
      <van-datetime-picker type="date" :value="currentDate" @confirm="changeDate" @cancel="showDate = false" />
    </van-popup>
    <van-popup :show="showPicker" position="bottom" >
      <van-picker show-toolbar :columns="currentColumns" @confirm="changePicker" @cancel="showPicker = false" />
    </van-popup>

    <van-popup :show="showImage" @close="showImage = false">
      <div class="preview">
        <image @click="showImage = false" class="img" :src="currentImage" mode="widthFix"></image>
      </div>
    </van-popup>
  </div>
</template>

<script>
/* eslint-disable */
import dateFormula from '@js/dateFormula.js'
import { prevPageSetData } from '@js/pageValue'
export default {
  data() {
    return {
      actionType: 'add',
      loading: false,
      showDate: false,
      showImage: false,
      showPicker: false,
      showTextarea: true,
      currentImage: '',
      currentColumns: [],
      currentIndex: '',
      currentDate: new Date().getTime(),
      loadingText: '正在提交',
      files: [],
      datas: {
        fbillno: '',
        fapprovercode: '',
        fapprovername: '',
        fappcomment: '',
        fdate: dateFormula.format(new Date(), 'yyyy-MM-dd'),
        freimburserid: '',
        freimbursername: '',
        fdeptid: '',
        fdeptname: '',
        ftotalamt: '',
        details: []
      },
      permission: {}
    }
  },
  onLoad(query) {
    if (query) {
      switch (query.type) {
        case "detail":
          this.actionType = "detail"
          this.getDetail(query.id)
          this.permission = JSON.parse(query.permission) || {}
          break;
        case "update":
          this.actionType = "update"
          this.getDetail(query.id)
          break;
        case 'add':
          this.actionType = 'add'
          this.addDetail()
          this.getProject()
          break;
      }
    }
    this.getUserDetail()
  },
  onUnload() {
    this.initPage()
  },
  methods: {
    initPage() {
      this.actionType = 'add'
      this.loading = false
      this.showDate = false
      this.showImage = false
      this.showPicker = false
      this.showTextarea = true
      this.currentImage = ''
      this.currentColumns = []
      this.currentDate = new Date().getTime()
      this.loadingText = '正在提交'
      this.files = []
      this.datas = {
        fbillno: '',
        fapprovercode: '',
        fapprovername: '',
        fappcomment: '',
        fdate: dateFormula.format(new Date(), 'yyyy-MM-dd'),
        freimburserid: '',
        freimbursername: '',
        fdeptid: '',
        fdeptname: '',
        ftotalamt: '',
        details: []
      },
      this.permission = {}
    },
    // 获取用户详情
    getUserDetail() {
      let userInfo = wx.getStorageSync('crmUserInfo')
      this.datas.freimburserid = userInfo.UserId
      this.datas.freimbursername = userInfo.UserName
      this.datas.fdeptid = userInfo.DeptId
      this.datas.fdeptname = userInfo.DeptName
    },
    async getDetail(id) {
      let params = {
        ReimbursementId: id
      }
      let result = await this.$http.post('/api/CrmMobile/GetReimbursementById', params, true)
      result = this._handleData(result)
      this.datas = result
      this.getProject()
    },
    changePicker(event) {
      let currentValue = event.target.value
      this.datas.details[this.currentIndex].fexpenseprjid = currentValue.value
      this.datas.details[this.currentIndex].fexpenseprjname = currentValue.text
      this.datas.details = [...this.datas.details]
      this.showPicker = false
    },
    // 获取费用项目
    async getProject() {
      let result = await this.$http.post('/api/CrmMobile/GetReimbursementExpensePrj', {
        PageIndex: 1,
        PageSize: 100
      })
      this.currentColumns = result.map(item => {
        return {
          text: item.Name,
          value: item.Id
        }
      })
    },
    async approveAction(ApproveMethod) {
      if (this.loading) return
      this.loading = true
      setTimeout(() => {
        let userInfo = wx.getStorageSync('crmUserInfo')
        let userName = userInfo.UserName
        let userCode = userInfo.UserCode
        this.datas.fapprovername = userName
        this.datas.fapprovercode = userCode

        this.datas.UserId = userInfo.UserId,
        this.datas.UserToken = userInfo.UserToken,
        this.datas.UserPwd = userInfo.UserPwd,
        this.datas.StoreId = userInfo.StoreId,
        this.datas.StoreCode = userInfo.StoreCode,
        this.datas.StoreName = userInfo.StoreName,
        this.datas.DeptId = userInfo.DeptId,
        this.datas.DeptName = userInfo.DeptName
        let params = {
          ReimbursementId: this.datas.frowid,
          ApproveMethod: ApproveMethod,
          Model: this.datas
        }
        try {
          this.$http.post('/api/CrmMobile/ApproveReimbursement', params)
          this.loading = false
          wx.showToast({ title: '成功', duration: 800})
          setTimeout(()=>{
            prevPageSetData('update', true)
            wx.navigateBack({ delta: 1})
          }, 800)
        } catch(err) {
          this.loading = false
        }
      },200)
    },
    // 选择费用项目
    choseExpenseprj(index) {
      if (this.actionType === 'detail') return
      this.showPicker = true
      this.currentIndex = index
    },
    // 处理数据
    _handleData(result) {
      if (result.details) {
        let totalAmt = 0
        result.details.forEach(item => {
          totalAmt += parseFloat(item.famt)
          item.imagesCount = 0
          item.files = []
          if (item.fattachfiles) {
            let arr = item.fattachfiles.split('|')
            result.fattachpath = result.fattachpath.replace(/http:\/\/192\.168\.3\.30:8066/, this.$baseImgUrl)
            arr.forEach(val => {
              item.files.push({
                name: val,
                path: `${result.fattachpath}${result.frowid}/${val}`
              })
            })
            item.imagesCount = arr.length
          }
        })
        result.ftotalamt = totalAmt
      }
      if (result.fdate && result.fdate !== '0001-01-01T00:00:00') {
        result.fdate = dateFormula.format(new Date(result.fdate), 'yyyy-MM-dd')
      } else {
        result.fdate = ''
      }
      return result
    },
    submit() {
      setTimeout(() => {
        this.commit()
      },200)
    },
    // 提交
    async commit() {
      if (!this.validRules() || this.loading) return;
      this._handleSendData()
      this.loading = true
      if (this.actionType === 'add') {
        // 新增
        try {
          let result = await this.$http.post('/api/CrmMobile/AddReimbursement', this.datas)
          this.loading = false
          if (result.frowid) {
            this.uploadImg(result.frowid, 0)
          }
        } catch(e) {
          this.loading = false
        }
      } else if (this.actionType === 'update') {
        // 修改
        try {
          let result = await this.$http.post('/api/CrmMobile/AddReimbursement', this.datas)
          this.loading = false
          if (result.frowid) {
            this.uploadImg(result.frowid, 0)
          }
        } catch(e) {
          this.loading = false
        }
      }
    },
    // 处理发送的数据
    _handleSendData() {
      if (this.datas.details && this.datas.details.length > 0) {
        this.datas.details.forEach(item => {
          item.files.forEach((val, i) => {
            if (val.base64) {
              if (item.fattachfiles) item.fattachfiles += '|' + val.name
              else {
                if (i == 0) item.fattachfiles = val.name
                else item.fattachfiles += '|' + val.name
              }
              let newObj = {...val}
              this.files.push(newObj)
              // setTimeout(() => {
              delete val.base64
              // },100)
            }
          })
        })
      }
    },
    // 上传图片
    async uploadImg(id, index) {
      // debugger
      if (index > this.files.length - 1) {
        this.loading = false
        wx.showToast({ title: '提交成功', duration: 800})
        setTimeout(()=>{
          prevPageSetData('update', true)
          wx.navigateBack({ delta: 1})
        }, 800)
        return
      }
      let item = this.files[index]
      let params = {
        KeyType: 'ReimbursementFiles',
        KeyName: id,
        KeyValue: item.name,
        FileData: item.base64
      }
      let result = await this.$http.post('/api/CrmMobile/CrmFileUplad', params)
      if (result) {
        this.uploadImg(id, index+1)
      } else {
        wx.showToast({ title: '图片上传失败', icon: 'none'})
      }
    },
    // 验证
    validRules() {

      return true
    },
    // 取消图片
    cancelImage(index, i) {
      this.datas.details[index].files.splice(i,1)
      this.datas.details[index].imagesCount = this.datas.details[index].files.length
      this.datas.details = [...this.datas.details]
    },
    // 新增明细
    addDetail() {
      this.datas.details.push({
        fexpenseprjid: '',
        fexpenseprjname: '',
        famt: '',
        fnum: '',
        frefno: '',
        fdesc: '',
        fattachment: '',
        fattachfiles: '',
        imagesCount: 0,
        files: []
      })
      this.datas.details = [...this.datas.details]
    },
    chooseImage(index) {
      let _this = this
      wx.chooseImage({
        count: 1,
        success(res) {
          let ext, filePath = res.tempFilePaths[0], file = res.tempFiles[0]
          ext = _this._getExtension(filePath).toLowerCase()
          if (!(ext in { png: 1, jpeg: 1, jpg: 1, bmp: 1 })) {
            return wx.showModel({
              title: '出错了',
              content: '只允许上传png,jpeg,jpg,bmp文件'
            })
          } else if (file.size / 1024 > 4096) {
            return wx.showModel({ title: '出错了', content: '图片文件不能超过4M'})
          } else {       
            wx.getFileSystemManager().readFile({
              filePath: filePath,
              encoding: 'base64',
              success: result => {
                let base64 = result.data
                let timestamp = Date.parse(new Date())
                let fileName = (timestamp / 1000) + '.' + ext
                let img = {
                  name: fileName,
                  path: filePath,
                  base64: base64
                }
                _this.datas.details[index].files.push(img)
                _this.datas.details[index].imagesCount = _this.datas.details[index].files.length
                _this.datas.details = [..._this.datas.details]
              }
            })
          }
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
    // 改变报销日期
    selectDate() {
      if (this.actionType === 'detail') return
      this.showDate = true
    },
    changeDate() {
      let stringDate = dateFormula.format(new Date(event.mp.detail), 'yyyy-MM-dd')
      this.datas.fdate = stringDate
      this.showDate = false
    },
    // 图片预览
    previewImage(val) {
      this.showImage = true
      this.currentImage = val.path
    },
    // 改变总金额
    changeTotalamt(e) {
      this.datas.ftotalamt = e.mp.detail.value
    },
    changeExpenseprjname(e, index) {
      this.datas.details[index].fexpenseprjname = e.mp.detail.value
    },
    changeAmt(e, index) {
      this.datas.details[index].famt = e.mp.detail.value

      this.datas.ftotalamt = 0
      this.datas.details.forEach(item => {
        this.datas.ftotalamt += parseFloat(item.famt)
      })
    },
    changeNum(e, index) {
      this.datas.details[index].fnum = e.mp.detail.value
    },
    changeRefno(e, index) {
      this.datas.details[index].frefno = e.mp.detail.value
    },
    changeDesc(e, index) {
      this.datas.details[index].fdesc = e.mp.detail.value
    },
    changeAppComent(e) {
      this.datas.fappcomment = e.mp.detail.value
    },
  },
  watch: {
    showDate(val) {
      setTimeout(() => {
        this.showTextarea = !val
      },200)
    },
    showPicker(val) {
      setTimeout(() => {
        this.showTextarea = !val
      },200)
    },
    showImage(val) {
      setTimeout(() => {
        this.showTextarea = !val
      },200)
    }
  }
}
</script>

<style lang="less">
@import '~less/base-color.less';
#remimBursementDetail {
  min-height: 100%;
  background: @background-color;
  .upLoad {
    background-color: #fff;
    padding: 15px;
    margin-top: 6px;
    .title {
      display: flex;
      font-size: 14px;
      justify-content: space-between;
      color: #888;
    }
    .images {
      margin-top: 15px;
      display: flex;
      flex-wrap: wrap;
      box-sizing: border-box;
      .box-item {
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
          color: #fff;
          top: 0;
          right: 0;
          .iconfont {
            font-size: 18px;
          }
        }
      }
      .addImage {
        border: 2px solid #ccc;
        display: flex;
        color: #ccc;
        align-items: center;
        justify-content: center;
        .iconfont {
          font-size: 36px;
        }
      }
    }
  }
  .preview {
    width: 375px;
    .img {
      width: 100%;
    }
  }
  .addDetail {
    margin: 8px 0;
  }
}
</style>

