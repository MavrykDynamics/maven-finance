from mavryk.utils.error_reporting import save_error_report

from urllib import request
from mavryk.types.governance.storage import GovernanceStorage
from mavryk.types.governance.parameter.execute_proposal import ExecuteProposalParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
import mavryk.models as models
from dateutil import parser

async def on_governance_execute_proposal(
    ctx: HandlerContext,
    execute_proposal: Transaction[ExecuteProposalParameter, GovernanceStorage],
) -> None:

    try:
        # Get operation values
        proposal_id         = int(execute_proposal.storage.timelockProposalId)
        proposal_storage    = execute_proposal.storage.proposalLedger[execute_proposal.storage.timelockProposalId]
        executed            = proposal_storage.executed
        execution_datetime  = proposal_storage.executedDateTime
        if execution_datetime:
            execution_datetime  = parser.parse(proposal_storage.executedDateTime)
    
        # Update record
        await models.GovernanceProposal.filter(
            internal_id  = proposal_id
        ).update(
            executed            = executed,
            execution_datetime  = execution_datetime
        )

    except BaseException as e:
         await save_error_report(e)

