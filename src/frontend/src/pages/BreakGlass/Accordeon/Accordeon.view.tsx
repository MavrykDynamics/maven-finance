import Icon from 'app/App.components/Icon/Icon.view'
import * as React from 'react'
import { AccordeonWrapper, AccordeonItem, AccordeonToggler, AccordeonContent } from './Accordeon.style'

type AccordeonViewProps = {
  accordeonId: string
  isExpanded: boolean
  methods: Record<string, boolean>
  accordeonClickHandler: (accId: string) => void
}

export const BGAccordeon = ({ methods, accordeonClickHandler, accordeonId, isExpanded }: AccordeonViewProps) => {
  const methodsList = methods ? Object.keys(methods) : []
  return (
    <AccordeonWrapper>
      <AccordeonToggler onClick={() => accordeonClickHandler(accordeonId)}>
        Methods {<Icon className={`accordeon-icon ${isExpanded ? '' : 'down'}`} id="accordeon_icon" />}
      </AccordeonToggler>
      <AccordeonContent className={`${isExpanded ? 'expaned' : ''}`}>
        {methodsList.map((method: string) => (
          <AccordeonItem key={method} status={methods[method]}>
            <div className="trunkated_text">{method}</div>
          </AccordeonItem>
        ))}
      </AccordeonContent>
    </AccordeonWrapper>
  )
}
