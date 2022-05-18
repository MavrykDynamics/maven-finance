
from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_general_contract
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction
from mavryk.types.farm.parameter.update_general_contracts import UpdateGeneralContractsParameter

async def on_farm_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, FarmStorage],
) -> None:

    # Perists general contract
    await persist_general_contract(update_general_contracts)