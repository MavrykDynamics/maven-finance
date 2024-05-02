from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.types.lending_controller.tezos_parameters.update_config import UpdateConfigParameter
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.lending_controller.tezos_storage import LendingControllerStorage
import maven.models as models

async def update_config(
    ctx: HandlerContext,
    update_config: TzktTransaction[UpdateConfigParameter, LendingControllerStorage],
) -> None:

    try:
        # Get operation values
        lending_controller_address  = update_config.data.target_address
        timestamp                   = update_config.data.timestamp
    
        # Update contract
        await models.LendingController.filter(
            network         = ctx.datasource.name.replace('mvkt_',''),
            address         = lending_controller_address
        ).update(
            last_updated_at                 = timestamp,
            collateral_ratio                = update_config.storage.config.collateralRatio,
            liquidation_ratio               = update_config.storage.config.liquidationRatio,
            liquidation_fee_pct             = update_config.storage.config.liquidationFeePercent,
            admin_liquidation_fee_pct       = update_config.storage.config.adminLiquidationFeePercent,
            minimum_loan_fee_pct            = update_config.storage.config.minimumLoanFeePercent,
            minimum_loan_treasury_share     = update_config.storage.config.minimumLoanFeeTreasuryShare,
            interest_treasury_share         = update_config.storage.config.interestTreasuryShare,
            last_completed_data_max_delay   = update_config.storage.config.lastCompletedDataMaxDelay,
            decimals                        = update_config.storage.config.decimals,
            interest_rate_decimals          = update_config.storage.config.interestRateDecimals,
            max_decimals_for_calculation    = update_config.storage.config.maxDecimalsForCalculation,
            max_vault_liquidation_pct       = update_config.storage.config.maxVaultLiquidationPercent,
            liquidation_delay_in_minutes    = update_config.storage.config.liquidationDelayInMins,
            liquidation_max_duration        = update_config.storage.config.liquidationMaxDuration,
        )

    except BaseException as e:
        await save_error_report(e)

