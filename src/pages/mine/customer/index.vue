<template>
  <!-- 选择产品 -->
  <div id="chooseProduct">
    <Search @onSearch="onSearch" placeholder="请输入客户名称"> </Search>

    <div class="content-wrapper">
      <div class="card-list" v-for="item in listData" :key="item.Id">
        <van-panel use-footer-slot>
          <div slot="header" class="list-header">
            <div class="title">
              <span style="font-weight:700" v-text="item.Name"></span>
              <div class="subTitle">手机号码：{{item.Mobile}}</div>
            </div>
            <div class="status" :class="{ computed: item.AppDate }" v-text="item.AppDate ? '已审核' : '未审核'"></div>
          </div>
          <view slot="footer">
            <div class="action-button">
              <van-button v-if="!item.AppDate" @click="deleteCustomer(item.Id)" size="small" type="danger">删除</van-button>
              <!-- <van-button @click="addFollow(item.Id)" size="small" type="primary" >添加跟进</van-button>
              <van-button @click="addTask(item.Id, item.Name)" size="small" type="primary" >添加任务</van-button> -->
              <van-button v-if="!item.AppDate" @click="pageSkipping('customerDetail', 'update', item.Id)" size="small" type="warning" >修改</van-button>
              <van-button @click="pageSkipping('order')" size="small" type="primary">下单</van-button>
              <van-button @click="pageSkipping('customerDetail', 'detail', item.Id)" size="small" type="info" >详情</van-button>
            </div>
          </view>
        </van-panel>
      </div>
    </div>

    <Tips :tipsType="tipsType"></Tips>

    <div class="float-button" @click="pageSkipping('customerDetail', 'add')">
      <span class="iconfont icon-add"></span>
    </div>
  </div>
</template>

<script>
import Search from '#/Search';
import Tips from '#/Tips';
import pageScrollLoad from '@/mixin/pageScrollLoad';
import { updateKey } from '@js/pageValue'

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
      getDataApi: '/api/CrmMobile/GetCustomer',
      deleteDataApi: '/api/CrmMobile/DeleteCustomer'
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
        case 'order':
          url = 'pages/work/openOrder/home/main';
          break;
        case 'customerDetail':
          url = `../customerDetail/main?type=${params1}&id=${params2}`;
          break;
      }
      wx.navigateTo({ url: url })
    },
    // 删除客户
    deleteCustomer(id) {
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