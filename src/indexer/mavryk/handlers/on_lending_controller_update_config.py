from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.types.lending_controller.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configAdminLiquidationFee, UpdateConfigActionItem1 as configCollateralRatio, UpdateConfigActionItem2 as configInterestTreasuryShare, UpdateConfigActionItem3 as configLiquidationFeePercent, UpdateConfigActionItem4 as configLiquidationRatio, UpdateConfigActionItem5 as configMinLoanFeeTreasuryShare, UpdateConfigActionItem6 as configMinimumLoanFeePercent
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage
import mavryk.models as models

async def on_lending_controller_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, LendingControllerStorage],
) -> None:

    try:
        # Get operation values
        lending_controller_address  = update_config.data.target_address
        updated_value               = int(update_config.parameter.updateConfigNewValue)
        update_config_action        = type(update_config.parameter.updateConfigAction)
        timestamp                   = update_config.data.timestamp
    
        # Update contract
        lending_controller = await models.LendingController.get(
            network         = ctx.datasource.network,
            address         = lending_controller_address,
            mock_time       = False
        )
        lending_controller.last_updated_at    = timestamp
        if update_config_action == configAdminLiquidationFee:
            lending_controller.admin_liquidation_fee_pct    = updated_value
        elif update_config_action == configCollateralRatio:
            lending_controller.collateral_ratio             = updated_value
        elif update_config_action == configInterestTreasuryShare:
            lending_controller.interest_treasury_share      = updated_value
        elif update_config_action == configLiquidationFeePercent:
            lending_controller.liquidation_fee_pct          = updated_value
        elif update_config_action == configLiquidationRatio:
            lending_controller.liquidation_ratio            = updated_value
        elif update_config_action == configMinLoanFeeTreasuryShare:
            lending_controller.minimum_loan_treasury_share  = updated_value
        elif update_config_action == configMinimumLoanFeePercent:
            lending_controller.minimum_loan_fee_pct         = updated_value
    
        
        await lending_controller.save()

    except BaseException as e:
         await save_error_report(e)

