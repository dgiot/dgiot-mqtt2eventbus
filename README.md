# dgiot-mqtt-dashboard

<p align="center">
  <img src="https://img.shields.io/github/commit-activity/m/dgiot/dgiot-mqtt-dashboard" alt="ommit-activity">
	<img src="https://badgen.net/badge/package/%40dgiot%2Fdgiot-mqtt-dashboard/blue"
	alt="package" maxretrytimes="3" class="m-1 transition-all duration-1000">
	<img src="https://badgen.net/npm/v/@dgiot/dgiot-mqtt-dashboard" alt="Npm Version"
	maxretrytimes="3" class="m-1 transition-all duration-1000">
	<img src="https://badgen.net/npm/node/@dgiot/dgiot-mqtt-dashboard" alt="Node Version"
	maxretrytimes="3" class="m-1 transition-all duration-1000">
	<br>
	<img src="https://badgen.net/jsdelivr/hits/npm/@dgiot/dgiot-mqtt-dashboard"
	alt="Jsdeliver Month Downloads" maxretrytimes="3" class="m-1 transition-all duration-1000">
	<img src="https://badgen.net/packagephobia/install/@dgiot/dgiot-mqtt-dashboard"
	alt="Install Size" maxretrytimes="3" class="m-1 transition-all duration-1000">
	<img src="https://badgen.net/npm/types/@dgiot/dgiot-mqtt-dashboard" alt="Type Support"
	maxretrytimes="3" class="m-1 transition-all duration-1000">
	<br>
	<img src="https://img.shields.io/librariesio/release/npm/@dgiot/dgiot-mqtt-dashboard"
	alt="Outdated Dep" maxretrytimes="3" class="m-1 transition-all duration-1000">
	<img src="https://img.shields.io/snyk/vulnerabilities/npm/@dgiot/dgiot-mqtt-dashboard"
	alt="Vulnerablities" maxretrytimes="3" class="m-1 transition-all duration-1000">
  <a href="https://www.npmjs.com/package/@dgiot/dgiot-mqtt-dashboard"><img src="https://img.shields.io/npm/l/@dgiot/dgiot-mqtt-dashboard" alt="License"></a>
<p>



## Installation

```bash
yarn add @dgiot/dgiot-mqtt-dashboard
```

## Quick Start

### [main.js](https://github.com/dgiot/dgiot-Component-example/blob/master/src/main.js)
```diff
  import Vue from 'vue'
  import App from './App.vue'
  +import dgiotStore from '@dgiot/dgiot-mqtt-dashboard/src/store'
  +import dgiotBus from '@dgiot/dgiot-mqtt-dashboard/src/utils/bus'
  +import dgiotMixin from '@dgiot/dgiot-mqtt-dashboard/src/mixins/mqtt'
  Vue.use(dgiotBus)
  Vue.mixin(dgiotMixin)
  Vue.config.productionTip = false
  new Vue({
    dgiotStore,
    render: h => h(App),
  }).$mount('#app')
```

### [examples.vue](https://github.com/dgiot/dgiot-Component-example/blob/master/src/App.vue)
  ```diff
  <template>
    <div id="app">
      +<dgiot-mqtt-dashboard />
    </div>
  </template>

  <script>
  +import dgiotMqttDashboard from '@dgiot/dgiot-mqtt-dashboard'
  export default {
    name: 'App',
    components: {
      +dgiotMqttDashboard
    },
    mounted() {
      console.log(this.Store)
    },
  }
  </script>
  ```
### Online examples

[![Edit gmullerb-react-reducer-provider](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/dgiot/dgiot-mqtt-dashboard)
