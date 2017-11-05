// The Vue build version to load with the `import` command (runtime-only or
// standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueAuthenticate from 'vue-authenticate'
import VueAxios from 'vue-axios'
import axios from 'axios'
import App from './App'

Vue.config.productionTip = false

Vue.use(VueAxios, axios)
Vue.use(VueAuthenticate, {
  providers: {
    ona: {
      authorizationEndpoint: 'http://api.ona.io/o/authorize',
      clientId: 'e57pn7aBWvtUxekSBa8AUIoe2SkFQXRIc6w9rjJH', // :|
      defaultUrlParams: ['response_type', 'client_id'],
      name: 'ona',
      responseType: 'token',
      oauthType: '2.0',
      redirectUri: window.location.origin // Client app URL
    }
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: {
    App
  }
})
