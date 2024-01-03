from maven.utils.error_reporting import save_error_report

from maven.types.aggregator.tezos_parameters.update_config import UpdateConfigParameter
from maven.types.aggregator.tezos_storage import AggregatorStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext
import maven.models as models

async def update_config(
    ctx: HandlerContext,
    update_config: TzktTransaction[UpdateConfigParameter, AggregatorStorage],
) -> None:

    try:
        # Get operation values
        aggregator_address      = update_config.data.target_address
        timestamp               = update_config.data.timestamp
    
        # Update contract
        await models.Aggregator.filter(
            network = ctx.datasource.name.replace('tzkt_',''),
            address = aggregator_address
        ).update(
            last_updated_at  = timestamp,
            decimals = update_config.storage.config.decimals,
            alpha_pct_per_thousand = update_config.storage.config.alphaPercentPerThousand,
            pct_oracle_threshold = update_config.storage.config.percentOracleThreshold,
            heart_beat_seconds = update_config.storage.config.heartbeatSeconds,
            reward_amount_smvn = update_config.storage.config.rewardAmountStakedMvn,
            reward_amount_xtz = update_config.storage.config.rewardAmountXtz,
        )

    except BaseException as e:
        await save_error_report(e)

