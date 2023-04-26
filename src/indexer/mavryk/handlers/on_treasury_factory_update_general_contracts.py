from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury_factory.parameter.update_general_contracts import UpdateGeneralContractsParameter
import mavryk.models as models

async def on_treasury_factory_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, TreasuryFactoryStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(models.TreasuryFactory, models.TreasuryFactoryGeneralContract, update_general_contracts)

    except BaseException:
         await save_error_report()

