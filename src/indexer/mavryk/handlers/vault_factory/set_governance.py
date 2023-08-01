from mavryk.utils.error_reporting import save_error_report
from mavryk.utils.persisters import persist_governance
from mavryk.types.vault_factory.storage import VaultFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.vault_factory.parameter.set_governance import SetGovernanceParameter
import mavryk.models as models

async def set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, VaultFactoryStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.VaultFactory, set_governance)

    except BaseException as e:
        await save_error_report(e)

