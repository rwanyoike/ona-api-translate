<template>
  <div>
    <div class="container">
      <errors :errors="errors"></errors>
      <button type="button" class="btn btn-primary" :disabled="!translateEnabled || btnDisabled" @click="translate">
        Translate
      </button>
      <span class="text-muted ml-1">
        Powered by <a href="https://translate.yandex.com/">Yandex.Translate</a>
      </span>
    </div>
  </div>
</template>

<script>
import XLSX from 'xlsx'
import Errors from '../components/parts/Errors'
import config from '../config.json'

export default {
  props: ['translateEnabled', 'selectedProj', 'selectedForm', 'selectedLang'],

  components: {
    Errors
  },

  data: function () {
    return {
      errors: [],
      btnDisabled: false,
      workbook: null
    }
  },

  methods: {
    // Attempt to parse and work the xlsx
    translateLabels (sheets) {
      var requests = []

      var axios = this.$http.create() // Avoid saved tokens
      var self = this
      sheets.map(function (sheet) {
        // Brute force the first 10 columns
        var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
        var keyLetter = null // Chosen one

        // Hunt for the "label" header
        for (var index = 0; index < letters.length; index++) {
          var cell = letters[index] + '1' // i.e A1, B1...
          if (cell in self.workbook.Sheets[sheet]) {
            if (self.workbook.Sheets[sheet][cell]['v'] === 'label') {
              keyLetter = letters[index]
              break
            }
          }
        }

        // "You shall not pass!" - LoTR
        if (keyLetter === null) {
          throw new Error('◡ ヽ(`Д´)ﾉ ┻━┻')
        }

        // Filter the "label" column cells
        var regex = new RegExp(`[${keyLetter}]\\d`)
        var filteredSheet = Object.keys(self.workbook.Sheets[sheet])
          .filter(function (key) {
            return regex.test(key)
          })
          .reduce(function (result, key) {
            result[key] = self.workbook.Sheets[sheet][key]
            // Build a new filtered object
            return result
          }, {})

        Object.keys(filteredSheet).map(function (cell) {
          if (cell !== keyLetter + '1') {
            // See: https://github.com/SheetJS/js-xlsx#cell-object
            // Only translate string cells
            if (filteredSheet[cell]['t'] === 's') {
              var request = axios.get('https://translate.yandex.net/api/v1.5/tr.json/translate',
                {
                  params: {
                    key: config['yandexApiKey'],
                    lang: `en-${self.selectedLang}`, // From en -> XX
                    text: filteredSheet[cell]['v'],
                    sheet, // Guilty hack
                    cell // Guilty hack
                  }
                })
              requests.push(request)
            }
          }
        })
      })

      var load = 'translating'
      this.$emit('loadMessage', load)

      // Perform some magic, brillante!
      this.$http.all(requests)
        .then(this.$http.spread(function (...responses) {
          responses.map(function (response) {
            if (response !== undefined) {
              var sheet = response['config']['params']['sheet'] // :|
              var cell = response['config']['params']['cell'] // :|
              self.workbook.Sheets[sheet][cell]['v'] = response.data.text[0]
            }
          })
        }))
        .catch(function (err) {
          self.errors.push(err)
        })
        .then(function () {
          self.$emit('loadMessage', load, true)
          self.uploadNewWorkbook()
        })
    },

    // Filter the "form_title" and "form_id" columns
    changeXlsxSettings () { // Cheat instead ^ω^
      // form_title
      this.workbook.Sheets['settings']['A2']['v'] += ` (${this.selectedLang})`
      // form_id
      this.workbook.Sheets['settings']['B2']['v'] += `_${this.selectedLang.toLowerCase()}`
    },

    // Check for the 'survey' and 'settings' sheets
    getMissingSheets () {
      var self = this
      return ['survey', 'settings'].reduce(function (result, sheet) {
        if (!(sheet in self.workbook.Sheets)) {
          result.push(sheet)
        }
        return result
      }, [])
    },

    translate () {
      var load = 'it\'s complicated'
      this.$emit('loadMessage', load)
      this.btnDisabled = true

      var self = this
      this.$http.get(`https://api.ona.io/api/v1/forms/${this.selectedForm}/form.xls`,
        {
          responseType: 'arraybuffer'
        })
        .then(function (response) {
          self.workbook = XLSX.read(new Uint8Array(response.data), { type: 'array' })

          var missingSheets = self.getMissingSheets()
          if (missingSheets.length !== 0) {
            throw new Error(`Missing XLSX sheets: "${missingSheets}"}`)
          }

          self.changeXlsxSettings()

          if ('choices' in self.workbook.Sheets) {
            self.translateLabels(['survey', 'choices']) // Choices are optional?
          } else {
            self.translateLabels(['survey'])
          }
        })
        .catch(function (err) {
          self.errors.push(err)
          self.btnDisabled = false
        })
        .then(function () {
          self.$emit('loadMessage', load, true)
        })
    },

    uploadNewWorkbook () {
      var wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' }
      var wbout = XLSX.write(this.workbook, wopts)

      var buf = new ArrayBuffer(wbout.length)
      var view = new Uint8Array(buf)
      for (var i = 0; i !== wbout.length; ++i) {
        view[i] = wbout.charCodeAt(i) & 0xFF
      }

      var file = new Blob([buf, {type: 'application/octet-stream'}])
      var formdata = new FormData()
      formdata.append('xls_file', file, `${this.workbook.Sheets['settings']['B2']['v']}.xlsx`)

      var load = `uploading to Ona`
      this.$emit('loadMessage', load)

      var self = this
      this.$http.post(`https://api.ona.io/api/v1/projects/${this.selectedProj}/forms`, formdata)
        .then(function (response) {
          console.log(response)
        })
        .catch(function (err) {
          self.errors.push(err)
        })
        .then(function () {
          self.$emit('loadMessage', load, true)
          self.$emit('greatSuccess')
        })
    }
  }
}
</script>
