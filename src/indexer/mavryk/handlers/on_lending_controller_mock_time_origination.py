from mavryk.utils.error_reporting import save_error_report
from mavryk.utils.persisters import persist_contract_metadata
from mavryk.types.lending_controller_mock_time.storage import LendingControllerMockTimeStorage
from dipdup.context import HandlerContext
from dipdup.models import Origination
import mavryk.models as models

async def on_lending_controller_mock_time_origination(
    ctx: HandlerContext,
    lending_controller_mock_time_origination: Origination[LendingControllerMockTimeStorage],
) -> None:

    try:    
        # Get operation info
        lending_controller_address              = lending_controller_mock_time_origination.data.originated_contract_address
        timestamp                               = lending_controller_mock_time_origination.data.timestamp
        governance_address                      = lending_controller_mock_time_origination.storage.governanceAddress
        admin                                   = lending_controller_mock_time_origination.storage.admin
        collateral_ratio                        = int(lending_controller_mock_time_origination.storage.config.collateralRatio)
        liquidation_ratio                       = int(lending_controller_mock_time_origination.storage.config.liquidationRatio)
        liquidation_fee_pct                     = int(lending_controller_mock_time_origination.storage.config.liquidationFeePercent)
        admin_liquidation_fee_pct               = int(lending_controller_mock_time_origination.storage.config.adminLiquidationFeePercent)
        minimum_loan_fee_pct                    = int(lending_controller_mock_time_origination.storage.config.minimumLoanFeePercent)
        minimum_loan_treasury_share             = int(lending_controller_mock_time_origination.storage.config.minimumLoanFeeTreasuryShare)
        interest_treasury_share                 = int(lending_controller_mock_time_origination.storage.config.interestTreasuryShare)
        decimals                                = int(lending_controller_mock_time_origination.storage.config.decimals)
        interest_rate_decimals                  = int(lending_controller_mock_time_origination.storage.config.interestRateDecimals)
        max_decimals_for_calculation            = int(lending_controller_mock_time_origination.storage.config.maxDecimalsForCalculation)
        max_vault_liquidation_pct               = int(lending_controller_mock_time_origination.storage.config.maxVaultLiquidationPercent)
        liquidation_delay_in_minutes            = int(lending_controller_mock_time_origination.storage.config.liquidationDelayInMins)
        add_liquidity_paused                    = lending_controller_mock_time_origination.storage.breakGlassConfig.addLiquidityIsPaused
        remove_liquidity_paused                 = lending_controller_mock_time_origination.storage.breakGlassConfig.removeLiquidityIsPaused
        register_vault_creation_paused          = lending_controller_mock_time_origination.storage.breakGlassConfig.registerVaultCreationIsPaused
        close_vault_paused                      = lending_controller_mock_time_origination.storage.breakGlassConfig.closeVaultIsPaused
        register_deposit_paused                 = lending_controller_mock_time_origination.storage.breakGlassConfig.registerDepositIsPaused
        register_withdrawal_paused              = lending_controller_mock_time_origination.storage.breakGlassConfig.registerWithdrawalIsPaused
        liquidate_vault_paused                  = lending_controller_mock_time_origination.storage.breakGlassConfig.liquidateVaultIsPaused
        mark_for_liquidation_paused             = lending_controller_mock_time_origination.storage.breakGlassConfig.markForLiquidationIsPaused
        borrow_paused                           = lending_controller_mock_time_origination.storage.breakGlassConfig.borrowIsPaused
        repay_paused                            = lending_controller_mock_time_origination.storage.breakGlassConfig.repayIsPaused
        set_loan_token_paused                   = lending_controller_mock_time_origination.storage.breakGlassConfig.setLoanTokenIsPaused
        set_collateral_token_paused             = lending_controller_mock_time_origination.storage.breakGlassConfig.setCollateralTokenIsPaused
        vault_deposit_staked_token_paused               = lending_controller_mock_time_origination.storage.breakGlassConfig.vaultDepositStakedTokenIsPaused
        vault_withdraw_staked_token_paused              = lending_controller_mock_time_origination.storage.breakGlassConfig.vaultWithdrawStakedTokenIsPaused
        vault_deposit_paused                    = lending_controller_mock_time_origination.storage.breakGlassConfig.vaultDepositIsPaused
        vault_withdraw_paused                   = lending_controller_mock_time_origination.storage.breakGlassConfig.vaultWithdrawIsPaused
    
        # Persist contract metadata
        await persist_contract_metadata(
            ctx=ctx,
            contract_address=lending_controller_address
        )
        
        # Create record
        governance, _       = await models.Governance.get_or_create(
            address = governance_address
        )
        await governance.save()
        lending_controller  = models.LendingController(
            address                                 = lending_controller_address,
            mock_time                               = True,
            admin                                   = admin,
            last_updated_at                         = timestamp,
            governance                              = governance,
            collateral_ratio                        = collateral_ratio,
            liquidation_ratio                       = liquidation_ratio,
            liquidation_fee_pct                     = liquidation_fee_pct,
            admin_liquidation_fee_pct               = admin_liquidation_fee_pct,
            minimum_loan_fee_pct                    = minimum_loan_fee_pct,
            minimum_loan_treasury_share             = minimum_loan_treasury_share,
            interest_treasury_share                 = interest_treasury_share,
            decimals                                = decimals,
            interest_rate_decimals                  = interest_rate_decimals,
            max_decimals_for_calculation            = max_decimals_for_calculation,
            max_vault_liquidation_pct               = max_vault_liquidation_pct,
            liquidation_delay_in_minutes            = liquidation_delay_in_minutes,
            add_liquidity_paused                    = add_liquidity_paused,
            remove_liquidity_paused                 = remove_liquidity_paused,
            register_vault_creation_paused          = register_vault_creation_paused,
            close_vault_paused                      = close_vault_paused,
            register_deposit_paused                 = register_deposit_paused,
            register_withdrawal_paused              = register_withdrawal_paused,
            liquidate_vault_paused                  = liquidate_vault_paused,
            mark_for_liquidation_paused             = mark_for_liquidation_paused,
            borrow_paused                           = borrow_paused,
            repay_paused                            = repay_paused,
            set_loan_token_paused                   = set_loan_token_paused,
            set_collateral_token_paused             = set_collateral_token_paused,
            vault_deposit_staked_token_paused               = vault_deposit_staked_token_paused,
            vault_withdraw_staked_token_paused              = vault_withdraw_staked_token_paused,
            vault_deposit_paused                    = vault_deposit_paused,
            vault_withdraw_paused                   = vault_withdraw_paused
        )
        await lending_controller.save()

    except BaseException as e:
         await save_error_report(e)

