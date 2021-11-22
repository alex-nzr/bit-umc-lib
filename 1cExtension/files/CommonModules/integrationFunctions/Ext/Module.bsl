//*************************************************************************//
//incoming requests********************************************************//
//*************************************************************************// 

function getClientsList(clientRef = false) export
	try    
		query = new Query;
		query.Text = 
		"ВЫБРАТЬ
		|	Clients.Ссылка КАК ref,
		|	Clients.Фамилия КАК surname,
		|	Clients.Имя КАК name,
		|	Clients.Отчество КАК middleName,
		|	Clients.ДатаРождения КАК birthday,
		|	Clients.СНИЛС КАК snils,
		|	Clients.ИНН КАК inn,
		|	Clients.Пол КАК gender,
		|	Clients.Фотография КАК avatar,
		|	Clients.isAppointmentBlocked КАК isAppointmentBlocked,
		|	contactInfo.Объект КАК contactRef,
		|	contactInfo.Представление КАК contactValue,
		|	contactInfo.Вид.Наименование КАК contactType
		|ИЗ
		|	Справочник.Клиенты КАК Clients
		|		ЛЕВОЕ СОЕДИНЕНИЕ РегистрСведений.КонтактнаяИнформация КАК contactInfo
		|		ПО Clients.Ссылка = contactInfo.Объект
		|			И (contactInfo.Вид.Наименование В (&contactTypes))
		|ГДЕ
		|	Clients.ПометкаУдаления = ЛОЖЬ
		|	И (&clientRef = ЛОЖЬ
		|			ИЛИ Clients.Ссылка = &clientRef)
		|
		|СГРУППИРОВАТЬ ПО
		|	Clients.Ссылка,
		|	Clients.Фамилия,
		|	Clients.Имя,
		|	Clients.Отчество,
		|	Clients.ДатаРождения,
		|	Clients.СНИЛС,
		|	Clients.ИНН,
		|	Clients.Пол,
		|	Clients.Фотография,
		|	contactInfo.Объект,
		|	contactInfo.Представление,
		|	Clients.isAppointmentBlocked,
		|	contactInfo.Вид.Наименование
		|
		|УПОРЯДОЧИТЬ ПО
		|	ref";
		
		query.SetParameter("contactTypes", getContactTypes());
		query.SetParameter("clientRef", clientRef);	
		res = query.Execute();
		              
		clients = new Array;
		if res.isEmpty() then    
			return errorMessage("Clients not found");
		else      
			
			isSyncPersonalData = false;
			Options = integrationFunctions.getIntegrationOptions(); 
			if not Options = undefined 
				and TypeOf(Options) = Type("Structure") 
				and Options.property("syncPersonalData") then
				
					isSyncPersonalData = Options.syncPersonalData;
			endif;

			
			selection = res.Select();      
			while selection.Next() Do    
				uid = XMLString(selection.ref.UUID());

				clientIndex = searchObjInArrayByUid(clients, uid);
				alreadyAdded = clientIndex >= 0 and typeOf(clientIndex) = type("Number");
				if alreadyAdded then 
					clients[clientIndex].contacts = createClientContacts(
						selection.contactType, 
						selection.contactValue, 
						isSyncPersonalData,
						clients[clientIndex].contacts
					);  
					continue;
				endif;
				
				client =  new structure;
								
				client.Insert("uid", uid);
				client.Insert("name", selection.name);
				client.Insert("surname", selection.surname);
				client.Insert("middlename", selection.middleName);  
				client.Insert("snils", selection.snils);
				
				if isSyncPersonalData then    
					client.Insert("inn", selection.inn);	  
					client.Insert("birthday", selection.birthday);    
					
					gender = "N";
					if selection.gender = Enums.ПолФизическихЛиц.Мужской then
						gender = "M";
					elsif selection.gender = Enums.ПолФизическихЛиц.Женский then 
						gender = "F";
					endif;	    
					client.Insert("gender", gender);     
					
					//client.Insert("avatar", selection.avatar);
				endif;
				
				if selection.isAppointmentBlocked = true then
					client.Insert("isAppointmentBlocked", "Y");
				else
					client.Insert("isAppointmentBlocked", "N");	
				endif;	
				
				client.insert("contacts", createClientContacts(selection.contactType, selection.contactValue, isSyncPersonalData));
				
				clients.Add(client);         
			endDo;	
		endif;         
		              
		return new Structure("clients", clients);   
    except
		return errorMessage(ErrorDescription());
	endtry;
