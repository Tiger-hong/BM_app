// venues.js
const { FUZHOU_DISTRICTS, getFacilitiesByCategory } = require('../../utils/dictionary.js');

Page({
  data: {
    searchValue: '',
    selectedDistrict: '', // 选中的地区（空表示全部地区）
    selectedDistrictName: '全部地区', // 选中地区的显示名称
    showDistrictPicker: false, // 控制地区选择器显示
    selectedFacilities: [], // 选中的设施筛选条件
    selectedActive:{
      '10': false, // 空调
      '11': false  // 停车场
    },
    selectedRegionIndex: 0, // 地区选择器的索引
    // 地区选项（从字典中获取）
    regionOptions: FUZHOU_DISTRICTS.map(district => ({
      id: district.code,
      name: district.name
    })),
    // 筛选用的设施选项（只显示空调和停车场，从字典中获取）
    facilityOptions: getFacilitiesByCategory('basic').filter(facility => 
      facility.code === '10' || facility.code === '11'
    ).map(facility => ({
      id: facility.code,
      name: facility.name,
      iconPath: facility.iconPath
    })),
    venues: [],
    filteredVenues: [],
    loading: false,
    page: 1,
    limit: 20,
    hasMore: true,
    total: 0,
    searchTimeout: null // 搜索防抖定时器
  },

  onLoad() {
    // 初始加载数据
    this.loadVenues(true);
  },

  onShow() {
    // 更新自定义tabBar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      });
    }
  },

  // 加载球馆数据
  async loadVenues(reset = false) {
    if (this.data.loading) return;
    
    const page = reset ? 1 : this.data.page;
    
    this.setData({
      loading: true
    });

    try {
      // 构建设施筛选参数
      const facilities = [];
      if (this.data.selectedActive['10']) {
        facilities.push('10'); // 空调
      }
      if (this.data.selectedActive['11']) {
        facilities.push('11'); // 停车场
      }

      const result = await wx.cloud.callFunction({
        name: 'getVenues',
        data: {
          page: Number(page) || 1,
          limit: Number(this.data.limit) || 20,
          keyword: String(this.data.searchValue || '').trim(),
          district: String(this.data.selectedDistrict || ''),
          facilities: Array.isArray(facilities) ? facilities : []
        }
      });

      if (result.result.success) {
        const { venues, total, hasMore } = result.result.data;
        
        // 为每个球馆生成设施显示数据和处理地址显示
        const venuesWithDisplay = venues.map(venue => ({
          ...venue,
          facilitiesDisplay: this.generateFacilitiesDisplay(venue.facilities),
          // 处理地址显示，控制在16个字符内
          addressDisplay: (() => {
            const address = String(venue.address || '地址未知');
            return address.length > 16 ? address.substring(0, 17) + '...' : address;
          })()
        }));

        this.setData({
          venues: reset ? venuesWithDisplay : [...this.data.venues, ...venuesWithDisplay],
          filteredVenues: reset ? venuesWithDisplay : [...this.data.filteredVenues, ...venuesWithDisplay],
          total,
          hasMore,
          page: reset ? 2 : page + 1,
          loading: false
        });
      } else {
        throw new Error(result.result.error || '获取数据失败');
      }
    } catch (error) {
      console.error('加载球馆数据失败:', error);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none',
        duration: 2000
      });
      this.setData({
        loading: false
      });
    }
  },

  // 生成设施显示数据
  generateFacilitiesDisplay(facilities) {
    if (!Array.isArray(facilities)) return [];
    
    // 引入设施字典（与utils/dictionary.js保持一致）
    const facilityIconMap = {
      '小程序订场': '/images/icons/facilities/app_order.png',
      '空调': '/images/icons/facilities/air_conditioning.png',
      '停车场': '/images/icons/facilities/parking.png',
      '储物柜': '/images/icons/facilities/locker.png',
      '淋浴间': '/images/icons/facilities/shower.png',
      '休息区': '/images/icons/facilities/rest_area.png',
      '拉线服务': '/images/icons/facilities/stringing.png',
      '器材租赁': '/images/icons/facilities/equipment_rental.png',
      '自动售货机': '/images/icons/facilities/vending_machine.png',
      '专业照明': '/images/icons/facilities/lighting.png',
      '音响系统': '/images/icons/facilities/sound_system.png',
      '医疗急救': '/images/icons/facilities/first_aid.png'
    };
    
    return facilities
      .filter(facility => facility != null) // 过滤掉 null 和 undefined
      .map(facilityName => {
        // 确保facilityName是字符串
        const name = String(facilityName || '').trim();
        
        // 如果名称为空，跳过
        if (!name) return null;
        
        // 优先使用精确匹配
        let iconPath = facilityIconMap[name];
        
        // 如果没有精确匹配，使用模糊匹配（保持向后兼容）
        if (!iconPath) {
          if (name.includes('空调') || name.includes('冷气')) {
            iconPath = '/images/icons/facilities/air_conditioning.png';
          } else if (name.includes('停车') || name.includes('车位')) {
            iconPath = '/images/icons/facilities/parking.png';
          } else if (name.includes('淋浴') || name.includes('洗澡')) {
            iconPath = '/images/icons/facilities/shower.png';
          } else if (name.includes('储物') || name.includes('更衣') || name.includes('衣柜')) {
            iconPath = '/images/icons/facilities/locker.png';
          } else {
            // 默认图标
            iconPath = '/images/icons/facilities/default.svg';
          }
        }
        
        return {
          name,
          iconPath
        };
      })
      .filter(item => item !== null); // 过滤掉空项
  },

  // 点击球馆项跳转到详情页
  onVenueItemTap(e) {
    const venueId = e.currentTarget.dataset.id;
    if (venueId) {
      wx.navigateTo({
        url: `/pages/venue-detail/venue-detail?id=${venueId}`
      });
    }
  },

  // 搜索输入
  onSearchInput(e) {
    const searchValue = e.detail.value || '';
    this.setData({
      searchValue
    });
    
    // 清除之前的定时器
    if (this.data.searchTimeout) {
      clearTimeout(this.data.searchTimeout);
    }
    
    // 设置新的定时器，500ms后执行搜索
    const timeout = setTimeout(() => {
      this.loadVenues(true);
    }, 500);
    
    this.setData({
      searchTimeout: timeout
    });
  },

  // 地区切换（picker组件）
  onRegionChange(e) {
    const selectedRegionIndex = parseInt(e.detail.value);
    const selectedRegion = this.data.regionOptions[selectedRegionIndex];
    
    this.setData({
      selectedRegionIndex,
      selectedDistrict: selectedRegion.id,
      selectedDistrictName: selectedRegion.name
    });
    
    this.loadVenues(true);
  },

  // 地区切换（原有方法，保持兼容）
  onDistrictChange(e) {
    const selectedDistrict = e.currentTarget.dataset.district;
    const selectedDistrictName = e.currentTarget.dataset.name;
    this.setData({
      selectedDistrict,
      selectedDistrictName,
      showDistrictPicker: false
    });
    this.loadVenues(true);
  },

  // 显示地区选择器
  showDistrictPicker() {
    this.setData({
      showDistrictPicker: true
    });
  },

  // 隐藏地区选择器
  hideDistrictPicker() {
    this.setData({
      showDistrictPicker: false
    });
  },

  // 设施筛选切换
  onFacilityFilterToggle(e) {
    const facilityId = e.currentTarget.dataset.facility;
    
    // 更新设施激活状态
    this.setData({
      selectedActive: {
        ...this.data.selectedActive,
        [facilityId]: !this.data.selectedActive[facilityId]
      }
    });
    
    // 重新加载数据
    this.loadVenues(true);
  },

  // 重置所有筛选条件
  onResetFilters() {
    this.setData({
      searchValue: '', // 清空搜索内容
      selectedDistrict: '', // 重置为全部地区
      selectedDistrictName: '全部地区',
      selectedRegionIndex: 0, // 重置地区选择器索引
      selectedFacilities: [], // 清空选中的设施
      selectedActive: {
        '10': false, // 空调
        '11': false  // 停车场
      }
    });
    
    // 重新加载数据
    this.loadVenues(true);
    
    // 显示重置成功的提示
    wx.showToast({
      title: '已重置筛选条件',
      icon: 'success',
      duration: 1500
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadVenues(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadVenues(false);
    }
  },

  // 球馆详情
  onVenueTap(e) {
    const { venue } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/venue-detail/venue-detail?id=${venue.id}`
    });
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '羽毛球馆列表 - 找到最适合的球馆',
      path: '/pages/venues/venues'
    };
  }
});