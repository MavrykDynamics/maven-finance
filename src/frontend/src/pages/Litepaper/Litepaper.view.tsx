/* eslint import/no-webpack-loader-syntax: off */
// @ts-ignore
import litepaper from '!raw-loader!./Litepaper.markdown.md'
import { useScrollPosition } from '@n8tb1t/use-scroll-position'
import Markdown from 'markdown-to-jsx'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { HashLink } from 'react-router-hash-link'

import { LitepaperGrid, LitepaperIndex, LitepaperLink, LitepaperStyled } from './Litepaper.style'

export const LitepaperView = () => {
  const [tops, setTops] = useState<any>({
    abstract: 0,
  })

  useEffect(() => {
    window.scroll(0, 0)
  }, [])

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
              <LitepaperLink selected={tops['abstract'] <= 110 && tops['problem'] > 110}>
                <HashLink
                  to="#abstract"
                  scroll={(el) =>
                    window.scrollTo({
                      behavior: 'smooth',
                      top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                    })
                  }
                >
                  Abstract
                </HashLink>
              </LitepaperLink>
            </li>
            <li>
              <LitepaperLink selected={tops['problem'] <= 110 && tops['solution'] > 110}>
                <HashLink
                  to="#problem"
                  scroll={(el) =>
                    window.scrollTo({
                      behavior: 'smooth',
                      top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                    })
                  }
                >
                  Problem
                </HashLink>
              </LitepaperLink>
            </li>

            <li>
              <LitepaperLink selected={tops['solution'] <= 110 && tops['multi-asset-backed-loans'] > 110}>
                <HashLink
                  to="#solution"
                  scroll={(el) =>
                    window.scrollTo({
                      behavior: 'smooth',
                      top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                    })
                  }
                >
                  Solution
                </HashLink>
              </LitepaperLink>
            </li>
            <li>
              <LitepaperLink
                selected={
                  tops['multi-asset-backed-loans'] <= 110 &&
                  tops['zusd-a-multi-collateral-soft-pegged-stablecoin'] > 110
                }
              >
                <HashLink
                  to="#multi-asset-backed-loans"
                  scroll={(el) =>
                    window.scrollTo({
                      behavior: 'smooth',
                      top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                    })
                  }
                >
                  Multi-Asset Backed Loans
                </HashLink>
              </LitepaperLink>
              <ul className="nav">
                <li>
                  <LitepaperLink
                    selected={
                      tops['zusd-a-multi-collateral-soft-pegged-stablecoin'] <= 110 &&
                      tops['instruments-for-maintaining-a-soft-peg-to-usd'] > 110
                    }
                  >
                    <HashLink
                      to="#zusd-a-multi-collateral-soft-pegged-stablecoin"
                      scroll={(el) =>
                        window.scrollTo({
                          behavior: 'smooth',
                          top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                        })
                      }
                    >
                      zUSD: A Multi-Collateral Soft-Pegged Stablecoin
                    </HashLink>
                  </LitepaperLink>
                </li>
                <li>
                  <LitepaperLink
                    selected={
                      tops['instruments-for-maintaining-a-soft-peg-to-usd'] <= 110 && tops['stability-fee'] > 110
                    }
                  >
                    <HashLink
                      to="#instruments-for-maintaining-a-soft-peg-to-usd"
                      scroll={(el) =>
                        window.scrollTo({
                          behavior: 'smooth',
                          top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                        })
                      }
                    >
                      Instruments For Maintaining A Soft Peg To USD
                    </HashLink>
                  </LitepaperLink>
                </li>
                <li>
                  <LitepaperLink selected={tops['stability-fee'] <= 110 && tops['dynamic-savings-rate-dsr'] > 110}>
                    <HashLink
                      to="#stability-fee"
                      scroll={(el) =>
                        window.scrollTo({
                          behavior: 'smooth',
                          top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                        })
                      }
                    >
                      Stability Fee
                    </HashLink>
                  </LitepaperLink>
                </li>
                <li>
                  <LitepaperLink
                    selected={
                      tops['dynamic-savings-rate-dsr'] <= 110 && tops['liquidations-and-collateral-auctions'] > 110
                    }
                  >
                    <HashLink
                      to="#dynamic-savings-rate-dsr"
                      scroll={(el) =>
                        window.scrollTo({
                          behavior: 'smooth',
                          top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                        })
                      }
                    >
                      Dynamic Savings Rate (DSR)
                    </HashLink>
                  </LitepaperLink>
                </li>
              </ul>
            </li>
            <li>
              <LitepaperLink
                selected={tops['liquidations-and-collateral-auctions'] <= 110 && tops['liquidations'] > 110}
              >
                <HashLink
                  to="#liquidations-and-collateral-auctions"
                  scroll={(el) =>
                    window.scrollTo({
                      behavior: 'smooth',
                      top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                    })
                  }
                >
                  Liquidations and Collateral Auctions
                </HashLink>
              </LitepaperLink>
              <ul className="nav">
                <li>
                  <LitepaperLink selected={tops['liquidations'] <= 110 && tops['collateral-auctions'] > 110}>
                    <HashLink
                      to="#liquidations"
                      scroll={(el) =>
                        window.scrollTo({
                          behavior: 'smooth',
                          top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                        })
                      }
                    >
                      Liquidations
                    </HashLink>
                  </LitepaperLink>
                </li>
                <li>
                  <LitepaperLink
                    selected={
                      tops['collateral-auctions'] <= 110 &&
                      tops['satellites-governance-and-the-decentralized-oracle'] > 110
                    }
                  >
                    <HashLink
                      to="#collateral-auctions"
                      scroll={(el) =>
                        window.scrollTo({
                          behavior: 'smooth',
                          top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                        })
                      }
                    >
                      Collateral Auctions
                    </HashLink>
                  </LitepaperLink>
                </li>
              </ul>
            </li>
            <li>
              <LitepaperLink
                selected={tops['satellites-governance-and-the-decentralized-oracle'] <= 110 && tops['satellites'] > 110}
              >
                <HashLink
                  to="#satellites-governance-and-the-decentralized-oracle"
                  scroll={(el) =>
                    window.scrollTo({
                      behavior: 'smooth',
                      top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                    })
                  }
                >
                  Satellites, Governance, and the Decentralized Oracle
                </HashLink>
              </LitepaperLink>
              <ul className="nav">
                <li>
                  <LitepaperLink selected={tops['satellites'] <= 110 && tops['governance'] > 110}>
                    <HashLink
                      to="#satellites"
                      scroll={(el) =>
                        window.scrollTo({
                          behavior: 'smooth',
                          top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                        })
                      }
                    >
                      Satellites
                    </HashLink>
                  </LitepaperLink>
                </li>
                <li>
                  <LitepaperLink selected={tops['governance'] <= 110 && tops['satellite-delegations'] > 110}>
                    <HashLink
                      to="#governance"
                      scroll={(el) =>
                        window.scrollTo({
                          behavior: 'smooth',
                          top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                        })
                      }
                    >
                      Governance
                    </HashLink>
                  </LitepaperLink>
                </li>
                <li>
                  <LitepaperLink
                    selected={tops['satellite-delegations'] <= 110 && tops['the-decentralized-oracle'] > 110}
                  >
                    <HashLink
                      to="#satellite-delegations"
                      scroll={(el) =>
                        window.scrollTo({
                          behavior: 'smooth',
                          top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                        })
                      }
                    >
                      Satellite Delegations
                    </HashLink>
                  </LitepaperLink>
                </li>
                <li>
                  <LitepaperLink
                    selected={tops['the-decentralized-oracle'] <= 110 && tops['mvk-and-vmvk-doorman-module'] > 110}
                  >
                    <HashLink
                      to="#the-decentralized-oracle"
                      scroll={(el) =>
                        window.scrollTo({
                          behavior: 'smooth',
                          top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                        })
                      }
                    >
                      The Decentralized Oracle
                    </HashLink>
                  </LitepaperLink>
                </li>
              </ul>
            </li>
            <li>
              <LitepaperLink
                selected={
                  tops['mvk-and-vmvk-doorman-module'] <= 110 &&
                  tops['what-is-mvk-and-how-does-it-differ-from-vmvk'] > 110
                }
              >
                <HashLink
                  to="#mvk-and-vmvk-doorman-module"
                  scroll={(el) =>
                    window.scrollTo({
                      behavior: 'smooth',
                      top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                    })
                  }
                >
                  MVK and vMVK (Doorman Module)
                </HashLink>
              </LitepaperLink>
              <ul className="nav">
                <li>
                  <LitepaperLink
                    selected={
                      tops['what-is-mvk-and-how-does-it-differ-from-vmvk'] <= 110 && tops['obtaining-vmvk'] > 110
                    }
                  >
                    <HashLink
                      to="#what-is-mvk-and-how-does-it-differ-from-vmvk"
                      scroll={(el) =>
                        window.scrollTo({
                          behavior: 'smooth',
                          top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                        })
                      }
                    >
                      What is MVK and how does it differ from vMVK?
                    </HashLink>
                  </LitepaperLink>
                </li>
                <li>
                  <LitepaperLink
                    selected={tops['obtaining-vmvk'] <= 110 && tops['converting-vmvk-back-to-mvk-exit-fees'] > 110}
                  >
                    <HashLink
                      to="#obtaining-vmvk"
                      scroll={(el) =>
                        window.scrollTo({
                          behavior: 'smooth',
                          top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                        })
                      }
                    >
                      Obtaining vMVK
                    </HashLink>
                  </LitepaperLink>
                </li>
                <li>
                  <LitepaperLink
                    selected={
                      tops['converting-vmvk-back-to-mvk-exit-fees'] <= 110 && tops['governance--treasury'] > 110
                    }
                  >
                    <HashLink
                      to="#converting-vmvk-back-to-mvk-exit-fees"
                      scroll={(el) =>
                        window.scrollTo({
                          behavior: 'smooth',
                          top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                        })
                      }
                    >
                      Converting vMVK back to MVK (exit fees)
                    </HashLink>
                  </LitepaperLink>
                </li>
              </ul>
            </li>
            <li>
              <LitepaperLink selected={tops['governance--treasury'] <= 110 && tops['decentralization'] > 110}>
                <HashLink
                  to="#governance--treasury"
                  scroll={(el) =>
                    window.scrollTo({
                      behavior: 'smooth',
                      top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                    })
                  }
                >
                  Governance & Treasury
                </HashLink>
              </LitepaperLink>
              <ul className="nav">
                <li>
                  <LitepaperLink selected={tops['decentralization'] <= 110 && tops['voting-power'] > 110}>
                    <HashLink
                      to="#decentralization"
                      scroll={(el) =>
                        window.scrollTo({
                          behavior: 'smooth',
                          top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                        })
                      }
                    >
                      Decentralization
                    </HashLink>
                  </LitepaperLink>
                </li>
                <li>
                  <LitepaperLink
                    selected={tops['voting-power'] <= 110 && tops['voting-with-satellites-electoral-delegates'] > 110}
                  >
                    <HashLink
                      to="#voting-power"
                      scroll={(el) =>
                        window.scrollTo({
                          behavior: 'smooth',
                          top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                        })
                      }
                    >
                      Voting power
                    </HashLink>
                  </LitepaperLink>
                </li>
                <li>
                  <LitepaperLink
                    selected={tops['voting-with-satellites-electoral-delegates'] <= 110 && tops['treasury'] > 110}
                  >
                    <HashLink
                      to="#voting-with-satellites-electoral-delegates"
                      scroll={(el) =>
                        window.scrollTo({
                          behavior: 'smooth',
                          top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                        })
                      }
                    >
                      Voting with Satellites (electoral delegates)
                    </HashLink>
                  </LitepaperLink>
                </li>
                <li>
                  <LitepaperLink selected={tops['treasury'] <= 110 && tops['mavryk-council'] > 110}>
                    <HashLink
                      to="#treasury"
                      scroll={(el) =>
                        window.scrollTo({
                          behavior: 'smooth',
                          top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                        })
                      }
                    >
                      Treasury
                    </HashLink>
                  </LitepaperLink>
                </li>
              </ul>
            </li>
            <li>
              <LitepaperLink
                selected={tops['mavryk-council'] <= 110 && tops['bootstrapping-liquidity-balancer-style-amm'] > 110}
              >
                <HashLink
                  to="#mavryk-council"
                  scroll={(el) =>
                    window.scrollTo({
                      behavior: 'smooth',
                      top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                    })
                  }
                >
                  Mavryk Council
                </HashLink>
              </LitepaperLink>
            </li>
            <li>
              <LitepaperLink
                selected={tops['bootstrapping-liquidity-balancer-style-amm'] <= 110 && tops['yield-farming'] > 110}
              >
                <HashLink
                  to="#bootstrapping-liquidity-balancer-style-amm"
                  scroll={(el) =>
                    window.scrollTo({
                      behavior: 'smooth',
                      top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                    })
                  }
                >
                  Bootstrapping Liquidity (Balancer Style AMM)
                </HashLink>
              </LitepaperLink>
            </li>
            <li>
              <LitepaperLink selected={tops['yield-farming'] <= 110 && tops['tokenomics'] > 110}>
                <HashLink
                  to="#yield-farming"
                  scroll={(el) =>
                    window.scrollTo({
                      behavior: 'smooth',
                      top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                    })
                  }
                >
                  Yield Farming
                </HashLink>
              </LitepaperLink>
            </li>
            <li>
              <LitepaperLink selected={tops['tokenomics'] <= 110 && tops['revenue-model'] > 110}>
                <HashLink
                  to="#tokenomics"
                  scroll={(el) =>
                    window.scrollTo({
                      behavior: 'smooth',
                      top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                    })
                  }
                >
                  Tokenomics
                </HashLink>
              </LitepaperLink>
              <ul className="nav">
                <li>
                  <LitepaperLink selected={tops['revenue-model'] <= 110 && tops['token-flow'] > 110}>
                    <HashLink
                      to="#revenue-model"
                      scroll={(el) =>
                        window.scrollTo({
                          behavior: 'smooth',
                          top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                        })
                      }
                    >
                      Revenue Model
                    </HashLink>
                  </LitepaperLink>
                </li>
                <li>
                  <LitepaperLink selected={tops['token-flow'] <= 110}>
                    <HashLink
                      to="#token-flow"
                      scroll={(el) =>
                        window.scrollTo({
                          behavior: 'smooth',
                          top: el.getBoundingClientRect().top + window.pageYOffset - 100,
                        })
                      }
                    >
                      Token Flow
                    </HashLink>
                  </LitepaperLink>
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
