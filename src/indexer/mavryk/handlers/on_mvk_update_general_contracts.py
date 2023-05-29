from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.mvk_token.storage import MvkTokenStorage
from mavryk.types.mvk_token.parameter.update_general_contracts import UpdateGeneralContractsParameter
import mavryk.models as models

async def on_mvk_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, MvkTokenStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(ctx, models.MVKToken, models.MVKTokenGeneralContract, update_general_contracts)
    except BaseException as e:
         await save_error_report(e)

