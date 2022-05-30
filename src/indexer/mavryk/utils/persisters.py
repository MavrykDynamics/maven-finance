from dateutil import parser
import mavryk.models as models

###
#
# PERSIST ACTIONS
#
###
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
    councilActionCounter            = int(action.storage.actionCounter)

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
    council.action_counter      = councilActionCounter
    actionID                    = councilActionCounter - 1
    await council.save()

    initiator, _ = await models.MavrykUser.get_or_create(
        address = councilActionInitiator
    )
    await initiator.save()

    councilActionRecord = await models.CouncilActionRecord.get_or_none(
        id                              = actionID
    )
    if councilActionRecord == None:
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
    breakGlassActionNatParams          = breakGlassActionRecordDiff['natMap']
    breakGlassActionCounter            = int(action.storage.actionCounter)

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
    breakGlass.action_counter   = breakGlassActionCounter
    actionID                    = breakGlassActionCounter - 1
    await breakGlass.save()

    initiator, _ = await models.MavrykUser.get_or_create(
        address = breakGlassActionInitiator
    )
    await initiator.save()

    breakGlassActionRecord = await models.BreakGlassActionRecord.get_or_none(
        id                              = actionID
    )
    if breakGlassActionRecord == None:
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
                name                        = key,
                value                       = value
            )
            await breakGlassActionRecordParameter.save()

        for key in breakGlassActionNatParams:
            value   = breakGlassActionNatParams[key]
            breakGlassActionRecordParameter    = models.BreakGlassActionRecordParameter(
                break_glass_action_record   = breakGlassActionRecord,
                name                        = key,
                value                       = value
            )
            await breakGlassActionRecordParameter.save()

        # Signers
        for signer in breakGlassActionSigners:
            user, _ = await models.MavrykUser.get_or_create(
                address = signer
            )
            await user.save()
            breakGlassActionRecordSigner = models.BreakGlassActionRecordSigner(
                signer                          = user,
                break_glass_action_record       = breakGlassActionRecord
            )
            await breakGlassActionRecordSigner.save()

async def persist_financial_request(action):
    # Get operation values
    financialAddress        = action.data.target_address
    requestLedger           = action.storage.financialRequestLedger
    requestCounter          = int(action.storage.financialRequestCounter)

    # Create record
    governanceFinancial     = await models.GovernanceFinancial.get(
        address = financialAddress
    )
    governanceFinancial.fin_req_counter = requestCounter
    await governanceFinancial.save()

    for requestID in requestLedger:
        requestRecord       = await models.GovernanceFinancialRequestRecord.get_or_none(
            id  = int(requestID)
        )
        if requestRecord == None:
            requestRecordStorage            = requestLedger[requestID]
            treasuryAddress                 = requestRecordStorage.treasuryAddress
            requesterAddress                = requestRecordStorage.requesterAddress
            request_type                    = requestRecordStorage.requestType
            status                          = requestRecordStorage.status
            statusType                      = models.GovernanceRecordStatus.ACTIVE
            if not status:
                statusType  = models.GovernanceRecordStatus.DROPPED
            executed                        = requestRecordStorage.executed
            token_contract_address          = requestRecordStorage.tokenContractAddress
            token_amount                    = float(requestRecordStorage.tokenAmount)
            token_name                      = requestRecordStorage.tokenName
            token_id                        = int(requestRecordStorage.tokenId)
            token_type                      = requestRecordStorage.tokenType
            key_hash                        = requestRecordStorage.keyHash
            request_purpose                 = requestRecordStorage.requestPurpose
            approve_vote_total              = float(requestRecordStorage.approveVoteTotal)
            disapprove_vote_total           = float(requestRecordStorage.disapproveVoteTotal)
            smvk_percentage_for_approval    = int(requestRecordStorage.stakedMvkPercentageForApproval)
            snapshot_smvk_total_supply      = float(requestRecordStorage.snapshotStakedMvkTotalSupply)
            smvk_required_for_approval      = float(requestRecordStorage.stakedMvkRequiredForApproval)
            expiration_datetime             = parser.parse(requestRecordStorage.expiryDateTime)
            requested_datetime              = parser.parse(requestRecordStorage.requestedDateTime)
            satellites_snapshot             = action.storage.financialRequestSnapshotLedger[requestID]

            treasury, _             = await models.Treasury.get_or_create(
                address     = treasuryAddress
            )
            await treasury.save()

            requester, _            = await models.MavrykUser.get_or_create(
                address = requesterAddress
            )
            requestRecord           = models.GovernanceFinancialRequestRecord(
                id                              = int(requestID),
                governance_financial            = governanceFinancial,
                treasury                        = treasury,
                requester                       = requester,
                request_type                    = request_type,
                status                          = statusType,
                token_type                      = token_type,
                key_hash                        = key_hash,
                executed                        = executed,
                token_contract_address          = token_contract_address,
                token_amount                    = token_amount,
                token_name                      = token_name,
                token_id                        = token_id,
                request_purpose                 = request_purpose,
                approve_vote_total              = approve_vote_total,
                disapprove_vote_total           = disapprove_vote_total,
                smvk_percentage_for_approval    = smvk_percentage_for_approval,
                snapshot_smvk_total_supply      = snapshot_smvk_total_supply,
                smvk_required_for_approval      = smvk_required_for_approval,
                expiration_datetime             = expiration_datetime,
                requested_datetime              = requested_datetime
            )
            await requestRecord.save()

            for satellite_address in satellites_snapshot:
                satellite_snapshot_record   = satellites_snapshot[satellite_address]
                user, _                     = await models.MavrykUser.get_or_create(
                    address = satellite_address
                )
                await user.save()
                satellite_snapshot, _   = await models.GovernanceFinancialRequestSatelliteSnapshotRecord.get_or_create(
                    governance_financial_request    = requestRecord,
                    user                            = user
                )
                satellite_snapshot.total_smvk_balance              = float(satellite_snapshot_record.totalMvkBalance)
                satellite_snapshot.total_delegated_amount          = float(satellite_snapshot_record.totalDelegatedAmount)
                satellite_snapshot.total_voting_power              = float(satellite_snapshot_record.totalVotingPower)
                await satellite_snapshot.save()

