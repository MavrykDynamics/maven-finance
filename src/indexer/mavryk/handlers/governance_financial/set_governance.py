from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_governance
from mavryk.types.governance_financial.tezos_parameters.set_governance import SetGovernanceParameter
from mavryk.types.governance_financial.tezos_storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
import mavryk.models as models

async def set_governance(
    ctx: HandlerContext,
    set_governance: TzktTransaction[SetGovernanceParameter, GovernanceFinancialStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.GovernanceFinancial, set_governance)

    except BaseException as e:
        await save_error_report(e)

