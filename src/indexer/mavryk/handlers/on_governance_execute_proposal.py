from mavryk.utils.error_reporting import save_error_report

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

    try:
        # Get operation values
        proposal_id         = int(execute_proposal.storage.timelockProposalId)
        proposal_storage    = execute_proposal.storage.proposalLedger[execute_proposal.storage.timelockProposalId]
        executed            = proposal_storage.executed
        timestamp           = execute_proposal.data.timestamp
    
        # Update record
        await models.GovernanceProposal.filter(
            internal_id  = proposal_id
        ).update(
            executed            = executed,
            execution_datetime  = timestamp
        )

    except BaseException as e:
         await save_error_report(e)

