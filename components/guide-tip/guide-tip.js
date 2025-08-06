// components/guide-tip/guide-tip.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: true
    },
    type: {
      type: String,
      value: 'addToMiniProgram' // 'addToMiniProgram' 或 'addToDesktop'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    text: '',
    icon: '📌'
  },

  lifetimes: {
    attached: function() {
      // 根据类型设置提示文本
      const type = this.properties.type;
      if (type === 'addToMiniProgram') {
        this.setData({
          text: '点击 "..." 添加到我的小程序，方便下次使用'
        });
      } else if (type === 'addToDesktop') {
        this.setData({
          text: '点击 "..." 添加到桌面，随时记录您的时间'
        });
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onClose() {
      this.setData({
        show: false
      });
      
      // 记录已经显示过
      const key = `guideTip_${this.properties.type}`;
      wx.setStorageSync(key, true);
      
      this.triggerEvent('close');
    }
  }
})
