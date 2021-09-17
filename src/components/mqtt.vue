<template>
  <div class="websocket">
    <el-container class="websocket-container">
      <el-header class="websocket-container-header">
        <div class="link">
          <el-link href="https://github.com/dgiot/dgiot" target="_blank" type="success">star</el-link>
          <el-link href="https://prod.iotn2n.com/#/" target="_blank" type="primary">demo</el-link>
        </div>

      </el-header>
      <el-main class="websocket-container-main">
        <el-card :key="momentKey" class="el-card--self" @keyup.enter.native="mqttConnect">
          <div slot="header">
            <span>{{ translateTitle('websocket.connect') }}</span>
          </div>
          <el-form>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item :label="translateTitle('websocket.host')">
                  <el-input v-model="host" />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item :label="translateTitle('websocket.port')">
                  <el-input v-model.number="port" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item :label="translateTitle('websocket.path')">
                  <el-input v-model="path" />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item :label="translateTitle('websocket.clientID')">
                  <el-input v-model="clientId" />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item :label="translateTitle('websocket.username')">
                  <el-input v-model="username" />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item :label="translateTitle('websocket.password')">
                  <el-input v-model="password" />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item :label="translateTitle('websocket.keepAlive')">
                  <el-input v-model.number="keepalive" />
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item class="check-area">
                  <el-checkbox v-model="clean">
                    {{ translateTitle('websocket.cleanSession') }}
                  </el-checkbox>
                  <el-checkbox v-model="isSSL" style="margin-left: 50px" @change="handleSSL">
                    SSL
                  </el-checkbox>
                  <span style="margin: 5px 0 20px 50px; color: #42d885">
                    {{ connectURL }}
                  </span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div class="operation-area">
            <el-button type="success" class="confirm-btn" :disabled="mqttStatus" @keyup.enter.native="mqttConnect"
              @click="mqttConnect">
              {{ translateTitle('websocket.connect') }}
            </el-button>

            <el-button type="danger" :disabled="!mqttStatus" style="margin-left: 20px"
              @keyup.enter.native="disconnectSwitch" @click="disconnectSwitch">
              {{ translateTitle('websocket.disconnect') }}
            </el-button>
            <el-button type="primary"  style="margin-left: 20px"
                       @keyup.enter.native="sync" >
              {{ translateTitle('websocket.sync') }}
            </el-button>
            <el-button v-model="language" @click="language=!language">{{ translateTitle('websocket.toggle') }}</el-button>
            <div class="connect-state" :key="momentKey">
              {{ translateTitle('websocket.currentState') }}:
              <span :style="mqttStatus ? 'color: #42d885' : 'color: #ff6d6d'">
                {{ translateTitle(`websocket.${connectStatus}`) }}:
              </span>
            </div>
          </div>
        </el-card>

        <el-card class="el-card--self" style="max-height: 450px">
          <div slot="header">
            <span>{{ translateTitle('websocket.subscribe') }}</span>
          </div>
          <el-form size="medium">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item :label="translateTitle('websocket.topic')">
                  <el-input v-model="subTopic">
                  </el-input>
                </el-form-item>
                <el-form-item :label="translateTitle('websocket.qoS')">
                  <el-select v-model.number="subQos">
                    <el-option :value="0" />
                    <el-option :value="1" />
                    <el-option :value="2" />
                  </el-select>
                </el-form-item>
                <div class="operation-area">
                  <el-button class="confirm-btn" type="success" @keyup.enter.native="Subscribe" @click="Subscribe">
                    {{ translateTitle('websocket.subscribe') }}
                  </el-button>
                </div>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="translateTitle('websocket.subscribe')">
                  <el-table :data="subscriptions" :max-height="320">
                    <el-table-column prop="topicKey" min-width="150" :label="translateTitle('websocket.topicKey')" />
                    <el-table-column prop="topic" min-width="150" :label="translateTitle('websocket.topic')" />
                    <el-table-column prop="qos" min-width="120" :label="translateTitle('websocket.qoS')" />
                    <el-table-column prop="time" min-width="180" :label="translateTitle('websocket.time')" />
                    <el-table-column width="90" :label="translateTitle('websocket.oper')">
                      <template slot-scope="props">
                        <i title="Unsubscribe" class="unsubscribe el-icon-close"
                          @click="mqttCacheScuscribe(props.row.topic)"></i>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>

        <el-card class="el-card--self" style="max-height: 800px; padding-bottom: 20px">
          <div slot="header">
            <span>{{ translateTitle('websocket.messages') }}</span>
          </div>
          <el-form size="medium">
            <el-row :gutter="20" @keyup.enter.native="MqttPublish">
              <el-col :span="6">
                <el-form-item :label="translateTitle('websocket.topic')">
                  <el-input v-model="publishTopic" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item :label="translateTitle('websocket.messages')">
                  <el-input v-model="publishMessage" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item :label="translateTitle('websocket.qoS')">
                  <el-select v-model.number="publishQos">
                    <el-option :value="0" />
                    <el-option :value="1" />
                    <el-option :value="2" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col style="margin-top: 33px" :span="6">
                <el-form-item>
                  <el-checkbox v-model="publishRetain">
                    {{ translateTitle('websocket.retained') }}
                  </el-checkbox>
                  <el-button class="confirm-btn" type="success" style="float: right; margin-top: 4px"
                    @click="MqttPublish" @keyup.enter.native="MqttPublish">
                    {{ translateTitle('websocket.send') }}
                  </el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <el-form size="medium" style="margin-top: 20px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item :label="translateTitle('websocket.messagesAlreadySent')">
                  <i title="clear message" class="el-icon-refresh" @click="clearMessage(false)"></i>
                  <el-table border :data="publishedMessages" :max-height="600">
                    <el-table-column prop="message" min-width="100" :label="translateTitle('websocket.messages')" />
                    <el-table-column prop="topic" :label="translateTitle('websocket.topic')" />
                    <el-table-column prop="qos" min-width="120" :label="translateTitle('websocket.qoS')" />
                    <el-table-column prop="time" min-width="180" :label="translateTitle('websocket.time')" />
                  </el-table>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="translateTitle('websocket.messagesReceived')">
                  <i title="clear message" class="el-icon-refresh" @click="clearMessage"></i>
                  <el-table border :data="receivedMessages" :max-height="600">
                    <el-table-column prop="payload" min-width="100" :label="translateTitle('websocket.messages')" />
                    <el-table-column prop="topic" :label="translateTitle('websocket.topic')" />
                    <el-table-column prop="qos" min-width="120" :label="translateTitle('websocket.qoS')" />
                    <el-table-column prop="time" width="180" :label="translateTitle('websocket.time')" />
                  </el-table>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>

        <el-card class="el-card--self" style="max-height: 800px; padding-bottom: 20px">
          <el-form size="medium">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item :label="translateTitle('websocket.allsubscribe')">
                  <el-table :data="allsubscriptions" :max-height="320">
                    <el-table-column prop="topicKey" min-width="150" :label="translateTitle('websocket.topicKey')" />
                    <el-table-column prop="topic" min-width="150" :label="translateTitle('websocket.topic')" />
                    <el-table-column prop="qos" min-width="120" :label="translateTitle('websocket.qoS')" />
                    <el-table-column prop="time" min-width="180" :label="translateTitle('websocket.time')" />
                  </el-table>
                </el-form-item>
             </el-col>
            <el-col :span="12">
              <el-form-item :label="translateTitle('websocket.allmessagesReceived')">
                <el-table border :data="allreceivedMessages" :max-height="600">
                  <el-table-column prop="payload" min-width="100" :label="translateTitle('websocket.messages')" />
                  <el-table-column prop="topic" :label="translateTitle('websocket.topic')" />
                  <el-table-column prop="qos" min-width="120" :label="translateTitle('websocket.qoS')" />
                  <el-table-column prop="time" width="180" :label="translateTitle('websocket.time')" />
                </el-table>
              </el-form-item>
            </el-col>
        </el-row>
      </el-form>
    </el-card>

      </el-main>
      <el-footer class="websocket-container-footer">
        <el-link>浙江省杭州市余杭区数字文化社区(平高创业城)C3座24楼17室</el-link> <br>
        <el-link>market@iotn2n.com</el-link> <br>
        <el-link href="https://www.iotn2n.com" target="_blank">© 2021 版权所有：杭州数蛙科技有限公司</el-link>
      </el-footer>

    </el-container>
  </div>
