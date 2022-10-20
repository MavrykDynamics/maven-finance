import { useEffect, useState, useRef } from 'react'

// view
import Icon from '../Icon/Icon.view'

// style
import { ExpandStyled, ExpandArticleStyled } from './Expand.style'

// helpers
import { scrollToFullView } from '../../../utils/scrollToFullView'

type Props = {
  children: React.ReactNode
  header?: React.ReactNode
  sufix?: React.ReactNode
  className?: string
  showText?: boolean
  showCustomText?: string
  isExpandedByDefault?: boolean
  onClickCallback?: () => void
}

export default function Expand({
  children,
  header = null,
  className = '',
  showCustomText = '',
  sufix = null,
  showText = false,
  isExpandedByDefault = false,
  onClickCallback,
}: Props) {
  const [expanded, setExpanded] = useState<boolean>(false)
  const handleToggleExpand = () => setExpanded(!expanded)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setExpanded(isExpandedByDefault)
  }, [isExpandedByDefault])

  // if the children are not fully visible in the window,
  // move the scroll to fix it
  useEffect(() => {
    if (expanded) {
      scrollToFullView(ref.current)
    }
  }, [expanded])

  return (
    <ExpandStyled className={className}>
      <header
        className="expand-header"
        onClick={() => {
          handleToggleExpand()
          onClickCallback && onClickCallback()
        }}
      >
        {header}
        <div className={`arrow-wrap ${expanded ? 'top' : 'bottom'}`}>
          {showText ? <span>{expanded ? 'Hide' : 'Show'}</span> : null}
          {showCustomText ? <span>{showCustomText}</span> : null}
          <Icon id="arrow-down" />
        </div>
        {sufix}
      </header>
      <ExpandArticleStyled ref={ref} show={expanded}>{children}</ExpandArticleStyled>
    </ExpandStyled>
  )
}
