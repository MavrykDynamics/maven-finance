from maven.utils.error_reporting import save_error_report

from maven.types.governance.tezos_parameters.set_governance_proxy import SetGovernanceProxyParameter
from dipdup.context import HandlerContext
from maven.types.governance.tezos_storage import GovernanceStorage
from dipdup.models.tezos import TezosTransaction
from maven import models as models

async def set_governance_proxy(
    ctx: HandlerContext,
    set_governance_proxy: TezosTransaction[SetGovernanceProxyParameter, GovernanceStorage],
) -> None:

    try:
        # Get operation values
        governance_address          = set_governance_proxy.data.target_address
        governance_proxy_address    = set_governance_proxy.parameter.root
    
        # Update record
        governance                              = await models.Governance.get(network='atlasnet', address= governance_address)
        governance.governance_proxy_address     = governance_proxy_address
        await governance.save()
    except BaseException as e:
        await save_error_report(e)

