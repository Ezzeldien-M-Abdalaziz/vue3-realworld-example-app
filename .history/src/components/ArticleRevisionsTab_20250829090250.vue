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
              Created: {{ formatDate(revision.createdAt) }}
            </p>
            <p v-if="revision.description" class="revision-description">
              {{ revision.description }}
            </p>
          </div>

          <div class="revision-actions">
            <button
              v-if="userStore.isAuthorized"
              class="btn btn-sm btn-outline-primary me-2"
              @click="viewRevision(revision)"
            >
              View
            </button>
            <button
              v-if="userStore.isAuthorized"
              class="btn btn-sm btn-warning"
              :disabled="reverting"
              @click="revertRevision(revision.id)"
            >
              {{ reverting ? 'Reverting...' : 'Revert' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Simple Modal Test -->
    <div v-if="showPreview" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;">
      <div style="background: white; padding: 20px; border-radius: 8px; max-width: 600px; width: 90%;">
        <h3>Revision Preview</h3>
        <p><strong>Title:</strong> {{ selectedRevision?.title }}</p>
        <p><strong>Description:</strong> {{ selectedRevision?.description }}</p>
        <p><strong>Body:</strong> {{ selectedRevision?.body }}</p>
        <button style="margin-top: 10px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;" @click="closePreview">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import marked from 'src/plugins/marked'
import { api, isFetchError } from 'src/services'
import type { ArticleRevision } from 'src/services/api'
import { useUserStore } from 'src/store/user'
import { useToast } from "vue-toastification";

interface Props {
  articleId: number
}

const toast = useToast();
const props = defineProps<Props>()

const userStore = useUserStore()
const revisions = ref<ArticleRevision[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const reverting = ref(false)
const showPreview = ref(false)
const selectedRevision = ref<ArticleRevision | null>(null)

const _markedContent = computed(() => {
  if (!selectedRevision.value?.body)
    return ''
  return marked(selectedRevision.value.body)
})

async function fetchRevisions() {
  loading.value = true
  error.value = null

  try {
    const res = await api.articles.getArticleRevisions(props.articleId)
    revisions.value = res.data.revisions
  }
  catch (error_) {
    if (isFetchError(error_))
      error.value = 'Failed to fetch revisions.'
    else
      error.value = 'An unexpected error occurred.'
  }
  finally {
    loading.value = false
  }
}

async function revertRevision(revisionId: number) {
  // eslint-disable-next-line no-alert
  if (!confirm('Are you sure you want to revert to this revision? This action cannot be undone.'))
    return

  reverting.value = true

  try {
    const res = await api.articles.revertArticleRevision(props.articleId, revisionId)

    if (res.data && res.data.article && res.data.article.slug) {
      // eslint-disable-next-line no-alert
      alert('Article reverted successfully!')
      // Redirect to the updated article with new slug
      window.location.href = `/#/article/${res.data.article.slug}`
    }
    else {
      // eslint-disable-next-line no-alert
      alert('Article reverted successfully! Redirecting to home...')
      // Fallback to home if slug is not available
      window.location.href = '/#/'
    }
  }
  catch (error_) {
    if (isFetchError(error_))
      // eslint-disable-next-line no-alert
      alert('Failed to revert revision.')
    else
      // eslint-disable-next-line no-alert
      alert('An unexpected error occurred.')
  }
  finally {
    reverting.value = false
  }
}

function viewRevision(revision: ArticleRevision) {
  selectedRevision.value = revision
  showPreview.value = true
}

function closePreview() {
  showPreview.value = false
  selectedRevision.value = null
}

function formatDate(dateString: string) {
  if (!dateString)
    return 'Unknown date'

  try {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime()))
      return 'Invalid date'

    return date.toLocaleString()
  }
  catch {
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
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
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

.modal-dialog {
  max-width: 800px;
  width: 90%;
  margin: 0 auto;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
