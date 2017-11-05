<template>
  <span class="h4">
    <span class="badge badge-info">
      {{ title }}
      <select v-model="selected" :disabled="!selectEnabled" @change="handleChange">
        <option v-for="item in items" :key="item.key" :value="item.key">
          {{ item.value }}
        </option>
      </select>
    </span>
  </span>
</template>

<script>
export default {
  props: ['title', 'items'],

  data: function () {
    return {
      selected: null
    }
  },

  computed: {
    selectEnabled () {
      return this.items.length !== 0
    }
  },

  methods: {
    handleChange () {
      this.$emit('itemChange', this.selected)
    }
  }
}
</script>
