
from urllib import request
from mavryk.types.governance.storage import GovernanceStorage
from mavryk.types.governance.parameter.execute_proposal import ExecuteProposalParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
import mavryk.models as models

async def on_governance_execute_proposal(
    ctx: HandlerContext,
    execute_proposal: Transaction[ExecuteProposalParameter, GovernanceStorage],
) -> None:

    # Get operation values
    proposal_id         = int(execute_proposal.storage.timelockProposalId)
    proposal_storage    = execute_proposal.storage.proposalLedger[execute_proposal.storage.timelockProposalId]
    executed            = proposal_storage.executed
    timestamp           = execute_proposal.data.timestamp

    # Update record
    proposal     = await models.GovernanceProposal.get(
        internal_id  = proposal_id
    )
    proposal.executed               = executed
    proposal.execution_timestamp    = timestamp
    await proposal.save()