endFunction	   
	
function getOrdersList(params) export  
	if not params.property("clientUid") then
		return errorMessage("Request param ""clientUid""  is empty");
	endif;
	
	clientUid = params.clientUid; 
	
	getChanges = false;
	if params.property("getChanges") then
		getChanges = params.getChanges;
	endif;
         
	try
		query = new Query;
		query.Text = 
				"ВЫБРАТЬ
				|	Заявка.Номер КАК orderNumber,
				|	Заявка.ВремяНачала КАК timeBegin,
				|	Заявка.ВремяОкончания КАК timeEnd,
				|	Заявка.ДатаНачала КАК orderDate,
				|	Заявка.Примечание КАК orderNote,
				|	Заявка.Салон.Наименование КАК clinicName,
				|	Заявка.Салон.Ссылка КАК clinicRef,
				|	Заявка.Мастер.Наименование КАК doctorName,
				|	Заявка.Мастер.Специализация.Наименование КАК doctorSpecialty,
				|	Заявка.Мастер.Ссылка КАК doctorRef,
				|	Заявка.Клиент.Наименование КАК clientName,
				|	ПОДСТРОКА(Заявка.КомментарийКлиента, 1, 300) КАК clientComment,
				|	Заявка.Состояние.Наименование КАК orderState,
				|	Заявка.Клиент.ДатаРождения КАК clientBirthday,
				|	Заявка.Ссылка КАК orderRef
				|ИЗ
				|	Документ.Заявка КАК Заявка
				|ГДЕ
				|	Заявка.Клиент.Ссылка = &clientRef
				|	И (&getChanges = ЛОЖЬ
				|			ИЛИ НЕ Заявка.Ссылка В
				|					(ВЫБРАТЬ
				|						syncOrders.orderRef
				|					ИЗ
				|						РегистрСведений.synchronized_orders КАК syncOrders
				|					ГДЕ
				|						syncOrders.orderRef.Клиент.Ссылка = &clientRef))
				|	И Заявка.ПометкаУдаления = ЛОЖЬ";
		
		clientRef = Catalogs.Клиенты.GetRef(new UUID(clientUid));
		
		query.SetParameter("clientRef", clientRef);
		query.SetParameter("getChanges", getChanges);
		
		res = query.Execute();
		              
		orders = new Array;  
		if res.isEmpty() and getChanges = false then    
			return errorMessage("Orders not found");
		else
			selection = res.Select();      
			while selection.Next() Do    
				order =  new Structure;    
				
				orderUid = XMLString(selection.orderRef.UUID());
				order.Insert("orderUid", orderUid);
				
				clinicUid = XMLString(selection.clinicRef.UUID());
				order.Insert("clinicUid", clinicUid); 
				
				doctorUid = XMLString(selection.doctorRef.UUID());
				order.Insert("doctorUid", doctorUid);
				
				order.Insert("clientPhone", getClientPhoneByRef(clientRef));
				
				order.Insert("orderNumber", selection.orderNumber);
				order.Insert("orderDate", selection.orderDate); 
				order.Insert("timeBegin", selection.timeBegin);
				order.Insert("timeEnd", selection.timeEnd);
				order.Insert("orderState", selection.orderState);
				order.Insert("orderNote", selection.orderNote);
				order.Insert("clinicName", selection.clinicName);
				order.Insert("doctorName", selection.doctorName);
				order.Insert("doctorSpecialty", selection.doctorSpecialty);  
				order.Insert("clientName", selection.clientName);
				order.Insert("clientBirthday", selection.clientBirthday);   
				order.Insert("clientComment", selection.orderNote +" "+ selection.clientComment);
								
				orders.Add(order); 
				
				recordManager = InformationRegisters.synchronized_orders.CreateRecordManager(); 
				recordManager.orderRef = selection.orderRef; 
				recordManager.write(); 
			endDo;	
		endif;         
		              
		return new Structure("orders", orders);
    except
		return errorMessage(ErrorDescription());
	endtry;
