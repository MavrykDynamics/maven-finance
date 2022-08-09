
from lib2to3.pgen2 import token
from mavryk.types.governance.parameter.update_payment_data import UpdatePaymentDataParameter, TokenItem as fa12, TokenItem1 as fa2, TokenItem2 as tez
from dipdup.models import Transaction
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_governance_update_payment_data(
    ctx: HandlerContext,
    update_payment_data: Transaction[UpdatePaymentDataParameter, GovernanceStorage],
) -> None:

    # Get operation info
    governance_address  = update_payment_data.data.target_address
    proposal_id         = int(update_payment_data.parameter.proposalId)
    storage_proposal    = update_payment_data.storage.proposalLedger[update_payment_data.parameter.proposalId]
    payment_metadata    = storage_proposal.paymentMetadata
    title               = update_payment_data.parameter.title
    transaction         = update_payment_data.parameter.paymentTransaction
    receiver_address    = transaction.to_
    token               = transaction.token
    amount              = float(transaction.amount)
    
    # Fill parameters depending on the token type
    token_address       = ""
    token_id            = 0
    token_standard      = models.TokenType.OTHER
    if type(token) == fa12:
        token_standard  = models.TokenType.FA12
        token_address   = token.fa12
    elif type(token) == fa2:
        token_standard  = models.TokenType.FA2
        token_address   = token.fa2.tokenContractAddress
        token_id        = int(token.fa2.tokenId)
    elif type(token) == tez:
        token_standard  = models.TokenType.XTZ

    # Update or create record
    user, _         = await models.MavrykUser.get_or_create(address = receiver_address)
    await user.save()
    governance      = await models.Governance.get(address   = governance_address)
    proposal        = await models.GovernanceProposalRecord.get(
        id                  = proposal_id,
        governance          = governance
    )
    payment_record  = await models.GovernanceProposalRecordPayment.get_or_none(
        governance_proposal_record  = proposal,
        title                       = title,
        to_                         = user,
        token_address               = token_address,
        token_id                    = token_id,
        token_standard              = token_standard,
        token_amount                = amount,
    )
    # Delete record if it already exists, else update or add it
    if payment_record:
        await payment_record.delete()
    else:
        # Get internal data id
        internal_id = 0
        for key in payment_metadata:
            if payment_metadata[key] and payment_metadata[key].title == title:
                int(key)
        payment_record, _     = await models.GovernanceProposalRecordPayment.get_or_create(
            governance_proposal_record  = proposal,
            record_internal_id          = internal_id,
            title                       = title
        )
        payment_record.to_                         = user
        payment_record.token_address               = token_address
        payment_record.token_id                    = token_id
        payment_record.token_standard              = token_standard
        payment_record.token_amount                = amount
        await payment_record.save()
