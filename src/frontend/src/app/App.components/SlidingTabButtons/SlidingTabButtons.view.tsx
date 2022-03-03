import * as PropTypes from 'prop-types'
import * as React from 'react'

import { TABS, SlidingTabButtonStyle, SlidingTabButtonTypes, PRIMARY } from './SlidingTabButtons.constants'
import { ButtonLoadingIcon, ButtonStyled, ButtonText, SlidingTabButtonsStyled } from './SlidingTabButtons.style'
import { Ref, useRef, useState } from 'react'

type SlidingTabButtonViewProps = {
  kind?: SlidingTabButtonStyle
  onClick?: (val?: any) => void
  clickCallback: () => void
  clicked: boolean
  type?: SlidingTabButtonTypes
  loading: boolean
}

export const SlidingTabButtonsView = ({ kind, onClick, clickCallback, type, loading }: SlidingTabButtonViewProps) => {
  const firstButtonRef = useRef(),
    secondButtonRef = useRef(),
    thirdButtonRef = useRef()
  const [buttonActiveStatus, setButtonActiveStatus] = useState({
    buttonOne: true,
    buttonTwo: false,
    buttonThree: false,
  })
  let generalClasses = kind ?? ''

  const handleButtonClick = (tabId: number) => {
    // if (firstButtonRef?.current) {
    //   const { offsetTop, offsetLeft, offsetHeight } = firstButtonRef?.current
    //   console.log('[First] offsettop', offsetTop)
    //   console.log('[First] offsetLeft', offsetLeft)
    //   console.log('[First] offsetHeight ', offsetHeight)
    // }
    //
    // if (secondButtonRef?.current) {
    //   const { offsetTop, offsetLeft, offsetHeight } = secondButtonRef?.current
    //   console.log('[Second] offsettop', offsetTop)
    //   console.log('[Second] offsetLeft', offsetLeft)
    //   console.log('[Second] offsetHeight ', offsetHeight)
    // }
    // if (thirdButtonRef?.current) {
    //   const { offsetTop, offsetLeft, offsetHeight } = thirdButtonRef?.current
    //   console.log('[Third] offsettop', offsetTop)
    //   console.log('[Third] offsetLeft', offsetLeft)
    //   console.log('[Third] offsetHeight ', offsetHeight)
    // }

    switch (tabId) {
      case 1:
        setButtonActiveStatus({ buttonOne: true, buttonTwo: false, buttonThree: false })
        break
      case 2:
        setButtonActiveStatus({ buttonOne: false, buttonTwo: true, buttonThree: false })
        break
      case 3:
        setButtonActiveStatus({ buttonOne: false, buttonTwo: false, buttonThree: true })
        break
    }
    if (onClick) onClick(tabId)
    clickCallback()
  }
  return (
    <SlidingTabButtonsStyled>
      <TabButton
        buttonRef={firstButtonRef}
        text={'Stage 1'}
        buttonId={1}
        onClick={handleButtonClick}
        generalClasses={generalClasses}
        buttonActiveStatus={buttonActiveStatus.buttonOne}
        loading={loading}
      />
      <TabButton
        buttonRef={secondButtonRef}
        text={'Stage 2'}
        buttonId={2}
        onClick={handleButtonClick}
        generalClasses={generalClasses}
        buttonActiveStatus={buttonActiveStatus.buttonTwo}
        loading={loading}
      />
      <TabButton
        buttonRef={thirdButtonRef}
        text={'Stage 3'}
        buttonId={3}
        onClick={handleButtonClick}
        generalClasses={generalClasses}
        buttonActiveStatus={buttonActiveStatus.buttonThree}
        loading={loading}
      />
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

  if (loading) {
    setButtonClasses(' loading')
  }

  const _onClick = () => {
    setButtonClasses(' clicked')
    console.log(text, buttonClasses)
    onClick(buttonId)
  }
  return (
    <ButtonStyled ref={buttonRef} className={buttonClasses} buttonActive={buttonActiveStatus} onClick={_onClick}>
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
  type: TABS,
  loading: false,
}
