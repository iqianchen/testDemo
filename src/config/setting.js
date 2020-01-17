const baseUrl = 'http://www.sofa-geek.cn:9095'  // 测试地址
// const baseUrl = 'https://www.sofa-geek.cn'  // 正式地址(微信默认端口443)

const Setting = {
    baseUrl: baseUrl,                               // 基地址
    baseImgUrl: 'http://121.46.4.218:8066',         // 图片基地址
    defaultImg: '/static/images/default.jpg',       // 默认图片地址
    signSring: 'af4b72b6d2d8427884ec7c41b88afd73',  // 生成验签的随机字符串
    regReplaceUrl: /http:\/\/192\.168\.3\.30:8066/, // 图片基地址转换正则
    toastDuration: 800    // 提交成功后提示文本的显示时间
}

export { Setting }