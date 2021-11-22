function requestHandler(request)
	data = "";
	responseCode = 200;
	
	try   
		action = request.URLParameters.Get("action");
		
		if not ValueIsFilled(action) then
			data = integrationFunctions.errorMessage("action is empty"); 
		elsif action = "GetListClients" then
			data = integrationFunctions.getClientsList();
		elsif action = "GetListOrders" then 
			jsonParams = request.GetBodyAsString();
			if ValueIsFilled(jsonParams) then
				params = parseRequestParams(jsonParams);    
						
				data = integrationFunctions.getOrdersList(params);		
			else
				data = integrationFunctions.errorMessage("request params is empty");
			endif;
		elsif action = "GetListClinics" then
			data = integrationFunctions.getClinicsList();
		elsif action = "GetListEmployees" then
			data = integrationFunctions.getEmployeesList();//not used now
		elsif action = "GetSchedule" then    
			jsonParams = request.GetBodyAsString();
			if ValueIsFilled(jsonParams) then
				params = parseRequestParams(jsonParams);    
				
				//start = CurrentDate();     //test value
				//end = start + 60*60*24*30; //test value
                start = ToLocalTime('19700101' + params.startDate);
				end = ToLocalTime('19700101' + params.finishDate);
		              
				data = integrationFunctions.getSchedule(start, end);
			else
				data = integrationFunctions.errorMessage("request params is empty");
			endif;
		elsif action = "CreateOrder" then    
			jsonParams = request.GetBodyAsString();
			if ValueIsFilled(jsonParams) then
				params = parseRequestParams(jsonParams);    
						
				data = integrationFunctions.createOrder(params);		
			else
				data = integrationFunctions.errorMessage("request params is empty");
			endif;  
		elsif action = "CancelOrder" then    
			jsonParams = request.GetBodyAsString();
			if ValueIsFilled(jsonParams) then
				params = parseRequestParams(jsonParams);    
						
				data = integrationFunctions.cancelOrder(params);		
			else
				data = integrationFunctions.errorMessage("request params is empty");
			endif;
		elsif action = "UpdateClient" then    
			jsonParams = request.GetBodyAsString();
			if ValueIsFilled(jsonParams) then
				params = parseRequestParams(jsonParams);    
						
				data = integrationFunctions.updateClient(params);		
			else
				data = integrationFunctions.errorMessage("request params is empty");
			endif; 	
	    else
			data = integrationFunctions.errorMessage("Аction - " + action + " - not found");
			responseCode = 404;
		endif; 
	except
		data = integrationFunctions.errorMessage(ErrorDescription());
		responseCode = 400;
	endtry;	
	
	JSONWriter = new JSONWriter;
	JSONWriter.SetString();
	WriteJSON(JSONWriter, data);
	json = JSONWriter.Close();
	
	response = new HTTPServiceResponse(responseCode);
	response.SetBodyFromString(json, TextEncoding.UTF8);
	response.Headers.Insert("Content-Type","application/json; charset=utf-8");  
	return response;
endFunction    

function parseRequestParams(jsonParams)
	json = new JSONReader;
	json.SetString(jsonParams);
	params = ReadJSON(json, false);
	json.Close();
	return params;
endFunction	
