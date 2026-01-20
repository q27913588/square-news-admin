<template>
  <div class="incitement-ranking-container">
    <!-- Empty State -->
    <n-empty 
      v-if="!outlets || outlets.length === 0" 
      description="尚無煽動指數排行數據"
      style="padding: 40px 20px"
    />

    <!-- Ranking Table -->
    <div v-else>
      <!-- Header Info -->
      <div class="ranking-header">
        <n-space justify="space-between" align="center">
          <n-text depth="2">
            <strong>立場目標：</strong>{{ stanceTarget }}
          </n-text>
          <n-space>
            <n-text depth="3">總媒體數：{{ statistics.totalOutlets }}</n-text>
            <n-text depth="3">總文章數：{{ statistics.totalArticles }}</n-text>
          </n-space>
        </n-space>
      </div>

      <!-- Statistics Summary -->
      <div class="stats-summary">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-label">平均煽動分數</div>
            <div class="stat-value">{{ statistics.averageIncitement.toFixed(2) }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⚖️</div>
          <div class="stat-content">
            <div class="stat-label">平均立場極性</div>
            <div class="stat-value" :style="{ color: getStanceColor(statistics.averageStance) }">
              {{ statistics.averageStance.toFixed(2) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Ranking List -->
      <div class="ranking-list">
        <div 
          v-for="(outlet, index) in sortedOutlets" 
          :key="outlet.outlet"
          class="ranking-item"
          :class="{ 'high-incitement': outlet.incitementScore >= 70 }"
        >
          <!-- Rank -->
          <div class="rank-badge" :class="getRankClass(index)">
            {{ index + 1 }}
          </div>

          <!-- Outlet Info -->
          <div class="outlet-info">
            <div class="outlet-name">{{ outlet.outlet }}</div>
            <div class="outlet-meta">
              <n-text depth="3" size="small">
                {{ outlet.articleCount }} 篇文章 · 信心度 {{ (outlet.confidence * 100).toFixed(0) }}%
              </n-text>
            </div>
          </div>

          <!-- Incitement Score -->
          <div class="score-section">
            <div class="score-label">煽動分數</div>
            <div class="score-bar-wrapper">
              <div class="score-bar">
                <div 
                  class="score-fill" 
                  :style="{ 
                    width: `${outlet.incitementScore}%`,
                    background: getIncitementGradient(outlet.incitementScore)
                  }"
                ></div>
              </div>
              <div class="score-value">{{ outlet.incitementScore.toFixed(1) }}</div>
            </div>
          </div>

          <!-- Stance Polarity -->
          <div class="stance-section">
            <div class="stance-label">立場極性</div>
            <div class="stance-bar-wrapper">
              <div class="stance-bar">
                <div class="stance-marker" :style="getStanceMarkerStyle(outlet.stancePolarity)"></div>
              </div>
              <div class="stance-value" :style="{ color: getStanceColor(outlet.stancePolarity) }">
                {{ formatStance(outlet.stancePolarity) }}
              </div>
            </div>
          </div>

          <!-- Evidence Button (if available) -->
          <div v-if="includeEvidence && outlet.topEvidence" class="evidence-section">
            <n-button size="small" @click="showEvidence(outlet)">
              查看證據
            </n-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Evidence Modal -->
    <n-modal v-model:show="evidenceModalVisible" preset="card" title="證據片段" style="width: 700px">
      <div v-if="selectedOutlet && selectedOutlet.topEvidence">
        <n-space vertical size="large">
          <div class="evidence-header">
            <n-text strong>{{ selectedOutlet.outlet }}</n-text>
            <n-text depth="3">（Top 3 證據）</n-text>
          </div>
          <div 
            v-for="(evidence, index) in selectedOutlet.topEvidence" 
            :key="evidence.articleId"
            class="evidence-item"
          >
            <div class="evidence-rank">{{ index + 1 }}</div>
            <div class="evidence-content">
              <div class="evidence-title">{{ evidence.title }}</div>
              <div class="evidence-snippet">{{ evidence.snippet }}</div>
              <div class="evidence-meta">
                <n-text depth="3" size="small">
                  文章 ID: {{ evidence.articleId }} · 分數: {{ evidence.score.toFixed(1) }}
                </n-text>
              </div>
            </div>
          </div>
        </n-space>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NEmpty, NText, NSpace, NButton, NModal } from 'naive-ui'
import type { OutletIncitement, IncitementStatistics } from '@/types'

interface Props {
  outlets: OutletIncitement[]
  statistics: IncitementStatistics
  stanceTarget: string
  includeEvidence?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  includeEvidence: false
})

