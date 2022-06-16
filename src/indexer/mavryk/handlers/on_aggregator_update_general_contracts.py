
from mavryk.types.aggregator.parameter.update_general_contracts import UpdateGeneralContractsParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_aggregator_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, AggregatorStorage],
) -> None:
    ...
