// pages/edit-log/edit-log.js
const dataService = require('../../utils/dataService.js');
const util = require('../../utils/util.js');

Page({
  data: {
    log: null,
    categories: [],
    selectedCategoryId: '',
    note: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    durationText: '计算中...',
    loading: true
  },

  onLoad: function(options) {
    const logId = options.id;
    if (!logId) {
      wx.showToast({
        title: '记录ID无效',
        icon: 'none'
      });
      wx.navigateBack();
      return;
    }

    this.loadData(logId);
  },

  loadData: function(logId) {
    // 获取记录详情
    const log = dataService.getLogById(logId);
    if (!log) {
      wx.showToast({
        title: '找不到该记录',
        icon: 'none'
      });
      wx.navigateBack();
      return;
    }

    // 获取所有类别
    const categories = dataService.getCategories();

    // 格式化日期和时间
    const startDateTime = new Date(log.startTime);
    const endDateTime = new Date(log.endTime);

    const startDate = util.formatDate(startDateTime);
    const startTime = util.formatClock(startDateTime);
    const endDate = util.formatDate(endDateTime);
    const endTime = util.formatClock(endDateTime);

    // 计算持续时间文本
    const durationText = util.formatDuration(log.endTime - log.startTime);

    this.setData({
      log,
      categories,
      selectedCategoryId: log.category.id,
      note: log.note || '',
      startDate,
      startTime,
      endDate,
      endTime,
      durationText,
      loading: false
    });
  },

  // 选择类别
  onCategoryChange: function(e) {
    this.setData({
      selectedCategoryId: e.detail.value
    });
  },

  // 输入备注
  onNoteInput: function(e) {
    this.setData({
      note: e.detail.value
    });
  },

  // 选择开始日期
  onStartDateChange: function(e) {
    this.setData({
      startDate: e.detail.value
    });
    this.updateDurationText();
  },

  // 选择开始时间
  onStartTimeChange: function(e) {
    this.setData({
      startTime: e.detail.value
    });
    this.updateDurationText();
  },

  // 选择结束日期
  onEndDateChange: function(e) {
    this.setData({
      endDate: e.detail.value
    });
    this.updateDurationText();
  },

  // 选择结束时间
  onEndTimeChange: function(e) {
    this.setData({
      endTime: e.detail.value
    });
    this.updateDurationText();
  },
  
  // 更新持续时间文本
  updateDurationText: function() {
    const { startDate, startTime, endDate, endTime } = this.data;
    
    // 构建开始和结束时间
    const startDateTime = new Date(`${startDate} ${startTime}`);
    const endDateTime = new Date(`${endDate} ${endTime}`);
    
    // 验证时间
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      this.setData({
        durationText: '无效时间'
      });
      return;
    }
    
    if (startDateTime >= endDateTime) {
      this.setData({
        durationText: '结束需晚于开始'
      });
      return;
    }
    
    // 计算持续时间
    const duration = endDateTime.getTime() - startDateTime.getTime();
    const durationText = util.formatDuration(duration);
    
    this.setData({
      durationText
    });
  },
  
  // 快速设置时间
  setQuickTime: function(e) {
    const option = e.currentTarget.dataset.option;
    const now = new Date();
    
    switch(option) {
      case '15min':
        // 结束时间+15分钟
        this.addMinutesToEnd(15);
        break;
      case '30min':
        // 结束时间+30分钟
        this.addMinutesToEnd(30);
        break;
      case '1hour':
        // 结束时间+1小时
        this.addMinutesToEnd(60);
        break;
      case 'today':
        // 设置为今天的时间范围
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 0, 0);
        
        this.setData({
          startDate: util.formatDate(todayStart),
          startTime: '00:00',
          endDate: util.formatDate(todayEnd),
          endTime: '23:59'
        });
        this.updateDurationText();
        break;
    }
  },
  
  // 给结束时间添加分钟
  addMinutesToEnd: function(minutes) {
    const { endDate, endTime } = this.data;
    const endDateTime = new Date(`${endDate} ${endTime}`);
    
    if (isNaN(endDateTime.getTime())) {
      // 如果结束时间无效，使用当前时间
      const now = new Date();
      endDateTime.setTime(now.getTime());
    }
    
    // 添加分钟
    endDateTime.setMinutes(endDateTime.getMinutes() + minutes);
    
    // 更新结束时间
    this.setData({
      endDate: util.formatDate(endDateTime),
      endTime: util.formatClock(endDateTime)
    });
    
    this.updateDurationText();
  },

  // 保存记录
  saveLog: function() {
    const { log, selectedCategoryId, note, startDate, startTime, endDate, endTime } = this.data;

    // 验证输入
    if (!selectedCategoryId) {
      wx.showToast({
        title: '请选择类别',
        icon: 'none'
      });
      return;
    }

    // 构建开始和结束时间
    const startDateTime = new Date(`${startDate} ${startTime}`);
    const endDateTime = new Date(`${endDate} ${endTime}`);

    // 验证时间
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      wx.showToast({
        title: '日期或时间格式无效',
        icon: 'none'
      });
      return;
    }

    if (startDateTime >= endDateTime) {
      wx.showToast({
        title: '结束时间必须晚于开始时间',
        icon: 'none'
      });
      return;
    }

    // 获取选中的类别
    const selectedCategory = this.data.categories.find(c => c.id === selectedCategoryId);
    if (!selectedCategory) {
      wx.showToast({
        title: '所选类别无效',
        icon: 'none'
      });
      return;
    }

    // 更新记录
    const updatedLog = {
      ...log,
      category: selectedCategory,
      note,
      startTime: startDateTime.getTime(),
      endTime: endDateTime.getTime(),
      duration: endDateTime.getTime() - startDateTime.getTime()
    };

    dataService.updateLog(updatedLog);

    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });

    // 返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  // 删除记录
  deleteLog: function() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？此操作不可撤销。',
      confirmColor: '#FF4D4F',
      success: res => {
        if (res.confirm) {
          dataService.deleteLog(this.data.log.id);
          wx.showToast({
            title: '已删除',
            icon: 'success'
          });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      }
    });
  }
});