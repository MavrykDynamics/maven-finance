export const getShortTzAddress = (tzAddress: string): string =>
  `${tzAddress.slice(0, 7)}...${tzAddress.slice(tzAddress.length - 4, tzAddress.length)}`
