import React, { useEffect, useMemo, useState } from "react";
/* @ts-ignore */
import Time from "react-pure-time";

// actions, consts
import { getTimestampByLevel } from "../Governance/Governance.actions";
import {
  calculateSlicePositions,
  EMERGENCY_GOVERNANCE_LIST_NAME,
} from "pages/FinacialRequests/Pagination/pagination.consts";

// types
import type { EmergencyGovernanceLedgerType } from "./EmergencyGovernance.controller";

// components
import Icon from "../../app/App.components/Icon/Icon.view";

import { ACTION_PRIMARY } from "../../app/App.components/Button/Button.constants";
import { Button } from "../../app/App.components/Button/Button.controller";
import { ConnectWallet } from "../../app/App.components/ConnectWallet/ConnectWallet.controller";
import { FAQLink } from "../Satellites/SatellitesSideBar/SatelliteSideBar.style";
import { EGovHistoryCard } from "./EGovHistoryCard/EGovHistoryCard.controller";
import {
  CardContent,
  CardContentLeftSide,
  CardContentRightSide,
  EmergencyGovernanceCard,
  EmergencyGovernHistory,
  CardContentVoiting,
} from "./EmergencyGovernance.style";
import { EmergencyGovernancePastProposal } from "./mockEGovProposals";
import { VotingArea } from "../Governance/VotingArea/VotingArea.controller";
import { ProposalRecordType } from "../../utils/TypesAndInterfaces/Governance";
import { VoteStatistics } from "../Governance/Governance.controller";
import Pagination from "pages/FinacialRequests/Pagination/Pagination.view";
import { getPageNumber } from "pages/FinacialRequests/FinancialRequests.helpers";
import { useLocation } from "react-router";

type Props = {
  ready: boolean;
  loading: boolean;
  accountPkh?: any;
  emergencyGovernanceActive: boolean;
  glassBroken: boolean;
  handleVoteForEmergencyProposal: () => void;
  handleTriggerEmergencyProposal: () => void;
  handleProposalRoundVote: (proposalId: number) => void;
  handleVotingRoundVote: (vote: string) => void;
  pastProposals: EmergencyGovernancePastProposal[];
  selectedProposal: ProposalRecordType;
  voteStatistics: VoteStatistics;
  emergencyGovernanceLedger: EmergencyGovernanceLedgerType[];
};

export const EmergencyGovernanceView = ({
  ready,
  loading,
  accountPkh,
  emergencyGovernanceActive,
  glassBroken,
  handleVoteForEmergencyProposal,
  handleTriggerEmergencyProposal,
  pastProposals,
  handleProposalRoundVote,
  handleVotingRoundVote,
  selectedProposal,
  voteStatistics,
  emergencyGovernanceLedger,
}: Props) => {
  const [votingEnding, setVotingEnding] = useState<string>("");

  const handleGetTimestampByLevel = async (level: number) => {
    const res = await getTimestampByLevel(level);
    setVotingEnding(res);
  };

  useEffect(() => {
    handleGetTimestampByLevel(selectedProposal?.currentCycleEndLevel ?? 0);
  }, [selectedProposal?.currentCycleEndLevel]);
  const timeNow = Date.now();
  const votingTime = new Date(votingEnding).getTime();
  const isEndedVotingTime = votingTime < timeNow;

  const { pathname, search } = useLocation();
  const currentPage = getPageNumber(search, EMERGENCY_GOVERNANCE_LIST_NAME);

  const paginatedItemsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(
      currentPage,
      EMERGENCY_GOVERNANCE_LIST_NAME
    );
    return emergencyGovernanceLedger.slice(from, to);
  }, [currentPage, emergencyGovernanceLedger]);

  const emergencyGovernanceCardActive = (
    <EmergencyGovernanceCard>
      <a
        className="info-link"
        href="https://mavryk.finance/litepaper#governance"
        target="_blank"
        rel="noreferrer"
      >
        <Icon id="question" />
      </a>
      <CardContent>
        <CardContentLeftSide>
          <h1>{selectedProposal.title}</h1>
          {votingEnding ? (
            <b className="voting-ends">
              Voting {isEndedVotingTime ? "ended" : "ending"} in{" "}
              <Time value={votingEnding} format="H:m" /> hours
            </b>
          ) : null}
          <p>{selectedProposal.description}</p>
        </CardContentLeftSide>
        <CardContentRightSide>
          <CardContentVoiting>
            <VotingArea
              ready={ready}
              loading={loading}
              accountPkh={accountPkh}
              handleProposalRoundVote={handleProposalRoundVote}
              handleVotingRoundVote={handleVotingRoundVote}
              selectedProposal={selectedProposal}
              voteStatistics={voteStatistics}
            />
          </CardContentVoiting>
        </CardContentRightSide>
      </CardContent>
    </EmergencyGovernanceCard>
  );

  return (
    <>
      <EmergencyGovernanceCard>
        <h1>What is it?</h1>
        <div className="inner">
          Handles the event of fatal flaw discovered → hold an emergency
          governance vote to pause all entrypoints in main contracts and pass
          access to the break glass contract where further actions will be
          determined by the break glass council members using a multi-sig.{" "}
          <FAQLink>
            <a
              href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
              target="_blank"
              rel="noreferrer"
            >
              Read documentation here.
            </a>
          </FAQLink>
        </div>
      </EmergencyGovernanceCard>

      {/* {emergencyGovernanceActive && accountPkh ? (
        emergencyGovernanceCardActive
      ) : (
      )} */}
      <EmergencyGovernanceCard>
        <a
          className="info-link"
          href="https://mavryk.finance/litepaper#governance"
          target="_blank"
          rel="noreferrer"
        >
          <Icon id="question" />
        </a>
        <CardContent>
          <CardContentLeftSide>
            <h1>Trigger Emergency Governance Vote</h1>
            <p className="inner">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make ...
            </p>
          </CardContentLeftSide>
          <CardContentRightSide>
            {accountPkh ? (
              <Button
                text={"Trigger Vote"}
                kind={ACTION_PRIMARY}
                icon={"auction"}
                onClick={handleTriggerEmergencyProposal}
              />
            ) : (
              <ConnectWallet className="connect-wallet" type={"main-menu"} />
            )}
          </CardContentRightSide>
        </CardContent>
      </EmergencyGovernanceCard>

      <EmergencyGovernHistory>
        <h1>Emergency Governance History</h1>
        {paginatedItemsList.map((emergencyGovernance, index) => {
          return (
            <EGovHistoryCard
              key={emergencyGovernance.id}
              emergencyGovernance={emergencyGovernance}
            />
          );
        })}

        <Pagination
          itemsCount={emergencyGovernanceLedger.length}
          listName={EMERGENCY_GOVERNANCE_LIST_NAME}
        />
      </EmergencyGovernHistory>
    </>
  );
};
