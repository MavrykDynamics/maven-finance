from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Origination
from dipdup.context import HandlerContext
from mavryk.utils.contracts import get_contract_metadata
from mavryk.types.governance_proxy.storage import GovernanceProxyStorage
import mavryk.models as models

async def on_governance_proxy_origination(
    ctx: HandlerContext,
    governance_proxy_origination: Origination[GovernanceProxyStorage],
) -> None:

    try:
        # Get operation values
        governance_proxy_address    = governance_proxy_origination.data.originated_contract_address
        admin_address               = governance_proxy_origination.storage.admin
        governance_address          = governance_proxy_origination.storage.governanceAddress
        timestamp                   = governance_proxy_origination.data.timestamp
    
        # Get contract metadata
        contract_metadata = await get_contract_metadata(
            ctx=ctx,
            contract_address=governance_proxy_address
        )
        
        # Create record
        governance, _               = await models.Governance.get_or_create(
            network = ctx.datasource.network,
            address = governance_address
        )
        await governance.save()
        governance_proxy            = models.GovernanceProxy(
            address             = governance_proxy_address,
            network             = ctx.datasource.network,
            metadata            = contract_metadata,
            admin               = admin_address,
            last_updated_at     = timestamp,
            governance          = governance
        )
        await governance_proxy.save()

    except BaseException as e:
         await save_error_report(e)

