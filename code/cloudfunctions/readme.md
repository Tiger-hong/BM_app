# 云函数使用说明

## getVenues 云函数

### 功能
获取球馆列表，支持搜索、筛选、分页等功能。

### 参数
- `page` (number): 页码，从1开始，默认为1
- `limit` (number): 每页数量，默认为10
- `keyword` (string): 搜索关键词，支持球馆名称、地址、描述模糊搜索
- `district` (string): 地区筛选，对应数据库中的 `ssdq` 字段
- `facilities` (array): 设施筛选，数组元素为设施名称（如：['空调', '停车']）
- `sortBy` (string): 排序方式，可选值：
  - `createTime`: 按创建时间排序（默认）
  - `name`: 按名称排序
  - `price`: 按价格排序
  - `courts`: 按场地数量排序
  - `views`: 按浏览量排序

### 返回数据
```json
{
  "success": true,
  "data": {
    "venues": [
      {
        "id": "球馆ID",
        "name": "球馆名称",
        "address": "详细地址",
        "district": "所属地区",
        "price": "价格显示文本",
        "priceMin": 最低价格,
        "priceMax": 最高价格,
        "courts": 场地数量,
        "hours": "营业时间显示文本",
        "openTime": "开始营业时间",
        "closeTime": "结束营业时间",
        "phone": "联系电话",
        "latitude": 纬度,
        "longitude": 经度,
        "facilities": ["设施列表"],
        "description": "球馆描述",
        "images": ["图片URL列表"],
        "logo": "logo图片URL",
        "viewCount": 浏览次数,
        "createTime": "创建时间",
        "courtsText": "场地数量显示文本",
        "facilitiesCount": 设施数量,
        "hasAirConditioning": 是否有空调,
        "hasParking": 是否有停车场
      }
    ],
    "total": 总数量,
    "page": 当前页码,
    "limit": 每页数量,
    "hasMore": 是否还有更多数据
  }
}
```

### 使用示例
```javascript
// 获取所有球馆
const result = await wx.cloud.callFunction({
  name: 'getVenues',
  data: {
    page: 1,
    limit: 20
  }
});

// 搜索球馆
const searchResult = await wx.cloud.callFunction({
  name: 'getVenues',
  data: {
    keyword: '羽毛球',
    page: 1,
    limit: 10
  }
});

// 地区筛选
const districtResult = await wx.cloud.callFunction({
  name: 'getVenues',
  data: {
    district: '鼓楼区',
    page: 1,
    limit: 10
  }
});

// 设施筛选
const facilityResult = await wx.cloud.callFunction({
  name: 'getVenues',
  data: {
    facilities: ['空调', '停车'],
    page: 1,
    limit: 10
  }
});
```

## 数据库集合

### venues 集合
存储球馆信息的主要集合，字段包括：
- `name`: 球馆名称
- `address`: 详细地址
- `ssdq`: 所属地区
- `priceMin`: 最低价格
- `priceMax`: 最高价格
- `courtCount`: 场地数量
- `openTime`: 开始营业时间
- `closeTime`: 结束营业时间
- `phone`: 联系电话
- `latitude`: 纬度
- `longitude`: 经度
- `facilities`: 设施列表（数组）
- `description`: 球馆描述
- `images`: 图片URL列表（数组）
- `logo`: logo图片URL
- `viewCount`: 浏览次数
- `createTime`: 创建时间

## 注意事项

1. 确保云开发环境已正确配置
2. 云函数需要部署到云端才能正常使用
3. 数据库权限需要正确设置
4. 建议在生产环境中对查询结果进行缓存优化
5. 分页查询时注意性能优化，避免大量数据查询