endFunction	   

function getClinicsList() export 
	try    
		query = new Query;
		query.Text = 
		"SELECT
		|	Салоны.Ссылка AS ref,
		|	Салоны.Наименование AS name
		|FROM
		|	Справочник.Салоны AS Салоны
		|WHERE
		|	Салоны.ПометкаУдаления = false
		|   AND Салоны.Ссылка IN (&allowedClinics)";
		
		allowedClinics = new array;
		Options = getIntegrationOptions(); 
		if not Options = undefined 
			and TypeOf(Options) = Type("Structure") 
			and Options.property("allowedClinics")
			and typeOf(Options.allowedClinics) = Type("Array") then
			
				allowedClinics = Options.allowedClinics;
		endif;
		
		query.SetParameter("allowedClinics", allowedClinics);
		
		res = query.Execute();
		              
		clinics = new Array;
		if res.isEmpty() then    
			return errorMessage("Clinics not found");
		else      
			selection = res.Select();      
			while selection.Next() Do    
				uid = XMLString(selection.ref.UUID());
				
				clinic =  new structure;				
				clinic.Insert("uid", uid);
				clinic.Insert("name", selection.name);
				
				clinics.Add(clinic);         
			endDo;	
		endif;         
		              
		return new Structure("clinics", clinics);   
    except
		return errorMessage(ErrorDescription());
	endtry;
endFunction	

function getSchedule(start, end) export  
	setCustomIntegrationFlag(true);
	xmlString = ВебИнтеграция.ПолучитьГрафикиРаботыXML(start, end, new Structure, true);
	xml = new XMLReader;
	xml.SetString(xmlString);
	schedule = convertXmlToObject(xml);           
	
	return schedule;	
endFunction	

function getEmployeesList() export
	xmlString = ВебИнтеграция.ПолучитьСписокСотрудниковXML();              
	xml = new XMLReader;
	xml.SetString(xmlString);
	object = convertXmlToObject(xml); 
	return object;
endFunction	

function createOrder(params) export
		
	targetStringID = params.refUid;   
	try
		targetUID = new UUID(targetStringID);
	except
		return errorMessage("Error on creating UUID. " + ErrorDescription());	
	endtry;

	target = Catalogs.Сотрудники.GetRef(targetUID);
	if IsBlankString(target.Код) then
		target = Catalogs.Оборудование.GetRef(targetUID);
		if IsBlankString(target.Код) then	
			return errorMessage("Target to appointment not found");	
		endif;
	endif;  
	
	date = Date(params.orderDate); 
	try
		timeBegin = Date(params.timeBegin);
		timeBegin = Date('00010101') + (timeBegin-BegOfDay(timeBegin));   
	except
		return errorMessage("Error on converting timeBegin. " + ErrorDescription());
	endtry;
		
	try
		timeEnd = Date(params.timeEnd);
		timeEnd = Date('00010101') + (timeEnd-BegOfDay(timeEnd));
    except
		return errorMessage("Error on converting timeEnd. " + ErrorDescription());
	endtry;
		
	try	
		clinic = Catalogs.Салоны.GetRef(new UUID(params.clinicUid));
	except
		return errorMessage("Clinic not found. " + ErrorDescription());
	endtry;
	
	email 	 = "";
	address  = ""; 
	comment  = "";  
	orderUid = "";//param to change existiong order without creation new
	if params.property("email") then
		email = params.email;	
	endif;
	if params.property("address") then
		address = params.address;	
	endif;
	if params.property("comment") then
		comment = params.comment;	
	endif; 
	if params.property("orderUid") then
		orderUid = params.orderUid;	
	endif;
	
	clientRef = "";	
	if params.property("clientUid") and not IsBlankString(params.clientUid) then
		clientInDB = Catalogs.Клиенты.GetRef(new UUID(params.clientUid));
		if not IsBlankString(clientInDB.Код) then
			clientRef = clientInDB;
		endif;
    endif;
	
	orderData = new Structure();  
	orderData.insert("clinic", clinic);
	orderData.insert("target", target); 
	orderData.insert("date", date);
	orderData.insert("timeBegin", timeBegin);
	orderData.insert("timeEnd", timeEnd);        
	orderData.insert("clientRef", clientRef);
	orderData.insert("surname", params.surname);
	orderData.insert("name", params.name);
	orderData.insert("middleName", params.middleName);
	orderData.insert("birthday", '00010101');
	orderData.insert("phone", params.phone);
	orderData.insert("email", email);
	orderData.insert("address", address);
	orderData.insert("comment", comment); 
	orderData.insert("orderUid", orderUid);
	orderData.insert("service", undefined);
	
	response = createOrderDocument(orderData);
	return optimizeResponse(response);
