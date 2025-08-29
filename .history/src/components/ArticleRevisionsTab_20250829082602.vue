<template>
  <div class="revisions-tab">
    <h3>Revision History</h3>

    <div v-if="loading" class="text-center">
      <p>Loading revisions...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="revisions.length === 0" class="text-center">
      <p>No revisions found.</p>
    </div>

    <div v-else class="revisions-list">
      <div
        v-for="revision in revisions"
        :key="revision.id"
        class="revision-item"
      >
        <div class="revision-header">
          <div class="revision-info">
            <h4>{{ revision.title }}</h4>
            <p class="text-muted">
              Created: {{ formatDate(revision.created_at) }}
            </p>
            <p v-if="revision.description" class="revision-description">
              {{ revision.description }}
            </p>
          </div>

          <div class="revision-actions">
            <button
              v-if="userStore.isAuthorized"
              @click="viewRevision(revision)"
              class="btn btn-sm btn-outline-primary me-2"
            >
              View
            </button>
            <button
              v-if="userStore.isAuthorized"
              @click="revertRevision(revision.id)"
              class="btn btn-sm btn-warning"
              :disabled="reverting"
            >
              {{ reverting ? 'Reverting...' : 'Revert' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Revision Preview Modal -->
    <div
      v-if="showPreview"
      class="modal fade show"
      style="display: block;"
      tabindex="-1"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedRevision?.title }}</h5>
            <button
              type="button"
              class="btn-close"
              @click="closePreview"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedRevision?.description" class="mb-3">
              <strong>Description:</strong>
              <p>{{ selectedRevision.description }}</p>
            </div>
            <div v-if="selectedRevision?.body">
              <strong>Content:</strong>
              <div v-html="markedContent"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closePreview"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div
      v-if="showPreview"
      class="modal-backdrop fade show"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api, isFetchError } from 'src/services'
import type { ArticleRevision } from 'src/services/api'
import { useUserStore } from 'src/store/user'
import marked from 'src/plugins/marked'

interface Props {
  articleId: number
}

const props = defineProps<Props>()

const userStore = useUserStore()
const revisions = ref<ArticleRevision[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const reverting = ref(false)
const showPreview = ref(false)
const selectedRevision = ref<ArticleRevision | null>(null)

const markedContent = computed(() => {
  if (!selectedRevision.value?.body) return ''
  return marked(selectedRevision.value.body)
})

const fetchRevisions = async () => {
  loading.value = true
  error.value = null

  try {
    const res = await api.articles.getArticleRevisions(props.articleId)
    console.log('Revisions response:', res.data.revisions) // Debug log
    revisions.value = res.data.revisions
  } catch (err) {
    console.error('Fetch revisions error:', err) // Debug log
    if (isFetchError(err)) {
      error.value = 'Failed to fetch revisions.'
    } else {
      error.value = 'An unexpected error occurred.'
    }
  } finally {
    loading.value = false
  }
}

const revertRevision = async (revisionId: number) => {
  if (!confirm('Are you sure you want to revert to this revision? This action cannot be undone.')) {
    return
  }

  reverting.value = true

  try {
    const res = await api.articles.revertArticleRevision(props.articleId, revisionId)
    console.log('Revert response:', res) // Debug log

    if (res.data && res.data.article && res.data.article.slug) {
      alert('Article reverted successfully!')
      // Redirect to the updated article with new slug
      window.location.href = `/#/article/${res.data.article.slug}`
    } else {
      alert('Article reverted successfully! Redirecting to home...')
      // Fallback to home if slug is not available
      window.location.href = '/#/'
    }
  } catch (err) {
    console.error('Revert error:', err) // Debug log
    if (isFetchError(err)) {
      alert('Failed to revert revision.')
    } else {
      alert('An unexpected error occurred.')
    }
  } finally {
    reverting.value = false
  }
}

const viewRevision = (revision: ArticleRevision) => {
  selectedRevision.value = revision
  showPreview.value = true
}

const closePreview = () => {
  showPreview.value = false
  selectedRevision.value = null
}

const formatDate = (dateString: string) => {
  console.log('formatDate called with:', dateString, 'type:', typeof dateString) // Debug log
  
  if (!dateString) return 'Unknown date'

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      console.log('Invalid date detected for:', dateString) // Debug log
      return 'Invalid date'
    }
    return date.toLocaleString()
  } catch (error) {
    console.error('Date formatting error:', error, 'for date:', dateString)
    return 'Invalid date'
  }
}

onMounted(fetchRevisions)
</script>

<style scoped>
.revisions-tab {
  padding: 1rem 0;
}

.revisions-list {
  max-height: 500px;
  overflow-y: auto;
}

.revision-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 1rem;
  padding: 1rem;
}

.revision-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.revision-info {
  flex: 1;
}

.revision-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.revision-description {
  margin: 0.5rem 0 0 0;
  font-style: italic;
}

.revision-actions {
  display: flex;
  gap: 0.5rem;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.modal {
  z-index: 1050;
}
</style>
