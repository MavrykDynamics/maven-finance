import * as React from 'react'
import { useState } from 'react'
import { useMailChimpForm } from 'use-mailchimp-form'

// prettier-ignore
import { NewsletterButton, NewsletterForm, NewsletterGrid, NewsletterStatus, NewsletterStyled } from './Newsletter.style'

export const NewsletterView = () => {
  const url = 'https://Finance.us5.list-manage.com/subscribe/post?u=2c7f8eeb6244c13270dca7a76&amp;id=da98ceea07'
  const { loading, error, success, message, handleSubmit } = useMailChimpForm(url)
  //@ts-ignore
  const [values, setValues] = useState({
    EMAIL: '',
    NAME: '',
    ORGANISATI: '',
  })

  const subscribe = () => {}

  return (
    <NewsletterStyled id="newsletter">
      <h1>Subscribe to Mavryk News</h1>
      <NewsletterGrid>
        <img alt="ship" src="/images/ship-stars.svg" />
        <NewsletterForm
          onSubmit={(event) => {
            event.preventDefault()
            handleSubmit(values)
          }}
        >
          <input
            id="NAME"
            placeholder="Name"
            type="text"
            value={values.NAME}
            onChange={(e: any) =>
              setValues({
                ...values,
                NAME: e.target.value,
              })
            }
          />
          <input
            id="ORGANISATI"
            placeholder="Organisation"
            type="text"
            value={values.ORGANISATI}
            onChange={(e: any) =>
              setValues({
                ...values,
                ORGANISATI: e.target.value,
              })
            }
          />
          <input
            id="EMAIL"
            placeholder="Email*"
            type="email"
            value={values.EMAIL}
            onChange={(e: any) =>
              setValues({
                ...values,
                EMAIL: e.target.value,
              })
            }
          />

          <NewsletterButton onClick={() => subscribe()}>Subscribe</NewsletterButton>
        </NewsletterForm>
      </NewsletterGrid>
      <NewsletterStatus>
        {loading && <div className="loading">{`Submitting...`}</div>}
        {error && <div className="error">{message}</div>}
        {success && <div className="success">{message}</div>}
      </NewsletterStatus>
    </NewsletterStyled>
  )
}
