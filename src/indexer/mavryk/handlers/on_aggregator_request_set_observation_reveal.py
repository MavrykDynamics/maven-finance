
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from mavryk.types.aggregator.parameter.set_observation_reveal import SetObservationRevealParameter
from dipdup.context import HandlerContext

async def on_aggregator_request_set_observation_reveal(
    ctx: HandlerContext,
    set_observation_reveal: Transaction[SetObservationRevealParameter, AggregatorStorage],
) -> None:
    ...
