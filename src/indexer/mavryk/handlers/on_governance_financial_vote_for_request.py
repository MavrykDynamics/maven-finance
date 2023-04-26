from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from mavryk.types.governance_financial.parameter.vote_for_request import VoteForRequestParameter, VoteItem as nay, VoteItem1 as pass_, VoteItem2 as yay
import mavryk.models as models

async def on_governance_financial_vote_for_request(
    ctx: HandlerContext,
    vote_for_request: Transaction[VoteForRequestParameter, GovernanceFinancialStorage],
) -> None:

    try:    
        # Get operation info
        financial_address   = vote_for_request.data.target_address
        governance_address  = vote_for_request.storage.governanceAddress
        voter_address       = vote_for_request.data.sender_address
        vote                = vote_for_request.parameter.vote
        request_id          = int(vote_for_request.parameter.requestId)
        request_storage     = vote_for_request.storage.financialRequestLedger[vote_for_request.parameter.requestId]
        timestamp           = vote_for_request.data.timestamp
        yay_smvk_total      = float(request_storage.yayVoteStakedMvkTotal)
        nay_smvk_total      = float(request_storage.nayVoteStakedMvkTotal)
        pass_smvk_total     = float(request_storage.nayVoteStakedMvkTotal)
        executed            = request_storage.executed
    
        # Process vote
        vote_type           = models.GovernanceVoteType.YAY
        if type(vote) == nay:
            vote_type       = models.GovernanceVoteType.NAY
        if type(vote) == pass_:
            vote_type       = models.GovernanceVoteType.PASS
    
        # Create and update records
        governance              = await models.Governance.get(address   = governance_address)
        governance_financial    = await models.GovernanceFinancial.get(address  = financial_address)
        financial_request       = await models.GovernanceFinancialRequest.filter(
            governance_financial    = governance_financial,
            internal_id             = request_id
        ).first()
        financial_request.executed              = executed
        financial_request.yay_vote_smvk_total   = yay_smvk_total
        financial_request.nay_vote_smvk_total   = nay_smvk_total
        financial_request.pass_vote_smvk_total  = pass_smvk_total
        if executed:
            financial_request.execution_datetime    = timestamp
        await financial_request.save()
    
        voter                   = await models.mavryk_user_cache.get(address=voter_address)
    
        # Register vote
        satellite_snapshot, _   = await models.GovernanceSatelliteSnapshot.get_or_create(
            governance  = governance,
            user        = voter,
            cycle       = governance.cycle_id
        )
        await satellite_snapshot.save()
        vote_record, _          = await models.GovernanceFinancialRequestVote.get_or_create(
            governance_financial_request    = financial_request,
            voter                           = voter
        )
        vote_record.timestamp       = timestamp
        vote_record.snapshot        = satellite_snapshot
        vote_record.vote            = vote_type
        await vote_record.save()

    except BaseException:
         await save_error_report()

