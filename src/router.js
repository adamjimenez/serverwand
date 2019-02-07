import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: 'dashboard',
      component: () => import(/* webpackChunkName: "main" */ './Main.vue'),
      children: [
        {
          path: '/dashboard',
          component: () => import(/* webpackChunkName: "servers" */ './views/Dashboard.vue')
        },
        {
          path: '/servers',
          name: 'servers',
          component: () => import(/* webpackChunkName: "servers" */ './views/Servers.vue')
        },
        {
          path: '/servers/create',
          name: 'servers-create',
          component: () => import(/* webpackChunkName: "servers-create" */ './views/ServersCreate.vue')
        },
        {
          path: '/servers/:id',
          name: 'server',
          component: () => import(/* webpackChunkName: "server" */ './views/Server.vue')
        },
        {
          path: '/servers/:id/edit',
          name: 'server-edit',
          component: () => import(/* webpackChunkName: "server-edit" */ './views/ServersCreate.vue')
        },
        {
          path: '/domains',
          name: 'domains',
          component: () => import(/* webpackChunkName: "domains" */ './views/Domains.vue')
        },
        {
          path: '/domains/create',
          name: 'domains-create',
          component: () => import(/* webpackChunkName: "domains-create" */ './views/DomainsCreate.vue')
        },
        {
          path: '/domains/:id',
          name: 'domain',
          component: () => import(/* webpackChunkName: "domain" */ './views/Domain.vue')
        },
        {
          path: '/domains/:id/edit',
          name: 'domain-edit',
          component: () => import(/* webpackChunkName: "domain-edit" */ './views/DomainsCreate.vue')
        },
        {
          path: '/settings/profile',
          name: 'profile',
          component: () => import(/* webpackChunkName: "profile" */ './views/settings/Profile.vue')
        },
      ]
    },
    {
      path: '/auth/',
      component: () => import(/* webpackChunkName: "main" */ './views/auth/Template.vue'),
      children: [/*
        {
          path: '/auth/login',
          name: 'login',
          component: () => import('./views/auth/Login.vue')
        },
        {
          path: '/auth/forgot',
          name: 'forgot',
          component: () => import('./views/auth/Forgot.vue')
        },
        {
          path: '/auth/register',
          name: 'register',
          component: () => import('./views/auth/Register.vue')
        },*/
        {
          path: '/auth/logout',
          name: 'logout',
          component: () => import('./views/auth/Logout.vue')
        },
      ]
    }
  ]
})
