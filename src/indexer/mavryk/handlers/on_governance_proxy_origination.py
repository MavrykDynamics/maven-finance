
from dipdup.models import Origination
from dipdup.context import HandlerContext
from mavryk.types.governance_proxy.storage import GovernanceProxyStorage
import mavryk.models as models

async def on_governance_proxy_origination(
    ctx: HandlerContext,
    governance_proxy_origination: Origination[GovernanceProxyStorage],
) -> None:

    # Get operation values
    governance_proxy_address    = governance_proxy_origination.data.originated_contract_address
    admin_address               = governance_proxy_origination.storage.admin
    governance_address          = governance_proxy_origination.storage.governanceAddress

    # Create record
    governance, _               = await models.Governance.get_or_create(
        address = governance_address
    )
    await governance.save()
    governance_proxy            = models.GovernanceProxy(
        address     = governance_proxy_address,
        admin       = admin_address,
        governance  = governance
    )
    await governance_proxy.save()
