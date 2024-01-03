UPDATE satellite 
   SET financial_request_counter = financial_request_counter + 1
WHERE currently_registered = true
AND status = 0;
