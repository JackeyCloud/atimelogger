// pages/logs/logs.js
const dataService = require('../../utils/dataService.js');
const util = require('../../utils/util.js');

Page({
  data: {
    logs: [],
    dateGroups: [],
    loading: true,
    isEmpty: false,
    
    // 编辑弹窗相关数据
    showEditModal: false,
    currentLog: null,
    categories: [],
    editingLog: null,
    
    // 时间选择器相关数据
    startDateDisplay: '',
    startTimeDisplay: '',
    endDateDisplay: '',
    endTimeDisplay: '',
    startDateRange: [[], []], // [月份数组, 日期数组]
    startTimeRange: [[], []], // [小时数组, 分钟数组]
    endDateRange: [[], []],
    endTimeRange: [[], []],
    startDateIndex: [0, 0],
    startTimeIndex: [0, 0],
    endDateIndex: [0, 0],
    endTimeIndex: [0, 0],
    
    // 搜索筛选相关数据
    searchText: '',
    showFilters: false,
    selectedCategoryId: 'all',
    dateFilter: 'all',
    activeFiltersCount: 0,
    
    // 原始数据和过滤后的数据
    originalLogs: [],
    filteredLogs: [],
    
    // 自定义日期范围
    customStartDate: '',
    customEndDate: ''
  },

  onLoad: function() {
    this.loadLogs();
    
    // 应用当前主题
    const theme = wx.getStorageSync('theme') || 'default';
    const pageThemeClass = `${theme}-theme`;
    this.setData({
      pageThemeClass: pageThemeClass
    });
  },

  onShow: function() {
    // 每次页面显示时重新加载数据，确保数据最新
    this.loadLogs();
  },

  loadLogs: function() {
    this.setData({ loading: true });
    
    // 获取所有时间记录
    const logs = dataService.getLogs();
    
    // 获取所有类别（用于筛选）
    const categories = dataService.getCategories();
    
    this.setData({
      originalLogs: logs,
      categories: categories,
      loading: false
    });
    
    // 应用当前的搜索和筛选条件
    this.filterAndDisplayLogs();
  },

  groupLogsByDate: function(logs) {
    // 创建一个对象来存储按日期分组的记录
    const groups = {};
    
    logs.forEach(log => {
      // 获取日期字符串（不包含时间）
      const dateStr = util.formatDate(new Date(log.startTime));
      
      // 如果这个日期还没有分组，创建一个新的分组
      if (!groups[dateStr]) {
        groups[dateStr] = {
          date: dateStr,
          dayOfWeek: util.getDayOfWeek(new Date(log.startTime)),
          logs: []
        };
      }
      
      // 将记录添加到对应的日期分组中
      groups[dateStr].logs.push(log);
    });
    
    // 将对象转换为数组并按日期排序（最新的日期在前）
    return Object.values(groups).sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  },


  // 编辑记录
  editLog: function(e) {
    const logId = e.currentTarget.dataset.id;
    const log = dataService.getLogById(logId);
    
    if (log) {
      // 获取所有类别
      const categories = dataService.getCategories();
      
      // 格式化开始和结束时间
      const startDateTime = new Date(log.startTime);
      const endDateTime = new Date(log.endTime);
      
      const startDateDisplay = util.formatMonthDay(startDateTime);
      const startTimeDisplay = util.formatClock(startDateTime);
      const endDateDisplay = util.formatMonthDay(endDateTime);
      const endTimeDisplay = util.formatClock(endDateTime);
      
      // 初始化选择器数据
      this.initPickerRanges();
      
      // 设置当前选中的日期和时间索引
      const startDateIndex = this.getDateIndex(startDateTime);
      const startTimeIndex = this.getTimeIndex(startDateTime);
      const endDateIndex = this.getDateIndex(endDateTime);
      const endTimeIndex = this.getTimeIndex(endDateTime);
      
      this.setData({
        showEditModal: true,
        currentLog: log,
        categories: categories,
        editingLog: {
          id: log.id,
          categoryId: log.category.id,
          note: log.note || ''
        },
        startDateDisplay: startDateDisplay,
        startTimeDisplay: startTimeDisplay,
        endDateDisplay: endDateDisplay,
        endTimeDisplay: endTimeDisplay,
        startDateIndex: startDateIndex,
        startTimeIndex: startTimeIndex,
        endDateIndex: endDateIndex,
        endTimeIndex: endTimeIndex
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
    }
  },
  
  // 关闭编辑弹窗
  closeEditModal: function() {
    this.setData({
      showEditModal: false
    });
  },
  
  // 输入备注
  inputNote: function(e) {
    this.setData({
      'editingLog.note': e.detail.value
    });
  },
  
  // 选择类别
  selectCategory: function(e) {
    const categoryId = e.currentTarget.dataset.id;
    this.setData({
      'editingLog.categoryId': categoryId,
      'selectedCategoryAnimation': true
    });
    
    // 添加选中效果动画
    setTimeout(() => {
      this.setData({
        'selectedCategoryAnimation': false
      });
    }, 300);
    
    // 显示提示
    wx.showToast({
      title: '已选择类别',
      icon: 'none',
      duration: 500
    });
  },
  
  // 保存记录
  saveLog: function() {
    const { 
      editingLog, 
      categories, 
      startDateRange,
      startTimeRange,
      endDateRange,
      endTimeRange,
      startDateIndex,
      startTimeIndex,
      endDateIndex,
      endTimeIndex
    } = this.data;
    
    // 获取选中的类别
    const category = categories.find(cat => cat.id === editingLog.categoryId);
    
    if (!category) {
      wx.showToast({
        title: '请选择类别',
        icon: 'none'
      });
      return;
    }
    
    // 计算新的开始和结束时间
    const currentYear = new Date().getFullYear();
    
    // 获取开始时间
    const startMonth = startDateRange[0][startDateIndex[0]].value;
    const startDay = startDateRange[1][startDateIndex[1]].value;
    const startHour = startTimeRange[0][startTimeIndex[0]].value;
    const startMinute = startTimeRange[1][startTimeIndex[1]].value;
    
    // 获取结束时间
    const endMonth = endDateRange[0][endDateIndex[0]].value;
    const endDay = endDateRange[1][endDateIndex[1]].value;
    const endHour = endTimeRange[0][endTimeIndex[0]].value;
    const endMinute = endTimeRange[1][endTimeIndex[1]].value;
    
    // 创建新的日期对象
    const startDateTime = new Date(currentYear, startMonth - 1, startDay, startHour, startMinute);
    const endDateTime = new Date(currentYear, endMonth - 1, endDay, endHour, endMinute);
    
    // 验证时间逻辑
    if (startDateTime >= endDateTime) {
      wx.showToast({
        title: '结束时间必须晚于开始时间',
        icon: 'none'
      });
      return;
    }
    
    // 更新记录
    dataService.updateLog(editingLog.id, {
      category: category,
      note: editingLog.note,
      startTime: startDateTime.getTime(),
      endTime: endDateTime.getTime(),
      duration: endDateTime.getTime() - startDateTime.getTime()
    });
    
    // 关闭弹窗
    this.setData({
      showEditModal: false
    });
    
    // 重新加载数据
    this.loadLogs();
    
    // 显示提示
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
  },
  
  // 删除记录
  deleteLog: function() {
    const { currentLog } = this.data;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？此操作不可撤销。',
      confirmColor: '#FF4D4F',
      success: res => {
        if (res.confirm) {
          dataService.deleteLog(currentLog.id);
          
          // 关闭弹窗
          this.setData({
            showEditModal: false
          });
          
          // 重新加载数据
          this.loadLogs();
          
          // 显示提示
          wx.showToast({
            title: '已删除',
            icon: 'success'
          });
        }
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadLogs();
    wx.stopPullDownRefresh();
  },

  // 初始化选择器范围数据
  initPickerRanges: function() {
    // 月份范围 (1-12)
    const months = [];
    for (let i = 1; i <= 12; i++) {
      months.push({
        label: util.formatNumber(i) + '月',
        value: i
      });
    }
    
    // 日期范围 (1-31)
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push({
        label: util.formatNumber(i) + '日',
        value: i
      });
    }
    
    // 小时范围 (0-23)
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push({
        label: util.formatNumber(i) + '时',
        value: i
      });
    }
    
    // 分钟范围 (0-59)
    const minutes = [];
    for (let i = 0; i < 60; i++) {
      minutes.push({
        label: util.formatNumber(i) + '分',
        value: i
      });
    }
    
    this.setData({
      startDateRange: [months, days],
      startTimeRange: [hours, minutes],
      endDateRange: [months, days],
      endTimeRange: [hours, minutes]
    });
  },

  // 根据日期获取选择器索引
  getDateIndex: function(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return [month - 1, day - 1]; // 索引从0开始
  },

  // 根据时间获取选择器索引
  getTimeIndex: function(date) {
    const hour = date.getHours();
    const minute = date.getMinutes();
    return [hour, minute];
  },

  // 开始日期选择器变化
  onStartDateMultiChange: function(e) {
    const values = e.detail.value;
    const months = this.data.startDateRange[0];
    const days = this.data.startDateRange[1];
    
    const selectedMonth = months[values[0]];
    const selectedDay = days[values[1]];
    
    if (selectedMonth && selectedDay) {
      const display = util.formatNumber(selectedMonth.value) + '-' + util.formatNumber(selectedDay.value);
      this.setData({
        startDateIndex: values,
        startDateDisplay: display
      });
    }
  },

  // 开始时间选择器变化
  onStartTimeMultiChange: function(e) {
    const values = e.detail.value;
    const hours = this.data.startTimeRange[0];
    const minutes = this.data.startTimeRange[1];
    
    const selectedHour = hours[values[0]];
    const selectedMinute = minutes[values[1]];
    
    if (selectedHour && selectedMinute) {
      const display = util.formatNumber(selectedHour.value) + ':' + util.formatNumber(selectedMinute.value);
      this.setData({
        startTimeIndex: values,
        startTimeDisplay: display
      });
    }
  },

  // 结束日期选择器变化
  onEndDateMultiChange: function(e) {
    const values = e.detail.value;
    const months = this.data.endDateRange[0];
    const days = this.data.endDateRange[1];
    
    const selectedMonth = months[values[0]];
    const selectedDay = days[values[1]];
    
    if (selectedMonth && selectedDay) {
      const display = util.formatNumber(selectedMonth.value) + '-' + util.formatNumber(selectedDay.value);
      this.setData({
        endDateIndex: values,
        endDateDisplay: display
      });
    }
  },

  // 结束时间选择器变化
  onEndTimeMultiChange: function(e) {
    const values = e.detail.value;
    const hours = this.data.endTimeRange[0];
    const minutes = this.data.endTimeRange[1];
    
    const selectedHour = hours[values[0]];
    const selectedMinute = minutes[values[1]];
    
    if (selectedHour && selectedMinute) {
      const display = util.formatNumber(selectedHour.value) + ':' + util.formatNumber(selectedMinute.value);
      this.setData({
        endTimeIndex: values,
        endTimeDisplay: display
      });
    }
  },

  // ======== 搜索筛选功能 ========

  // 筛选和显示记录的核心函数
  filterAndDisplayLogs: function() {
    const { originalLogs, searchText, selectedCategoryId, dateFilter, customStartDate, customEndDate } = this.data;
    
    if (originalLogs.length === 0) {
      this.setData({
        logs: [],
        dateGroups: [],
        filteredLogs: [],
        isEmpty: true
      });
      return;
    }

    let filteredLogs = [...originalLogs];

    // 搜索筛选
    if (searchText.trim()) {
      const searchTerm = searchText.trim().toLowerCase();
      filteredLogs = filteredLogs.filter(log => {
        return log.category.name.toLowerCase().includes(searchTerm) ||
               (log.note && log.note.toLowerCase().includes(searchTerm));
      });
    }

    // 类别筛选
    if (selectedCategoryId && selectedCategoryId !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.category.id === selectedCategoryId);
    }

    // 日期筛选
    if (dateFilter && dateFilter !== 'all') {
      filteredLogs = this.filterLogsByDateRange(filteredLogs, dateFilter, customStartDate, customEndDate);
    }

    // 按日期分组
    const dateGroups = this.groupLogsByDate(filteredLogs);
    
    // 计算活跃筛选条件数量
    const activeFiltersCount = this.calculateActiveFiltersCount();

    this.setData({
      logs: filteredLogs,
      filteredLogs: filteredLogs,
      dateGroups: dateGroups,
      isEmpty: filteredLogs.length === 0,
      activeFiltersCount: activeFiltersCount
    });
  },

  // 根据日期范围筛选记录
  filterLogsByDateRange: function(logs, dateFilter, customStartDate, customEndDate) {
    const now = new Date();
    let startDate, endDate;

    switch (dateFilter) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'yesterday':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'thisWeek':
        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 让周一为一周的开始
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - mondayOffset);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
        } else {
          return logs; // 如果没有设置自定义日期，返回所有记录
        }
        break;
      
      default:
        return logs;
    }

    return logs.filter(log => {
      const logDate = new Date(log.startTime);
      return logDate >= startDate && logDate <= endDate;
    });
  },

  // 计算活跃筛选条件数量
  calculateActiveFiltersCount: function() {
    const { searchText, selectedCategoryId, dateFilter } = this.data;
    let count = 0;
    
    if (searchText.trim()) count++;
    if (selectedCategoryId && selectedCategoryId !== 'all') count++;
    if (dateFilter && dateFilter !== 'all') count++;
    
    return count;
  },

  // 搜索输入处理
  onSearchInput: function(e) {
    this.setData({
      searchText: e.detail.value
    });
    
    // 实时搜索（可选，也可以等用户点击搜索按钮）
    this.filterAndDisplayLogs();
  },

  // 执行搜索
  onSearch: function() {
    this.filterAndDisplayLogs();
  },

  // 清除搜索
  clearSearch: function() {
    this.setData({
      searchText: ''
    });
    this.filterAndDisplayLogs();
  },

  // 切换筛选面板显示状态
  toggleFilters: function() {
    this.setData({
      showFilters: !this.data.showFilters
    });
  },

  // 按类别筛选
  filterByCategory: function(e) {
    const categoryId = e.currentTarget.dataset.id;
    this.setData({
      selectedCategoryId: categoryId
    });
    this.filterAndDisplayLogs();
  },

  // 按日期筛选
  filterByDate: function(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({
      dateFilter: filter
    });
    
    // 如果不是自定义日期范围，立即应用筛选
    if (filter !== 'custom') {
      this.filterAndDisplayLogs();
    }
  },

  // 自定义开始日期选择
  onStartDateChange: function(e) {
    this.setData({
      customStartDate: e.detail.value
    });
    
    // 如果结束日期也已选择，立即应用筛选
    if (this.data.customEndDate) {
      this.filterAndDisplayLogs();
    }
  },

  // 自定义结束日期选择
  onEndDateChange: function(e) {
    this.setData({
      customEndDate: e.detail.value
    });
    
    // 如果开始日期也已选择，立即应用筛选
    if (this.data.customStartDate) {
      this.filterAndDisplayLogs();
    }
  },

  // 重置筛选条件
  resetFilters: function() {
    this.setData({
      searchText: '',
      selectedCategoryId: 'all',
      dateFilter: 'all',
      customStartDate: '',
      customEndDate: ''
    });
    this.filterAndDisplayLogs();
  },

  // 应用筛选（关闭筛选面板）
  applyFilters: function() {
    this.setData({
      showFilters: false
    });
    this.filterAndDisplayLogs();
  }
});