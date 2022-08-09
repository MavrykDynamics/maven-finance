
from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_general_contract
from mavryk.types.delegation.storage import DelegationStorage
from dipdup.models import Transaction
from mavryk.types.delegation.parameter.update_general_contracts import UpdateGeneralContractsParameter

async def on_delegation_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, DelegationStorage],
) -> None:

    # Perists general contract
    await persist_general_contract(update_general_contracts)