// pages/index/index.js
const dataService = require('../../utils/dataService.js');
const util = require('../../utils/util.js');
const animation = require('../../utils/animation.js');

Page({
  data: {
    categories: [],
    activeRecord: null,
    timerDisplay: '00:00:00',
    timerInterval: null,
    darkMode: false,
    isPaused: false,
    showAddCategoryModal: false,
    newCategory: {
      name: '',
      color: '#3498db',
      icon: '📝'
    },
    colorOptions: ['#3498db', '#2ecc71', '#9b59b6', '#e74c3c', '#f39c12', '#1abc9c', '#e67e22', '#34495e', '#8e44ad', '#16a085', '#d35400', '#c0392b', '#27ae60', '#2980b9', '#f1c40f', '#7f8c8d', '#95a5a6'],
    iconOptions: ['💼', '📚', '😴', '🏃', '🎮', '👥', '🍔', '🚌', '📖', '🛒', '🧹', '🎬', '🚶', '🚿', '📦', '🧘', '📝', '🎵', '🎨', '💻', '📱', '🚗', '✈️', '🏠'],
    showAddToMPTip: true,
    showAddToDesktopTip: false,
    showFeatureCarousel: false,
    // 预设时长相关
    usePresetDuration: false, // 是否使用预设时长
    showPresetDuration: false, // 是否显示预设时长选择器
    selectedPreset: 25, // 默认选择25分钟
    customDuration: '', // 自定义时长
    showCustomDurationInput: false, // 是否显示自定义时长输入框
    selectedCategoryId: null, // 当前选中的类别ID
    countdownMode: false, // 是否为倒计时模式
    endTime: null // 倒计时结束时间
  },

  onLoad: function() {
    // 加载类别和最近记录
    this.loadData();
    
    // 应用当前主题
    const theme = wx.getStorageSync('theme') || 'default';
    const pageThemeClass = `${theme}-theme`;
    this.setData({
      pageThemeClass: pageThemeClass,
      // 初始化动画数据
      categoryAnimationData: [],
      timerAnimationData: animation.createPulseAnimation(2000, 1.03).export()
    });
    
    // 注册全局刷新方法
    const app = getApp();
    app.globalData.refreshCategories = this.loadData.bind(this);
    
    // 为类别添加入场动画
    this.animateCategoriesEntry();
    
    // 检查是否显示引导提示
    const addToMPShown = wx.getStorageSync('guideTip_addToMiniProgram') || false;
    const addToDesktopShown = wx.getStorageSync('guideTip_addToDesktop') || false;
    const featureCarouselShown = wx.getStorageSync('featureCarouselShown') || false;
    
    // 首次使用时显示功能介绍轮播
    if (!featureCarouselShown) {
      this.setData({
        showFeatureCarousel: true,
        showAddToMPTip: false,
        showAddToDesktopTip: false
      });
      
      // 启动轮播自动播放
      setTimeout(() => {
        const featureCarouselComponent = this.selectComponent('#featureCarousel');
        if (featureCarouselComponent) {
          featureCarouselComponent.startAutoplay();
        }
      }, 500);
    }
    // 如果已经看过功能介绍，但还没看过添加到小程序的提示
    else if (!addToMPShown) {
      this.setData({
        showAddToMPTip: true,
        showAddToDesktopTip: false,
        showFeatureCarousel: false
      });
    } 
    // 如果已经看过添加到小程序的提示，但还没看过添加到桌面的提示
    else if (!addToDesktopShown) {
      this.setData({
        showAddToMPTip: false,
        showAddToDesktopTip: true,
        showFeatureCarousel: false
      });
    } else {
      this.setData({
        showAddToMPTip: false,
        showAddToDesktopTip: false,
        showFeatureCarousel: false
      });
    }
  },

  onShow: function() {
    // 每次页面显示时重新加载数据，确保数据最新
    this.loadData();
    
    // 检查是否有活动记录，如果有则立即更新时间显示并启动计时器
    if (this.data.activeRecord) {
      // 立即更新时间显示，避免延迟
      this.updateTimerDisplay();
      this.startTimer();
    }
  },

  onHide: function() {
    // 页面隐藏时清除计时器
    this.clearTimer();
  },

  loadData: function() {
    // 加载所有类别
    const categories = dataService.getCategories();
    
    // 检查是否有活动记录
    const activeRecord = dataService.getActiveRecord();
    
    // 检查是否有暂停的记录
    const pausedRecord = dataService.getPausedRecord();
    
    // 设置当前记录（活动或暂停）
    const currentRecord = pausedRecord || activeRecord;
    const isPaused = !!pausedRecord;
    
    this.setData({
      categories,
      activeRecord: currentRecord,
      isPaused
    });
    
    // 如果有活动记录且未暂停，立即更新时间显示并启动计时器
    if (activeRecord && !isPaused) {
      // 立即更新时间显示，避免延迟
      const duration = Date.now() - activeRecord.startTime;
      this.setData({
        timerDisplay: util.formatTimer(duration)
      });
      this.startTimer();
    } else if (pausedRecord) {
      // 如果有暂停的记录，显示暂停时的时间
      const duration = pausedRecord.pauseTime - pausedRecord.startTime - (pausedRecord.pausedDuration || 0);
      this.setData({
        timerDisplay: util.formatTimer(duration)
      });
      this.clearTimer(); // 确保计时器已停止
    } else {
      this.clearTimer();
      this.setData({
        timerDisplay: '00:00:00'
      });
    }
  },

  // 开始记录时间
  startRecord: function(e) {
    const categoryId = e.currentTarget.dataset.id;
    const category = this.data.categories.find(cat => cat.id === categoryId);
    
    if (!category) {
      return;
    }
    
    // 如果使用预设时长，显示预设时长选择器
    if (this.data.usePresetDuration) {
      this.showPresetForCategory(e);
    } else {
      // 直接开始记录，不使用预设时长
      const record = dataService.startRecord(category);
      
      this.setData({
        activeRecord: record,
        countdownMode: false, // 确保不使用倒计时模式
        endTime: null // 清除可能存在的结束时间
      });
      
      // 启动计时器
      this.startTimer();
      
      // 显示提示
      wx.showToast({
        title: '开始记录',
        icon: 'success'
      });
    }
  },

  // 停止记录时间
  stopRecord: function() {
    if (!this.data.activeRecord) {
      return;
    }
    
    // 停止记录
    const record = dataService.stopRecord(this.data.activeRecord.id);
    
    // 清除计时器
    this.clearTimer();
    
    // 重新加载数据
    this.loadData();
    
    // 显示提示
    wx.showToast({
      title: '记录已保存',
      icon: 'success'
    });
  },
  
  // 暂停记录时间
  pauseRecord: function() {
    if (!this.data.activeRecord || this.data.isPaused) {
      return;
    }
    
    // 暂停记录
    const record = dataService.pauseRecord(this.data.activeRecord.id);
    
    // 清除计时器
    this.clearTimer();
    
    // 更新状态
    this.setData({
      isPaused: true,
      activeRecord: record
    });
    
    // 显示提示
    wx.showToast({
      title: '已暂停',
      icon: 'success'
    });
  },
  
  // 恢复记录时间
  resumeRecord: function() {
    if (!this.data.isPaused) {
      return;
    }
    
    // 恢复记录
    const record = dataService.resumeRecord();
    
    // 更新状态
    this.setData({
      isPaused: false,
      activeRecord: record
    });
    
    // 启动计时器
    this.startTimer();
    
    // 显示提示
    wx.showToast({
      title: '已恢复',
      icon: 'success'
    });
  },

  // 更新计时器显示
  updateTimerDisplay: function() {
    if (!this.data.activeRecord) return;
    
    if (this.data.countdownMode && this.data.endTime) {
      // 倒计时模式
      const remaining = Math.max(0, this.data.endTime - Date.now());
      this.setData({
        timerDisplay: util.formatTimer(remaining)
      });
      
      // 如果倒计时结束，自动切换到正常计时模式
      if (remaining === 0) {
        this.setData({
          countdownMode: false
        });
      }
    } else {
      // 正常计时模式
      const duration = Date.now() - this.data.activeRecord.startTime;
      this.setData({
        timerDisplay: util.formatTimer(duration)
      });
    }
  },

  // 启动计时器
  startTimer: function() {
    // 清除可能存在的计时器
    this.clearTimer();
    
    // 立即更新一次显示
    this.updateTimerDisplay();
    
    // 创建新的计时器，使用更高频率更新以提高响应性
    const timerInterval = setInterval(() => {
      this.updateTimerDisplay();
    }, 500); // 改为500ms更新一次，提高响应性
    
    this.setData({
      timerInterval
    });
  },

  // 清除计时器
  clearTimer: function() {
    if (this.data.timerInterval) {
      clearInterval(this.data.timerInterval);
      this.setData({
        timerInterval: null
      });
    }
  },

  // 显示添加类别弹窗
  showAddCategory: function() {
    // 立即显示弹窗，提高响应速度
    this.setData({
      showAddCategoryModal: true,
      newCategory: {
        name: '',
        color: this.data.colorOptions[0],
        icon: this.data.iconOptions[0]
      }
    });
    
    // 使用nextTick确保UI更新后再执行其他操作
    wx.nextTick(() => {
      // 添加动画效果
      const animation = wx.createAnimation({
        duration: 200,
        timingFunction: 'ease'
      });
      animation.opacity(1).step();
      this.setData({
        animationData: animation.export()
      });
    });
  },
  
  // 关闭弹窗
  closeModal: function() {
    this.setData({
      showAddCategoryModal: false
    });
  },
  
  // 输入类别名称
  inputCategoryName: function(e) {
    this.setData({
      'newCategory.name': e.detail.value
    });
  },
  
  // 选择颜色
  selectColor: function(e) {
    this.setData({
      'newCategory.color': e.currentTarget.dataset.color
    });
  },
  
  // 选择图标
  selectIcon: function(e) {
    this.setData({
      'newCategory.icon': e.currentTarget.dataset.icon
    });
  },
  
  // 保存类别
  saveCategory: function() {
    const { newCategory } = this.data;
    
    // 验证名称
    if (!newCategory.name.trim()) {
      wx.showToast({
        title: '请输入类别名称',
        icon: 'none'
      });
      return;
    }
    
    // 添加新类别
    const category = dataService.addCategory(newCategory);
    
    // 关闭弹窗
    this.setData({
      showAddCategoryModal: false
    });
    
    // 重新加载数据
    this.loadData();
    
    // 显示提示
    wx.showToast({
      title: '添加成功',
      icon: 'success'
    });
  },

  // 查看记录详情
  viewLogDetail: function(e) {
    const logId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/edit-log/edit-log?id=${logId}`
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadData();
    wx.stopPullDownRefresh();
  },
  
  // 关闭添加到小程序的提示
  onAddToMPTipClose: function() {
    this.setData({
      showAddToMPTip: false
    });
    
    // 如果用户还没看过添加到桌面的提示，则显示
    const addToDesktopShown = wx.getStorageSync('guideTip_addToDesktop') || false;
    if (!addToDesktopShown) {
      this.setData({
        showAddToDesktopTip: true
      });
    }
  },
  
  // 关闭添加到桌面的提示
  onAddToDesktopTipClose: function() {
    this.setData({
      showAddToDesktopTip: false
    });
  },
  
  // 关闭功能介绍轮播
  onFeatureCarouselClose: function() {
    this.setData({
      showFeatureCarousel: false
    });
    
    // 显示添加到小程序的提示
    const addToMPShown = wx.getStorageSync('guideTip_addToMiniProgram') || false;
    if (!addToMPShown) {
      this.setData({
        showAddToMPTip: true
      });
    }
  },

  // 预设时长相关方法
  
  // 显示预设时长选择器
  showPresetForCategory: function(e) {
    const categoryId = e.currentTarget.dataset.id;
    this.setData({
      showPresetDuration: true,
      selectedCategoryId: categoryId
    });
  },
  
  // 切换是否使用预设时长
  toggleUsePresetDuration: function() {
    this.setData({
      usePresetDuration: !this.data.usePresetDuration
    });
    
    // 保存设置到本地存储
    wx.setStorageSync('usePresetDuration', this.data.usePresetDuration);
    
    // 显示提示
    wx.showToast({
      title: this.data.usePresetDuration ? '已开启预设时长' : '已关闭预设时长',
      icon: 'none'
    });
  },
  
  // 切换预设时长选择器显示状态
  togglePresetDuration: function() {
    this.setData({
      showPresetDuration: !this.data.showPresetDuration,
      showCustomDurationInput: false
    });
  },
  
  // 选择预设时长
  selectPreset: function(e) {
    const duration = parseInt(e.currentTarget.dataset.duration);
    this.setData({
      selectedPreset: duration,
      showCustomDurationInput: false
    });
  },
  
  // 显示自定义时长输入框
  showCustomDurationInput: function() {
    this.setData({
      showCustomDurationInput: true
    });
  },
  
  // 自定义时长输入
  onCustomDurationInput: function(e) {
    this.setData({
      customDuration: e.detail.value
    });
  },
  
  // 确认自定义时长
  confirmCustomDuration: function() {
    const duration = parseInt(this.data.customDuration);
    if (isNaN(duration) || duration <= 0) {
      wx.showToast({
        title: '请输入有效时长',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      selectedPreset: duration,
      showCustomDurationInput: false
    });
  },
  
  // 开始预设时长计时
  startPresetTimer: function() {
    const categoryId = this.data.selectedCategoryId;
    const category = this.data.categories.find(cat => cat.id === categoryId);
    
    if (!category) {
      return;
    }
    
    // 获取预设时长（分钟）
    const durationMinutes = this.data.selectedPreset;
    
    // 开始记录
    const record = dataService.startRecord(category);
    
    // 只有在启用预设时长的情况下才使用倒计时模式
    if (this.data.usePresetDuration) {
      // 设置倒计时结束时间
      const endTime = Date.now() + (durationMinutes * 60 * 1000);
      
      this.setData({
        activeRecord: record,
        showPresetDuration: false,
        countdownMode: true,
        endTime: endTime
      });
      
      // 显示提示
      wx.showToast({
        title: `开始${durationMinutes}分钟计时`,
        icon: 'success'
      });
    } else {
      // 不使用预设时长，从0开始正计时
      this.setData({
        activeRecord: record,
        showPresetDuration: false,
        countdownMode: false,
        endTime: null
      });
      
      // 显示提示
      wx.showToast({
        title: '开始记录',
        icon: 'success'
      });
    }
    
    // 启动计时器
    this.startTimer();
    
    // 设置定时器，倒计时结束时提醒
    setTimeout(() => {
      if (this.data.activeRecord && this.data.activeRecord.id === record.id) {
        wx.vibrateLong(); // 震动提醒
        
        wx.showModal({
          title: '时间到',
          content: `您设定的${durationMinutes}分钟时间已到，是否结束记录？`,
          confirmText: '结束记录',
          cancelText: '继续记录',
          success: (res) => {
            if (res.confirm) {
              this.stopRecord();
            } else {
              // 继续记录，切换到正常计时模式
              this.setData({
                countdownMode: false
              });
            }
          }
        });
      }
    }, durationMinutes * 60 * 1000);
  },
  
  // 为类别添加入场动画
  animateCategoriesEntry: function() {
    const { categories } = this.data;
    if (!categories || categories.length === 0) return;
    
    // 创建动画数据数组
    const categoryAnimationData = [];
    
    // 为每个类别创建动画，错开执行时间
    categories.forEach((_, index) => {
      setTimeout(() => {
        const slideAnimation = animation.createSlideUpAnimation(300, 30).export();
        
        // 更新指定索引的动画数据
        categoryAnimationData[index] = slideAnimation;
        
        this.setData({
          categoryAnimationData
        });
      }, index * 50); // 每个类别错开50ms
    });
  },
  
  // 按钮点击动画
  onButtonTap: function(e) {
    const index = e.currentTarget.dataset.index;
    const buttonAnimation = animation.createButtonTapAnimation().export();
    
    // 更新指定按钮的动画数据
    const key = `buttonAnimationData[${index}]`;
    this.setData({
      [key]: buttonAnimation
    });
  },
  
  // 卡片悬浮动画
  onCardHover: function(e) {
    const index = e.currentTarget.dataset.index;
    const hoverAnimation = animation.createCardHoverAnimation().export();
    
    // 更新指定卡片的动画数据
    const key = `cardAnimationData[${index}]`;
    this.setData({
      [key]: hoverAnimation
    });
  },
  
  // 卡片恢复动画
  onCardRestore: function(e) {
    const index = e.currentTarget.dataset.index;
    const restoreAnimation = animation.createCardRestoreAnimation().export();
    
    // 更新指定卡片的动画数据
    const key = `cardAnimationData[${index}]`;
    this.setData({
      [key]: restoreAnimation
    });
  }
});