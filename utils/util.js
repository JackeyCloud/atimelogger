/**
 * 工具函数库
 */

/**
 * 格式化时间
 * @param {Date} date 日期对象
 * @returns {string} 格式化后的时间字符串，格式为 YYYY-MM-DD HH:mm:ss
 */
const formatTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':');
};

/**
 * 格式化日期
 * @param {Date} date 日期对象
 * @returns {string} 格式化后的日期字符串，格式为 YYYY-MM-DD
 */
const formatDate = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return [year, month, day].map(formatNumber).join('-');
};

/**
 * 格式化日期为月日
 * @param {Date} date 日期对象
 * @returns {string} 格式化后的日期字符串，格式为 MM-DD
 */
const formatMonthDay = date => {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return [month, day].map(formatNumber).join('-');
};

/**
 * 格式化时钟时间
 * @param {Date} date 日期对象
 * @returns {string} 格式化后的时间字符串，格式为 HH:mm
 */
const formatClock = date => {
  const hour = date.getHours();
  const minute = date.getMinutes();

  return [hour, minute].map(formatNumber).join(':');
};

/**
 * 格式化数字
 * @param {number} n 数字
 * @returns {string} 格式化后的字符串，个位数前补0
 */
const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : '0' + n;
};

/**
 * 格式化持续时间
 * @param {number} duration 持续时间（毫秒）
 * @returns {string} 格式化后的持续时间字符串，格式为 X小时Y分钟
 */
const formatDuration = duration => {
  // 将毫秒转换为分钟
  const totalMinutes = Math.floor(duration / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  } else {
    return `${minutes}分钟`;
  }
};

/**
 * 格式化计时器时间
 * @param {number} duration 持续时间（毫秒）
 * @returns {string} 格式化后的计时器时间字符串，格式为 HH:MM:SS
 */
const formatTimer = duration => {
  // 将毫秒转换为秒
  const totalSeconds = Math.floor(duration / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return [hours, minutes, seconds].map(formatNumber).join(':');
};

/**
 * 获取星期几
 * @param {Date} date 日期对象
 * @returns {string} 星期几的中文表示
 */
const getDayOfWeek = date => {
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return days[date.getDay()];
};

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
const generateUniqueId = () => {
  return 'id_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
};

/**
 * 获取默认类别
 * @returns {Array} 默认类别数组
 */
const getDefaultCategories = () => {
  return [
    {
      id: 'cat_work',
      name: '工作',
      color: '#3498db',
      icon: '💼'
    },
    {
      id: 'cat_study',
      name: '学习',
      color: '#2ecc71',
      icon: '📚'
    },
    {
      id: 'cat_sleep',
      name: '睡眠',
      color: '#9b59b6',
      icon: '😴'
    },
    {
      id: 'cat_exercise',
      name: '运动',
      color: '#e74c3c',
      icon: '🏃'
    },
    {
      id: 'cat_entertainment',
      name: '娱乐',
      color: '#f39c12',
      icon: '🎮'
    },
    {
      id: 'cat_social',
      name: '社交',
      color: '#1abc9c',
      icon: '👥'
    },
    {
      id: 'cat_eat',
      name: '用餐',
      color: '#e67e22',
      icon: '🍔'
    },
    {
      id: 'cat_commute',
      name: '通勤',
      color: '#34495e',
      icon: '🚌'
    },
    {
      id: 'cat_reading',
      name: '阅读',
      color: '#8e44ad',
      icon: '📖'
    },
    {
      id: 'cat_shopping',
      name: '购物',
      color: '#16a085',
      icon: '🛒'
    },
    {
      id: 'cat_housework',
      name: '家务',
      color: '#d35400',
      icon: '🧹'
    },
    {
      id: 'cat_movie',
      name: '电影',
      color: '#c0392b',
      icon: '🎬'
    },
    {
      id: 'cat_walking',
      name: '步行',
      color: '#27ae60',
      icon: '🚶'
    },
    {
      id: 'cat_washing',
      name: '洗漱',
      color: '#2980b9',
      icon: '🚿'
    },
    {
      id: 'cat_organizing',
      name: '整理',
      color: '#f1c40f',
      icon: '📦'
    },
    {
      id: 'cat_meditation',
      name: '冥想',
      color: '#7f8c8d',
      icon: '🧘'
    },
    {
      id: 'cat_misc',
      name: '杂事',
      color: '#95a5a6',
      icon: '📝'
    }
  ];
};

module.exports = {
  formatTime,
  formatDate,
  formatMonthDay,
  formatClock,
  formatNumber,
  formatDuration,
  formatTimer,
  getDayOfWeek,
  generateUniqueId,
  getDefaultCategories
};