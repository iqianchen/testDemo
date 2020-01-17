<template>
  <!-- 选择产品 -->
  <div id="chooseProduct">
    <Search 
      @onSearch="onSearch"
      :actionButton="searchButton" 
      placeholder="请输入款式名称">
    </Search>

    <van-card
      v-for="item in listData"
      currency="￥"
      :title="item.GoodsName"
      :thumb="item.PicUrl"
      :price="item.StandardUnitPrice"
      :key="item.Id">

      <view slot="desc">
        <div class="product-detail">
          <span>规格描述:</span>
          <span v-text="item.SpecDesc"></span>
        </div>
        <div class="product-detail">
          <span>品号:</span>
          <span v-text="item.GoodsCode"></span>
        </div>
      </view>
      <view slot="footer">
        <van-button size="small" round v-if="item.IsCustom == false" @click="addShopCard(item)">加入购物车</van-button>
        <van-button size="small" round v-if="item.IsCustom == true" @click="customized(item.Id)">选配</van-button>
      </view>
    </van-card>

    <Tips :tipsType="tipsType"></Tips>

    <div class="float-button" @click.stop="goShopCart">
      <span class="icon iconfont icon-icon01"></span>
    </div>
  </div>
</template>

<script>
import Search from '#/Search';
import Tips from '#/Tips';
import pageScrollLoad from '@/mixin/pageScrollLoad';
import handleGoodsData from '@js/handleGoodsData';
import ShopCartStore from '@js/shopCartStore';

export default {
  components: {
    Search,
    Tips
  },
  mixins: [pageScrollLoad],
  data() {
    return {
      isFirstLoad: false,   // 首次加载页面不默认调用接口
      params: {         // 参数
        StyleId: '',
        PageIndex: 1,
        PageSize: 20
      },
      searchButton: [{    // 扩展的功能按钮
        text: '款式',
        method: () => {
          wx.redirectTo({ url: '../chooseStyle/main' })
        }
      }],
      getDataApi: '/api/CrmMobile/GetProduct',
    }
  },
  onLoad(query) {
    if (query && query.id) {
      this.params.StyleId = query.id;
      this.getListData()
    } else {
      new Error('未获取到选中的款式')
    }
  },
  methods: {
    // 处理请求数据
    _handleResponseData(data) {
      if (data.length == 0) return data;
      data.forEach(item => {
        if (item.Pic.length > 0) {
          let picUrl = item.Pic[0].PicPath;
          if (picUrl) {
            picUrl = picUrl.replace(this.$setting.regReplaceUrl, this.$setting.baseImgUrl);
          } else {
            picUrl = this.$setting.defaultImg;
          }
          item.PicUrl = picUrl;
        } else {
          item.PicUrl = this.$setting.defaultImg;
        }
      })
      return data;
    },
    // 加入购物车
    addShopCard(goods) {
      let tmpGoods = Object.assign(goods, {
        UnitPrice: goods.StandardUnitPrice,
        Amt: goods.StandardUnitPrice,
        CustomDesc: '',
        Qty: 1,
        GoodsId: goods.Id
      });
      let newGoods = handleGoodsData(tmpGoods)
      let result = ShopCartStore.addShopCartByUser(newGoods)
      if (result) {
        wx.showToast({
          title: "加入购物车成功",
          icon: "success",
          duration: 1500
        });
      } else {
        wx.showToast({
          title: "加入购物车失败",
          icon: "none",
          duration: 1500
        });
      }
    },
    // 选配
    customized(id) {
      wx.navigateTo({ url: `../custom/main?id=${id}` })
    },
    // 去购物车
    goShopCart() {
      wx.navigateTo({ url: '../shopCart/main' })
    },
    // 搜索
    onSearch(searchKey) {
      this.getListData(null, { SearchKey: searchKey })
    }
  }
}
</script>