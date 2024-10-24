from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.types.governance.tezos_parameters.lock_proposal import LockProposalParameter
from dipdup.models.tezos import TezosTransaction
from maven.types.governance.tezos_storage import GovernanceStorage
import maven.models as models

async def lock_proposal(
    ctx: HandlerContext,
    lock_proposal: TezosTransaction[LockProposalParameter, GovernanceStorage],
) -> None:

    try:
        # Get operation values
        proposalID          = int(lock_proposal.parameter.root)
    
        # Update record
        governance          = await models.Governance.get(
            network = 'atlasnet'
        )
        await models.GovernanceProposal.filter(
            governance  = governance,
            internal_id = proposalID
        ).update(
            locked = True
        )

    except BaseException as e:
        await save_error_report(e)

