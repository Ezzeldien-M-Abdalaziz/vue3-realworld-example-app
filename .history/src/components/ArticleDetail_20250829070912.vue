<template>
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

  <div class="container page">
    <div class="row article-content">
      <!-- eslint-disable vue/no-v-html -->
      <div id="article-content" class="col-md-12" v-html="articleHandledBody" />
      <!-- eslint-enable vue/no-v-html -->

      <!-- TODO: abstract tag list component -->
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

    <hr>

    <div class="article-actions">
      <ArticleDetailMeta
        v-if="article"
        :article="article"
        @update="updateArticle"
      />
    </div>
  </div>
</template>

<template>
  <div class="revisions">
    <h3>Revision History</h3>

    <div v-if="loading">Loading revisions...</div>
    <div v-if="error" class="text-red-500">{{ error }}</div>

    <ul v-if="revisions.length">
      <li v-for="rev in revisions" :key="rev.id" class="revision-item border-b py-2 flex justify-between items-center">
        <div>
          <div class="text-sm text-gray-600">Revision at: {{ new Date(rev.created_at).toLocaleString() }}</div>
          <div class="text-xs text-gray-500">
            <!-- Display the changes as JSON for simplicity -->
            {{ JSON.stringify(rev.changes, null, 2) }}
          </div>
        </div>

        <!-- Show Revert button only for authorized users -->
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
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import marked from 'src/plugins/marked'
import { api } from 'src/services'
import type { Article } from 'src/services/api'
import ArticleDetailMeta from './ArticleDetailMeta.vue'
import { ref, onMounted } from 'vue'
import { useUserStore } from 'src/stores/userStore'

const route = useRoute()
const slug = route.params.slug as string
const article: Article = reactive(await api.articles.getArticle(slug).then(res => res.data.article))

const articleHandledBody = computed(() => marked(article.body))

function updateArticle(newArticle: Article) {
  Object.assign(article, newArticle)
}

</script>
