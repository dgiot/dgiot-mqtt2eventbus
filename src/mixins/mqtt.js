import _ from "loadsh";
import {reconnect, maxReconnectNum} from "../config/index";
import iotMqtt from "../utils/iotMqtt";
import store from "../store";
import moment from "moment";

// window.store = store
/**
 *
 * @param map
 * @return {null}
 * @constructor
 * @description map to json
 */
function Map2Json(map) {
  let obj = Object.create(null);
  if (!_.isEmpty(map)) {
    for (let [k, v] of map) {
      obj[k] = v;
    }
  }
  return obj;
}

/**
 *
 * @param router
 * @param topics
 * @return {*[]}
 * @description get route topic
 */
function getRouteTopic(router, topics) {
  let routerTopics = [];
  for (let k in topics) {
    if (topics[k].router == router) {
      routerTopics.push(topics[k]);
    }
  }
  return routerTopics;
}

/**
 *
 * @param msg
 * @return {*[]}
 * @description get mqtt history message
 */
function getHistoryMsg(msg) {
  let historyMsg = [];
  for (let k in msg) {
    historyMsg.push(msg[k])
  }
  return historyMsg;
}

/**
 *
 * @param topic
 * @param topics
 * @return {boolean}
 * @description Unsubscribe
 */
function canUnsubscribe(topic, topics) {
  for (let k in topics) {
    if (topics[k].topic == topic) {
      return false;
    }
  }
  return true;
}

/**
 *
 * @param subTopic 订阅的topic  包含#和+ 通配符
 * @param pubTopic 发布的topic 一定不包含通配符
 * @return {boolean}
 * @description Check whether the subscribed topic matches the published topic
 */
function checkTopic(subTopic, pubTopic) {
  let length = pubTopic.length < subTopic.length ? pubTopic : subTopic; // 返回短的topic 短的topic 包含#/+
  for (let k in length) {
    if (subTopic[k] == "#" || subTopic == pubTopic) {
      return true;
    } else if (subTopic[k] == "+" || subTopic[k] == subTopic[k]) {
      // return true
    } else {
      return false;
    }
  }
}

function parserMqttMsg(Message) {
  const {
    destinationName = "destinationName",
    duplicate = false,
    payloadBytes = "payloadBytes",
    payloadString = "payloadString",
    qos = 0,
    retained = false
  } = Message;
  let type = 'json'
  let msg = []
  if (_.isTypedArray(Message)) {
    const str = String.fromCharCode.apply(null, new Uint8Array(Message));
    const res = JSON.parse(str);
    type = 'Uint8Array'
    msg = {
      message: res.Message,
      topic: destinationName,
      duplicate,
      payloadBytes,
      qos: qos,
      retained,
      payload: payloadString,
      time: moment().format("x")
    }
  } else {
    msg = {
      payload: payloadString,
      message: Message,
      topic: destinationName,
      duplicate,
      payloadBytes,
      qos: qos,
      time: moment().format("x")
    }
  }
  return msg
}