endFunction	   

function createOrderDocument(params)
	try 
		clientRef = params.clientRef;
		if clientRef = "" then
			clientData = new Structure(
				"Фамилия, Имя, Отчество, ДатаРождения, Телефон, Email, Адрес", 
				params.surname, params.name, params.middleName, params.birthday, params.phone, params.email, params.address
			);
			clientRef = ВебИнтеграция.ОбработатьДанныеКлиента(clientData, params.clinic);
		endif;
	
		if not params.orderUid = "" then
			try
				order = Documents.Заявка.GetRef(new UUID(params.orderUid));
				order = order.GetObject();     
			except
				order = Documents.Заявка.CreateDocument();
			endtry;
		else
			order = Documents.Заявка.CreateDocument();
		endif;
			
		order.Состояние 	 = Catalogs.ВидыСостоянийЗаявок.СозданаНаСайте;
		order.Дата			 = CurrentDate();
		order.ДатаНачала	 = BegOfDay(params.date) + (params.timeBegin - Date("00010101"));
		order.ДатаОкончания  = BegOfDay(params.date) + (params.timeEnd - Date("00010101"));
		order.ВремяНачала	 = params.timeBegin;
		order.ВремяОкончания = params.timeEnd;
		order.Мастер		 = params.target;			
		order.Клиент	     = clientRef;
		order.Примечание	 = params.comment;
		order.Салон			 = params.clinic;
		
		order.Работы.Clear();
		
		newService = order.Работы.Add();
		if params.property("service") then   
			//find goods in catalog
			//newService.Номенклатура = params.service;	
		else
			newService.Номенклатура = Catalogs.Номенклатура.EmptyRef();
		endif;
		newService.ДатаНачала		= BegOfDay(params.date) + (params.timeBegin - Date("00010101"));
		newService.ДатаОкончания	= BegOfDay(params.date) + (params.timeEnd - Date("00010101"));
		newService.Продолжительность = Date("00010101") + (params.timeEnd - params.timeBegin);
		
		try
			order.Write();
			newOrderUid = XMLString(order.Ref.UUID());
			
			recordManager = InformationRegisters.НепросмотренныеДокументыССайта.CreateRecordManager();
			recordManager.Документ = order.Ref;
			recordManager.Write();
			
			if params.orderUid = "" then
				recordManager = InformationRegisters.synchronized_orders.CreateRecordManager(); 
				recordManager.orderRef = order.Ref; 
				recordManager.write();	
			endif;	
						
			return new Structure("orderUid", newOrderUid);
		except		
			return errorMessage("Error on creating order. " + ErrorDescription());
		endtry;
	except
		return errorMessage("Error on creating order. " + ErrorDescription());	
	endtry;
	
endFunction

function cancelOrder(params) export
	
	try 
		order = Documents.Заявка.GetRef(new UUID(params.orderUid));  
		
		order = order.GetObject();  
		
		if order = undefined then  
			return new Structure("success", true);	
		endif;	
		
		order.DeletionMark = true;
		order.Состояние = Catalogs.ВидыСостоянийЗаявок.Отменена;
		
		if params.property("reason") then
			order.Примечание = params.reason;	
		endif;
		       
		try      
			order.Write(); 
			
			recordManager = InformationRegisters.НепросмотренныеДокументыССайта.CreateRecordManager();
			recordManager.Документ = order.Ref;
			recordManager.Write(); 
			
			return new Structure("success", true);
		except		
			return errorMessage("Не удалось отменить запись.");
		endtry;
	except
		return errorMessage("Ошибка при удалении записи"); //ErrorDescription()        
	endtry;

