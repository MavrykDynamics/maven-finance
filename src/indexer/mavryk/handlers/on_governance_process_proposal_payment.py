from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
from mavryk.types.governance.parameter.process_proposal_payment import ProcessProposalPaymentParameter
import mavryk.models as models

async def on_governance_process_proposal_payment(
    ctx: HandlerContext,
    process_proposal_payment: Transaction[ProcessProposalPaymentParameter, GovernanceStorage],
) -> None:

    try:
        # Get operation info
        governance_address  = process_proposal_payment.data.target_address
        proposal_id         = int(process_proposal_payment.parameter.__root__)
        proposal_storage    = process_proposal_payment.storage.proposalLedger[process_proposal_payment.parameter.__root__]
        payment_processed   = proposal_storage.paymentProcessed
    
        # Create or update record
        governance          = await models.Governance.get(network=ctx.datasource.network, address= governance_address)
        proposal            = await models.GovernanceProposal.filter(
            governance  = governance,
            internal_id = proposal_id
        ).first()
        proposal.payment_processed   = payment_processed
        await proposal.save()

    except BaseException as e:
         await save_error_report(e)

