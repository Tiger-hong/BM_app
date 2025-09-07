Component({
  data: {
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#9f2995",
    list: [
      {
        pagePath: "/pages/index/index",
        iconPath: "/images/icons/home.png",
        selectedIconPath: "/images/icons/home-active.png",
        text: "首页"
      },
      {
        pagePath: "/pages/venues/venues",
        iconPath: "/images/icons/badminton.png",
        selectedIconPath: "/images/icons/badminton.png",
        // text: "球馆"
      },
      {
        pagePath: "/pages/map/map",
        iconPath: "/images/icons/map.png",
        selectedIconPath: "/images/icons/map-active.png",
        text: "地图"
      }
    ]
  },
  
  attached() {
    // 获取当前页面路径，设置对应的选中状态
    const pages = getCurrentPages();
    if (pages && pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      if (currentPage && currentPage.route) {
        const url = currentPage.route;
        this.setSelected(url);
      }
    }
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({ url });
      this.setSelected(url);
    },

    setSelected(url) {
      if (!url) return; // 如果url为空，直接返回
      
      const list = this.data.list;
      for (let i = 0; i < list.length; i++) {
        if (list[i].pagePath.includes(url)) {
          this.setData({
            selected: i
          });
          break;
        }
      }
    }
  }
});