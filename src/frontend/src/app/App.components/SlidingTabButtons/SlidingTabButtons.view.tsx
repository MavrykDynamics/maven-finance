import * as PropTypes from 'prop-types'
import * as React from 'react'

import { SlidingTabButtonStyle, PRIMARY } from './SlidingTabButtons.constants'
import { ButtonLoadingIcon, ButtonStyled, ButtonText, SlidingTabButtonsStyled } from './SlidingTabButtons.style'
import { Ref, useEffect, useState } from 'react'
import { TabItem } from './SlidingTabButtons.controller'

type SlidingTabButtonViewProps = {
  kind?: SlidingTabButtonStyle
  onClick?: (val?: any) => void
  clickCallback: (tabId: number) => void
  clicked: boolean
  tabValues: TabItem[]
  loading: boolean
}

export const SlidingTabButtonsView = ({
  kind,
  onClick,
  clickCallback,
  tabValues,
  loading,
}: SlidingTabButtonViewProps) => {
  let generalClasses = kind ?? ''

  const handleButtonClick = (tabId: number) => {
    if (onClick) onClick(tabId)
    clickCallback(tabId)
  }
  return (
    <SlidingTabButtonsStyled>
      {tabValues.map((tabItem, index) => (
        <TabButton
          buttonRef={tabItem.ref}
          text={tabItem.text}
          buttonId={tabItem.id}
          onClick={handleButtonClick}
          generalClasses={generalClasses}
          buttonActiveStatus={tabItem.active}
          loading={loading}
        />
      ))}
    </SlidingTabButtonsStyled>
  )
}

type TabButtonProps = {
  buttonRef: Ref<any>
  text: string
  kind?: SlidingTabButtonStyle
  onClick: (tabId: number) => void
  generalClasses: string
  buttonActiveStatus: boolean
  buttonId: number
  loading: boolean
}
const TabButton = ({
  buttonRef,
  text,
  loading,
  kind,
  generalClasses,
  buttonActiveStatus,
  onClick,
  buttonId,
}: TabButtonProps) => {
  const [buttonClasses, setButtonClasses] = useState(generalClasses)

  useEffect(() => {
    if ((text === 'Stage 1' || text === 'LIVE') && buttonActiveStatus) {
      setButtonClasses((buttonClasses) => buttonClasses + ' clicked')
    }
  }, [buttonActiveStatus, text])
  if (loading) {
    setButtonClasses((buttonClasses) => buttonClasses + ' loading')
  }

  if (!buttonActiveStatus && buttonClasses.includes(' clicked')) {
    let newClasses = buttonClasses.replace(' clicked', '')
    setButtonClasses(newClasses)
  }
  const _onClick = () => {
    const updatedClasses = buttonClasses + ' clicked'
    setButtonClasses(updatedClasses)
    onClick(buttonId)
  }
  return (
    <ButtonStyled
      key={buttonId}
      ref={buttonRef}
      className={buttonClasses}
      buttonActive={buttonActiveStatus}
      onClick={_onClick}
    >
      <ButtonText>
        {loading ? (
          <>
            <ButtonLoadingIcon className={kind}>
              <use xlinkHref="/icons/sprites.svg#loading" />
            </ButtonLoadingIcon>
            <div>Loading...</div>
          </>
        ) : (
          <>
            <div>{text}</div>
          </>
        )}
      </ButtonText>
    </ButtonStyled>
  )
}
SlidingTabButtonsView.propTypes = {
  kind: PropTypes.string,
  onClick: PropTypes.func,
  clicked: PropTypes.bool.isRequired,
  type: PropTypes.string,
  loading: PropTypes.bool,
}

SlidingTabButtonsView.defaultProps = {
  kind: PRIMARY,
  loading: false,
}
