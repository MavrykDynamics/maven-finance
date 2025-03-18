from maven.utils.error_reporting import save_error_report
from maven.utils.persisters import persist_governance
from maven.types.vault_factory.tezos_storage import VaultFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.vault_factory.tezos_parameters.set_governance import SetGovernanceParameter
from maven import models as models

async def set_governance(
    ctx: HandlerContext,
    set_governance: TezosTransaction[SetGovernanceParameter, VaultFactoryStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.VaultFactory, set_governance)

    except BaseException as e:
        await save_error_report(e)

