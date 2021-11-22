
&Перед("ПередЗаписью")
Процедура si_ПередЗаписью(Отказ, РежимЗаписи, РежимПроведения)
	if not isNew() then
    	orderRef = ThisObject.Ref;
		
		query = new Query;
		query.text = 
			"SELECT
			|	synchronized_orders.orderRef AS ref
			|FROM
			|	InformationRegister.synchronized_orders AS synchronized_orders
			|WHERE
			|	synchronized_orders.orderRef = &orderRef";        
		
		query.setParameter("orderRef", orderRef);
			
		res = query.execute(); 
		
		if not res.isEmpty()  then
			selection = res.select();
			if selection.next() then 
				recordSet = InformationRegisters.synchronized_orders.CreateRecordSet();
				recordSet.Filter.orderRef.Set(selection.ref);
				recordSet.Read();
				recordSet.Clear();  
				recordSet.Write = true;
				recordSet.Write(true);		               
			endif;
		endif;	     
	endif;
КонецПроцедуры
