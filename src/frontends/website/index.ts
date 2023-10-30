import Vue from "vue";
import BootstrapVue from "bootstrap-vue";
// @ts-ignore We are not checking Vue templates.
import app from "./app.vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import "./custom.css";

Vue.use(BootstrapVue);

new Vue({
  el: "#app",
  render: h => h(app)
});
