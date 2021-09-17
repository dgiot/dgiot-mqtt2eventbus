import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'loadsh'
import createPersistedState from 'vuex-persistedstate'
import createLogger from "vuex/dist/logger"
const debug = process.env.NODE_ENV !== 'production'
Vue.use(Vuex)
const state = () => ({
  MqttTopic: new Map(),
  connectStatus: 'disconnected',
  pathRouter: '',
  mqttSettings: {},
  historyMsg: new Map(),
  mqttStatus:false,
  language: 'zh-CN',
})

const getters = {
  language: (state) => state.language,
  connectStatus: (state) => state.connectStatus,
  MqttTopic: (state) => state.MqttTopic,
  pathRouter: (state) => state.pathRouter,
  mqttSettings: (state) => state.mqttSettings,
  historyMsg: (state) => state.historyMsg,
  mqttStatus:(state)=> state.mqttStatus
}
const mutations = {
  setLanguage(state, language) {
    state.language = language
  },
  setHistoryMsg(state, Msg) {
    state.historyMsg = Msg
  },
  setMqttStatus(state,status){
    state.mqttStatus = status
  },
  setConnectStatus(state, flag) {
    state.connectStatus = flag
  },
  setMqttTopic(state, MqttTopic) {
    state.MqttTopic = MqttTopic
  },
  setPathRouter(state, path) {
    state.pathRouter = _.merge(state.pathRouter, path)
  },
  setMqttSettings(state, Settings) {
    state.mqttSettings = Settings
  },
}
const actions = {
  setLanguage({ commit }, language) {
    commit('setLanguage', language)
  },
  setHistoryMsg({ commit }, Msg) {
    commit('setHistoryMsg', Msg)
  },
  setMqttStatus({commit},status){
    commit('setMqttStatus', status)
  },
  setPathRouter({ commit }, path) {
    commit('setPathRouter', path)
  },
  setConnectStatus({ commit }, flag) {
    commit('setConnectStatus', flag)
  },
  setMqttTopic({ commit }, MqttTopic) {
    commit('setMqttTopic', MqttTopic)
  },
  setMqttSettings({ commit }, Settings) {
    commit('setMqttSettings', Settings)
  },
}
var plugins = [createPersistedState(),createLogger()]
const dgiotStore =new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  plugins: debug ? plugins : []
})
export default dgiotStore
window.dgiotStore = dgiotStore
Vue.prototype.$dgiotStore = dgiotStore;
