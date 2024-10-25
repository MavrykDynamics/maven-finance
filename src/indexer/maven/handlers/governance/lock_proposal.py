from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.types.governance.tezos_parameters.lock_proposal import LockProposalParameter
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.governance.tezos_storage import GovernanceStorage
import maven.models as models

async def lock_proposal(
    ctx: HandlerContext,
    lock_proposal: TzktTransaction[LockProposalParameter, GovernanceStorage],
) -> None:

    try:
        # Get operation values
        proposalID          = int(lock_proposal.parameter.__root__)
    
        # Update record
        governance          = await models.Governance.get(
            network = ctx.datasource.name.replace('mvkt_','')
        )
        await models.GovernanceProposal.filter(
            governance  = governance,
            internal_id = proposalID
        ).update(
            locked = True
        )

    except BaseException as e:
        await save_error_report(e)

