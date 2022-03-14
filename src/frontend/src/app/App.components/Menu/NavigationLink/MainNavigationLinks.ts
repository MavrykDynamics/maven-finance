import { MainNavigationRoute } from '../../../../styles/interfaces'

export const mainNavigationLinks: MainNavigationRoute[] = [
  {
    title: 'Dashboard',
    id: 1,
    path: '/dashboard',
    icon: 'grid',
    protectedRoute: false,
    subPages: [
      { id: 57483, subTitle: 'Overview', subPath: '/dashboard', protectedRoute: false },
      { id: 84425, subTitle: 'Personal', subPath: '/dashboard-personal', protectedRoute: false },
      {
        id: 59526,
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
      { id: 57281, subTitle: 'Overview', subPath: '/satellites', protectedRoute: false },
      { id: 55614, subTitle: 'Become A Satellite', subPath: '/become-satellite', protectedRoute: false },
    ],
  },
  {
    title: 'Governance',
    id: 4,
    path: '/governance',
    icon: 'hammer',
    protectedRoute: false,
    subPages: [
      { id: 56179, subTitle: 'Proposals', subPath: '/governance', protectedRoute: false },
      { id: 31471, subTitle: 'Proposal History', subPath: '/proposal-history', protectedRoute: false },
      { id: 35587, subTitle: 'Break Glass', subPath: '/break-glass', protectedRoute: false },
      {
        id: 79754,
        subTitle: 'Mavryk Council',
        subPath: '/mavryk-council',
        protectedRoute: false,
      },
      {
        id: 59416,
        subTitle: 'Submit Proposal',
        subPath: '/submit-proposal',
        protectedRoute: true,
        requires: {
          isSatellite: true,
        },
      },
      {
        id: 47293,
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
