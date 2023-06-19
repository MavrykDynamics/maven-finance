from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_governance
from mavryk.types.governance_financial.parameter.set_governance import SetGovernanceParameter
from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
import mavryk.models as models

async def on_governance_financial_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, GovernanceFinancialStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.GovernanceFinancial, set_governance)

    except BaseException as e:
         await save_error_report(e)

