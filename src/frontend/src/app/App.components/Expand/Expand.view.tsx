import { useState } from 'react'

// view
import Icon from '../Icon/Icon.view'

// style
import { ExpandStyled, ExpandArticleStyled } from './Expand.style'

type Props = {
  children: React.ReactNode
  header: React.ReactNode
  sufix?: React.ReactNode
  className?: string
  showText?: boolean
  showCustomText?: string
  onClick?: () => void
}

export default function Expand({
  children,
  header,
  className = '',
  showCustomText = '',
  sufix = null,
  showText = false,
  onClick
}: Props) {
  const [expanded, setExpanded] = useState<boolean>(false)
  const handleToggleExpand = () => setExpanded(!expanded)

  return (
    <ExpandStyled onClick={onClick} className={className}>
      <header className="expand-header" onClick={handleToggleExpand}>
        {header}
        <div className={`arrow-wrap ${expanded ? 'top' : 'bottom'}`}>
          {showText ? <span>{expanded ? 'Hide' : 'Show'}</span> : null}
          {showCustomText ? <span>{showCustomText}</span> : null}
          <Icon id="arrow-down" />
        </div>
        {sufix}
      </header>
      <ExpandArticleStyled show={expanded}>{children}</ExpandArticleStyled>
    </ExpandStyled>
  )
}
