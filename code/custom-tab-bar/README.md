# 自定义 TabBar 实现说明

## 🎯 功能特点

### 球馆图标凸起效果
- ✅ 球馆图标比其他图标更大（50px vs 27px）
- ✅ 圆形渐变背景（紫色到粉色）
- ✅ 白色边框和阴影效果
- ✅ 向上凸起 20px，营造立体感
- ✅ 弹跳动画效果

### 视觉差异化
- **首页/地图图标**：27px × 27px，标准大小
- **球馆图标**：50px × 50px，突出显示
- **背景效果**：渐变圆形背景 + 阴影
- **动画效果**：页面加载时的弹跳动画

## 📁 文件结构

```
custom-tab-bar/
├── index.js      # 组件逻辑
├── index.json    # 组件配置
├── index.wxml    # 组件模板
└── index.wxss    # 组件样式
```

## 🎨 样式设计

### 普通图标样式
```css
.tab-bar-item-icon {
  width: 27px;
  height: 27px;
  margin-bottom: 2px;
}
```

### 球馆凸起图标样式
```css
.tab-bar-item-icon-raised {
  width: 50px;
  height: 50px;
  position: relative;
  margin-bottom: -10px;
  margin-top: -20px;
}

.raised-bg {
  background: linear-gradient(135deg, #9f2995 0%, #e91e63 100%);
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(159, 41, 149, 0.3);
  border: 3px solid white;
}
```

## 🔧 技术实现

### 1. 自定义 TabBar 组件
- 使用微信小程序的自定义 tabBar 功能
- 在 `app.json` 中设置 `"custom": true`
- 创建 `custom-tab-bar` 组件目录

### 2. 条件渲染
```xml
<!-- 普通图标 -->
<view wx:if="{{index !== 1}}" class="tab-bar-item-icon">
  <image src="{{selected === index ? item.selectedIconPath : item.iconPath}}"></image>
</view>

<!-- 球馆凸起图标 -->
<view wx:else class="tab-bar-item-icon-raised">
  <view class="raised-bg"></view>
  <image src="{{selected === index ? item.selectedIconPath : item.iconPath}}"></image>
</view>
```

### 3. 状态同步
每个页面的 `onShow` 方法中更新 tabBar 选中状态：
```javascript
onShow() {
  if (typeof this.getTabBar === 'function' && this.getTabBar()) {
    this.getTabBar().setData({
      selected: 1 // 球馆页面为 1
    });
  }
}
```

## 🎭 动画效果

### 弹跳动画
```css
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-4px);
  }
  60% {
    transform: translateY(-2px);
  }
}
```

## 📱 适配说明

### 安全区域适配
```css
.tab-bar {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### 不同屏幕尺寸
- 使用 `flex: 1` 确保图标均匀分布
- 相对定位确保凸起效果在所有设备上一致

## 🎯 使用效果

1. **首页图标**：标准大小，灰色/紫色切换
2. **球馆图标**：大尺寸凸起，渐变背景，突出显示
3. **地图图标**：标准大小，灰色/紫色切换

## ⚠️ 注意事项

1. **图标文件**：需要准备对应的 PNG 图标文件
2. **路径配置**：确保图标路径正确
3. **状态同步**：每个页面都需要添加 `onShow` 方法
4. **性能优化**：避免频繁的 setData 操作

## 🚀 扩展建议

1. **更多动画**：可以添加点击时的缩放动画
2. **徽章功能**：在球馆图标上显示消息数量
3. **主题切换**：支持深色/浅色主题
4. **个性化**：允许用户自定义 tabBar 样式