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
/**
 * [getTopicKeyBypage description]
 *
 * @param   {[type]}  pageName  [pageName topic]
 *
 * @return  {[type]}            [return topic router]
 */
function getTopicKeyBypage(pageName) {
  return `$dg/user/${pageName}`
}
/**
 * [getTopicKeyByTopic description]
 *
 * @param   {[type]}  Topic  [Topic topic]
 *
 * @return  {[type]}         [return topicKey]
 */
function getTopicKeyByTopic(Topic) {
  const topicArr = Topic.split('/')
  topicArr.length = 3
  return topicArr.join("/")
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
        this.$emit(event, ...args)
      },
      /**
       *
       * @param event
       * @param callback
       */
      on(event, callback) {
        this.$on(event, callback)
      },
      /**
       *
       * @param event
       * @param callback
       */
      off(event, callback) {
        this.$off(event, callback)
      },
      /**
       *
       * @param router
       * @param topic
       * @return {*}
       */
      // router = $dg/user/dashboard/32511dbfe5/report
      topicKey(router) {
        // router = "$dg/user/dashboard/32511dbfe5/report"
        // return router.split('/').slice(1).join('/')
        return md5(router)
      },
      /**
       *
       * @param router
       * @return {*}
       */
      router(router) {
        return md5(router)
      },
      /**
       * [getTopicKeyBypage description]
       *
       * @param   {[type]}  pageName  [pageName description]
       *
       * @return  {[type]}            [return description]
       */
      getTopicKeyBypage(pageName) {
        return getTopicKeyBypage(pageName)
      },
      /**
       * [getTopicKeyByTopic description]
       *
       * @param   {[type]}  pageName  [pageName description]
       *
       * @return  {[type]}            [return description]
       */
      getTopicKeyByTopic(Topic) {
        return getTopicKeyByTopic(Topic)
      }
    },
  });
  window.dgiotBus = dgiotBus
  //注册到给vue对象的原型上添加全局属性
  Vue.prototype.$dgiotBus = dgiotBus;
};
export default install;
