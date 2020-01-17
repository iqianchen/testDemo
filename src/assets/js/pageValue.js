/**
 * 给上一个页面存值
 * @param { Sting } key     存储的键
 * @param { All } data      存储的值
 */
function prevPageSetData(key, data) {
  //获取当前页面js里面的pages里的所有信息
  let pages = getCurrentPages(); 
  //prevPage 是获取上一个页面的js里面的pages的所有信息。 -2 是上一个页面，-3是上上个页面以此类推。
  let prevPage = pages[ pages.length - 2 ];
  prevPage.setData({
      [key]: data
  })
}

/**
* 获取上一个页面的值
* @param { String } key    获取的键
*/
function prevPageGetData(key) {
  let pages = getCurrentPages();
  let prevPage = pages[ pages.length - 2 ];
  let result;
  if (key.indexOf('.') != -1) {
      let newArr = key.split('.')
      result = prevPage.data.$root[0]
      newArr.forEach(item => {
          result = result[item]
      })
  } else {
      result = prevPage.data.$root[0][key]
  }
  return result
}

/**
* 更新值
* @param { Sting } key     取值的键
*/
function updateKey(key, that) {
  let data = that.$mp.page.data
  if (data[key]) {
      // this[key] = data[key]
      return data[key]
  }
}

export { prevPageSetData, prevPageGetData, updateKey }