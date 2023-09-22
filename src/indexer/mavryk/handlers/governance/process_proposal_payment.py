from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.types.governance.tezos_storage import GovernanceStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.governance.tezos_parameters.process_proposal_payment import ProcessProposalPaymentParameter
import mavryk.models as models

async def process_proposal_payment(
    ctx: HandlerContext,
    process_proposal_payment: TzktTransaction[ProcessProposalPaymentParameter, GovernanceStorage],
) -> None:

    try:
        # Get operation info
        governance_address  = process_proposal_payment.data.target_address
        proposal_id         = int(process_proposal_payment.parameter.__root__)
        proposal_storage    = process_proposal_payment.storage.proposalLedger[process_proposal_payment.parameter.__root__]
        payment_processed   = proposal_storage.paymentProcessed
    
        # Create or update record
        governance          = await models.Governance.get(network=ctx.datasource.name.replace('tzkt_',''), address= governance_address)
        await models.GovernanceProposal.filter(
            governance  = governance,
            internal_id = proposal_id
        ).update(
            payment_processed   = payment_processed
        )

    except BaseException as e:
        await save_error_report(e)

