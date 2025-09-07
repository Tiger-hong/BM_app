// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      keyword = '', 
      district = '', 
      facilities = []
    } = event

    console.log('云函数接收参数:', { page, limit, keyword, district, facilities });

    // 构建查询条件
    let query = {}
    let andConditions = []
    
    // 关键词搜索（球馆名称、地址、描述）
    const keywordStr = String(keyword || '').trim();
    if (keywordStr) {
      const keywordRegex = db.RegExp({
        regexp: keywordStr,
        options: 'i'
      })
      andConditions.push({
        $or: [
          { name: keywordRegex },
          { address: keywordRegex },
          { description: keywordRegex }
        ]
      });
    }
    
    // 地区筛选
    if (district) {
      andConditions.push({ ssdq: district });
    }
    
    // 设施筛选 - 直接匹配字符串code
    if (facilities && facilities.length > 0) {
      console.log('设施筛选参数:', facilities);
      
      // 构建设施查询条件 - 球馆必须同时拥有所有选中的设施
      const facilityQueries = [];
      
      facilities.forEach(facilityCode => {
        const code = String(facilityCode); // 确保是字符串格式
        console.log(`处理设施 - code: ${code}`);
        
        // 数据库中存储的是字符串数组，直接匹配字符串
        facilityQueries.push({
          facilities: code
        });
      });
      
      // 如果有有效的设施查询条件，使用$and确保球馆必须拥有所有选中的设施
      if (facilityQueries.length > 0) {
        if (facilityQueries.length === 1) {
          // 只选择了一个设施
          andConditions.push(facilityQueries[0]);
        } else {
          // 选择了多个设施，必须同时拥有
          andConditions.push({
            $and: facilityQueries
          });
        }
        console.log('设施查询条件数量:', facilityQueries.length);
        console.log('设施查询条件:', JSON.stringify(facilityQueries, null, 2));
      }
    }

    // 构建最终查询条件
    if (andConditions.length > 0) {
      if (andConditions.length === 1) {
        query = andConditions[0];
      } else {
        query = { $and: andConditions };
      }
    }

    console.log('最终查询条件:', JSON.stringify(query, null, 2));

    // 计算跳过的记录数
    const skip = (page - 1) * limit

    // 查询总数
    const countResult = await db.collection('venues').where(query).count()
    const total = countResult.total
    console.log('查询到的总数:', total);

    // 查询数据
    const result = await db.collection('venues')
      .where(query)
      .skip(skip)
      .limit(limit)
      .get()
    
    console.log('查询到的数据条数:', result.data.length);

    // 处理返回数据
    const venues = result.data.map(venue => {
      console.log(`球馆 ${venue.name} 的设施:`, venue.facilities);
      
      // 计算价格范围显示
      let priceDisplay = '价格面议'
      if (venue.priceMin && venue.priceMax) {
        if (venue.priceMin === venue.priceMax) {
          priceDisplay = `¥${venue.priceMin}`
        } else {
          priceDisplay = `¥${venue.priceMin}-${venue.priceMax}`
        }
      } else if (venue.priceMin) {
        priceDisplay = `¥${venue.priceMin}起`
      }
      
      // 处理营业时间
      let hoursDisplay = '营业时间详询'
      if (venue.openTime && venue.closeTime) {
        hoursDisplay = `${venue.openTime}-${venue.closeTime}`
      }
      
      // 处理设施列表 - 将数字code转换为名称
      let facilitiesDisplay = []
      if (venue.facilities && Array.isArray(venue.facilities)) {
        // 设施code到名称的映射
        const facilityCodeMap = {
          '1': '小程序订场',
          '10': '空调',
          '11': '停车场',
          '12': '储物柜',
          '13': '淋浴间',
          '14': '休息区',
          '20': '拉线服务',
          '21': '器材租赁',
          '30': '自动售货机',
          '40': '专业照明',
          '41': '音响系统',
          '42': '医疗急救'
        };
        
        facilitiesDisplay = venue.facilities
          .filter(f => f != null)
          .map(f => {
            const code = String(f); // 确保是字符串格式
            return facilityCodeMap[code] || `设施${code}`;
          })
          .filter(f => f && f.trim())
      }
      
      return {
        id: venue._id,
        name: venue.name || '未知球馆',
        address: venue.address || '地址未知',
        district: venue.ssdq || '',
        price: priceDisplay,
        courts: venue.courtCount || 0,
        hours: hoursDisplay,
        phone: venue.phone || '',
        latitude: venue.latitude || 0,
        longitude: venue.longitude || 0,
        logo: venue.logo || '',
        hasAirConditioning: venue.facilities && venue.facilities.includes('10'),
        hasParking: venue.facilities && venue.facilities.includes('11')
      }
    })

    // 计算是否还有更多数据
    const hasMore = skip + venues.length < total

    return {
      success: true,
      data: {
        venues,
        total,
        page,
        limit,
        hasMore
      }
    }

  } catch (error) {
    console.error('获取球馆列表失败:', error);
    
    return {
      success: false,
      error: error.message || '获取球馆列表失败'
    }
  }
}