<template>
  <div id="goodsDetail">
    <!-- 客户管理 -->
    <!-- <swiper>
      <swiper-item v-for="(item, index) in goodsDetail.Pic" :key="index">
        <image :src="item.PicPath || '/static/images/default.jpg'" class="slide-image" width="375" height="150" />
      </swiper-item>
    </swiper> -->
    <div class="images">
      <img :src="(goodsDetail.Pic && goodsDetail.Pic[0].PicPath) ? goodsDetail.Pic[0].PicPath : '/static/images/default.jpg'" alt="">
    </div>
    <div class="goodsInfo">
      <div class="goodsName">
        <span>产品名称：</span>
        <span v-text="goodsDetail.SeriesName || ''"></span>
      </div>
      <div>
        <span>产品代号：</span>
        <span v-text="goodsDetail.SeriesCode || ''"></span>
      </div>
      <div>
        <span>尺寸：</span>
        <span>120*130*250</span>
      </div>
      <div>
        <span>品牌:</span>
        <span v-text="goodsDetail.BrandName || ''"></span>
      </div>
      <div>
        <span>款式:</span>
        <span v-text="goodsDetail.StyleName || ''"></span>
      </div>
      <div>
        <span>系列:</span>
        <span v-text="goodsDetail.SeriesName || ''"></span>
      </div>
      <div>
        <span>产品类别:</span>
        <span v-text="goodsDetail.ProductCategoryName || ''"></span>
      </div>
      <!-- <div>
        <span>材质:</span>
        <span>核桃木/牛皮/仿皮/海绵</span>
        <span v-text="goodsDetail.StyleName"></span>
      </div> -->
    </div>

    <div class="selable-color">
      <div class="color-title">可选色板</div>
      <div class="color-content">
        <div class="color-list" v-for="(item, index) in goodsDetail.SelableColor" :key="index">
          <img :src="item.PicPath" alt="">
          <span>{{item.ColorCode}}/{{item.ColorName}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'goodsDetail',
  data () {
    return {
      goodsDetail: []
    }
  },
  onLoad (query) {
    this.getGoodsDetail(query.goodsId)
  },
  onUnload() {
    this.initPage()
  },
  methods: {
    initPage() {
      this.goodsDetail = []
    },
    // 获取商品详情
    async getGoodsDetail (goodsId) {
      let params = {
        GoodsId: goodsId
      }
      let result = await this.$http.post('/api/CrmMobile/GetProductById', params, true)
      if (result.Pic && result.Pic[0].PicPath) result.Pic[0].PicPath = result.Pic[0].PicPath.replace(/http:\/\/192\.168\.3\.30:8066/, this.$baseImgUrl)
      this.goodsDetail = result
    }
  }
}
</script>


<style lang="less" scoped>
#goodsDetail {
  height: 100%;
  background-color: #f2f3f5;
  .images {
    img {
      width: 100%;
    }
  }
  .goodsInfo {
    font-size: 14px;
    color: #515a6e;
    padding: 10px 20px;
    border-bottom: 1px solid #e4e4e4;
    .goodsName {
      font-weight: 700;
      color: #17233d
    }
  }

  .selable-color {
    background-color: #f2f3f5;
    border-bottom: 1px solid #e4e4e4;
    margin-top: 10px;
      .color-title {
        font-size: 16px;
        font-weight: 700;
        padding: 6px 20px;
      }
      .color-content {
        display: flex;
        flex-wrap: wrap;
        padding: 0 10px;
        .color-list {
          width: 20%;
          padding: 5px 8px;
          text-align: center;
          img {
            max-width: 100%;
            max-height: 30px;
          }
          span {
            font-size: 12px;
          }
        }
      }
  }

}
</style>

<style lang="">
#goodsDetail image {
  width: 100%;
}
</style>


