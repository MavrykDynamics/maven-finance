type platformDeviceType = {
  isIos: boolean
  isAndroid: boolean
  isIpad: boolean
} | null

export const platformDevice: platformDeviceType =
  typeof window !== 'undefined' && typeof window.navigator !== 'undefined'
    ? {
        isIos: /iphone/i.test(navigator.userAgent.toLowerCase()),
        isAndroid: /android/i.test(navigator.userAgent.toLowerCase()),
        isIpad: /iPad/i.test(navigator.userAgent.toLowerCase()),
      }
    : null

export const isMobile = platformDevice?.isAndroid || platformDevice?.isIos || platformDevice?.isIpad