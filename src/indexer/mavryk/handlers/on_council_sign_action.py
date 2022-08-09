
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.council.parameter.sign_action import SignActionParameter
from mavryk.types.council.storage import CouncilStorage
from dateutil import parser
import mavryk.models as models

async def on_council_sign_action(
    ctx: HandlerContext,
    sign_action: Transaction[SignActionParameter, CouncilStorage],
) -> None:

    # Get operation values
    council_address         = sign_action.data.target_address
    signer_address          = sign_action.data.sender_address
    action_id               = int(sign_action.parameter.__root__)
    action_record_storage   = sign_action.storage.councilActionsLedger[sign_action.parameter.__root__]
    signer_count            = int(action_record_storage.signersCount)
    status                  = action_record_storage.status
    executed                = action_record_storage.executed
    executed_timestamp      = action_record_storage.executedDateTime
    executed_level          = int(action_record_storage.executedLevel)
    council_members         = sign_action.storage.councilMembers

    # Select correct status
    status_type = models.ActionStatus.PENDING
    if status == "FLUSHED":
        status_type = models.ActionStatus.FLUSHED
    elif status == "EXECUTED":
        status_type = models.ActionStatus.EXECUTED

    # Update record
    council = await models.Council.get(address  = council_address)
    action_record   = await models.CouncilActionRecord.get(
        council = council,
        id      = action_id
    )
    action_record.status            = status_type
    action_record.signers_count     = signer_count
    action_record.executed          = executed
    action_record.executed_datetime = parser.parse(executed_timestamp)
    action_record.executed_level    = executed_level
    await action_record.save()

    # Update the status if there are multiple records (flush)
    if len(sign_action.storage.councilActionsLedger) > 1:
        for single_action_id in sign_action.storage.councilActionsLedger:
            action_status           = sign_action.storage.councilActionsLedger[single_action_id].status
            single_action_record    = await models.CouncilActionRecord.get(
                council     = council,
                id          = single_action_id
            )
            status                  = action_status.status
            # Select correct status
            status_type = models.ActionStatus.PENDING
            if status == "FLUSHED":
                status_type = models.ActionStatus.FLUSHED
            elif status == "EXECUTED":
                status_type = models.ActionStatus.EXECUTED
            single_action_record.status            = status_type
            await single_action_record.save()

    # Update council members
    council_members_records         = await models.CouncilCouncilMember.all()
    for council_member_record in council_members_records:
        # Get user from council member
        member_user     = await council_member_record.user.first()
        
        # Check if remove
        if not member_user.address in council_members:
            await council_member_record.delete()
        else:
            # Change or update records
            member_info             = council_members[member_user.address]
            updated_member, _       = await models.CouncilCouncilMember.get_or_create(
                council     = council,
                user        = member_user
            )
            updated_member.name     = member_info.name
            updated_member.website  = member_info.website 
            updated_member.image    = member_info.image
            await updated_member.save() 
    
    # Create signature record
    user, _                 = await models.MavrykUser.get_or_create(address = signer_address)
    await user.save()
    signer_record           = await models.CouncilActionRecordSigner(
        council_action              = action_record,
        signer                      = user
    )
    await signer_record.save()
