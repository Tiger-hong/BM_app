// tactics-analysis.js
Page({
  data: {
    currentMode: 'singles', // 当前模式：singles（单打）或 doubles（双打）
    courtWidth: 300,
    courtHeight: 500,
    
    // 羽毛球位置
    shuttlecock: {
      x: 150,
      y: 250
    },
    
    // A队球员（红色）
    playersA: [
      { id: 1, x: 150, y: 400 }
    ],
    
    // B队球员（蓝色）
    playersB: [
      { id: 1, x: 150, y: 100 }
    ],
    
    // 拖拽相关
    isDragging: false,
    dragElement: null,
    startX: 0,
    startY: 0,
    elementStartX: 0,
    elementStartY: 0,
    
    // 手绘功能相关
    isDrawing: false,
    drawingPaths: [], // 存储手绘路径
    currentPath: null, // 当前正在绘制的路径
    canvasRect: null // 缓存Canvas位置信息
  },

  onLoad() {
    console.log('战术分析页面加载');
    this.setDefaultPositions();
  },

  onShow() {
    // 页面显示时强制重绘
    setTimeout(() => {
      if (this.data.courtWidth > 0 && this.data.courtHeight > 0) {
        this.drawCourt();
      } else {
        this.initCanvas();
      }
    }, 100);
  },

  onReady() {
    // 页面渲染完成后初始化Canvas并绘制球场
    setTimeout(() => {
      this.initCanvas();
    }, 100);
  },

  // 初始化Canvas
  initCanvas() {
    const query = wx.createSelectorQuery().in(this);
    query.select('.court-canvas').boundingClientRect();
    query.exec((res) => {
      if (res[0]) {
        const { width, height } = res[0];
        console.log('Canvas尺寸:', width, height);
        if (width > 0 && height > 0) {
          this.setData({
            courtWidth: width,
            courtHeight: height
          });
          // 缓存Canvas位置信息，提高手绘精度
          this.cacheCanvasRect();
          // 重新设置默认位置
          this.setDefaultPositions();
          // 绘制球场
          setTimeout(() => {
            this.drawCourt();
            // 初始化手绘上下文
            this.initDrawingContext();
          }, 50);
        } else {
          // 如果Canvas尺寸为0，再次尝试
          setTimeout(() => {
            this.initCanvas();
          }, 200);
        }
      } else {
        console.error('Canvas元素未找到');
        // 再次尝试
        setTimeout(() => {
          this.initCanvas();
        }, 200);
      }
    });
  },

  // 绘制羽毛球场
  drawCourt() {
    console.log('开始绘制球场');
    const ctx = wx.createCanvasContext('badmintonCourt', this);
    const { courtWidth, courtHeight } = this.data;
    
    console.log('绘制尺寸:', courtWidth, courtHeight);
    
    if (!courtWidth || !courtHeight || courtWidth <= 0 || courtHeight <= 0) {
      console.error('无效的Canvas尺寸');
      return;
    }
    
    // 清除画布，不设置背景色，保持透明
    ctx.clearRect(0, 0, courtWidth, courtHeight);
    
    // 设置线条样式
    ctx.setStrokeStyle('#FFFFFF'); // 白色线条
    ctx.setLineCap('round');
    ctx.setLineJoin('round');
    
    // 场地占满整个Canvas区域，只留很小边距确保线条完整显示
    const margin = 2;
    const actualWidth = courtWidth - margin * 2;
    const actualHeight = courtHeight - margin * 2;
    
    // 根据标准羽毛球场地尺寸计算比例 (13.4m × 6.1m)
    // 从图片可以看出具体的线条位置和比例
    
    // 绘制外边界线（双打场地边界，最粗的线）
    ctx.setLineWidth(3);
    ctx.strokeRect(margin, margin, actualWidth, actualHeight);
    
    // 设置内部线条宽度
    ctx.setLineWidth(2);
    
    // 计算各线条位置（基于图片中的标准尺寸）
    const singlesSideMargin = actualWidth * 0.076; // 单打边线距离外边界 (0.46m/6.1m ≈ 7.6%)
    const serviceLineFromNet = actualHeight * 0.147; // 前发球线距离中线 (1.98m/13.4m ≈ 14.7%)
    const doublesBackServiceLine = actualHeight * 0.057; // 双打后发球线距离底线 (0.76m/13.4m ≈ 5.7%)
    
    // 绘制中线（网的位置，横向分割线）
    ctx.beginPath();
    ctx.moveTo(margin, margin + actualHeight / 2);
    ctx.lineTo(margin + actualWidth, margin + actualHeight / 2);
    ctx.stroke();
    
    // 绘制单打边线（左右两条垂直线）
    // 左单打边线
    ctx.beginPath();
    ctx.moveTo(margin + singlesSideMargin, margin);
    ctx.lineTo(margin + singlesSideMargin, margin + actualHeight);
    ctx.stroke();
    
    // 右单打边线
    ctx.beginPath();
    ctx.moveTo(margin + actualWidth - singlesSideMargin, margin);
    ctx.lineTo(margin + actualWidth - singlesSideMargin, margin + actualHeight);
    ctx.stroke();
    
    // 绘制前发球线（上下两条，距离中线的水平线）
    // 上前发球线
    ctx.beginPath();
    ctx.moveTo(margin , margin + actualHeight / 2 - serviceLineFromNet);
    ctx.lineTo(margin + actualWidth , margin + actualHeight / 2 - serviceLineFromNet);
    ctx.stroke();
    
    // 下前发球线
    ctx.beginPath();
    ctx.moveTo(margin, margin + actualHeight / 2 + serviceLineFromNet);
    ctx.lineTo(margin + actualWidth, margin + actualHeight / 2 + serviceLineFromNet);
    ctx.stroke();
    
    // 绘制双打后发球线（上下两条，靠近底线的水平线）
    // 上双打后发球线
    ctx.beginPath();
    ctx.moveTo(margin, margin + doublesBackServiceLine);
    ctx.lineTo(margin + actualWidth, margin + doublesBackServiceLine);
    ctx.stroke();
    
    // 下双打后发球线
    ctx.beginPath();
    ctx.moveTo(margin, margin + actualHeight - doublesBackServiceLine);
    ctx.lineTo(margin + actualWidth, margin + actualHeight - doublesBackServiceLine);
    ctx.stroke();
    
    // 绘制中央发球线（纵向，从各自发球线到各自底线）
    // 上半场中央发球线（从上前发球线到上底线）
    ctx.beginPath();
    ctx.moveTo(margin + actualWidth / 2, margin + actualHeight / 2 - serviceLineFromNet);
    ctx.lineTo(margin + actualWidth / 2, margin);
    ctx.stroke();
    
    // 下半场中央发球线（从下前发球线到下底线）
    ctx.beginPath();
    ctx.moveTo(margin + actualWidth / 2, margin + actualHeight / 2 + serviceLineFromNet);
    ctx.lineTo(margin + actualWidth / 2, margin + actualHeight);
    ctx.stroke();
    
    // 如果是单打模式，用不同颜色突出显示单打有效区域
    if (this.data.currentMode === 'singles') {
      ctx.setLineWidth(3);
      ctx.setStrokeStyle('#FFD700'); // 金黄色突出单打边线
      
      // 重新绘制单打边线以突出显示
      // 左单打边线
      ctx.beginPath();
      ctx.moveTo(margin + singlesSideMargin, margin);
      ctx.lineTo(margin + singlesSideMargin, margin + actualHeight);
      ctx.stroke();
      
      // 右单打边线
      ctx.beginPath();
      ctx.moveTo(margin + actualWidth - singlesSideMargin, margin);
      ctx.lineTo(margin + actualWidth - singlesSideMargin, margin + actualHeight);
      ctx.stroke();
      
      // 单打后发球线范围（从前发球线到底线，不是双打后发球线）
      // 上半场：从上前发球线到上底线
    //   ctx.beginPath();
    //   ctx.moveTo(margin + singlesSideMargin, margin + actualHeight / 2 - serviceLineFromNet);
    //   ctx.lineTo(margin + actualWidth - singlesSideMargin, margin + actualHeight / 2 - serviceLineFromNet);
    //   ctx.stroke();
      
    //   // 下半场：从下前发球线到下底线
    //   ctx.beginPath();
    //   ctx.moveTo(margin + singlesSideMargin, margin + actualHeight / 2 + serviceLineFromNet);
    //   ctx.lineTo(margin + actualWidth - singlesSideMargin, margin + actualHeight / 2 + serviceLineFromNet);
    //   ctx.stroke();
      
      // 上底线（单打边线内）
      ctx.beginPath();
      ctx.moveTo(margin + singlesSideMargin, margin);
      ctx.lineTo(margin + actualWidth - singlesSideMargin, margin);
      ctx.stroke();
      
      // 下底线（单打边线内）
      ctx.beginPath();
      ctx.moveTo(margin + singlesSideMargin, margin + actualHeight);
      ctx.lineTo(margin + actualWidth - singlesSideMargin, margin + actualHeight);
      ctx.stroke();
    }
    
    ctx.draw(false, () => {
      console.log('球场绘制完成');
      // 场地绘制完成后，在独立图层上绘制手绘内容
      setTimeout(() => {
        this.drawPaths();
      }, 50);
    });
  },

  // 设置默认位置
  setDefaultPositions() {
    const { currentMode, courtWidth, courtHeight } = this.data;
    
    // 场地现在占满整个Canvas区域，只留很小边距
    const margin = 2;
    const actualWidth = courtWidth - margin * 2;
    const actualHeight = courtHeight - margin * 2;
    
    if (currentMode === 'singles') {
      // 单打默认位置（调整为更合理的元素尺寸）
      this.setData({
        playersA: [{ 
          id: 1, 
          x: Math.max(0, margin + actualWidth / 2 ), 
          y: Math.max(0, margin + actualHeight * 0.8 - 55) 
        }],
        playersB: [{ 
          id: 1, 
          x: Math.max(0, margin + actualWidth / 2 - 50), 
          y: Math.max(0, margin + actualHeight * 0.2 - 25) 
        }],
        shuttlecock: { 
          x: Math.max(0, margin + actualWidth / 2 - 35), 
          y: Math.max(0, margin + actualHeight / 2 - 35) 
        }
      });
    } else {
      // 双打默认位置（调整为更合理的元素尺寸）
      this.setData({
        playersA: [
          { 
            id: 1, 
            x: Math.max(0, margin + actualWidth * 0.3 - 25), 
            y: Math.max(0, margin + actualHeight * 0.75) 
          },
          { 
            id: 2, 
            x: Math.max(0, margin + actualWidth * 0.7 - 50), 
            y: Math.max(0, margin + actualHeight * 0.75 - 55) 
          }
        ],
        playersB: [
          { 
            id: 1, 
            x: Math.max(0, margin + actualWidth * 0.3), 
            y: Math.max(0, margin + actualHeight * 0.25 - 35) 
          },
          { 
            id: 2, 
            x: Math.max(0, margin + actualWidth * 0.7 - 50), 
            y: Math.max(0, margin + actualHeight * 0.25 - 85) 
          }
        ],
        shuttlecock: { 
          x: Math.max(0, margin + actualWidth / 2 - 35), 
          y: Math.max(0, margin + actualHeight / 2 - 35) 
        }
      });
    }
  },

  // 切换手绘模式
  onToggleDrawing() {
    const newDrawingState = !this.data.isDrawing;
    console.log('切换手绘模式:', newDrawingState);
    
    this.setData({
      isDrawing: newDrawingState
    });
    
    if (newDrawingState) {
      // 初始化手绘Canvas上下文
      this.initDrawingContext();
      wx.showToast({
        title: '手绘模式已开启',
        icon: 'none',
        duration: 1500
      });
    } else {
      wx.showToast({
        title: '手绘模式已关闭',
        icon: 'none',
        duration: 1500
      });
    }
  },

  // 清空手绘
  onClearDrawing() {
    console.log('清空手绘');
    
    this.setData({
      drawingPaths: [],
      currentPath: null
    });
    
    // 重新绘制球场（只绘制场地线条，不包括手绘内容）
    this.drawCourt();
    
    wx.showToast({
      title: '手绘已清空',
      icon: 'success',
      duration: 1500
    });
  },

  // 初始化手绘功能（不需要持久的上下文）
  initDrawingContext() {
    // 手绘功能已准备好，使用临时上下文进行绘制
    console.log('手绘功能初始化完成');
  },

  // 绘制手绘路径（独立图层，不影响场地绘制）
  drawPaths() {
    const { drawingPaths, courtWidth, courtHeight } = this.data;
    if (!drawingPaths.length || !courtWidth || !courtHeight) return;
    
    // 创建独立的绘制上下文，避免影响场地绘制
    const drawCtx = wx.createCanvasContext('badmintonCourt', this);
    
    // 先获取当前场地的绘制状态，确保不覆盖场地内容
    // 设置手绘样式
    drawCtx.setStrokeStyle('#FF4081'); // 粉红色手绘线条
    drawCtx.setLineWidth(3);
    drawCtx.setLineCap('round');
    drawCtx.setLineJoin('round');
    
    // 绘制所有手绘路径
    drawingPaths.forEach(path => {
      if (path.length > 1) {
        drawCtx.beginPath();
        drawCtx.moveTo(path[0].x, path[0].y);
        
        for (let i = 1; i < path.length; i++) {
          drawCtx.lineTo(path[i].x, path[i].y);
        }
        
        drawCtx.stroke();
      }
    });
    
    // 使用reserve参数保留已有内容，只添加手绘层
    drawCtx.draw(true); // true参数表示保留之前的绘制内容
  },
  onModeChange(e) {
    const mode = e.currentTarget.dataset.mode;
    console.log('切换模式到:', mode);
    
    // 检查是否真的需要切换模式
    if (this.data.currentMode === mode) {
      return; // 如果是相同模式，不需要处理
    }
    
    // 切换模式时自动清空手绘内容
    this.setData({
      currentMode: mode,
      drawingPaths: [], // 清空手绘路径
      currentPath: null, // 清空当前绘制路径
      isDrawing: false // 关闭手绘模式
    });
    
    // 重新设置默认位置
    this.setDefaultPositions();
    
    // 重新绘制球场（不包含手绘内容）
    setTimeout(() => {
      this.drawCourt();
    }, 50);
    
    // 给用户反馈
    wx.showToast({
      title: `已切换到${mode === 'singles' ? '单打' : '双打'}模式，手绘已清空`,
      icon: 'none',
      duration: 2000
    });
  },

  // 元素触摸开始
  onElementTouchStart(e) {
    const { type, team, id } = e.currentTarget.dataset;
    const touch = e.touches[0];
    
    this.setData({
      isDragging: true,
      dragElement: { type, team, id },
      startX: touch.clientX,
      startY: touch.clientY
    });
    
    // 记录元素初始位置
    if (type === 'shuttlecock') {
      const { shuttlecock } = this.data;
      this.setData({
        elementStartX: shuttlecock.x,
        elementStartY: shuttlecock.y
      });
    } else if (type === 'player') {
      const players = team === 'A' ? this.data.playersA : this.data.playersB;
      const player = players.find(p => p.id == id);
      this.setData({
        elementStartX: player.x,
        elementStartY: player.y
      });
    }
  },

  // 元素触摸移动
  onElementTouchMove(e) {
    if (!this.data.isDragging) return;
    
    const touch = e.touches[0];
    const { startX, startY, elementStartX, elementStartY, dragElement, courtWidth, courtHeight } = this.data;
    
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    
    let newX = elementStartX + deltaX;
    let newY = elementStartY + deltaY;
    
    // 根据元素实际尺寸调整边界限制（羽毛琇70px，球员100px）
    const elementWidth = dragElement.type === 'shuttlecock' ? 70 : 60;
    const elementHeight = dragElement.type === 'shuttlecock' ? 70 : 80;
    
    // 左右两边完全不限制，只限制上下边界
    // 水平方向：允许在整个Canvas宽度范围内移动
    newX = Math.max(0, Math.min(newX, courtWidth - elementWidth));
    // 垂直方向：保留少量边距避免元素超出边界
    newY = Math.max(0, Math.min(newY, courtHeight - elementHeight));
    
    // 更新位置
    if (dragElement.type === 'shuttlecock') {
      this.setData({
        shuttlecock: { x: newX, y: newY }
      });
    } else if (dragElement.type === 'player') {
      const playersKey = dragElement.team === 'A' ? 'playersA' : 'playersB';
      const players = this.data[playersKey];
      const playerIndex = players.findIndex(p => p.id == dragElement.id);
      
      if (playerIndex !== -1) {
        players[playerIndex].x = newX;
        players[playerIndex].y = newY;
        this.setData({
          [playersKey]: players
        });
      }
    }
  },

  // 元素触摸结束
  onElementTouchEnd() {
    this.setData({
      isDragging: false,
      dragElement: null
    });
  },

  // Canvas触摸事件（支持手绘和元素操作）
  onCanvasTouchStart(e) {
    const touch = e.touches[0];
    const { isDrawing } = this.data;
    
    if (isDrawing) {
      // 手绘模式：获取精确的Canvas坐标
      this.getCanvasPosition(touch, (canvasX, canvasY) => {
        this.setData({
          currentPath: [{ x: canvasX, y: canvasY }]
        });
        console.log('开始手绘:', canvasX, canvasY);
      });
    } else {
      // 非手绘模式：处理元素拖拽（保持原有逻辑）
      // 如果没有点击到具体元素，可以在这里处理
    }
  },

  onCanvasTouchMove(e) {
    const touch = e.touches[0];
    const { isDrawing, currentPath } = this.data;
    
    if (isDrawing && currentPath) {
      // 手绘模式：继续绘制路径
      this.getCanvasPosition(touch, (canvasX, canvasY) => {
        const newPath = [...currentPath, { x: canvasX, y: canvasY }];
        this.setData({
          currentPath: newPath
        });
        
        // 实时绘制
        this.drawCurrentPath();
      });
    }
    // 非手绘模式下的移动事件由元素的触摸事件处理
  },

  // 缓存Canvas位置信息
  cacheCanvasRect() {
    const query = wx.createSelectorQuery().in(this);
    query.select('.court-canvas').boundingClientRect();
    query.exec((res) => {
      if (res[0]) {
        this.setData({
          canvasRect: res[0]
        });
        console.log('Canvas位置缓存完成:', res[0]);
      }
    });
  },

  // 获取精确的Canvas坐标位置（优化版）
  getCanvasPosition(touch, callback) {
    const { canvasRect } = this.data;
    
    if (canvasRect) {
      // 使用缓存的位置信息，提高性能
      const canvasX = touch.clientX - canvasRect.left;
      const canvasY = touch.clientY - canvasRect.top;
      
      // 确保坐标在Canvas范围内
      const clampedX = Math.max(0, Math.min(canvasX, canvasRect.width));
      const clampedY = Math.max(0, Math.min(canvasY, canvasRect.height));
      
      callback(clampedX, clampedY);
    } else {
      // 如果没有缓存，实时获取
      const query = wx.createSelectorQuery().in(this);
      query.select('.court-canvas').boundingClientRect();
      query.exec((res) => {
        if (res[0]) {
          const rect = res[0];
          const canvasX = touch.clientX - rect.left;
          const canvasY = touch.clientY - rect.top;
          
          const clampedX = Math.max(0, Math.min(canvasX, rect.width));
          const clampedY = Math.max(0, Math.min(canvasY, rect.height));
          
          callback(clampedX, clampedY);
        } else {
          // 如果获取失败，使用直接坐标
          callback(touch.clientX, touch.clientY);
        }
      });
    }
  },

  onCanvasTouchEnd(e) {
    const { isDrawing, currentPath, drawingPaths } = this.data;
    
    if (isDrawing && currentPath && currentPath.length > 1) {
      // 手绘模式：完成路径绘制
      const newPaths = [...drawingPaths, currentPath];
      this.setData({
        drawingPaths: newPaths,
        currentPath: null
      });
      
      console.log('完成手绘路径，当前共', newPaths.length, '条路径');
    } else if (isDrawing) {
      // 清空当前路径
      this.setData({
        currentPath: null
      });
    }
  },

  // 绘制当前正在绘制的路径（实时绘制，不影响场地）
  drawCurrentPath() {
    const { currentPath, courtWidth, courtHeight } = this.data;
    if (!currentPath || currentPath.length < 2 || !courtWidth || !courtHeight) return;
    
    // 创建临时绘制上下文，不影响原有绘制
    const tempCtx = wx.createCanvasContext('badmintonCourt', this);
    
    // 只绘制当前路径，减少不必要的重绘
    tempCtx.setStrokeStyle('#FF4081');
    tempCtx.setLineWidth(3);
    tempCtx.setLineCap('round');
    tempCtx.setLineJoin('round');
    
    tempCtx.beginPath();
    tempCtx.moveTo(currentPath[0].x, currentPath[0].y);
    
    for (let i = 1; i < currentPath.length; i++) {
      tempCtx.lineTo(currentPath[i].x, currentPath[i].y);
    }
    
    tempCtx.stroke();
    tempCtx.draw(true); // 保留之前的绘制内容
  },
});