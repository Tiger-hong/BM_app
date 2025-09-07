// scoreboard.js
Page({
  data: {
    // 队伍信息
    leftTeam: {
      name: 'A',
      score: 0
    },
    rightTeam: {
      name: 'B', 
      score: 0
    },
    
    // 比赛状态
    gameOver: false,
    winner: '',
    
    // 比赛设置
    winningScore: 21, // 获胜分数
    
    // 弹窗状态
    showGameOverModal: false
  },

  onLoad() {
    // 页面加载时的初始化
  },

  onShow() {
    // 页面显示时重置所有数据
    this.setData({
      leftTeam: { name: 'A', score: 0 },
      rightTeam: { name: 'B', score: 0 },
      gameOver: false,
      winner: '',
      showGameOverModal: false,
      winningScore: 21
    });
  },

  // 修改左队队名
  onLeftTeamNameInput(e) {
    const value = e.detail.value.trim() || 'A';
    this.setData({
      'leftTeam.name': value
    });
  },

  // 修改右队队名
  onRightTeamNameInput(e) {
    const value = e.detail.value.trim() || 'B';
    this.setData({
      'rightTeam.name': value
    });
  },

  // 加分
  addScore(e) {
    const { team } = e.currentTarget.dataset;
    const leftTeam = { ...this.data.leftTeam };
    const rightTeam = { ...this.data.rightTeam };
    
    if (team === 'left') {
      leftTeam.score++;
    } else {
      rightTeam.score++;
    }
    
    this.setData({
      leftTeam,
      rightTeam
    });
    
    // 检查是否有队伍获胜
    this.checkGameOver(leftTeam, rightTeam);
  },

  // 减分
  minusScore(e) {
    const { team } = e.currentTarget.dataset;
    const leftTeam = { ...this.data.leftTeam };
    const rightTeam = { ...this.data.rightTeam };
    
    if (team === 'left' && leftTeam.score > 0) {
      leftTeam.score--;
    } else if (team === 'right' && rightTeam.score > 0) {
      rightTeam.score--;
    }
    
    this.setData({
      leftTeam,
      rightTeam
    });
  },

  // 检查比赛是否结束
  checkGameOver(leftTeam, rightTeam) {
    const winningScore = this.data.winningScore;
    let winner = '';
    let gameOver = false;
    
    // 基本获胜条件：达到获胜分数且领先2分以上
    if (leftTeam.score >= winningScore && leftTeam.score - rightTeam.score >= 2) {
      winner = leftTeam.name;
      gameOver = true;
    } else if (rightTeam.score >= winningScore && rightTeam.score - leftTeam.score >= 2) {
      winner = rightTeam.name;
      gameOver = true;
    }
    
    // 特殊情况：任一队伍达到30分即获胜（防止无限延长）
    if (leftTeam.score >= 30) {
      winner = leftTeam.name;
      gameOver = true;
    } else if (rightTeam.score >= 30) {
      winner = rightTeam.name;
      gameOver = true;
    }
    
    if (gameOver) {
      this.setData({
        gameOver: true,
        winner: winner,
        showGameOverModal: true
      });
      
      // 播放获胜提示音
      // wx.showToast({
      //   title: `${winner} 获胜！`,
      //   icon: 'success',
      //   duration: 2000
      // });
    }
  },

  // 开始比赛（重置所有数据）
  startNewGame() {
    this.setData({
      leftTeam: { name: 'A', score: 0 },
      rightTeam: { name: 'B', score: 0 },
      gameOver: false,
      winner: '',
      showGameOverModal: false
    });
    
    // wx.showToast({
    //   title: '比赛开始',
    //   icon: 'success',
    //   duration: 1500
    // });
  },

  // 关闭比赛结束弹窗
  closeGameOverModal() {
    this.setData({
      showGameOverModal: false
    });
  },

  // 从比赛结束弹窗开始新比赛
  startNewGameFromModal() {
    this.setData({
      leftTeam: { name: 'A', score: 0 },
      rightTeam: { name: 'B', score: 0 },
      gameOver: false,
      winner: '',
      showGameOverModal: false
    });
    
    // wx.showToast({
    //   title: '新比赛开始',
    //   icon: 'success'
    // });
  }
});