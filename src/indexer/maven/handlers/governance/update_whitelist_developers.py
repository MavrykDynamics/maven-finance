from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.types.governance.tezos_storage import GovernanceStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.governance.tezos_parameters.update_whitelist_developers import UpdateWhitelistDevelopersParameter
import maven.models as models

async def update_whitelist_developers(
    ctx: HandlerContext,
    update_whitelist_developers: TzktTransaction[UpdateWhitelistDevelopersParameter, GovernanceStorage],
) -> None:

    try:    
        # Get operation info
        governance_address      = update_whitelist_developers.data.target_address
        developer               = update_whitelist_developers.parameter.__root__
        whitelist_developers    = update_whitelist_developers.storage.whitelistDevelopers
    
        # Create/Update records
        governance              = await models.Governance.get(network=ctx.datasource.name.replace('tzkt_',''), address= governance_address)
        user                    = await models.maven_user_cache.get(network=ctx.datasource.name.replace('tzkt_',''), address=developer)
        whitelist_developer, _  = await models.WhitelistDeveloper.get_or_create(
            governance  = governance,
            developer   = user
        )
        await whitelist_developer.save()
        if not developer in whitelist_developers:
            await whitelist_developer.delete()

    except BaseException as e:
        await save_error_report(e)