###
#
# PERSIST CONTRACTS
#
###
async def persist_general_contract(update_general_contracts):
    # Get operation info
    target_address          = update_general_contracts.data.target_address
    contract_address        = update_general_contracts.parameter.generalContractAddress
    contract_name           = update_general_contracts.parameter.generalContractName
    contract_in_storage     = contract_name in update_general_contracts.storage.generalContracts

    # Update general contracts record
    general_contract, _ = await models.GeneralContract.get_or_create(
        target_contract = target_address,
        contract_name   = contract_name
    )
    general_contract.contract_address   = contract_address

    if contract_in_storage:
        await general_contract.save()
    else:
        await general_contract.delete()

async def persist_whitelist_contract(update_whitelist_contracts):
    # Get operation info
    target_address          = update_whitelist_contracts.data.target_address
    contract_address        = update_whitelist_contracts.parameter.whitelistContractAddress
    contract_name           = update_whitelist_contracts.parameter.whitelistContractName
    contract_in_storage     = contract_name in update_whitelist_contracts.storage.whitelistContracts

    # Update general contracts record
    whitelist_contract, _ = await models.WhitelistContract.get_or_create(
        target_contract = target_address,
        contract_name   = contract_name
    )
    whitelist_contract.contract_address   = contract_address

    if contract_in_storage:
        await whitelist_contract.save()
    else:
        await whitelist_contract.delete()

async def persist_whitelist_token_contract(update_whitelist_token_contracts):
    # Get operation info
    target_address          = update_whitelist_token_contracts.data.target_address
    contract_address        = update_whitelist_token_contracts.parameter.tokenContractAddress
    contract_name           = update_whitelist_token_contracts.parameter.tokenContractName
    contract_in_storage     = contract_name in update_whitelist_token_contracts.storage.whitelistTokenContracts

    # Update general contracts record
    whitelist_token_contract, _ = await models.WhitelistTokenContract.get_or_create(
        target_contract = target_address,
        contract_name   = contract_name
    )
    whitelist_token_contract.contract_address   = contract_address

    if contract_in_storage:
        await whitelist_token_contract.save()
    else:
        await whitelist_token_contract.delete()

###
#
# PERSIST ADMIN/GOVERNANCE
#
###
async def persist_admin(set_admin,contract):
    # Get operation info
    admin_address   = set_admin.parameter.__root__
    contract.admin  = admin_address

    await contract.save()

async def persist_governance(set_governance,contract):
    # Get operation info
    governance_address      = set_governance.parameter.__root__
    governance              = await models.Governance.get(address = governance_address)
    contract.governance     = governance

    await contract.save()