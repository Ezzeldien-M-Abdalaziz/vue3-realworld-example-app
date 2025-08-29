<template>
  <div class="settings-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-6 offset-md-3 col-xs-12">
          <h1 class="text-xs-center">Your Settings</h1>

          <ul class="error-messages">
            <li v-for="(error, field) in errors" :key="field">
              {{ field }} {{ error ? error[0] : '' }}
            </li>
          </ul>

          <form @submit.prevent="onSubmit">
            <fieldset>
              <fieldset class="form-group">
                <input
                  v-model="form.username"
                  aria-label="Username"
                  type="text"
                  class="form-control form-control-lg"
                  placeholder="Your name"
                >
              </fieldset>
              <fieldset class="form-group">
                <textarea
                  v-model="form.bio"
                  aria-label="Bio"
                  class="form-control form-control-lg"
                  :rows="8"
                  placeholder="Short bio about you"
                />
              </fieldset>
              <fieldset class="form-group">
                <input
                  v-model="form.email"
                  aria-label="Email"
                  type="email"
                  class="form-control form-control-lg"
                  placeholder="Email"
                >
              </fieldset>
              <fieldset class="form-group">
                <input
                  v-model="form.password"
                  aria-label="New password"
                  type="password"
                  class="form-control form-control-lg"
                  placeholder="New password"
                >
              </fieldset>

              <!-- Upload Profile Image -->
              <div class="form-group">
                <label for="profile-image">Profile Image</label>
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  @change="onImageChange"
                  class="form-control"
                />
              </div>
              <img v-if="previewImage" :src="previewImage" alt="Profile Preview" class="img-preview" />

              <button
                class="btn btn-lg btn-primary pull-xs-right"
                :disabled="isButtonDisabled"
                type="submit"
              >
                Update Settings
              </button>
            </fieldset>
          </form>

          <hr>

          <button
            class="btn btn-outline-danger"
            aria-label="Logout"
            @click="onLogout"
          >
            Or click here to logout.
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { routerPush } from 'src/router'
import { api, isFetchError } from 'src/services'
import type { UpdateUser } from 'src/services/api'
import { useUserStore } from 'src/store/user'

const form: UpdateUser = reactive({
  username: '',
  bio: '',
  email: '',
  password: ''
})

const userStore = useUserStore()


const errors = ref<Record<string, string[]>>()

const previewImage = ref<string | null>(null)
const profileImageFile = ref<File | null>(null)

onMounted(() => {
  if (!userStore.isAuthorized)
    return routerPush('login')

  form.username = userStore.user?.username || ''
  form.bio = userStore.user?.bio || ''
  form.email = userStore.user?.email || ''
})

const isButtonDisabled = computed(() =>
  form.username === userStore.user?.username &&
  form.bio === userStore.user?.bio &&
  form.email === userStore.user?.email &&
  !form.password &&
  !profileImageFile.value
)

function onImageChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    profileImageFile.value = file
    previewImage.value = URL.createObjectURL(file)
  }
}

async function onSubmit() {
  errors.value = {}

  try {
    if (profileImageFile.value) {
      // For file uploads, we need to use FormData and bypass the generated client
    const formData = new FormData()
    formData.append('username', form.username ?? '')
    formData.append('email', form.email ?? '')
    formData.append('bio', form.bio ?? '')
    if (form.password) formData.append('password', form.password)
    if (profileImageFile.value) formData.append('image', profileImageFile.value)
    const token = userStore.user?.token

    const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/user`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })


      if (!response.ok) {
        const errorData = await response.json()
        console.log('Error response:', errorData)
        errors.value = errorData.errors
        return
      }

      const userData = await response.json().then(res => res.user)
      // Preserve the token if not present in the response
      userStore.updateUser({
        ...userStore.user,
        ...userData,
        token: userData.token ?? userStore.user?.token
      })
      await routerPush('profile', { username: userData.username })
    } else {
      // For text-only updates, use the generated API client
      const updateData: { user: UpdateUser } = {
        user: {}
      }

      if (form.username && form.username.trim()) {
        updateData.user.username = form.username.trim()
      }
      if (form.bio && form.bio.trim()) {
        updateData.user.bio = form.bio.trim()
      }
      if (form.email && form.email.trim()) {
        updateData.user.email = form.email.trim()
      }
      if (form.password && form.password.trim()) {
        updateData.user.password = form.password.trim()
      }

      const userData = await api.user.updateCurrentUser(updateData)
        .then(res => res.data.user)

      userStore.updateUser(userData)
      await routerPush('profile', { username: userData.username })
    }
  }
  catch (error) {
    console.error('Submit error:', error)
    if (isFetchError(error)) errors.value = error.error?.errors
  }
}





async function onLogout() {
  userStore.updateUser(null)
  await routerPush('global-feed')
}
</script>


<style scoped>
.img-preview {
  max-width: 120px;
  margin-top: 10px;
  border-radius: 50%;
  border: 1px solid #ddd;
}
</style>
