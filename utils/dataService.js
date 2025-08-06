/**
 * 数据服务
 * 负责管理应用的所有数据，包括类别、记录等
 */
const util = require('./util.js');

// 存储键名
const STORAGE_KEYS = {
  CATEGORIES: 'timeLogger_categories',
  LOGS: 'timeLogger_logs',
  ACTIVE_RECORD: 'timeLogger_activeRecord',
  PAUSED_RECORD: 'timeLogger_pausedRecord',
  CATEGORY_GROUPS: 'timeLogger_categoryGroups',
  CATEGORY_ORDER: 'timeLogger_categoryOrder',
  DARK_MODE: 'timeLogger_darkMode'
};

/**
 * 初始化数据服务
 */
const init = function() {
  // 检查是否已经初始化过类别
  const categories = wx.getStorageSync(STORAGE_KEYS.CATEGORIES);
  if (!categories || categories.length === 0) {
    // 初始化默认类别
    const defaultCategories = util.getDefaultCategories();
    wx.setStorageSync(STORAGE_KEYS.CATEGORIES, defaultCategories);
  }
  
  // 确保日志存储已初始化
  const logs = wx.getStorageSync(STORAGE_KEYS.LOGS);
  if (!logs) {
    wx.setStorageSync(STORAGE_KEYS.LOGS, []);
  }
};

/**
 * 获取所有类别
 * @param {boolean} sorted 是否按用户自定义顺序排序
 * @returns {Array} 类别数组
 */
const getCategories = function(sorted = true) {
  const categories = wx.getStorageSync(STORAGE_KEYS.CATEGORIES) || [];
  
  if (!sorted) {
    return categories;
  }
  
  // 获取用户自定义排序
  const categoryOrder = wx.getStorageSync(STORAGE_KEYS.CATEGORY_ORDER);
  
  if (!categoryOrder) {
    return categories;
  }
  
  // 按用户自定义顺序排序
  return [...categories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a.id);
    const indexB = categoryOrder.indexOf(b.id);
    
    // 如果某个类别不在排序列表中，放到最后
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    
    return indexA - indexB;
  });
};

/**
 * 获取指定ID的类别
 * @param {string} id 类别ID
 * @returns {Object|null} 类别对象，如果不存在则返回null
 */
const getCategoryById = function(id) {
  const categories = getCategories();
  return categories.find(cat => cat.id === id) || null;
};

/**
 * 添加新类别
 * @param {Object} category 类别对象
 * @param {string} groupId 分组ID，可选
 * @returns {Object} 添加后的类别对象
 */
const addCategory = function(category, groupId = null) {
  const categories = getCategories(false);
  
  // 生成唯一ID
  const newCategory = {
    ...category,
    id: util.generateUniqueId(),
    groupId: groupId
  };
  
  categories.push(newCategory);
  wx.setStorageSync(STORAGE_KEYS.CATEGORIES, categories);
  
  // 更新排序，将新类别添加到最前面
  const categoryOrder = wx.getStorageSync(STORAGE_KEYS.CATEGORY_ORDER) || [];
  categoryOrder.unshift(newCategory.id);
  wx.setStorageSync(STORAGE_KEYS.CATEGORY_ORDER, categoryOrder);
  
  return newCategory;
};

/**
 * 更新类别
 * @param {string} id 类别ID
 * @param {Object} updatedData 更新的数据
 * @returns {Object|null} 更新后的类别对象，如果不存在则返回null
 */
const updateCategory = function(id, updatedData) {
  const categories = getCategories(false);
  const index = categories.findIndex(cat => cat.id === id);
  
  if (index === -1) {
    return null;
  }
  
  // 更新类别
  categories[index] = {
    ...categories[index],
    ...updatedData
  };
  
  wx.setStorageSync(STORAGE_KEYS.CATEGORIES, categories);
  
  return categories[index];
};

/**
 * 更新类别排序
 * @param {Array} orderedCategories 排序后的类别数组
 * @returns {boolean} 是否更新成功
 */
