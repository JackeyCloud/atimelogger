// components/feature-carousel/feature-carousel.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentIndex: 0,
    features: [
      {
        title: "欢迎使用大骏极简时间记录",
        description: "这是一款帮助您追踪和管理时间的应用，让您的时间更有价值",
        icon: "👋",
        details: "通过记录不同活动的时间，了解自己的时间分配，提高时间利用效率"
      },
      {
        title: "记录您的时间",
        description: "点击类别开始记录，完成后点击停止记录",
        icon: "⏱️",
        details: "简单直观的操作方式，让您随时随地记录时间，不遗漏每一分钟"
      },
      {
        title: "预设时长功能",
        description: "设定计划时长，支持番茄工作法",
        icon: "🍅",
        details: "25分钟专注工作，5分钟短暂休息，提高工作效率和专注度"
      },
      {
        title: "数据分析",
        description: "查看您的时间分配和趋势",
        icon: "📊",
        details: "通过饼图、趋势图和柱状图，直观了解您的时间使用情况，发现改进空间"
      },
      {
        title: "自定义类别",
        description: "创建和管理您的活动类别",
        icon: "✏️",
        details: "根据个人需求自定义类别，添加颜色和图标，让记录更加个性化"
      }
    ],
    animationData: {}
  },

  lifetimes: {
    attached: function() {
      // 创建动画实例
      this.animation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease',
      });
    },
    
    detached: function() {
      // 清除定时器
      if (this.autoplayTimer) {
        clearInterval(this.autoplayTimer);
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 下一页
    nextSlide() {
      let nextIndex = this.data.currentIndex + 1;
      if (nextIndex >= this.data.features.length) {
        nextIndex = 0;
      }
      this.setData({
        currentIndex: nextIndex
      });
      this.updateAnimation();
    },
    
    // 上一页
    prevSlide() {
      let prevIndex = this.data.currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = this.data.features.length - 1;
      }
      this.setData({
        currentIndex: prevIndex
      });
      this.updateAnimation();
    },
    
    // 点击指示点切换
    goToSlide(e) {
      const index = e.currentTarget.dataset.index;
      this.setData({
        currentIndex: index
      });
      this.updateAnimation();
    },
    
    // 更新动画
    updateAnimation() {
      this.animation.opacity(0).step();
      this.setData({
        animationData: this.animation.export()
      });
      
      setTimeout(() => {
        this.animation.opacity(1).step();
        this.setData({
          animationData: this.animation.export()
        });
      }, 150);
    },
    
    // 开始自动播放
    startAutoplay() {
      this.stopAutoplay(); // 先停止可能存在的定时器
      this.autoplayTimer = setInterval(() => {
        this.nextSlide();
      }, 5000); // 每5秒切换一次
    },
    
    // 停止自动播放
    stopAutoplay() {
      if (this.autoplayTimer) {
        clearInterval(this.autoplayTimer);
        this.autoplayTimer = null;
      }
    },
    
    // 触摸开始事件
    touchStart(e) {
      this.touchStartX = e.touches[0].pageX;
      this.touchStartY = e.touches[0].pageY;
      this.stopAutoplay(); // 触摸时停止自动播放
    },
    
    // 触摸结束事件
    touchEnd(e) {
      const touchEndX = e.changedTouches[0].pageX;
      const touchEndY = e.changedTouches[0].pageY;
      
      // 计算水平和垂直方向的移动距离
      const deltaX = touchEndX - this.touchStartX;
      const deltaY = touchEndY - this.touchStartY;
      
      // 如果水平移动距离大于垂直移动距离，且大于30px，则认为是有效的左右滑动
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
        if (deltaX > 0) {
          // 右滑，显示上一页
          this.prevSlide();
        } else {
          // 左滑，显示下一页
          this.nextSlide();
        }
      }
      
      // 恢复自动播放
      this.startAutoplay();
    },
    
    // 关闭轮播
    onClose() {
      this.stopAutoplay();
      this.setData({
        show: false
      });
      
      // 记录已经显示过
      wx.setStorageSync('featureCarouselShown', true);
      
      this.triggerEvent('close');
    },
    
    // 立即开始使用
    onStart() {
      this.onClose();
    }
  }
})