
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.mvk.storage import MvkStorage
from mavryk.types.mvk.parameter.update_general_contracts import UpdateGeneralContractsParameter

async def on_mvk_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, MvkStorage],
) -> None:
    ...