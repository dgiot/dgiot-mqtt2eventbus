import Vue from 'vue'
import App from './App.vue'
import dgiotMixin from './mixins/mqtt'
import dgiotBus from './utils/bus'
import dgiotStore from './store'
Vue.use(dgiotBus)
Vue.mixin(dgiotMixin)
Vue.config.devtools = true
new Vue({
  el: '#app',
  dgiotStore,
  render: h => h(App)
})
