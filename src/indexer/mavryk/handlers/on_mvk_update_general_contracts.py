
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.mvk.storage import MvkStorage
from mavryk.types.mvk.parameter.update_general_contracts import UpdateGeneralContractsParameter
import mavryk.models as models

async def on_mvk_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, MvkStorage],
) -> None:

    # Perists general contract
    await persist_linked_contract(models.MVKToken, models.MVKTokenGeneralContract, update_general_contracts)