
from mavryk.types.governance_financial.storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.governance_financial.parameter.vote_for_request import VoteForRequestParameter, VoteItem as approve, VoteItem1 as disapprove
import mavryk.models as models

async def on_governance_financial_vote_for_request(
    ctx: HandlerContext,
    vote_for_request: Transaction[VoteForRequestParameter, GovernanceFinancialStorage],
) -> None:
    
    # Get operation info
    financial_address   = vote_for_request.data.target_address
    voter_address       = vote_for_request.data.sender_address
    vote                = vote_for_request.parameter.vote
    request_id          = int(vote_for_request.parameter.requestId)
    request_storage     = vote_for_request.storage.financialRequestLedger[vote_for_request.parameter.requestId]
    voter_storage       = request_storage.voters[voter_address]
    timestamp           = vote_for_request.data.timestamp
    approve_total       = float(request_storage.approveVoteTotal)
    disapprove_total    = float(request_storage.disapproveVoteTotal)
    executed            = request_storage.executed

    # Process vote
    vote_type           = models.GovernanceVoteType.YAY
    if type(vote) == disapprove:
        vote_type       = models.GovernanceVoteType.NAY

    # Create and update records
    governance_financial    = await models.GovernanceFinancial.get(address  = financial_address)
    financial_request       = await models.GovernanceFinancialRequestRecord.get(
        governance_financial    = governance_financial,
        id                      = request_id
    )
    financial_request.executed              = executed
    financial_request.approve_vote_total    = approve_total
    financial_request.disapprove_vote_total = disapprove_total
    await financial_request.save()
    
    voter, _                = await models.MavrykUser.get_or_create(
        address = voter_address
    )
    await voter.save()
    vote_record, _          = await models.GovernanceFinancialRequestRecordVote.get_or_create(
        governance_financial_request    = financial_request,
        voter                           = voter
    )
    vote_record.timestamp       = timestamp
    vote_record.vote            = vote_type
    vote_record.voting_power    = float(voter_storage.totalVotingPower)
    await vote_record.save()
