from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.m_farm.parameter.update_general_contracts import UpdateGeneralContractsParameter
from mavryk.types.m_farm.storage import MFarmStorage
import mavryk.models as models

async def on_m_farm_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, MFarmStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(models.Farm, models.FarmGeneralContract, update_general_contracts)

    except BaseException:
         await save_error_report()

