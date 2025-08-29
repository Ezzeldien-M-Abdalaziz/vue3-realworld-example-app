<template>
  <div class="article-detail">
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
        <div id="article-content" class="col-md-12" v-html="articleHandledBody" />
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

      <div class="article-actions">
        <ArticleDetailMeta
          v-if="article"
          :article="article"
          @update="updateArticle"
        />
      </div>

             <!-- Article Content -->
       <div class="article-content">
         <div v-html="articleHandledBody"></div>
       </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import marked from "src/plugins/marked";
import { api } from "src/services";
import type { Article } from "src/services/api";
import ArticleDetailMeta from "./ArticleDetailMeta.vue";

export default defineComponent({
  name: "ArticleDetail",
  components: { ArticleDetailMeta, ArticleRevisionsTab },
  setup() {
    const route = useRoute();
    const slug = route.params.slug as string;
    const article = reactive<Article>({
      slug: "",
      title: "",
      description: "",
      body: "",
      tagList: [],
      createdAt: "",
      updatedAt: "",
      favorited: false,
      favoritesCount: 0,
      author: { username: "", bio: "", image: "", following: false },
    });

    const activeTab = ref("content");

        const fetchArticle = async () => {
      try {
        const res = await api.articles.getArticle(slug);
        Object.assign(article, res.data.article);
      } catch (err) {
        console.error(err);
      }
    };

    onMounted(fetchArticle);

    const articleHandledBody = computed(() => marked(article.body));

    function updateArticle(newArticle: Article) {
      Object.assign(article, newArticle);
    }

    return { article, slug, activeTab, articleHandledBody, updateArticle };
  },
});
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.tabs button.active {
  font-weight: bold;
  text-decoration: underline;
}
.tab-content {
  border-top: 1px solid #ddd;
  padding-top: 1rem;
}
</style>
