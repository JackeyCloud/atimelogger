// app.js
const dataService = require('./utils/dataService.js');

App({
  globalData: {
    userInfo: null,
    activeRecord: null,
    showAddToMPTip: true,
    showAddToDesktopTip: true,
    dataService: dataService,
    refreshCategories: null,
    refreshSettings: null
  },
  
  onLaunch: function() {
    // 初始化数据服务
    dataService.init();
    
    // 检查是否有未完成的记录
    this.checkActiveRecord();
  },
  
  onShow: function() {
    // 小程序从后台切回前台时
    // 如果首页已加载且有活动记录且未暂停，通知首页立即更新计时显示
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    
    if (currentPage && currentPage.route === 'pages/index/index') {
      if (currentPage.data.activeRecord && !currentPage.data.isPaused && currentPage.updateTimerDisplay) {
        // 立即更新时间显示（只在非暂停状态下）
        currentPage.updateTimerDisplay();
      }
    }
  },
  
  onHide: function() {
    // 小程序切入后台时
    // 这里可以做一些清理工作，但不清除计时器，因为计时要继续
  },
  
  checkActiveRecord: function() {
    // 检查是否有未完成的记录
    const activeRecord = dataService.getActiveRecord();
    if (activeRecord) {
      this.globalData.activeRecord = activeRecord;
    }
  },
  
  startRecord: function(category) {
    // 开始记录时间
    const record = dataService.startRecord(category);
    this.globalData.activeRecord = record;
    return record;
  },
  
  stopRecord: function() {
    // 停止记录时间
    if (this.globalData.activeRecord) {
      const record = dataService.stopRecord(this.globalData.activeRecord.id);
      this.globalData.activeRecord = null;
      return record;
    }
    return null;
  }
});