const dgiotMixin = {
  name: "dgiotMixin",
  data() {
    return {
      consoleTale: [],
      MapTopic: new Map(),
      HistoryMsg: new Map(),
      countNum: 0,
      reconnectNum: 0,
      isReconnect: reconnect,
      maxReconnectNum: maxReconnectNum
    };
  },
  computed: {
    pathRouter() {
      return store.state.pathRouter;
    },
    connectStatus() {
      return store.state.connectStatus;
    },
    MqttTopic() {
      return store.state.MqttTopic;
    },
    mqttSettings() {
      return store.state.mqttSettings;
    }
  },
  created() {
    const _this = this;
    /**
     * @description MqttConnect enentbus
     */
    _this.$dgiotBus.$off("MqttConnect");
    _this.$dgiotBus.$on("MqttConnect", options => {
      if (options) {
        _this.connectMqtt(options);
        const tempRouter = {};
        tempRouter[`${options.router}`] = `${options.router}`;
        store.dispatch("setPathRouter", tempRouter);
      }
    });
    /**
     * @description MqttStatus enentbus
     */
    _this.$dgiotBus.$off("MqttStatus");
    _this.$dgiotBus.$on("MqttStatus", router => {
      if (router) {
        const tempRouter = {};
        tempRouter[`${router}`] = `${router}`;
        store.dispatch("setPathRouter", tempRouter);
        _this.routerAck("init");
      }
    });
    /**
     *@description disconnect enentbus
     */
    _this.$dgiotBus.$off("MqttDisconnect");
    _this.$dgiotBus.$on("MqttDisconnect", timestamp => {
      if (timestamp) {
        _this.disconnect();
      }
    });
    /**
     *@description MqttSubscribe enentbus
     */
    _this.$dgiotBus.$off("MqttSubscribe");
    _this.$dgiotBus.$on("MqttSubscribe", (args = {router, topic}) => {
      console.log('args', {...args})
      if (!_.isEmpty(args)) _this.subscribe(args);
    });
    /**
     *@description MqttUnbscribe enentbus
     */
    _this.$dgiotBus.$off("MqttUnbscribe");
    _this.$dgiotBus.$on("MqttUnbscribe", (router, topic) => {
      if (router && topic) _this.unsubscribe(router, topic);
    });
    /**
     *@description MqttPublish enentbus
     */
    _this.$dgiotBus.$off("MqttPublish");
    _this.$dgiotBus.$on(
      "MqttPublish",
      (topic, obj, qos = 0, retained = false) => {
        if (!_.isEmpty(topic)) {
          _this.bus2mqtt(topic, obj, qos, retained);
        }
      }
    );
  },
  mounted() {
  },
  methods: {
    /**
     *
     * @param type
     * @description global mqtt servers all info
     */
    routerAck(type) {
      let _this = this;
      if (_this.pathRouter) {
        let allrouterTopics = [];
        const jsonTopic = Map2Json(_this.MqttTopic);
        for (let topicKey in jsonTopic) {
          allrouterTopics.push({
            router: jsonTopic[topicKey].router,
            topicKey: topicKey,
            topic: jsonTopic[topicKey].topic,
            qos: jsonTopic[topicKey].qos,
            time: moment().format("x")
          });
        }
        for (let router in _this.pathRouter) {
          const routeTopics = getRouteTopic(router, allrouterTopics);
          const historyMsg = getHistoryMsg(Map2Json(store.state.historyMsg))
          _this.$dgiotBus.$emit(router, {
            settings: _this.mqttSettings,
            connectStatus: _this.connectStatus,
            topics: routeTopics,
            historyMsg: historyMsg,
            allrouterTopics: allrouterTopics,
            type
          });
        }
      }
    },
    /**
     *
     * @param map
     * @description Check whether the topic in vuex has expired
     */
    connectCheckTopic(map) {
      for (let topickey in map) {
        if (map[topickey].endtime > Number(moment().format("x")))
          this.subscribe({
            topickey: topickey,
            topic: map[topickey].topic,
            ttl: map[topickey].endtime - Number(moment().format("x"))
          });
        else this.unsubscribe(topickey, map[topickey].topic);
      }
    },
    /**
     *
     * @param topic
     * @param payloadString
     * @return {Vue|*}
     * @description Bridge the mqtt message from the server to the EventBus of each page
     */
    mqtt2bus(MqttTopic, Message) {
      const {topic, payload} = Message
      console.groupCollapsed(
        "%ciotMqtt SendMsg payloadString",
        "color:#009a61; font-size: 28px; font-weight: 300"
      );
      console.table(Message);
      console.groupEnd();
      const nowTime = Number(moment().format("x"));
      const map = Map2Json(MqttTopic);
      console.error('map',map)
      for (let topicKey in map) {
        if (checkTopic(map[topicKey].topic, topic)) {
          this.$dgiotBus.$emit(`${topicKey}`, Message);
          console.groupCollapsed(
            "%ciotMqtt checkTopic Message",
            "color:#009a61; font-size: 28px; font-weight: 300"
          );
          console.log('topicKey', topicKey)
          console.table({topic, topicKey, Message});
          console.groupEnd();
        }
        if (Number(map[topicKey].endtime) < nowTime)
          this.$dgiotBus.$emit("MqttUnbscribe", (topicKey, topic))
      }
    },
    /**
     *
     * @param topic
     * @param obj
     * @param qos
     * @param retained
     * @description Bridge EventBus messages from the page to the mqtt server
     */
    bus2mqtt(topic, obj, qos = 0, retained = false) {
      if (_.isEmpty(obj)) {
        console.groupCollapsed(
          "%csendMsg",
          "color:#009a61; font-size: 28px; font-weight: 300"
        );
        console.error(topic, obj, "没有发送消息的内容");
        console.groupEnd();
        return;
      }
      // 数据发送
      try {
        console.log(new Date());
        iotMqtt.sendMessage(topic, obj, qos, retained);
        console.groupCollapsed(
          "%csendMsg",
          "color:#009a61; font-size: 28px; font-weight: 300"
        );
        console.log("topic:", topic);
        console.table(obj);
        console.table({...obj});
        console.groupEnd();
      } catch (err) {
        console.log("error", err);
        console.groupCollapsed(
          "%ciotMqtt bus2mqtt error",
          "color:#009a61; font-size: 28px; font-weight: 300"
        );
        console.warn("%c%s", "color: red;font-size: 24px;", err);
        console.groupEnd();
      }
    },
    /**
     *
     * @param options
     * @description Connect mqtt
     */
    connectMqtt(options) {
      const _this = this;
      store.dispatch("setConnectStatus", "connecting");
      store.dispatch("setMqttSettings", options);
      iotMqtt.init({
        id: options.clientId || options.id,
        ip: options.ip,
        port: options.port,
        userName: options.userName,
        passWord: options.passWord,
        success: (msg = `clientId为${options.clientId},iotMqtt连接成功`) => {
          iotMqtt.mqttStatus = true;
          _this.mqttSuccess(msg);
          if (!_.isEmpty(this.MqttTopic)) {
            _this.connectCheckTopic(Map2Json(this.MqttTopic));
          }
          store.dispatch("setConnectStatus", "connected");
          store.dispatch("setMqttStatus", true);
          _this.routerAck("connect");
        },
        error: function (msg = `iotMqtt接失败,自动重连`) {
          store.dispatch("setConnectStatus");
          // _this.connectLost()
          _this.mqttError(msg);
          store.dispatch("setConnectStatus", "connectFailure");
          store.dispatch("setMqttStatus", false);
          _this.routerAck("disconnected");
        },
        connectLost: function (msg = `iotMqtt连接丢失`) {
          // _this.connectLost()
          _this.mqttError(msg);
          store.dispatch("setConnectStatus", "disconnected");
          store.dispatch("setMqttStatus", false);
          _this.routerAck("disconnected");
        },
        onMessage: function (Message) {
          const {
            destinationName = "destinationName",
            duplicate = "duplicate",
            payloadString = "payloadString",
            qos = 0,
            retained = "retained"
          } = Message;
          _this.onMqttMessage({
            destinationName,
            duplicate,
            payloadString,
            qos,
            retained
          });
        }
      });
    },
    /**
     *
     * @param msg
     * @description Callback for successful mqtt connection
     */
    mqttSuccess(msg = "success") {
      console.groupCollapsed(
        "%ciotMqtt connection succeeded",
        "color:#009a61; font-size: 28px; font-weight: 300"
      );
      console.info("%c%s", "color: green;font-size: 24px;", msg);
      console.groupEnd();
    },
    /**
     *
     * @param msg
     * @description Callback for disconnect mqtt connection
     */
    disconnect(msg = "disconnect mqtt") {
      console.groupCollapsed(
        "%ciotMqtt connection succeeded",
        "color:#009a61; font-size: 28px; font-weight: 300"
      );
      console.info("%c%s", "color: green;font-size: 24px;", msg);
      console.groupEnd();
      iotMqtt.disconnect();
      store.dispatch("setConnectStatus", "disconnected");
      store.dispatch("setMqttStatus", false);
      this.routerAck("disconnected");
    },
    /**
     *
     * @param msg
     * @description Callback for error mqtt connection
     */
    mqttError(msg = "error") {
      let _this = this;
      console.groupCollapsed(
        "%ciotMqtt Connection failed",
        "color:#009a61; font-size: 28px; font-weight: 300"
      );
      console.error("%c%s", "color: red;font-size: 24px;", msg);
      console.groupEnd();
      if (this.isReconnect) {
        _this.reconnect();
      } else console.info("reconnect 为" + reconnect, "不自動重連");
    },
    /**
     *
     * @param msg
     * @description Callback for connectLost mqtt connection
     */
    connectLost(msg = "connectLost") {
      console.groupCollapsed(
        "%ciotMqtt Connection lost",
        "color:#009a61; font-size: 28px; font-weight: 300"
      );
      console.error("%c%s", "color: red;font-size: 24px;", msg);
      console.groupEnd();
    },
    /**
     *
     * @param Message
     * @description Message receiving callback function from mqtt server
     */
    onMqttMessage(Message) {
      let _this = this;
      const mqttmsg = parserMqttMsg(Message)
      const {
        destinationName = "destinationName",
        duplicate = false,
        payloadBytes = "payloadBytes",
        payloadString = "payloadString",
        qos = 0,
        retained = false
      } = mqttmsg;
      // 判断是否为二进制
      _this.countNum++ >= 10 ? (_this.countNum = 0) : _this.countNum;
      _this.HistoryMsg.set(_this.countNum, mqttmsg);
      const table = {
        destinationName: destinationName,
        duplicate: duplicate,
        payloadBytes: payloadBytes,
        payloadString: payloadString,
        qos: qos,
        retained: retained
      };
      _this.consoleTale.push(table);
      console.groupCollapsed(
        "%ciotMqtt onMessage",
        "color:#009a61; font-size: 28px; font-weight: 300"
      );
      console.table({..._this.consoleTale});
      console.groupEnd();
      store.dispatch("setHistoryMsg", _this.HistoryMsg);
      _this.mqtt2bus(_this.MqttTopic, mqttmsg);
    },
    /**
     *
     * @param args
     * @description mqtt subscription
     */
    subscribe: function (args) {
      let _this = this;
      const {
        topic,
        ttl,
        created = moment().format("x"),
        qos = 0,
        router
      } = args;
      // 计算topicKey
      // const topicKey = getTopicKey(router,topic);
      const topicKey = this.$dgiotBus.topicKey(router, topic);
      const endTime = Number(moment().format("x")) + ttl;
      _this.MapTopic.set(topicKey, {
        topic: topic,
        router: router,
        endtime: endTime,
        created: created,
        qos: qos
      });
      console.error('MapTopic',_this.MapTopic);
      store.dispatch("setMqttTopic", _this.MapTopic);
      if (!_.isEmpty(topic)) {
        iotMqtt.subscribe(topic, qos);
        console.groupCollapsed(
          "%ciotMqtt subscribe",
          "color:#009a61; font-size: 28px; font-weight: 300"
        );
        console.table({...args});
        console.groupEnd();
      } else console.error("no topic");
      _this.routerAck("subSuccess");
    },
    /**
     *
     * @param router
     * @param topic
     * @description mqtt unsubscribe
     */
    unsubscribe: function (router, topic) {
      const map = this.MqttTopic;
      map.delete(getTopicKey(router, topic));
      store.dispatch("setMqttTopic", map);
      if (canUnsubscribe(topic, Map2Json(map))) iotMqtt.unsubscribe(topic);
      this.routerAck("unsubscribe");
      console.info("%c%s", "color: green;font-size: 24px;", map);
      console.groupCollapsed(
        "%ciotMqtt unsubscribe",
        "color:#009a61; font-size: 28px; font-weight: 300"
      );
      console.info(
        "%c%s",
        "color: green;font-size: 24px;",
        "unsubscribe: topic" + topic
      );
      console.groupEnd();
    },
    /**
     *
     * @param msg
     * @description mqtt reconnect
     */
    reconnect: function (msg = "自动重连mqtt") {
      const _this = this;
      _this.reconnectNum++;
      const maxReconnectNum =
        _this.maxReconnectNum < 4 ? 4 : _this.maxReconnectNum;
      if (_this.reconnectNum < maxReconnectNum) {
        iotMqtt.reconnect();
        console.groupCollapsed(
          "%ciotMqtt reconnect",
          "color:#009a61; font-size: 28px; font-weight: 300"
        );
        console.log(
          "%c%s",
          "color: black; font-size: 24px;",
          "当前重连次数：" + _this.reconnectNum + "次" + msg
        );
        console.groupEnd();
      } else {
        console.error(
          "%c%s",
          "color: black;font-size: 24px;",
          "当前重连次数大于" +
          maxReconnectNum +
          "次,不再自动重连,重连第" +
          _this.reconnectNum +
          "次"
        );
      }
    },
  }
};
window.dgiotMixin = dgiotMixin;
export default dgiotMixin;