endFunction

function updateClient(params) export
		
	if params.property("clientUid") then 
		try
			clientRef = Catalogs.Клиенты.GetRef(new UUID(params.clientUid)); 
			client = clientRef.GetObject();
			
			if client = undefined then
				return errorMessage("client not found");
			endif;    
			
			if params.property("name") then
				client.Имя = params.name;	
			endif;
			if params.property("surname") then
				client.Фамилия = params.surname;	
			endif;
			if params.property("middlename") then
				client.Отчество = params.middlename;	
			endif; 
			
			client.Наименование = client.Фамилия  + " " + client.Имя  + " " +  client.Отчество;
			
			try 
				setAllowSendingDataToSite(false);
				
				client.Write();
				
				recordSet = InformationRegisters.КонтактнаяИнформация.CreateRecordSet();
				recordSet.Filter.Объект.Set(clientRef);
				recordSet.Read();
				
				phoneExists = false;
				emailHomeExists = false;
				emailWorkExists = false;
				
				for i = 0 to recordSet.count()-1 do
					if recordSet[i].Тип = Enums.ТипыКонтактнойИнформации.Телефон then 
						if recordSet[i].Вид = Catalogs.ВидыКонтактнойИнформации.ТелефонСотовый then
							phoneExists = true;
							        
							if params.property("phone") then 
								recordSet[i].Поле3 = params.phone;
								recordSet[i].Представление = params.phone;
							endif;  
						endif;	
					elsif recordSet[i].Тип = Enums.ТипыКонтактнойИнформации.АдресЭлектроннойПочты then 
						if recordSet[i].Вид = Catalogs.ВидыКонтактнойИнформации.АдресЭлектроннойПочтыДомашний then
							emailHomeExists = true;
							        
							if params.property("emailHome") then 
								recordSet[i].Представление = params.emailHome;
							endif;  
						endif; 
						if recordSet[i].Вид = Catalogs.ВидыКонтактнойИнформации.АдресЭлектроннойПочтыРабочий then
							emailWorkExists = true;
							        
							if params.property("emailWork") then 
								recordSet[i].Представление = params.emailWork;
							endif;  
						endif;
					endif;
				enddo;

				
				if params.property("phone") and not phoneExists then
					newCI = recordSet.Add();
					newCI.Объект = clientRef;
					newCI.Тип = Enums.ТипыКонтактнойИнформации.Телефон;
					newCI.Вид = Catalogs.ВидыКонтактнойИнформации.ТелефонСотовый;
					newCI.Поле3 = params.phone;
					newCI.Представление = params.phone;
				endif;
				if params.property("emailHome") and not emailHomeExists then
					newCI = recordSet.Add();
					newCI.Объект = clientRef;
					newCI.Тип = Enums.ТипыКонтактнойИнформации.АдресЭлектроннойПочты;
					newCI.Вид = Catalogs.ВидыКонтактнойИнформации.АдресЭлектроннойПочтыДомашний;
					newCI.Представление = params.emailHome;
				endif;
				if params.property("emailWork") and not emailWorkExists then
					newCI = recordSet.Add();
					newCI.Объект = clientRef;
					newCI.Тип = Enums.ТипыКонтактнойИнформации.АдресЭлектроннойПочты;
					newCI.Вид = Catalogs.ВидыКонтактнойИнформации.АдресЭлектроннойПочтыРабочий;
					newCI.Представление = params.emailWork;
				endif;
				
				try
					recordSet.Write();
					return new Structure("success", true);
				except 
					return errorMessage("Error on updating client. " + ErrorDescription());	
				endtry;
			except
				setAllowSendingDataToSite(true);
				return errorMessage("Error on updating client. " + ErrorDescription());
			endtry;
		except
			return errorMessage("Error on updating client. " + ErrorDescription());
		endtry;
	else
		return errorMessage("client uid is required");	
	endif;	
endFunction	

//*************************************************************************//
//outgoing requests********************************************************//       
//*************************************************************************// 

