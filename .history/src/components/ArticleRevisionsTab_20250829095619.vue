<template>
  <div class="revisions-tab">
    <div class="revisions-header mb-4">
      <h4>Article Revision History</h4>
      <p class="text-muted">View and manage previous versions of your article</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading revisions...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger" role="alert">
      <strong>Error loading revisions:</strong> {{ error }}
      <button class="btn btn-sm btn-outline-danger ms-2" @click="fetchRevisions">
        Retry
      </button>
    </div>

    <!-- Revisions List -->
    <div v-else-if="revisions.length > 0" class="revisions-list">
      <div class="current-version mb-4 p-3 bg-light border rounded">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h6 class="mb-1">
              <span class="badge bg-success me-2">Current</span>
              {{ article.title }}
            </h6>
            <p class="text-muted small mb-1">{{ article.description }}</p>
            <small class="text-muted">
              Last updated: {{ formatDate(article.updatedAt) }} by {{ article.author.username }}
            </small>
          </div>
        </div>
      </div>

      <div class="revisions-history">
        <h6 class="mb-3">Previous Revisions</h6>
        <ArticleRevisionItem
          v-for="revision in revisions"
          :key="revision.id"
          :revision="revision"
          :current-article="article"
          @revert="handleRevert"
          @view-revision="handleViewRevision"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-5">
      <div class="mb-3">
        <i class="fas fa-history fa-3x text-muted"></i>
      </div>
      <h5 class="text-muted">No Previous Revisions</h5>
      <p class="text-muted">This article has no revision history yet.</p>
    </div>

    <!-- Revision Preview Modal -->
    <div
      v-if="selectedRevision"
      class="modal fade show d-block"
      tabindex="-1"
      role="dialog"
      style="background-color: rgba(0,0,0,0.5)"
      @click.self="closeRevisionModal"
    >
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              Revision Preview - {{ formatDate(selectedRevision.createdAt) }}
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeRevisionModal"
            ></button>
          </div>
          <div class="modal-body">
            <div class="revision-preview">
              <div class="mb-3">
                <label class="form-label fw-bold">Title:</label>
                <p>{{ selectedRevision.title }}</p>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">Description:</label>
                <p>{{ selectedRevision.description }}</p>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">Content:</label>
                <div
                  class="revision-content border p-3 rounded"
                  v-html="marked(selectedRevision.body || '')"
                ></div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeRevisionModal">
              Close
            </button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="revertLoading"
              @click="confirmRevert(selectedRevision)"
            >
              <span v-if="revertLoading" class="spinner-border spinner-border-sm me-1"></span>
              Revert to This Version
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from 'src/services'
import type { Article, ArticleRevision } from 'src/services/api'
import marked from 'src/plugins/marked'
import ArticleRevisionItem from './ArticleRevisionItem.vue'

interface Props {
  articleId: number
  article: Article
}

const props = defineProps<Props>()
const emit = defineEmits<{
  articleReverted: [article: Article]
}>()

const revisions = ref<ArticleRevision[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const selectedRevision = ref<ArticleRevision | null>(null)
const revertLoading = ref(false)

async function fetchRevisions() {
  loading.value = true
  error.value = null

  try {
    const response = await api.articles.getArticleRevisions(props.articleId)
    revisions.value = response.data.revisions
  } catch (err) {
    console.error('Error fetching revisions:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load revisions'
  } finally {
    loading.value = false
  }
}

function handleViewRevision(revision: ArticleRevision) {
  selectedRevision.value = revision
}

function closeRevisionModal() {
  selectedRevision.value = null
}

async function handleRevert(revision: ArticleRevision) {
  selectedRevision.value = revision
}

async function confirmRevert(revision: ArticleRevision) {
  if (!confirm(`Are you sure you want to revert to the revision from ${formatDate(revision.createdAt)}? This action cannot be undone.`)) {
    return
  }

  revertLoading.value = true

  try {
    const response = await api.articles.revertArticleRevision(props.articleId, revision.id)
    emit('articleReverted', response.data.article)
    closeRevisionModal()

    // Show success message
    alert('Article successfully reverted to the selected revision!')

    // Refresh revisions list
    await fetchRevisions()
  } catch (err) {
    console.error('Error reverting article:', err)
    alert('Failed to revert article. Please try again.')
  } finally {
    revertLoading.value = false
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchRevisions()
})
</script>

<style scoped>
.revisions-tab {
  min-height: 300px;
}

.revisions-header h4 {
  color: #333;
  font-weight: 600;
}

.current-version {
  background-color: #f8f9fa !important;
}

.current-version h6 {
  color: #333;
}

.revisions-history {
  max-height: 600px;
  overflow-y: auto;
}

.revision-content {
  max-height: 400px;
  overflow-y: auto;
  background-color: #f8f9fa;
}

.modal.show {
  display: block !important;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>
