
from mavryk.types.aggregator.parameter.withdraw_reward_xtz import WithdrawRewardXtzParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_withdraw_reward_xtz(
    ctx: HandlerContext,
    withdraw_reward_xtz: Transaction[WithdrawRewardXtzParameter, AggregatorStorage],
) -> None:

    # Get operation info
    aggregator_address          = withdraw_reward_xtz.data.target_address
    oracle_address              = withdraw_reward_xtz.parameter.__root__
    oracle_reward_xtz_storage   = withdraw_reward_xtz.storage.oracleRewardXtz[oracle_address]

    # Update record
    oracle, _                   = await models.MavrykUser.get_or_create(address = oracle_address)
    await oracle.save()

    aggregator                  = await models.Aggregator.get(address   = aggregator_address)

    oracle_reward_xtz, _        = await models.AggregatorOracleRewardXTZ.get_or_create(
        aggregator  = aggregator,
        oracle      = oracle
    )
    oracle_reward_xtz.xtz       = oracle_reward_xtz_storage
    await oracle_reward_xtz.save()
