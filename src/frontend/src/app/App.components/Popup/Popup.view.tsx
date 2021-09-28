import { NewsletterView } from 'pages/Home/components/Newsletter/Newsletter.view'
import * as PropTypes from 'prop-types'
import * as React from 'react'
import { useEffect, useState } from 'react'

import { PopupClose, PopupStyled } from './Popup.style'

export const PopupView = () => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true)
      console.log('show')
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {show && (
        <PopupStyled>
          <NewsletterView />
          <PopupClose onClick={() => setShow(false)}>
            <svg>
              <use xlinkHref="/icons/sprites.svg#close" />
            </svg>
          </PopupClose>
        </PopupStyled>
      )}
    </>
  )
}
