// divination.js
Page({
  data: {
    hasDrawnToday: false,  // 今日是否已求签
    shaking: false,        // 是否正在摇签
    showResult: false,     // 是否显示结果
    result: null,          // 求签结果
    
    // 搞笑的求签结果数据
    fortuneResults: [
      // 极佳运势
      {
        title: "羽运当头",
        level: "极佳",
        color: "#FF6B6B",
        description: "今日羽毛球运势爆棚！球感如神助，每一拍都能精准落点。建议多打几局，说不定能遇到心仪的球友哦~",
        suggestion: "记得带足够的水和毛巾，今天你会挥汗如雨但满载而归！"
      },
      {
        title: "球王降临",
        level: "极佳", 
        color: "#FF6B6B",
        description: "恭喜！今日你就是球场上最靓的仔！反手、网前、后场样样精通，连球拍都在为你加油！",
        suggestion: "可以考虑挑战更强的对手，今天是突破自我的好时机！"
      },
      
      // 很好运势
      {
        title: "羽你同行",
        level: "很好",
        color: "#4ECDC4",
        description: "今日打球状态不错，虽然偶尔会有失误，但整体发挥稳定。适合和朋友们一起享受羽毛球的乐趣！",
        suggestion: "多尝试一些新的技术动作，今天学习效果会很好。"
      },
      {
        title: "稳中求胜",
        level: "很好",
        color: "#4ECDC4", 
        description: "你的球技今日如老酒般醇厚，虽不惊艳但胜在稳定。对手想要击败你，还得再练练！",
        suggestion: "专注于基本功练习，稳扎稳打是王道。"
      },
      
      // 一般运势
      {
        title: "平稳发挥",
        level: "一般",
        color: "#45B7D1",
        description: "今日球技发挥中规中矩，就像平时一样。不会有惊喜，但也不会有意外，适合保持节奏。",
        suggestion: "保持平常心，享受运动的过程比结果更重要。"
      },
      {
        title: "随缘挥拍",
        level: "一般",
        color: "#45B7D1",
        description: "今天的你就像一只佛系的小鸟，不求完美只求快乐。输赢都是浮云，开心就好！",
        suggestion: "可以尝试一些平时不敢做的高难度动作，反正今天心态很佛系。"
      },
      
      // 需注意运势  
      {
        title: "小心球拍",
        level: "需注意",
        color: "#96CEB4",
        description: "今日球技有些飘忽不定，就像天气预报一样不太准确。建议多热身，小心不要扭到脚哦！",
        suggestion: "注意安全第一，可以选择强度较低的训练内容。"
      },
      {
        title: "球在飞舞",
        level: "需注意", 
        color: "#96CEB4",
        description: "今天的羽毛球似乎有了自己的想法，你想让它往左它偏要往右。建议降低期望值，重在参与！",
        suggestion: "多做基础练习，重新找回手感很重要。"
      },
      
      // 不宜运势
      {
        title: "球拍罢工",
        level: "不宜",
        color: "#FECA57",
        description: "今日不适宜打羽毛球！你的球拍可能会'罢工'，羽毛球也可能会'迷路'。建议在家看看羽毛球比赛视频学习一下！",
        suggestion: "今天适合休息或观看教学视频，劳逸结合很重要。"
      },
      {
        title: "改日再战",
        level: "不宜",
        color: "#FECA57", 
        description: "今天的你和羽毛球不在一个频道上，强行打球可能会怀疑人生。不如回家躺平，明日再来征战球场！",
        suggestion: "好好休息，调整状态，明天会是新的开始。"
      }
    ]
  },

  onLoad() {
    console.log('求签问球页面加载');
    this.checkTodayDivination();
  },

  onShow() {
    console.log('求签问球页面显示');
  },

  // 检查今日是否已求签
  checkTodayDivination() {
    try {
      const today = this.getTodayString();
      const lastDivinationDate = wx.getStorageSync('lastDivinationDate');
      const lastResult = wx.getStorageSync('lastDivinationResult');
      
      if (lastDivinationDate === today && lastResult) {
        // 今日已求签，直接显示结果
        this.setData({
          hasDrawnToday: true,
          result: lastResult,
          showResult: true  // 直接显示结果
        });
      } else {
        // 今日未求签
        this.setData({
          hasDrawnToday: false,
          showResult: false,
          result: null
        });
      }
    } catch (error) {
      console.error('检查求签状态失败:', error);
      this.setData({
        hasDrawnToday: false,
        showResult: false,
        result: null
      });
    }
  },

  // 获取今日日期字符串
  getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 摇签点击事件
  onShakeSignStick() {
    if (this.data.shaking) return; // 防止连续点击

    if (this.data.hasDrawnToday) {
      // 今日已求签，不允许再次求签
      wx.showToast({
        title: '今日已求签，明日再来',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 开始摇签动画
    this.setData({
      shaking: true
    });

    // 摇签动画效果
    setTimeout(() => {
      this.setData({
        shaking: false
      });
      this.generateResult();
    }, 1500); // 增加动画时间让效果更好
  },

  // 生成求签结果
  generateResult() {
    try {
      // 随机选择一个结果
      const randomIndex = Math.floor(Math.random() * this.data.fortuneResults.length);
      const result = this.data.fortuneResults[randomIndex];
      
      // 保存今日求签记录
      const today = this.getTodayString();
      wx.setStorageSync('lastDivinationDate', today);
      wx.setStorageSync('lastDivinationResult', result);
      
      // 延迟显示结果，增加悬念感
      setTimeout(() => {
        this.setData({
          result: result,
          hasDrawnToday: true,
          showResult: true
        });

        // 震动反馈
        wx.vibrateShort({
          type: 'light'
        });

        // 显示提示
        wx.showToast({
          title: '求签完成',
          icon: 'success',
          duration: 1500
        });
      }, 500); // 增加延迟，让用户有更好的体验

    } catch (error) {
      console.error('生成求签结果失败:', error);
      wx.showToast({
        title: '求签失败，请重试',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 分享功能
  onShareAppMessage() {
    const { result } = this.data;
    
    if (result) {
      return {
        title: `我今日的羽毛球运势是"${result.title}"！快来看看你的运势如何～`,
        path: '/pages/divination/divination',
        imageUrl: '/images/banners/banner1.png' // 可以设置分享图片
      };
    }
    
    return {
      title: '求签问球 - 看看今日是否适宜打羽毛球',
      path: '/pages/divination/divination',
      imageUrl: '/images/banners/banner1.png'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    const { result } = this.data;
    
    if (result) {
      return {
        title: `羽毛球运势"${result.title}" - 今日打球指南`,
        imageUrl: '/images/banners/banner1.png'
      };
    }
    
    return {
      title: '求签问球 - 每日羽毛球运势占卜',
      imageUrl: '/images/banners/banner1.png'
    };
  }
});