</template>
<script>
  import {
    Input,
    Checkbox,
    Select,
    Option,
    Button,
    Form,
    FormItem,
    Table,
    TableColumn,
    Row,
    Col,
    Card,
    Message,
    Container,
    Header,
    Main,
    Footer,
    Link,
    Switch,
    Radio
  } from 'element-ui'
  import i18 from "../utils/i18";
  import _ from "loadsh"
  import md5 from 'md5'
  import moment from 'moment'
  function getTopicKey(router, topic) {
    const key = router + topic
    return md5(key);
  }
  export default {
    name: 'dgiot-mqtt-dashboard',
    components: {
      'el-link': Link,
      'el-footer': Footer,
      'el-header': Header,
      'el-main': Main,
      'el-container': Container,
      'el-input': Input,
      'el-checkbox': Checkbox,
      'el-select': Select,
      'el-option': Option,
      'el-button': Button,
      'el-table': Table,
      'el-table-column': TableColumn,
      'el-row': Row,
      'el-col': Col,
      'el-card': Card,
      'el-form': Form,
      'el-form-item': FormItem,
      'el-switch':Switch,
      'el-radio':Radio
    },
    data() {
      return {
        count: 0,
        languageKey: moment().format('x'),
        router: md5('app'),
        topicKey: '',
        momentKey: moment().format('x'),
        allTopics: {},
        host: 'prod.iotn2n.com',
        port: 8083,
        path: '/mqtt',
        username: 'dgiot',
        isSSL: false,
        password: 'xiaoming666',
        keepalive: 60,
        clean: true,
        clientId: `mqttjs_${Math.random().toString(16).substr(2, 10)}`,
        subQos: 0,
        publishQos: 0,
        publishMessage: '{ "msg": "Hello, World!" }',
        subTopic: 'test/subscribe/post/#',
        publishTopic: 'test/subscribe/post/1',
        publishRetain: false,
        receivedMessages: [],
        publishedMessages: [],
        subscriptions: [],
        allsubscriptions: [],
        allreceivedMessages: [],
        client: {},
      }
    },
    computed: {
      language:{
       get(){
         return this.$dgiotStore.state.language
       },
        set(flag){
          this.count++
          this.$dgiotStore.commit('setLanguage', this.count%2?'zh-CN':'en-us')
        }
      },
      mqttSettings() {
        return this.$dgiotStore.state.mqttSettings
      },
      connectStatus() {
        return this.$dgiotStore.state.connectStatus
      },
      mqttStatus() {
        return this.$dgiotStore.state.mqttStatus
      },
      MqttTopic() {
        return this.$dgiotStore.state.MqttTopic
      },
      pathRouter() {
        return this.$dgiotStore.state.pathRouter
      },
      connectURL() {
        const path =
          this.path && this.path.startsWith('/') ? this.path : `/${this.path}`
        return `${this.isSSL ? 'wss' : 'ws'}:${this.mqttSettings.ip}:${this.port
          }${path}`
      },
    },
    created() {
      this.$dgiotBus.$emit(`MqttStatus`, this.router)
    },
    watch: {
      topicKey: {
        handler(key, oldKey) {
          if (key != oldKey) {
            this.receivedMessages = []
            this.$dgiotBus.$off(key)
            this.$dgiotBus.$on(key, (args) => {
              this.receivedMessages.push(args)
            })
          }
        },
        deep: true,
        immediate: true,
      },
      router: {
        handler(routers, oldRouter) {
          if (routers != oldRouter) {
            this.subscriptions = []
            this.$dgiotBus.$off(routers)
            this.$dgiotBus.$on(routers, (args) => {
              console.error(args)
              if(args){
                const {topics=[] ,allrouterTopics = [],historyMsg = []} = args
                this.subscriptions = topics
                this.allsubscriptions = allrouterTopics
                this.allreceivedMessages = historyMsg
              }
            })
          }
          this.subscriptions = _.uniqWith(this.subscriptions, _.isEqual)
        },
        deep: true,
        immediate: true,
      },
    },
    mounted() {
      this.mqttConnect()
      this.loadConnect()
    },
    methods: {
      async sync(){
        await this.$dgiotBus.$emit(`MqttStatus`, this.router)
      },
      translateTitle(item) {
        const msg = item.replace('websocket.', '')
        if(this.language == 'zh-CN'){
          return i18.websocket[msg] ? i18.websocket[msg] : msg
        }else{
          return msg
        }
      },
      handleSSL() {
        this.port = this.isSSL ? 8084 : 8083
      },
      now() {
        return moment().format('YYYY-MM-DD HH:mm:ss.SSS')
      },
      disconnectSwitch() {
        this.$dgiotBus.$emit('MqttDisconnect', '1')
      },
      mqttConnect() {
        if (!window.WebSocket) {
          Message.error(this.translateTitle('websocket.notSupport'))
          return
        }
        const options = {
          keepalive: this.keepalive,
          userName: this.username,
          passWord: this.password,
          clientId: this.clientId,
          clean: this.clean,
          ip: this.host,
          port: this.port,
          connectTimeout: 10 * 1000,
          router: this.router
        }
        this.$dgiotBus.$emit('MqttConnect', options)
      },
      Subscribe() {
        if (this.subTopic) {
          this.topicKey = getTopicKey(this.router, this.subTopic)
          const ttl = 1000 * 60 * 60 * 3
          this.$dgiotBus.$emit('MqttSubscribe', {
            router: this.router,
            topic: this.subTopic,
            ttl,
            created: moment().format('x'),
            qos: this.qos,
          })
        } else {
          Message.error(this.translateTitle('websocket.connectLeave'))
        }
      },
      MqttPublish() {
        this.$dgiotBus.$emit('MqttPublish', this.publishTopic, this.publishMessage, this.publishQos, false)
        this.publishedMessages.unshift({
          message: this.publishMessage,
          topic: this.publishTopic,
          qos: this.publishQos,
          time: this.now(),
        })
        Message.success(
          this.translateTitle('websocket.messageSendOut')
        )
      },
      mqttCacheScuscribe(topic) {
        this.$dgiotBus.$emit('MqttUnbscribe', this.router, topic)
      },
      clearMessage(received = true) {
        if (received) {
          this.receivedMessages = []
        } else {
          this.publishedMessages = []
        }
      },
      loadConnect() {
        if (this.topic) {
          this.subTopic = this.topic
          this.publishTopic = this.topic
        }
      },
    }
  }
</script>

<style lang="scss" scoped>
  .websocket {
    &-container {
      &-header {
        height: 20px !important;
        line-height: 20px;

        .link {
          text-align: center;

          a {
            font-size: 18px;
          }
        }
      }

      &-main {
        .el-form-item--small.el-form-item {
          margin-bottom: 2px;
        }

        .check-area {
          .el-form-item__content {
            line-height: 20px !important;
          }
        }

        .operation-area {
          margin-top: 10px !important;
        }

        .el-input .el-input--medium {
          margin-bottom: 10px !important;
        }

        .el-select {
          width: 100%;
        }

        .refresh-btn {
          margin-left: 8px;
          font-size: 12px;
          cursor: pointer;
        }

        .connect-state {
          display: inline-block;
          margin-left: 20px;
          font-size: 14px;
          color: #a7a7a7;

          span {
            margin-left: 4px;
          }
        }

        .el-table {
          margin-top: 5px;
          /* 增加内边距 */
          border-width: 0 !important;
        }

        .el-card {
          margin-top: 24px;
        }

        .el-input,
        .el-checkbox {
          margin: 5px 0 20px;
        }
      }

      &-footer {
        text-align: center;
      }
    }
  }
</style>
