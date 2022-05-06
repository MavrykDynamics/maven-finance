import * as React from 'react'

type Props = {
  id: string
  className?: string
}

export default function Icon({ id, className = '' }: Props) {
  return (
    <svg className={className}>
      <use xlinkHref={`/icons/sprites.svg#${id}`} />
    </svg>
  )
}
