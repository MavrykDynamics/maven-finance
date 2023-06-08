from mavryk.utils.error_reporting import save_error_report

from mavryk.types.governance.parameter.process_proposal_single_data import ProcessProposalSingleDataParameter
from dipdup.context import HandlerContext
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_governance_process_proposal_single_data(
    ctx: HandlerContext,
    process_proposal_single_data: Transaction[ProcessProposalSingleDataParameter, GovernanceStorage],
) -> None:

    try:
        # Get operation info
        governance_address  = process_proposal_single_data.data.target_address
        proposal_id         = int(process_proposal_single_data.storage.timelockProposalId)
        storage_proposal    = process_proposal_single_data.storage.proposalLedger[process_proposal_single_data.storage.timelockProposalId]
        execution_counter   = int(storage_proposal.proposalDataExecutionCounter)
        executed            = storage_proposal.executed
        timestamp           = process_proposal_single_data.data.timestamp
    
        # Update record
        governance          = await models.Governance.get(network=ctx.datasource.network, address= governance_address)
        await models.GovernanceProposal.filter(
            governance  = governance,
            internal_id = proposal_id
        ).update(
            execution_counter  = execution_counter,
            executed           = executed
        )
        if executed:
            await models.GovernanceProposal.filter(
                governance          = governance,
                internal_id         = proposal_id
            ).update(
                execution_datetime  = timestamp
            )

    except BaseException as e:
         await save_error_report(e)
