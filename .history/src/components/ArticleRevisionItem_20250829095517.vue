<template>
  <div class="revision-item mb-3 p-3 border rounded">
    <div class="d-flex justify-content-between align-items-start">
      <div class="revision-info flex-grow-1">
        <div class="d-flex align-items-center mb-2">
          <span class="badge bg-secondary me-2">Rev #{{ revision.id }}</span>
          <h6 class="mb-0 revision-title">{{ revision.title }}</h6>
        </div>

        <p class="revision-description text-muted mb-2">
          {{ revision.description || 'No description' }}
        </p>

        <div class="revision-meta">
          <small class="text-muted">
            <i class="fas fa-clock me-1"></i>
            {{ formatDate(revision.createdAt) }}
            <span v-if="revision.user" class="ms-2">
              <i class="fas fa-user me-1"></i>
              by {{ revision.user.username }}
            </span>
          </small>
        </div>

        <!-- Content Preview -->
        <div class="revision-preview mt-2">
          <small class="text-muted d-block mb-1">Content preview:</small>
          <div class="content-preview p-2 bg-light border rounded small">
            {{ getContentPreview(revision.body) }}
          </div>
        </div>
      </div>

      <div class="revision-actions ms-3">
        <div class="btn-group-vertical">
          <button
            class="btn btn-sm btn-outline-info mb-1"
            @click="$emit('viewRevision', revision)"
            title="View full revision"
          >
            <i class="fas fa-eye me-1"></i>
            View
          </button>

          <button
            class="btn btn-sm btn-outline-warning"
            @click="$emit('revert', revision)"
            :disabled="isCurrentRevision"
            :title="isCurrentRevision ? 'This is the current version' : 'Revert to this revision'"
          >
            <i class="fas fa-undo me-1"></i>
            {{ isCurrentRevision ? 'Current' : 'Revert' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Changes Summary -->
    <div v-if="showChangesSummary" class="changes-summary mt-3 pt-3 border-top">
      <small class="text-muted mb-2 d-block">Changes from current version:</small>
      <div class="changes-list">
        <div v-if="titleChanged" class="change-item">
          <span class="badge bg-info me-1">Title</span>
          <span class="text-muted">Changed</span>
        </div>
        <div v-if="descriptionChanged" class="change-item">
          <span class="badge bg-info me-1">Description</span>
          <span class="text-muted">Changed</span>
        </div>
        <div v-if="contentChanged" class="change-item">
          <span class="badge bg-info me-1">Content</span>
          <span class="text-muted">Changed</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Article, ArticleRevision } from 'src/services/api'

interface Props {
  revision: ArticleRevision
  currentArticle: Article
}

const props = defineProps<Props>()

const emit = defineEmits<{
  viewRevision: [revision: ArticleRevision]
  revert: [revision: ArticleRevision]
}>()

const isCurrentRevision = computed(() => {
  return props.revision.title === props.currentArticle.title &&
         props.revision.description === props.currentArticle.description &&
         props.revision.body === props.currentArticle.body
})

const showChangesSummary = computed(() => !isCurrentRevision.value)

const titleChanged = computed(() => {
  return props.revision.title !== props.currentArticle.title
})

const descriptionChanged = computed(() => {
  return props.revision.description !== props.currentArticle.description
})

const contentChanged = computed(() => {
  return props.revision.body !== props.currentArticle.body
})

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 24) {
    if (diffInHours < 1) {
      return 'Less than an hour ago'
    }
    return `${Math.floor(diffInHours)} hours ago`
  } else if (diffInHours < 168) { // 7 days
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

function getContentPreview(content: string | undefined): string {
  if (!content) return 'No content'

  // Remove markdown formatting and HTML tags for preview
  const plainText = content
    .replace(/[#*_`]/g, '') // Remove markdown
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim()

  return plainText.length > 120
    ? plainText.substring(0, 120) + '...'
    : plainText
}
</script>

<style scoped>
.revision-item {
  transition: all 0.2s ease;
  background-color: #fff;
}

.revision-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transform: translateY(-1px);
}

.revision-title {
  color: #333;
  font-weight: 500;
}

.revision-description {
  font-size: 0.9rem;
  line-height: 1.4;
}

.content-preview {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.8rem;
  line-height: 1.3;
  color: #666;
  max-height: 80px;
  overflow-y: auto;
}

.revision-actions .btn-group-vertical .btn {
  min-width: 80px;
}

.changes-summary {
  background-color: #f8f9fa;
  border-radius: 0.25rem;
  padding: 0.75rem;
  margin-top: 0.75rem;
}

.change-item {
  display: inline-block;
  margin-right: 1rem;
  margin-bottom: 0.25rem;
}

.badge {
  font-size: 0.7rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.revision-meta i {
  opacity: 0.7;
}
</style>
