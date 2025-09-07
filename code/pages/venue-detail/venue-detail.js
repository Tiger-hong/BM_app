// venue-detail.js
const app = getApp()
const { FACILITIES, getFacilityByCode } = require('../../utils/dictionary.js');

Page({
  data: {
    venue: {},
    loading: true,
    currentImageIndex: 0,
    allFacilities: [] // 所有设施列表，包含是否具备的状态
  },

  onLoad(options) {
    const venueId = options.id
    if (venueId) {
      this.loadVenueDetail(venueId)
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  // 加载场馆详情
  async loadVenueDetail(venueId) {
    try {
      this.setData({ loading: true })
      
      const result = await wx.cloud.callFunction({
        name: 'getVenueDetail',
        data: { venueId }
      })

      if (result.result.success) {
        const venue = result.result.data
        
        // 处理设施数据
        const venueFacilities = venue.facilities || [];
        const allFacilities = FACILITIES.map(facility => {
          // 检查球馆是否具备该设施（支持字符串code匹配）
          const hasThis = venueFacilities.some(venueFacility => {
            // 确保都转换为字符串进行比较
            const facilityCodeStr = String(venueFacility);
            const targetCodeStr = String(facility.code);
            
            return facilityCodeStr === targetCodeStr || 
                   facilityCodeStr === facility.name ||
                   (typeof venueFacility === 'string' && 
                    facility.name.includes(venueFacility)) ||
                   (typeof venueFacility === 'string' && 
                    venueFacility.includes(facility.name));
          });
          
          return {
            ...facility,
            hasThis
          };
        });
        
        this.setData({
          venue,
          allFacilities,
          loading: false
        })
        
        // 动态设置标题栏为球馆名称
        wx.setNavigationBarTitle({
          title: venue.name
        })
        
        // 记录到常看球馆
        this.addToFrequentVenues(venue)
      } else {
        throw new Error(result.result.error || '获取球馆详情失败')
      }
    } catch (error) {
      console.error('加载球馆详情失败:', error)
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      })
      this.setData({ loading: false })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  // 图片预览
  onImageTap(e) {
    const { index } = e.currentTarget.dataset
    const { images } = this.data.venue
    
    if (images && images.length > 0) {
      wx.previewImage({
        current: images[index],
        urls: images
      })
    }
  },

  // 图片轮播切换
  onSwiperChange(e) {
    this.setData({
      currentImageIndex: e.detail.current
    })
  },

  // 复制电话号码
  onCopyPhone() {
    if (this.data.venue.phone) {
      wx.setClipboardData({
        data: this.data.venue.phone,
        success: () => {
          wx.showToast({
            title: '电话号码已复制',
            icon: 'success',
            duration: 2000
          });
        },
        fail: () => {
          wx.showToast({
            title: '复制失败',
            icon: 'none',
            duration: 2000
          });
        }
      });
    }
  },

  // 打开地图查看位置
  onOpenMap() {
    const venue = this.data.venue;
    if (!venue.address) {
      wx.showToast({
        title: '地址信息不完整',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 如果有经纬度，直接打开地图
    if (venue.latitude && venue.longitude) {
      wx.openLocation({
        latitude: parseFloat(venue.latitude),
        longitude: parseFloat(venue.longitude),
        name: venue.name,
        address: venue.address,
        scale: 18,
        success: () => {
          console.log('打开地图成功');
        },
        fail: () => {
          wx.showToast({
            title: '打开地图失败',
            icon: 'none',
            duration: 2000
          });
        }
      });
    } else {
      // 如果没有经纬度，提示用户或使用地址搜索
      wx.showModal({
        title: '位置信息',
        content: `地址：${venue.address}\n\n暂无精确坐标，是否复制地址到剪贴板？`,
        confirmText: '复制地址',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            wx.setClipboardData({
              data: venue.address,
              success: () => {
                wx.showToast({
                  title: '地址已复制',
                  icon: 'success',
                  duration: 2000
                });
              }
            });
          }
        }
      });
    }
  },

  // 设施点击处理
  onFacilityTap(e) {
    const facility = e.currentTarget.dataset.facility;
    const venue = this.data.venue;
  
    
    // 如果是小程序订场功能
    if (facility.code === '1') {
      if (venue.appId) {
        // 跳转到指定小程序
        wx.navigateToMiniProgram({
          appId: venue.appId,
          path: '', // 可以根据需要指定具体页面路径
          success: () => {
            console.log('跳转小程序成功');
          },
          // fail: (error) => {
          //   console.error('跳转小程序失败:', error);
          //   wx.showModal({
          //     title: '跳转失败',
          //     content: '无法打开订场小程序，请稍后重试或联系球馆客服',
          //     showCancel: false,
          //     confirmText: '知道了'
          //   });
          // }
        });
      } else {
        wx.showToast({
          title: '该球馆暂未开通小程序订场',
          icon: 'none',
          duration: 2000
        });
      }
    } 
  },

  // 添加球馆到常看列表
  addToFrequentVenues(venueData) {
    try {
      let frequentVenues = wx.getStorageSync('frequentVenues') || [];
      
      // 检查是否已存在
      const existingIndex = frequentVenues.findIndex(venue => venue.id === venueData.id);
      
      const venueInfo = {
        id: venueData.id,
        name: venueData.name,
        logo: venueData.logo || '',
        lastVisit: new Date().toISOString()
      };
      
      if (existingIndex >= 0) {
        // 如果已存在，更新访问时间
        frequentVenues[existingIndex] = venueInfo;
      } else {
        // 如果不存在，添加到列表
        frequentVenues.unshift(venueInfo);
        
        // 限制最多保存10个
        if (frequentVenues.length > 10) {
          frequentVenues = frequentVenues.slice(0, 10);
        }
      }
      
      wx.setStorageSync('frequentVenues', frequentVenues);
    } catch (error) {
      console.error('添加常看球馆失败:', error);
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    const venueId = this.data.venue.id
    if (venueId) {
      this.loadVenueDetail(venueId).then(() => {
        wx.stopPullDownRefresh()
      })
    } else {
      wx.stopPullDownRefresh()
    }
  },

  // 分享功能
  onShareAppMessage() {
    const { venue } = this.data
    return {
      title: `${venue.name} - 羽毛球馆推荐`,
      path: `/pages/venue-detail/venue-detail?id=${venue.id}`,
      imageUrl: venue.images && venue.images.length > 0 ? venue.images[0] : '/images/share-default.jpg'
    }
  }
})