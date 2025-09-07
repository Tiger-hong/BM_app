// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const { venueId } = event

    if (!venueId) {
      return {
        success: false,
        error: '球馆ID不能为空'
      }
    }

    // 查询球馆详情
    const result = await db.collection('venues')
      .doc(venueId)
      .get()

    if (!result.data) {
      return {
        success: false,
        error: '球馆信息不存在'
      }
    }

    const venue = result.data

    // 处理返回数据，包含详情页所需的完整信息
    const venueDetail = {
      id: venue._id,
      name: venue.name || '未知球馆',
      address: venue.address || '地址未知',
      district: venue.ssdq || '',
      description: venue.description || '',
      phone: venue.phone || '',
      latitude: venue.latitude || 0,
      longitude: venue.longitude || 0,
      appId:venue.appId||'',//支持小程序订场，则会跳转
      // 价格信息
      priceMin: venue.priceMin || 0,
      priceMax: venue.priceMax || 0,
      priceDisplay: (() => {
        if (venue.priceMin && venue.priceMax) {
          if (venue.priceMin === venue.priceMax) {
            return `¥${venue.priceMin}`
          } else {
            return `¥${venue.priceMin}-${venue.priceMax}`
          }
        } else if (venue.priceMin) {
          return `¥${venue.priceMin}起`
        }
        return '价格面议'
      })(),
      
      // 营业时间
      openTime: venue.openTime || '',
      closeTime: venue.closeTime || '',
      hoursDisplay: venue.openTime && venue.closeTime 
        ? `${venue.openTime}-${venue.closeTime}` 
        : '营业时间详询',
      
      // 场地信息
      courtCount: venue.courtCount || 0,
      courtsDisplay: venue.courtCount ? `${venue.courtCount}片` : '场地数详询',
      
      // 设施信息
      facilities: venue.facilities || [],
      
      // 图片信息
      images: venue.images || [],
      logo: venue.logo || '',
      
      // 其他信息
      viewCount: venue.viewCount || 0,
      createTime: venue.createTime || '',
      updateTime: venue.updateTime || ''
    }

    // 更新浏览量
    try {
      await db.collection('venues')
        .doc(venueId)
        .update({
          data: {
            viewCount: db.command.inc(1),
            updateTime: new Date()
          }
        })
    } catch (updateError) {
      console.warn('更新浏览量失败:', updateError)
      // 不影响主要功能，继续返回数据
    }

    return {
      success: true,
      data: venueDetail
    }

  } catch (error) {
    console.error('获取球馆详情失败:', error)
    return {
      success: false,
      error: error.message || '获取球馆详情失败'
    }
  }
}