import { MainNavigationLink } from '../../../../styles/interfaces'

export const mainNavigationLinks: MainNavigationLink[] = [
  {
    title: 'Dashboard',
    id: 1,
    path: '/dashboard',
    icon: 'grid',
    subPages: [
      { subTitle: 'Overview', subPath: '/dashboard' },
      { subTitle: 'Personal', subPath: '/dashboard-personal' },
    ],
  },
  {
    title: 'Staking',
    id: 2,
    path: '/',
    icon: 'coins',
  },
  {
    title: 'Satellites',
    id: 3,
    path: '/satellites',
    icon: 'satellite',
    subPages: [
      { subTitle: 'Overview', subPath: '/satellites' },
      { subTitle: 'Become A Satellite', subPath: '/become-satellite' },
    ],
  },
  {
    title: 'Governance',
    id: 4,
    path: '/governance',
    icon: 'hammer',
    subPages: [
      { subTitle: 'Proposals', subPath: '/governance' },
      { subTitle: 'Break Glass', subPath: '/break-glass' },
    ],
  },
  {
    title: 'Farms',
    id: 5,
    path: '/yield-farms',
    icon: 'plant',
  },
  {
    title: 'Treasury',
    id: 6,
    path: '/treasury',
    icon: 'treasury',
  },
  {
    title: 'Loans',
    id: 7,
    path: '/loans',
    icon: 'grid',
  },
  {
    title: 'Vaults',
    id: 8,
    path: '/vaults',
    icon: 'shop',
  },
]
