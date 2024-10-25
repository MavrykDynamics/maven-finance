from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_governance
from maven.types.governance_financial.tezos_parameters.set_governance import SetGovernanceParameter
from maven.types.governance_financial.tezos_storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
import maven.models as models

async def set_governance(
    ctx: HandlerContext,
    set_governance: TzktTransaction[SetGovernanceParameter, GovernanceFinancialStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.GovernanceFinancial, set_governance)

    except BaseException as e:
        await save_error_report(e)

