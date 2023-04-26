from mavryk.utils.error_reporting import save_error_report

from mavryk.types.aggregator.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configAlphaPercentPerThousand, UpdateConfigActionItem1 as configDecimals, UpdateConfigActionItem2 as configHeartBeatSeconds, UpdateConfigActionItem3 as configPercentOracleThreshold, UpdateConfigActionItem4 as configRewardAmountStakedMvk, UpdateConfigActionItem5 as configRewardAmountXtz
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, AggregatorStorage],
) -> None:

    try:
        # Get operation values
        aggregator_address      = update_config.data.target_address
        updated_value           = int(update_config.parameter.updateConfigNewValue)
        updated_config_action   = type(update_config.parameter.updateConfigAction)
        timestamp               = update_config.data.timestamp
    
        # Update contract
        aggregator              = await models.Aggregator.get(
            address = aggregator_address
        )
        aggregator.last_updated_at  = timestamp
        if updated_config_action == configDecimals:
            aggregator.decimals                             = updated_value
        elif updated_config_action == configAlphaPercentPerThousand:
            aggregator.alpha_pct_per_thousand               = updated_value
        elif updated_config_action == configHeartBeatSeconds:
            aggregator.heart_beat_seconds                   = updated_value
        elif updated_config_action == configPercentOracleThreshold:
            aggregator.pct_oracle_threshold                 = updated_value
        elif updated_config_action == configRewardAmountStakedMvk:
            aggregator.reward_amount_smvk                   = updated_value
        elif updated_config_action == configRewardAmountXtz:
            aggregator.reward_amount_xtz                    = updated_value
    
        await aggregator.save()

    except BaseException:
         await save_error_report()

