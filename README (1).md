# 大骏极简时间记录

<div align="center">

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Platform](https://img.shields.io/badge/Platform-微信小程序-green.svg)
![Version](https://img.shields.io/badge/Version-1.0.0-orange.svg)

一款简洁高效的时间记录微信小程序，帮助您更好地管理和统计时间分配。

</div>

## 📱 产品简介

**大骏极简时间记录** 是一款专注于时间管理的微信小程序，采用极简设计理念，让时间记录变得简单直观。无论是工作、学习、运动还是休息，都能轻松记录并通过可视化图表了解自己的时间分配。

### ✨ 核心特性

- **🎯 一键记录** - 点击类别即可开始计时，操作简单快捷
- **⏰ 预设时长** - 支持番茄工作法等时间管理技巧
- **📊 多维统计** - 饼图、趋势图、柱状图多角度分析时间分配
- **🔍 智能筛选** - 按类别、时间范围快速查找历史记录
- **💾 数据备份** - 支持数据导出导入，确保数据安全
- **🌙 主题切换** - 支持浅色/深色主题，保护视力
- **🔒 隐私安全** - 所有数据本地存储，绝不上传到服务器

## 🚀 主要功能

### 📝 时间记录
- **实时计时**: 精确记录活动时间，支持暂停/恢复
- **类别管理**: 自定义活动类别，支持图标和颜色个性化
- **预设时长**: 设置计划时长，时间到达时自动提醒
- **记录编辑**: 可修改历史记录的时间、类别和备注

### 📈 数据统计
- **时间范围**: 支持查看今天、本周、本月、今年的统计
- **多种图表**: 
  - 🥧 **饼图** - 直观显示各类别时间占比
  - 📈 **趋势图** - 展示时间分配的变化趋势
  - 📊 **柱状图** - 对比各类别的总时长
- **详细数据**: 显示具体时长、百分比等统计信息

### 🔍 历史查询
- **智能搜索**: 支持按关键词搜索记录内容
- **灵活筛选**: 按类别、日期范围进行筛选
- **组合查询**: 支持搜索和筛选条件的组合使用

### ⚙️ 设置管理
- **数据导出**: 支持导出为JSON格式文件或复制到剪贴板
- **数据导入**: 支持从文件或剪贴板导入备份数据
- **主题设置**: 浅色/深色主题切换
- **类别管理**: 添加、编辑、删除自定义类别

## 🏗️ 项目结构

```
📦 大骏极简时间记录
├── 📁 pages/                    # 页面目录
│   ├── 📁 index/                # 主页 - 时间记录
│   ├── 📁 logs/                 # 历史记录页面
│   ├── 📁 statistics/           # 统计分析页面
│   ├── 📁 settings/             # 设置页面
│   ├── 📁 edit-log/             # 记录编辑页面
│   ├── 📁 privacy/              # 隐私政策页面
│   └── 📁 faq/                  # 常见问题页面
├── 📁 components/               # 组件目录
│   ├── 📁 chart/                # 图表组件
│   ├── 📁 feature-carousel/     # 功能轮播组件
│   └── 📁 guide-tip/            # 引导提示组件
├── 📁 utils/                    # 工具库
│   ├── 📄 dataService.js        # 数据服务
│   ├── 📄 util.js               # 通用工具函数
│   └── 📄 animation.js          # 动画工具
├── 📄 app.js                    # 应用入口
├── 📄 app.json                  # 应用配置
├── 📄 app.wxss                  # 全局样式
└── 📄 README.md                 # 项目说明文档
```

## 💡 技术特点

### 📱 微信小程序原生开发
- 使用微信小程序原生框架开发
- 充分利用微信小程序的生态优势
- 完美适配微信环境，用户体验流畅

### 🎨 现代化UI设计
- 采用卡片式设计，界面简洁美观
- 响应式布局，适配不同屏幕尺寸
- 丰富的动画效果，提升用户体验

### 📊 强大的图表系统
- 自研Canvas图表组件
- 支持饼图、折线图、柱状图多种类型
- 动态数据更新，实时统计展示

### 💾 本地数据存储
- 使用微信小程序本地存储API
- 数据加密存储，保护用户隐私
- 完整的数据导出导入功能

### ⚡ 性能优化
- 组件化开发，代码复用性高
- 页面懒加载，提升应用启动速度
- 定时器优化，避免后台性能损耗

## 🚀 快速开始

### 环境要求
- 微信开发者工具 1.06.2504010 或更高版本
- Node.js 14.0+ (用于开发调试)

### 本地开发

1. **克隆项目**
```bash
git clone [repository-url]
cd timelogger-miniprogram
```

2. **导入项目**
- 打开微信开发者工具
- 选择"导入项目"
- 选择项目目录
- 填入AppID（或选择测试号）

3. **编译运行**
- 点击"编译"按钮
- 在模拟器中预览效果
- 或使用真机调试

### 项目配置

在 `project.config.json` 中配置项目信息：

```json
{
  "projectname": "大骏极简时间记录",
  "miniprogramRoot": "./",
  "compileType": "miniprogram"
}
```

## 📖 使用指南

### 开始记录时间

1. **选择类别**: 在主页点击对应的活动类别
2. **设置时长**: 可选择预设时长或直接开始
3. **开始计时**: 点击"开始记录"按钮
4. **管理记录**: 支持暂停、恢复、停止操作

### 查看历史记录

1. **进入历史页面**: 点击底部"历史"标签
2. **搜索记录**: 在搜索框输入关键词
3. **筛选数据**: 按类别、时间范围筛选
4. **编辑记录**: 点击记录可修改详细信息

### 数据统计分析

1. **选择时间范围**: 今天/本周/本月/今年
2. **切换图表类型**: 饼图/趋势图/柱状图
3. **查看详细数据**: 类别时长、占比等信息

### 数据备份恢复

1. **数据导出**: 设置→数据导出→选择导出方式
2. **数据导入**: 设置→数据导入→选择导入源
3. **注意事项**: 导入将覆盖现有数据，请谨慎操作

## 🛠️ 开发指南

### 核心模块说明

#### dataService.js - 数据服务
负责所有数据的增删改查操作：
- 类别管理（getCategories, addCategory, updateCategory, deleteCategory）
- 记录管理（startRecord, stopRecord, getLogsByTimeRange）
- 数据导入导出（exportSelectedData, importAllData）

#### util.js - 工具函数
提供通用的工具函数：
- 时间格式化（formatTime, formatDate, formatClock）
- 数据处理（formatDuration, formatTimer）
- ID生成（generateUniqueId）

#### chart组件 - 图表组件
自研的Canvas图表组件：
- 支持多种图表类型
- 动态数据更新
- 响应式设计

### 添加新功能

1. **新增页面**
```bash
# 在pages目录下创建新页面
mkdir pages/new-page
touch pages/new-page/new-page.js
touch pages/new-page/new-page.wxml
touch pages/new-page/new-page.wxss
touch pages/new-page/new-page.json
```

2. **注册页面**
在 `app.json` 中添加页面路径：
```json
{
  "pages": [
    "pages/new-page/new-page"
  ]
}
```

3. **添加组件**
```bash
# 在components目录下创建新组件
mkdir components/new-component
touch components/new-component/new-component.js
touch components/new-component/new-component.wxml
touch components/new-component/new-component.wxss
touch components/new-component/new-component.json
```

## 🔒 隐私安全

### 数据保护承诺
- **本地存储**: 所有数据仅存储在用户设备本地
- **无服务器**: 不将任何数据上传到远程服务器
- **用户控制**: 用户拥有数据的完全控制权
- **透明开源**: 代码开源，用户可自由查看和修改

### 权限说明
本小程序仅使用以下必要权限：
- **本地存储**: 保存用户的时间记录和设置
- **剪贴板**: 用于数据导出导入功能（可选）
- **文件分享**: 用于数据文件分享功能（可选）

## 🤝 贡献指南

我们欢迎各种形式的贡献！

### 报告问题
- 使用 GitHub Issues 报告 Bug
- 详细描述问题复现步骤
- 提供错误截图或日志

### 功能建议
- 通过 Issues 提交功能请求
- 详细说明功能需求和使用场景
- 参与讨论和设计方案

### 代码贡献
1. Fork 项目到您的 GitHub
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📞 联系我们

如果您有任何问题、建议或合作意向，欢迎通过以下方式联系：

- **电子邮件**: 1945000000@qq.com
- **微信公众号**: 大骏的百宝箱
- **微信号**: ui1945
- **GitHub Issues**: [项目Issues页面]

我们承诺在24小时内回复您的问题。

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📋 更新日志

### v1.0.0 (2025-08-05)
- ✨ 发布初始版本
- 🎯 实现基础时间记录功能
- 📊 添加多种统计图表
- 🔍 支持搜索和筛选
- 💾 实现数据导入导出
- 🌙 支持主题切换
- 📱 完整的微信小程序功能

---

<div align="center">

**感谢使用大骏极简时间记录！** 

如果这个项目对您有帮助，请给我们一个 ⭐ Star ⭐

</div>