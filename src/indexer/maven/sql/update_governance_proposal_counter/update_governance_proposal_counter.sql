UPDATE satellite 
   SET governance_proposal_counter = governance_proposal_counter + 1
WHERE currently_registered = true
AND status = 0;
