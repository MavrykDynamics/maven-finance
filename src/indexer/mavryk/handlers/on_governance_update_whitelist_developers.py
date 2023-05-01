from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
from mavryk.types.governance.parameter.update_whitelist_developers import UpdateWhitelistDevelopersParameter
import mavryk.models as models

async def on_governance_update_whitelist_developers(
    ctx: HandlerContext,
    update_whitelist_developers: Transaction[UpdateWhitelistDevelopersParameter, GovernanceStorage],
) -> None:

    try:    
        # Get operation info
        governance_address      = update_whitelist_developers.data.target_address
        developer               = update_whitelist_developers.parameter.__root__
        whitelist_developers    = update_whitelist_developers.storage.whitelistDevelopers
    
        # Create/Update records
        governance              = await models.Governance.get(address   = governance_address)
        user                    = await models.mavryk_user_cache.get(address=developer)
        whitelist_developer, _  = await models.WhitelistDeveloper.get_or_create(
            governance  = governance,
            developer   = user
        )
        await whitelist_developer.save()
        if not developer in whitelist_developers:
            await whitelist_developer.delete()

    except BaseException as e:
         await save_error_report(e)

