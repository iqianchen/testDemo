<template>
  <div id="pushGoods">
    <div class="images">
      <img :src="(datas.Pic && datas.Pic[0].PicPath) ? datas.Pic[0].PicPath : '/static/images/default.jpg'" alt="">
    </div>
    <div class="card">
      <van-cell-group>

        <van-field label="产品名称" readonly :value="datas.GoodsName || ''"></van-field>
        <van-field label="产品代号" readonly :value="datas.GoodsCode || ''"></van-field>
        <van-field label="产品特色" input-class="textarea-class" placeholder="请输入产品特色" @blur="changeSpecial" type="textarea" autosize :value="queryData.Special"></van-field>
        <van-field label="水印" placeholder="请输入水印" @blur="changeWatermark" :value="queryData.Watermark"></van-field>
        <van-field label="联系人" placeholder="请输入联系人" @blur="changePerson" :value="queryData.Person"></van-field>
        <van-field label="联系电话" placeholder="请输入联系电话" @blur="changePersonTel" :value="queryData.PersonTel"></van-field>
        <van-field label="联系地址" placeholder="请输入联系地址" @blur="changePersonAddress" type="textarea" autosize :value="queryData.PersonAddress"></van-field>
      </van-cell-group>
    </div>
    <button class="share-button" open-type="share" :disabled="isShare" :data-title="datas.GoodsName" :data-id="datas.Id" plain="true">推送</button>
    <!-- <button @click="share">推送</button> -->
  </div>
</template>

