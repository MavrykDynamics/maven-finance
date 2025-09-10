from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.types.break_glass.tezos_parameters.sign_action import SignActionParameter
from maven.types.break_glass.tezos_storage import BreakGlassStorage
from dipdup.models.tezos import TezosTransaction
from dateutil import parser
from maven import models as models

async def sign_action(
    ctx: HandlerContext,
    sign_action: TezosTransaction[SignActionParameter, BreakGlassStorage],
) -> None:

    try:
        # Get operation info
        break_glass_address     = sign_action.data.target_address
        signer_address          = sign_action.data.sender_address
        timestamp               = sign_action.data.timestamp
        action_id               = int(sign_action.parameter.root)
        action_record_storage   = sign_action.storage.actionsLedger[sign_action.parameter.root]
        signer_count            = int(action_record_storage.signersCount)
        status                  = action_record_storage.status
        action_type             = action_record_storage.actionType
        executed                = action_record_storage.executed
        execution_datetime      = action_record_storage.executedDateTime
        if execution_datetime:
            execution_datetime      = parser.parse(execution_datetime)
        execution_level         = action_record_storage.executedLevel
        if execution_level:
            execution_level     = int(action_record_storage.executedLevel)
        flushed_datetime        = None
        council_members         = sign_action.storage.councilMembers
        admin                   = sign_action.storage.admin
        glass_broken            = sign_action.storage.glassBroken
        council_size            = sign_action.storage.councilSize
    
        # Select correct status
        status_type = models.ActionStatus.PENDING
        if status == "FLUSHED":
            status_type = models.ActionStatus.FLUSHED
        elif status == "EXECUTED":
            status_type = models.ActionStatus.EXECUTED
    
        # Update record
        break_glass                 = await models.BreakGlass.get(network='atlasnet', address= break_glass_address)
        break_glass.admin           = admin
        break_glass.glass_broken    = glass_broken
        break_glass.council_size    = council_size
        await break_glass.save()
        action_record               = await models.BreakGlassAction.get(
            break_glass = break_glass,
            internal_id = action_id
        )
        action_record.council_size_snapshot = break_glass.council_size
        action_record.status                = status_type
        if action_record.status == models.ActionStatus.FLUSHED:
            action_record.flushed_datetime  = timestamp
        action_record.signers_count         = signer_count
        action_record.executed              = executed
        action_record.execution_datetime    = execution_datetime
        action_record.execution_level       = execution_level
        
        await action_record.save()
    
        # Update the status if there are multiple records (flush)
        if len(sign_action.storage.actionsLedger) > 1:
            for single_action_id in sign_action.storage.actionsLedger:
                action_status           = sign_action.storage.actionsLedger[single_action_id].status

                # Select correct status
                status_type = models.ActionStatus.PENDING
                if action_status == "FLUSHED":
                    status_type         = models.ActionStatus.FLUSHED
                    flushed_datetime    = timestamp
                elif action_status == "EXECUTED":
                    status_type = models.ActionStatus.EXECUTED
                await models.BreakGlassAction.filter(
                    break_glass = break_glass,
                    internal_id = single_action_id
                ).update(
                    council_size_snapshot   = break_glass.council_size,
                    status                  = status_type,
                    flushed_datetime        = flushed_datetime
                )
    
        # Process action and update council members
        if action_type == "addCouncilMember":
            for council_member_address in council_members:
                # Add record
                member_info             = council_members[council_member_address]
                member_user             = await models.get_user(network='atlasnet', address=council_member_address)
                updated_member, _       = await models.BreakGlassCouncilMember.get_or_create(
                    break_glass = break_glass,
                    user        = member_user
                )
                updated_member.name     = member_info.name
                updated_member.website  = member_info.website 
                updated_member.image    = member_info.image
                await updated_member.save() 
        elif action_type == "removeCouncilMember":
            break_glass_temp_member_parameter   = await models.BreakGlassActionTempMemberParameter.get(
                break_glass_action          = action_record
            )
            old_council_member_address      = break_glass_temp_member_parameter.old_council_member_address
            old_council_member_user         = await models.get_user(network='atlasnet', address=old_council_member_address)
            old_council_member              = await models.BreakGlassCouncilMember.get(
                break_glass = break_glass,
                user        = old_council_member_user
            )
            await old_council_member.delete()
            await break_glass_temp_member_parameter.delete()
        elif action_type == "changeCouncilMember":
            break_glass_temp_member_parameter   = await models.BreakGlassActionTempMemberParameter.get(
                break_glass_action          = action_record
            )
            old_council_member_address      = break_glass_temp_member_parameter.old_council_member_address
            old_council_member_user         = await models.get_user(network='atlasnet', address=old_council_member_address)
            old_council_member              = await models.BreakGlassCouncilMember.get(
                break_glass = break_glass,
                user        = old_council_member_user
            )
            await old_council_member.delete()
            await break_glass_temp_member_parameter.delete()
            for council_member_address in council_members:
                # Change record
                member_info             = council_members[council_member_address]
                member_user             = await models.get_user(network='atlasnet', address=council_member_address)
                updated_member, _       = await models.BreakGlassCouncilMember.get_or_create(
                    break_glass = break_glass,
                    user        = member_user
                )
                updated_member.name     = member_info.name
                updated_member.website  = member_info.website 
                updated_member.image    = member_info.image
                await updated_member.save() 
        
        # Create signature record
        user                    = await models.get_user(network='atlasnet', address=signer_address)
        signer_record           = models.BreakGlassActionSigner(
            break_glass_action          = action_record,
            signer                      = user
        )
        await signer_record.save()

    except BaseException as e:
        await save_error_report(e)

