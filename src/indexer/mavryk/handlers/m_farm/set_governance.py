from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_governance
from mavryk.types.m_farm.parameter.set_governance import SetGovernanceParameter
from mavryk.types.m_farm.storage import MFarmStorage
import mavryk.models as models

async def set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, MFarmStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.Farm, set_governance)

    except BaseException as e:
        await save_error_report(e)

