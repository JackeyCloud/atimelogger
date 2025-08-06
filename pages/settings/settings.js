// pages/settings/settings.js
const dataService = require('../../utils/dataService.js');
const util = require('../../utils/util.js');

Page({
  data: {
    categories: [],
    filteredCategories: [],
    showAddCategoryModal: false,
    showSortOptions: false,
    sortBy: 'custom', // 'name', 'usage', 'custom'
    currentGroup: '', // 空字符串表示全部
    groups: [],
    groupNames: ['无分组'],
    groupIndex: 0,
    dragStartIndex: -1, // 拖拽开始的索引
    dragEndIndex: -1, // 拖拽结束的索引
    isDragging: false, // 是否正在拖拽
    
    // 导入导出相关
    showExportModal: false,
    showImportModal: false,
    exportOptions: {
      categories: true,
      timeRecords: true,
      groups: true,
      settings: false
    },
    importFilePath: '',
    importFileName: '',
    importData: null,
    showImportWarning: false,
    exportData: '',
    exportFileName: '',
    
    newCategory: {
      name: '',
      color: '#3498db',
      icon: '📝',
      groupId: '',
      order: 0,
      archived: false,
      usageCount: 0
    },
    colorOptions: [
      '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
      '#9b59b6', '#1abc9c', '#e67e22', '#34495e',
      '#c0392b', '#16a085', '#8e44ad', '#d35400',
      '#27ae60', '#2980b9', '#f1c40f', '#7f8c8d'
    ],
    iconOptions: [
      '📝', '📚', '💻', '🎮', '🎬', '🍔', '🛌', '🏃',
      '🚗', '🛒', '📱', '🎵', '🎨', '🏠', '👔', '🍳',
      '📺', '🧹', '🧘', '🚶', '🚌', '🏋️', '👨‍💻', '👩‍💻'
    ],
    editingCategory: null,
    showGroupSelectorModal: false,
    currentCategoryForGroup: null
  },

  onLoad: function() {
    this.loadSettings();
    
    // 注册全局刷新方法
    const app = getApp();
    app.globalData.refreshSettings = this.loadSettings.bind(this);
  },

  onShow: function() {
    this.loadSettings();
  },

  loadSettings: function() {
    // 加载所有类别
    const categories = dataService.getCategories();
    
    // 加载所有分组
    const groups = dataService.getCategoryGroups() || [];
    
    // 准备分组名称列表（用于选择器）
    const groupNames = ['无分组', ...groups.map(g => g.name)];
    
    // 根据当前排序和分组过滤类别
    const filteredCategories = this.filterAndSortCategories(categories, this.data.sortBy, this.data.currentGroup);
    
    this.setData({
      categories,
      filteredCategories,
      groups,
      groupNames
    });
  },
  
  // 根据排序和分组过滤类别
  filterAndSortCategories: function(categories, sortBy, groupId) {
    // 先根据分组过滤
    let result = [...categories];
    
    if (groupId) {
      result = result.filter(cat => cat.groupId === groupId);
    }
    
    // 然后根据排序方式排序
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'usage':
        result.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
        break;
      case 'custom':
        result.sort((a, b) => (a.order || 0) - (b.order || 0));
        break;
    }
    
    return result;
  },
  
  // 切换排序选项显示
  toggleSortOptions: function() {
    this.setData({
      showSortOptions: !this.data.showSortOptions
    });
  },
  
  // 设置排序方式
  setSortBy: function(e) {
    const sortBy = e.currentTarget.dataset.sort;
    
    this.setData({
      sortBy,
      filteredCategories: this.filterAndSortCategories(this.data.categories, sortBy, this.data.currentGroup)
    });
    
    // 如果切换到自定义排序模式，提示用户可以拖拽排序
    if (sortBy === 'custom' && !this.data.currentGroup) {
      wx.showToast({
        title: '长按并拖动可调整顺序',
        icon: 'none',
        duration: 2000
      });
    }
  },
  
  // 开始拖拽
  dragStart: function(e) {
    // 只有在自定义排序模式下才能拖拽
    if (this.data.sortBy !== 'custom') {
      return;
    }
    
    const index = e.currentTarget.dataset.index;
    this.setData({
      dragStartIndex: index,
      isDragging: true
    });
  },
  
  // 拖拽中
  dragMove: function(e) {
    if (!this.data.isDragging) return;
    
    const currentIndex = e.currentTarget.dataset.index;
    if (currentIndex !== this.data.dragEndIndex) {
      this.setData({
        dragEndIndex: currentIndex
      });
    }
  },
  
  // 结束拖拽
  dragEnd: function() {
    if (!this.data.isDragging) return;
    
    const { dragStartIndex, dragEndIndex, filteredCategories, currentGroup } = this.data;
    
    if (dragStartIndex !== -1 && dragEndIndex !== -1 && dragStartIndex !== dragEndIndex) {
      // 移动元素
      const categories = [...filteredCategories];
      const item = categories.splice(dragStartIndex, 1)[0];
      categories.splice(dragEndIndex, 0, item);
      
      // 更新顺序
      const updatedCategories = categories.map((cat, index) => ({
        ...cat,
        order: index
      }));
      
      // 保存新的排序
      const categoryIds = updatedCategories.map(cat => cat.id);
      
      // 如果是在特定分组内排序
      if (currentGroup) {
        dataService.saveCategoryOrderInGroup(currentGroup, categoryIds);
      } else {
        // 全局排序
        dataService.updateCategoryOrder(categoryIds);
      }
      
      // 更新所有类别的顺序
      updatedCategories.forEach(cat => {
        dataService.updateCategory(cat.id, { order: cat.order });
      });
      
      // 更新界面
      this.setData({
        filteredCategories: updatedCategories
      });
      
      wx.showToast({
        title: '排序已更新',
        icon: 'success',
        duration: 1500
      });
    }
    
    // 重置拖拽状态
    this.setData({
      dragStartIndex: -1,
      dragEndIndex: -1,
      isDragging: false
    });
  },
  
  // 选择分组
  selectGroup: function(e) {
    const groupId = e.currentTarget.dataset.group;
    
    this.setData({
      currentGroup: groupId,
      filteredCategories: this.filterAndSortCategories(this.data.categories, this.data.sortBy, groupId)
    });
  },
  
  // 显示添加分组对话框
  showAddGroup: function() {
    wx.showModal({
      title: '添加分组',
      content: '',
      editable: true,
      placeholderText: '请输入分组名称',
      success: res => {
        if (res.confirm && res.content) {
          // 添加新分组
          dataService.addCategoryGroup({
            name: res.content,
            order: this.data.groups.length
          });
          
          // 重新加载数据
          this.loadSettings();
          
          wx.showToast({
            title: '分组已添加',
            icon: 'success'
          });
        }
      }
    });
  },

  // 显示添加类别模态框
  showAddCategory: function() {
    this.setData({
      showAddCategoryModal: true,
      newCategory: {
        name: '',
        color: this.data.colorOptions[0],
        icon: this.data.iconOptions[0],
        groupId: '',
        order: this.data.categories.length,
        archived: false,
        usageCount: 0
      },
      editingCategory: null,
      groupIndex: 0
    });
  },

  // 关闭模态框
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
    const color = e.currentTarget.dataset.color;
    this.setData({
      'newCategory.color': color
    });
  },

  // 选择图标
  selectIcon: function(e) {
    const icon = e.currentTarget.dataset.icon;
    this.setData({
      'newCategory.icon': icon
    });
  },

  // 保存类别
  saveCategory: function() {
    const { newCategory, editingCategory, groupIndex, groups } = this.data;
    
    if (!newCategory.name.trim()) {
      wx.showToast({
        title: '请输入类别名称',
        icon: 'none'
      });
      return;
    }
    
    // 处理分组
    if (groupIndex > 0) {
      newCategory.groupId = groups[groupIndex - 1].id;
    } else {
      newCategory.groupId = '';
    }
    
    if (editingCategory) {
      // 更新现有类别
      dataService.updateCategory(editingCategory.id, newCategory);
      wx.showToast({
        title: '类别已更新',
        icon: 'success'
      });
    } else {
      // 添加新类别
      dataService.addCategory(newCategory);
      wx.showToast({
        title: '类别已添加',
        icon: 'success'
      });
    }
    
    // 关闭模态框并刷新数据
    this.setData({
      showAddCategoryModal: false
    });
    this.loadSettings();
  },
  
  // 选择类别分组
  selectCategoryGroup: function(e) {
    this.setData({
      groupIndex: parseInt(e.detail.value)
    });
  },

  // 编辑类别
  editCategory: function(e) {
    const categoryId = e.currentTarget.dataset.id;
    const category = this.data.categories.find(c => c.id === categoryId);
    
    if (category) {
      // 找到分组索引
      let groupIndex = 0;
      if (category.groupId) {
        const groupIndex = this.data.groups.findIndex(g => g.id === category.groupId);
        if (groupIndex !== -1) {
          groupIndex = groupIndex + 1; // +1 是因为第一项是"无分组"
        }
      }
      
      this.setData({
        showAddCategoryModal: true,
        newCategory: {
          name: category.name,
          color: category.color,
          icon: category.icon,
          groupId: category.groupId || '',
          order: category.order || 0,
          archived: category.archived || false,
          usageCount: category.usageCount || 0
        },
        editingCategory: category,
        groupIndex: groupIndex
      });
    }
  },

  // 删除类别
  deleteCategory: function(e) {
    const categoryId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个类别吗？相关的时间记录将会保留，但类别信息会丢失。',
      confirmColor: '#FF4D4F',
      success: res => {
        if (res.confirm) {
          dataService.deleteCategory(categoryId);
          this.loadSettings();
          wx.showToast({
            title: '已删除',
            icon: 'success'
          });
        }
      }
    });
  },
  
  // 显示分组选择器
  showGroupSelector: function(e) {
    const categoryId = e.currentTarget.dataset.id;
    const category = this.data.categories.find(c => c.id === categoryId);
    
    if (category) {
      // 准备分组选择器
      const items = ['无分组', ...this.data.groups.map(g => g.name)];
      
      wx.showActionSheet({
        itemList: items,
        success: res => {
          let groupId = '';
          
          if (res.tapIndex > 0) {
            groupId = this.data.groups[res.tapIndex - 1].id;
          }
          
          // 更新类别分组
          dataService.updateCategory(categoryId, {
            ...category,
            groupId: groupId
          });
          
          this.loadSettings();
          
          wx.showToast({
            title: '已更新分组',
            icon: 'success'
          });
        }
      });
    }
  },
  
  // 切换类别归档状态
  toggleArchiveCategory: function(e) {
    const categoryId = e.currentTarget.dataset.id;
    const category = this.data.categories.find(c => c.id === categoryId);
    
    if (category) {
      const newArchivedState = !category.archived;
      
      dataService.updateCategory(categoryId, {
        ...category,
        archived: newArchivedState
      });
      
      this.loadSettings();
      
      wx.showToast({
        title: newArchivedState ? '已归档' : '已恢复',
        icon: 'success'
      });
    }
  },

  // 清除所有数据
  clearAllData: function() {
    wx.showModal({
      title: '清除所有数据',
      content: '确定要清除所有数据吗？此操作不可撤销，将删除所有类别和时间记录。',
      confirmColor: '#FF4D4F',
      success: res => {
        if (res.confirm) {
          dataService.clearAllData();
          this.loadSettings();
          wx.showToast({
            title: '所有数据已清除',
            icon: 'success'
          });
        }
      }
    });
  },
  
  // 导航到隐私政策页面
  navigateToPrivacy: function() {
    wx.navigateTo({
      url: '/pages/privacy/privacy'
    });
  },
  
  // 导航到常见问题解答页面
  navigateToFAQ: function() {
    wx.navigateTo({
      url: '/pages/faq/faq'
    });
  },
  
  // 显示导出选项
  showExportOptions: function() {
    this.setData({
      showExportModal: true,
      exportOptions: {
        categories: true,
        timeRecords: true,
        groups: true,
        settings: false
      }
    });
  },
  
  // 关闭导出模态框
  closeExportModal: function() {
    this.setData({
      showExportModal: false
    });
  },
  
  // 切换导出选项
  toggleExportOption: function(e) {
    const option = e.currentTarget.dataset.option;
    const currentValue = this.data.exportOptions[option];
    
    this.setData({
      [`exportOptions.${option}`]: !currentValue
    });
  },
  
  // 导出选定的数据
  exportSelectedData: function() {
    try {
      const { exportOptions } = this.data;
      
      // 检查是否至少选择了一项
      if (!exportOptions.categories && !exportOptions.timeRecords && !exportOptions.groups && !exportOptions.settings) {
        wx.showToast({
          title: '请至少选择一项数据',
          icon: 'none'
        });
        return;
      }
      
      // 获取选定的数据
      const exportData = dataService.exportSelectedData(exportOptions);
      
      // 转换为格式化的JSON字符串
      const jsonData = JSON.stringify(exportData, null, 2);
      
      // 生成文件名
      const now = new Date();
      const fileName = `timeLogger_export_${util.formatDate(now).replace(/-/g, '')}_${util.formatClock(now).replace(/:/g, '')}.json`;
      
      // 先预存储数据，然后显示导出选项
      this.setData({
        exportData: jsonData,
        exportFileName: fileName
      });

      // 显示导出选项对话框
      wx.showActionSheet({
        itemList: ['发送给好友', '复制到剪贴板'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0: // 发送给好友
              this.shareToFriendDirect(jsonData, fileName);
              break;
            case 1: // 复制到剪贴板
              this.copyToClipboard(jsonData);
              break;
          }
        }
      });
      
      // 关闭导出对话框
      this.setData({
        showExportModal: false
      });
      
    } catch (error) {
      console.error('导出错误:', error);
      wx.showToast({
        title: '导出失败: ' + error.message,
        icon: 'none',
        duration: 3000
      });
    }
  },



  // 直接发送给好友（在用户点击上下文中）
  shareToFriendDirect: function(data, fileName) {
    const fs = wx.getFileSystemManager();
    const tempFilePath = `${wx.env.USER_DATA_PATH}/share_${fileName}`;
    
    // 同步创建文件并立即分享
    try {
      fs.writeFileSync(tempFilePath, data, 'utf8');
      
      // 立即调用分享（在用户点击的同步上下文中）
      wx.shareFileMessage({
        filePath: tempFilePath,
        fileName: fileName,
        success: () => {
          wx.showModal({
            title: '发送成功',
            content: '数据文件已发送！\n\n建议将文件发送给"文件传输助手"以便长期保存。',
            showCancel: false,
            confirmText: '知道了'
          });
          
          // 延迟清理临时文件
          setTimeout(() => {
            fs.unlink({
              filePath: tempFilePath,
              complete: () => {
                console.log('临时文件已清理');
              }
            });
          }, 10000);
        },
        fail: (err) => {
          console.error('分享失败:', err);
          
          // 提供备选方案
          wx.showModal({
            title: '发送失败',
            content: '文件发送失败，建议使用"复制到剪贴板"方式备份数据。',
            showCancel: true,
            cancelText: '取消',
            confirmText: '复制到剪贴板',
            success: (modalRes) => {
              if (modalRes.confirm) {
                this.copyToClipboard(data);
              }
            }
          });
          
          // 清理临时文件
          fs.unlink({
            filePath: tempFilePath,
            complete: () => {
              console.log('清理临时文件');
            }
          });
        }
      });
    } catch (err) {
      console.error('创建文件失败:', err);
      wx.showModal({
        title: '准备文件失败',
        content: '无法创建临时文件，建议使用"复制到剪贴板"方式备份数据。',
        showCancel: true,
        cancelText: '取消',
        confirmText: '复制到剪贴板',
        success: (modalRes) => {
          if (modalRes.confirm) {
            this.copyToClipboard(data);
          }
        }
      });
    }
  },

  // 复制到剪贴板
  copyToClipboard: function(data) {
    wx.setClipboardData({
      data: data,
      success: () => {
        wx.showModal({
          title: '复制成功',
          content: '数据已复制到剪贴板！\n\n您可以将数据粘贴到任何文本编辑器中保存，或者通过微信发送给自己。',
          showCancel: false,
          confirmText: '知道了'
        });
      },
      fail: (err) => {
        console.error('复制失败:', err);
        wx.showToast({
          title: '复制失败：' + (err.errMsg || '未知错误'),
          icon: 'none',
          duration: 3000
        });
      }
    });
  },
  
  // 显示导入选项
  showImportOptions: function() {
    this.setData({
      showImportModal: true,
      importFilePath: '',
      importFileName: '',
      importData: null,
      showImportWarning: false
    });
  },
  
  // 关闭导入模态框
  closeImportModal: function() {
    this.setData({
      showImportModal: false
    });
  },
  
  // 选择导入文件
  chooseImportFile: function() {
    wx.showActionSheet({
      itemList: ['从聊天记录选择文件', '从剪贴板导入'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0: // 从聊天记录选择文件
            this.chooseFileFromMessage();
            break;
          case 1: // 从剪贴板导入
            this.importFromClipboard();
            break;
        }
      }
    });
  },

  // 从聊天记录选择文件
  chooseFileFromMessage: function() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['json'],
      success: res => {
        const file = res.tempFiles[0];
        const fileName = file.name || '未知文件';
        
        wx.showLoading({
          title: '正在验证文件...',
          mask: true
        });
        
        // 验证文件大小（限制为10MB）
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          wx.hideLoading();
          wx.showModal({
            title: '文件过大',
            content: '选择的文件过大，请选择小于10MB的文件。',
            showCancel: false
          });
          return;
        }
        
        // 设置导入文件信息
        this.setData({
          importFilePath: file.path,
          importFileName: fileName,
          showImportWarning: true
        });
        
        wx.hideLoading();
        wx.showToast({
          title: '文件选择成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('选择文件失败:', err);
        
        if (err.errMsg && err.errMsg.includes('cancel')) {
          // 用户取消选择，不显示错误
          return;
        }
        
        wx.showModal({
          title: '选择文件失败',
          content: `无法选择文件：${err.errMsg || '未知错误'}\n\n请确保选择的是有效的JSON文件。`,
          showCancel: false
        });
      }
    });
  },

  // 从剪贴板导入
  importFromClipboard: function() {
    wx.getClipboardData({
      success: (res) => {
        const clipboardData = res.data;
        try {
          // 尝试解析剪贴板数据
          JSON.parse(clipboardData);
          
          // 如果解析成功，设置为导入数据
          this.setData({
            importData: clipboardData,
            importFilePath: 'clipboard',
            importFileName: '剪贴板数据',
            showImportWarning: true
          });
          
          wx.showToast({
            title: '从剪贴板获取数据成功',
            icon: 'success'
          });
        } catch (error) {
          wx.showModal({
            title: '剪贴板数据无效',
            content: '剪贴板中的内容不是有效的JSON格式，请确保复制了正确的导出数据。',
            showCancel: false
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '获取剪贴板数据失败',
          icon: 'none'
        });
      }
    });
  },
  
  // 确认导入数据
  confirmImport: function() {
    if (!this.data.importFilePath) {
      wx.showToast({
        title: '请先选择数据源',
        icon: 'none'
      });
      return;
    }
    
    // 如果是从剪贴板导入
    if (this.data.importFilePath === 'clipboard' && this.data.importData) {
      this.processImportData(this.data.importData);
      return;
    }
    
    wx.showLoading({
      title: '正在读取文件...',
      mask: true
    });
    
    // 从文件导入
    const fs = wx.getFileSystemManager();
    
    fs.readFile({
      filePath: this.data.importFilePath,
      encoding: 'utf8',
      success: res => {
        wx.hideLoading();
        this.processImportData(res.data);
      },
      fail: err => {
        wx.hideLoading();
        console.error('读取文件失败:', err);
        wx.showModal({
          title: '读取文件失败',
          content: `无法读取文件：${this.data.importFileName}\n\n错误信息：${err.errMsg || '未知错误'}\n\n请检查文件是否完整或重新选择文件。`,
          showCancel: true,
          cancelText: '取消',
          confirmText: '重新选择',
          success: (modalRes) => {
            if (modalRes.confirm) {
              this.chooseImportFile();
            }
          }
        });
      }
    });
  },

  // 处理导入数据
  processImportData: function(rawData) {
    try {
      // 尝试解析JSON数据
      const importData = JSON.parse(rawData);
      
      // 验证数据格式
      if (!importData || typeof importData !== 'object') {
        throw new Error('数据格式无效');
      }
      
      // 处理不同的数据格式兼容性
      let dataToImport = this.normalizeImportData(importData);
      
      // 显示导入预览
      this.showImportPreview(dataToImport);
      
    } catch (error) {
      console.error('导入数据解析失败:', error);
      wx.showModal({
        title: '数据格式错误',
        content: `无法解析导入数据：${error.message}\n\n请确保数据格式正确。`,
        showCancel: false
      });
    }
  },

  // 标准化导入数据格式
  normalizeImportData: function(importData) {
    let dataToImport = importData;
    
    // 处理嵌套格式（带有version、timestamp、data的格式）
    if (importData.data && typeof importData.data === 'object') {
      dataToImport = importData.data;
    }
    
    // 处理旧版本格式兼容性
    if (!dataToImport.exportTime) {
      dataToImport.exportTime = new Date().toISOString();
    }
    
    if (!dataToImport.appVersion) {
      dataToImport.appVersion = '1.0.0';
    }
    
    // 确保必需的字段存在
    if (!dataToImport.categories) {
      dataToImport.categories = [];
    }
    
    if (!dataToImport.logs) {
      dataToImport.logs = [];
    }
    
    if (!dataToImport.categoryGroups) {
      dataToImport.categoryGroups = [];
    }
    
    if (!dataToImport.categoryOrder) {
      dataToImport.categoryOrder = [];
    }
    
    return dataToImport;
  },

  // 显示导入预览
  showImportPreview: function(dataToImport) {
    const categoriesCount = dataToImport.categories ? dataToImport.categories.length : 0;
    const logsCount = dataToImport.logs ? dataToImport.logs.length : 0;
    const groupsCount = dataToImport.categoryGroups ? dataToImport.categoryGroups.length : 0;
    
    const exportTime = dataToImport.exportTime ? new Date(dataToImport.exportTime).toLocaleString() : '未知';
    
    wx.showModal({
      title: '确认导入数据',
      content: `即将导入以下数据：\n\n类别：${categoriesCount}个\n记录：${logsCount}条\n分组：${groupsCount}个\n\n导出时间：${exportTime}\n\n导入后将覆盖现有数据，确定继续吗？`,
      confirmColor: '#e74c3c',
      success: (res) => {
        if (res.confirm) {
          this.executeImport(dataToImport);
        }
      }
    });
  },

  // 执行导入
  executeImport: function(dataToImport) {
    try {
      // 导入数据
      const success = dataService.importAllData(dataToImport);
      
      if (success) {
        // 刷新页面数据
        this.loadSettings();
        
        wx.showModal({
          title: '导入成功',
          content: '数据已成功导入！请检查类别和记录是否正确。',
          showCancel: false,
          success: () => {
            // 关闭导入对话框
            this.setData({
              showImportModal: false,
              importFilePath: '',
              importFileName: '',
              importData: null,
              showImportWarning: false
            });
          }
        });
      } else {
        throw new Error('导入过程失败');
      }
    } catch (error) {
      console.error('导入执行失败:', error);
      wx.showModal({
        title: '导入失败',
        content: `导入过程中发生错误：${error.message}\n\n请检查数据格式是否正确。`,
        showCancel: false
      });
    }
  }
});