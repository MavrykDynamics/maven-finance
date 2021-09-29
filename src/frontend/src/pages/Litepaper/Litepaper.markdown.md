# Mavryk Litepaper

## Abstract
Mavryk is a decentralized, non-custodial, community-governed financial platform that gives users independent control of their finances. Mavryk enables users to free the equity trapped in their assets, providing liquidity without requiring the involvement of third parties such as banks. 

Additionally, Mavryk is a community-governed entity and rewards stakeholder participation in governance & signing oracle price feeds, in order to bring stability and prosperity to the platform. 

Mavryk's mission is to launch a suite of decentralized finance products on the Tezos blockchain, designed to bring financial freedom to all of its users and to bridge the gap between on-chain finance and the real world.

## Problem
Borrowing money from financial institutions can be difficult and slow: borrowers may face hidden fees, high interest, penalties, and long paperwork which can make access to financial services expensive, or even impossible. 

Banks are not always incentivized to innovate, provide lending quickly, or serve marginalized populations. They can and do display rent-seeking behavior and conflicts of interest. As a result, opportunities to create wealth have tended to be concentrated with incumbents, which is not only unjust but also has been and continues to be a missed economic opportunity on a global scale.

**Technology creates new possibilities for fairer capitalism that innovates away from legacy finance, with platforms that offer true and widespread financial freedom, opportunity, and transparency.**

## Solution
Mavryk Finance offers an innovative approach to finance, independent of legacy banks. In technical terms, Mavryk is a Decentralized Autonomous Organization (**DAO**) with:

* integrated & decentralized pricing oracles, 
* a decentralized finance ecosystem, and 
* a decentralized governance system modeled on the example of Tezos. 

While the applications for such a system are nearly infinite, we _start_ in practice with _one specific use case_: borrowing a stablecoin against a multi-asset collateral. 

<!-- mjg: please note "infinite" link above should either be instantiated or link removed] -->

<!-- mjg: keeping for reference for now [mjg Alex says: Mavryk is an ecosystem, it's not just about zUSD. There will be p2p. Mavryk as a decentralized bank: a DAO (decentralized autonomous organization) banking platform; the first product is zUSD. Mavryk is equal to a DAO, governed by the community, with a native oracle system, and it has vaults and zUSD. Mavryk is a DAO with Tezos-style governance and an integrated decentralized price Oracle system, running on Tezos. (Actually, Mavryk is a .... Obviously you need Oracles to price vaults so you can issue loans (and liquidate, etc) but the underlying technology is ... and here's a list of further applications coming down the pipeline). ] [focuses on one of the products that Mavryk is introducing but does not express all of what Mavryk can be. The First Mavryk product is zUSD] [Mavryk is a DAO with integrated pricing oracles and a decentralized finance ecosystem, and this (zUSD + vault) is our first application]
-->

To this end, Mavryk introduces a soft-pegged stablecoin: **zUSD**, which is algorithmically pegged to the U.S. dollar, and which can be borrowed against assets held as collateral in a multi-asset Mavryk **vault**.

Notably :

