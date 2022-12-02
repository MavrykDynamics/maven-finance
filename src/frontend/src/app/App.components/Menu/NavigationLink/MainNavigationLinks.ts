import { LENDING_TAB_ID } from './../../../../pages/Dashboard/Dashboard.utils'
import { MainNavigationRoute } from '../../../../utils/TypesAndInterfaces/Navigation'
import { PORTFOLIO_TAB_ID } from 'pages/DashboardPersonal/DashboardPersonal.utils'

export const mainNavigationLinks: MainNavigationRoute[] = [
  {
    title: 'Dashboard',
    id: 1,
    path: `dashboard/${LENDING_TAB_ID}`,
    routePath: '/dashboard/:tabId',
    icon: 'menu-compass',
    subPages: [
      {
        id: 57483,
        subTitle: 'Overview',
        subPath: `dashboard/${LENDING_TAB_ID}`,
        routeSubPath: '/dashboard/:tabId',
      },
      {
        id: 84425,
        subTitle: 'Personal',
        subPath: `dashboard-personal/${PORTFOLIO_TAB_ID}`,
        routeSubPath: '/dashboard-personal/:tabId',
        requires: {
          isAuth: true,
        },
      },
      {
        id: 59526,
        subTitle: 'Vestee Info',
        subPath: 'your-vesting',
        routeSubPath: '/your-vesting',
        disabled: true,
        requires: {
          isVestee: true,
        },
      },
    ],
  },
  {
    title: 'Lend/Borrow',
    id: 7,
    path: 'loans',
    routePath: '/loans',
    icon: 'coin-loan',
    disabled: true,
    subPages: [
      {
        id: 57792,
        subTitle: 'Overview',
        subPath: `loans`,
        routeSubPath: '/loans',
        disabled: true,
      },
      {
        id: 84765,
        subTitle: 'Borrow',
        subPath: 'borrow',
        routeSubPath: '/borrow',
        disabled: true,
      },
      {
        id: 59776,
        subTitle: 'Lend',
        subPath: 'lend',
        routeSubPath: '/lend',
        disabled: true,
      },
      {
        id: 59777,
        subTitle: 'Personal History',
        subPath: 'personal-loans-history',
        routeSubPath: '/personal-loans-history',
        disabled: true,
      },
    ],
  },
  {
    title: 'Vaults',
    id: 8,
    path: 'vaults',
    routePath: '/vaults',
    icon: 'vaults',
    disabled: true,
  },
  {
    title: 'Staking',
    id: 2,
    path: '',
    routePath: '/',
    icon: 'menu-staking',
  },
  {
    title: 'Satellites',
    id: 3,
    path: 'satellites',
    routePath: '/satellites',
    icon: 'satellite',
    subPages: [
      { id: 57281, subTitle: 'Overview', subPath: 'satellites', routeSubPath: '/satellites' },
      {
        id: 57477,
        subTitle: 'Satellite Nodes',
        subPath: 'satellite-nodes',
        routeSubPath: ['/satellite-nodes', '/satellites/satellite-details/:tabId'],
      },
      {
        id: 55622,
        subTitle: 'Become a Satellite',
        subPath: 'become-satellite',
        routeSubPath: '/become-satellite',
        requires: {
          isNotSatellite: true,
        },
      },
      {
        id: 55614,
        subTitle: 'Edit Profile',
        subPath: 'become-satellite',
        routeSubPath: '/become-satellite',
        requires: {
          isSatellite: true,
        },
      },
      {
        id: 55619,
        subTitle: 'Edit My Profile',
        subPath: 'become-satellite',
        routeSubPath: '/become-satellite',
        requires: {
          isUnregisteredSatellite: true,
        },
      },
      {
        id: 57471,
        subTitle: 'Data Feeds',
        subPath: 'data-feeds',
        routeSubPath: ['/data-feeds', '/satellites/feed-details/:tabId'],
      },
      {
        id: 15757,
        subTitle: 'Users',
        subPath: 'oracle-users',
        routeSubPath: ['/oracle-users', '/satellites/user-details/:tabId'],
      },
    ],
  },
  {
    title: 'Farms',
    id: 5,
    path: 'yield-farms?isLive=1',
    routePath: '/yield-farms',
    icon: 'plant',
  },
  {
    title: 'Governance',
    id: 4,
    path: 'governance',
    routePath: '/governance',
    icon: 'hammer',
    subPages: [
      { id: 56179, subTitle: 'Proposals', subPath: 'governance', routeSubPath: '/governance' },
      {
        id: 31471,
        subTitle: 'Proposal History',
        subPath: 'proposal-history',
        routeSubPath: '/proposal-history',
      },
      {
        id: 47294,
        subTitle: 'Satellite Gov.',
        subPath: 'satellite-governance',
        routeSubPath: '/satellite-governance',
      },
      {
        id: 79754,
        subTitle: 'Mavryk Council',
        subPath: 'mavryk-council',
        routeSubPath: ['/mavryk-council', '/mavryk-council/review', '/mavryk-council/pending-review'],
      },
      {
        id: 38374,
        subTitle: 'Break Glass Council',
        subPath: 'break-glass-council',
        routeSubPath: ['/break-glass-council', '/break-glass-council/review', '/break-glass-council/pending-review'],
      },
      {
        id: 561812,
        subTitle: 'Financial Requests',
        subPath: 'financial-requests',
        routeSubPath: '/financial-requests',
      },
      {
        id: 59416,
        subTitle: 'Submit Proposal',
        subPath: 'submit-proposal',
        routeSubPath: '/submit-proposal',
        requires: {
          isSatellite: true,
        },
      },
      {
        id: 47293,
        subTitle: 'Emergency Gov.',
        subPath: 'emergency-governance',
        routeSubPath: '/emergency-governance',
      },

      {
        id: 35587,
        subTitle: 'Contract Status',
        subPath: 'contract-status',
        routeSubPath: '/contract-status',
      },
    ],
  },

  {
    title: 'Treasury',
    id: 6,
    path: 'treasury',
    routePath: '/treasury',
    icon: 'treasury',
  },
  {
    title: 'Admin',
    id: 9,
    path: 'admin',
    routePath: '/admin',
    icon: 'settings',
  },
]
