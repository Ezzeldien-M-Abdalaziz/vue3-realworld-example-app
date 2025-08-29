<template>
  <div class="revisions-tab">
    <h3>Revisions</h3>
    <div v-if="loading">Loading revisions...</div>
    <ul v-else>
      <li v-for="revision in revisions" :key="revision.id">
        <div class="revision-header">
          <strong>{{ revision.title }}</strong>
          <span>{{ formatDate(revision.created_at) }}</span>
          <button @click="revertRevision(revision.id)">Revert</button>
        </div>
        <p>{{ revision.description }}</p>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { api } from "src/services/api";

export interface ArticleRevision {
  id: number;
  title: string;
  description: string;
  body: string;
  created_at: string;
}

export default defineComponent({
  name: "ArticleRevisionsTab",
  props: {
    articleId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const revisions = ref<ArticleRevision[]>([]);
    const loading = ref(false);

    const fetchRevisions = async () => {
      loading.value = true;
      try {
        const res = await api.revisions.list(props.articleId);
        revisions.value = res.revisions;
      } catch (err) {
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const revertRevision = async (revisionId: number) => {
      try {
        await api.revisions.revert(props.articleId, revisionId);
        alert("Article reverted successfully!");
        fetchRevisions();
      } catch (err) {
        console.error(err);
        alert("Failed to revert revision");
      }
    };

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();

    onMounted(fetchRevisions);

    return { revisions, loading, formatDate, revertRevision };
  },
});
</script>

<style scoped>
.revisions-tab {
  padding: 1rem;
}
.revision-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.revision-header button {
  margin-left: 1rem;
}
</style>
