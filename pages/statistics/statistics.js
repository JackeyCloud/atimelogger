// pages/statistics/statistics.js
const dataService = require('../../utils/dataService.js');
const util = require('../../utils/util.js');

Page({
  data: {
    timeRange: 'week', // 'day', 'week', 'month', 'year'
    chartType: 'pie', // 'pie', 'line', 'bar'
    statistics: {},
    totalTime: '0小时0分钟',
    categoryData: [],
    loading: true,
    isEmpty: false,
    chartData: null,
    hasRecords: false
  },

  onLoad: function() {
    this.loadStatistics();
    
    // 应用当前主题
    const theme = wx.getStorageSync('theme') || 'default';
    const pageThemeClass = `${theme}-theme`;
    this.setData({
      pageThemeClass: pageThemeClass
    });
  },

  onShow: function() {
    // 每次页面显示时重新加载数据，确保数据最新
    this.loadStatistics();
  },

  // 切换时间范围
  switchTimeRange: function(e) {
    const timeRange = e.currentTarget.dataset.range;
    this.setData({ timeRange });
    this.loadStatistics();
  },
  
  // 切换图表类型
  switchChartType: function(e) {
    const chartType = e.currentTarget.dataset.type;
    // 先清空chartData，然后设置新类型，确保图表重新渲染
    this.setData({ 
      chartType,
      chartData: null 
    }, () => {
      // 在下一个事件循环中重新准备数据，确保chart组件能够正确重绘
      setTimeout(() => {
        this.prepareChartData();
      }, 50);
    });
  },

  loadStatistics: function() {
    this.setData({ loading: true });
    
    // 根据选择的时间范围获取开始和结束时间
    const { startTime, endTime } = this.getTimeRangeParams();
    
    // 获取这个时间范围内的所有记录
    const logs = dataService.getLogsByTimeRange(startTime, endTime);
    
    if (logs.length === 0) {
      this.setData({
        statistics: {},
        totalTime: '0小时0分钟',
        categoryData: [],
        loading: false,
        isEmpty: true,
        hasRecords: false,
        chartData: null
      });
      return;
    }
    
    // 计算统计数据
    const statistics = this.calculateStatistics(logs);
    
    this.setData({
      statistics,
      totalTime: util.formatDuration(statistics.totalDuration),
      categoryData: statistics.categories,
      loading: false,
      isEmpty: false,
      hasRecords: true
    }, () => {
      this.prepareChartData();
    });
  },

  getTimeRangeParams: function() {
    const now = new Date();
    let startTime, endTime = now;
    
    switch (this.data.timeRange) {
      case 'day':
        // 今天的开始时间
        startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        // 本周的开始时间（周一）
        const day = now.getDay() || 7; // 将周日的0转换为7
        startTime = new Date(now);
        startTime.setDate(now.getDate() - day + 1);
        startTime.setHours(0, 0, 0, 0);
        break;
      case 'month':
        // 本月的开始时间
        startTime = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        // 本年的开始时间
        startTime = new Date(now.getFullYear(), 0, 1);
        break;
    }
    
    return { startTime, endTime };
  },

  calculateStatistics: function(logs) {
    // 初始化统计对象
    const statistics = {
      totalDuration: 0,
      categories: [],
      dailyData: {} // 添加每日数据统计
    };
    
    // 按类别分组并计算每个类别的总时间
    const categoryMap = {};
    
    logs.forEach(log => {
      const duration = log.endTime - log.startTime;
      statistics.totalDuration += duration;
      
      const categoryId = log.category.id;
      if (!categoryMap[categoryId]) {
        categoryMap[categoryId] = {
          id: categoryId,
          name: log.category.name,
          color: log.category.color,
          icon: log.category.icon,
          duration: 0,
          dailyDurations: {} // 添加每日时长记录
        };
      }
      
      categoryMap[categoryId].duration += duration;
      
      // 记录每日数据
      const dateStr = new Date(log.startTime).toISOString().split('T')[0];
      if (!categoryMap[categoryId].dailyDurations[dateStr]) {
        categoryMap[categoryId].dailyDurations[dateStr] = 0;
      }
      categoryMap[categoryId].dailyDurations[dateStr] += duration;
      
      // 更新总的每日数据
      if (!statistics.dailyData[dateStr]) {
        statistics.dailyData[dateStr] = 0;
      }
      statistics.dailyData[dateStr] += duration;
    });
    
    // 将类别数据转换为数组并计算百分比
    statistics.categories = Object.values(categoryMap).map(category => {
      return {
        ...category,
        percentage: statistics.totalDuration > 0 
          ? Math.round((category.duration / statistics.totalDuration) * 100) 
          : 0,
        formattedDuration: util.formatDuration(category.duration)
      };
    });
    
    // 按时间降序排序
    statistics.categories.sort((a, b) => b.duration - a.duration);
    
    return statistics;
  },
  
  prepareChartData: function() {
    if (!this.data.hasRecords) return;
    
    const { statistics, chartType } = this.data;
    let chartData = null;
    
    switch (chartType) {
      case 'pie':
        chartData = this.preparePieChartData(statistics);
        break;
      case 'line':
        chartData = this.prepareLineChartData(statistics);
        break;
      case 'bar':
        chartData = this.prepareBarChartData(statistics);
        break;
    }
    
    this.setData({ chartData });
  },
  
  preparePieChartData: function(statistics) {
    // 准备饼图数据
    return {
      data: statistics.categories.map(category => ({
        name: category.name,
        value: category.duration,
        color: category.color
      }))
    };
  },
  
  prepareLineChartData: function(statistics) {
    // 准备折线图数据
    // 获取日期范围
    const dates = Object.keys(statistics.dailyData).sort();
    if (dates.length === 0) return null;
    
    // 为每个类别准备一个数据系列
    const series = statistics.categories.map(category => {
      const values = dates.map(date => {
        return (category.dailyDurations[date] || 0) / (60 * 60 * 1000); // 转换为小时
      });
      
      return {
        name: category.name,
        color: category.color,
        values: values
      };
    });
    
    // 格式化日期标签
    const labels = dates.map(date => {
      const d = new Date(date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    
    return {
      labels: labels,
      data: series
    };
  },
  
  prepareBarChartData: function(statistics) {
    // 准备柱状图数据
    return {
      data: statistics.categories.map(category => ({
        name: category.name,
        value: category.duration / (60 * 60 * 1000), // 转换为小时
        color: category.color,
        originalDuration: category.duration // 保留原始时长（毫秒）
      }))
    };
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadStatistics();
    wx.stopPullDownRefresh();
  }
});