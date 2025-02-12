// ----------------------------------------------------------------------

import { PaymentInterval } from '@/types/payment'

const ROOTS = {
  HOME: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
}

// ----------------------------------------------------------------------

export const paths = {
  home: ROOTS.HOME,
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  subscriptionPricing: '/pricing/subscriptions',
  tokenPricing: '/pricing/tokens',
  payment: (type: 'subscription' | 'token', index: number, interval?: PaymentInterval) =>
    interval
      ? `/payment?type=${type}&index=${index}&interval=${interval}`
      : `/payment?type=${type}&index=${index}`,

  about: '/about-us',
  contact: '/contact-us',
  termsOfService: '/terms-of-service',
  privacyPolicy: '/privacy-policy',
  faqs: '/faqs',
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',
  waitlist: '/waitlist',
  // AUTH
  auth: {
    callback: `${ROOTS.AUTH}/callback`,
  },
  share: (slug: string) => `/share/${slug}`,
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    permission: `${ROOTS.DASHBOARD}/permission`,
    general: {
      app: `${ROOTS.DASHBOARD}/app`,
    },
    onboard: `${ROOTS.DASHBOARD}/onboard`,
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
    },
    recipe: {
      view: (id: string) => `${ROOTS.DASHBOARD}/recipe/${id}/view`,
    },
  },
}
