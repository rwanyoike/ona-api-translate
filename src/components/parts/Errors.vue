<template>
  <div class="alert alert-danger" v-if="errors.length">
    <div v-for="error in errors">
      {{ error.toString() }}
    </div>
  </div>
</template>

<script>
export default {
  props: ['errors']
}
</script>
