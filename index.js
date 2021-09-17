import Main from './src/components/mqtt'
import _Vue from 'vue'
import dgiotMixin from './src/mixins/mqtt'
import dgiotBus from './src/utils/bus'
import dgiotStore from './src/store'
Main.install = Vue => {
  if (!Vue) {
    window.Vue = Vue = _Vue
  }
  window.dgiotBus = dgiotBus
  window.dgiotMixin = dgiotMixin
  window.dgiotStore = dgiotStore
  Vue.use(dgiotBus)
  Vue.mixin(dgiotMixin)
  Vue.component(Main.name, Main)
}
export default Main;
