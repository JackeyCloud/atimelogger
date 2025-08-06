/**
 * 动画工具函数库
 */

/**
 * 创建淡入动画
 * @param {number} duration 动画持续时间（毫秒）
 * @returns {Object} 动画对象
 */
const createFadeInAnimation = (duration = 300) => {
  const animation = wx.createAnimation({
    duration: duration,
    timingFunction: 'ease',
  });
  animation.opacity(0).step({ duration: 0 });
  animation.opacity(1).step({ duration });
  return animation;
};

/**
 * 创建淡出动画
 * @param {number} duration 动画持续时间（毫秒）
 * @returns {Object} 动画对象
 */
const createFadeOutAnimation = (duration = 300) => {
  const animation = wx.createAnimation({
    duration: duration,
    timingFunction: 'ease',
  });
  animation.opacity(1).step({ duration: 0 });
  animation.opacity(0).step({ duration });
  return animation;
};

/**
 * 创建上滑进入动画
 * @param {number} duration 动画持续时间（毫秒）
 * @param {number} distance 滑动距离（rpx）
 * @returns {Object} 动画对象
 */
const createSlideUpAnimation = (duration = 300, distance = 50) => {
  const animation = wx.createAnimation({
    duration: duration,
    timingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  });
  animation.translateY(distance).opacity(0).step({ duration: 0 });
  animation.translateY(0).opacity(1).step({ duration });
  return animation;
};

/**
 * 创建下滑退出动画
 * @param {number} duration 动画持续时间（毫秒）
 * @param {number} distance 滑动距离（rpx）
 * @returns {Object} 动画对象
 */
const createSlideDownAnimation = (duration = 300, distance = 50) => {
  const animation = wx.createAnimation({
    duration: duration,
    timingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  });
  animation.translateY(0).opacity(1).step({ duration: 0 });
  animation.translateY(distance).opacity(0).step({ duration });
  return animation;
};

/**
 * 创建缩放进入动画
 * @param {number} duration 动画持续时间（毫秒）
 * @param {number} startScale 起始缩放比例
 * @returns {Object} 动画对象
 */
const createScaleInAnimation = (duration = 300, startScale = 0.9) => {
  const animation = wx.createAnimation({
    duration: duration,
    timingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  });
  animation.scale(startScale).opacity(0).step({ duration: 0 });
  animation.scale(1).opacity(1).step({ duration });
  return animation;
};

/**
 * 创建缩放退出动画
 * @param {number} duration 动画持续时间（毫秒）
 * @param {number} endScale 结束缩放比例
 * @returns {Object} 动画对象
 */
const createScaleOutAnimation = (duration = 300, endScale = 0.9) => {
  const animation = wx.createAnimation({
    duration: duration,
    timingFunction: 'ease',
  });
  animation.scale(1).opacity(1).step({ duration: 0 });
  animation.scale(endScale).opacity(0).step({ duration });
  return animation;
};

/**
 * 创建脉冲动画
 * @param {number} duration 动画持续时间（毫秒）
 * @param {number} scale 最大缩放比例
 * @returns {Object} 动画对象
 */
const createPulseAnimation = (duration = 1500, scale = 1.05) => {
  const animation = wx.createAnimation({
    duration: duration,
    timingFunction: 'ease-in-out',
  });
  animation.scale(1).step({ duration: duration / 3 });
  animation.scale(scale).step({ duration: duration / 3 });
  animation.scale(1).step({ duration: duration / 3 });
  return animation;
};

/**
 * 创建摇晃动画
 * @param {number} duration 动画持续时间（毫秒）
 * @param {number} angle 摇晃角度（度）
 * @returns {Object} 动画对象
 */
const createShakeAnimation = (duration = 500, angle = 5) => {
  const animation = wx.createAnimation({
    duration: duration,
    timingFunction: 'ease-in-out',
  });
  animation.rotate(0).step({ duration: duration / 5 });
  animation.rotate(angle).step({ duration: duration / 5 });
  animation.rotate(-angle).step({ duration: duration / 5 });
  animation.rotate(angle).step({ duration: duration / 5 });
  animation.rotate(0).step({ duration: duration / 5 });
  return animation;
};

/**
 * 创建按钮点击动画
 * @returns {Object} 动画对象
 */
const createButtonTapAnimation = () => {
  const animation = wx.createAnimation({
    duration: 100,
    timingFunction: 'ease',
  });
  animation.scale(1).step({ duration: 0 });
  animation.scale(0.95).step({ duration: 100 });
  animation.scale(1).step({ duration: 100 });
  return animation;
};

/**
 * 创建卡片悬浮动画
 * @param {number} duration 动画持续时间（毫秒）
 * @param {number} liftDistance 上浮距离（rpx）
 * @returns {Object} 动画对象
 */
const createCardHoverAnimation = (duration = 200, liftDistance = 10) => {
  const animation = wx.createAnimation({
    duration: duration,
    timingFunction: 'ease-out',
  });
  animation.translateY(0).scale(1).shadow(0, 2, 10, 'rgba(0, 0, 0, 0.1)').step({ duration: 0 });
  animation.translateY(-liftDistance).scale(1.02).shadow(0, 10, 20, 'rgba(0, 0, 0, 0.15)').step({ duration });
  return animation;
};

/**
 * 创建卡片恢复动画
 * @param {number} duration 动画持续时间（毫秒）
 * @returns {Object} 动画对象
 */
const createCardRestoreAnimation = (duration = 200) => {
  const animation = wx.createAnimation({
    duration: duration,
    timingFunction: 'ease-out',
  });
  animation.translateY(-10).scale(1.02).shadow(0, 10, 20, 'rgba(0, 0, 0, 0.15)').step({ duration: 0 });
  animation.translateY(0).scale(1).shadow(0, 2, 10, 'rgba(0, 0, 0, 0.1)').step({ duration });
  return animation;
};

module.exports = {
  createFadeInAnimation,
  createFadeOutAnimation,
  createSlideUpAnimation,
  createSlideDownAnimation,
  createScaleInAnimation,
  createScaleOutAnimation,
  createPulseAnimation,
  createShakeAnimation,
  createButtonTapAnimation,
  createCardHoverAnimation,
  createCardRestoreAnimation
};