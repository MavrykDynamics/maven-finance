
from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.delegation.storage import DelegationStorage
from dipdup.models import Transaction
from mavryk.types.delegation.parameter.update_general_contracts import UpdateGeneralContractsParameter
import mavryk.models as models

async def on_delegation_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, DelegationStorage],
) -> None:

    # Perists general contract
    await persist_linked_contract(models.Delegation, models.DelegationGeneralContract, update_general_contracts)