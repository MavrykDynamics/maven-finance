from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_governance
from mavryk.types.treasury_factory.tezos_storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.treasury_factory.tezos_parameters.set_governance import SetGovernanceParameter
import mavryk.models as models

async def set_governance(
    ctx: HandlerContext,
    set_governance: TzktTransaction[SetGovernanceParameter, TreasuryFactoryStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.TreasuryFactory, set_governance)

    except BaseException as e:
        await save_error_report(e)

