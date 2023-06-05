from mavryk.utils.error_reporting import save_error_report
from dipdup.models import Transaction
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.context import HandlerContext
from mavryk.types.governance.parameter.drop_proposal import DropProposalParameter
import mavryk.models as models

async def on_governance_drop_proposal(
    ctx: HandlerContext,
    drop_proposal: Transaction[DropProposalParameter, GovernanceStorage],
) -> None:

    try:
        # Get operation values
        governance_address  = drop_proposal.data.target_address
        proposal_id         = int(drop_proposal.parameter.__root__)
    
        # Update record
        governance  = await models.Governance.get(
            address     = governance_address
        )
        proposal    = await models.GovernanceProposal.filter(
            governance  = governance,
            internal_id = proposal_id
        ).first()
        proposal.status = models.GovernanceActionStatus.DROPPED
        await proposal.save()

    except BaseException as e:
         await save_error_report(e)

