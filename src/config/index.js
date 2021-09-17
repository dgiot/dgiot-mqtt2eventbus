const { hostname } = location
module.exports = {
  // 是否自动重连
  reconnect: true,
  // 最大重连次数,值小于4,则该设置无效
  maxReconnectNum: 10,
  client: {},
  options: {
    host: process.env.NODE_ENV !== 'development' ? 'prod.iotn2n.com' :hostname,
    port: window.location.protocol === 'https:' ? 8084 : 8083,
    ip: 'prod.iotn2n.com',
    // port: 8083,
    username: '_test',
    isSSL: window.location.protocol === 'https:' ? true : false,
    password: '_iotn2n',
    keepalive: 60,
    clean: true,
    clientId: 'dgiot',
    subQos: 0,
    publishQos: 0,
    publishMessage: '{ "msg": "Hello, World!" }',
    subTopic: 'testtopic/#',
    publishTopic: 'testtopic',
    publishRetain: false,
    receivedMessages: [],
    publishedMessages: [],
    subscriptions: []
  }
}
