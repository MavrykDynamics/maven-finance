import Icon from 'app/App.components/Icon/Icon.view'
import * as React from 'react'
import { AccordionContent, AccordionItem, AccordionToggler, AccordionWrapper } from './Accordeon.style'

type AccordionViewProps = {
  accordionId: string
  isExpanded: boolean
  methods: Record<string, boolean>
  accordionClickHandler: (accId: string) => void
}

export const BGAccordion = ({ methods, accordionClickHandler, accordionId, isExpanded }: AccordionViewProps) => {
  const methodsList = methods ? Object.keys(methods) : []
  return (
    <AccordionWrapper>
      <AccordionToggler onClick={() => accordionClickHandler(accordionId)}>
        Methods {<Icon className={`accordion-icon ${isExpanded ? '' : 'down'}`} id="accordion_icon" />}
      </AccordionToggler>
      <AccordionContent className={`${isExpanded ? 'expanded' : ''}`}>
        {methodsList.map((method: string) => (
          <AccordionItem key={method} status={methods[method]}>
            <div className="truncated_text">{method}</div>
          </AccordionItem>
        ))}
      </AccordionContent>
    </AccordionWrapper>
  )
}