const evidenceModalVisible = ref(false)
const selectedOutlet = ref<OutletIncitement | null>(null)

/**
 * Sort outlets by incitement score (descending)
 */
const sortedOutlets = computed(() => {
  return [...props.outlets].sort((a, b) => b.incitementScore - a.incitementScore)
})

/**
 * Get rank class for styling (top 3 get special styling)
 */
function getRankClass(index: number): string {
  if (index === 0) return 'rank-first'
  if (index === 1) return 'rank-second'
  if (index === 2) return 'rank-third'
  return ''
}

/**
 * Get gradient color for incitement score
 */
function getIncitementGradient(score: number): string {
  if (score >= 70) return 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
  if (score >= 50) return 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
  if (score >= 30) return 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
  return 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)'
}

/**
 * Get stance marker position (convert -1 to +1 into 0% to 100%)
 */
function getStanceMarkerStyle(polarity: number) {
  const position = ((polarity + 1) / 2) * 100
  return {
    left: `${position}%`
  }
}

/**
 * Get color for stance value
 */
function getStanceColor(polarity: number): string {
  if (polarity < -0.3) return '#ef4444' // Red (oppose)
  if (polarity > 0.3) return '#3b82f6' // Blue (support)
  return '#9ca3af' // Grey (neutral)
}

/**
 * Format stance polarity with label
 */
function formatStance(polarity: number): string {
  const value = polarity.toFixed(2)
  if (polarity < -0.3) return `${value} (反對)`
  if (polarity > 0.3) return `${value} (支持)`
  return `${value} (中立)`
}

/**
 * Show evidence modal
 */
function showEvidence(outlet: OutletIncitement) {
  selectedOutlet.value = outlet
  evidenceModalVisible.value = true
}
</script>

<style scoped>
.incitement-ranking-container {
  width: 100%;
}

.ranking-header {
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 20px;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  font-size: 32px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 12px;
  flex-shrink: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.ranking-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

.ranking-item.high-incitement {
  border-left: 4px solid #ef4444;
}

.rank-badge {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #64748b;
  flex-shrink: 0;
}

.rank-badge.rank-first {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
}

.rank-badge.rank-second {
  background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%);
  color: white;
}

.rank-badge.rank-third {
  background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
  color: white;
}

.outlet-info {
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.outlet-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.outlet-meta {
  font-size: 12px;
}

.score-section,
.stance-section {
  flex: 1;
  min-width: 200px;
}

.score-label,
.stance-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
}

.score-bar-wrapper,
.stance-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-bar {
  flex: 1;
  height: 24px;
  background: #f1f5f9;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.score-fill {
  height: 100%;
  border-radius: 12px;
  transition: width 0.3s ease;
}

.score-value {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  min-width: 50px;
  text-align: right;
}

.stance-bar {
  flex: 1;
  height: 24px;
  background: linear-gradient(90deg, #ef4444 0%, #9ca3af 50%, #3b82f6 100%);
  border-radius: 12px;
  position: relative;
}

.stance-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 32px;
  background: white;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.stance-value {
  font-size: 14px;
  font-weight: 600;
  min-width: 120px;
  text-align: right;
}

.evidence-section {
  flex-shrink: 0;
}

/* Evidence Modal Styles */
.evidence-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

.evidence-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
}

.evidence-rank {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  font-weight: 700;
  flex-shrink: 0;
}

.evidence-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.evidence-title {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
}

.evidence-snippet {
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.evidence-meta {
  font-size: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .ranking-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .outlet-info,
  .score-section,
  .stance-section {
    width: 100%;
  }
}
</style>