const updateCategoriesOrder = function(orderedCategories) {
  try {
    // 保存类别数据
    wx.setStorageSync(STORAGE_KEYS.CATEGORIES, orderedCategories);
    
    // 更新排序数组
    const categoryOrder = orderedCategories.map(category => category.id);
    wx.setStorageSync(STORAGE_KEYS.CATEGORY_ORDER, categoryOrder);
    
    console.log('类别排序已更新:', categoryOrder);
    return true;
  } catch (error) {
    console.error('更新类别排序失败:', error);
    return false;
  }
};

/**
 * 删除类别
 * @param {string} id 类别ID
 * @returns {boolean} 是否删除成功
 */
const deleteCategory = function(id) {
  const categories = getCategories(false);
  const newCategories = categories.filter(cat => cat.id !== id);
  
  if (newCategories.length === categories.length) {
    return false; // 没有找到要删除的类别
  }
  
  wx.setStorageSync(STORAGE_KEYS.CATEGORIES, newCategories);
  
  // 从排序中移除
  const categoryOrder = wx.getStorageSync(STORAGE_KEYS.CATEGORY_ORDER) || [];
  const newOrder = categoryOrder.filter(catId => catId !== id);
  wx.setStorageSync(STORAGE_KEYS.CATEGORY_ORDER, newOrder);
  
  return true;
};

/**
 * 获取所有时间记录
 * @returns {Array} 记录数组
 */
const getLogs = function() {
  const logs = wx.getStorageSync(STORAGE_KEYS.LOGS) || [];
  
  // 为每条记录添加格式化的时间和持续时间
  return logs.map(log => {
    return {
      ...log,
      formattedStartTime: util.formatClock(new Date(log.startTime)),
      formattedEndTime: log.endTime ? util.formatClock(new Date(log.endTime)) : '进行中',
      formattedDuration: log.endTime ? util.formatDuration(log.endTime - log.startTime) : '进行中'
    };
  });
};

/**
 * 获取指定时间范围内的记录
 * @param {Date} startTime 开始时间
 * @param {Date} endTime 结束时间
 * @returns {Array} 记录数组
 */
const getLogsByTimeRange = function(startTime, endTime) {
  const logs = getLogs();
  
  return logs.filter(log => {
    // 只考虑已完成的记录
    if (!log.endTime) {
      return false;
    }
    
    // 检查记录是否在指定时间范围内
    return log.startTime >= startTime.getTime() && log.startTime <= endTime.getTime();
  });
};

/**
 * 获取指定ID的记录
 * @param {string} id 记录ID
 * @returns {Object|null} 记录对象，如果不存在则返回null
 */
const getLogById = function(id) {
  const logs = getLogs();
  return logs.find(log => log.id === id) || null;
};

/**
 * 获取当前活动的记录
 * @returns {Object|null} 活动记录对象，如果不存在则返回null
 */
const getActiveRecord = function() {
  const activeRecord = wx.getStorageSync(STORAGE_KEYS.ACTIVE_RECORD);
  
  if (!activeRecord) {
    return null;
  }
  
  // 添加格式化的时间
  const accumulatedTime = activeRecord.accumulatedTime || 0;
  const currentSessionTime = Date.now() - activeRecord.startTime;
  const totalDuration = accumulatedTime + currentSessionTime;
  
  return {
    ...activeRecord,
    formattedStartTime: util.formatClock(new Date(activeRecord.startTime)),
    duration: totalDuration,
    isPaused: false
  };
};

/**
 * 获取当前暂停的记录
 * @returns {Object|null} 暂停的记录对象，如果不存在则返回null
 */
const getPausedRecord = function() {
  const pausedRecord = wx.getStorageSync(STORAGE_KEYS.PAUSED_RECORD);
  
  if (!pausedRecord) {
    return null;
  }
  
  // 添加格式化的时间和暂停状态
  // duration 已经在暂停时计算并保存了，直接使用
  return {
    ...pausedRecord,
    formattedStartTime: util.formatClock(new Date(pausedRecord.startTime)),
    isPaused: true
  };
};

/**
 * 开始记录时间
 * @param {Object} category 类别对象
 * @returns {Object} 新创建的记录对象
 */
