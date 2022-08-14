import { useEffect, useRef, useState } from 'react'

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
}

export default function Expand({
  children,
  header,
  className = '',
  showCustomText = '',
  sufix = null,
  showText = false,
}: Props) {
  const ref = useRef(null)
  const [expanded, setExpanded] = useState(false)
  const [accordionHeight, setAccordionHeight] = useState(0)

  const handleToggleExpand = () => setExpanded(!expanded)

  useEffect(() => {
    // @ts-ignore
    const getHeight = ref.current?.scrollHeight
    setAccordionHeight(getHeight)
  }, [expanded])

  return (
    <ExpandStyled className={className}>
      <header className="expand-header" onClick={handleToggleExpand}>
        {header}
        <div className={`arrow-wrap ${expanded ? 'top' : 'bottom'}`}>
          {showText ? <span>{expanded ? 'Hide' : 'Show'}</span> : null}
          {showCustomText ? <span>{showCustomText}</span> : null}
          <Icon id="arrow-down" />
        </div>
        {sufix}
      </header>
      <ExpandArticleStyled className={expanded ? 'show' : 'hide'} height={accordionHeight} ref={ref}>
        {children}
      </ExpandArticleStyled>
    </ExpandStyled>
  )
}
