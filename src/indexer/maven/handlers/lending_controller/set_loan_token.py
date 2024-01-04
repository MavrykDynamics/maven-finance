from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.utils.contracts import get_contract_token_metadata, get_token_standard
from maven.types.lending_controller.tezos_parameters.set_loan_token import SetLoanTokenParameter, ActionItem as createLoanToken
from maven.types.lending_controller.tezos_storage import LendingControllerStorage, TokenTypeItem3 as fa12, TokenTypeItem4 as fa2, TokenTypeItem5 as tez
import maven.models as models

async def set_loan_token(
    ctx: HandlerContext,
    set_loan_token: TzktTransaction[SetLoanTokenParameter, LendingControllerStorage],
) -> None:

    try:
        # Get operation info
        action_class                                        = type(set_loan_token.parameter.action)
        if action_class == createLoanToken:
            loan_token_name                                 = set_loan_token.parameter.action.createLoanToken.tokenName
        else:
            loan_token_name                                 = set_loan_token.parameter.action.updateLoanToken.tokenName
    
        lending_controller_address                          = set_loan_token.data.target_address
        loan_token_storage                                  = set_loan_token.storage.loanTokenLedger[loan_token_name]
        loan_token_oracle_address                           = loan_token_storage.oracleAddress
        loan_token_m_tokens_total                           = float(loan_token_storage.rawMTokensTotalSupply)
        loan_token_m_token_address                          = loan_token_storage.mTokenAddress
        loan_token_reserve_ratio                            = int(loan_token_storage.reserveRatio)
        loan_token_token_pool_total                         = float(loan_token_storage.tokenPoolTotal)
        loan_token_total_borrowed                           = float(loan_token_storage.totalBorrowed)
        loan_token_total_remaining                          = float(loan_token_storage.totalRemaining)
        loan_token_utilisation_rate                         = float(loan_token_storage.utilisationRate)
        loan_token_optimal_utilisation_rate                 = float(loan_token_storage.optimalUtilisationRate)
        loan_token_base_interest_rate                       = float(loan_token_storage.baseInterestRate)
        loan_token_max_interest_rate                        = float(loan_token_storage.maxInterestRate)
        loan_token_interest_rate_below_optimal_utilisation  = float(loan_token_storage.interestRateBelowOptimalUtilisation)
        loan_token_interest_rate_above_optimal_utilisation  = float(loan_token_storage.interestRateAboveOptimalUtilisation)
        loan_token_current_interest_rate                    = float(loan_token_storage.currentInterestRate)
        loan_token_last_updated_block_level                 = int(loan_token_storage.lastUpdatedBlockLevel)
        loan_token_token_reward_index                       = float(loan_token_storage.tokenRewardIndex)
        loan_token_borrow_index                             = float(loan_token_storage.borrowIndex)
        loan_token_min_repayment_amount                     = float(loan_token_storage.minRepaymentAmount)
        loan_token_paused                                   = loan_token_storage.isPaused
        loan_token_type_storage                             = loan_token_storage.tokenType
        loan_token_address                                  = ""
        loan_token_id                                       = 0
    
        # Loan Token attributes
        if type(loan_token_type_storage) == fa12:
            loan_token_address              = loan_token_type_storage.fa12
        elif type(loan_token_type_storage) == fa2:
            loan_token_address              = loan_token_type_storage.fa2.tokenContractAddress
            loan_token_id                   = loan_token_type_storage.fa2.tokenId
        elif type(loan_token_type_storage) == tez:
            loan_token_address              = "mv2ZZZZZZZZZZZZZZZZZZZZZZZZZZZDXMF2d"
    
        token_contract_metadata = None
        # Persist loan Token Metadata
        if loan_token_address != "mv2ZZZZZZZZZZZZZZZZZZZZZZZZZZZDXMF2d":
            token_contract_metadata = await get_contract_token_metadata(
                ctx=ctx,
                token_address=loan_token_address,
                token_id=str(loan_token_id)
            )
        else:
            token_contract_metadata = {
                "name": "Tezos",
                "symbol": "XTZ",
                "decimals": "6",
                "icon": "https://infura-ipfs.io/ipfs/QmdiScFymWzZ5qgVd47QN7RA2nrDDRZ1vTqDrC4LnJSqTW",
                "thumbnailUri": "https://infura-ipfs.io/ipfs/QmdiScFymWzZ5qgVd47QN7RA2nrDDRZ1vTqDrC4LnJSqTW",
            }
    
        # Create / Update record
        lending_controller                  = await models.LendingController.get(
            network         = ctx.datasource.name.replace('tzkt_',''),
            address         = lending_controller_address,
        )
        oracle                              = await models.maven_user_cache.get(network=ctx.datasource.name.replace('tzkt_',''), address=loan_token_oracle_address)
        token                               = await models.Token.get(
            network         = ctx.datasource.name.replace('tzkt_',''),
            token_address   = loan_token_m_token_address,
            token_id        = 0
        )
        m_token, _                          = await models.MToken.get_or_create(
            network         = ctx.datasource.name.replace('tzkt_',''),
            address         = loan_token_m_token_address,
            token           = token
        )

        # Get the token standard
        standard = await get_token_standard(
            ctx,
            loan_token_address
        )

        # Get the related token
        token, _                            = await models.Token.get_or_create(
            token_address       = loan_token_address,
            token_id            = loan_token_id,
            network             = ctx.datasource.name.replace('tzkt_','')
        )
        token.metadata          = token_contract_metadata
        token.token_standard    = standard
        await token.save()

        await m_token.save()
        lending_controller_loan_token, _    = await models.LendingControllerLoanToken.get_or_create(
            lending_controller  = lending_controller,
            loan_token_name     = loan_token_name,
            token               = token,
            m_token             = m_token,
            oracle              = oracle
        )
        m_token                                                                 = await lending_controller_loan_token.m_token
        if loan_token_token_reward_index > m_token.token_reward_index:
            m_token.token_reward_index                                          = loan_token_token_reward_index
            await m_token.save()
        lending_controller_loan_token.raw_m_tokens_total_supply      = loan_token_m_tokens_total
        lending_controller_loan_token.reserve_ratio                             = loan_token_reserve_ratio
        lending_controller_loan_token.token_pool_total                          = loan_token_token_pool_total
        lending_controller_loan_token.total_borrowed                            = loan_token_total_borrowed
        lending_controller_loan_token.total_remaining                           = loan_token_total_remaining
        lending_controller_loan_token.utilisation_rate                          = loan_token_utilisation_rate
        lending_controller_loan_token.optimal_utilisation_rate                  = loan_token_optimal_utilisation_rate
        lending_controller_loan_token.base_interest_rate                        = loan_token_base_interest_rate
        lending_controller_loan_token.max_interest_rate                         = loan_token_max_interest_rate
        lending_controller_loan_token.interest_rate_below_optimal_utilisation   = loan_token_interest_rate_below_optimal_utilisation
        lending_controller_loan_token.interest_rate_above_optimal_utilisation   = loan_token_interest_rate_above_optimal_utilisation
        lending_controller_loan_token.current_interest_rate                     = loan_token_current_interest_rate
        lending_controller_loan_token.last_updated_block_level                  = loan_token_last_updated_block_level
        lending_controller_loan_token.token_reward_index                        = m_token.token_reward_index
        lending_controller_loan_token.borrow_index                              = loan_token_borrow_index
        lending_controller_loan_token.min_repayment_amount                      = loan_token_min_repayment_amount
        lending_controller_loan_token.paused                                    = loan_token_paused
        await lending_controller_loan_token.save()

    except BaseException as e:
        await save_error_report(e)

