// index.js
const app = getApp()
const { getBadmintonRatingLevels } = require('../../utils/dictionary')

// 首页逻辑
Page({
  data: {
    searchValue: '',
    showSearchDropdown: false,
    searchResults: [],
    searchTimer: null,
    bannerList: [
      {
        id: 1,
        title: '带着小可爱',
        subtitle: '一起去挥汗',
        imageUrl: '/images/banners/banner1.png'
      },
      {
        id: 2,
        title: '发现身边好球馆',
        subtitle: '专业场地等你来',
        imageUrl: '/images/banners/banner2.png'
      },
      {
        id: 3,
        title: '约球更简单',
        subtitle: '找到志同道合的球友',
        imageUrl: '/images/banners/banner3.png'
      }
    ],
    frequentVenues: [],
    // 微信联系相关
    showWechatModal: false,
    wechatId: 'hgt_is_god', // 请替换为您的实际微信号
    // 羽毛球等级评定相关
    showRatingModal: false,
    ratingLevels: [] // 将在onLoad中从字典表加载
  },

  onLoad() {
    console.log('首页加载完成');
    this.loadFrequentVenues();
    
    // 从字典表加载羽毛球等级数据
    this.setData({
      ratingLevels: getBadmintonRatingLevels()
    });
    
    // 启用分享功能
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  onShow() {
    // 更新自定义tabBar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      });
    }
    
    // 每次显示页面时重新加载常看球馆
    this.loadFrequentVenues();
  },

  // 加载常看球馆
  loadFrequentVenues() {
    try {
      const frequentVenues = wx.getStorageSync('frequentVenues') || [];
      // 按访问时间倒序排列，最近访问的在前面
      const sortedVenues = frequentVenues.sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit));
      this.setData({
        frequentVenues: sortedVenues
      });
    } catch (error) {
      console.error('加载常看球馆失败:', error);
      this.setData({
        frequentVenues: []
      });
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
        logoUrl: venueData.logoUrl || '',
        emoji: venueData.emoji || '🏸',
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
      this.loadFrequentVenues();
    } catch (error) {
      console.error('添加常看球馆失败:', error);
    }
  },

  // 搜索输入
  onSearchInput(e) {
    const value = e.detail.value;
    this.setData({
      searchValue: value
    });

    // 清除之前的定时器
    if (this.data.searchTimer) {
      clearTimeout(this.data.searchTimer);
    }

    // 如果输入为空，隐藏下拉框
    if (!value.trim()) {
      this.setData({
        showSearchDropdown: false,
        searchResults: []
      });
      return;
    }

    // 设置新的定时器，防抖处理
    const timer = setTimeout(() => {
      this.searchVenues(value.trim());
    }, 300);

    this.setData({
      searchTimer: timer
    });
  },

  // 搜索球馆
  async searchVenues(keyword) {
    if (!keyword) return;

    try {
      const result = await wx.cloud.callFunction({
        name: 'getVenues',
        data: {
          keyword: keyword,
          page: 1,
          limit: 8 // 限制搜索结果数量
        }
      });

      if (result.result && result.result.success) {
        this.setData({
          searchResults: result.result.data.venues,
          showSearchDropdown: true
        });
      } else {
        this.setData({
          searchResults: [],
          showSearchDropdown: false
        });
      }
    } catch (error) {
      console.error('搜索球馆失败:', error);
      this.setData({
        searchResults: [],
        showSearchDropdown: false
      });
    }
  },

  // 搜索框获得焦点
  onSearchFocus() {
    if (this.data.searchValue.trim() && this.data.searchResults.length > 0) {
      this.setData({
        showSearchDropdown: true
      });
    }
  },

  // 搜索框失去焦点
  onSearchBlur() {
    // 延迟隐藏，确保点击搜索项能正常触发
    setTimeout(() => {
      this.setData({
        showSearchDropdown: false
      });
    }, 200);
  },

  // 清空搜索
  onClearSearch() {
    this.setData({
      searchValue: '',
      showSearchDropdown: false,
      searchResults: []
    });
  },

  // 搜索确认（回车）
  onSearchConfirm() {
    const { searchValue } = this.data;
    if (!searchValue.trim()) {
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none'
      });
      return;
    }

    this.setData({
      showSearchDropdown: false
    });

    wx.navigateTo({
      url: `/pages/venues/venues?search=${encodeURIComponent(searchValue)}`
    });
  },

  // 点击搜索结果项
  onSearchItemTap(e) {
    const { venue } = e.currentTarget.dataset;
    this.setData({
      showSearchDropdown: false,
      searchValue: ''
    });

    wx.navigateTo({
      url: `/pages/venue-detail/venue-detail?id=${venue.id}`
    });
  },

  // 执行搜索（保留兼容性）
  onSearch() {
    this.onSearchConfirm();
  },

  // 常看球馆点击
  onVenueTap(e) {
    const { venue } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/venue-detail/venue-detail?id=${venue.id}`
    });
  },

  // 计分板点击
  onScoreboardTap() {
    wx.navigateTo({
      url: '/pages/scoreboard/scoreboard'
    });
  },

  // 羽毛球等级评定点击
  onRatingTap() {
    this.setData({
      showRatingModal: true
    });
  },

  // 战术分析点击
  onTacticsAnalysisTap() {
    wx.navigateTo({
      url: '/pages/tactics-analysis/tactics-analysis'
    });
  },

  // 关闭等级评定弹框
  onCloseRatingModal() {
    this.setData({
      showRatingModal: false
    });
  },

  // 查看更多常看球馆
  onMoreVenues() {
    wx.navigateTo({
      url: '/pages/venues/venues'
    });
  },

  // 求签问球点击
  onDivinationTap() {
    wx.navigateTo({
      url: '/pages/divination/divination'
    });
  },

  // 微信联系点击
  onWechatContactTap() {
    this.setData({
      showWechatModal: true
    });
  },

  // 关闭微信联系弹框
  onCloseWechatModal() {
    this.setData({
      showWechatModal: false
    });
  },

  // 复制微信号
  onCopyWechatId() {
    const { wechatId } = this.data;
    wx.setClipboardData({
      data: wechatId,
      success: () => {
        wx.showToast({
          title: '微信号已复制',
          icon: 'success',
          duration: 2000
        });
        // 复制成功后关闭弹框
        this.setData({
          showWechatModal: false
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
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },

  // 分享给好友
  onShareAppMessage(res) {
    console.log('分享给好友', res);
    
    // 如果是从按钮触发的分享
    if (res.from === 'button') {
      console.log('来自按钮分享', res.target);
    }
    
    return {
      title: 'Badminton - 一击即中 羽你争锋',
      path: '/pages/index/index',
      imageUrl: '/images/banners/banner1.png', // 分享图片，可以是本地图片或网络图片
      success: function(res) {
        console.log('分享成功', res);
        wx.showToast({
          title: '分享成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: function(res) {
        console.log('分享失败', res);
        wx.showToast({
          title: '分享失败',
          icon: 'none',
          duration: 2000
        });
      }
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    console.log('分享到朋友圈');
    
    return {
      title: 'Badminton - 发现身边好球馆，约球更简单',
      query: '',
      imageUrl: '/images/banners/banner2.png', // 朋友圈分享图片
      success: function(res) {
        console.log('分享到朋友圈成功', res);
        wx.showToast({
          title: '分享成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: function(res) {
        console.log('分享到朋友圈失败', res);
        wx.showToast({
          title: '分享失败',
          icon: 'none',
          duration: 2000
        });
      }
    };
  },

  // 手动触发分享
  onShareTap() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

});