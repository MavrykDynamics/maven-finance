from maven.utils.error_reporting import save_error_report

from maven.types.governance.tezos_parameters.process_proposal_single_data import ProcessProposalSingleDataParameter
from dipdup.context import HandlerContext
from maven.types.governance.tezos_storage import GovernanceStorage
from dipdup.models.tezos_tzkt import TzktTransaction
import maven.models as models
from dateutil import parser

async def process_proposal_single_data(
    ctx: HandlerContext,
    process_proposal_single_data: TzktTransaction[ProcessProposalSingleDataParameter, GovernanceStorage],
) -> None:

    try:
        # Get operation info
        governance_address  = process_proposal_single_data.data.target_address
        proposal_id         = int(process_proposal_single_data.storage.timelockProposalId)
        storage_proposal    = process_proposal_single_data.storage.proposalLedger[process_proposal_single_data.storage.timelockProposalId]
        execution_counter   = int(storage_proposal.proposalDataExecutionCounter)
        executed            = storage_proposal.executed
        execution_datetime  = storage_proposal.executedDateTime
        if execution_datetime:
            execution_datetime  = parser.parse(storage_proposal.executedDateTime)
    
        # Update record
        governance          = await models.Governance.get(network=ctx.datasource.name.replace('mvkt_',''), address= governance_address)
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
                execution_datetime  = execution_datetime
            )

    except BaseException as e:
        await save_error_report(e)
