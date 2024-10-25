from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktOrigination
from dipdup.context import HandlerContext
from maven.utils.contracts import get_contract_metadata
from maven.types.governance_proxy.tezos_storage import GovernanceProxyStorage
import maven.models as models

async def origination(
    ctx: HandlerContext,
    governance_proxy_origination: TzktOrigination[GovernanceProxyStorage],
) -> None:

    try:
        # Get operation values
        governance_proxy_address    = governance_proxy_origination.data.originated_contract_address
        admin_address               = governance_proxy_origination.storage.admin
        timestamp                   = governance_proxy_origination.data.timestamp
    
        # Get contract metadata
        contract_metadata = await get_contract_metadata(
            ctx=ctx,
            contract_address=governance_proxy_address
        )
        
        # Create record# Get governance record
        governance                  = await models.Governance.get(network = ctx.datasource.name.replace('mvkt_',''))
        governance_proxy            = models.GovernanceProxy(
            address             = governance_proxy_address,
            network             = ctx.datasource.name.replace('mvkt_',''),
            metadata            = contract_metadata,
            admin               = admin_address,
            last_updated_at     = timestamp,
            governance          = governance
        )
        await governance_proxy.save()

    except BaseException as e:
        await save_error_report(e)

