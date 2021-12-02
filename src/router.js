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
      component: () => import('./Main.vue'),
      children: [
        {
          path: '/dashboard',
          component: () => import('./views/Dashboard.vue')
        }, {
          path: '/servers',
          name: 'servers',
          component: () => import('./views/Servers.vue')
        }, {
          path: '/servers/create',
          name: 'servers-create',
          component: () => import('./views/ServersCreate.vue')
        }, {
          path: '/servers/:id/edit',
          name: 'server-edit',
          component: () => import('./views/ServersCreate.vue')
        }, {
          path: '/servers/:id',
          name: 'server',
          component: () => import('./views/Server.vue'),
          children: [{
            path: '/servers/:id/summary',
            component: () => import('./views/servers/Summary.vue')
          }, {
            path: '/servers/:id/services',
            component: () => import('./views/servers/Services.vue')
          }, {
            path: '/servers/:id/cronjobs',
            component: () => import('./views/servers/Cronjobs.vue')
          }, {
            path: '/servers/:id/database',
            component: () => import('./views/servers/Database.vue')
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
            path: '/servers/:id/apps',
            component: () => import('./views/servers/Apps.vue')
          }, {
            path: '/servers/:id/logs',
            component: () => import('./views/servers/Logs.vue')
          }]
        }, {
          path: '/sites',
          name: 'sites',
          component: () => import('./views/Sites.vue')
        }, {
          path: '/sites/create',
          name: 'sites-create',
          component: () => import('./views/SitesCreate.vue')
        }, {
          path: '/sites/:id/edit',
          name: 'Site-edit',
          component: () => import('./views/SitesCreate.vue')
        }, {
          path: '/sites/:id',
          name: 'site',
          component: () => import('./views/Site.vue'),
          children: [{
            path: '/sites/:id/summary',
            component: () => import('./views/sites/Summary.vue')
          }, {
            path: '/sites/:id/database',
            component: () => import('./views/sites/Database.vue')
          }, {
            path: '/sites/:id/variables',
            component: () => import('./views/sites/Variables.vue')
          }, {
            path: '/sites/:id/aliases',
            component: () => import('./views/sites/Aliases.vue')
          }, {
            path: '/sites/:id/email',
            component: () => import('./views/sites/Email.vue')
          }, {
            path: '/sites/:id/apps',
            component: () => import('./views/sites/Apps.vue')
          }, {
            path: '/sites/:id/dns',
            component: () => import('./views/sites/Dns.vue')
          }, {
            path: '/sites/:id/backups',
            component: () => import('./views/sites/Backups.vue')
          }, {
            path: '/sites/:id/settings',
            component: () => import('./views/sites/Settings.vue')
          }]
        }, {
          path: '/domains',
          name: 'domains',
          component: () => import('./views/Domains.vue')
        }, {
          path: '/domains/create',
          name: 'domains-create',
          component: () => import('./views/DomainsCreate.vue')
        }, {
          path: '/domains/:id/edit',
          name: 'Domain-edit',
          component: () => import('./views/DomainsCreate.vue')
        }, {
          path: '/domains/:id',
          name: 'domain',
          component: () => import('./views/Domain.vue'),
          children: [{
            path: '/domains/:id/summary',
            component: () => import('./views/domains/Summary.vue')
          }, {
            path: '/domains/:id/dns',
            component: () => import('./views/domains/Dns.vue')
          }, {
            path: '/domains/:id/settings',
            component: () => import('./views/domains/Settings.vue')
          }]
        }, {
          path: '/teams',
          component: () => import('./views/Teams.vue')
        }, {
          path: '/teams/create',
          component: () => import('./views/TeamsCreate.vue')
        }, {
          path: '/teams/:id/edit',
          component: () => import('./views/TeamsCreate.vue')
        }, {
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
        }, {
          path: '/users',
          name: 'users',
          component: () => import('./views/Users.vue')
        }, {
          path: '/users/create',
          name: 'users-create',
          component: () => import('./views/UsersCreate.vue')
        }, {
          path: '/users/:id/edit',
          component: () => import('./views/UsersCreate.vue')
        }, {
          path: '/users/:id',
          component: () => import('./views/User.vue'),
          children: [{
            path: '/users/:id/summary',
            component: () => import('./views/users/Summary.vue')
          }, {
            path: '/users/:id/sites',
            component: () => import('./views/users/Sites.vue')
          }, {
            path: '/users/:id/domains',
            component: () => import('./views/users/Domains.vue')
          }, {
            path: '/users/:id/invoices',
            component: () => import('./views/users/Invoices.vue')
          }, {
            path: '/users/:id/subscriptions',
            component: () => import('./views/users/Subscriptions.vue')
          }, {
            path: '/users/:id/notes',
            component: () => import('./views/users/Notes.vue')
          }, {
            path: '/users/:id/settings',
            component: () => import('./views/users/Settings.vue')
          }]
        }, {
          path: '/settings',
          component: () => import('./views/Settings.vue'),
          children: [{
            path: '/settings/profile',
            component: () => import('./views/settings/Profile.vue')
          }, {
            path: '/settings/api',
            component: () => import('./views/settings/Api.vue')
          }, {
            path: '/settings/tokens',
            component: () => import('./views/settings/Tokens.vue')
          }, {
            path: '/settings/products',
            component: () => import('./views/settings/Products.vue')
          }]
        }
      ]
    },
    {
      path: '/auth',
      component: () => import('./views/auth/Template.vue'),
      children: [{
          path: '/auth/login',
          name: 'login',
          component: () => import('./views/auth/Login.vue')
        }, {
          path: '/auth/forgot',
          name: 'forgot',
          component: () => import('./views/auth/Forgot.vue')
        }, {
          path: '/auth/register',
          name: 'register',
          component: () => import('./views/auth/Register.vue')
        }, {
          path: '/auth/logout',
          name: 'logout',
          component: () => import('./views/auth/Logout.vue')
      }]
    }, {
      path: '/loading',
      component: () => import('./views/Loading.vue')
    },
  ]
})