* *Mavryk is trustless and decentralized*: A zUSD loan against assets held in a vault is issued, maintained, and repaid using transparent, trustless, and decentralized smart contracts running on [the Tezos blockchain](https://tezos.com/).

* *Mavryk is inherently multi-asset*: Users can diversify the security of their loan by depositing multiple assets into a single vault.

* *zUSD can generate passive income* with a zUSD savings account. Users can leverage their positions, send zUSD to any Tezos wallet, and practice *yield farming*.[^(1)]

[^(1)]: [Yield farming](https://coinmarketcap.com/alexandria/article/what-is-yield-farming) corresponds to earning interest on a deposit like in a bank.

Mavryk uses a [decentralized oracle](#Satellites) to ensure that users' collateral remains free from centralized control and manipulation. Following a model inspired by Tezos' innovative governance, Mavryk allows stakeholders to delegate their governance tokens (**MVK**s) to nodes called *Satellites*, who vote on governance proposals and sign price feeds on stakeholders' behalf. For doing this they earn rewards which are passed back (minus satellite fee) to the delegating stakeholders.[^(2)]

[^(2)]: MVK is the governance token for Mavryk Finance. It is used to operate a Satellite, delegate voting power, and is the payment token that Satellites receive for signing price feeds. More on this [here](#MVK-and-vMVK-Doorman-Module).

## Multi-Asset Backed Loans
Stablecoins are secure and convenient means of payment for goods and services in the context of a crypto-asset portfolio. Mavryk allows its users to put up existing crypto-assets as equity for a zUSD stablecoin loan, up to a 50% loan-to-value ratio (**LTV**). 

Since zUSD is soft-pegged to the USD, the underlying crypto-assets must be converted into something that behaves like cash.

However:

* There is no capital gains tax.

* There is no opportunity cost on any upside potential of the underlying crypto-asset collateral. In other words: the value that your underlying collateral generates while in the Mavryk vault will still accrue to you as its owner.

_Working example: You deposit crypto-assets priced at 10M USD into a Mavryk vault. You borrow up to 5M zUSD tokens, with which to transact. A week later, your transactions are complete and your crypto-asset is now priced at 11M USD. You return the 5M zUSD (plus interests) and recover your assets from the vault. You do not pay capital gains tax, and you recover the collateral in full even though it is worth more in USD than when you put it in._

Mavryk loans can be issued against a single asset (single collateral) or a more complex multi-asset basket (multi-collateral). This enables sophisticated risk & return management techniques.[^(3)] 

[^(3)]: In contrast with “[HODL](https://academy.binance.com/en/glossary/hodl) ”-ing assets, which are limited to one asset at a time.

You can take out a loan by depositing a single/multi-asset collateral into a vault as what is called a **Collateralized Debt Position** (**CDP**).[^(4)] Vaults are over-collateralized by at least 200% collateral to the requested loan value (=50% LTV).[^(5)] Borrowers can mint and withdraw zUSD up to the point when they hit the collateralization ceiling.

[^(4)]: _CDP_ is a term originating in the cryptocurrency community for a loan that is collateralized by crypto and usually in connection with an algorithmic stablecoin loan.

[^(5)]: 50% loan-to-value means that there is double the amount of collateral relative to the borrowed amount. This means exactly the same as being 200% over-collateralized. If the loan is 33% LTV, it would be 300% over-collateralized. The higher the collateralization rate, the more secure the loan is against being liquidated in foreclosure due to price movements of the (possibly volatile) underlying crypto used as collateral.

**_The system does not allow you to obtain a loan that would be lower than the required collateralization ratio, i.e., you can borrow up to half the value of the underlying assets. It is highly recommended to healthily over-collateralize the loan, to avoid [liquidation](#Liquidations)!_**

### zUSD: A Multi-Collateral Soft-Pegged Stablecoin
The off-chain world is dominated by fiat currencies (e.g., U.S. Dollars), relative to which cryptocurrency assets may be susceptible to price fluctuations, as by design there are no factors to stabilize their off-chain value in fiat currency. This disqualifies most cryptocurrencies as a means of stable payment.

Mavryk’s soft-pegged zUSD stablecoin bridges the gap between potentially volatile cryptocurrency assets and the generally (though not always) stable fiat money for payments, and enables you to borrow zUSD against a line of credit defined by your cryptocurrency asset portfolio. In doing this, Mavryk brings the on-chain and off-chain worlds closer together, making each more accessible from the other.

### Instruments For Maintaining A Soft Peg To USD
zUSD’s ecosystem health is determined by its ability to maintain a soft-peg between zUSD and the U.S. Dollar. The ecosystem becomes unstable if the soft-peg is lost, so multiple fail-safe mechanisms work to maintain the peg and thus preserve platform stability:

1. [Stability Fee](#Stability-Fee)
1. [Dynamic Savings Rate (DSR)](#Dynamic-Savings-Rate-(DSR))
1. [Liquidations](#Liquidations) (Under-collateralized vault foreclosures)

### Stability Fee
The _stability fee_ is compound interest on loans, levied by the system on borrowers. It is calculated per block and set at an annualized rate of 2% (which can be adjusted, as explained below). It equation is:

<img src="/images/eq-fee.png" width="440" />

where

<img src="/images/eq-k.png" width="300" />

[The example below](#Stability-fee-calculation-example) illustrates that if you borrow 500 zUSD (at 2% interest) then you would owe 510.10 zUSD after 12 months.

Stability fees oblige borrowers to acquire new zUSD to pay back the interest on their loan.
There are two ways to do this: buy zUSD (e.g. on a DEX), or mint zUSD by taking out a new loan. This means that the Mavryk governance can adjust the stability fee to maintain the zUSD price peg.

In simpler terms:

* _If zUSD is worth less than USD, then the Stability Fee increases. This creates demand for zUSD and reduces its supply, because:_

    * Borrowers require more zUSD to pay back the interest on their loans, increasing demand.
    * Borrowing is more expensive, so borrowers are incentivized to pay their loans back, thus removing zUSD from circulation and reducing supply.
 
    This increase in demand and decrease in supply acts to increase the price of zUSD until the system brings zUSD back to parity with 1 zUSD = 1 USD. 

* _If zUSD is worth more than USD, then the Stability Fee is lowered. This reduces demand for zUSD and increases supply, because:_

    * For a given size of zUSD loan, borrowers need to obtain less zUSD to pay back the interest, reducing demand.
    * Borrowing zUSD is cheaper overall, so a borrower can afford to borrow _more_, thus injecting more zUSD into circulation and increasing supply.

    This decrease in demand and increase in supply acts to decrease the price of zUSD until the system brings zUSD back to parity with 1 zUSD = 1 USD.

#### Stability fee calculation example
Given that:
- 1 XTZ = 2 USD
- Collateralization ratio = 200% / LTV = 50%
- Interest rate = 2% per year
- 525,600 blocks per year or 43,800 blocks per month *(before Granada protocol upgrade)*

We can construct the following table (click the links to see the calculations):

| Timeline  | Event                                     | Outstanding debt                                                                                                       | Available collateral | Fee                                                                                                                                      |
| --------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 0 months  | CDP Creation                              | 500 zUSD                                                                                                               | 1000 XTZ             | 0 zUSD                                                                                                                                   |
| 12 months | Example interest calculation              | [~510.10 zUSD](https://www.wolframalpha.com/input/?i=solve+500+*+%281+%2B+0.02+%2F+525600%29+%5E+%2843800+*+12%29)     | 1000 XTZ             | [~10.10 zUSD](https://www.wolframalpha.com/input/?i=solve+500+*+%281+%2B+0.02+%2F+525600%29+%5E+%2843800+*+12%29+-+500)                  |
| 12 months | CDP Collateral deposit, + 500 zUSD minted | [~1010.10 zUSD](https://www.wolframalpha.com/input/?i=solve+510.10+%2B+500)                                            | 2000 XTZ             | [~10.10 zUSD](https://www.wolframalpha.com/input/?i=solve+500+*+%281+%2B+0.02+%2F+525600%29+%5E+%2843800+*+12%29+-+500)                  |
| 20 months | Interest rate increase 2% -> 4%           | [~1023.65 zUSD](https://www.wolframalpha.com/input/?i=solve+1010.10+*+%281+%2B+0.02+%2F+525600%29+%5E+%2843800+*+8%29) | 2000 XTZ             | [~23.65 zUSD](https://www.wolframalpha.com/input/?i=solve+10.10+%2B+1010.10+*+%281+%2B+0.02+%2F+525600%29+%5E+%2843800+*+8%29+-+1010.10) |
| 24 months | Example interest calculation              | [~1037.39 zUSD](https://www.wolframalpha.com/input/?i=solve+1023.65+*+%281+%2B+0.04+%2F+525600%29+%5E+%2843800+*+4%29) | 2000 XTZ             | [~37.39 zUSD](https://www.wolframalpha.com/input/?i=solve+23.65+%2B+1023.65+*+%281+%2B+0.04+%2F+525600%29+%5E+%2843800+*+4%29+-+1023.65) |

<center><i>
Worked example (debt, collateral, fees)
</i></center>
<br />

_Note:_ If we assume instead in the worked example above that 1 XTZ = 1 USD then the CDP would become liquidatable after one block because the fee (although minuscule) for that block would take the [collateralization ratio below 200%](#Liquidations).

### Dynamic Savings Rate (DSR)
Mavryk offers an interest-paying **DSR savings account** for zUSD. There is no minimum period to keep zUSD in a savings account and no penalty for removing funds. Savers can use the DSR savings account to participate in the Mavryk ecosystem, just by owning zUSD (e.g. by purchasing zUSD on the open market), and without having to maintain a CDP (unless they want to).

Savers are rewarded for holding their zUSD in a DSR savings account in two ways:

- With zUSD interest funded by the on-chain treasury from lending income. 
- With vMVK funded by the on-chain treasury from [yield farms](#Yield-Farming).

<!-- mjg keeping this info for future reference
[mjg -> Alex: what determines the interest rate? what is the relationship between the stability fee and the interest rate on savings accounts? Presumably, they are linked, but how?]**[Alex -> mjg: At launch, we will be setting the interest rates as a means of jump-starting the DSR, and will be conducted more so like a yield farm (high yields) than savings account returns (traditionally lower yields). After launch, the DAO governance will set the interest rates. When enough income streams into the on-chain treasury, the DAO can (and should) migrate the yield returns from vMVK (as yield farms) to zUSD % from the treasury. When returns are in vMVK, they will be higher than from zUSD lending income. This is because the lending income flows into the treasury, which funds multiple features such as: buying back MVK for continued yield farms, for feeding Satellite rewards, and a portion for operations. I wouldn't advertise that zUSD rewards would be lower though.**

[mjg -> Alex: you give a list below of "rewards from stability fees" and "farming MVK". This is interesting but for me as a reader it just makes me want to know more. How would farming MVK influence my returns? Do I choose the mix of "stability fees"/"MVK farming" or is this mix a global property?]**[Alex -> mjg: I'm going to place "MVK Farming" first, and then "rewards from stability fees" second. Also, I will reword "shared rewards" as it's confusing. The "shared rewards" is income from lending that will be used to fund the DSR after the "MVK Farming" period ends (no set date). I detailed the vMVK>zUSD rewards in the answer above. The user wouldn't choose which rewards to get, it would initially start with vMVK, and the DAO eventually switches it to zUSD, with post-launch rates set by the DAO. In regards to vMVK influencing rewards, the initial rewards period will start with high rewards like a yield farm to incentivize platform use and reward early users. Eventually, as the DSR transitions into a traditional savings rate, the rewards will be lower, but I wouldn't elaborate on that. I will also write something for this to elaborate better.**
-->

The system can use the interest rate on the DSR savings accounts to stabilize the peg of zUSD to the U.S. dollar: 

* If 1 zUSD is worth less than 1 USD, then the system can increase the savings interest rate. This encourages savers to retain their zUSD and to reduce the circulating supply of zUSD by users acquiring zUSD and staking them in their savings account.
* If 1 zUSD is worth more than 1 USD, then the system can decrease the savings interest rate. This encourages savers to unlock their zUSD and put them into circulation, increasing the supply.


## Liquidations and Collateral Auctions
zUSD is backed by the collateral held in the CDPs, against which the zUSD was borrowed.
CDPs must remain sufficiently collateralized, even as the value of the underlying assets fluctuate. If a CDP becomes under-collateralized, then a safety net mechanism automatically kicks in: a _liquidation_ of the vault via a _collateral auction_:

### Liquidations
A CDP that falls below the required collateralization ratio (200%) is susceptible to automatic liquidation in a _collateral auction_, in which some (possibly all) of the collateral in the CDP is sold to the highest bidder to pay off the loan.

The borrower retains the zUSD that was loaned to them but loses ownership of some (and possibly all) of the collateral deposited in the CDP, which is sold off to repay the loan. In more detail, this happens via a reverse auction on the underlying collateral, as follows:

### Collateral Auctions
Under-collateralized CDPs are susceptible to liquidation via collateral auctions. Specifically, Mavryk uses [reverse auctions](https://en.wikipedia.org/wiki/Reverse_auction): bidders decide how much collateral is taken from the CDP, and the winner of the auction has to pay back the entire outstanding zUSD debt.

![](https://i.imgur.com/Lyiiajx.png)

A bidder has placed a valid bid when:

1. The bidder has locked up an amount of zUSD equal to the amount minted by the borrower of the original loan plus fees (i.e. they can repay the full outstanding loan amount), and 
2. If the bidder is not placing the first bid, then their bid is for at least 3% _less_ collateral from the CDP than the previous bid.
 
The auction is administered by smart contracts, ensuring fair and transparent access to all participants seeking a profitable return opportunity on their existing zUSD.

Collateral auctions achieve (at least) three things:

1. They incentivize borrowers to ensure that their CDPs remain properly collateralized, contributing to the stability of the system.
2. They create an opportunity for participants to obtain collateral from under-collateralized CDPs.
3. They create demand for zUSD since participants in auctions must obtain zUSD (through purchase or minting) in advance of the auction. Again, this should contribute to the stability of the system.

## Satellites, Governance, and the Decentralized Oracle 
### Satellites
**Satellites** are nodes that administer the Mavryk platform (similarly to _Bakers_ on Tezos).
They perform two functions as: 

1. **Curators of Governance Voting:**
    Satellites vote on 
    *  updates to business logic (e.g. disbursing funds from the [Treasury](#Treasury), adjusting the [Stability Fee](#Stability-Fee), or the [interest paid on DSR saving accounts](#Dynamic-Savings-Rate-DSR,)), and on 
    *  updates to the Mavryk protocol (e.g. adding a new [collateral asset class for CDPs](#Multi-Asset-Backed-Loans), or adding a new type of lending to the system). 

2. **Oracle Price Feed Providers:** 
  Satellites are nodes of Mavryk's decentralized oracle, which provides price data for the asset classes that can be used as collateral for [the CDPs](#Multi-Asset-Backed-Loans) (XTZ, wWBTC, wWETH, etc.).

A Satellite can act on its own behalf and can receive delegations on behalf of others.

To operate a Mavryk Satellite, a user needs to stake a security deposit in MVK as a bond, which the user can buy on the open market or earn by participating in the ecosystem (e.g. through yield farming, or MVK returned on [DSR savings](Dynamic-Savings-Rate-DSR)). 

The supported assets at launch will be XTZ, wWBTC (WBTC wrapped on Tezos via the WRAP Protocol), and wWETH (WETH wrapped on Tezos via WRAP Protocol).

Satellites are reimbursed for their services with zUSD and/or vMVK. The amount that Satellites are reimbursed and in which assets is set by a [Governance decision](#Governance) (to be applied transparently by smart contracts), but as a general rule:

* making governance decisions earns zUSD, and 
* providing Oracle pricing information earns vMVK 

**In other words: you get paid cash for contributing your governance power, and you get governance power from helping to determine the value of cash.**

<!-- [Alex -> mjg: Satellites are rewarded with both zUSD and vMVK. For governance votes, zUSD is distributed to participating Satellites from income from the on-chain treasury. Income from the treasury will be utilized to pay for governance, MVK buybacks, development, etc. Governance will set the amount to distribute. For the Oracles, vMVK is awarded to Satellites. Satellites may distribute funds back to delegates (if they have them) after taking a fee. vMVK is used to reward Satellite Oracle feeds, yield farms, DSR, etc in the system and not MVK, and is inherently locked in the system unless a user would unlock them.]
-->

Rewards are distributed to Satellites' delegates, just as Tezos Bakers share rewards with their delegates, minus delegation fees. 

### Governance
Stakeholders can participate in governance by either delegating their voting power to a Satellite or by operating a Satellite themselves. For this participation, users receive governance and oracle rewards.

There is no cost to [staking MVK to obtain vMVK](#MVK-and-vMVK-(Doorman-Module-Technicalities)) aside from the corresponding Tezos transaction fee, and stakeholders need not delegate the vMVK that they hold, except for the opportunity cost of _not_ participating in governance and so _not_ receiving these rewards (similarly for XTZ in a wallet that is not delegated; it just sits there).

Stakeholders are free to re-delegate to a different Satellite whenever desired, and with zero penalties. 

Governance votes, whether for the business logic or upgrades to the Mavryk ecosystem, are rewarded with a portion of the earned income from the on-chain [Treasury](#Treasury). This functions to reward stakeholders who participate in guiding the platform, similarly to how consultants are remunerated for their advisory services.

This form of representative liquid democracy incentivizes stakeholders to participate in governance (either directly, by setting up a Satellite, or indirectly by delegating to one), and so contributes to voter participation and the stability of the system.

### Satellite Delegations
Stakeholders can participate in governance without setting up their own Satellite: they can delegate their governance power (i.e. their vMVK) to an existing Satellite. The Satellite cannot transfer or spend the delegated vMVK tokens; it can only use the delegated tokens to vote. 

However, if the Satellite behaves maliciously then a portion of those vMVK might be confiscated by the system. This incentivizes stakeholders to delegate responsibly and perform due diligence when choosing a Satellite. This helps maintain the quality of the price feeds to the system overall.

Running a Satellite and delegating vMVK requires staking the tokens via the _Doorman Module_, as we discuss below.

### The Decentralized Oracle
The Mavryk system relies on Satellites to provide accurate and reliable pricing information for its collateral asset classes. Mavryk uses a similar consensus mechanism to Tezos, by weighing the data from Satellites using their respective stake in the system (similar to Proof of Stake).

Satellites are required to stake vMVK to participate in governance and thus are exposed to price volatility. Satellites are incentivized to provide correct data, since otherwise, their vMVK bond can lose value in the event of a malicious action or attack.

For example, suppose a malicious actor wants to skew the price of a Bitcoin collateral in the Mavryk system so that he can mint an excessive amount of zUSD. He purchases MVK, stakes it, and bonds it to set up a malicious Satellite that feeds false pricing data into the system. The system will then detect this attempt -- thanks to the distribution of Satellites -- and penalize the Satellite's vMVK collateral.


## MVK and vMVK (Doorman Module)
### What is MVK and how does it differ from vMVK?
MVK is the governance token of the Mavryk network.

It is a fully transferable token on the Tezos network. Broadly speaking, 1 MVK gives 1 vote on a [governance decision](#Governance) (Mavryk governance is like proof-of-stake: a user's voting power is proportional to the MVK held).

However, to use an MVK to _actually vote_, a user must first **stake** it via the **doorman module**. This Tezos smart contract burns MVK tokens and mints an equal amount of a *non-transferable* token called vMVK (_virtual_ MVK). vMVK represents MVK locked inside the Mavryk ecosystem.

MVK is a Tezos _FA_ token: it exists outside of the Mavryk system and can be freely traded. vMVK is also a Tezos _FA_ token, but it is used as an internal accounting token and has special permissions to interact with the Mavryk system (described [below](#benefits)), e.g. it is not transferable between users but can be used to vote on Governance decisions.

In other words: vMVK represents a direct right to vote in the governance of Mavryk, whereas MVK is a freely tradable Tezos token whose underlying collateral is precisely the ability to obtain that right. 

<!-- The system burns deposited MVK and mints vMVK to maintain stability, as we will discuss shortly.
-->

We explain the motivation for separating the tradable token MVK from the voting token vMVK below.

Finally, the voting power of vMVK can be deleagated to a satellite but never transfered. You always stay in full control of your vMVKs.

<!-- [mjg -> Alex: Aymeric mentioned that this allows delegating voting power without handing the token over. Is this discussed somewhere?]
 -->
 
### Obtaining vMVK
Users may obtain vMVK in several ways:

1. Staking their MVK to vMVK at a 1:1 ratio (1MVK = 1vMVK). 
2. Earning vMVK from participating in the incentive programs (e.g. yield farms or yield from the [DSR savings account](#Dynamic-Savings-Rate-DSR)). 
3. Delegating their vMVK to a Satellite, and earning a share of that Satellites vMVK rewards for [Governance](#Governance) or [Oracle price information](#The-Decentralized-Oracle).
4. Users may also be awarded vMVK as their share of the system's [vMVK exit fees as discussed below](#Converting-vMVK-back-to-MVK-exit-fees). 

vMVK holders enjoy benefits which include (non-exhaustive list): 

* **Governance Rewards:** Voting on governance decisions is incentivized with stability fees, and shared with delegates.
* **Oracle Rewards:** Providing price feed data will be incentivized via MVK rewards and shared with delegates.
* **Exit Fee Rewards:** Distributed to vMVK holders as an opportunity cost reward for staying locked.
* **Operating A Satellite:** Users need to provide a sufficient amount of vMVK bond. 

### Converting vMVK back to MVK (exit fees)
To redeem vMVK back to MVK, users need to pay an exit fee in vMVK tokens, which is automatically distributed to the remaining vMVK holders. This is conducted to offset the opportunity cost of remaining locked and to maintain platform stability.

The fee is dynamically computed based on the **MVK Loyalty Index (MLI)**, which is calculated as a percentage

<img src="/images/eq-mli.png" width="330" />

Example: if the vMVK<>MVK ratio is 9:1 then the MLI = 90%; if the vMVK<>MVK ratio is 6:4 then the MLI = 60%. When vMVK is minted, the total supply of vMVK increases, and the MLI increases. However, as users redeem vMVK for MVK, the MLI decreases. 

**The exit fee is structured so that a higher MLI means a lower exit fee rate**, by the following equation:

<img src="/images/eq-mli-fee.png" width="150" />

![](https://ipfs.infura.io/ipfs/QmR9a1UAJqjscrZYtrgFehFPKmUqkjrhfC6b6UzHNHCJj4)

The curve is designed so that users are incentivised to lock their MVK. If the MLI goes below 20%, the fee goes up exponentialy in order to help maintain an healthy ratio of locked MVK and securise the Mavryk governance and ecosystem.

Rule of thumb: if vMVK is scarce then converting vMVK into MVK is relatively expensive, and if vMVK is plentiful then converting vMVK into MVK is relatively cheap.

The exit fee rate and algorithm parameters are governable, and like any governance rule, these can be updated by community vote. 

## Governance & Treasury
Blockchain technology offers the revolutionary capability to build so-called _trustless_ applications. Trust still matters in trustless systems, but the difference is that it is _decentralized_. Historically, a powerful central authority was required for stability, now trust can be distributed with decentralized smart contracts amongst multiple actors, in new, innovative, and unprecedented ways. 

In particular, the approach taken by Mavryk is to digitally allocate proportional amounts of responsibility to actors (as discussed above). Individual actors can fail without compromising the platform's overall integrity and without compromising trust -- whereas in an 'old-fashioned' centralized system, failure of the one central authority can be catastrophic.

### Decentralization
Mavryk is not a project which promises to transition from centralized to decentralized controls. As we believe that **governance is key**, Mavryk provides concrete mechanisms to launch as a DAO (Decentralized Autonomous Organization), using a model based on the by-now well-tested Tezos governance system.

Mavryk will have built-in on-chain governance from the start, treating it as a cornerstone of the design rather than an afterthought. An upgrade proposal can be submitted on-chain as a smart contract and voted on by Satellites, and in the case of a “yay”, the transaction gets executed automatically. The ecosystem does _not_ rely on central actors to carry out decisions.

This model of decentralized governance has successfully powered the Tezos blockchain since its inception in 2018, and Tezos is now on its eighth protocol upgrade and working flawlessly.

Below are examples of governance decisions:

* General upgrades to the protocol
  * New multi-asset vaults
  * Providing incentives to move to newer versions of vaults
  * Different auction types
* Minting of MVK to fund
  * Farms
  * Satellites
  * Mavryk Council
* Change of parameters
  * Collateral auction rules
    * Length of an auction
    * 3% "step-rule" for bids
  * Collateralization ratio of CDPs
  * Supported assets as collateral
  * MLI exit fees

### Voting power
Initially, most voting power will lie in the hands of the core team and private contributors.[^(6)] 
The system is designed to incentivize participation so that with time the community gains a larger percentage of the circulating token supply.
The community will grow beyond the initial core contributors as other actors become active to participate to earn rewards. The overall governance power will pass smoothly to the broader community. 

Specifically, this is achieved by the rate at which new governance tokens are released to the ecosystem through farms and other incentive programs.

[^(6)]: The section [tokenomics](#tokenomics) provides an overview of token distribution and circulating supply.

The token genesis is conducted by the core team and tokens are minted according to the [initial supply plan](#tokenomics). Stakeholder tokens from private contributions and the team are controlled by vesting contracts that mint and release them according to a monthly schedule.
For the first 6 months, vested team and advisory tokens are non-transferable but may be used for voting.[^(7)] 

[^(7)]: Team tokens are not transferable for 6 months after the token sale but may be used for voting on governance proposals. After 6 months, a portion of the tokens will become transferable on a monthly basis.

### Voting with Satellites (electoral delegates)
Until the Mavryk platform is launched on the mainnet, voting happens directly by vMVK holders. After the launch, Satellites will form the backbone of the system and will accept vMVK delegations by stakeholders and vote on their behalf. 

_This is similar to the approach of Bakers on Tezos._

Thanks to this representative democracy model, stakeholders of vMVK are not required to regularly cast votes, and the level of a Satellite’s engagement in governance influences the choice of delegates. 

### Treasury
The **Treasury** is a Tezos smart contract that will hold 

* the assets contributed in the token launch, and 
* all subsequent revenue (e.g. stability fees and liquidation fees).
 
The Treasury will also hold income from future Mavryk products. The Treasury will hold various type of assets such as wrapped assets, liquidity pool tokens, and zUSD. The Treasury will also mint vMVK and distribute it accordingly to incentive programs (farms, satellites, etc), or for funding entities.

The treasury will be governed by the community (via Satellites), not by individuals or entities. Furthermore, **Treasury assets will not be used to vote on proposals.** Whenever a value is moved from the Treasury, a public vote must occur and be recorded on-chain.
 
## Mavryk Council
The Mavryk Council is operated by members of a Gibraltar-based legal entity that performs operations to develop the Mavryk Finance ecosystem. Some responsibilities include maintaining contracts with developers, marketers, and lawyers, with the ability to pay them in fiat. The Council also serves to maintain interactions that require off-chain capabilities. 

The Council's inception happens after the initial MVK distribution. The Council is a separate entity from the Treasury, and receives its mandate from the community: the Council can receive funds (e.g. MVK) from the Treasury, following on-chain Governance votes by the community.

MVK for Operations will be sent to the 3 of 5 multi-sig held by the board members of the Council and vested over 5 years. The Council board will be charged with disbursing assets to expand the Mavryk ecosystem and develop new products and features. 

The multi-sig is designed to limit the powers of any individual, and eliminate the possibility of a loss of funds due to any single point of failure.

## Bootstrapping Liquidity (Balancer Style AMM)
A wide distribution of the native Mavryk token (MVK) will contribute to the health and success of the platform. Therefore the Mavryk Council will allocate 2% of the total MVK token supply to be sold in a public sale after the token genesis event. Contributions from the token sale will be matched with 2% of the total MVK token supply and utilized as liquidity for an MVK/XTZ token pairing on a decentralized exchange. The subsequent LP tokens will be controlled by the on-chain Treasury.  

The public sale will be held using a variation of an automated market maker (AMM), designed to facilitate a fair sale and price discovery. Participants will be able to engage with the AMM using three assets: XTZ, wWBTC[^(8)], wWETH[^(9)] at a pre-fixed price (at the launch of the pool). Once the sale begins, a Balancer-style smart contract will run for three days, which will balance the price of the offered MVK relative to contributor demand. 

[^(8)]: wWBTC is not a typo: WBTC stands for _Wrapped Bitcoin_. This is a token wrapping Bitcoin to represent it on the Ethereum network. wWBTC is a Tezos token wrapping the WBTC Ethereum token to represent WBTC on the Tezos network. Thus, wWBTC is simply wrapped Wrapped Bitcoin, consisting of a representation of Bitcoin. What could be simpler?

[^(9)]: wWETH is also not a typo: WETH is [ETH wrapped into an ERC-20 compliant smart contract](https://weth.io) on the Ethereum network, for ERC-20 compatibility. It is then wrapped into a Tezos token called wWETH. There is, as always, a perfectly reasonable explanation.

When the Mavryk CDP system launches, those three assets will be accepted as collateral. We want to encourage users to wrap WBTC & WETH onto Tezos (into wWBTC & wWETH) for the bootstrapping event, so Mavryk will compensate users who make contributions in those wrapped assets in the initial sale, by selling them MVK at a discount that reflects their wrapping costs.

The entire liquidity bootstrapping event will be held within a suite of smart contracts that are fully decentralized and trustless. This means that the initial sale participants can be sure of how their contributions will be used later.

<!-- During the liquidity bootstrapping event, the AMM will automatically take a 0.3% fee of all the contributions, and distribute them to vMVK holders. This distribution will reward those who opted to retain their vMVK rather than selling into the newly formed liquidity pool after the initial token sale. -->

The Mavryk Council will also contribute $250k U.S. Dollars worth of liquidity from private funding when the token sale launches, outside of the liquidity bootstrapping contributions.

## Yield Farming
The Mavryk platform produces several tradable tokens in its ecosystem, such as the zUSD stablecoin and its own native MVK governance token. As part of the liquidity bootstrapping process discussed above, a liquidity pool of MVK/XTZ will be launched with initial liquidity provided by the bootstrapping contributions from the public.

Initially, the liquidity should be sufficient to enable low-slippage trading at reasonable volumes. However, to further incentivize providing liquidity for the MVK/XTZ pair, a series of yield/liquidity farms will be made available.

Liquidity providers will be able to stake their LP tokens (programmable shares of a liquidity pool) within yield farms to receive vMVK as an incentive. The amount of vMVK rewards depends on how long the LP tokens are staked. By default, Mavryk farms are spawned for three months. Afterward, a governance vote will be required to either rehydrate existing farms and restart their lifecycle or spawn new farms. 

When the Mavryk platform goes live, yield farms for the following liquidity pools will be available:

MVK/XTZ
MVK/zUSD
zUSD/XTZ

## Tokenomics
**MVK Max Supply (100%): 1,000,000,000 tokens ($10^9$ MVK tokens).**

* 40% Incentives
  * 38% Yield Farming
  * 2% Initial Liquidity Pool
* 24% Team & Advisors
  * 19% Founders and dev team
  * 5% Advisors
* 18% Ecosystem
  * 8% DAO Treasury (on-chain community vote for use of funds)
  * 10% Council Treasury (vested over 5 years)
* 18% Contributors
  * 16% Private Contributors
  * 2% Public Liquidity Sale

![](https://ipfs.infura.io/ipfs/QmTufZ8XcPygZpCahCwGCnMZDVpQ5GC6ojaURhsbKYiWPJ)

The team and advisors tokens have a 6 months cliff with a 24 months vesting schedule at genesis. During the first 6 months, the team and advisors tokens are not transferable but can be used for voting. Private contributor tokens follow a 16-24 month vesting schedule from genesis.


### Revenue Model
Revenue is generated through stability & liquidation fees. The stability fee is paid by the borrower when closing a debt position (paying back their loan). This fee is proportionate to the amount of the loan relative to how long the loan was open. A liquidation fee occurs when an at-risk vault is liquidated and is on top of the stability fee. The liquidation fee is 10%.[^(10)]

[^(10)]: This fee exists to close a loophole where an owner liquidates himself and bids for the minimum collateral.
  
**The stability and liquidation fees are both governable by stakeholders and can be updated by community vote.**

The revenue is automatically deposited within the Treasury, where a reserve of zUSD is put aside to hedge against extreme market drops which might push at-risk CDPs into an under-collateralized ratio so low that it would impossible to liquidate (as no rational investor would pay more money than what the collateral in the vault is worth). The reserve provides zUSD liquidity to be injected in case of such a event and to maintain overall system stability.

Once Mavryk is adopted and generating revenue, it is up to community Governance to vote to disburse the zUSD revenue generated from the Treasury to fund further development via the Mavryk Council, to incentivize Governance participation, to perform a buyback of MVK on the open market to incentivize Satellite price feeds, and to distribute grants. 

### Token Flow
The following diagram shows the flow of value (tokens) between various modules of the system (smart contracts). Those smart contract modules are the 

* [doorman module](#mvk-and-vmvk-doorman-module), 
* [external exchange module](#bootstrapping-liquidity-balancer-style-amm),
* [yield-farm module](#yield-farming),
* [loan module](#stability-fee), 
* [governance module](#voting-with-satellites-electoral-delegates), 
* [price feed module / satellites](#price-feed), 
* [DSR savings module](#dynamic-savings-account-rate), and the 
* [liquidation auction module](#collateral-auctions).

We outline their interactions in the following overview diagram:

![](https://ipfs.infura.io/ipfs/QmS8oJUdVBxQZ7FN5Ed1ikFvdZ8DLezeSE3PTSGimncUW2)

<center><i>
Outline of Mavryk system modules and their interactions
</i></center>
