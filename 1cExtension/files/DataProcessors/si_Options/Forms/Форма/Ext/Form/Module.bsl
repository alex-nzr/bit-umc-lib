 &AtClient
procedure save(event)
	saveOptions();
	
endProcedure

 &AtServer  
 procedure saveOptions()  
	 
	clinics = new array;
	for each clinic in clinicsList do
		index = clinics.Find(clinic.Value);
		if index <> undefined or not valueIsFilled(clinic.Value) then
			continue;
		else
			clinics.add(clinic.Value);
		endif;                    
	enddo;       
	
	timeTypes = new array;
	for each type in typeOfScheduleTimeList do 
		index = timeTypes.Find(type.Value);
		if index <> undefined or not valueIsFilled(type.Value) then
			continue;
		else
			timeTypes.add(type.Value);
		endif; 
	enddo;
		                              
	integrationFunctions.setIntegrationOptions(
		domen, 
		handler, 
		syncPersonalData, 
		autoSyncClients,
		needAuth,
		login,
		password,
		clinics,
		timeTypes
	);              
endProcedure

procedure ПриСозданииНаСервере(cancel, standartProcessing)
	try
		Options = integrationFunctions.getIntegrationOptions(); 
	        
		if not Options = undefined and TypeOf(Options) = Type("Structure") then
			if Options.property("syncPersonalData") then
				syncPersonalData =  Options.syncPersonalData;
			endif;	 
			
			if Options.property("domen") then
				domen =  Options.domen; 
			endif;
			
			if Options.property("handler") then
				handler =  Options.handler;	
			endif;
			
			if Options.property("autoSyncClients") then
				autoSyncClients = Options.autoSyncClients;	
			endif;
			
			if Options.property("needAuth") then
				needAuth = Options.needAuth;	
			endif;
			
			if Options.property("login") then
				login = Options.login;	
			endif;
			
			if Options.property("password") then
				password = Options.password;	
			endif; 
			
			if Options.property("allowedClinics") and typeOf(Options.allowedClinics) = Type("Array") then
				for i = 0 to Options.allowedClinics.count() - 1 do
					clinicsList.Insert(i,Options.allowedClinics[i]);                    
				enddo;
			endif;
			
			if Options.property("allowedTypesOfTime") and typeOf(Options.allowedTypesOfTime) = Type("Array") then 
				for i = 0 to Options.allowedTypesOfTime.count() - 1 do
					typeOfScheduleTimeList.Insert(i, Options.allowedTypesOfTime[i]);                    
				enddo;
			endif;
		else
			message("Не найдено сохранённых настроек. Заполните данные и нажмите Сохранить");
		endif;	
	except
		message(errorDescription());	
	endtry;	
endProcedure


