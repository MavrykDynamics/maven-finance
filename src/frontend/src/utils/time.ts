import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'

dayjs.extend(advancedFormat)

export function toHHMMSS(sec: number): string {
  let hours = Math.floor(sec / 3600)
  let minutes = Math.floor((sec - hours * 3600) / 60)
  let seconds = sec - hours * 3600 - minutes * 60

  return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

type TimeFormatTypes =
  | 'MMM DD, HH:mm:ss'
  | 'MMM Do, YYYY, HH:mm:ss UTC'
  | 'DD MMM YYYY / HH:mm'
  | 'MMMM DD HH:mm Z'
  | 'MMM DD, YYYY'
  | 'YYYY-MM-DD'
  | 'HH:mm'
  | 'MMM DD, HH:mm'
  | 'MMM DD, HH:mm Z'
  | 'MMMM Do HH:mm Z'
  | 'MMM Do, YYYY'

export const parseDate = ({ time, timeFormat }: { time?: string | number | null; timeFormat: TimeFormatTypes }) => {
  if (!time) return null
  const dateObj = new Date(time)

  return dayjs(dateObj.getTime()).format(timeFormat)
}
