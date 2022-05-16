
from mavryk.types.governance.parameter.add_update_payment_data import AddUpdatePaymentDataParameter
from dipdup.context import HandlerContext
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction

async def on_governance_add_update_payment_data(
    ctx: HandlerContext,
    add_update_payment_data: Transaction[AddUpdatePaymentDataParameter, GovernanceStorage],
) -> None:
    ...