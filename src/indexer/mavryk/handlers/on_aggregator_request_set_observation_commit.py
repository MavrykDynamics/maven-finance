
from mavryk.types.aggregator.parameter.set_observation_commit import SetObservationCommitParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_aggregator_request_set_observation_commit(
    ctx: HandlerContext,
    set_observation_commit: Transaction[SetObservationCommitParameter, AggregatorStorage],
) -> None:

    # Get operation info
    breakpoint()
