<template>
  <div>
    <!-- Article Banner -->
    <div class="banner">
      <div class="container">
        <h1>{{ article.title }}</h1>

        <ArticleDetailMeta
          v-if="article"
          :article="article"
          @update="updateArticle"
        />
      </div>
    </div>

    <!-- Article Content -->
    <div class="container page">
      <div class="row article-content">
        <!-- eslint-disable vue/no-v-html -->
        <div id="article-content" class="col-md-12" v-html="articleHandledBody" />
        <!-- eslint-enable vue/no-v-html -->

        <!-- Tag List -->
        <ul class="tag-list">
          <li
            v-for="tag in article.tagList"
            :key="tag"
            class="tag-default tag-pill tag-outline"
          >
            {{ tag }}
          </li>
        </ul>
      </div>

      <hr />

      <!-- Article Actions -->
      <div class="article-actions">
        <ArticleDetailMeta
          v-if="article"
          :article="article"
          @update="updateArticle"
        />
      </div>

      <!-- Revision History -->
      <div class="revisions mt-4">
        <h3>Revision History</h3>

        <div v-if="loading">Loading revisions...</div>
        <div v-if="error" class="text-red-500">{{ error }}</div>

        <ul v-if="revisions.length">
          <li
            v-for="rev in revisions"
            :key="rev.id"
            class="revision-item border-b py-2 flex justify-between items-center"
          >
            <div>
              <div class="text-sm text-gray-600">
                Revision at: {{ new Date(rev.created_at).toLocaleString() }}
              </div>
              <div class="text-xs text-gray-500">
                {{ JSON.stringify(rev.changes, null, 2) }}
              </div>
            </div>

            <button
              v-if="userStore.isAdmin"
              @click="revertRevision(rev.id)"
              class="btn btn-sm btn-warning"
            >
              Revert
            </button>
          </li>
        </ul>

        <div v-else>No revisions found.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import marked from 'src/plugins/marked'
import { api } from 'src/services'
import type { Article } from 'src/services/api'
import ArticleDetailMeta from './ArticleDetailMeta.vue'
import { useUserStore } from 'src/stores/userStore'

// Get slug from route
const route = useRoute()
const slug = route.params.slug as string

// Article state
const article: Article = reactive(
  await api.articles.getArticle(slug).then(res => res.data.article)
)
const articleHandledBody = computed(() => marked(article.body))

function updateArticle(newArticle: Article) {
  Object.assign(article, newArticle)
}

// Revision history types
interface Revision {
  id: number
  created_at?: string
  changes?: Record<string, any>
}

// Revision state
const revisions = ref<Revision[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const userStore = useUserStore()

// Fetch revisions
async function fetchRevisions() {
  loading.value = true
  error.value = null
  try {
    const res = await api.articles.getArticleRevisions(article.slug)
    revisions.value = res.data.revisions
  } catch (err) {
    error.value = 'Failed to fetch revisions.'
  } finally {
    loading.value = false
  }
}

// Revert a revision
async function revertRevision(revisionId: number) {
  try {
    await api.articles.revertRevision(article.slug, revisionId)
    alert('Revision reverted successfully!')
    fetchRevisions() // Refresh list
  } catch {
    alert('Failed to revert revision.')
  }
}

// Load revisions on mount
onMounted(fetchRevisions)
</script>

<style scoped>
.revision-item pre {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
