import Vue from 'vue'
import Router from 'vue-router'
import login from './components/login.vue'
import home from './components/home.vue'
import welcome from './components/welcome.vue'
import users from './components/user/users.vue'
import rights from './components/power/rights.vue'
import roles from './components/power/roles.vue'
import cate from './components/goods/cate.vue'
import params from './components/goods/params.vue'
import GoodsList from './components/goods/list.vue'
import add from './components/goods/add.vue'
import order from './components/order/order.vue'
import report from './components/report/report.vue'

Vue.use(Router)

// 路由对象
const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: login },
    {
      path: '/home',
      component: home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: welcome },
        { path: '/users', component: users },
        { path: '/rights', component: rights },
        { path: '/roles', component: roles },
        { path: '/categories', component: cate },
        { path: '/params', component: params },
        { path: '/goods', component: GoodsList },
        { path: '/goods/add', component: add },
        { path: '/orders', component: order },
        { path: '/reports', component: report }

      ]
    }
  ]
})

// 挂载路由导航守卫（用户只有登录了才能访问页面）
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from从哪个路径跳转而来
  // next是一个函数，表示放行

  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
