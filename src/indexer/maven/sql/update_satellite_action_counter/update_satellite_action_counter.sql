UPDATE satellite 
   SET satellite_action_counter = satellite_action_counter + 1
WHERE currently_registered = true
AND status = 0;
