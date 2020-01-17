/** 数据固定的本地加载  */
export default {
  data() {
    return {
      serverData: [],    // 服务器请求的数据
      listData: [],      // 显示的列表数据
      rowCount: 0,       // 数据总条数
      pageIndex: 1,      // 当前页
      pageSize: 20,      // 默认每页20条数据
      tipsType: '',      // 提示类型
      isFirstLoad: true  // 是否默认请求数据
    }
  },
  onLoad() {
    if (this.serverData.length == 0) {
      if (this.isFirstLoad) this.getServerData();
    } else {
      this.pageIndex = 1;
      this.listData = this.serverData.slice(0, this.pageSize)
    }
  },
  methods: {
    // 获取服务器数据
    async getServerData(params = {}) {
      try {
        let result = await this.$http.post(this.getDataApi, params, true);
        let tmpData = result || [];
        this.pageIndex = 1;
        this.rowCount = tmpData.length;
        if (typeof this._handleResponseData == 'function') {    // 是否需要对返回数据进行处理
          tmpData = this._handleResponseData(tmpData)
        }
        this.serverData = tmpData;
        this.listData = tmpData.slice(0, this.pageSize);
        // console.log('this.listData', this.listData)
        if (this.listData.length == 0) this.tipsType = 'noData';
        else this.tipsType = '';
      } catch(e) {
        this.tipsType = '';
        new Error('请求数据出错！')
      }
    },
    // 滚动至底部
    scrolltolower() {
      if (this.rowCount <= this.pageIndex * this.pageSize) {
        this.tipsType = 'noMore';
        return
      }

      this.tipsType = 'loading';
      setTimeout(() => {
        let startIndex = this.pageIndex;
        let endIndex = (parseInt(this.pageIndex) + 1) * this.pageSize; 
        this.listData = this.listData.concat(this.serverData.slice(startIndex, endIndex))
        this.pageIndex++;
      }, 300)
    },
    // filterData() {

    // }
  }
}