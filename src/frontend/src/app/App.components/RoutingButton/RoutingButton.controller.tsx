import { RoutingButtonStyle, RoutingButtonTypes, PRIMARY } from './RoutingButton.constants'
import { RoutingButtonView } from './RoutingButton.view'

type RoutingButtonProps = {
  text: string
  icon?: string
  kind?: RoutingButtonStyle
  onClick?: () => void
  type?: RoutingButtonTypes
  loading?: boolean
  pathName: string
  pathParams?: Record<string, unknown>
}

export const RoutingButton = ({
  text,
  icon,
  kind = PRIMARY,
  onClick,
  type,
  loading = false,
  pathName,
  pathParams,
}: RoutingButtonProps) => {
  return (
    <RoutingButtonView
      text={text}
      icon={icon}
      kind={kind}
      onClick={onClick}
      type={type}
      loading={loading}
      pathName={pathName}
      pathParams={pathParams}
    />
  )
}
