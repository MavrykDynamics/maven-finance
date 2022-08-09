
from mavryk.utils.persisters import persist_general_contract
from mavryk.types.aggregator_factory.parameter.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.models import Transaction
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext

async def on_aggregator_factory_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, AggregatorFactoryStorage],
) -> None:

    # Perists general contract
    await persist_general_contract(update_general_contracts)
