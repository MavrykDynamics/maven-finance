from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.types.token_sale.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configMaxAmountCap, UpdateConfigActionItem1 as configMaxAmountPerWalletTotal, UpdateConfigActionItem2 as configMinMvkAmount, UpdateConfigActionItem3 as configTokenXtzPrice, UpdateConfigActionItem4 as configVestingPeriodDurationSec, UpdateConfigActionItem5 as configVestingPeriods, UpdateConfigActionItem6 as configWhitelistMaxAmountTotal
from mavryk.types.token_sale.storage import TokenSaleStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_token_sale_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, TokenSaleStorage],
) -> None:

    try:
        # Get operation values
        token_sale_address          = update_config.data.target_address
        updated_value               = update_config.parameter.updateConfigNewValue
        update_config_action        = type(update_config.parameter.updateConfigAction)
        timestamp                   = update_config.data.timestamp
    
        # Update contract
        token_sale                  = await models.TokenSale.get(
            address = token_sale_address
        )
        token_sale.last_updated_at  = timestamp
    
        if update_config_action == configVestingPeriodDurationSec:
            token_sale.vesting_period_duration_sec  = int(updated_value)
        else:
            for update_config_attribute in update_config.parameter.updateConfigAction:
                targetted_buy_option    = update_config_attribute[1]
                buy_option              = await models.TokenSaleBuyOption.filter(
                    token_sale  = token_sale,
                    internal_id = targetted_buy_option
                ).first()
    
                if update_config_action == configMaxAmountCap:
                    buy_option.max_amount_cap               = float(updated_value)
                elif update_config_action == configMaxAmountPerWalletTotal:
                    buy_option.max_amount_per_wallet_total  = float(updated_value)
                elif update_config_action == configMinMvkAmount:
                    buy_option.min_mvk_amount               = float(updated_value)
                elif update_config_action == configTokenXtzPrice:
                    buy_option.token_xtz_price              = float(updated_value)
                elif update_config_action == configVestingPeriods:
                    buy_option.vesting_periods              = int(updated_value)
                elif update_config_action == configWhitelistMaxAmountTotal:
                    buy_option.whitelist_max_amount_total   = float(updated_value)
                await buy_option.save()
    
        await token_sale.save()

    except BaseException:
         await save_error_report()

