class ShopCartStore {
  constructor() {
    this.cartName = 'crmShopCart';
  }
  // 修改缓存的键
  changeCartName(name) {
    if (!name) return;
    this.cartName = name;
  }
  // 获取用户信息
  getUserInfo() {
    let userInfo;
    try {
      userInfo = wx.getStorageSync('crmUserInfo')
    } catch(e) {
      new Error('未获取到用户信息!')
      userInfo = null;
    }
    return userInfo;
  }
  // 获取所有购物车
  getShopCart() {
    try {
      let cartList = wx.getStorageSync(this.cartName)
      if (cartList) cartList = JSON.parse(cartList);
      else cartList = {};
      return cartList;
    } catch(e) {
      new Error(`读取缓存数据${this.cartName}出错`)
      return {}
    }
  }
  // 加入购物车
  addShopCartByUser(goods) {
    let userInfo = this.getUserInfo();
    if (!userInfo) return;
    if (!goods) return;
    let userId = userInfo.UserId;
    let cartList = this.getShopCart();

    let userCart = cartList[userId] || [];
    if (Array.isArray(goods)) {  // 如果参数是数组，则覆盖数据
      userCart = goods;
    } else {
      userCart.push(goods);
    }
    cartList[userId] = userCart;
    let cartListStr = JSON.stringify(cartList);
    try {
      wx.setStorageSync(this.cartName, cartListStr);
      return true;
    }catch(e) {
      return false;
    }
  }
  // 获取当前用户的购物车数据
  getShopCartByUser() {
    try {
      let userId = this.getUserInfo().UserId;
      let shopCarts = this.getShopCart()
      return shopCarts[userId] || [];
    } catch(e) {
      new Error('未找到当前用户的购物车数据')
      return []
    }
  }
  // 删除当前用户的购物车数据
  deleteShopCartByUser(goodsNums) {
    let userCartList = this.getShopCartByUser()
    console.log('goodsNums', goodsNums)
    // 过滤出未删除的数据并覆盖当前用户的购物车数据
    let list = userCartList.filter(item => {
      return goodsNums.indexOf(item.CurrentGoodsNumber) == -1;
    })
    this.addShopCartByUser(list)
  }
  // 修改当前用户的购物车数据
  updateStoreCartByUser(goods) {
    let userCartList = this.getShopCartByUser()
    // 修改当前数据并覆盖当前用户的购物车数据
    if (Array.isArray(goods)) {
      userCartList = goods;
    } else {
      userCartList.forEach((item, index) => {
        if(item.CurrentGoodsNumber === goods.CurrentGoodsNumber) {
          userCartList[index] = goods;
        }
      })
    }
    this.addShopCartByUser(userCartList)
  }
  // 清空当前用户购物车数据
  clearShopCartByUser() {
    this.addShopCartByUser([])
  }
}

export default new ShopCartStore()