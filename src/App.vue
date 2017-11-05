<template>
  <div class="page">
    <navbar :loadMessages="loadMessages"></navbar>
    <transition name="fade">
      <success v-if="greatSuccess"></success>
    </transition>
    <intro v-if="!greatSuccess"></intro>
    <authenticate
      class="bg-light"
      :isAuthenticated="isAuthenticated"
      @loadMessage="handleLoadMessage"
      @authenticate="handleAuthenticate"
      v-if="!greatSuccess"
    ></authenticate>
    <choices
      @loadMessage="handleLoadMessage"
      @changeProj="handleProjChange"
      @changeForm="handleFormChange"
      @changeLang="handleLangChange"
      v-if="isAuthenticated && !greatSuccess"
    ></choices>
    <translate
      class="bg-light"
      @loadMessage="handleLoadMessage"
      @greatSuccess="handleSuccess"
      :selectedProj="selectedProj"
      :selectedForm="selectedForm"
      :selectedLang="selectedLang"
      :translateEnabled="translateEnabled"
      v-if="isAuthenticated && !greatSuccess"
    ></translate>
  </div>
</template>

<script>
import Navbar from './components/Navbar'
import Intro from './components/Intro'
import Authenticate from './components/Authenticate'
import Choices from './components/Choices'
import Translate from './components/Translate'
import Success from './components/Success'

export default {
  components: {
    Navbar,
    Intro,
    Authenticate,
    Choices,
    Translate,
    Success
  },

  data: function () {
    return {
      loadMessages: [],
      isAuthenticated: this.$auth.isAuthenticated(),
      selectedProj: null,
      selectedForm: null,
      selectedLang: null,
      greatSuccess: false
    }
  },

  computed: {
    translateEnabled () {
      return (this.selectedForm !== null) && (this.selectedLang !== null)
    }
  },

  methods: {
    handleLoadMessage (message, remove = false) {
      if (remove) {
        var index = this.loadMessages.indexOf(message)
        if (index !== -1) {
          this.loadMessages.splice(index, 1)
        }
      } else {
        this.loadMessages.push(message)
      }
    },

    handleAuthenticate (isAuthenticated) {
      // Avoid un-reactive isAuthenticated()
      this.isAuthenticated = isAuthenticated
    },

    handleProjChange (item) {
      this.selectedProj = item
    },

    handleFormChange (item) {
      this.selectedForm = item
    },

    handleLangChange (item) {
      this.selectedLang = item
    },

    handleSuccess () {
      this.greatSuccess = true
    }
  }
}
</script>

<style>
  @import './assets/css/spinners.css';

  html, body, #app {
    height: 100%;
  }

  .page > div {
    border-top: 1px solid #ddd;
  }

  .page > div .container {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s
  }

  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0
  }
</style>
