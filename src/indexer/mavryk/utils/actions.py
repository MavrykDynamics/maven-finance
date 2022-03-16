from dateutil import parser
import mavryk.models as models

async def persist_council_action(action):
    # Get operation values
    councilAddress                  = action.data.target_address
    councilActionRecordDiff         = action.data.diffs[-1]['content']['value']
    councilActionType               = councilActionRecordDiff['actionType']
    councilActionInitiator          = councilActionRecordDiff['initiator']
    councilActionStartDate          = parser.parse(councilActionRecordDiff['startDateTime'])
    councilActionExecutedDate       = parser.parse(councilActionRecordDiff['executedDateTime'])
    councilActionExpirationDate     = parser.parse(councilActionRecordDiff['expirationDateTime'])
    councilActionStatus             = councilActionRecordDiff['status']
    councilActionExecuted           = councilActionRecordDiff['executed']
    councilActionSigners            = councilActionRecordDiff['signers']
    councilActionAddressParams      = councilActionRecordDiff['addressMap']
    councilActionStringParams       = councilActionRecordDiff['stringMap']
    councilActionNatParams          = councilActionRecordDiff['natMap']

    # Create and update records
    recordStatus    = models.ActionStatus.PENDING
    if councilActionStatus == 'FLUSHED':
        recordStatus    = models.ActionStatus.FLUSHED
    elif councilActionStatus == 'EXECUTED':
        recordStatus    = models.ActionStatus.EXECUTED
    elif councilActionStatus == 'EXPIRED':
        recordStatus    = models.ActionStatus.EXPIRED

    council = await models.Council.get(
        address = councilAddress
    )
    actionID                = council.action_counter
    council.action_counter  += 1
    await council.save()

    initiator, _ = await models.MavrykUser.get_or_create(
        address = councilActionInitiator
    )
    await initiator.save()

    councilActionRecord = models.CouncilActionRecord(
        id                              = actionID,
        council                         = council,
        initiator                       = initiator,
        start_datetime                  = councilActionStartDate,
        executed_datetime               = councilActionExecutedDate,
        expiration_datetime             = councilActionExpirationDate,
        action_type                     = councilActionType,
        status                          = recordStatus,
        executed                        = councilActionExecuted,
    )
    await councilActionRecord.save()

    # Parameters
    for key in councilActionAddressParams:
        value   = councilActionAddressParams[key]
        councilActionRecordParameter    = models.CouncilActionRecordParameter(
            council_action_record   = councilActionRecord,
            name                    = key,
            value                   = value
        )
        await councilActionRecordParameter.save()

    for key in councilActionStringParams:
        value   = councilActionStringParams[key]
        councilActionRecordParameter    = models.CouncilActionRecordParameter(
            council_action_record   = councilActionRecord,
            name                    = key,
            value                   = value
        )
        await councilActionRecordParameter.save()

    for key in councilActionNatParams:
        value   = councilActionNatParams[key]
        councilActionRecordParameter    = models.CouncilActionRecordParameter(
            council_action_record   = councilActionRecord,
            name                    = key,
            value                   = value
        )
        await councilActionRecordParameter.save()

    # Signers
    for signer in councilActionSigners:
        user, _ = await models.MavrykUser.get_or_create(
            address = signer
        )
        await user.save()
        councilActionRecordSigner = models.CouncilActionRecordSigner(
            signer                  = user,
            council_action_record   = councilActionRecord
        )
        await councilActionRecordSigner.save()

async def persist_break_glass_action(action):
    # Get operation values
    breakGlassAddress                  = action.data.target_address
    breakGlassActionRecordDiff         = action.data.diffs[-1]['content']['value']
    breakGlassActionType               = breakGlassActionRecordDiff['actionType']
    breakGlassActionInitiator          = breakGlassActionRecordDiff['initiator']
    breakGlassActionStartDate          = parser.parse(breakGlassActionRecordDiff['startDateTime'])
    breakGlassActionExecutedDate       = parser.parse(breakGlassActionRecordDiff['executedDateTime'])
    breakGlassActionExpirationDate     = parser.parse(breakGlassActionRecordDiff['expirationDateTime'])
    breakGlassActionStatus             = breakGlassActionRecordDiff['status']
    breakGlassActionExecuted           = breakGlassActionRecordDiff['executed']
    breakGlassActionSigners            = breakGlassActionRecordDiff['signers']
    breakGlassActionAddressParams      = breakGlassActionRecordDiff['addressMap']
    breakGlassActionStringParams       = breakGlassActionRecordDiff['stringMap']
    breakGlassActionNatParams          = breakGlassActionRecordDiff['natMap']

    # Create and update records
    recordStatus    = models.ActionStatus.PENDING
    if breakGlassActionStatus == 'FLUSHED':
        recordStatus    = models.ActionStatus.FLUSHED
    elif breakGlassActionStatus == 'EXECUTED':
        recordStatus    = models.ActionStatus.EXECUTED
    elif breakGlassActionStatus == 'EXPIRED':
        recordStatus    = models.ActionStatus.EXPIRED

    breakGlass = await models.BreakGlass.get(
        address = breakGlassAddress
    )
    actionID                = breakGlass.action_counter
    breakGlass.action_counter  += 1
    await breakGlass.save()

    initiator, _ = await models.MavrykUser.get_or_create(
        address = breakGlassActionInitiator
    )
    await initiator.save()

    breakGlassActionRecord = models.BreakGlassActionRecord(
        id                              = actionID,
        break_glass                     = breakGlass,
        initiator                       = initiator,
        start_datetime                  = breakGlassActionStartDate,
        executed_datetime               = breakGlassActionExecutedDate,
        expiration_datetime             = breakGlassActionExpirationDate,
        action_type                     = breakGlassActionType,
        status                          = recordStatus,
        executed                        = breakGlassActionExecuted,
    )
    await breakGlassActionRecord.save()

    # Parameters
    for key in breakGlassActionAddressParams:
        value   = breakGlassActionAddressParams[key]
        breakGlassActionRecordParameter    = models.BreakGlassActionRecordParameter(
            break_glass_action_record   = breakGlassActionRecord,
            name                    = key,
            value                   = value
        )
        await breakGlassActionRecordParameter.save()

    for key in breakGlassActionStringParams:
        value   = breakGlassActionStringParams[key]
        breakGlassActionRecordParameter    = models.BreakGlassActionRecordParameter(
            break_glass_action_record   = breakGlassActionRecord,
            name                    = key,
            value                   = value
        )
        await breakGlassActionRecordParameter.save()

    for key in breakGlassActionNatParams:
        value   = breakGlassActionNatParams[key]
        breakGlassActionRecordParameter    = models.BreakGlassActionRecordParameter(
            break_glass_action_record   = breakGlassActionRecord,
            name                    = key,
            value                   = value
        )
        await breakGlassActionRecordParameter.save()

    # Signers
    for signer in breakGlassActionSigners:
        user, _ = await models.MavrykUser.get_or_create(
            address = signer
        )
        await user.save()
        breakGlassActionRecordSigner = models.BreakGlassActionRecordSigner(
            signer                      = user,
            break_glass_action_record    = breakGlassActionRecord
        )
        await breakGlassActionRecordSigner.save()