import * as React from 'react'
import { useState } from 'react'

// prettier-ignore
import { HighligthsContainer, HighligthsContent, HighligthsGrid, HighligthsItem, HighligthsSelector, HighligthsStyled } from './Highligths.style'

const contents = {
  loans: {
    title: 'Loans',
    content: `Free the equity trapped in your crypto assets by utilizing them to mint a loan for yourself without any paperwork or bankers. Mavryk’s multi asset vaults are maintained by a set of trust-less & decentralized smart contracts that run on the Tezos blockchain.
    
Mavryk vaults allow users to mint for themselves a loan in an algorithmic stablecoin called zUSD. Users can deposit multiple assets into the vault to best diversify the stability of their loan. zUSD may be used to to earn passive income with a zUSD savings account, utilized for yield farming, to leverage their positions, or send to any Tezos wallet.`,
  },
  savings: {
    title: 'Savings APY',
    content: `A savings account mechanism will be offered in order to stabilize the peg of zUSD to the US dollar. This acts to offset the sell pressure on zUSD and incentivize the use of zUSD as a stable mechanism for utilization.
    
There are two main mechanisms that fund the DSR. At first, users will earn MVK as a reward for their deposits. Users will also earn shared rewards from the stability fees earned from the on-chain Mavryk treasury.
    
The DSR allows any to participate in the Mavryk ecosystem by simply purchasing zUSD on the open market, without having to expose themselves to maintaining an open loan position.`,
  },
  oracle: {
    title: 'Price Oracle',
    content: `One of the main elements of ensuring that a DeFi ecosystem remains out of the hands of centralized price manipulations is utilizing a decentralized price feed mechanism known as an oracle.

In order to ensure the credibility & accuracy of the price data provided, Mavryk relies on an array of price feed providers known as ‘Satellites.’ Mavryk Satellites follow a consensus mechanism similar to the LPoS mechanism of Tezos, and are required to post a security deposit (bond). If there was a malicious attempt to defraud the system, this would result in a slashing of the Satellite’s collateral as a penalty.`,
  },
  governance: {
    title: 'Governance',
    content: `Mavryk’s governance is completely controlled by the community through an on-chain DAO via an array of Satellite nodes & delegations. Once launched, MVK stakeholders have direct control of the Mavryk ecosystem.

MVK stakeholders are simply need to stake their tokens and delegate them to a Satellite of their choice, which votes on their behalf. Similar to Tezos, MVK stakeholders may re-delegate to a different Satellite at any moment, with zero penalty. This form of liquid democracy helps mitigate low voter turnouts which are detrimental to decentralized entities.
    
Additionally, governance participation is also rewarded with income from the on-chain treasury. This incentivizes stakeholders to take an active role in Mavryk’s governance, and rewards them for their advisory similar to how consultants are remunerated for their services.`,
  },
  delegations: {
    title: 'Delegations',
    content: `Stakeholders of MVK who do not want to run their own Satellite can delegate their governance power to an existing Satellite. The Satellite never has the ability to transfer or spend a delegate’s tokens, but can only utilize their token’s voting weight for governance decisions and oracle price feeds.

In order to ensure a healthy ecosystem of Satellites, the slashing risk is shared between the Satellite and their delegates. This is done as a security mechanism for the oracles, and so that delegates will be diligent when choosing a quality Satellite to maintain the price feeds.`,
  },
}

export const HighligthsView = () => {
  const [selectedItem, setSelectedItem] = useState(contents.loans)

  return (
    <HighligthsStyled>
      <HighligthsContainer>
        <h1>Platform Highlights</h1>
        <HighligthsGrid>
          <HighligthsSelector>
            <HighligthsItem
              selected={selectedItem.title === contents.loans.title}
              onClick={() => setSelectedItem(contents.loans)}
            >
              <img alt="feature" src="/images/dollar.svg" />
              <div>Loans</div>
            </HighligthsItem>
            <HighligthsItem
              selected={selectedItem.title === contents.savings.title}
              onClick={() => setSelectedItem(contents.savings)}
            >
              <img alt="feature" src="/images/percent.svg" />
              <div>Savings APY​</div>
            </HighligthsItem>
            <HighligthsItem
              selected={selectedItem.title === contents.oracle.title}
              onClick={() => setSelectedItem(contents.oracle)}
            >
              <img alt="feature" src="/images/price.svg" />
              <div>Price Oracle​</div>
            </HighligthsItem>
            <HighligthsItem
              selected={selectedItem.title === contents.governance.title}
              onClick={() => setSelectedItem(contents.governance)}
            >
              <img alt="feature" src="/images/governance.svg" />
              <div>Governance</div>
            </HighligthsItem>
            <HighligthsItem
              selected={selectedItem.title === contents.delegations.title}
              onClick={() => setSelectedItem(contents.delegations)}
            >
              <img alt="feature" src="/images/delegations.svg" />
              <div>Delegations</div>
            </HighligthsItem>
          </HighligthsSelector>
          <HighligthsContent>
            <h2>{selectedItem.title}</h2>
            <p>{selectedItem.content}</p>
          </HighligthsContent>
        </HighligthsGrid>
      </HighligthsContainer>
    </HighligthsStyled>
  )
}
