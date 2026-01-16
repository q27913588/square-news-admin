<template>
  <div ref="chartRef" style="width: 100%; height: 400px"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ECharts } from 'echarts/core'
import type { SpectrumSourceStance } from '@/types'

echarts.use([BarChart, GridComponent, TooltipComponent, TitleComponent, LegendComponent, CanvasRenderer])

interface Props {
  sourceDetails: SpectrumSourceStance[]
}

const props = defineProps<Props>()
const chartRef = ref<HTMLElement>()
let chartInstance: ECharts | null = null

function getColor(score: number): string {
  if (score < -0.3) return '#ff4d4f' // Red for left
  if (score > 0.3) return '#1890ff' // Blue for right
  return '#8c8c8c' // Gray for center
}

function initChart() {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const sortedData = [...props.sourceDetails].sort((a, b) => a.averageScore - b.averageScore)

  const option = {
    title: {
      text: '各來源立場分佈',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const data = params[0]
        const detail = sortedData[data.dataIndex]
        return `
          <div style="font-weight: bold">${detail.sourceName}</div>
          <div>平均分數: ${detail.averageScore.toFixed(2)}</div>
          <div>文章數: ${detail.articleCount}</div>
        `
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: sortedData.map((d) => d.sourceName),
      axisLabel: {
        rotate: 45,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '立場分數',
      min: -1,
      max: 1,
      axisLine: {
        show: true
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '立場分數',
        type: 'bar',
        data: sortedData.map((d) => ({
          value: d.averageScore,
          itemStyle: {
            color: getColor(d.averageScore)
          }
        })),
        barWidth: '60%'
      }
    ]
  }

  chartInstance.setOption(option)
}

onMounted(() => {
  initChart()

  window.addEventListener('resize', () => {
    chartInstance?.resize()
  })
})

watch(
  () => props.sourceDetails,
  () => {
    initChart()
  },
  { deep: true }
)
</script>
