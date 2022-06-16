
from mavryk.utils.persisters import persist_general_contract
from mavryk.types.aggregator.parameter.update_general_contracts import UpdateGeneralContractsParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_aggregator_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, AggregatorStorage],
) -> None:

    # Perists general contract
    await persist_general_contract(update_general_contracts)
