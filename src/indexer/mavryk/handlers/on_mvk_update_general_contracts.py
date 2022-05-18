
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_general_contract
from mavryk.types.mvk.storage import MvkStorage
from mavryk.types.mvk.parameter.update_general_contracts import UpdateGeneralContractsParameter

async def on_mvk_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, MvkStorage],
) -> None:

    # Perists general contract
    await persist_general_contract(update_general_contracts)