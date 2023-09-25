from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.council.tezos_parameters.sign_action import SignActionParameter
from mavryk.types.council.tezos_storage import CouncilStorage
from dateutil import parser
import mavryk.models as models

async def sign_action(
    ctx: HandlerContext,
    sign_action: TzktTransaction[SignActionParameter, CouncilStorage],
) -> None:

    try:
        # Get operation values
        council_address         = sign_action.data.target_address
        signer_address          = sign_action.data.sender_address
        timestamp               = sign_action.data.timestamp
        action_id               = int(sign_action.parameter.__root__)
        action_record_storage   = sign_action.storage.councilActionsLedger[sign_action.parameter.__root__]
        signer_count            = int(action_record_storage.signersCount)
        status                  = action_record_storage.status
        executed                = action_record_storage.executed
        execution_datetime      = action_record_storage.executedDateTime
        if execution_datetime:
            execution_datetime  = parser.parse(execution_datetime)
        execution_level         = int(action_record_storage.executedLevel)
        council_members         = sign_action.storage.councilMembers
        council_size            = sign_action.storage.councilSize
    
        # Select correct status
        status_type = models.ActionStatus.PENDING
        if status == "FLUSHED":
            status_type = models.ActionStatus.FLUSHED
        elif status == "EXECUTED":
            status_type = models.ActionStatus.EXECUTED
    
        # Update record
        council = await models.Council.get(network=ctx.datasource.name.replace('tzkt_',''), address= council_address)
        council.council_size    = council_size
        await council.save()
        action_record   = await models.CouncilAction.get(
            council     = council,
            internal_id = action_id
        )
        action_record.council_size_snapshot = council.council_size
        action_record.status                = status_type
        if action_record.status == models.ActionStatus.FLUSHED:
            action_record.flushed_datetime  = timestamp
        action_record.signers_count         = signer_count
        action_record.executed              = executed
        action_record.execution_datetime    = execution_datetime
        action_record.execution_level       = execution_level
        await action_record.save()
    
        # Update the status if there are multiple records (flush)
        if len(sign_action.storage.councilActionsLedger) > 1:
            for single_action_id in sign_action.storage.councilActionsLedger:
                status                  = sign_action.storage.councilActionsLedger[single_action_id]
                # Select correct status
                status_type = models.ActionStatus.PENDING
                if status == "FLUSHED":
                    status_type = models.ActionStatus.FLUSHED
                elif status == "EXECUTED":
                    status_type = models.ActionStatus.EXECUTED
                await models.CouncilAction.filter(
                    council     = council,
                    internal_id = single_action_id
                ).update(
                    council_size_snapshot  = council.council_size,
                    status                 = status_type
                )
    
        # Delete previous members
        council_members_records         = await models.CouncilCouncilMember.all()
        for council_members_record in council_members_records:
            await council_members_record.delete()
    
        # Update council members
        council_members_records         = await models.CouncilCouncilMember.all()
        for council_member_address in council_members:
            # Change or update records
            member_info             = council_members[council_member_address]
            member_user             = await models.mavryk_user_cache.get(network=ctx.datasource.name.replace('tzkt_',''), address=council_member_address)
            updated_member, _       = await models.CouncilCouncilMember.get_or_create(
                council     = council,
                user        = member_user
            )
            updated_member.name     = member_info.name
            updated_member.website  = member_info.website 
            updated_member.image    = member_info.image
            await updated_member.save() 
        
        # Create signature record
        user                    = await models.mavryk_user_cache.get(network=ctx.datasource.name.replace('tzkt_',''), address=signer_address)
        signer_record           = await models.CouncilActionSigner(
            council_action              = action_record,
            signer                      = user
        )
        await signer_record.save()

    except BaseException as e:
        await save_error_report(e)

