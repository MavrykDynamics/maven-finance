// types
import {
  BreakGlassGraphQL,
  BreakGlassStatusGraphQL,
  WhitelistDevGraphQL,
} from '../../utils/TypesAndInterfaces/BreakGlass'

export const normalizeBreakGlass = (storage: BreakGlassGraphQL) => {
  const actionLedger = storage?.actions?.length
    ? storage?.actions.map((actionRecord) => {
        const signers = actionRecord.signers?.length
          ? actionRecord.signers.map((signer) => {
              return {
                breakGlassActionRecordId: signer.break_glass_action_id,
                id: signer.id,
                signerId: signer.signer_id,
              }
            })
          : []

        return {
          actionType: actionRecord.action_type,
          breakGlassId: actionRecord.break_glass_id,
          executed: actionRecord.executed,
          expirationDatetime: new Date(actionRecord.expiration_datetime as string),
          id: actionRecord.id,
          initiatorId: actionRecord.initiator_id,
          startDatetime: new Date(actionRecord.start_datetime as string),
          status: actionRecord.status,
          signers,
          signersCount: actionRecord.signers_count,
        }
      })
    : []

  return {
    address: storage?.address,
    admin: storage?.admin,
    governanceId: storage?.governance_id,
    config: {
      threshold: storage?.threshold,
      actionExpiryDays: storage?.action_expiry_days,
      councilMemberNameMaxLength: storage?.council_member_name_max_length,
      councilMemberImageMaxLength: storage?.council_member_image_max_length,
      councilMemberWebsiteMaxLength: storage?.council_member_website_max_length,
    },
    actionCounter: storage?.action_counter,
    glassBroken: storage?.glass_broken,
    actionLedger,
  }
}

export function normalizeWhitelistDev(storage: WhitelistDevGraphQL) {
  return storage?.developer?.address ?? ''
}

export function normalizeBreakGlassStatus(storage: BreakGlassStatusGraphQL) {
  return [
    // doorman
    ...(storage?.doorman?.length
      ? [
          storage.doorman.map((item) => {
            return {
              title: 'Doorman',
              type: 'General Contracts',
              address: item.address,
              admin: item.admin,
              methods: {
                compound: item.compound_paused,
                'farm claimed': item.farm_claimed_paused,
                unstake: item.unstake_paused,
              },
            }
          }),
        ]
      : []),
    // delegation
    ...(storage?.delegation?.length
      ? [
          storage.delegation.map((item) => {
            return {
              title: 'Delegation',
              type: 'General Contracts',
              address: item.address,
              admin: item.admin,
              methods: {
                'delegate to satellite': item.delegate_to_satellite_paused,
                'distribute reward': item.distribute_reward_paused,
                'register as satellite': item.register_as_satellite_paused,
                'undelegate from satellite': item.undelegate_from_satellite_paused,
                'unregister as satellite': item.unregister_as_satellite_paused,
                'update satellite record': item.update_satellite_record_paused,
              },
            }
          }),
        ]
      : []),
    // farm_factory
    ...(storage?.farm_factory?.length
      ? [
          storage.farm_factory.map((item) => {
            return {
              title: 'Farm factory',
              type: 'Farms',
              address: item.address,
              admin: item.admin,
              methods: {
                'create farm': item.create_farm_paused,
                'track farm': item.track_farm_paused,
                'untrack farm': item.untrack_farm_paused,
              },
            }
          }),
        ]
      : []),
    // farm
    ...(storage?.farm?.length
      ? [
          storage.farm.map((item) => {
            return {
              title: item.name,
              type: 'Farms',
              address: item.address,
              admin: item.admin,
              methods: {
                claim: item.claim_paused,
                deposit: item.deposit_paused,
                withdraw: item.withdraw_paused,
              },
            }
          }),
        ]
      : []),
    // treasury
    ...(storage?.treasury?.length
      ? [
          storage.treasury.map((item) => {
            return {
              title: item.name,
              type: 'Treasury',
              address: item.address,
              admin: item.admin,
              methods: {
                'mint mvk and transfer': item.mint_mvk_and_transfer_paused,
                'stake mvk': item.stake_mvk_paused,
                transfer: item.transfer_paused,
                'unstake mvk': item.unstake_mvk_paused,
              },
            }
          }),
        ]
      : []),
    // treasury_factory
    ...(storage?.treasury_factory?.length
      ? [
          storage.treasury_factory.map((item) => {
            return {
              title: 'Treasury Factory',
              type: 'Treasury',
              address: item.address,
              admin: item.admin,
              methods: {
                'create treasury paused': item.create_treasury_paused,
                'track treasury paused': item.track_treasury_paused,
                'untrack treasury paused': item.untrack_treasury_paused,
              },
            }
          }),
        ]
      : []),
    // aggregator
    ...(storage?.aggregator?.length
      ? [
          storage.aggregator.map((item) => {
            return {
              title: `${item.name} Aggregator`,
              type: 'Oracles',
              address: item.address,
              admin: item.admin,
              methods: {
                'withdraw reward smvk paused': item.withdraw_reward_smvk_paused,
                'withdraw reward xtz paused': item.withdraw_reward_xtz_paused,
              },
            }
          }),
        ]
      : []),
    // aggregator_factory
    ...(storage?.aggregator_factory?.length
      ? [
          storage.aggregator_factory.map((item) => {
            return {
              title: 'Aggregator Factory',
              type: 'Oracles',
              address: item.address,
              admin: item.admin,
              methods: {
                'untrack aggregator paused': item.untrack_aggregator_paused,
                'track aggregator paused': item.track_aggregator_paused,
                'distribute reward xtz paused': item.distribute_reward_xtz_paused,
                'distribute reward smvk paused': item.distribute_reward_smvk_paused,
                'create aggregator paused': item.create_aggregator_paused,
              },
            }
          }),
        ]
      : []),
  ]
    .flat()
    .filter(Boolean)
}
