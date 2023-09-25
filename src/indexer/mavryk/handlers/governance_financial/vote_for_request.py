from mavryk.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.governance_financial.tezos_storage import GovernanceFinancialStorage
from dipdup.context import HandlerContext
from mavryk.types.governance_financial.tezos_parameters.vote_for_request import VoteForRequestParameter, VoteItem as nay, VoteItem1 as pass_, VoteItem2 as yay
import mavryk.models as models
from dateutil import parser

async def vote_for_request(
    ctx: HandlerContext,
    vote_for_request: TzktTransaction[VoteForRequestParameter, GovernanceFinancialStorage],
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
        execution_datetime  = request_storage.executedDateTime
        if execution_datetime:
            execution_datetime  = parser.parse(request_storage.executedDateTime)
        executed            = request_storage.executed
    
        # Process vote
        vote_type           = models.GovernanceVoteType.YAY
        if type(vote) == nay:
            vote_type       = models.GovernanceVoteType.NAY
        if type(vote) == pass_:
            vote_type       = models.GovernanceVoteType.PASS
    
        # Create and update records
        governance              = await models.Governance.get(network=ctx.datasource.name.replace('tzkt_',''), address= governance_address)
        governance_financial    = await models.GovernanceFinancial.get(network=ctx.datasource.name.replace('tzkt_',''), address= financial_address)
        await models.GovernanceFinancialRequest.filter(
            governance_financial    = governance_financial,
            internal_id             = request_id
        ).update(
            executed              = executed,
            yay_vote_smvk_total   = yay_smvk_total,
            nay_vote_smvk_total   = nay_smvk_total,
            pass_vote_smvk_total  = pass_smvk_total
        )
        if executed:
            await models.GovernanceFinancialRequest.filter(
                governance_financial    = governance_financial,
                internal_id             = request_id
            ).update(
                execution_datetime    = execution_datetime
            )
    
        voter                   = await models.mavryk_user_cache.get(network=ctx.datasource.name.replace('tzkt_',''), address=voter_address)
    
        # Register vote
        satellite_snapshot, _   = await models.GovernanceSatelliteSnapshot.get_or_create(
            governance  = governance,
            user        = voter,
            cycle       = governance.cycle_id
        )
        await satellite_snapshot.save()
        financial_request       = await models.GovernanceFinancialRequest.get(
            governance_financial    = governance_financial,
            internal_id             = request_id
        )
        vote_record, _          = await models.GovernanceFinancialRequestVote.get_or_create(
            governance_financial_request    = financial_request,
            voter                           = voter,
            satellite_snapshot              = satellite_snapshot
        )
        vote_record.timestamp               = timestamp
        vote_record.vote                    = vote_type
        await vote_record.save()

    except BaseException as e:
        await save_error_report(e)

