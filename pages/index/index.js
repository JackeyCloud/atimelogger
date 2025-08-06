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
    iconCategories: [
      {
        name: '工作学习',
        icon: '💼',
        icons: ['💼', '📚', '📖', '📝', '💻', '📱', '🖥️', '⌨️', '🖱️', '📊', '📈', '📉', '💡', '🔍', '📋', '📌', '📎', '✏️', '🖊️', '🖋️']
      },
      {
        name: '运动健康',
        icon: '🏃',
        icons: ['🏃', '🚴', '🏊', '🧘', '💪', '🤸', '🏋️', '⚽', '🏀', '🎾', '🏓', '🏸', '🥊', '🤺', '🏹', '🎯', '⛳', '🏆', '🥇', '💊']
      },
      {
        name: '生活日常',
        icon: '🏠',
        icons: ['🏠', '🛏️', '🚿', '🧹', '🧽', '🧴', '🧻', '🛒', '🍽️', '🍳', '☕', '🍵', '🥤', '🧊', '🔧', '🔨', '🪚', '🧰', '🔑', '🗝️']
      },
      {
        name: '娱乐休闲',
        icon: '🎮',
        icons: ['🎮', '🎬', '🎭', '🎪', '🎨', '🎵', '🎶', '🎤', '🎸', '🎹', '🥁', '🎺', '📷', '📸', '🎥', '📹', '📺', '📻', '🎧', '🎲']
      },
      {
        name: '交通出行',
        icon: '🚗',
        icons: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '✈️', '🚁']
      },
      {
        name: '食物饮品',
        icon: '🍔',
        icons: ['🍔', '🍕', '🌭', '🥪', '🌮', '🌯', '🥙', '🧆', '🥘', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🦞', '🦀']
      },
      {
        name: '自然动物',
        icon: '🌱',
        icons: ['🌱', '🌿', '🍀', '🌸', '🌺', '🌻', '🌹', '🌷', '🌾', '🌳', '🌲', '🍃', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼']
      },
      {
        name: '符号标志',
        icon: '⭐',
        icons: ['⭐', '⚡', '🔥', '💧', '❄️', '☀️', '🌙', '⭐', '🌟', '✨', '💖', '💝', '🎁', '🎈', '🎉', '🎊', '🏆', '🥇', '🏅', '🔔']
      },
      {
        name: '表情情绪',
        icon: '😊',
        icons: ['😴', '😊', '😍', '🤔', '😎', '🤩', '😴', '😇', '🥰', '😘', '😋', '🤤', '😌', '😪', '🤯', '🥳', '🤗', '🤭', '😉', '😁']
      },
      {
        name: '人物活动',
        icon: '👥',
        icons: ['👥', '👤', '👨‍💻', '👩‍💻', '👨‍🍳', '👩‍🍳', '👨‍🎨', '👩‍🎨', '👨‍🏫', '👩‍🏫', '👨‍⚕️', '👩‍⚕️', '👨‍🔧', '👩‍🔧', '👶', '🧒', '👦', '👧', '🧑', '👨']
      }
    ],
    selectedIconCategory: 0, // 当前选中的图标分类索引
    showAddToMPTip: true,
    showAddToDesktopTip: false,
    showFeatureCarousel: false,
    // 预设时长相关
    usePresetDuration: false, // 是否使用预设时长
    showPresetDuration: false, // 是否显示预设时长选择器
    selectedPreset: 25, // 默认选择25分钟
    customDuration: '', // 自定义时长
    showCustomDurationInput: false, // 是否显示自定义时长输入框
    isCustomSelected: false, // 是否选中自定义选项
    customDisplayText: '自定义', // 自定义选项显示文本

    selectedCategoryId: null, // 当前选中的类别ID
    countdownMode: false, // 是否为倒计时模式
    endTime: null, // 倒计时结束时间
    presetTimeEnded: false, // 预设时间是否已结束
    // 预设备注相关
    usePresetNote: false, // 是否使用预设备注
    showPresetNoteModal: false, // 是否显示预设备注输入框
    presetNote: '', // 预设备注内容
    
    // 拖拽排序相关
    isDragging: false,              // 是否处于拖拽模式
    draggedIndex: -1,               // 被拖拽的元素索引
    dragOverIndex: -1,              // 拖拽悬停的目标索引
    longPressTimer: null            // 长按定时器
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
    
    // 恢复预设设置
    const usePresetDuration = wx.getStorageSync('usePresetDuration') || false;
    const usePresetNote = wx.getStorageSync('usePresetNote') || false;
    this.setData({
      usePresetDuration: usePresetDuration,
      usePresetNote: usePresetNote
    });
    
    // 检查是否需要显示拖拽排序功能介绍
    this.checkFirstTimeDragTip();
    
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
    
    // 初始化自定义选项状态
    this.updateCustomStatus();
  },

  onShow: function() {
    // 每次页面显示时重新加载数据，确保数据最新
    // loadData() 函数已经包含了所有状态检查和计时器管理逻辑
    this.loadData();
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
      // 立即更新时间显示，使用累计时间模式
      const accumulatedTime = activeRecord.accumulatedTime || 0;
      const currentSessionTime = Date.now() - activeRecord.startTime;
      const totalDuration = accumulatedTime + currentSessionTime;
      this.setData({
        timerDisplay: util.formatTimer(totalDuration)
      });
      this.startTimer();
    } else if (pausedRecord) {
      // 如果有暂停的记录，显示暂停时的固定时间（不应该动态计算）
      // 使用pausedRecord对象中已经计算好的duration值
      const duration = pausedRecord.duration || 0;
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
    
    // 检查是否有正在进行的记录（活动或暂停状态）
    if (this.data.activeRecord || this.data.pausedRecord) {
      const currentRecord = this.data.activeRecord || this.data.pausedRecord;
      const currentCategoryName = currentRecord.category.name;
      const recordState = this.data.activeRecord ? '进行中' : '已暂停';
      
      wx.showModal({
        title: '切换记录确认',
        content: `当前正在记录"${currentCategoryName}"(${recordState})，切换到"${category.name}"将自动结束当前记录。是否继续？`,
        confirmText: '确定切换',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 用户确认切换，执行实际的开始记录逻辑
            this.doStartRecord(category, categoryId);
          }
          // 用户取消则什么都不做
        }
      });
    } else {
      // 没有进行中的记录，直接开始
      this.doStartRecord(category, categoryId);
    }
  },

  // 实际执行开始记录的逻辑
  doStartRecord: function(category, categoryId) {
    // 优先级：预设时长 > 预设备注 > 直接开始
    if (this.data.usePresetDuration) {
      // 使用预设时长，显示预设时长选择器
      // 需要构造事件对象传递给showPresetForCategory
      const e = {
        currentTarget: {
          dataset: { id: categoryId }
        }
      };
      this.showPresetForCategory(e);
    } else if (this.data.usePresetNote) {
      // 仅使用预设备注，显示备注输入框
      this.setData({
        selectedCategoryId: categoryId
      });
      this.showPresetNoteModal();
    } else {
      // 直接开始记录，不使用任何预设功能
      const record = dataService.startRecord(category);
      
      this.setData({
        activeRecord: record,
        countdownMode: false, // 确保不使用倒计时模式
        endTime: null, // 清除可能存在的结束时间
        presetTimeEnded: false // 重置预设时间结束状态
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
    let recordId = null;
    
    // 检查是否有活动记录
    if (this.data.activeRecord) {
      recordId = this.data.activeRecord.id;
    } 
    // 检查是否有暂停记录
    else if (this.data.pausedRecord) {
      recordId = this.data.pausedRecord.id;
    }
    
    if (!recordId) {
      console.log('没有找到可停止的记录');
      return;
    }
    
    console.log('停止记录:', recordId);
    
    // 停止记录
    const record = dataService.stopRecord(recordId);
    
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
    
    // 更新状态 - 使用回调确保状态更新完成后再启动计时器
    this.setData({
      isPaused: false,
      activeRecord: record
    }, () => {
      // 在状态更新完成后启动计时器
      this.startTimer();
    });
    
    // 显示提示
    wx.showToast({
      title: '已恢复',
      icon: 'success'
    });
  },

  // 更新计时器显示
  updateTimerDisplay: function() {
    if (!this.data.activeRecord) return;
    
    // 如果处于暂停状态或预设时间已结束，不更新显示
    if (this.data.isPaused || this.data.presetTimeEnded) return;
    
    if (this.data.countdownMode && this.data.endTime) {
      // 倒计时模式
      const remaining = Math.max(0, this.data.endTime - Date.now());
      this.setData({
        timerDisplay: util.formatTimer(remaining)
      });
      
      // 如果倒计时结束，停止在预设时间，等待用户选择
      if (remaining === 0) {
        // 计算预设时间总长度
        const originalStartTime = this.data.activeRecord.startTime - (this.data.activeRecord.accumulatedTime || 0);
        const presetDuration = this.data.endTime - originalStartTime;
        
        this.setData({
          timerDisplay: util.formatTimer(presetDuration),
          countdownMode: false,
          presetTimeEnded: true // 标记预设时间已结束
        });
      }
    } else {
      // 正常计时模式 - 计算累计时间
      const accumulatedTime = this.data.activeRecord.accumulatedTime || 0;
      const currentSessionTime = Date.now() - this.data.activeRecord.startTime;
      const totalDuration = accumulatedTime + currentSessionTime;
      this.setData({
        timerDisplay: util.formatTimer(totalDuration)
      });
    }
  },

  // 启动计时器
  startTimer: function() {
    // 如果处于暂停状态，不启动计时器
    if (this.data.isPaused) return;
    
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
        icon: this.data.iconCategories[0].icons[0]
      },
      selectedIconCategory: 0 // 重置为第一个分类
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
  
  // 切换图标分类
  switchIconCategory: function(e) {
    const categoryIndex = e.currentTarget.dataset.index;
    this.setData({
      selectedIconCategory: categoryIndex
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
    
    // 检查预设时长是否已开启
    if (!this.data.usePresetDuration) {
      wx.showToast({
        title: '请先开启预设时长功能',
        icon: 'none'
      });
      return;
    }
    
    console.log('准备显示预设时长选择器，类别ID:', categoryId);
    
    // 分步设置状态，确保兼容性
    this.setData({
      selectedCategoryId: categoryId,
      showCustomDurationInput: false
    });
    
    // 使用setTimeout确保状态更新后再显示选择器
    setTimeout(() => {
      this.setData({
        showPresetDuration: true
      }, () => {
        // 显示成功后的回调
        console.log('预设时长选择器已显示');
        
        // 如果还是没有显示，显示提示
        if (!this.data.showPresetDuration) {
          wx.showModal({
            title: '显示异常',
            content: '预设时长选择器可能未正常显示，请尝试重新点击类别',
            showCancel: false
          });
        }
      });
    }, 100);
  },
  
  // 切换是否使用预设时长
  toggleUsePresetDuration: function() {
    const newUsePresetDuration = !this.data.usePresetDuration;
    
    this.setData({
      usePresetDuration: newUsePresetDuration,
      // 如果关闭预设时长，同时隐藏预设时长选择器
      showPresetDuration: newUsePresetDuration ? this.data.showPresetDuration : false
    });
    
    // 保存设置到本地存储
    wx.setStorageSync('usePresetDuration', newUsePresetDuration);
    
    // 显示提示
    wx.showToast({
      title: newUsePresetDuration ? '已开启预设时长' : '已关闭预设时长',
      icon: 'none'
    });
    
    // 强制触发页面重新渲染，解决某些设备的显示问题
    this.$nextTick && this.$nextTick(() => {
      // 页面重新渲染后的回调
    });
  },

  // 切换是否使用预设备注
  toggleUsePresetNote: function() {
    this.setData({
      usePresetNote: !this.data.usePresetNote
    });
    
    // 保存设置到本地存储
    wx.setStorageSync('usePresetNote', this.data.usePresetNote);
    
    // 显示提示
    wx.showToast({
      title: this.data.usePresetNote ? '已开启预设备注' : '已关闭预设备注',
      icon: 'none'
    });
  },
  
  // 切换预设时长选择器显示状态（主要用于关闭）
  togglePresetDuration: function() {
    this.setData({
      showPresetDuration: false, // 通常用于关闭选择器
      showCustomDurationInput: false,
      selectedCategoryId: null // 清空选中的类别
    });
    
    console.log('预设时长选择器已关闭');
    },

  // 更新自定义选项状态
  updateCustomStatus: function() {
    const presetValues = [25, 45, 60, 5, 15];
    const isCustom = !presetValues.includes(this.data.selectedPreset);
    
    console.log('更新自定义状态 - 开始:', {
      selectedPreset: this.data.selectedPreset,
      presetValues: presetValues,
      isCustom: isCustom
    });
    
    this.setData({
      isCustomSelected: isCustom,
      customDisplayText: isCustom ? `${this.data.selectedPreset}分钟` : '自定义'
    }, () => {
      // setData完成后的回调
      console.log('更新自定义状态 - 完成:', {
        selectedPreset: this.data.selectedPreset,
        isCustomSelected: this.data.isCustomSelected,
        customDisplayText: this.data.customDisplayText
      });
    });
  },

  // 选择预设时长
  selectPreset: function(e) {
    const duration = parseInt(e.currentTarget.dataset.duration);
    this.setData({
      selectedPreset: duration,
      showCustomDurationInput: false
    });
    
    // 更新自定义选项状态
    this.updateCustomStatus();
  },
  
  // 显示自定义时长输入框
  showCustomDurationInput: function() {
    // 预设值列表
    const presetValues = [25, 45, 60, 5, 15];
    // 如果当前值不在预设值中，则是自定义值，在输入框中显示
    const isCustomValue = !presetValues.includes(this.data.selectedPreset);
    const currentValue = isCustomValue ? this.data.selectedPreset.toString() : '';
    
    this.setData({
      showCustomDurationInput: true,
      customDuration: currentValue
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
    
    // 更新自定义选项状态
    this.updateCustomStatus();
  },
  
  // 开始预设时长计时
  startPresetTimer: function() {
    const categoryId = this.data.selectedCategoryId;
    const category = this.data.categories.find(cat => cat.id === categoryId);
    
    if (!category) {
      return;
    }
    
    // 如果同时启用了预设备注，先显示备注输入框
    if (this.data.usePresetNote) {
      this.setData({
        showPresetDuration: false // 隐藏时长选择器
      });
      this.showPresetNoteModal();
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
              // 重要：将预设时间设置为累积时间，避免计入超时部分
              const presetDuration = durationMinutes * 60 * 1000; // 预设时长（毫秒）
              const now = Date.now();
              
              // 更新活动记录的累积时间和开始时间
              const updatedRecord = {
                ...this.data.activeRecord,
                accumulatedTime: presetDuration, // 设置累积时间为预设时长
                startTime: now // 重新设置开始时间为当前时间
              };
              
              // 更新存储中的活动记录
              dataService.updateActiveRecord(updatedRecord);
              
              this.setData({
                activeRecord: updatedRecord,
                countdownMode: false,
                presetTimeEnded: false // 重置预设时间结束状态
              });
              
              console.log('预设时间结束，继续记录:', {
                presetDuration: presetDuration,
                accumulatedTime: updatedRecord.accumulatedTime,
                newStartTime: now
              });
            }
          }
        });
      }
    }, durationMinutes * 60 * 1000);
  },

  // 显示预设备注输入框
  showPresetNoteModal: function() {
    this.setData({
      showPresetNoteModal: true,
      presetNote: '' // 清空之前的备注
    });
  },

  // 隐藏预设备注输入框
  hidePresetNoteModal: function() {
    this.setData({
      showPresetNoteModal: false,
      presetNote: ''
    });
  },

  // 备注输入
  onPresetNoteInput: function(e) {
    this.setData({
      presetNote: e.detail.value
    });
  },

  // 确认预设备注并开始记录
  confirmPresetNote: function() {
    const categoryId = this.data.selectedCategoryId;
    const category = this.data.categories.find(cat => cat.id === categoryId);
    
    if (!category) {
      this.hidePresetNoteModal();
      return;
    }

    // 开始记录
    const record = dataService.startRecord(category);
    
    // 如果有备注，立即保存到记录中
    if (this.data.presetNote.trim()) {
      dataService.updateRecordNote(record.id, this.data.presetNote.trim());
      record.note = this.data.presetNote.trim();
    }
    
    // 隐藏备注模态框
    this.setData({
      showPresetNoteModal: false,
      presetNote: ''
    });
    
    // 检查是否同时启用了预设时长
    if (this.data.usePresetDuration) {
      // 使用预设时长模式
      const durationMinutes = this.data.selectedPreset;
      const endTime = Date.now() + (durationMinutes * 60 * 1000);
      
      this.setData({
        activeRecord: record,
        countdownMode: true,
        endTime: endTime
      });
      
      // 启动计时器
      this.startTimer();
      
      // 显示提示
      const noteText = this.data.presetNote.trim();
      wx.showToast({
        title: `开始${durationMinutes}分钟计时${noteText ? '（已添加备注）' : ''}`,
        icon: 'success'
      });
      
      // 设置定时器，倒计时结束时提醒
      setTimeout(() => {
        if (this.data.activeRecord && this.data.activeRecord.id === record.id) {
          // 多重提醒方式
          this.playNotificationSound(); // 音频提醒
          wx.vibrateLong(); // 震动提醒
          
          // Toast提醒
          wx.showToast({
            title: '⏰ 时间到了！',
            icon: 'none',
            duration: 2000
          });
          
          // 延迟显示操作弹窗，避免与Toast冲突
          setTimeout(() => {
            wx.showModal({
              title: '🕒 计时结束',
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
          }, 2500);
        }
      }, durationMinutes * 60 * 1000);
    } else {
      // 仅使用备注，正常计时模式
      this.setData({
        activeRecord: record,
        countdownMode: false,
        endTime: null
      });
      
      // 启动计时器
      this.startTimer();
      
      // 显示提示
      wx.showToast({
        title: this.data.presetNote.trim() ? '开始记录（已添加备注）' : '开始记录',
        icon: 'success'
      });
    }
  },
  
  // 防止事件冒泡
  preventBubble: function() {
    // 阻止事件冒泡，不执行任何操作
  },
  
  // 调试预设时长功能状态（点击预设时长文本时调用）
  debugPresetDurationStatus: function() {
    const debugInfo = {
      usePresetDuration: this.data.usePresetDuration,
      showPresetDuration: this.data.showPresetDuration,
      selectedCategoryId: this.data.selectedCategoryId,
      selectedPreset: this.data.selectedPreset,
      showCustomDurationInput: this.data.showCustomDurationInput,
      customDuration: this.data.customDuration
    };
    
    console.log('预设时长功能调试信息:', debugInfo);
    
    wx.showModal({
      title: '预设时长状态',
      content: `预设时长开关: ${debugInfo.usePresetDuration ? '已开启' : '已关闭'}\n选择器显示: ${debugInfo.showPresetDuration ? '已显示' : '未显示'}\n选中类别: ${debugInfo.selectedCategoryId || '无'}\n选中时长: ${debugInfo.selectedPreset || '无'}分钟`,
      showCancel: false,
      confirmText: '知道了'
    });
  },
  
  // 播放提醒音效
  playNotificationSound: function() {
    try {
      // 创建音频上下文
      const innerAudioContext = wx.createInnerAudioContext();
      
      // 设置音频源 - 这里使用一个简单的提示音
      // 注意：实际使用时需要在小程序包中添加音频文件
      // 由于没有具体的音频文件，这里使用系统提示音的替代方案
      
      // 设置音频属性
      innerAudioContext.volume = 0.8; // 音量 0-1
      innerAudioContext.loop = false; // 不循环
      
      // 由于没有音频文件，直接触发播放失败的替代方案
      // 播放失败时的处理 - 使用多次震动作为音频替代
      console.log('使用震动替代音频提醒');
      
      // 模拟铃声节奏的震动
      wx.vibrateShort(); // 第一次震动
      setTimeout(() => {
        wx.vibrateShort(); // 第二次震动
      }, 200);
      setTimeout(() => {
        wx.vibrateShort(); // 第三次震动
      }, 400);
      setTimeout(() => {
        wx.vibrateLong(); // 长震动
      }, 800);
      
    } catch (error) {
      console.log('创建音频上下文失败:', error);
      // 音频功能不可用时，使用多次震动作为替代
      wx.vibrateShort();
      setTimeout(() => {
        wx.vibrateShort();
      }, 300);
      setTimeout(() => {
        wx.vibrateShort();
      }, 600);
    }
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
  },
  
  // 拖拽排序功能
  
  // 长按开始事件
  onCategoryLongPress: function(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    
    // 触发震动反馈
    wx.vibrateShort();
    
    // 进入拖拽模式
    this.setData({
      isDragging: true,
      draggedIndex: index,
      dragOverIndex: -1
    });
    
    // 显示提示
    wx.showToast({
      title: '进入排序模式，点击目标位置',
      icon: 'none',
      duration: 2000
    });
    
    console.log('进入拖拽排序模式，拖拽元素索引:', index);
  },
  
  // 触摸开始事件
  onCategoryTouchStart: function(e) {
    if (!this.data.isDragging) return;
    
    const index = parseInt(e.currentTarget.dataset.index);
    console.log('触摸开始，索引:', index);
  },
  
  // 触摸移动事件
  onCategoryTouchMove: function(e) {
    if (!this.data.isDragging) return;
    
    const index = parseInt(e.currentTarget.dataset.index);
    if (index !== this.data.draggedIndex && index !== this.data.dragOverIndex) {
      this.setData({
        dragOverIndex: index
      });
      
      // 轻微震动反馈
      wx.vibrateShort();
      console.log('拖拽移动到索引:', index);
    }
  },
  
  // 触摸结束事件
  onCategoryTouchEnd: function(e) {
    if (!this.data.isDragging) return;
    
    const index = parseInt(e.currentTarget.dataset.index);
    console.log('触摸结束，索引:', index);
  },
  
  // 在拖拽模式下点击类别（用于选择目标位置）
  onCategoryTapInDragMode: function(e) {
    if (!this.data.isDragging) return;
    
    const targetIndex = parseInt(e.currentTarget.dataset.index);
    const fromIndex = this.data.draggedIndex;
    
    // 如果点击的不是被拖拽的元素，则执行位置交换
    if (targetIndex !== fromIndex) {
      this.swapCategories(fromIndex, targetIndex);
      
      // 震动反馈
      wx.vibrateShort();
      
      wx.showToast({
        title: '位置已交换',
        icon: 'success',
        duration: 1000
      });
    }
    
    // 退出拖拽模式
    this.setData({
      isDragging: false,
      draggedIndex: -1,
      dragOverIndex: -1
    });
    
    console.log(`类别排序完成：${fromIndex} → ${targetIndex}`);
  },
  
  // 交换类别位置
  swapCategories: function(fromIndex, toIndex) {
    console.log(`开始交换类别位置：${fromIndex} <-> ${toIndex}`);
    
    const categories = [...this.data.categories];
    
    // 验证索引有效性
    if (fromIndex < 0 || fromIndex >= categories.length || 
        toIndex < 0 || toIndex >= categories.length) {
      console.error('无效的索引:', fromIndex, toIndex);
      return;
    }
    
    // 直接交换两个位置的元素
    const temp = categories[fromIndex];
    categories[fromIndex] = categories[toIndex];
    categories[toIndex] = temp;
    
    // 更新显示
    this.setData({
      categories: categories
    });
    
    // 保存新的排序到数据服务
    this.saveCategoriesOrder(categories);
    
    console.log(`类别交换完成：位置 ${fromIndex} 和位置 ${toIndex} 已交换`);
    console.log('新的类别顺序:', categories.map(cat => cat.name));
  },
  
  // 保存类别排序
  saveCategoriesOrder: function(categories) {
    try {
      // 更新每个类别的排序值
      const updatedCategories = categories.map((category, index) => ({
        ...category,
        sortOrder: index
      }));
      
      // 保存到本地存储
      wx.setStorageSync('categories', updatedCategories);
      
      // 如果有数据服务的方法，也可以调用
      if (typeof dataService !== 'undefined' && dataService.updateCategoriesOrder) {
        dataService.updateCategoriesOrder(updatedCategories);
      }
      
      console.log('类别排序已保存');
    } catch (error) {
      console.error('保存类别排序失败:', error);
    }
  },
  
  // 重置拖拽状态（取消拖拽）
  cancelDragSort: function() {
    this.setData({
      isDragging: false,
      draggedIndex: -1,
      dragOverIndex: -1
    });
    
    wx.showToast({
      title: '排序已完成',
      icon: 'success'
    });
  },
  
  // 检查是否需要显示首次拖拽提示
  checkFirstTimeDragTip: function() {
    const hasShownDragTip = wx.getStorageSync('hasShownDragTip');
    const categories = this.data.categories || [];
    
    // 如果有超过3个类别且没有显示过提示，则显示
    if (!hasShownDragTip && categories.length > 3) {
      setTimeout(() => {
        wx.showModal({
          title: '💡 小贴士',
          content: '长按类别进入排序模式，然后点击其他类别位置进行交换，将常用类别排在前面更方便使用！',
          showCancel: false,
          confirmText: '知道了',
          success: () => {
            // 标记已显示过提示
            wx.setStorageSync('hasShownDragTip', true);
          }
        });
      }, 3000); // 延迟3秒显示，避免干扰用户正常使用
    }
  }
});