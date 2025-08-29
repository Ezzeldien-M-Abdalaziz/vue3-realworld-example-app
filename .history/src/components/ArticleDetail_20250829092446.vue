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

    <!-- Tabs -->
    <div class="tabs mt-4">
      <button
        :class="{ active: activeTab === 'content' }"
        class="btn btn-outline-primary me-2"
        @click="activeTab = 'content'"
      >
        Content
      </button>

       <!-- Only show this button if user is authorized -->
      <button
        v-if="userStore.isAuthorized"
        :class="{ active: activeTab === 'revisions' }"
        class="btn btn-outline-secondary"
        @click="activeTab = 'revisions'"
      >
        Revisions
      </button>
    </div>

    <div class="tab-content mt-3">
      <div v-if="activeTab === 'content'">
        <div v-html="articleHandledBody" />
      </div>
      <div v-if="activeTab === 'revisions' && userStore.isAuthorized">
        <ArticleRevisionsTab :article-id="article.id" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import marked from 'src/plugins/marked'
import { api } from 'src/services'
import type { Article } from 'src/services/api'
import { useUserStore } from 'src/store/user'
import ArticleDetailMeta from './ArticleDetailMeta.vue'
import ArticleRevisionsTab from './ArticleRevisionsTab.vue'

const route = useRoute()
const slug = route.params.slug as string
const article: Article = reactive(await api.articles.getArticle(slug).then(res => res.data.article))
const userStore = useUserStore()
const activeTab = ref('content')

const articleHandledBody = computed(() => marked(article.body))

function updateArticle(newArticle: Article) {
  Object.assign(article, newArticle)
}
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tabs button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.tab-content {
  border-top: 1px solid #ddd;
  padding-top: 1rem;
}
</style>
