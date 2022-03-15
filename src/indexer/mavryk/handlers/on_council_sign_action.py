
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
    councilAddress                  = sign_action.data.target_address
    signerAddress                   = sign_action.data.sender_address
    councilRecordID                 = int(sign_action.parameter.__root__)
    councilActionLedger             = sign_action.storage.councilActionsLedger

    # Update action records
    for key in councilActionLedger:
        actionRecord                    = councilActionLedger[key]
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

        councilRecord   = await models.CouncilActionRecord.get(
            id  = key
        )
        councilRecord.executed_datetime = actionRecordExecutedTimestamp
        councilRecord.executed          = actionRecordExecuted
        councilRecord.status            = recordStatus
        await councilRecord.save()

        # Change Members
        if councilRecord.executed:
            council  = await models.Council.get(
                address = councilAddress
            )
            if councilRecord.action_type == 'changeCouncilMember':
                newCouncilMemberAddress    = sign_action.data.diffs[-1]['content']['value']['addressMap']['newCouncilMemberAddress']
                oldCouncilMemberAddress    = sign_action.data.diffs[-1]['content']['value']['addressMap']['oldCouncilMemberAddress']

                oldMember, _    = await models.MavrykUser.get_or_create(
                    address = oldCouncilMemberAddress
                )
                oldMember.council   = None
                await oldMember.save()

                newMember, _    = await models.MavrykUser.get_or_create(
                    address = newCouncilMemberAddress
                )
                newMember.council   = council
                await newMember.save()
            
            elif councilRecord.action_type == 'addCouncilMember':
                councilMemberAddress    = sign_action.data.diffs[-1]['content']['value']['addressMap']['councilMemberAddress']
                councilMember, _    = await models.MavrykUser.get_or_create(
                    address = councilMemberAddress
                )
                councilMember.council   = council
                await councilMember.save()
            elif councilRecord.action_type == 'removeCouncilMember':
                councilMemberAddress    = sign_action.data.diffs[-1]['content']['value']['addressMap']['councilMemberAddress']
                councilMember, _    = await models.MavrykUser.get_or_create(
                    address = councilMemberAddress
                )
                councilMember.council   = None
                await councilMember.save()            
        

    # Sign action record
    signedActionRecord  = await models.CouncilActionRecord.get(
        id  = councilRecordID
    )

    signer, _  = await models.MavrykUser.get_or_create(
        address = signerAddress
    )
    await signer.save()

    councilRecordSigners    = models.CouncilActionRecordSigner(
        council_action_record   = signedActionRecord,
        signer                  = signer
    )
    await councilRecordSigners.save()
