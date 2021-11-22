
&После("ПриЗаписи")
Процедура si_ПриЗаписи(cancel)
	isCanSend = integrationFunctions.getAllowSendingDataToSite();
	if isCanSend then
		try
			Options = integrationFunctions.getIntegrationOptions(); 
		        
			if not Options = undefined and TypeOf(Options) = Type("Structure") and Options.property("autoSyncClients") then  
				if Options.autoSyncClients then
					if ThisObject.isPofileCreated then
						updated = integrationFunctions.sendClient(ThisObject.ref);
						if typeOf(updated) = type("Structure") then
							if updated.property("success") and updated.success then
								message("ЛК на сайте обновлён успешно");
							elsif updated.property("error") then
								message("Ошибка при обновлении ЛК на сайте: " + updated.error);
							endif;	
						else
							message("Error: unexpected type of response - " + updated);	
						endif;	
					else
						message("Автоматическая отправка данных отменена, так как для данного клиента не создан профиль пользователя на сайте");
					endif;
				else
					message("Автоматическая отправка данных отключена в настройках");
				endif;
			endif;	
		except
			message("Автоматическая синхронизация с сайтом не удалась по причине: "+errorDescription());	
		endtry;		
	endif;	
КонецПроцедуры
