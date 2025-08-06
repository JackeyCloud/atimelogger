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
    loading: true,
    minDate: '', // 最小可选日期
    maxDate: '', // 最大可选日期（今天）
    maxTime: '', // 最大可选时间（当前时间，仅当选择今天时）
    startMaxTime: '23:59', // 开始时间的最大值
    endMaxTime: '23:59'    // 结束时间的最大值
  },

  // 检查是否为未来日期
  isFutureDate: function(dateString) {
    console.log('检查日期:', dateString);
    
    const selectedDate = new Date(dateString + ' 00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 重置时间到当天开始
    
    console.log('选择的日期:', selectedDate);
    console.log('今天日期:', today);
    console.log('是否为未来:', selectedDate > today);
    
    return selectedDate > today;
  },
  
  // 检查是否为未来时间（仅在选择今天时使用）
  isFutureTime: function(timeString) {
    console.log('检查时间:', timeString);
    
    const now = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    const selectedTime = new Date();
    selectedTime.setHours(hours, minutes, 0, 0);
    
    console.log('选择的时间:', selectedTime);
    console.log('当前时间:', now);
    console.log('是否为未来时间:', selectedTime > now);
    
    return selectedTime > now;
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

    // 设置最大日期和时间（当前时间）
    this.setMaxDateTime();
    
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
    
    // 初始化时间选择器的限制
    this.updateTimePickerLimits('start', startDate);
    this.updateTimePickerLimits('end', endDate);
    
    console.log('页面加载完成，时间限制已设置:', {
      startDate: startDate,
      endDate: endDate,
      maxDate: this.data.maxDate,
      maxTime: this.data.maxTime
    });
  },

  // 设置最大日期和时间
  setMaxDateTime: function() {
    const now = new Date();
    const maxDate = util.formatDate(now);
    const maxTime = util.formatClock(now);
    
    // 设置一个很早的开始日期（比如2020年）
    const minDate = '2020-01-01';
    
    this.setData({
      maxDate: maxDate,
      maxTime: maxTime,
      minDate: minDate
    });
    
    console.log('设置日期范围:', {
      minDate: minDate,
      maxDate: maxDate,
      maxTime: maxTime
    });
  },

  // 更新时间选择器的限制
  updateTimePickerLimits: function(type, selectedDate) {
    const isToday = selectedDate === this.data.maxDate;
    
    if (type === 'start') {
      this.setData({
        startMaxTime: isToday ? this.data.maxTime : '23:59'
      });
    } else if (type === 'end') {
      this.setData({
        endMaxTime: isToday ? this.data.maxTime : '23:59'
      });
    }
    
    console.log('更新时间限制:', {
      type: type,
      selectedDate: selectedDate,
      isToday: isToday,
      startMaxTime: this.data.startMaxTime,
      endMaxTime: this.data.endMaxTime
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
    const selectedDate = e.detail.value;
    console.log('选择开始日期:', selectedDate);
    
    // 检查是否选择了未来日期
    if (this.isFutureDate(selectedDate)) {
      wx.showModal({
        title: '日期限制',
        content: '不能选择未来日期，已自动调整为今天',
        showCancel: false,
        confirmText: '确定'
      });
      
      // 强制重置为今天的日期
      const todayDate = this.data.maxDate;
      this.setData({
        startDate: todayDate
      });
      
      // 更新时间选择器的限制
      this.updateTimePickerLimits('start', todayDate);
      this.updateDurationText();
      return;
    }
    
    this.setData({
      startDate: selectedDate
    });
    
    // 更新时间选择器的限制
    this.updateTimePickerLimits('start', selectedDate);
    this.updateDurationText();
  },

  // 选择开始时间
  onStartTimeChange: function(e) {
    const selectedTime = e.detail.value;
    console.log('选择开始时间:', selectedTime, '当前日期:', this.data.startDate);
    
    // 如果选择的是今天，检查是否为未来时间
    if (this.data.startDate === this.data.maxDate && this.isFutureTime(selectedTime)) {
      wx.showModal({
        title: '时间限制',
        content: '不能选择未来时间，已自动调整为当前时间',
        showCancel: false,
        confirmText: '确定'
      });
      
      // 强制重置为当前时间
      const currentTime = this.data.maxTime;
      this.setData({
        startTime: currentTime
      });
      this.updateDurationText();
      return;
    }
    
    this.setData({
      startTime: selectedTime
    });
    this.updateDurationText();
  },

  // 选择结束日期
  onEndDateChange: function(e) {
    const selectedDate = e.detail.value;
    console.log('选择结束日期:', selectedDate);
    
    // 检查是否选择了未来日期
    if (this.isFutureDate(selectedDate)) {
      wx.showModal({
        title: '日期限制',
        content: '不能选择未来日期，已自动调整为今天',
        showCancel: false,
        confirmText: '确定'
      });
      
      // 强制重置为今天的日期
      const todayDate = this.data.maxDate;
      this.setData({
        endDate: todayDate
      });
      
      // 更新时间选择器的限制
      this.updateTimePickerLimits('end', todayDate);
      this.updateDurationText();
      return;
    }
    
    this.setData({
      endDate: selectedDate
    });
    
    // 更新时间选择器的限制
    this.updateTimePickerLimits('end', selectedDate);
    this.updateDurationText();
  },

  // 选择结束时间
  onEndTimeChange: function(e) {
    const selectedTime = e.detail.value;
    console.log('选择结束时间:', selectedTime, '当前日期:', this.data.endDate);
    
    // 如果选择的是今天，检查是否为未来时间
    if (this.data.endDate === this.data.maxDate && this.isFutureTime(selectedTime)) {
      wx.showModal({
        title: '时间限制',
        content: '不能选择未来时间，已自动调整为当前时间',
        showCancel: false,
        confirmText: '确定'
      });
      
      // 强制重置为当前时间
      const currentTime = this.data.maxTime;
      this.setData({
        endTime: currentTime
      });
      this.updateDurationText();
      return;
    }
    
    this.setData({
      endTime: selectedTime
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
        // 设置为今天的时间范围，但结束时间不能超过当前时间
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now); // 使用当前时间作为结束时间
        
        this.setData({
          startDate: util.formatDate(todayStart),
          startTime: '00:00',
          endDate: util.formatDate(todayEnd),
          endTime: util.formatClock(todayEnd) // 使用当前时间
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
    
    // 检查是否超过当前时间
    const now = new Date();
    if (endDateTime > now) {
      wx.showModal({
        title: '时间限制',
        content: '不能设置未来时间，已自动调整为当前时间',
        showCancel: false,
        confirmText: '确定'
      });
      
      // 强制设置为当前时间
      endDateTime.setTime(now.getTime());
    }
    
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

    // 验证不能为未来时间
    const now = new Date();
    if (startDateTime > now) {
      wx.showModal({
        title: '时间限制',
        content: '开始时间不能为未来时间，请重新选择',
        showCancel: false,
        confirmText: '确定'
      });
      return;
    }

    if (endDateTime > now) {
      wx.showModal({
        title: '时间限制',
        content: '结束时间不能为未来时间，请重新选择',
        showCancel: false,
        confirmText: '确定'
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