// pages/faq/faq.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    faqList: [
      {
        id: 1,
        question: "如何开始记录时间？",
        answer: "在首页点击您想要记录的活动类别，如果开启了预设时长功能，会弹出时长选择器，选择后点击\"开始计时\"；如果关闭了预设时长功能，点击类别后会立即开始记录。",
        expanded: false
      },
      {
        id: 2,
        question: "什么是预设时长功能？",
        answer: "预设时长功能允许您在开始记录前设定一个计划时长，比如25分钟的专注时间。时间到后会提醒您，您可以选择结束记录或继续。这个功能特别适合番茄工作法等时间管理技巧。",
        expanded: false
      },
      {
        id: 3,
        question: "如何查看我的历史记录？",
        answer: "点击底部导航栏的\"历史\"选项卡，可以查看您的所有时间记录。您可以按类别、时间范围进行筛选，也可以搜索特定记录。",
        expanded: false
      },
      {
        id: 4,
        question: "如何查看时间统计数据？",
        answer: "点击底部导航栏的\"统计\"选项卡，可以查看您的时间分配饼图、趋势图和柱状图。您可以选择查看今天、本周、本月或本年的数据。",
        expanded: false
      },
      {
        id: 5,
        question: "如何添加新的活动类别？",
        answer: "在首页的类别网格中，点击\"+\"按钮，输入类别名称，选择颜色和图标，然后点击\"保存\"即可添加新类别。",
        expanded: false
      },
      {
        id: 6,
        question: "如何编辑或删除已有的记录？",
        answer: "在\"历史\"页面，点击您想要编辑的记录，进入详情页后可以修改开始时间、结束时间、类别或添加备注。如果要删除记录，在详情页点击\"删除\"按钮。",
        expanded: false
      },
      {
        id: 7,
        question: "如何暂停和恢复记录？",
        answer: "在记录进行中，点击\"暂停\"按钮可以暂停计时，暂停后点击\"继续\"按钮可以恢复计时。暂停的时间不会计入总时长。",
        expanded: false
      },
      {
        id: 8,
        question: "数据会自动保存吗？",
        answer: "是的，所有的时间记录和设置都会自动保存在本地。但如果您卸载小程序或清除缓存，数据可能会丢失，建议定期导出重要数据。",
        expanded: false
      },
      {
        id: 9,
        question: "如何切换暗黑模式？",
        answer: "在\"设置\"页面，您可以找到主题设置选项，选择\"暗黑模式\"即可切换。您也可以选择跟随系统设置自动切换。",
        expanded: false
      },
      {
        id: 10,
        question: "如何自定义类别的排序？",
        answer: "在\"设置\"页面，找到\"类别管理\"选项，进入后可以通过拖拽调整类别的显示顺序。您也可以选择按使用频率自动排序。",
        expanded: false
      },
      {
        id: 11,
        question: "如何导出我的时间记录数据？",
        answer: "在\"设置\"页面，点击\"数据导出\"选项，选择要导出的数据范围，然后选择\"发送给好友\"或\"复制到剪贴板\"。建议定期备份重要数据以防丢失。",
        expanded: false
      },
      {
        id: 12,
        question: "如何导入之前备份的数据？",
        answer: "在\"设置\"页面，点击\"数据导入\"选项，可以选择\"从聊天记录选择文件\"或\"从剪贴板导入\"。导入将完全覆盖现有数据，建议先备份当前数据。",
        expanded: false
      },
      {
        id: 13,
        question: "历史页面如何搜索和筛选记录？",
        answer: "在\"历史\"页面，点击搜索框输入关键词搜索记录；点击筛选按钮可以按类别、时间范围（今天、昨天、本周、本月、自定义）进行筛选。支持组合搜索。",
        expanded: false
      },
      {
        id: 14,
        question: "如何在历史页面编辑记录的时间？",
        answer: "在\"历史\"页面点击要编辑的记录，在弹出的编辑窗口中可以修改开始日期、开始时间、结束日期、结束时间，选择后点击\"保存\"即可。日期格式为月-日，时间为24小时制。",
        expanded: false
      },
      {
        id: 15,
        question: "统计页面的不同图表有什么区别？",
        answer: "饼图显示各类别时间占比；趋势图显示每个类别在时间段内的变化趋势；柱状图直观对比各类别的总时长。可以切换查看今天、本周、本月、今年的数据。",
        expanded: false
      },
      {
        id: 16,
        question: "为什么切换图表类型时显示异常？",
        answer: "这是已知问题，我们已经修复。如果仍有异常，请尝试刷新页面或重新进入统计页面。图表切换时会自动清理并重新绘制，确保显示正确。",
        expanded: false
      },
      {
        id: 17,
        question: "数据会在多设备间同步吗？",
        answer: "不会。所有数据仅存储在当前设备的本地，不会自动同步到其他设备。如需在多设备使用，可以通过导出/导入功能手动迁移数据。",
        expanded: false
      },
      {
        id: 18,
        question: "删除的记录可以恢复吗？",
        answer: "无法恢复。删除记录是永久性操作，建议在删除重要数据前先导出备份。您也可以选择编辑记录而不是删除。",
        expanded: false
      }
    ]
  },

  /**
   * 展开/收起FAQ项
   */
  toggleFaq: function(e) {
    const id = e.currentTarget.dataset.id;
    const faqList = this.data.faqList.map(item => {
      if (item.id === id) {
        return {
          ...item,
          expanded: !item.expanded
        };
      }
      return item;
    });
    
    this.setData({
      faqList
    });
  },

  /**
   * 联系我们
   */
  contactUs: function() {
    wx.showModal({
      title: '联系我们',
      content: '您可以通过以下方式联系我们：\n\n• 电子邮件：1945000000@qq.com\n• 微信公众号：大骏的百宝箱\n• 微信号：ui1945\n\n我们将在24小时内回复您的问题。',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 应用当前主题
    const theme = wx.getStorageSync('theme') || 'default';
    const pageThemeClass = `${theme}-theme`;
    this.setData({
      pageThemeClass: pageThemeClass
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '大骏极简时间记录 - 常见问题解答',
      path: '/pages/faq/faq'
    };
  }
})