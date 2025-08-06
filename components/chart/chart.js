Component({
  properties: {
    chartType: {
      type: String,
      value: 'pie' // 'pie', 'line', 'bar'
    },
    chartData: {
      type: Object,
      value: {}
    },
    width: {
      type: String,
      value: '100%'
    },
    height: {
      type: String,
      value: '300rpx'
    }
  },
  
  data: {
    ctx: null,
    canvasId: 'chartCanvas',
    isReady: false
  },
  
  lifetimes: {
    attached() {
      this.setData({
        canvasId: `chartCanvas_${Math.random().toString(36).substr(2, 9)}`
      });
    },
    
    ready() {
      const query = this.createSelectorQuery();
      query.select(`#${this.data.canvasId}`)
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res[0]) {
            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');
            
            const dpr = wx.getSystemInfoSync().pixelRatio;
            canvas.width = res[0].width * dpr;
            canvas.height = res[0].height * dpr;
            ctx.scale(dpr, dpr);
            
            this.setData({ ctx, isReady: true }, () => {
              this.drawChart();
            });
          }
        });
    }
  },
  
  observers: {
    'chartData': function(newData) {
      if (this.data.isReady && newData) {
        this.drawChart();
      }
    },
    'chartType': function(newType) {
      if (this.data.isReady && newType && this.data.chartData) {
        this.drawChart();
      }
    }
  },
  
  methods: {
    drawChart() {
      const { ctx, chartType, chartData } = this.data;
      if (!ctx || !chartType) return;
      
      // 如果chartData为空或无效，清空画布并返回
      if (!chartData || !chartData.data || chartData.data.length === 0) {
        const canvas = ctx.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      
      // 彻底清除画布，避免图例残留
      const canvas = ctx.canvas;
      const dpr = wx.getSystemInfoSync().pixelRatio;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 重置画布状态
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      
      switch (chartType) {
        case 'pie':
          this.drawPieChart();
          break;
        case 'line':
          this.drawLineChart();
          break;
        case 'bar':
          this.drawBarChart();
          break;
        default:
          console.error('不支持的图表类型:', chartType);
      }
      
      // 恢复画布状态
      ctx.restore();
    },
    
    drawPieChart() {
      const { ctx, chartData } = this.data;
      const canvas = ctx.canvas;
      const width = canvas.width / wx.getSystemInfoSync().pixelRatio;
      const height = canvas.height / wx.getSystemInfoSync().pixelRatio;
      const centerX = width / 2;
      const centerY = height / 2 - 20; // 向上移动饼图中心，为图例留出更多空间
      const radius = Math.min(centerX, centerY) * 0.7; // 减小饼图半径
      
      // 计算总和
      const total = chartData.data.reduce((sum, item) => sum + item.value, 0);
      
      // 绘制饼图
      let startAngle = -Math.PI / 2; // 从12点钟位置开始
      
      // 绘制扇形
      chartData.data.forEach((item) => {
        const percentage = item.value / total;
        const endAngle = startAngle + (2 * Math.PI * percentage);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();
        
        startAngle = endAngle;
      });
      
      // 分多行绘制图例，每行最多显示3个
      const legendItemHeight = 25; // 每个图例项的高度
      const legendItemWidth = width / 3; // 每行3个图例
      const legendStartY = height - (Math.ceil(chartData.data.length / 3) * legendItemHeight);
      
      chartData.data.forEach((item, index) => {
        const percentage = item.value / total;
        const row = Math.floor(index / 3);
        const col = index % 3;
        
        const legendX = (col * legendItemWidth) + 10;
        const legendY = legendStartY + (row * legendItemHeight);
        
        // 绘制图例颜色方块
        ctx.fillStyle = item.color;
        ctx.fillRect(legendX, legendY, 10, 10);
        
        // 绘制图例文字
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        
        // 截断过长的名称
        let displayName = item.name;
        if (ctx.measureText(displayName).width > legendItemWidth - 50) {
          // 如果名称太长，截断并添加省略号
          let truncated = '';
          for (let i = 0; i < displayName.length; i++) {
            if (ctx.measureText(truncated + displayName[i] + '...').width < legendItemWidth - 50) {
              truncated += displayName[i];
            } else {
              displayName = truncated + '...';
              break;
            }
          }
        }
        
        ctx.fillText(`${displayName} (${(percentage * 100).toFixed(1)}%)`, legendX + 15, legendY + 9);
      });
    },
    
    drawLineChart() {
      const { ctx, chartData } = this.data;
      const canvas = ctx.canvas;
      const width = canvas.width / wx.getSystemInfoSync().pixelRatio;
      const height = canvas.height / wx.getSystemInfoSync().pixelRatio;
      const padding = 50; // 增加左侧空间以容纳更长的Y轴标签
      
      const availableWidth = width - (padding * 2);
      const availableHeight = height - (padding * 2);
      
      // 找出最大值
      let maxValue = 0;
      chartData.data.forEach(series => {
        const seriesMax = Math.max(...series.values);
        if (seriesMax > maxValue) maxValue = seriesMax;
      });
      
      // 如果最大值太小，设置一个最小值以避免图表太扁平
      if (maxValue < 0.1) maxValue = 0.1;
      
      // 绘制图例 - 平衡空间利用和显示清晰度
      const legendItemHeight = 22; // 适中的图例项高度，确保文字清晰
      const legendItemWidth = (width - padding * 2) / 3; // 每行3个图例，确保有足够宽度
      const legendRows = Math.ceil(chartData.data.length / 3);
      const legendHeight = Math.min(legendRows * legendItemHeight, 50); // 适当增加图例高度限制
      
      // 绘制图例背景
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(padding, padding, width - padding * 2, legendHeight);
      
      chartData.data.forEach((series, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        
        const legendX = (col * legendItemWidth) + padding;
        const legendY = padding + (row * legendItemHeight);
        
        // 绘制图例颜色线条
        ctx.strokeStyle = series.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(legendX, legendY + 5);
        ctx.lineTo(legendX + 15, legendY + 5);
        ctx.stroke();
        
        // 绘制图例点
        ctx.beginPath();
        ctx.arc(legendX + 7.5, legendY + 5, 3, 0, Math.PI * 2);
        ctx.fillStyle = series.color;
        ctx.fill();
        
        // 绘制图例文字
        ctx.fillStyle = '#333';
        ctx.font = '11px Arial'; // 适中的字体大小，确保清晰度
        ctx.textAlign = 'left';
        
        // 截断过长的名称
        let displayName = series.name;
        if (ctx.measureText(displayName).width > legendItemWidth - 30) {
          // 如果名称太长，截断并添加省略号
          let truncated = '';
          for (let i = 0; i < displayName.length; i++) {
            if (ctx.measureText(truncated + displayName[i] + '...').width < legendItemWidth - 30) {
              truncated += displayName[i];
            } else {
              displayName = truncated + '...';
              break;
            }
          }
        }
        
        ctx.fillText(displayName, legendX + 20, legendY + 9);
      });
      
      // 调整图表区域，平衡图例和图表空间
      const chartTopPadding = padding + legendHeight + 8; // 适中的图例与图表间距
      const chartAvailableHeight = availableHeight - legendHeight - 25; // 确保Y轴标签有足够空间
      
      // 绘制坐标轴
      ctx.beginPath();
      ctx.moveTo(padding, chartTopPadding);
      ctx.lineTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.strokeStyle = '#ccc';
      ctx.stroke();
      
      // 绘制X轴标签
      const xStep = availableWidth / (chartData.labels.length - 1);
      chartData.labels.forEach((label, index) => {
        const x = padding + (index * xStep);
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, height - padding + 20);
      });
      
      // 绘制Y轴标签 - 减少标签数量以增加间距
      const yLabelCount = 3; // 进一步减少到3个标签点，增加更多间距
      const yStep = chartAvailableHeight / (yLabelCount - 1);
      for (let i = 0; i < yLabelCount; i++) {
        const y = chartTopPadding + chartAvailableHeight - (i * yStep);
        // 格式化Y轴数值，显示为用户友好的时间格式
        let value = maxValue / (yLabelCount - 1) * i;
        let formattedValue;
        
        if (value >= 1) {
          // 对于大于等于1小时的值，使用简洁格式
          const hours = Math.round(value * 10) / 10;
          if (hours >= 10) {
            // 大于等于10小时时，使用简写"XXh"格式节省空间
            formattedValue = `${Math.floor(hours)}h`;
          } else if (hours === Math.floor(hours)) {
            formattedValue = `${Math.floor(hours)}时`;
          } else {
            formattedValue = `${hours}时`;
          }
        } else if (value >= 0.1) {
          // 对于小于1小时但大于等于0.1小时的值，转换为分钟显示
          const minutes = Math.round(value * 60);
          formattedValue = `${minutes}分`;
        } else if (value > 0) {
          // 对于很小的值，转换为分钟显示
          const minutes = Math.round(value * 60);
          formattedValue = minutes > 0 ? `${minutes}分` : "1分";
        } else {
          formattedValue = "0";
        }
        
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial'; // 保持清晰的字体大小
        ctx.textAlign = 'right';
        ctx.fillText(formattedValue, padding - 6, y + 4);
        
        // 绘制网格线
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.strokeStyle = '#eee';
        ctx.stroke();
      }
      
      // 绘制数据线
      chartData.data.forEach(series => {
        ctx.beginPath();
        series.values.forEach((value, index) => {
          const x = padding + (index * xStep);
          const y = height - padding - (value / maxValue * chartAvailableHeight);
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        
        ctx.strokeStyle = series.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制数据点
        series.values.forEach((value, index) => {
          const x = padding + (index * xStep);
          const y = height - padding - (value / maxValue * chartAvailableHeight);
          
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = series.color;
          ctx.fill();
        });
      });
    },
    
    drawBarChart() {
      const { ctx, chartData } = this.data;
      const canvas = ctx.canvas;
      const width = canvas.width / wx.getSystemInfoSync().pixelRatio;
      const height = canvas.height / wx.getSystemInfoSync().pixelRatio;
      const padding = 55; // 增加左侧空间以容纳更长的Y轴标签
      
      const availableWidth = width - (padding * 2);
      const availableHeight = height - (padding * 2);
      
      // 找出最大值
      let maxValue = Math.max(...chartData.data.map(item => item.value));
      
      // 如果最大值太小，设置一个最小值以避免图表太扁平
      if (maxValue < 0.1) maxValue = 0.1;
      
      // 绘制坐标轴
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.strokeStyle = '#ccc';
      ctx.stroke();
      
      // 绘制柱状图 - 优化间距以改善标签显示
      const totalItems = chartData.data.length;
      const totalWidth = availableWidth / totalItems;
      
      // 动态调整柱子宽度和间距，优先保证标签显示
      let barWidth, barSpacing;
      if (totalItems <= 3) {
        // 项目较少时，可以使用较宽的柱子
        barWidth = Math.min(totalWidth * 0.5, 60); // 稍微减小柱子宽度
        barSpacing = (totalWidth - barWidth);
      } else if (totalItems <= 6) {
        // 中等数量项目，平衡柱子和标签空间
        barWidth = Math.min(totalWidth * 0.35, 40); // 减小柱子宽度，增加标签空间
        barSpacing = (totalWidth - barWidth);
      } else {
        // 项目较多时，优先保证标签空间
        barWidth = Math.min(totalWidth * 0.3, 25); // 进一步减小柱子宽度
        barSpacing = (totalWidth - barWidth);
      }
      
      chartData.data.forEach((item, index) => {
        const x = padding + (index * (barWidth + barSpacing)) + barSpacing / 2;
        const barHeight = (item.value / maxValue) * availableHeight;
        const y = height - padding - barHeight;
        
        // 绘制柱子
        ctx.fillStyle = item.color;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // 将小时转换为分钟显示，使小数值更易理解
        let formattedValue;
        const minutes = Math.round(item.value * 60); // 转换为分钟
        
        if (minutes >= 60) {
          const hours = Math.floor(minutes / 60);
          const remainingMinutes = minutes % 60;
          if (remainingMinutes === 0) {
            formattedValue = `${hours}小时`;
          } else {
            formattedValue = `${hours}时${remainingMinutes}分`;
          }
        } else {
          formattedValue = `${minutes}分钟`;
        }
        
        // 绘制数值，根据空间决定是否显示
        ctx.fillStyle = '#333';
        ctx.font = '11px Arial'; // 稍微减小字体
        ctx.textAlign = 'center';
        
        // 只有当柱子高度足够或间距足够时才显示数值
        const minBarHeight = 30; // 最小柱子高度
        const minSpacing = 40; // 最小间距
        
        if (barHeight > minBarHeight && totalWidth > minSpacing) {
          // 简化数值显示格式
          let simpleValue;
          if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            if (remainingMinutes === 0) {
              simpleValue = `${hours}h`;
            } else {
              simpleValue = `${hours}h${remainingMinutes}m`;
            }
          } else if (minutes > 0) {
            simpleValue = `${minutes}分`;
          } else {
            simpleValue = "0";
          }
          
          ctx.fillText(simpleValue, x + barWidth / 2, y - 8);
        }
        
        // 绘制标签，智能处理空间不足的问题
        ctx.fillStyle = '#666';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        
        // 计算可用的标签宽度（更加宽松的限制）
        const availableLabelWidth = Math.max(totalWidth * 0.8, 20); // 确保有最小宽度
        let displayName = item.name;
        
        // 根据可用空间智能调整显示，更宽松的阈值
        if (totalWidth < 25) {
          // 空间极小，只显示首字符
          displayName = item.name.charAt(0);
        } else if (totalWidth < 40) {
          // 空间较小，尽量显示完整名称或前两个字符
          if (ctx.measureText(item.name).width <= availableLabelWidth) {
            displayName = item.name; // 如果能完整显示就完整显示
          } else {
            displayName = item.name.substring(0, 2);
          }
        } else if (ctx.measureText(displayName).width > availableLabelWidth) {
          // 空间充足但名称太长，智能截断
          let truncated = '';
          for (let i = 0; i < displayName.length; i++) {
            const testText = truncated + displayName[i] + (i < displayName.length - 1 ? '...' : '');
            if (ctx.measureText(testText).width <= availableLabelWidth) {
              truncated += displayName[i];
            } else {
              displayName = truncated + '...';
              break;
            }
          }
        }
        
        // 优化标签位置
        const labelY = height - padding + 18;
        ctx.fillText(displayName, x + barWidth / 2, labelY);
      });
      
      // 绘制Y轴标签 - 减少标签数量以增加间距
      const yLabelCount = 3; // 进一步减少到3个标签点，增加更多间距
      const yStep = availableHeight / (yLabelCount - 1);
      for (let i = 0; i < yLabelCount; i++) {
        const y = height - padding - (i * yStep);
        
        // 格式化Y轴数值，使用简洁的时间格式
        let value = maxValue / (yLabelCount - 1) * i;
        let formattedValue;
        
        const minutes = Math.round(value * 60); // 转换为分钟
        if (minutes >= 60) {
          const hours = Math.floor(minutes / 60);
          const remainingMinutes = minutes % 60;
          if (hours >= 10) {
            // 大于等于10小时时，使用简写格式节省空间
            if (remainingMinutes === 0) {
              formattedValue = `${hours}h`;
            } else {
              formattedValue = `${hours}h${remainingMinutes}m`;
            }
          } else {
            // 小于10小时时，使用中文格式
            if (remainingMinutes === 0) {
              formattedValue = `${hours}时`;
            } else {
              formattedValue = `${hours}h${remainingMinutes}m`;
            }
          }
        } else if (minutes > 0) {
          formattedValue = `${minutes}分`;
        } else {
          formattedValue = "0";
        }
        
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial'; // 保持清晰的字体大小
        ctx.textAlign = 'right';
        ctx.fillText(formattedValue, padding - 6, y + 4);
        
        // 绘制网格线
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.strokeStyle = '#eee';
        ctx.stroke();
      }
    }
  }
});