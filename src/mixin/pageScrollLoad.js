/** 整个页面滚动加载  */
export default {
  data() {
    return {
      listData: [],    // 列表数据
      rowCount: 0,      // 总条数
      params: {         // 参数
        PageIndex: 1,
        PageSize: 10
      },
      tipsType: '',      // 提示类型
      isFirstLoad: true, // 第一次是否加载数据     
    }
  },
  // 下拉刷新
  onPullDownRefresh() {
    this.tipsType = '';
    wx.stopPullDownRefresh()

    this.params.PageIndex = 1
    this.getListData()
  },
  // 上拉加载
  onReachBottom() {
    if (this.rowCount <= this.params.PageIndex * this.params.PageSize) {
      this.tipsType = 'noMore'
      return
    }
    this.params.PageIndex++
    this.getListData('up')
  },
  onLoad() {
    if (this.isFirstLoad) this.getListData()
  },
  methods: {
    // 获取列表数据
    async getListData(type, params2 = {}) {
      if (type === 'up') {    // 是否是上拉加载
        if (this.tipsType === 'loading') return;
        this.tipsType = 'loading';
      }
      try {
        let loading = type === 'up' ? false : true;
        let params = Object.assign({}, this.params, params2)
        // 调用接口获取数据，loading为true时使用默认的加载效果
        let result = await this.$http.post(this.getDataApi, params, loading)
        this.rowCount = result.RowCount;
        let tmpData = result.Data;
        if (typeof this._handleResponseData == 'function') {  // 如果需要对返回的数据处理, 请使用函数_handleResponseData, 将新值返回
          tmpData = this._handleResponseData(tmpData) || [];
        }
        if (type === 'up') {    // 如果是上拉加载，将新数据添加进去
          this.listData = this.listData.concat(tmpData)
        } else {
          this.listData = tmpData;
        }
        if (this.listData.length == 0) this.tipsType = 'noData';
        else this.tipsType = '';
      } catch(e) {
        this.tipsType = '';
      }
    }
  }
}