const startRecord = function(category) {
  // 先检查是否有活动中的记录
  const activeRecord = getActiveRecord();
  if (activeRecord) {
    // 如果有，先停止它
    stopRecord(activeRecord.id);
  }
  
  // 创建新记录
  const now = Date.now();
  const record = {
    id: util.generateUniqueId(),
    category: category,
    startTime: now,
    endTime: null,
    note: '',
    accumulatedTime: 0  // 初始化累计时间为0
  };
  
  // 保存为活动记录
  wx.setStorageSync(STORAGE_KEYS.ACTIVE_RECORD, record);
  
  // 添加到记录列表
  const logs = getLogs();
  logs.unshift(record);
  wx.setStorageSync(STORAGE_KEYS.LOGS, logs);
  
  return {
    ...record,
    formattedStartTime: util.formatClock(new Date(now)),
    duration: 0
  };
};

/**
 * 停止记录时间
 * @param {string} id 记录ID
 * @returns {Object|null} 更新后的记录对象，如果不存在则返回null
 */
const stopRecord = function(id) {
  const logs = getLogs();
  const index = logs.findIndex(log => log.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const now = Date.now();
  let endTime = now;
  let finalDuration = now - logs[index].startTime;
  
  // 检查是否是暂停状态的记录
  const pausedRecord = getPausedRecord();
  if (pausedRecord && pausedRecord.id === id) {
    // 如果是暂停状态，使用暂停时计算的持续时间
    finalDuration = pausedRecord.duration;
    endTime = pausedRecord.startTime + finalDuration;
    
    // 清除暂停记录
    wx.removeStorageSync(STORAGE_KEYS.PAUSED_RECORD);
    
    console.log('停止暂停记录:', {
      id: id,
      pausedDuration: pausedRecord.duration,
      calculatedEndTime: endTime
    });
  } else {
    // 如果是活动状态，需要考虑累积时间
    const activeRecord = getActiveRecord();
    if (activeRecord && activeRecord.id === id) {
      const accumulatedTime = activeRecord.accumulatedTime || 0;
      const currentSessionTime = now - activeRecord.startTime;
      finalDuration = accumulatedTime + currentSessionTime;
      endTime = logs[index].startTime + finalDuration;
      
      console.log('停止活动记录:', {
        id: id,
        accumulatedTime: accumulatedTime,
        currentSessionTime: currentSessionTime,
        finalDuration: finalDuration
      });
    }
    
    // 清除活动记录
    wx.removeStorageSync(STORAGE_KEYS.ACTIVE_RECORD);
  }
  
  // 更新记录的结束时间和状态
  logs[index].endTime = endTime;
  logs[index].isPaused = false; // 确保清除暂停状态
  
  // 保存更新后的记录
  wx.setStorageSync(STORAGE_KEYS.LOGS, logs);
  
  // 返回更新后的记录
  return {
    ...logs[index],
    formattedStartTime: util.formatClock(new Date(logs[index].startTime)),
    formattedEndTime: util.formatClock(new Date(endTime)),
    formattedDuration: util.formatDuration(finalDuration)
  };
};

/**
 * 更新记录
 * @param {string} id 记录ID
 * @param {Object} updatedData 更新的数据
 * @returns {Object|null} 更新后的记录对象，如果不存在则返回null
 */
const updateLog = function(id, updatedData) {
  const logs = getLogs();
  const index = logs.findIndex(log => log.id === id);
  
  if (index === -1) {
    return null;
  }
  
  // 更新记录
  logs[index] = {
    ...logs[index],
    ...updatedData
  };
  
  // 如果更新的是活动记录，也要更新活动记录存储
  const activeRecord = getActiveRecord();
  if (activeRecord && activeRecord.id === id) {
    wx.setStorageSync(STORAGE_KEYS.ACTIVE_RECORD, logs[index]);
  }
  
  wx.setStorageSync(STORAGE_KEYS.LOGS, logs);
  
  return logs[index];
};

/**
 * 更新记录备注
 * @param {string} id 记录ID
 * @param {string} note 备注内容
 * @returns {Object|null} 更新后的记录对象，如果不存在则返回null
 */
const updateRecordNote = function(id, note) {
  return updateLog(id, { note: note });
};

/**
 * 删除记录
 * @param {string} id 记录ID
 * @returns {boolean} 是否删除成功
 */
const deleteLog = function(id) {
  const logs = getLogs();
  const newLogs = logs.filter(log => log.id !== id);
  
  if (newLogs.length === logs.length) {
    return false; // 没有找到要删除的记录
  }
  
  // 如果删除的是活动记录，也要清除活动记录存储
  const activeRecord = getActiveRecord();
  if (activeRecord && activeRecord.id === id) {
    wx.removeStorageSync(STORAGE_KEYS.ACTIVE_RECORD);
  }
  
  wx.setStorageSync(STORAGE_KEYS.LOGS, newLogs);
  return true;
};

/**
 * 清除所有数据
 */
const clearAllData = function() {
  // 重置为默认类别
  const defaultCategories = util.getDefaultCategories();
  wx.setStorageSync(STORAGE_KEYS.CATEGORIES, defaultCategories);
  
  // 清除所有记录
  wx.setStorageSync(STORAGE_KEYS.LOGS, []);
  
  // 清除活动记录
  wx.removeStorageSync(STORAGE_KEYS.ACTIVE_RECORD);
};

/**
 * 暂停记录时间
 * @param {string} id 记录ID
 * @returns {Object|null} 暂停后的记录对象，如果不存在则返回null
 */
const pauseRecord = function(id) {
  const logs = getLogs();
  const index = logs.findIndex(log => log.id === id);
  
  if (index === -1) {
    return null;
  }
  
  // 获取活动记录
  const activeRecord = getActiveRecord();
  if (!activeRecord || activeRecord.id !== id) {
    return null;
  }
  
  // 计算已经记录的时间 - 使用累计时间模式
  const now = Date.now();
  const accumulatedTime = activeRecord.accumulatedTime || 0;
  const currentSessionTime = now - activeRecord.startTime;
  // 计算到暂停时刻的总有效时间
  const effectiveTime = accumulatedTime + currentSessionTime;
  
  // 更新记录，添加暂停时间
  const updatedRecord = {
    ...activeRecord,
    pauseTime: now,
    duration: effectiveTime, // 保存计算出的有效时间
    isPaused: true
  };
  
  // 保存为暂停记录
  wx.setStorageSync(STORAGE_KEYS.PAUSED_RECORD, updatedRecord);
  
  // 清除活动记录
  wx.removeStorageSync(STORAGE_KEYS.ACTIVE_RECORD);
  
  // 更新日志中的记录
  logs[index] = {
    ...logs[index],
    pauseTime: now,
    isPaused: true
  };
  wx.setStorageSync(STORAGE_KEYS.LOGS, logs);
  
  return {
    ...updatedRecord,
    formattedStartTime: util.formatClock(new Date(updatedRecord.startTime)),
    formattedPauseTime: util.formatClock(new Date(now)),
    duration: effectiveTime
  };
};

/**
 * 恢复记录时间
 * @returns {Object|null} 恢复后的记录对象，如果不存在则返回null
 */
const resumeRecord = function() {
  // 获取暂停的记录
  const pausedRecord = getPausedRecord();
  if (!pausedRecord) {
    return null;
  }
  
  const logs = getLogs();
  const index = logs.findIndex(log => log.id === pausedRecord.id);
  
  if (index === -1) {
    return null;
  }
  
  // 恢复时重新设计：重置startTime，保留暂停前的累计时间
  const now = Date.now();
  const accumulatedTime = pausedRecord.duration || 0; // 暂停前的累计时间
  
  // 更新记录：重置开始时间，清除暂停相关字段，保存累计时间
  const updatedRecord = {
    ...pausedRecord,
    startTime: now, // 重新设置开始时间为当前时间
    accumulatedTime: accumulatedTime, // 保存暂停前的累计时间
    isPaused: false
  };
  delete updatedRecord.pauseTime;
  delete updatedRecord.duration; // 移除固定的duration，恢复后需要动态计算
  
  // 保存为活动记录
  wx.setStorageSync(STORAGE_KEYS.ACTIVE_RECORD, updatedRecord);
  
  // 清除暂停记录
  wx.removeStorageSync(STORAGE_KEYS.PAUSED_RECORD);
  
  // 更新日志中的记录
  logs[index] = {
    ...logs[index],
    startTime: now, // 更新日志中的开始时间
    accumulatedTime: accumulatedTime,
    isPaused: false
  };
  delete logs[index].pauseTime;
  wx.setStorageSync(STORAGE_KEYS.LOGS, logs);
  
  return {
    ...updatedRecord,
    formattedStartTime: util.formatClock(new Date(now))
    // 不返回duration字段，强制使用动态计算
  };
};

/**
 * 获取所有类别分组
 * @returns {Array} 分组数组
 */
const getCategoryGroups = function() {
  return wx.getStorageSync(STORAGE_KEYS.CATEGORY_GROUPS) || [];
};

/**
 * 获取指定ID的分组
 * @param {string} id 分组ID
 * @returns {Object|null} 分组对象，如果不存在则返回null
 */
const getCategoryGroupById = function(id) {
  const groups = getCategoryGroups();
  return groups.find(group => group.id === id) || null;
};

/**
 * 添加新分组
 * @param {Object} group 分组对象
 * @returns {Object} 添加后的分组对象
 */
const addCategoryGroup = function(group) {
  const groups = getCategoryGroups();
  
  // 生成唯一ID
  const newGroup = {
    ...group,
    id: util.generateUniqueId()
  };
  
  groups.push(newGroup);
  wx.setStorageSync(STORAGE_KEYS.CATEGORY_GROUPS, groups);
  
  return newGroup;
};

/**
 * 更新分组
 * @param {string} id 分组ID
 * @param {Object} updatedData 更新的数据
 * @returns {Object|null} 更新后的分组对象，如果不存在则返回null
 */
const updateCategoryGroup = function(id, updatedData) {
  const groups = getCategoryGroups();
  const index = groups.findIndex(group => group.id === id);
  
  if (index === -1) {
    return null;
  }
  
  // 更新分组
  groups[index] = {
    ...groups[index],
    ...updatedData
  };
  
  wx.setStorageSync(STORAGE_KEYS.CATEGORY_GROUPS, groups);
  
  return groups[index];
};

/**
 * 删除分组
 * @param {string} id 分组ID
 * @returns {boolean} 是否删除成功
 */
const deleteCategoryGroup = function(id) {
  const groups = getCategoryGroups();
  const newGroups = groups.filter(group => group.id !== id);
  
  if (newGroups.length === groups.length) {
    return false; // 没有找到要删除的分组
  }
  
  wx.setStorageSync(STORAGE_KEYS.CATEGORY_GROUPS, newGroups);
  
  // 将该分组下的类别移到默认分组（无分组）
  const categories = getCategories(false);
  const updatedCategories = categories.map(cat => {
    if (cat.groupId === id) {
      return { ...cat, groupId: null };
    }
    return cat;
  });
  
  wx.setStorageSync(STORAGE_KEYS.CATEGORIES, updatedCategories);
  
  return true;
};

/**
 * 获取按分组组织的类别
 * @returns {Array} 分组及其类别数组
 */
const getCategoriesByGroup = function() {
  const categories = getCategories(true);
  const groups = getCategoryGroups();
  
  // 创建结果数组，包含所有分组及无分组
  const result = [
    {
      id: 'ungrouped',
      name: '未分组',
      categories: []
    }
  ];
  
  // 添加所有自定义分组
  groups.forEach(group => {
    result.push({
      ...group,
      categories: []
    });
  });
  
  // 将类别分配到对应的分组
  categories.forEach(category => {
    if (!category.groupId) {
      // 无分组的类别
      result[0].categories.push(category);
    } else {
      // 有分组的类别
      const groupIndex = result.findIndex(g => g.id === category.groupId);
      if (groupIndex !== -1) {
        result[groupIndex].categories.push(category);
      } else {
        // 如果分组不存在，放入未分组
        result[0].categories.push(category);
      }
    }
  });
  
  return result;
};

/**
 * 更新类别排序
 * @param {Array} categoryIds 按顺序排列的类别ID数组
 */
const updateCategoryOrder = function(categoryIds) {
  wx.setStorageSync(STORAGE_KEYS.CATEGORY_ORDER, categoryIds);
};

/**
 * 保存类别在分组内的排序
 * @param {string} groupId 分组ID，如果是未分组则传入'ungrouped'
 * @param {Array} categoryIds 按顺序排列的类别ID数组
 */
const saveCategoryOrderInGroup = function(groupId, categoryIds) {
  const key = `${STORAGE_KEYS.CATEGORY_ORDER}_${groupId}`;
  wx.setStorageSync(key, categoryIds);
  
  // 同时更新全局排序
  const allCategories = getCategories(false);
  const currentOrder = wx.getStorageSync(STORAGE_KEYS.CATEGORY_ORDER) || [];
  
  // 创建一个新的排序数组
  const newOrder = [];
  
  // 首先添加当前分组中的类别，按新的顺序
  categoryIds.forEach(id => {
    newOrder.push(id);
  });
  
  // 然后添加其他分组的类别，保持它们原来的顺序
  currentOrder.forEach(id => {
    const category = allCategories.find(c => c.id === id);
    const isInCurrentGroup = category && 
      ((groupId === 'ungrouped' && !category.groupId) || 
       (category.groupId === groupId));
    
    // 如果不在当前分组，则添加到新排序中
    if (!isInCurrentGroup && !newOrder.includes(id)) {
      newOrder.push(id);
    }
  });
  
  // 最后添加任何可能遗漏的类别
  allCategories.forEach(category => {
    if (!newOrder.includes(category.id)) {
      newOrder.push(category.id);
    }
  });
  
  // 保存全局排序
  updateCategoryOrder(newOrder);
  
  return newOrder;
};

/**
 * 获取类别使用频率统计
 * @param {number} days 统计的天数，默认为30天
 * @returns {Array} 类别使用频率数组，按使用次数降序排列
 */
const getCategoryUsageStats = function(days = 30) {
  const logs = getLogs();
  const categories = getCategories(false);
  const now = Date.now();
  const timeThreshold = now - (days * 24 * 60 * 60 * 1000); // 30天前的时间戳
  
  // 统计每个类别的使用次数
  const usageCount = {};
  
  logs.forEach(log => {
    // 只统计指定时间范围内的记录
    if (log.startTime >= timeThreshold) {
      const categoryId = log.category.id;
      usageCount[categoryId] = (usageCount[categoryId] || 0) + 1;
    }
  });
  
  // 为每个类别添加使用次数
  const result = categories.map(category => {
    return {
      ...category,
      usageCount: usageCount[category.id] || 0
    };
  });
  
  // 按使用次数降序排序
  return result.sort((a, b) => b.usageCount - a.usageCount);
};

/**
 * 从场景预设更新类别
 * @param {Array} sceneCategories 场景预设中的类别数组
 * @returns {Array} 更新后的类别数组
 */
const updateCategoriesFromScene = function(sceneCategories) {
  // 获取当前类别
  const currentCategories = getCategories(false);
  
  // 创建新的类别数组
  const newCategories = sceneCategories.map(sceneCat => {
    // 生成唯一ID
    return {
      id: util.generateUniqueId(),
      name: sceneCat.name,
      color: sceneCat.color,
      icon: sceneCat.icon,
      order: sceneCat.order || 0,
      groupId: '',
      archived: false,
      usageCount: 0,
      presetDuration: sceneCat.duration ? sceneCat.duration * 60 * 1000 : null // 转换为毫秒
    };
  });
  
  // 保存新的类别数组
  wx.setStorageSync(STORAGE_KEYS.CATEGORIES, newCategories);
  
  // 更新类别排序
  const categoryIds = newCategories.map(cat => cat.id);
  updateCategoryOrder(categoryIds);
  
  return newCategories;
};

/**
 * 获取暗黑模式设置
 * @returns {boolean} 是否启用暗黑模式
 */
const getDarkMode = function() {
  return wx.getStorageSync(STORAGE_KEYS.DARK_MODE) || false;
};

/**
 * 设置暗黑模式
 * @param {boolean} enabled 是否启用暗黑模式
 */
const setDarkMode = function(enabled) {
  wx.setStorageSync(STORAGE_KEYS.DARK_MODE, enabled);
};

/**
 * 导出所有数据
 * @returns {Object} 包含所有应用数据的对象
 */
const exportAllData = function() {
  return {
    categories: wx.getStorageSync(STORAGE_KEYS.CATEGORIES) || [],
    logs: wx.getStorageSync(STORAGE_KEYS.LOGS) || [],
    categoryGroups: wx.getStorageSync(STORAGE_KEYS.CATEGORY_GROUPS) || [],
    categoryOrder: wx.getStorageSync(STORAGE_KEYS.CATEGORY_ORDER) || [],
    darkMode: wx.getStorageSync(STORAGE_KEYS.DARK_MODE) || false,
    exportTime: new Date().toISOString(),
    appVersion: '1.0.0'
  };
};

/**
 * 导出选定的数据
 * @param {Object} options 选项对象，指定要导出哪些数据
 * @returns {Object} 包含选定应用数据的对象
 */
const exportSelectedData = function(options) {
  const result = {
    exportTime: new Date().toISOString(),
    appVersion: '1.0.0'
  };
  
  if (options.categories) {
    result.categories = wx.getStorageSync(STORAGE_KEYS.CATEGORIES) || [];
    result.categoryOrder = wx.getStorageSync(STORAGE_KEYS.CATEGORY_ORDER) || [];
  }
  
  if (options.timeRecords) {
    result.logs = wx.getStorageSync(STORAGE_KEYS.LOGS) || [];
  }
  
  if (options.groups) {
    result.categoryGroups = wx.getStorageSync(STORAGE_KEYS.CATEGORY_GROUPS) || [];
  }
  
  if (options.settings) {
    result.darkMode = wx.getStorageSync(STORAGE_KEYS.DARK_MODE) || false;
    // 可以添加其他设置项
  }
  
  return result;
};

/**
 * 导入所有数据
 * @param {Object} data 要导入的数据对象
 * @returns {boolean} 是否导入成功
 */
const importAllData = function(data) {
  try {
    // 验证数据格式
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    // 导入数据
    if (Array.isArray(data.categories)) {
      wx.setStorageSync(STORAGE_KEYS.CATEGORIES, data.categories);
    }
    
    if (Array.isArray(data.logs)) {
      wx.setStorageSync(STORAGE_KEYS.LOGS, data.logs);
    }
    
    if (Array.isArray(data.categoryGroups)) {
      wx.setStorageSync(STORAGE_KEYS.CATEGORY_GROUPS, data.categoryGroups);
    }
    
    if (Array.isArray(data.categoryOrder)) {
      wx.setStorageSync(STORAGE_KEYS.CATEGORY_ORDER, data.categoryOrder);
    }
    
    if (typeof data.darkMode === 'boolean') {
      wx.setStorageSync(STORAGE_KEYS.DARK_MODE, data.darkMode);
    }
    
    return true;
  } catch (error) {
    console.error('导入数据失败:', error);
    return false;
  }
};

/**
 * 更新活动记录
 * @param {Object} updatedRecord 更新的记录对象
 * @returns {Object} 更新后的记录对象
 */
const updateActiveRecord = function(updatedRecord) {
  if (!updatedRecord) {
    return null;
  }
  
  // 保存到活动记录存储
  wx.setStorageSync(STORAGE_KEYS.ACTIVE_RECORD, updatedRecord);
  
  // 同时更新日志中的对应记录
  const logs = getLogs();
  const index = logs.findIndex(log => log.id === updatedRecord.id);
  
  if (index !== -1) {
    // 更新日志中的记录（但不更新endTime，因为记录还在进行中）
    logs[index] = {
      ...logs[index],
      ...updatedRecord,
      endTime: null // 确保endTime保持为null，表示记录仍在进行
    };
    wx.setStorageSync(STORAGE_KEYS.LOGS, logs);
  }
  
  return updatedRecord;
};

module.exports = {
  init,
  getCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  updateCategoriesOrder,
  deleteCategory,
  getLogs,
  getLogsByTimeRange,
  getLogById,
  getActiveRecord,
  updateActiveRecord,
  getPausedRecord,
  startRecord,
  stopRecord,
  pauseRecord,
  resumeRecord,
  updateLog,
  updateRecordNote,
  deleteLog,
  clearAllData,
  getCategoryGroups,
  getCategoryGroupById,
  addCategoryGroup,
  updateCategoryGroup,
  deleteCategoryGroup,
  getCategoriesByGroup,
  updateCategoryOrder,
  getCategoryUsageStats,
  updateCategoriesFromScene,
  getDarkMode,
  setDarkMode,
  exportAllData,
  exportSelectedData,
  importAllData
};
