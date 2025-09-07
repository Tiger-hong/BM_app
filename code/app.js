App({
  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'cloud1-6gtgn90759e2fa87', // 已替换为正确的云环境ID
        traceUser: true,
      })
    }

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log('登录成功', res.code)
        
        // 获取用户信息
        this.getUserInfo()
      }
    })
  },

  // 获取用户信息
  getUserInfo() {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo
              
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  
  globalData: {
    userInfo: null,
    // 云开发相关
    cloud: null,
    // 模拟数据（开发阶段使用，后续会从云数据库获取）
    venues: [
      {
        id: 1,
        name: "星光羽毛球馆",
        address: "北京市朝阳区建国路88号",
        price: "68元/小时",
        hours: "06:00-22:00",
        phone: "010-12345678",
        latitude: 39.9042,
        longitude: 116.4074,
        facilities: ["空调", "淋浴", "停车场", "餐厅"],
        description: "专业羽毛球场地，设施齐全，环境优雅。拥有12片标准场地，采用进口地胶，为您提供最佳运动体验。"
      },
      {
        id: 2,
        name: "飞羽体育中心",
        address: "北京市海淀区中关村大街123号",
        price: "58元/小时",
        hours: "07:00-23:00",
        phone: "010-87654321",
        latitude: 39.9826,
        longitude: 116.3066,
        facilities: ["空调", "淋浴", "停车场"],
        description: "现代化羽毛球场馆，交通便利，设备先进。8片标准场地，专业教练团队，适合各水平球友。"
      },
      {
        id: 3,
        name: "羽动天下",
        address: "北京市西城区西单北大街56号",
        price: "75元/小时",
        hours: "08:00-22:00",
        phone: "010-11223344",
        latitude: 39.9139,
        longitude: 116.3831,
        facilities: ["空调", "淋浴", "停车场", "餐厅", "商店"],
        description: "高端羽毛球俱乐部，环境舒适，服务周到。10片标准场地，提供器材租赁和专业培训服务。"
      },
      {
        id: 4,
        name: "健羽运动馆",
        address: "北京市丰台区丰台路99号",
        price: "45元/小时",
        hours: "06:30-21:30",
        phone: "010-55667788",
        latitude: 39.8584,
        longitude: 116.2865,
        facilities: ["空调", "停车场"],
        description: "经济实惠的羽毛球场地，适合日常锻炼。6片标准场地，价格亲民，是附近居民的首选。"
      }
    ],
    favorites: [],
    frequentVenues: [1, 2] // 常看场馆ID
  }
})