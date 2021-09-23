/* eslint import/no-webpack-loader-syntax: off */
// @ts-ignore
import litepaper from '!raw-loader!./Litepaper.markdown.md'
import Markdown from 'markdown-to-jsx'
import * as React from 'react'
import { useRef, useState } from 'react'
import { useScrollPosition } from '@n8tb1t/use-scroll-position'

import { LitepaperIndex, LitepaperStyled, LitepaperGrid, LitepaperRef } from './Litepaper.style'

export const LitepaperView = () => {
  const [tops, setTops] = useState<any>({
    abstract: 0,
  })

  useScrollPosition(
    () => {
      // prettier-ignore
      //@ts-ignore
      setTops({
        'abstract': document.getElementById('abstract')?.getBoundingClientRect().top!,
        'problem': document.getElementById('problem')?.getBoundingClientRect().top!,
        'solution': document.getElementById('solution')?.getBoundingClientRect().top!,
        'multi-asset-backed-loans': document.getElementById('multi-asset-backed-loans')?.getBoundingClientRect().top!,
        'zusd-a-multi-collateral-soft-pegged-stablecoin': document.getElementById('zusd-a-multi-collateral-soft-pegged-stablecoin')?.getBoundingClientRect().top!,
        'instruments-for-maintaining-a-soft-peg-to-usd': document.getElementById('instruments-for-maintaining-a-soft-peg-to-usd')?.getBoundingClientRect().top!,
        'stability-fee': document.getElementById('stability-fee')?.getBoundingClientRect().top!,
        'dynamic-savings-rate-dsr': document.getElementById('dynamic-savings-rate-dsr')?.getBoundingClientRect().top!,
        'liquidations-and-collateral-auctions': document.getElementById('liquidations-and-collateral-auctions')?.getBoundingClientRect().top!,
        'liquidations': document.getElementById('liquidations')?.getBoundingClientRect().top!,
        'collateral-auctions': document.getElementById('collateral-auctions')?.getBoundingClientRect().top!,
        'satellites-governance-and-the-decentralized-oracle': document.getElementById('satellites-governance-and-the-decentralized-oracle')?.getBoundingClientRect().top!,
        'satellites': document.getElementById('satellites')?.getBoundingClientRect().top!,
        'governance': document.getElementById('governance')?.getBoundingClientRect().top!,
        'satellite-delegations': document.getElementById('satellite-delegations')?.getBoundingClientRect().top!,
        'the-decentralized-oracle': document.getElementById('the-decentralized-oracle')?.getBoundingClientRect().top!,
        'mvk-and-vmvk-doorman-module': document.getElementById('mvk-and-vmvk-doorman-module')?.getBoundingClientRect().top!,
        'what-is-mvk-and-how-does-it-differ-from-vmvk': document.getElementById('what-is-mvk-and-how-does-it-differ-from-vmvk')?.getBoundingClientRect().top!,
        'obtaining-vmvk': document.getElementById('obtaining-vmvk')?.getBoundingClientRect().top!,
        'converting-vmvk-back-to-mvk-exit-fees': document.getElementById('converting-vmvk-back-to-mvk-exit-fees')?.getBoundingClientRect().top!,
        'governance--treasury': document.getElementById('governance--treasury')?.getBoundingClientRect().top!,
        'decentralization': document.getElementById('decentralization')?.getBoundingClientRect().top!,
        'voting-power': document.getElementById('voting-power')?.getBoundingClientRect().top!,
        'voting-with-satellites-electoral-delegates': document.getElementById('voting-with-satellites-electoral-delegates')?.getBoundingClientRect().top!,
        'treasury': document.getElementById('treasury')?.getBoundingClientRect().top!,
        'mavryk-council': document.getElementById('mavryk-council')?.getBoundingClientRect().top!,
        'bootstrapping-liquidity-balancer-style-amm': document.getElementById('bootstrapping-liquidity-balancer-style-amm')?.getBoundingClientRect().top!,
        'yield-farming': document.getElementById('yield-farming')?.getBoundingClientRect().top!,
        'tokenomics': document.getElementById('tokenomics')?.getBoundingClientRect().top!,
        'revenue-model': document.getElementById('revenue-model')?.getBoundingClientRect().top!,
        'token-flow': document.getElementById('token-flow')?.getBoundingClientRect().top!,
      })
    },
    [],
    undefined,
    false,
    300,
  )

  return (
    <LitepaperStyled>
      <LitepaperGrid>
        <div>
          <LitepaperIndex>
            <li>
              <LitepaperRef href="#abstract" title="Abstract" selected={tops['abstract'] <= 10 && tops['problem'] > 10}>
                Abstract
              </LitepaperRef>
            </li>
            <li>
              <LitepaperRef href="#problem" title="Problem" selected={tops['problem'] <= 10 && tops['solution'] > 10}>
                Problem
              </LitepaperRef>
            </li>
            <li>
              <LitepaperRef
                href="#solution"
                title="Solution"
                selected={tops['solution'] <= 10 && tops['multi-asset-backed-loans'] > 10}
              >
                Solution
              </LitepaperRef>
            </li>
            <li>
              <LitepaperRef
                href="#multi-asset-backed-loans"
                title="Multi-Asset Backed Loans"
                selected={
                  tops['multi-asset-backed-loans'] <= 10 && tops['zusd-a-multi-collateral-soft-pegged-stablecoin'] > 10
                }
              >
                Multi-Asset Backed Loans
              </LitepaperRef>
              <ul className="nav">
                <li>
                  <LitepaperRef
                    href="#zusd-a-multi-collateral-soft-pegged-stablecoin"
                    title="zUSD: A Multi-Collateral Soft-Pegged Stablecoin"
                    selected={
                      tops['zusd-a-multi-collateral-soft-pegged-stablecoin'] <= 10 &&
                      tops['instruments-for-maintaining-a-soft-peg-to-usd'] > 10
                    }
                  >
                    zUSD: A Multi-Collateral Soft-Pegged Stablecoin
                  </LitepaperRef>
                </li>
                <li>
                  <LitepaperRef
                    href="#instruments-for-maintaining-a-soft-peg-to-usd"
                    title="Instruments For Maintaining A Soft Peg To USD"
                    selected={tops['instruments-for-maintaining-a-soft-peg-to-usd'] <= 10 && tops['stability-fee'] > 10}
                  >
                    Instruments For Maintaining A Soft Peg To USD
                  </LitepaperRef>
                </li>
                <li>
                  <LitepaperRef
                    href="#stability-fee"
                    title="Stability Fee"
                    selected={tops['stability-fee'] <= 10 && tops['dynamic-savings-rate-dsr'] > 10}
                  >
                    Stability Fee
                  </LitepaperRef>
                </li>
                <li>
                  <LitepaperRef
                    href="#dynamic-savings-rate-dsr"
                    title="Dynamic Savings Rate (DSR)"
                    selected={
                      tops['dynamic-savings-rate-dsr'] <= 10 && tops['liquidations-and-collateral-auctions'] > 10
                    }
                  >
                    Dynamic Savings Rate (DSR)
                  </LitepaperRef>
                </li>
              </ul>
            </li>
            <li>
              <LitepaperRef
                href="#liquidations-and-collateral-auctions"
                title="Liquidations and Collateral Auctions"
                selected={tops['liquidations-and-collateral-auctions'] <= 10 && tops['liquidations'] > 10}
              >
                Liquidations and Collateral Auctions
              </LitepaperRef>
              <ul className="nav">
                <li>
                  <LitepaperRef
                    href="#liquidations"
                    title="Liquidations"
                    selected={tops['liquidations'] <= 10 && tops['collateral-auctions'] > 10}
                  >
                    Liquidations
                  </LitepaperRef>
                </li>
                <li>
                  <LitepaperRef
                    href="#collateral-auctions"
                    title="Collateral Auctions"
                    selected={
                      tops['collateral-auctions'] <= 10 &&
                      tops['satellites-governance-and-the-decentralized-oracle'] > 10
                    }
                  >
                    Collateral Auctions
                  </LitepaperRef>
                </li>
              </ul>
            </li>
            <li>
              <LitepaperRef
                href="#satellites-governance-and-the-decentralized-oracle"
                title="Satellites, Governance, and the Decentralized Oracle"
                selected={tops['satellites-governance-and-the-decentralized-oracle'] <= 10 && tops['satellites'] > 10}
              >
                Satellites, Governance, and the Decentralized Oracle
              </LitepaperRef>
              <ul className="nav">
                <li>
                  <LitepaperRef
                    href="#satellites"
                    title="Satellites"
                    selected={tops['satellites'] <= 10 && tops['governance'] > 10}
                  >
                    Satellites
                  </LitepaperRef>
                </li>
                <li>
                  <LitepaperRef
                    href="#governance"
                    title="Governance"
                    selected={tops['governance'] <= 10 && tops['satellite-delegations'] > 10}
                  >
                    Governance
                  </LitepaperRef>
                </li>
                <li>
                  <LitepaperRef
                    href="#satellite-delegations"
                    title="Satellite Delegations"
                    selected={tops['satellite-delegations'] <= 10 && tops['the-decentralized-oracle'] > 10}
                  >
                    Satellite Delegations
                  </LitepaperRef>
                </li>
                <li>
                  <LitepaperRef
                    href="#the-decentralized-oracle"
                    title="The Decentralized Oracle"
                    selected={tops['the-decentralized-oracle'] <= 10 && tops['mvk-and-vmvk-doorman-module'] > 10}
                  >
                    The Decentralized Oracle
                  </LitepaperRef>
                </li>
              </ul>
            </li>
            <li>
              <LitepaperRef
                href="#mvk-and-vmvk-doorman-module"
                title="MVK and vMVK (Doorman Module)"
                selected={
                  tops['mvk-and-vmvk-doorman-module'] <= 10 && tops['what-is-mvk-and-how-does-it-differ-from-vmvk'] > 10
                }
              >
                MVK and vMVK (Doorman Module)
              </LitepaperRef>
              <ul className="nav">
                <li>
                  <LitepaperRef
                    href="#what-is-mvk-and-how-does-it-differ-from-vmvk"
                    title="What is MVK and how does it differ from vMVK?"
                    selected={tops['what-is-mvk-and-how-does-it-differ-from-vmvk'] <= 10 && tops['obtaining-vmvk'] > 10}
                  >
                    What is MVK and how does it differ from vMVK?
                  </LitepaperRef>
                </li>
                <li>
                  <LitepaperRef
                    href="#obtaining-vmvk"
                    title="Obtaining vMVK"
                    selected={tops['obtaining-vmvk'] <= 10 && tops['converting-vmvk-back-to-mvk-exit-fees'] > 10}
                  >
                    Obtaining vMVK
                  </LitepaperRef>
                </li>
                <li>
                  <LitepaperRef
                    href="#converting-vmvk-back-to-mvk-exit-fees"
                    title="Converting vMVK back to MVK (exit fees)"
                    selected={tops['converting-vmvk-back-to-mvk-exit-fees'] <= 10 && tops['governance--treasury'] > 10}
                  >
                    Converting vMVK back to MVK (exit fees)
                  </LitepaperRef>
                </li>
              </ul>
            </li>
            <li>
              <LitepaperRef
                href="#governance--treasury"
                title="Governance & Treasury"
                selected={tops['governance--treasury'] <= 10 && tops['decentralization'] > 10}
              >
                Governance & Treasury
              </LitepaperRef>
              <ul className="nav">
                <li>
                  <LitepaperRef
                    href="#decentralization"
                    title="Decentralization"
                    selected={tops['decentralization'] <= 10 && tops['voting-power'] > 10}
                  >
                    Decentralization
                  </LitepaperRef>
                </li>
                <li>
                  <LitepaperRef
                    href="#voting-power"
                    title="Voting power"
                    selected={tops['voting-power'] <= 10 && tops['voting-with-satellites-electoral-delegates'] > 10}
                  >
                    Voting power
                  </LitepaperRef>
                </li>
                <li>
                  <LitepaperRef
                    href="#voting-with-satellites-electoral-delegates"
                    title="Voting with Satellites (electoral delegates)"
                    selected={tops['voting-with-satellites-electoral-delegates'] <= 10 && tops['treasury'] > 10}
                  >
                    Voting with Satellites (electoral delegates)
                  </LitepaperRef>
                </li>
                <li>
                  <LitepaperRef
                    href="#treasury"
                    title="Treasury"
                    selected={tops['treasury'] <= 10 && tops['mavryk-council'] > 10}
                  >
                    Treasury
                  </LitepaperRef>
                </li>
              </ul>
            </li>
            <li>
              <LitepaperRef
                href="#mavryk-council"
                title="Mavryk Council"
                selected={tops['mavryk-council'] <= 10 && tops['bootstrapping-liquidity-balancer-style-amm'] > 10}
              >
                Mavryk Council
              </LitepaperRef>
            </li>
            <li>
              <LitepaperRef
                href="#bootstrapping-liquidity-balancer-style-amm"
                title="Bootstrapping Liquidity (Balancer Style AMM)"
                selected={tops['bootstrapping-liquidity-balancer-style-amm'] <= 10 && tops['yield-farming'] > 10}
              >
                Bootstrapping Liquidity (Balancer Style AMM)
              </LitepaperRef>
            </li>
            <li>
              <LitepaperRef
                href="#yield-farming"
                title="Yield Farming"
                selected={tops['yield-farming'] <= 10 && tops['tokenomics'] > 10}
              >
                Yield Farming
              </LitepaperRef>
            </li>
            <li>
              <LitepaperRef
                href="#tokenomics"
                title="Tokenomics"
                selected={tops['tokenomics'] <= 10 && tops['revenue-model'] > 10}
              >
                Tokenomics
              </LitepaperRef>
              <ul className="nav">
                <li>
                  <LitepaperRef
                    href="#revenue-model"
                    title="Revenue Model"
                    selected={tops['revenue-model'] <= 10 && tops['token-flow'] > 10}
                  >
                    Revenue Model
                  </LitepaperRef>
                </li>
                <li>
                  <LitepaperRef href="#token-flow" title="Token Flow" selected={tops['token-flow'] <= 10}>
                    Token Flow
                  </LitepaperRef>
                </li>
              </ul>
            </li>
          </LitepaperIndex>
        </div>
        <Markdown
          children={litepaper}
          // options={{
          //   // disableParsingRawHTML: true,
          //   overrides: {
          //     h1: {
          //       component: ChapterH1,
          //     },
          //   },
          // }}
        />
      </LitepaperGrid>
    </LitepaperStyled>
  )
}
