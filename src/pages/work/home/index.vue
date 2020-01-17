<template>
  <div id="work">
    <div class="area" v-for="(item,index) in menu" :key="index">
      <div class="area-title">
        <span v-text="item.FullName"></span>
      </div>
      <div class="area-content">
        <ul>
          <li v-for="(value, i) in item.children" :key="i" @click="pageSkipping(value.UrlAddress,value.ModuleId)" v-if="value.isShow">
            <div class="icon" :class="value.EnCode">
              <i class="iconfont" :class="value.Icon"></i>
            </div>
            <span class="msg" v-text="value.FullName"></span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'work',
  data () {
    return {
      menu: []
    }
  },
  mounted() {
    this.initMenu()
  },
  methods: {
    // 根据当前用户的权限生成对应的菜单
    initMenu() {
      let userInfo = wx.getStorageSync('crmUserInfo')
      let allMenu = userInfo.authorizeMenu
      let permission = userInfo.authorizeButton

      let map = {}, treeMenu = [];
      allMenu.forEach(item => {
        // 添加对应的权限
        item.isShow = this.curMenuIsShow(allMenu, permission, item.ModuleId)
        map[item.ModuleId] = item
      })
      // 生成树形菜单
      allMenu.map(item => {
        let parent = map[item.ParentId]
        if (parent) {
          (parent.children || ( parent.children = [] )).push(item)
        } else {
          treeMenu.push(item)
        }
      })
      let currentMenu = []
      if (treeMenu.length > 0) {
        treeMenu.forEach(item => {
          if (item.EnCode === 'mobile-work') {
            currentMenu = item.children
          }
        })
      }
      this.menu = currentMenu;
    },
    /**
     * 返回当前菜单是否显示
     * @param {Array} allActionButton   当前用户所有的功能菜单
     * @param {Object} menuPermission   当前用户所有菜单的权限
     * @param {String} moduleId         当前的菜单模块
     * @return true || false
     */
    curMenuIsShow(allActionButton, menuPermission, moduleId) {
      if (!allActionButton || allActionButton.length == 0) return false;
      if (!moduleId || !menuPermission[moduleId]) return false;

      let curActionButton = menuPermission[moduleId];
      let isShow = false;
      curActionButton.map(item => {
        if (item.EnCode == 'btn_details') {
          isShow = true;
        }
      })
      return isShow;
    },
    // 报表页面跳转
    showReport (id) {
      wx.navigateTo({ url: '../report/main?id=' + id })
    },
    // 其他页面跳转
    pageSkipping (urlAddress,moduleId) {
      let url = `/pages/work/${urlAddress}/main`
      console.log('url', url)
      wx.navigateTo({ url: url })
    }
  }
}
</script>

<style lang="less">
@import '~less/base-color.less';
#work {
  .area {
    margin-bottom: 20px;
    .area-title {
      color: @text-bord-color;
      font-size: 16px;
      font-weight: 700;
      padding: 20px 10px;
      border-top: 1px solid @line-color;
    }
    .area-content {
      ul {
        display: flex;
        flex-wrap: wrap;
        li {
          width: 25%;
          display: flex;
          padding-top: 10px;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          color: @text-light-color;
          .icon {
            width: 50px;
            height: 50px;
            background-color: @cyan;
            border-radius: 6px;
            text-align: center;
            box-shadow: 1px 1px 8px @button-border-shadow;
            .iconfont {
              font-size: 24px;
              color: #fff;
              line-height: 50px
            } 
            &.mobile-openOrder {    // 店面开单
              background-color: @skyBlue;
            }
            &.mobile-receipt {    // 收款单
              background-color: @red;
            }
            &.mobile-afterSales {   // 售后服务单
              background-color: @green;
            }
            &.mobile-productDisplay {   // 产品展示
              background-color: @lightBlue;
            }
            &.mobile-reimbursement {    // 我的报销
              background-color: @orange;
            }
            &.mobile-storeSampleList {   // 门店摆场清单
              background-color: @cyan;
            }
          }
          .msg {
            margin-top: 5px;
            font-size: 12px;
            text-align: center;
          }
        }
      }
    }
    &:nth-child(2) {
      .icon {
        background-color: @lightBlue !important;
      }
    }
  }
}
</style>