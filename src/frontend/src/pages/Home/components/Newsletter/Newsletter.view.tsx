import * as React from 'react'
import { useState } from 'react'

import { NewsletterStyled, NewsletterForm, NewsletterGrid, NewsletterButton } from './Newsletter.style'

export const NewsletterView = () => {
  const [values, setValues] = useState({
    name: undefined,
    organisation: undefined,
    email: undefined,
  })

  const subscribe = () => {}

  return (
    <NewsletterStyled id="newsletter">
      <h1>Subscribe to Mavryk News</h1>
      <NewsletterGrid>
        <img alt="ship" src="/images/ship-stars.svg" />
        <NewsletterForm>
          <input
            type="text"
            value={values.name}
            placeholder="Name"
            onChange={(e: any) =>
              setValues({
                ...values,
                name: e.target.value,
              })
            }
          />
          <input
            type="text"
            value={values.organisation}
            placeholder="Organisation"
            onChange={(e: any) =>
              setValues({
                ...values,
                organisation: e.target.value,
              })
            }
          />
          <input
            type="text"
            value={values.email}
            placeholder="Email*"
            onChange={(e: any) =>
              setValues({
                ...values,
                email: e.target.value,
              })
            }
          />
          <NewsletterButton onClick={() => subscribe()}>Subscribe</NewsletterButton>
        </NewsletterForm>
      </NewsletterGrid>
    </NewsletterStyled>
  )
}
