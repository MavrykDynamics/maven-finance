from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_governance
from mavryk.types.vesting.parameter.set_governance import SetGovernanceParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.vesting.storage import VestingStorage
import mavryk.models as models

async def on_vesting_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, VestingStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.Vesting, set_governance)

    except BaseException as e:
         await save_error_report(e)

