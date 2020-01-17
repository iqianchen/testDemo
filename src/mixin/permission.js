export default {
  data() {
    return {
      permission: {
        add: false,
        delete: false,
        edit: false,
        details: false,
        approve: false,
        unApprove: false,
        endCase: false,
        unEndCase: false
      }
    }
  },
  onLoad() {
    this.getPermission()
  },
  onUnload() {
    this.permission = {
      add: false,
      delete: false,
      edit: false,
      details: false,
      approve: false,
      unApprove: false,
      endCase: false,
      unEndCase: false
    }
  },
  methods: {
    // 获取对应的权限
    getPermission() {
      let pages = getCurrentPages()
      // 获取当前页
      let currentPage = pages[pages.length-1]
      let url = currentPage.route
      // 截取当前组件路径
      let component = url.slice(6,-5)
      let userInfo = wx.getStorageSync('crmUserInfo')
      if (userInfo.authorizeMenu) {
        let currentMenu = userInfo.authorizeMenu.filter(item => {
          return item.UrlAddress == component
        })
        if (currentMenu && currentMenu.length > 0) {
          let moduleId = currentMenu[0].ModuleId
          let currentButton = userInfo.authorizeButton[moduleId]
          currentButton.forEach(item => {
            switch (item.EnCode) {
              case 'btn_add':
                this.permission.add = true
                return;
              case 'btn_delete':
                this.permission.delete = true
                return;
              case 'btn_edit':
                this.permission.edit = true
                return;
              case 'btn_details':
                this.permission.details = true
                return;
              case 'btn_approve':
                this.permission.approve = true
                return;
              case 'btn_unapprove':
                this.permission.unApprove = true
                return;
              case 'btn_endcase':
                this.permission.endCase = true
                return;
              case 'btn_unendcase':
                this.permission.unEndCase = true
                return;
            }
          })
        }
      }
    }
  }
}