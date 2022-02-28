import { MainNavigationRoute } from '../../../../styles/interfaces'

export const mainNavigationLinks: MainNavigationRoute[] = [
  {
    title: 'Dashboard',
    id: 1,
    path: '/dashboard',
    icon: 'grid',
    protectedRoute: false,
    subPages: [
      { subTitle: 'Overview', subPath: '/dashboard', protectedRoute: false },
      { subTitle: 'Personal', subPath: '/dashboard-personal', protectedRoute: false },
      {
        subTitle: 'Vestee Info',
        subPath: '/your-vesting',
        protectedRoute: true,
        requires: {
          isVestee: true,
        },
      },
    ],
  },
  {
    title: 'Staking',
    id: 2,
    path: '/',
    icon: 'coins',
    protectedRoute: false,
  },
  {
    title: 'Satellites',
    id: 3,
    path: '/satellites',
    icon: 'satellite',
    protectedRoute: false,
    subPages: [
      { subTitle: 'Overview', subPath: '/satellites', protectedRoute: false },
      { subTitle: 'Become A Satellite', subPath: '/become-satellite', protectedRoute: false },
    ],
  },
  {
    title: 'Governance',
    id: 4,
    path: '/governance',
    icon: 'hammer',
    protectedRoute: false,
    subPages: [
      { subTitle: 'Proposals', subPath: '/governance', protectedRoute: false },
      { subTitle: 'Proposal History', subPath: '/proposal-history', protectedRoute: false },
      { subTitle: 'Break Glass', subPath: '/break-glass', protectedRoute: false },
      {
        subTitle: 'Mavryk Council',
        subPath: '/mavryk-council',
        protectedRoute: false,
      },
      {
        subTitle: 'Submit Proposal',
        subPath: '/submit-proposal',
        protectedRoute: true,
        requires: {
          isSatellite: true,
        },
      },
      {
        subTitle: 'Emergency Governance',
        subPath: '/emergency-governance',
        protectedRoute: true,
      },
    ],
  },
  {
    title: 'Farms',
    id: 5,
    path: '/yield-farms',
    icon: 'plant',
    protectedRoute: false,
  },
  {
    title: 'Treasury',
    id: 6,
    path: '/treasury',
    icon: 'treasury',
    protectedRoute: false,
  },
  {
    title: 'Loans',
    id: 7,
    path: '/loans',
    icon: 'bank',
    protectedRoute: false,
  },
  {
    title: 'Vaults',
    id: 8,
    path: '/vaults',
    icon: 'shop',
    protectedRoute: false,
  },
  {
    title: 'Admin',
    id: 9,
    path: '/admin',
    icon: 'shop',
    protectedRoute: false,
  },
]
