<template>
  <div>
    <div class="container">
      <errors :errors="errors"></errors>
      <button type="button" class="btn btn-dark" :disabled="isAuthenticated" @click="auth('ona')">
        Auth Ona
      </button>
      <span class="ml-1" v-if="isAuthenticated">
        You are successfully authenticated <!-- <code>{{ $auth.getToken() }}</code> -->
      </span>
    </div>
  </div>
</template>

<script>
import Errors from '../components/parts/Errors'

export default {
  props: ['isAuthenticated'],

  components: {
    Errors
  },

  data: function () {
    return {
      errors: []
    }
  },

  methods: {
    auth (provider) {
      var load = 'waiting to auth'
      this.$emit('loadMessage', load)

      var self = this
      this.$auth.authenticate(provider)
        .then(function (authResponse) {
          self.$emit('authenticate', self.$auth.isAuthenticated())
        })
        .catch(function (err) {
          self.errors.push(err)
        })
        .then(function () {
          self.$emit('loadMessage', load, true)
        })
    }
  }
}
</script>
