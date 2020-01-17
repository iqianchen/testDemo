import Vue from 'vue'
import App from './App'
import http from '@/assets/js/http.js'
import { Setting } from '@/config/setting.js'
import '@/assets/js/common.js'
import '../static/iconFont/iconfont.css'

Vue.prototype.$http = http;
Vue.prototype.$setting = Setting;

Vue.config.productionTip = false
App.mpType = 'app'

const app = new Vue(App)
app.$mount()
