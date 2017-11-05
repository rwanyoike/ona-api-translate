<template>
  <nav class="navbar navbar-dark bg-dark">
    <div class="container">
      <a href="/" class="navbar-brand">Ona API Translate</a>
      <transition name="fade">
        <span class="navbar-text" v-if="status">
          <span class="loading circle"></span> {{ status }}
        </span>
      </transition>
      <span class="navbar-text mr-auto"></span>
      <span class="navbar-text">🐈</span>
    </div>
  </nav>
</template>

<script>
export default {
  props: ['loadMessages'],

  computed: {
    status () {
      if (this.loadMessages.length !== 0) {
        return this.loadMessages.join(', ')
      } else {
        return null
      }
    }
  }
}
</script>
