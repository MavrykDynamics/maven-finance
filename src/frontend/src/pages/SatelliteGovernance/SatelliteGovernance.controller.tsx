import { Page } from 'styles'

// const
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import Icon from '../../app/App.components/Icon/Icon.view'

// style
import { SatelliteGovernanceStyled } from './SatelliteGovernance.style'

export const SatelliteGovernance = () => {
  return (
    <Page>
      <PageHeader page={'satellite-governance'} kind={PRIMARY} />
      <SatelliteGovernanceStyled>
        <article className="satellite-governance-article">
          <div className="satellite-governance-info">
            <h3>Total Active Satellites</h3>
            <p>
              350{' '}
              <a
                className="info-link"
                href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
                target="_blank"
                rel="noreferrer"
              >
                <Icon id="question" />
              </a>
            </p>
          </div>
          <div className="satellite-governance-info">
            <h3>Total Oracle Networks</h3>
            <p>
              920+{' '}
              <a
                className="info-link"
                href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
                target="_blank"
                rel="noreferrer"
              >
                <Icon id="question" />
              </a>
            </p>
          </div>
          <div className="satellite-governance-info">
            <h3>Total Delegated MVK</h3>
            <p>
              2,300,000,000+{' '}
              <a
                className="info-link"
                href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
                target="_blank"
                rel="noreferrer"
              >
                <Icon id="question" />
              </a>
            </p>
          </div>
          <div className="satellite-governance-info">
            <h3>Ongoing Actions</h3>
            <p>
              350{' '}
              <a
                className="info-link"
                href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
                target="_blank"
                rel="noreferrer"
              >
                <Icon id="question" />
              </a>
            </p>
          </div>
        </article>
      </SatelliteGovernanceStyled>
    </Page>
  )
}

export default SatelliteGovernance
