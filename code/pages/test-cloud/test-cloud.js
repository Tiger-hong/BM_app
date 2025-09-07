// test-cloud.js
Page({
  data: {
    loading: false,
    result: '',
    venues: []
  },

  onLoad() {
    console.log('测试页面加载完成');
  },

  // 测试获取球馆列表
  async testGetVenues() {
    this.setData({
      loading: true,
      result: '正在调用 getVenues 云函数...'
    });

    try {
      const result = await wx.cloud.callFunction({
        name: 'getVenues',
        data: {
          page: 1,
          limit: 10,
          keyword: '',
          district: '',
          facilities: [],
          sortBy: 'createTime'
        }
      });

      console.log('getVenues 云函数结果:', result);

      if (result.result.success) {
        const { venues, total, hasMore } = result.result.data;
        this.setData({
          result: `成功获取 ${venues.length} 个球馆，总计 ${total} 个`,
          venues: venues,
          loading: false
        });
      } else {
        this.setData({
          result: `调用失败: ${result.result.error}`,
          loading: false
        });
      }
    } catch (error) {
      console.error('调用 getVenues 云函数失败:', error);
      this.setData({
        result: `调用失败: ${error.message}`,
        loading: false
      });
    }
  },

  // 测试搜索功能
  async testSearch() {
    this.setData({
      loading: true,
      result: '正在测试搜索功能...'
    });

    try {
      const result = await wx.cloud.callFunction({
        name: 'getVenues',
        data: {
          page: 1,
          limit: 10,
          keyword: '羽毛球',
          district: '',
          facilities: [],
          sortBy: 'createTime'
        }
      });

      if (result.result.success) {
        const { venues, total } = result.result.data;
        this.setData({
          result: `搜索"羽毛球"找到 ${venues.length} 个球馆，总计 ${total} 个`,
          venues: venues,
          loading: false
        });
      } else {
        this.setData({
          result: `搜索失败: ${result.result.error}`,
          loading: false
        });
      }
    } catch (error) {
      this.setData({
        result: `搜索失败: ${error.message}`,
        loading: false
      });
    }
  },

  // 测试地区筛选
  async testDistrictFilter() {
    this.setData({
      loading: true,
      result: '正在测试地区筛选...'
    });

    try {
      const result = await wx.cloud.callFunction({
        name: 'getVenues',
        data: {
          page: 1,
          limit: 10,
          keyword: '',
          district: '鼓楼区',
          facilities: [],
          sortBy: 'createTime'
        }
      });

      if (result.result.success) {
        const { venues, total } = result.result.data;
        this.setData({
          result: `鼓楼区找到 ${venues.length} 个球馆，总计 ${total} 个`,
          venues: venues,
          loading: false
        });
      } else {
        this.setData({
          result: `地区筛选失败: ${result.result.error}`,
          loading: false
        });
      }
    } catch (error) {
      this.setData({
        result: `地区筛选失败: ${error.message}`,
        loading: false
      });
    }
  },

  // 测试设施筛选
  async testFacilityFilter() {
    this.setData({
      loading: true,
      result: '正在测试设施筛选...'
    });

    try {
      const result = await wx.cloud.callFunction({
        name: 'getVenues',
        data: {
          page: 1,
          limit: 10,
          keyword: '',
          district: '',
          facilities: ['空调'],
          sortBy: 'createTime'
        }
      });

      if (result.result.success) {
        const { venues, total } = result.result.data;
        this.setData({
          result: `有空调的球馆找到 ${venues.length} 个，总计 ${total} 个`,
          venues: venues,
          loading: false
        });
      } else {
        this.setData({
          result: `设施筛选失败: ${result.result.error}`,
          loading: false
        });
      }
    } catch (error) {
      this.setData({
        result: `设施筛选失败: ${error.message}`,
        loading: false
      });
    }
  },

  // 清空结果
  clearResult() {
    this.setData({
      result: '',
      venues: []
    });
  }
});