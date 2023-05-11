from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_token_metadata
from mavryk.types.lending_controller.parameter.set_collateral_token import SetCollateralTokenParameter, ActionItem as createCollateralToken
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_lending_controller_set_collateral_token(
    ctx: HandlerContext,
    set_collateral_token: Transaction[SetCollateralTokenParameter, LendingControllerStorage],
) -> None:

    try:
        # Get operation info
        action_class                    = type(set_collateral_token.parameter.action)
        if action_class == createCollateralToken:
            collateral_token_name       = set_collateral_token.parameter.action.createCollateralToken.tokenName
        else:
            collateral_token_name       = set_collateral_token.parameter.action.updateCollateralToken.tokenName
    
        lending_controller_address      = set_collateral_token.data.target_address
        if collateral_token_name in set_collateral_token.storage.collateralTokenLedger:
            collateral_token_storage                    = set_collateral_token.storage.collateralTokenLedger[collateral_token_name]
            collateral_token_oracle_address             = collateral_token_storage.oracleAddress
            collateral_token_address                    = collateral_token_storage.tokenContractAddress
            collateral_token_protected                  = collateral_token_storage.protected
            collateral_token_scaled                     = collateral_token_storage.isScaledToken
            collateral_token_staked                     = collateral_token_storage.isStakedToken
            collateral_token_staking_contract_address   = collateral_token_storage.stakingContractAddress
            collateral_token_total_deposited            = float(collateral_token_storage.totalDeposited)
            collateral_token_paused                     = collateral_token_storage.isPaused
            collateral_token_id                         = 0
            collateral_token_standard                   = ""
            collateral_token_max_deposit_amount         = collateral_token_storage.maxDepositAmount
            if collateral_token_storage.maxDepositAmount:
                collateral_token_max_deposit_amount         = float(collateral_token_max_deposit_amount)
    
            # Persist collateral Token Metadata
            await persist_token_metadata(
                ctx=ctx,
                token_address=collateral_token_address,
                token_id=str(collateral_token_id)
            )

            # Get the related token
            token, _                                    = await models.Token.get_or_create(
                token_address       = collateral_token_address,
                token_id            = collateral_token_id,
                network             = ctx.datasource.network
            )
            await token.save()
    
            # Save token contract token standard
            if collateral_token_address[0:3] == 'KT1' and len(collateral_token_address) == 36:
                contract_summary    = await ctx.datasource.get_contract_summary(address = collateral_token_address)
    
                if contract_summary:
                    if 'tzips' in contract_summary:
                        tzips   = contract_summary['tzips']
                        if 'fa2' in tzips:
                            collateral_token_standard       = 'fa2'
                        else:
                            if 'fa12' in tzips:
                                collateral_token_standard   = 'fa12'
    
            if collateral_token_name == 'XTZ' or collateral_token_name == 'tez':
                collateral_token_standard = 'tez'
    
            # Create / Update record
            lending_controller          = await models.LendingController.get(
                address         = lending_controller_address,
                mock_time       = False
            )
            oracle                      = await models.mavryk_user_cache.get(address=collateral_token_oracle_address)
            lending_controller_collateral_token, _  = await models.LendingControllerCollateralToken.get_or_create(
                lending_controller  = lending_controller,
                collateral_token    = token,
                oracle              = oracle
            )
            lending_controller_collateral_token.protected                                   = collateral_token_protected
            lending_controller_collateral_token.is_scaled_token                             = collateral_token_scaled
            lending_controller_collateral_token.token_name                                  = collateral_token_name
            lending_controller_collateral_token.token_contract_standard                     = collateral_token_standard
            lending_controller_collateral_token.is_staked_token                             = collateral_token_staked
            lending_controller_collateral_token.staking_contract_address                    = collateral_token_staking_contract_address
            lending_controller_collateral_token.total_deposited                             = collateral_token_total_deposited
            lending_controller_collateral_token.max_deposit_amount                          = collateral_token_max_deposit_amount
            lending_controller_collateral_token.paused                                      = collateral_token_paused
            await lending_controller_collateral_token.save()

    except BaseException as e:
         await save_error_report(e)

