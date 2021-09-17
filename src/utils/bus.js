import Vue from 'vue'
import md5 from 'md5'
/**
 *
 * @type {Vue}
 */
/**
 *
 * @param type ['subscribe','publish','unsubscribe']
 * @return {string}
 */
function getEventId(type, Identifier = 'dmmd34r23fdew') {
  return md5(type + Identifier)
}
const install = function (Vue) {
  const dgiotBus = new Vue({
    methods: {
      /**
       *
       * @param event
       * @param args
       */
      emit(event, ...args) {
        this.$emit(getEventId(event), ...args)
      },
      /**
       *
       * @param event
       * @param callback
       */
      on(event, callback) {
        this.$on(getEventId(event), callback)
      },
      /**
       *
       * @param event
       * @param callback
       */
      off(event, callback) {
        this.$off(getEventId(event), callback)
      },
      /**
       *
       * @param router
       * @param topic
       * @return {*}
       */
      topicKey(router,topic){
        return md5(router+topic)
      },
      /**
       *
       * @param router
       * @return {*}
       */
      router(router){
        return md5(router)
      },
    },
  });
  window.dgiotBus=dgiotBus
//注册到给vue对象的原型上添加全局属性
  Vue.prototype.$dgiotBus = dgiotBus;
};
export default install;
