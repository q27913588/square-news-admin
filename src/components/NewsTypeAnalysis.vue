<template>
  <div class="news-type-analysis">
    <n-table :bordered="false" :single-line="false">
      <thead>
        <tr>
          <th>媒體來源</th>
          <th>總文章數</th>
          <th>事實報導 (FACTUAL)</th>
          <th>無意義內容 (REPOST/COMMENTARY/NARRATIVE)</th>
          <th>「廢文」比例</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="source in processedStats" :key="source.sourceName">
          <td>{{ source.sourceName }}</td>
          <td>{{ source.total }}</td>
          <td>
            <n-text type="success">{{ source.factual }}</n-text>
          </td>
          <td>
            <n-space :size="4">
              <n-tag v-if="source.repost" size="small" type="warning">轉述: {{ source.repost }}</n-tag>
              <n-tag v-if="source.commentary" size="small" type="info">評論: {{ source.commentary }}</n-tag>
              <n-tag v-if="source.narrative" size="small" type="error">風向: {{ source.narrative }}</n-tag>
            </n-space>
          </td>
          <td>
            <n-progress
              type="line"
              :percentage="source.uselessRatio"
              :status="source.uselessRatio > 50 ? 'error' : 'warning'"
              :show-indicator="true"
            >
              {{ source.uselessRatio.toFixed(1) }}%
            </n-progress>
          </td>
        </tr>
      </tbody>
    </n-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NTable, NText, NTag, NSpace, NProgress } from 'naive-ui'
import type { SpectrumSourceStance } from '@/types'

interface Props {
  sourceDetails: SpectrumSourceStance[]
}

const props = defineProps<Props>()

const processedStats = computed(() => {
  return props.sourceDetails.map(source => {
    const counts = source.newsTypeCounts || {}
    const factual = counts['FACTUAL'] || 0
    const unknown = counts['UNKNOWN'] || 0
    const repost = counts['REPOST'] || 0
    const commentary = counts['COMMENTARY'] || 0
    const narrative = counts['NARRATIVE'] || 0
    
    const total = source.articleCount
    const useless = repost + commentary + narrative
    const uselessRatio = total > 0 ? (useless / total) * 100 : 0
    
    return {
      sourceName: source.sourceName,
      total,
      factual: factual + unknown,
      repost,
      commentary,
      narrative,
      useless,
      uselessRatio
    }
  }).sort((a, b) => b.uselessRatio - a.uselessRatio) // 廢文比例高的排前面
})
</script>

<style scoped>
.news-type-analysis {
  margin-top: 16px;
}
</style>
