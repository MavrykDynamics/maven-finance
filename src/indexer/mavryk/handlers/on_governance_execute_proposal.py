
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
    requestID       = int(execute_proposal.parameter.__root__)
    requestStorage  = execute_proposal.storage.proposalLedger[execute_proposal.parameter.__root__]
    executed        = requestStorage.executed

    # Update record
    request     = await models.GovernanceProposalRecord.get(
        id  = requestID
    )
    request.executed    = executed
    await request.save()
