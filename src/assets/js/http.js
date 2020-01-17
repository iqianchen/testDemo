import { BasicFunction } from '@/assets/js/basicFunction.js';
import { Setting } from '@/config/setting.js'
import qs from 'qs'

const baseUrl = Setting.baseUrl
const signSring = Setting.signSring

class Http extends BasicFunction {
  constructor() {
      super()
  }
  /**
 * 生成验签所要的参数
 * @param array params参数对象
 * */
  redirectSignArr(url,data,method) {
      let params = {}
      if (method === 'GET' || method === 'DELETE') {
          params = this.getUrlJson(url)
      }else {
          params = {...data};
      }
      return this.createSign(params,signSring)
  }
  /**
   * get请求截取url中的参数
   * */
  getUrlJson(url){
      let position = url.indexOf('?');
      let newJson = {};
      if(position != -1){
          position = parseInt(position) + 1;
          let newUrl = url.slice(position);
          let arr1 = newUrl.split('&');
          for(let i = 0;i<arr1.length;i++){
              let arr2 = [];
              arr2 = arr1[i].split('=');
              newJson[arr2[0]] = arr2[1];
          }
      }
      return newJson;
  }
  // GET网络请求
  get(url, data = {}, loading = false) {
      return this.requestAll(url, data, 'GET', loading)
  }
  // POST网络请求
  post(url, data, loading = false, browse = false) {
      let newData;
      if (wx && wx.getStorageSync('crmUserInfo') && !browse) {
          let userInfo = wx.getStorageSync('crmUserInfo')
          newData = Object.assign(data, {
              UserId: userInfo.UserId,
              UserName: userInfo.UserName,
              UserToken: userInfo.UserToken,
              StoreId: userInfo.StoreId,
              StoreCode: userInfo.StoreCode,
              StoreName: userInfo.StoreName,
              DeptId: userInfo.DeptId,
              DeptName: userInfo.DeptName
          })
      } else {
          newData = data
      }
      return this.requestAll(url, newData, 'POST', loading)
  }
  // PUT网络请求
  put(url, data, loading= false) {
      let newData;
      if (wx && wx.getStorageSync('crmUserInfo')) {
          let userInfo = wx.getStorageSync('crmUserInfo')
          newData = Object.assign(data, {
              UserId: userInfo.UserId,
              UserToken: userInfo.UserToken,
              StoreId: userInfo.StoreId,
              StoreCode: userInfo.StoreCode,
              StoreName: userInfo.StoreName,
              DeptId: userInfo.DeptId,
              DeptName: userInfo.DeptName
          })
      } else {
          newData = data
      }
      return this.requestAll(url, newData, 'PUT', loading)
  }
  // DELETE网络请求
  delete(url, data = {}, loading = false) {
      return this.requestAll(url, data, 'DELETE', loading)
  }
  requestAll(url, data, method, loading) {
      // 是否显示loading
      if (loading) wx.showLoading({ title: '加载中..'})
      // 生成页签
      let paramsJson = this.redirectSignArr(url, data, method)
      // return;
      // 数据组合
      let sendData = Object.assign(data,paramsJson)
    //   console.log('sendData', sendData)
    //   console.log('sendData', JSON.stringify(sendData))
      // 对post请求和put请求转换成json数据
      if (method === 'POST' || method === 'PUT') {
          sendData = qs.stringify(sendData)
      }
      return new Promise( (resolve, reject) => {
          wx.request({
              url: baseUrl + url,
              data: sendData,
              method: method,
              header: { 'content-type': 'application/x-www-form-urlencoded' },
              success: function(res) {
                  // 结束loading
                  if (loading) wx.hideLoading()
                  let result = res.data
                  if (result.ErrCode == 0) {
                      resolve(result.Data)
                  }else {
                      let errorMsg;
                      if (result && result.ErrMsg) {
                          errorMsg = result.ErrMsg
                      } else {
                          errorMsg = "未返回错误信息"
                      }
                      wx.showToast({
                          title: errorMsg,
                          icon: 'none',
                          duration: 2000
                      })
                      reject(errorMsg)
                  }
              },
              error: function(err) {
                  // 结束loading
                  if (loading) wx.hideLoading()
                  wx.showToast({
                      title: "服务器内部错误",
                      icon: 'none',
                      duration: 2000
                  })
                  reject(err)
              }
          })
      })
  }
}

export default new Http()