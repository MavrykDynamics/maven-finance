from mavryk.utils.error_reporting import save_error_report

from mavryk.types.lending_controller_mock_time.storage import LendingControllerMockTimeStorage, TokenTypeItem3 as fa12, TokenTypeItem4 as fa2, TokenTypeItem5 as tez
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.lending_controller_mock_time.parameter.add_liquidity import AddLiquidityParameter
import mavryk.models as models

async def on_lending_controller_mock_time_add_liquidity(
    ctx: HandlerContext,
    add_liquidity: Transaction[AddLiquidityParameter, LendingControllerMockTimeStorage],
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
        loan_token_m_tokens_total               = float(loan_token_storage.mTokensTotal)
        loan_token_total_remaining              = float(loan_token_storage.totalRemaining)
        loan_token_last_updated_block_level     = int(loan_token_storage.lastUpdatedBlockLevel)
        loan_token_borrow_index                 = float(loan_token_storage.borrowIndex)
        loan_token_utilisation_rate             = float(loan_token_storage.utilisationRate)
        loan_token_current_interest_rate        = float(loan_token_storage.currentInterestRate)
        loan_token_address                      = None
        
        # Loan Token attributes
        if type(loan_token_type_storage) == fa12:
            loan_token_address  = loan_token_type_storage.fa12
        elif type(loan_token_type_storage) == fa2:
            loan_token_address  = loan_token_type_storage.fa2.tokenContractAddress
        elif type(loan_token_type_storage) == tez:
            loan_token_address  = "XTZ"

        token                                   = None
        if loan_token_address:
            # Get the related token
            token, _                                = await models.Token.get_or_create(
                token_address       = loan_token_address,
                network             = ctx.datasource.network
            )
            await token.save()
    
        # Create / Update record
        lending_controller                      = await models.LendingController.get(
            address     = lending_controller_address,
            mock_time   = True
        )
        lending_controller_loan_token           = await models.LendingControllerLoanToken.filter(
            lending_controller  = lending_controller,
            loan_token          = token,
            loan_token_name     = loan_token_name
        ).first()
        lending_controller_loan_token.token_pool_total          = loan_token_token_pool_total
        lending_controller_loan_token.m_tokens_total            = loan_token_m_tokens_total
        lending_controller_loan_token.total_borrowed            = loan_token_total_borrowed
        lending_controller_loan_token.total_remaining           = loan_token_total_remaining
        lending_controller_loan_token.last_updated_block_level  = loan_token_last_updated_block_level
        lending_controller_loan_token.borrow_index              = loan_token_borrow_index
        lending_controller_loan_token.utilisation_rate          = loan_token_utilisation_rate
        lending_controller_loan_token.current_interest_rate     = loan_token_current_interest_rate
        await lending_controller_loan_token.save()
    
        # Save history data
        sender                                  = await models.mavryk_user_cache.get(address=sender_address)
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

