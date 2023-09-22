from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_governance
from mavryk.types.mvk_token.tezos_parameters.set_governance import SetGovernanceParameter
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.mvk_token.tezos_storage import MvkTokenStorage
import mavryk.models as models

async def set_governance(
    ctx: HandlerContext,
    set_governance: TzktTransaction[SetGovernanceParameter, MvkTokenStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.MVKToken, set_governance)

    except BaseException as e:
        await save_error_report(e)

