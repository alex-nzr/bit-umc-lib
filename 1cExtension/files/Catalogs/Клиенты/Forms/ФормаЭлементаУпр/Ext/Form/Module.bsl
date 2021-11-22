
&AtClient
procedure sendToSite(event)
	if event.name = "sendToSite" then
		userData = createSiteUser();
		if userData <> false then
			showAuthInfo(userData);	
		endif;	
	elsif event.name = "recoverPassword" then
		if Parameters.Key.isEmpty() or not Объект.isPofileCreated then
    		message("У данного клиента нет профиля на сайте.");
		else
			notify = new NotifyDescription("onDialogAnswer", ThisObject);	
	 
	    	ShowQueryBox(
				notify,
	        	"Сгенерировать новый пароль?",
	        	QuestionDialogMode.YesNo,
	        	0, 
				DialogReturnCode.No, 
	        	"Подтвердите действие" 
	    	);
		endif;
	endif;
endProcedure

&AtClient
procedure onDialogAnswer(res, params) export
   	if res = DialogReturnCode.Yes then
        userData = updateSiteUserPassword();
		if userData <> false then
			showAuthInfo(userData);	
		endif;
	endif;	
 endProcedure
 
 &AtClient
procedure showAuthInfo(data) 
   	doc = getAuthTable(data);
	if doc <> false then 
		doc.Show();	
	else
		message("Не удалось сформировать документ для печати.");
	endif;
endProcedure
 
&AtServer
function createSiteUser()
	if Parameters.Key.isEmpty() then
    	message("Клиент создан, но не записан. Создание профиля на сайте для нового клиента невозможно до его записи.");
	else
		if not Объект.isPofileCreated then  
			phone = integrationFunctions.getClientPhoneByRef(Объект.Ссылка); 
			if phone = false or IsBlankString(phone) then
				message("Не заполнен телефон"); 
			elsif IsBlankString(Объект.СНИЛС) then
				message("Не заполнен СНИЛС"); 
			else
				res = integrationFunctions.sendClient(Объект.Ссылка, true);
				isCreated = res.property("success") and res.success = true; 
				if isCreated then 
					Объект.isPofileCreated = true;
					ClientObject = FormAttributeToValue("Объект");
	    			ClientObject.Write();
					ThisForm.Read(); 
					message("Профиль создан успешно."); 
					
					return res;
				else
					message("При создании профиля произошла ошибка: " + res.error);
				endif;	
			endif;		
		else 
			message("У данного клиента уже есть профиль на сайте");		
		endif;	
	endif;
	
	return false;
endFunction 

function updateSiteUserPassword()
	if Parameters.Key.isEmpty() or not Объект.isPofileCreated then
    	message("У данного клиента нет профиля на сайте.");
	else
		res = integrationFunctions.sendClient(Объект.Ссылка, false, true);
		isUpdated = res.property("success") and res.success = true; 
		if isUpdated then 
			message("Пароль успешно обновлён."); 
			return res;
		else 
			if res.property("error") then 
				message("При обновлении пароля произошла ошибка: " + res.error);
			else
				message("Error: unexpected response - " + res);	
			endif;	
		endif;	
	endif;
	
	return false;
endFunction 

function getAuthTable(data) 
	keysMap = new Map();                  
	keysMap.insert("site", "Адрес сайта организации"); 
	keysMap.insert("login", "Логин пользователя");
	keysMap.insert("password", "Пароль пользователя");
	keysMap.insert("info", "Информация");
	
	if typeOf(data) = type("Structure") then 
		valueTable = New ValueTable;
		for each elem in data do
			title = elem.key; 
			if keysMap.get(elem.key) <> undefined then
				title = keysMap[elem.key];
				valueTable.Columns.Add(elem.key,,title);
			endif;	
		enddo;
		
		tabRow = valueTable.Add();
		for each elem in data do
			if keysMap.get(elem.key) <> undefined then
				tabRow[elem.key] = data[elem.key];
			endif;		
		enddo;
		
		return getTableDocument(valueTable);
	else
		return false;
	endif;	
endFunction                                         

function getTableDocument(valueTable)
	doc = new SpreadsheetDocument;
	doc.FitToPage = true;
    i = 0;
	while i < valueTable.Columns.Count() do
		column = valueTable.Columns[i];
		area = doc.Area(1, i + 1, 1, i + 1); 
		
		area.LeftBorder = new Line(SpreadsheetDocumentCellLineType.Solid,1);
		area.RightBorder = new Line(SpreadsheetDocumentCellLineType.Solid,1);
        area.TopBorder = new Line(SpreadsheetDocumentCellLineType.Solid,1);
		area.BottomBorder = new Line(SpreadsheetDocumentCellLineType.Solid,1); 
		
		area.TextPlacement = SpreadsheetDocumentTextPlacementType.Wrap;
		area.VerticalAlign = VerticalAlign.Center;
		area.HorizontalAlign = HorizontalAlign.Center;
		
		area.Text = column.Title;
		areaWidth = area.Indent+StrLen(TrimAll(area.Text));  
        columnWidth = Max(area.ColumnWidth, areaWidth+3);
        if columnWidth > 40 Тогда
        	area.ColumnWidth = 40;
        else
        	area.ColumnWidth = columnWidth;
        endif;
	    i = i + 1;
	КонецЦикла;
	    
	j = 0;
	while j < valueTable.count() do
		tableRow = valueTable[j];
	    i = 0;
	    while i < valueTable.Columns.Count() do
	    	column = valueTable.Columns[i];
	        area = doc.Area(j + 2, i + 1, j + 2, i + 1); 
			
			area.LeftBorder = new Line(SpreadsheetDocumentCellLineType.Solid,1);
			area.RightBorder = new Line(SpreadsheetDocumentCellLineType.Solid,1);
           	area.TopBorder = new Line(SpreadsheetDocumentCellLineType.Solid,1);
			area.BottomBorder = new Line(SpreadsheetDocumentCellLineType.Solid,1);
			
			area.TextPlacement = SpreadsheetDocumentTextPlacementType.Wrap;
			area.VerticalAlign = VerticalAlign.Center;
			area.HorizontalAlign = HorizontalAlign.Center;
			
			area.Text = tableRow[column.Name];
			areaWidth = area.Indent+StrLen(TrimAll(area.Text));  
            columnWidth = Max(area.ColumnWidth, areaWidth+3);
            if columnWidth > 40 Тогда
                area.ColumnWidth = 40;
            else
                area.ColumnWidth = columnWidth;
            endif;
	        i = i + 1;
	    enddo;        
	    j = j + 1;
	enddo;
		
	return doc;	       	
endfunction	

procedure si_ПриСозданииНаСервереПосле(cancel, processing)
	if Parameters.Key.isEmpty() then
    	Объект.isAppointmentBlocked = false;
	endif;
endProcedure

