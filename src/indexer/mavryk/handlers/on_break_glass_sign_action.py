
from dipdup.context import HandlerContext
from mavryk.types.break_glass.parameter.sign_action import SignActionParameter
from mavryk.types.break_glass.storage import BreakGlassStorage
from dipdup.models import Transaction
from dateutil import parser
import mavryk.models as models

async def on_break_glass_sign_action(
    ctx: HandlerContext,
    sign_action: Transaction[SignActionParameter, BreakGlassStorage],
) -> None:
    # Get operation values
    breakGlassAddress                   = sign_action.data.target_address
    signerAddress                       = sign_action.data.sender_address
    breakGlassRecordID                  = int(sign_action.parameter.__root__)
    breakGlassActionLedger              = sign_action.storage.actionsLedger

    # Update action records
    for key in breakGlassActionLedger:
        actionRecord                    = breakGlassActionLedger[key]
        actionRecordExecutedTimestamp   = parser.parse(actionRecord.executedDateTime)
        actionRecordExecuted            = actionRecord.executed
        actionRecordStatus              = actionRecord.status

        recordStatus    = models.ActionStatus.PENDING
        if actionRecordStatus == 'FLUSHED':
            recordStatus    = models.ActionStatus.FLUSHED
        elif actionRecordStatus == 'EXECUTED':
            recordStatus    = models.ActionStatus.EXECUTED
        elif actionRecordStatus == 'EXPIRED':
            recordStatus    = models.ActionStatus.EXPIRED

        breakGlassRecord   = await models.BreakGlassActionRecord.get(
            id  = key
        )
        breakGlassRecord.executed_datetime = actionRecordExecutedTimestamp
        breakGlassRecord.executed          = actionRecordExecuted
        breakGlassRecord.status            = recordStatus
        await breakGlassRecord.save()

        # Change Members
        if breakGlassRecord.executed:
            breakGlass  = await models.BreakGlass.get(
                address = breakGlassAddress
            )
            if breakGlassRecord.action_type == 'changeCouncilMember':
                newCouncilMemberAddress    = sign_action.data.diffs[-1]['content']['value']['addressMap']['newCouncilMemberAddress']
                oldCouncilMemberAddress    = sign_action.data.diffs[-1]['content']['value']['addressMap']['oldCouncilMemberAddress']

                oldMember, _    = await models.MavrykUser.get_or_create(
                    address = oldCouncilMemberAddress
                )
                oldMember.break_glass   = None
                await oldMember.save()

                newMember, _    = await models.MavrykUser.get_or_create(
                    address = newCouncilMemberAddress
                )
                newMember.break_glass   = breakGlass
                await newMember.save()
            elif breakGlassRecord.action_type == 'addCouncilMember':
                councilMemberAddress    = sign_action.data.diffs[-1]['content']['value']['addressMap']['councilMemberAddress']
                councilMember, _        = await models.MavrykUser.get_or_create(
                    address = councilMemberAddress
                )
                councilMember.break_glass   = breakGlass
                await councilMember.save()
            elif breakGlassRecord.action_type == 'removeCouncilMember':
                councilMemberAddress    = sign_action.data.diffs[-1]['content']['value']['addressMap']['councilMemberAddress']
                councilMember, _        = await models.MavrykUser.get_or_create(
                    address = councilMemberAddress
                )
                councilMember.break_glass   = None
                await councilMember.save()
            elif breakGlassRecord.action_type == 'removeBreakGlassControl':
                breakGlass = await models.BreakGlass.get(
                    address = breakGlassAddress
                )
                breakGlassGlassBroken       = sign_action.storage.glassBroken
                breakGlass.glass_broken     = breakGlassGlassBroken
                await breakGlass.save()            
        

    # Sign action record
    signedActionRecord  = await models.BreakGlassActionRecord.get(
        id  = breakGlassRecordID
    )

    signer, _  = await models.MavrykUser.get_or_create(
        address = signerAddress
    )
    await signer.save()

    breakGlassRecordSigner      = models.BreakGlassActionRecordSigner(
        break_glass_action_record    = signedActionRecord,
        signer                      = signer
    )
    await breakGlassRecordSigner.save()
