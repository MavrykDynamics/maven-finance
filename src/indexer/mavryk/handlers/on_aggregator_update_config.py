
from mavryk.types.aggregator.parameter.update_config import UpdateConfigParameter, UpdateConfigActionItem as configDecimals, UpdateConfigActionItem1 as configDevTriggerBanDuration, UpdateConfigActionItem2 as configDeviationRewardAmountXtz, UpdateConfigActionItem3 as configDeviationRewardStakedMvk, UpdateConfigActionItem4 as configHeartBeatSeconds, UpdateConfigActionItem5 as configPerThousandDevTrigger, UpdateConfigActionItem6 as configPercentOracleThreshold, UpdateConfigActionItem7 as configRequestRateDevDepositFee, UpdateConfigActionItem8 as configRewardAmountStakedMvk, UpdateConfigActionItem9 as configRewardAmountXtz 
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_update_config(
    ctx: HandlerContext,
    update_config: Transaction[UpdateConfigParameter, AggregatorStorage],
) -> None:

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
    elif updated_config_action == configDevTriggerBanDuration:
        aggregator.deviation_trigger_ban_duration       = updated_value
    elif updated_config_action == configDeviationRewardAmountXtz:
        aggregator.deviation_reward_amount_xtz          = updated_value
    elif updated_config_action == configDeviationRewardStakedMvk:
        aggregator.deviation_reward_amount_smvk         = updated_value
    elif updated_config_action == configHeartBeatSeconds:
        aggregator.heart_beat_seconds                   = updated_value
    elif updated_config_action == configPerThousandDevTrigger:
        aggregator.per_thousand_deviation_trigger       = updated_value
    elif updated_config_action == configPercentOracleThreshold:
        aggregator.percent_oracle_threshold             = updated_value
    elif updated_config_action == configRequestRateDevDepositFee:
        aggregator.request_rate_deviation_deposit_fee   = updated_value
    elif updated_config_action == configRewardAmountStakedMvk:
        aggregator.reward_amount_smvk                   = updated_value
    elif updated_config_action == configRewardAmountXtz:
        aggregator.reward_amount_xtz                    = updated_value

    await aggregator.save()
