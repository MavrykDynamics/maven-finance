from mavryk.utils.error_reporting import save_error_report

from mavryk.types.aggregator.parameter.update_config import UpdateConfigParameter
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
        timestamp               = update_config.data.timestamp
    
        # Update contract
        await models.Aggregator.filter(
            network = ctx.datasource.network,
            address = aggregator_address
        ).update(
            last_updated_at  = timestamp,
            decimals = update_config.storage.config.decimals,
            alpha_pct_per_thousand = update_config.storage.config.alphaPercentPerThousand,
            pct_oracle_threshold = update_config.storage.config.percentOracleThreshold,
            heart_beat_seconds = update_config.storage.config.heartBeatSeconds,
            reward_amount_smvk = update_config.storage.config.rewardAmountStakedMvk,
            reward_amount_xtz = update_config.storage.config.rewardAmountXtz,
        )

    except BaseException as e:
         await save_error_report(e)