function sendClient(ref, isNew = false, recoverPassword = false)  export
	clientData = getClientsList(ref);  
	
	if clientData.property("clients") and clientData.clients.count()>0 then
		requestData = new structure;
		requestType = "add";
		
		client = clientData.clients[0];
		
		if isNew then 
			client.insert("isNew", "Y");	
		else
			requestType = "update";
		endif;	
			
		if  recoverPassword then
			client.insert("recoverPassword", "Y");	
			requestType = "recoverPassword";	
		endif;	
		
		requestData.insert("action", "user."+requestType);
		requestData.insert("client", client);
		
		json = json_encode(requestData);
		return sendRequest(json);
		
	elsif clientData.property("error") then
		return clientData;
	endif;	
	
	return errorMessage("Wrong client data");  
endFunction	      

function sendRequest(jsonParams)
	ResponseData = new Structure;
	Try 
		Options = getRequestOptions();
	
		Server = Options.Server;
		Headers = Options.Headers;
		url = Options.Url;
		
		Connection  =  New HTTPConnection(Server,443,,,,,New OpenSSLSecureConnection());
		Request = New HTTPRequest(url, Headers);
		Request.SetBodyFromString(jsonParams, TextEncoding.UTF8);
		
		Response = Connection.Post(Request);  
		
		if Response.StatusCode = 200 then
			ResponseData = json_decode(Response.GetBodyAsString("UTF-8"));
		
			if typeOf(ResponseData) = Type("Structure") then
				if not ResponseData.property("success")	and not ResponseData.property("error") then
					ResponseData = errorMessage("Response has no required fields");
				endif;	
			else	
				ResponseData = errorMessage("Uncknown type of response");
			endif;
		else	  
			message =  "Code: " + Response.StatusCode + " | " + Response.GetBodyAsString("UTF-8"); 
			if(Response.StatusCode = 404) then
				message = "404 - ресурс не найден. Проверьте правильность доменного имени и пути к обработчику в настройках";	
			endif;	
			ResponseData = errorMessage(message);			
		endif;	
	Except                               
        ResponseData = errorMessage(errorDescription());
	EndTry;
	
	return ResponseData;
	
endFunction

//*************************************************************************//
//utils********************************************************************//   
//*************************************************************************//
function json_encode(data)
	JSONWriter = new JSONWriter;
	JSONWriter.SetString();       
	WriteJSON(JSONWriter, data);
	jsonData = JSONWriter.Close();           
		
	return jsonData;	
endfunction

function json_decode(json)
	JSONReader = New JSONReader;
	JSONReader.SetString(json);
	structure = ReadJSON(JSONReader, false);          
		
	return structure;	
endfunction 

function base64_encode(string)
    tmp = GetTempFileName();
    
    record = new TextWriter(tmp, TextEncoding.UTF8);
    record.Write(string);
    record.Close();
    
    binData = new BinaryData(tmp);
    encoded = Base64String(binData);
    
    DeleteFiles(tmp); 
	
	return  encoded;
    
endfunction

function getRequestOptions()
	
	integrationOptions = getIntegrationOptions();
	
	RequestOptions = new structure;	
	if integrationOptions.property("domen") and integrationOptions.property("handler") then
		RequestOptions.Insert("Server", integrationOptions.domen); 
		RequestOptions.Insert("Url", integrationOptions.handler);
	else
		message("Warning: domen or handler option not found. Please check the integration options");
	endif;	
	
	Headers = new map;
   	Headers.Insert("Accept", "application/json");
   	Headers.Insert("Content-Type", "application/json;charset=utf-8");
	
	if integrationOptions.property("needAuth") and integrationOptions.needAuth then
		if integrationOptions.property("login") and integrationOptions.property("password") then 
			token = base64_encode(integrationOptions.login+":"+integrationOptions.password);
			Headers.Insert("Authorization", "Basic " + token); 
		endif;
	endif;
	
	RequestOptions.Insert("Headers", Headers);
	
	return RequestOptions;
endFunction

function formatDateToString(date, time = false)
	if time <> false then
		return String(Format(date, "DF=""yyyy-MM-dd'T'HH:mm:ss"""));		
	endif;
	return String(Format(BegOfDay(date), "DF=""yyyy-MM-dd'T'HH:mm:ss"""));
endFunction	 

