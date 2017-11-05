<template>
  <div>
    <div class="container">
      <errors v-bind:errors="errors"></errors>
      <p>Automatically translate:</p>
      <item-select title="Project" :items="projects" @itemChange="handleProjChange"></item-select>
      <item-select title="Form" :items="projectForms" @itemChange="handleFormChange"></item-select>
      to
      <item-select title="Language" :items="langCodes" @itemChange="handleLangChange"></item-select>
    </div>
  </div>
</template>

<script>
import ItemSelect from '../components/parts/ItemSelect'
import Errors from '../components/parts/Errors'
import config from '../config.json'

export default {
  components: {
    ItemSelect,
    Errors
  },

  data: function () {
    return {
      projects: [],
      projectForms: [],
      langCodes: [],
      errors: []
    }
  },

  mounted: function () {
    this.getProjects()
    this.getLangCodes()
  },

  methods: {
    getLangCodes () {
      var load = 'getting languages'
      this.$emit('loadMessage', load)

      var self = this
      var axios = this.$http.create() // Avoid saved tokens
      axios.get(`https://translate.yandex.net/api/v1.5/tr.json/getLangs`,
        {
          params: {
            key: config['yandexApiKey'],
            ui: 'en'
          }
        })
        .then(function (response) {
          var langCodes = Object.keys(response.data['langs']).map(function (key) {
            return { key: key, value: response.data['langs'][key] }
          })
          self.langCodes = langCodes
        })
        .catch(function (err) {
          self.errors.push(err)
        })
        .then(function () {
          self.$emit('loadMessage', load, true)
        })
    },

    getProjects () {
      var load = 'getting projects'
      this.$emit('loadMessage', load)

      var self = this
      this.$http.get(`https://api.ona.io/api/v1/projects`)
        .then((response) => {
          if (response.data.length === 0) {
            throw new Error('No Projects Found')
          }
          this.projects = response.data.map(function (item) {
            return { key: item.projectid, value: item.name }
          })
        })
        .catch((err) => {
          self.errors.push(err)
        })
        .then(function () {
          self.$emit('loadMessage', load, true)
        })
    },

    getProjectForms (projectId) {
      this.projectForms = []

      var load = 'getting forms'
      this.$emit('loadMessage', load)

      var self = this
      this.$http.get(`https://api.ona.io/api/v1/projects/${projectId}/forms`)
        .then((response) => {
          if (response.data.length === 0) {
            throw new Error('No Forms Found')
          }
          this.projectForms = response.data.map(function (item) {
            return { key: item.formid, value: item.title }
          })
        })
        .catch((err) => {
          self.errors.push(err)
        })
        .then(function () {
          self.$emit('loadMessage', load, true)
        })
    },

    handleProjChange (item) {
      this.errors = []
      this.$emit('changeProj', item)
      this.getProjectForms(item)
    },

    handleFormChange (item) {
      this.errors = []
      this.$emit('changeForm', item)
    },

    handleLangChange (item) {
      this.errors = []
      this.$emit('changeLang', item)
    }
  }
}
</script>