<script>
import { Setting } from '@/config/setting.js'
export default {
  data() {
    return {
      datas: {},
      queryData: {
        frowid: '',
        Special: '',
        Watermark: '',
        Person: '',
        PersonId: '',
        PersonTel: '',
        Pic: [],
        isShare: false,
        PersonAddress: '',
        watermarkImage: ''
      }
    }
  },
  // 推送
  onShareAppMessage(options) {
    let data = options.target.dataset
    let _this = this

      // 是否要添加水印文字
    let userInfo = wx.getStorageSync('crmUserInfo')
    let path = `pages/pushPage/main?goodsId=${_this.datas.Id}&userId=${_this.queryData.PersonId}&userToken=${userInfo.UserToken}&storeId=${userInfo.StoreId}&Person=${_this.queryData.Person}&PersonTel=${_this.queryData.PersonTel}&PersonAddress=${_this.queryData.PersonAddress}&Special=${_this.queryData.Special}`
    if (this.queryData.Watermark && this.datas.Pic[0] && this.datas.Pic[0].PicPath) {
      _this.updateSpecial()
      let imageUrl = _this.watermarkImage
      path += '&imageUrl='+imageUrl
      return {
        title: data.title,
        path: path,
        imageUrl: imageUrl,
        success: res => {
        }
      }
    } else {
      _this.updateSpecial()
      let imageUrl;
      if (this.datas.Pic && this.datas.Pic[0] && this.datas.Pic[0].PicPath) {
        imageUrl = this.datas.Pic[0].PicPath
      } else {
        imageUrl = Setting.baseUrl + '/images/default.jpg'
      }
      path += '&imageUrl='+imageUrl
      return {
        title: data.title,
        path: path,
        imageUrl: imageUrl,
        success: res => { }

      }
    }
  },
  onLoad(query) {
    if (query && query.goodsId) {
      this.getData(query.goodsId)
    }
  },
  onUnload() {
    this.initPage()
  },
  methods: {
    initPage() {
      this.datas = {}
      this.queryData = {
        frowid: '',
        Special: '',
        Watermark: '',
        Person: '',
        PersonId: '',
        PersonTel: '',
        Pic: [],
        isShare: false,
        PersonAddress: '',
        watermarkImage: ''
      }
    },
    // share() {
    //   let _this = this
    //   let userInfo = wx.getStorageSync('crmUserInfo')
    //   let params = {
    //     ImageUrl: this.datas.Pic[0].PicPath,
    //     WatermarkText: this.queryData.Watermark,
    //     WatermarkStatus: 1,
    //     Quality: 100,
    //     FontSize: 24
    //   }
    //   // 生成水印
    //   this.$http.post('/api/CrmMobile/AddWatermark', params).then(res => {
    //     if (res && res.ImageUrl) {
    //       let imageUrl = _this.$baseImgUrl + res.ImageUrl
    //       let path = `/pages/pushPage/main?goodsId=${_this.datas.Id}&userId=${_this.queryData.PersonId}&userToken=${userInfo.UserToken}&storeId=${userInfo.StoreId}&imageUrl=${imageUrl}&Person=${_this.queryData.Person}&PersonTel=${_this.queryData.PersonTel}&PersonAddress=${_this.queryData.PersonAddress}`
    //       // wx.navigateTo
    //       wx.navigateTo({url: path})
    //     }
    //   })
    // },
    // 获取数据
    async getData(id) {
      let params = {
        GoodsId: id
      }
      let result = await this.$http.post('/api/CrmMobile/GetProductById', params)
      this.datas = result

      if (result.Pic && result.Pic[0] && result.Pic[0].PicPath) {
        result.Pic[0].PicPath = result.Pic[0].PicPath.replace(/http:\/\/192\.168\.3\.30:8066/, this.$baseImgUrl)
      } else {
        this.isShare
      }
      this.getUserDetail()
    },
    // 获取用户详情
    async getUserDetail() {
      let result = await this.$http.post('/api/CrmMobile/GetUserDetail',{})
      this.queryData.Person = result.realname
      this.queryData.PersonId = result.userid
      this.queryData.PersonTel = result.mobile

      let address = ''
      if (result.organize.provincename) address += result.organize.provincename
      if (result.organize.cityname) address += result.organize.cityname
      if (result.organize.countyname) address += result.organize.countyname
      if (result.organize.address) address += result.organize.address
      this.queryData.PersonAddress = address
      this.getGoodsSpecial()
    },
    // 获取产品特色
    async getGoodsSpecial() {
      let result = await this.$http.post('/api/CrmMobile/GetFgFeature', { GoodsId: this.datas.Id})
      if (result.fgoodsfeature) this.queryData.Special = result.fgoodsfeature
      if (result.frowid) this.queryData.frowid = result.frowid
    },
    // 修改产品特色
    async updateSpecial() {
      let params = {
        frowid: this.queryData.frowid,
        fgoodsid: this.datas.Id,
        fgoodsfeature: this.queryData.Special,
        fuserid: this.queryData.PersonId
      }
      let result = await this.$http.post('/api/CrmMobile/CreateFgFeature', params)
    },
    // 添加水印
    async addWatermark() {
      if (!this.queryData.Watermark || !this.datas.Pic[0].PicPath) return
      this.isShare = true
      let params = {
        ImageUrl: this.datas.Pic[0].PicPath,
        WatermarkText: this.queryData.Watermark,
        WatermarkStatus: 9,
        Quality: 100,
        FontSize: 42
      }
      let result = await this.$http.post('/api/CrmMobile/AddWatermark', params)
      this.isShare = false
      if (result) this.watermarkImage = Setting.baseUrl + '/Upload/Watermark/' + result.ImageUrl
    },
    // 改变产品特色
    changeSpecial(e) {
      this.queryData.Special = e.mp.detail.value;
    },
    // 改变水印
    changeWatermark(e) {
      this.queryData.Watermark = e.mp.detail.value;
      this.isShare = true
      setTimeout(() => {
        this.addWatermark()
      }, 100)
    },
    changePerson(e) {
      this.queryData.Person = e.mp.detail.value;
    },
    changePersonTel(e) {
      this.queryData.PersonTel = e.mp.detail.value;
    },
    changePersonAddress(e) {
      this.queryData.PersonAddress = e.mp.detail.value;
    },
  }
}
</script>

<style lang="less">
#pushGoods {
  .images {
    img {
      width: 100%;
    }
  }
  .share-button {
    width: 80%;
    height: 45px;
    margin: 25px auto;
    border: none;
    background: #19be6b;
    color: #fff;
  }
}
</style>
