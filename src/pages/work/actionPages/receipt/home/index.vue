<template>
  <!-- 选择产品 -->
  <div id="chooseProduct">
    <Search @onSearch="onSearch" placeholder="请输入搜索关键词"> </Search>

    <div class="content-wrapper">
      <div class="card-list" v-for="item in listData" :key="item.Id">
        <van-panel use-footer-slot>
          <div slot="header" class="list-header">
            <div class="title">
              <span style="font-weight:700" v-text="item.CustomerName"></span>
              <div class="subTitle">
                <div>手机号码：{{item.Mobile}}</div>
                <div>订单号：{{item.SourceNo}}</div>
              </div>
            </div>
            <div class="status" :class="{ computed: item.AppDate }" v-text="item.AppDate ? '已审核' : '未审核'"></div>
          </div>
          <van-card 
            v-for="(subItem, i) in item.Details"
            :key="i"
            :title="subItem.GoodsName"
            :thumb="subItem.PicPath || $setting.defaultImg"
          >
            <div slot="desc">
              <div>
                <span>规格描述:</span>
                <span v-text="subItem.SpecDesc"></span>
              </div>
              <div>
                <span>数量:</span>
                <span v-text="subItem.Qty"></span>
              </div>
              <div>
                <span>单价:</span>
                <span v-text="subItem.UnitPrice"></span>
              </div>
              <div>
                <span>折扣:</span>
                <span v-text="subItem.Discount+'%'"></span>
              </div>
              <div>
                <span>成交金额:</span>
                <span v-text="subItem.Amt"></span>
              </div>
            </div>
          </van-card>
          <view slot="footer">
            <div class="info">
              <span>应收金额：{{item.Amt1}}</span>
              <span>实收金额：{{item.Amt2}}</span>
            </div>
            <div class="action-button">
              <van-button v-if="!item.AppDate" @click="deleteData(item.Id)" size="small" type="danger">删除</van-button>
              <van-button v-if="!item.AppDate" @click="pageSkipping('detailPage', 'update', item.Id)" size="small" type="warning" >修改</van-button>
              <van-button @click="pageSkipping('detailPage', 'detail', item.Id)" size="small" type="info" >详情</van-button>
            </div>
          </view>
        </van-panel>
      </div>
    </div>

    <Tips :tipsType="tipsType"></Tips>

    <div class="float-button" @click="pageSkipping('detailPage', 'add')">
      <span class="iconfont icon-add"></span>
    </div>
  </div>
</template>

<script>
import Search from '#/Search';
import Tips from '#/Tips';
import pageScrollLoad from '@/mixin/pageScrollLoad';
import { updateKey } from '@js/pageValue';

export default {
  components: {
    Search,
    Tips
  },
  mixins: [pageScrollLoad],
  data() {
    return {
      params: {         // 参数
        StyleId: '',
        PageIndex: 1,
        PageSize: 20
      },
      getDataApi: '/api/CrmMobile/GetReceiptOrder',
      deleteDataApi: '/api/CrmMobile/DeleteReceiptOrder'
    }
  },
  onShow() {
    let reset = updateKey('reset', this);
    if (reset)  this.getListData();
  },
  methods: {
    // 页面跳转
    pageSkipping(pageName, params1, params2) {
      let url = '';
      switch (pageName) {
        case 'detailPage':
          url = `../detail/main?type=${params1}&id=${params2}`;
          break;
      }
      wx.navigateTo({ url: url })
    },
    // 删除数据
    deleteData(id) {
      let _this = this;
      wx.showModal({
        title: '提示',
        content: '您确定要删除吗?',
        success: res => {
          if (res.confirm) {  // 点击确定
            this.$http.post(this.deleteDataApi, { CustomerId: id }, true).then( res => {
              this.getListData()
            })
          }
        }
      })
    },
  }
}
</script>