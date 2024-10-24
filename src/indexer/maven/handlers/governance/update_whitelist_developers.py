from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.types.governance.tezos_storage import GovernanceStorage
from dipdup.models.tezos import TezosTransaction
from maven.types.governance.tezos_parameters.update_whitelist_developers import UpdateWhitelistDevelopersParameter
import maven.models as models

async def update_whitelist_developers(
    ctx: HandlerContext,
    update_whitelist_developers: TezosTransaction[UpdateWhitelistDevelopersParameter, GovernanceStorage],
) -> None:

    try:    
        # Get operation info
        governance_address      = update_whitelist_developers.data.target_address
        developer               = update_whitelist_developers.parameter.root
        whitelist_developers    = update_whitelist_developers.storage.whitelistDevelopers
    
        # Create/Update records
        governance              = await models.Governance.get(network='atlasnet', address= governance_address)
        user                    = await models.maven_user_cache.get(network='atlasnet', address=developer)
        whitelist_developer, _  = await models.WhitelistDeveloper.get_or_create(
            governance  = governance,
            developer   = user
        )
        await whitelist_developer.save()
        if not developer in whitelist_developers:
            await whitelist_developer.delete()

    except BaseException as e:
        await save_error_report(e)

