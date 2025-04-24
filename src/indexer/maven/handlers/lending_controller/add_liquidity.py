from maven.utils.contracts import get_token_standard
from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.types.lending_controller.tezos_parameters.add_liquidity import AddLiquidityParameter
from dipdup.models.tezos import TezosTransaction
from maven.types.lending_controller.tezos_storage import LendingControllerStorage, TokenType3 as fa12, TokenType4 as fa2, TokenType5 as mav
from maven import models as models

async def add_liquidity(
    ctx: HandlerContext,
    add_liquidity: TezosTransaction[AddLiquidityParameter, LendingControllerStorage],
) -> None:

    try:
        # Get operation info
        lending_controller_address              = add_liquidity.data.target_address
        timestamp                               = add_liquidity.data.timestamp
        level                                   = add_liquidity.data.level
        operation_hash                          = add_liquidity.data.hash
        sender_address                          = add_liquidity.data.sender_address
        loan_token_name                         = add_liquidity.parameter.loanTokenName
        loan_token_amount                       = float(add_liquidity.parameter.amount)
        loan_token_storage                      = add_liquidity.storage.loanTokenLedger[loan_token_name]
        loan_token_type_storage                 = loan_token_storage.tokenType
        loan_token_token_pool_total             = float(loan_token_storage.tokenPoolTotal)
        loan_token_total_borrowed               = float(loan_token_storage.totalBorrowed)
        loan_token_m_tokens_total               = float(loan_token_storage.rawMTokensTotalSupply)
        loan_token_total_remaining              = float(loan_token_storage.totalRemaining)
        loan_token_last_updated_block_level     = int(loan_token_storage.lastUpdatedBlockLevel)
        loan_token_token_reward_index           = float(loan_token_storage.tokenRewardIndex)
        loan_token_borrow_index                 = float(loan_token_storage.borrowIndex)
        loan_token_utilisation_rate             = float(loan_token_storage.utilisationRate)
        loan_token_current_interest_rate        = float(loan_token_storage.currentInterestRate)
        loan_token_address                      = None
        loan_token_id                           = 0

        # Loan Token attributes
        if type(loan_token_type_storage) == fa12:
            loan_token_address  = loan_token_type_storage.fa12
        elif type(loan_token_type_storage) == fa2:
            loan_token_address  = loan_token_type_storage.fa2.tokenContractAddress
            loan_token_id       = int(loan_token_type_storage.fa2.tokenId)
        elif type(loan_token_type_storage) == mav:
            loan_token_address  = "mv2ZZZZZZZZZZZZZZZZZZZZZZZZZZZDXMF2d"

        token                                   = None
        if loan_token_address:

            # Get the token standard
            standard = await get_token_standard(
                ctx,
                loan_token_address
            )

            # Get the related token
            token, _                                = await models.Token.get_or_create(
                network             = 'atlasnet',
                token_address       = loan_token_address,
                token_id            = loan_token_id
            )
            token.token_standard    = standard
            await token.save()
    
        # Create / Update record
        lending_controller                      = await models.LendingController.get(
            network     = 'atlasnet',
            address     = lending_controller_address,
        )
        lending_controller_loan_token           = await models.LendingControllerLoanToken.get(
            lending_controller  = lending_controller,
            token               = token,
            loan_token_name     = loan_token_name
        )
        m_token                                                 = await lending_controller_loan_token.m_token
        if loan_token_token_reward_index > m_token.token_reward_index:
            m_token.token_reward_index                          = loan_token_token_reward_index
            await m_token.save()
        lending_controller_loan_token.token_pool_total          = loan_token_token_pool_total
        lending_controller_loan_token.raw_m_tokens_total_supply = loan_token_m_tokens_total
        lending_controller_loan_token.total_borrowed            = loan_token_total_borrowed
        lending_controller_loan_token.total_remaining           = loan_token_total_remaining
        lending_controller_loan_token.last_updated_block_level  = loan_token_last_updated_block_level
        lending_controller_loan_token.token_reward_index        = m_token.token_reward_index
        lending_controller_loan_token.borrow_index              = loan_token_borrow_index
        lending_controller_loan_token.utilisation_rate          = loan_token_utilisation_rate
        lending_controller_loan_token.current_interest_rate     = loan_token_current_interest_rate
        await lending_controller_loan_token.save()
    
        # Save history data
        sender                                  = await models.get_user(network='atlasnet', address=sender_address)
        history_data                            = models.LendingControllerHistoryData(
            lending_controller  = lending_controller,
            loan_token          = lending_controller_loan_token,
            sender              = sender,
            operation_hash      = operation_hash,
            timestamp           = timestamp,
            level               = level,
            type                = models.LendingControllerOperationType.ADD_LIQUIDITY,
            amount              = loan_token_amount
        )
        await history_data.save()

    except BaseException as e:
        await save_error_report(e)

