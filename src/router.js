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
          component: () => import(/* webpackChunkName: "server" */ './views/Server.vue'),
          children: [{
            path: '/servers/:id/summary',
            component: () => import('./views/servers/Summary.vue')
          }, {
            path: '/servers/:id/cronjobs',
            component: () => import('./views/servers/Cronjobs.vue')
          }, {
            path: '/servers/:id/systemusers',
            component: () => import('./views/servers/Systemusers.vue')
          }, {
            path: '/servers/:id/firewall',
            component: () => import('./views/servers/Firewall.vue')
          }, {
            path: '/servers/:id/mail',
            component: () => import('./views/servers/Mail.vue')
          }, {
            path: '/servers/:id/backups',
            component: () => import('./views/servers/Backups.vue')
          }, {
            path: '/servers/:id/settings',
            component: () => import('./views/servers/Settings.vue')
          }, {
            path: '/servers/:id/logs',
            component: () => import('./views/servers/Logs.vue')
          }]
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
          component: () => import(/* webpackChunkName: "server" */ './views/Domain.vue'),
          children: [{
            path: '/domains/:id/summary',
            component: () => import('./views/domains/Summary.vue')
          }, {
            path: '/domains/:id/database',
            component: () => import('./views/domains/Database.vue')
          }, {
            path: '/domains/:id/aliases',
            component: () => import('./views/domains/Aliases.vue')
          }, {
            path: '/domains/:id/email',
            component: () => import('./views/domains/Email.vue')
          }, {
            path: '/domains/:id/apps',
            component: () => import('./views/domains/Apps.vue')
          }, {
            path: '/domains/:id/settings',
            component: () => import('./views/domains/Settings.vue')
          }]
        },
        {
          path: '/domains/:id/edit',
          name: 'domain-edit',
          component: () => import(/* webpackChunkName: "domain-edit" */ './views/DomainsCreate.vue')
        }, {
          path: '/teams',
          component: () => import('./views/Teams.vue')
        }, {
          path: '/teams/create',
          component: () => import('./views/TeamsCreate.vue')
        },
        {
          path: '/teams/:id/edit',
          component: () => import('./views/TeamsCreate.vue')
        },
        {
          path: '/teams/:id',
          component: () => import('./views/Team.vue'),
          children: [{
            path: '/teams/:id/members',
            component: () => import('./views/teams/Members.vue')
          }, {
            path: '/teams/:id/servers',
            component: () => import('./views/teams/Servers.vue')
          }, {
            path: '/teams/:id/settings',
            component: () => import('./views/teams/Settings.vue')
          }]
        },
        {
          path: '/settings',
          component: () => import(/* webpackChunkName: "profile" */ './views/Settings.vue'),
          children: [{
            path: '/settings/profile',
            component: () => import('./views/settings/Profile.vue')
          }, {
            path: '/settings/api',
            component: () => import('./views/settings/Api.vue')
          }]
        }
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
    },
    {
      path: '/loading',
      component: () => import('./views/Loading.vue')
    },
  ]
})
