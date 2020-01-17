import { Setting } from '@/config/setting';

// 生成商品标识号
function createGoodsNumber() {
  let currentTime = new Date().format('yyyy-MM-dd-hh-mm-ss-S')
  return currentTime;
}

// 定义加入购物车的商品信息
export default function handleGoodsData(goods) {
  if (!goods) return null;
  return {
    CurrentGoodsNumber: createGoodsNumber(),
    BrandId: goods.BrandId,
    BrandCode: goods.BrandCode,
    BrandName: goods.BrandName,
    GoodsId: goods.GoodsId,
    GoodsCode: goods.GoodsCode,
    GoodsName: goods.GoodsName,
    SpecDesc: goods.SpecDesc,
    SeriesId: goods.SeriesId,
    SeriesCode: goods.SeriesCode,
    SeriesName: goods.SeriesName,
    StyleId: goods.StyleId,
    StyleCode: goods.StyleCode,
    StyleName: goods.StyleName,
    MaterialId: goods.MaterialId,
    MaterialCode: goods.MaterialCode,
    MaterialName: goods.MaterialName,
    ProductCateGoryId: goods.ProductCateGoryId,
    ProductCateGoryCode: goods.ProductCateGoryCode,
    ProductCateGoryName: goods.ProductCateGoryName,
    Qty: goods.Qty || 1,
    Unit: goods.Unit,
    UnitPrice: goods.UnitPrice || goods.Amt || 0,
    Amt: goods.Amt || 0,
    PicPath: goods.PicPath || Setting.defaultImg,
    IsCustom: goods.IsCustom,
    CustomDesc: goods.CustomDesc || '',
    SelablePtIds: goods.SelablePtIds || '',
    SelableParts: goods.SelableParts || [],
    selectActive: goods.selectActive || false,
    AccessoryNo: goods.AccessoryNo || '',
    Discount: goods.Discount || 100,
  }
}