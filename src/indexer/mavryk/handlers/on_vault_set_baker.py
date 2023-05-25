from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.vault.parameter.set_baker import SetBakerParameter
from mavryk.types.vault.storage import VaultStorage
import mavryk.models as models

async def on_vault_set_baker(
    ctx: HandlerContext,
    set_baker: Transaction[SetBakerParameter, VaultStorage],
) -> None:

    try:
        # Get operation info
        vault_address       = set_baker.data.target_address
        baker_address       = set_baker.parameter.__root__
    
        # Update record
        vault               = await models.Vault.get(network=ctx.datasource.network, address= vault_address)
        baker               = None
        if baker_address:
            baker   = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=baker_address)
        vault.baker      = baker
        await vault.save()

    except BaseException as e:
         await save_error_report(e)

