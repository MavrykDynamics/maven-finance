import { Link } from 'react-router-dom'
import { RoutingButtonStyle, RoutingButtonTypes } from './RoutingButton.constants'
import {
  RoutingButtonIcon,
  RoutingButtonLoadingIcon,
  RoutingButtonStyled,
  RoutingButtonText,
} from './RoutingButton.style'

type RoutingButtonViewProps = {
  text: string
  icon?: string
  kind: RoutingButtonStyle
  onClick?: () => void
  type?: RoutingButtonTypes
  loading: boolean
  pathName: string
  pathParams?: Record<string, unknown>
}

export const RoutingButtonView = ({
  text,
  icon,
  kind,
  onClick,
  type,
  loading,
  pathName,
  pathParams,
}: RoutingButtonViewProps) => {
  const routingButtonClasses = `${kind} ${loading ? 'loading' : ''}`

  return (
    <Link to={{ pathname: pathName, pathParams }}>
      <RoutingButtonStyled className={routingButtonClasses} onClick={onClick} type={type}>
        <RoutingButtonText>
          {loading ? (
            <>
              <RoutingButtonLoadingIcon className={kind}>
                <use xlinkHref="/icons/sprites.svg#loading" />
              </RoutingButtonLoadingIcon>
              <div>Loading...</div>
            </>
          ) : (
            <>
              {icon && (
                <RoutingButtonIcon className={kind}>
                  <use xlinkHref={`/icons/sprites.svg#${icon}`} />
                </RoutingButtonIcon>
              )}
              <div>{text}</div>
            </>
          )}
        </RoutingButtonText>
      </RoutingButtonStyled>
    </Link>
  )
}
