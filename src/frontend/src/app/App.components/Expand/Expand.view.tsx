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
}

export default function Expand({ children, header, className = '', sufix = null }: Props) {
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