function searchObjInArrayByUid(array, uid)
	index = false;
	for i = 0 to array.count() - 1 do
		if typeOf(array[i]) = type("Structure") and array[i].property("uid") then
			if 	array[i].uid = uid then  
				index = i;     
				break;
			endif;	
		endif;	
	enddo;
	return index;
endFunction	

function errorMessage(message) export
	return new Structure("error", message);
endFunction	

function convertXmlToObject(XML) export   
	Ветка = Новый Соответствие;
    Значение = "";
    
    Пока XML.Прочитать() Цикл
        ТипУзла = XML.ТипУзла;
        Если ТипУзла = ТипУзлаXML.НачалоЭлемента Тогда
            Имя = XML.Имя;
            Временно = Ветка.Получить(Имя);
            Если Временно = Неопределено Тогда
                Ветка.Вставить(Имя, convertXmlToObject(XML));
            Иначе
                Если ТипЗнч(Временно) <> Тип("Массив") Тогда
                    нз = новый Массив;
                    нз.Добавить(Временно);
                    Временно = нз;
                    нз = "";
                    Ветка.Удалить(Имя);
                    Ветка.Вставить(Имя, Временно);
                КонецЕсли;
                Временно.Добавить(convertXmlToObject(XML));
            КонецЕсли;
        ИначеЕсли ТипУзла = ТипУзлаXML.КонецЭлемента Тогда
            Возврат ?(ЗначениеЗаполнено(Ветка), Ветка, Значение);
        ИначеЕсли ТипУзла = ТипУзлаXML.Текст Тогда
            Значение = Значение + XML.Значение;
            XML.Прочитать(); //Вычитка закрывающего тега
            Возврат Значение;
        КонецЕсли;
	КонецЦикла;     
	
	Возврат Ветка;
endFunction

function optimizeResponse(structure)  
	optimiziedResponse = structure;
	
	if optimiziedResponse.property("error") then
		optimiziedResponse.insert("defaultError", structure.error);
		optimiziedResponse.error = "Данное время занято или вы уже записаны на это время к другому врачу";	
	else 
		optimiziedResponse.insert("success", "true");
	endif;
		
	return optimiziedResponse;
endFunction	 

function getIntegrationOptions() export
 	objectKey = "webIntegration";
	optionsKey = "integrationOptions";     
	optionsDescription = "Options for connect to site and synchronization of clients";
	user = "saveForAll";
	   
	options = CommonSettingsStorage.Load(objectKey, optionsKey, optionsDescription, user);
	
	return options;
endFunction	

function setIntegrationOptions(
	domen = "", 
	handler = "", 
	syncPersonalData = false, 
	autoSyncClients = false,
	needAuth = false,
	login = "",
	password = "",
	clinics = false,
	typesOfTime = false
) export
	
	try	
		Options = new structure;
		Options.insert("domen", domen);  
		Options.insert("handler", handler);
		Options.insert("syncPersonalData", syncPersonalData);
		Options.insert("autoSyncClients", autoSyncClients);
		Options.insert("needAuth", needAuth);
		Options.insert("login", login);
		Options.insert("password", password);
		Options.insert("allowedClinics", clinics);
		Options.insert("allowedTypesOfTime", typesOfTime);

	 	objectKey = "webIntegration";
		optionsKey = "integrationOptions";     
		optionsDescription = "Options for connect to site and synchronization of clients";
		user = "saveForAll";
	 
	
		CommonSettingsStorage.Save(objectKey, optionsKey, Options, optionsDescription, user);
		message("Настройки сохранены");
	except
		message(errorDescription());
	endtry;	
endFunction	

function getAllowedTypesOfTime() export
	Options = getIntegrationOptions(); 
	if not Options = undefined 
		and TypeOf(Options) = Type("Structure") 
		and Options.property("allowedTypesOfTime")
		and typeOf(Options.allowedTypesOfTime) = Type("Array") then
		
		return Options.allowedTypesOfTime;
	else
		return new array;		
	endif;	
endfunction	

function getContactTypes(inStructure = false)
	if inStructure  then
		types =  new structure();
		types.insert("emailWork", "Адрес электронной почты (рабочий)"); 
		types.insert("emailHome", "Адрес электронной почты (домашний)");
		types.insert("phoneType", "Сотовый телефон");
	else
		types =  new array();
		types.add("Адрес электронной почты (рабочий)");
		types.add("Адрес электронной почты (домашний)");
		types.add("Сотовый телефон");
	endif;	

	return types;
