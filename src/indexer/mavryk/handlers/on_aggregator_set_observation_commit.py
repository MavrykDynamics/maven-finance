
from mavryk.types.aggregator.parameter.set_observation_commit import SetObservationCommitParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_set_observation_commit(
    ctx: HandlerContext,
    set_observation_commit: Transaction[SetObservationCommitParameter, AggregatorStorage],
) -> None:

    # Get operation info
    aggregator_address          = set_observation_commit.data.target_address
    oracle_address              = set_observation_commit.data.sender_address
    sign                        = set_observation_commit.parameter.sign
    switch_block                = int(set_observation_commit.storage.switchBlock)

    # Create record
    oracle, _                   = await models.MavrykUser.get_or_create(address = oracle_address)
    await oracle.save()

    aggregator                  = await models.Aggregator.get(address   = aggregator_address)
    aggregator.switch_block     = switch_block
    await aggregator.save()

    observation_commit, _       = await models.AggregatorObservationCommit.get_or_create(
        aggregator  = aggregator,
        oracle      = oracle
    )
    observation_commit.commit   = sign
    await observation_commit.save()
