from dipdup.context import HandlerContext
from mavryk.types.aggregator.storage import AggregatorStorage
from mavryk.types.aggregator.parameter.update_data import UpdateDataParameter
from dipdup.models import Transaction
import mavryk.models as models
from dateutil import parser

async def on_aggregator_update_data(
    ctx: HandlerContext,
    update_data: Transaction[UpdateDataParameter, AggregatorStorage],
) -> None:
    
    # Get operation info
    aggregator_address              = update_data.data.target_address
    oracle_address                  = update_data.data.sender_address
    last_completed_price            = update_data.storage.lastCompletedPrice
    oracle_reward_xtz_amount        = float(update_data.storage.oracleRewardXtz[oracle_address])
    oracle_reward_smvk_amount       = float(update_data.storage.oracleRewardStakedMvk[oracle_address])

    # Update / create record
    aggregator                      = await models.Aggregator.get(
        address = aggregator_address
    )
    aggregator.last_completed_price_round              = int(last_completed_price.round)
    aggregator.last_completed_price_epoch              = int(last_completed_price.epoch)
    aggregator.last_completed_price                    = float(last_completed_price.price)
    aggregator.last_completed_price_pct_oracle_resp    = int(last_completed_price.percentOracleResponse)
    aggregator.last_completed_price_datetime           = parser.parse(last_completed_price.priceDateTime)
    await aggregator.save()

    user, _                         = await models.MavrykUser.get_or_create(
        address     = oracle_address
    )
    await user.save()
    oracle, _                       = await models.AggregatorOracle.get_or_create(
        aggregator  = aggregator,
        user        = user
    )
    await oracle.save()
    oracle_reward_xtz, _            = await models.AggregatorOracleReward.get_or_create(
        oracle      = oracle,
        type        = models.RewardType.XTZ
    )
    oracle_reward_xtz.reward        = oracle_reward_xtz_amount
    await oracle_reward_xtz.save()
    oracle_reward_smvk, _            = await models.AggregatorOracleReward.get_or_create(
        oracle      = oracle,
        type        = models.RewardType.SMVK
    )
    oracle_reward_smvk.reward       = oracle_reward_smvk_amount
    await oracle_reward_smvk.save()
