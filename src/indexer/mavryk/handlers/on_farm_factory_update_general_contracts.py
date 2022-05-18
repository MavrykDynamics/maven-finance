
from mavryk.utils.persisters import persist_general_contract
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.farm_factory.parameter.update_general_contracts import UpdateGeneralContractsParameter

async def on_farm_factory_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, FarmFactoryStorage],
) -> None:

    # Perists general contract
    await persist_general_contract(update_general_contracts)