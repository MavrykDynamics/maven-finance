import { TabId } from '../Dashboard.controller'
import { FarmsTab } from './FarmsTab.controller'
import { LendingTab } from './LendingTab.controller'
import { OraclesTab } from './OraclesTab.controller'
import { SatellitesTab } from './SatellitesTab.controller'
import { TreasuryTab } from './TreasuryTab.controller'
import { VaultsTab } from './VaultsTab.controller'

type DashboardTabProps = {
  activeTab: TabId
}

export const DashboardTab = ({ activeTab }: DashboardTabProps) => {
  return (
    <>
      {activeTab === 'farms' ? <FarmsTab /> : null}
      {activeTab === 'lending' ? <LendingTab /> : null}
      {activeTab === 'oracles' ? <OraclesTab /> : null}
      {activeTab === 'satellites' ? <SatellitesTab /> : null}
      {activeTab === 'vaults' ? <VaultsTab /> : null}
      {activeTab === 'treasury' ? <TreasuryTab /> : null}
    </>
  )
}