endFunction	

function createClientContacts(type, value, isSyncPersonalData, contacts = false)
	
	if contacts = false or not typeOf(contacts) = type("Structure") then
		contacts = new structure;	
	endif;
	
	needleTypes = getContactTypes(true);
	
	if needleTypes.property("phoneType") and type = needleTypes.phoneType then	 
		contacts.insert("phone", value);
	elsif needleTypes.property("emailHome") and type = needleTypes.emailHome and isSyncPersonalData then
		contacts.insert("emailHome", value); 
	elsif needleTypes.property("emailWork") and type = needleTypes.emailWork and isSyncPersonalData then
		contacts.insert("emailWork", value);	
	endif;
	
	return contacts;
endFunction

function getClientPhoneByRef(clientRef)  export
	phone = false;
	try    
		query = new Query;
		query.Text = 
		"ВЫБРАТЬ
		|	contactInfo.Вид.Наименование КАК contactType,
		|	contactInfo.Представление КАК contactValue
		|ИЗ
		|	Справочник.Клиенты КАК Clients
		|		ЛЕВОЕ СОЕДИНЕНИЕ РегистрСведений.КонтактнаяИнформация КАК contactInfo
		|		ПО Clients.Ссылка = contactInfo.Объект
		|ГДЕ
		|	Clients.ПометкаУдаления = ЛОЖЬ
		|	И Clients.Ссылка = &clientRef
		|	И contactInfo.Вид.Наименование = &contactType
		|
		|СГРУППИРОВАТЬ ПО
		|	contactInfo.Вид.Наименование,
		|	contactInfo.Представление";
		
		types = getContactTypes(true);
		query.SetParameter("contactType", types.phoneType);
		query.SetParameter("clientRef", clientRef);
			
		res = query.Execute();
		              
		clients = new Array;
		if res.isEmpty() then    
			clients.Insert("error", "Clients not found");
		else      
			selection = res.Select();      
			if selection.Next() then    
				phone =  selection.contactValue;      
			endif;	
		endif;         
		              
		return phone;   
    except
		return false;
	endtry;
	
endfunction	       

function setCustomIntegrationFlag(flag = false) export
	try	
		Options = new structure;
		Options.insert("flag", flag);  

	 	objectKey = "webIntegration";
		optionsKey = "isCustomIntegration";     
		optionsDescription = "Option to define custom integration flag";
		user = "saveForAll";
	 
		CommonSettingsStorage.Save(objectKey, optionsKey, Options, optionsDescription, user);
	except
		message(errorDescription());
	endtry;
endfunction

function getCustomIntegrationFlag() export
 	objectKey = "webIntegration";
	optionsKey = "isCustomIntegration";     
	optionsDescription = "Option to define custom integration flag";
	user = "saveForAll";
	   
	options = CommonSettingsStorage.Load(objectKey, optionsKey, optionsDescription, user);
	
	if typeOf(options) = Type("Structure") and options.property("flag") then
		return options.flag;	
	else	
		return false;
	endif;
endFunction

function setAllowSendingDataToSite(value = true) export
	try	
		Options = new structure;
		Options.insert("allow", value);  

	 	objectKey = "webIntegration";
		optionsKey = "allowSendingDataToSite";     
		optionsDescription = "Option to allow/disallow sending data to site";
		user = "saveForAll";
	 
		CommonSettingsStorage.Save(objectKey, optionsKey, Options, optionsDescription, user);
	except
		message(errorDescription());
	endtry;
endfunction

function getAllowSendingDataToSite() export
 	objectKey = "webIntegration";
	optionsKey = "allowSendingDataToSite";     
	optionsDescription = "Option to allow/disallow sending data to site";
	user = "saveForAll";
	
	options = CommonSettingsStorage.Load(objectKey, optionsKey, optionsDescription, user);
	
	if typeOf(options) = Type("Structure") and options.property("allow") then
		return options.allow;	
	else	
		return true;
	endif;
endFunction
