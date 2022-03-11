
from mavryk.types.council.parameter.council_action_add_vestee import CouncilActionAddVesteeParameter
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.council.storage import CouncilStorage
from dateutil import parser 
import mavryk.models as models

async def on_council_council_action_add_vestee(
    ctx: HandlerContext,
    council_action_add_vestee: Transaction[CouncilActionAddVesteeParameter, CouncilStorage],
) -> None:
    # Get operation values
    councilAddress                  = council_action_add_vestee.data.target_address
    councilActionRecordDiff         = council_action_add_vestee.data.diffs[-1]['content']['value']
    councilActionType               = councilActionRecordDiff['actionType']
    councilActionInitiator          = councilActionRecordDiff['initiator']
    councilActionStartDate          = parser.parse(councilActionRecordDiff['startDateTime'])
    councilActionStartLevel         = councilActionRecordDiff['startLevel']
    councilActionExecutedDate       = parser.parse(councilActionRecordDiff['executedDateTime'])
    councilActionExecutedLevel      = councilActionRecordDiff['executedLevel']
    councilActionExpirationDate     = parser.parse(councilActionRecordDiff['expirationDateTime'])
    councilActionStatus             = councilActionRecordDiff['status']
    councilActionExecuted           = councilActionRecordDiff['executed']
    
    councilActionNewVestee          = councilActionRecordDiff['address_param_1']
    councilActionTotalAllocated     = int(councilActionRecordDiff['nat_param_1'])
    councilActionCliffInMonths      = int(councilActionRecordDiff['nat_param_2'])
    councilActionVestingInMonths    = int(councilActionRecordDiff['nat_param_3'])

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

    initiator, _ = await models.MavrykUser.get_or_create(
        address = councilActionInitiator
    )

    councilActionRecord = models.CouncilActionRecord(
        council                         = council,
        initiator                       = initiator,
        start_datetime                  = councilActionStartDate,
        start_level                     = councilActionStartLevel,
        executed_datetime               = councilActionExecutedDate,
        executed_level                  = councilActionExecutedLevel,
        expiration_datetime             = councilActionExpirationDate,
        action_type                     = councilActionType,
        status                          = recordStatus,
        executed                        = councilActionExecuted,
        address_param_1                 = councilActionNewVestee,
        nat_param_1                     = councilActionTotalAllocated,
        nat_param_2                     = councilActionCliffInMonths,
        nat_param_3                     = councilActionVestingInMonths,
    )
    await councilActionRecord.save()
