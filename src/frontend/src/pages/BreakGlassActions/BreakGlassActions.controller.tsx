import React, { FC } from "react";

// components
import { ACTION_PRIMARY } from '../../app/App.components/Button/Button.constants'
import { Button } from '../../app/App.components/Button/Button.controller'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'

// styles
import { Page } from 'styles'
import { BreakGlassActionsCard } from "./BreakGlassActions.style";

const handleClickPropagateBreakGlass = () => {
  
}

export const BreakGlassActions: FC = () => {
  return (
    <Page>
      <PageHeader page={'break glass actions'} />

      <BreakGlassActionsCard>
        <h1>Propagate Break Glass</h1>
        <Button
          text={'Propagate Break Glass'}
          kind={ACTION_PRIMARY}
          icon={'plus'}
          onClick={handleClickPropagateBreakGlass}
        />
      </BreakGlassActionsCard>
    </Page>
  )
}
