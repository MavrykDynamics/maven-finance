import { Button } from 'app/App.components/Button/Button.controller'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { Page } from 'styles/components'

// prettier-ignore
import { JubontronContainer, JubontronSubTitle, JubontronTitle, JumbotronButton, JumbotronButtons, JumbotronSocials, JumbotronStyled } from './Jumbotron.style'

export const JumbotronView = () => {
  return (
    <JumbotronStyled>
      <Page>
        <JubontronContainer>
          <JubontronTitle>
            <div>A Decentralized</div>
            <div>Finance Ecosystem</div>
          </JubontronTitle>
          <JubontronSubTitle>
            Mavryk is a decentralized finance ecosystem designed for community governance and allow users to borrow,
            earn, and unlock the world from legacy financial systems.
          </JubontronSubTitle>
          <JumbotronButtons>
            <JumbotronButton>Sign Up</JumbotronButton>
            <Link to="/litepaper">
              <JumbotronButton secondary>Litepaper</JumbotronButton>
            </Link>
          </JumbotronButtons>
          <JumbotronSocials>
            <a href="https://twitter.com/Mavryk_Finance" target="_blank" rel="noreferrer">
              <svg>
                <use xlinkHref="/icons/sprites.svg#twitter" />
              </svg>
            </a>
            <a href="https://t.me/Mavryk_Finance" target="_blank" rel="noreferrer">
              <svg>
                <use xlinkHref="/icons/sprites.svg#telegram" />
              </svg>
            </a>
            <a href="https://medium.com/@Mavryk_Finance" target="_blank" rel="noreferrer">
              <svg>
                <use xlinkHref="/icons/sprites.svg#medium" />
              </svg>
            </a>
            <a href="https://www.linkedin.com/company/mavryk-finance/" target="_blank" rel="noreferrer">
              <svg>
                <use xlinkHref="/icons/sprites.svg#linkedin" />
              </svg>
            </a>
          </JumbotronSocials>
        </JubontronContainer>
      </Page>
    </JumbotronStyled>
  )
}
