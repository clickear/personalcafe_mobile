import Vue from 'vue'
import Router from 'vue-router'
import Hello from 'components/Hello'
import Music from 'page/music'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/music',
      name: 'music',
      component: Music
    }
  ]
})
