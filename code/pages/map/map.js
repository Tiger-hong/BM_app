// map.js
Page({
  data: {
    // 福州市中心坐标
    latitude: 26.0745,
    longitude: 119.2965,
    scale: 11,
    minScale: 5,
    maxScale: 18,
    markers: [],
    venuesData: [] // 存储完整的venues数据
  },

  onLoad() {
    this.mapCtx = wx.createMapContext('map', this);
    this.loadVenuesFromCloud();
  },

  onShow() {
    // 更新自定义tabBar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      });
    }
  },

  // 从云服务加载场馆数据
  loadVenuesFromCloud() {
    wx.showLoading({
      title: '加载中...'
    });

    wx.cloud.callFunction({
      name: 'getVenues',
      data: {
        page: 1,
        limit: 100  // 获取更多数据用于地图显示
      },
      success: (res) => {
        console.log('云函数调用成功:', res);
        if (res.result && res.result.success) {
          const venues = res.result.data.venues;  // 从data.venues获取场馆数组
          this.processVenuesData(venues);
        } else {
          console.error('获取场馆数据失败:', res.result);
          wx.showToast({
            title: '获取数据失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('云函数调用失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 处理场馆数据
  processVenuesData(venues) {
    const markers = venues.map((venue, index) => ({
      id: index + 1, // 使用数字索引作为marker id
      latitude: venue.latitude,
      longitude: venue.longitude,
      title: venue.name,
      iconPath: '../../images/icons/location.png',
      width: 25,
      height: 25,
      venueId: venue.id, // 保存原始的venue id用于跳转
      callout: {
        content: venue.name,
        color: '#fff',
        fontSize: 10,
        borderRadius: 5,
        bgColor: '#9f2995',
        padding: 5,
        display: 'ALWAYS'
      }
    }));

    this.setData({
      markers,
      venuesData: venues // 保存完整的venues数据用于查找
    });
  },

  // 标记点击
  onMarkerTap(e) {
    const markerId = e.detail.markerId;
    // 通过marker id找到对应的venue数据
    const venueIndex = markerId - 1; // marker id从1开始，数组索引从0开始
    const venues = this.data.venuesData || [];
    
    if (venueIndex >= 0 && venueIndex < venues.length) {
      const venue = venues[venueIndex];
      this.goToVenueDetail({ currentTarget: { dataset: { id: venue.id } } });
    } else {
      console.error('找不到对应的venue数据:', markerId);
    }
  },

  // 地图区域变化
  onRegionChange(e) {
    if (e.type === 'end') {
      const { centerLocation, scale } = e.detail;
      this.setData({
        latitude: centerLocation.latitude,
        longitude: centerLocation.longitude,
        scale: scale || this.data.scale
      });
    }
  },

  // 跳转到场馆详情
  goToVenueDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/venue-detail/venue-detail?id=${id}`
    });
  }
});