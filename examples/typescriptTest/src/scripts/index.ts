import styles from "../styles/style.scss"
import getProjectSettings from "../settings";

const params = {
	wrapperId:                    'appointment-widget-wrapper',
	widgetBtnWrapId:              styles["appointment-button-wrapper"],
	widgetBtnId:                  styles['appointment-button'],
	formId:                       styles['appointment-form'],
	messageNodeId:                styles['appointment-form-message'],
	submitBtnId:                  styles['appointment-form-button'],
	appResultBlockId:             styles['appointment-result-block'],
	inputClass:					  styles['appointment-form_input'],
	textareaClass:				  styles['appointment-form_textarea'],
}
const settings = getProjectSettings(params);

window.appointmentWidget = {
	init: function(params){
		this.useServices 					= (params.useServices === "Y");
		this.selectDoctorBeforeService 		= (params.selectDoctorBeforeService === "Y");
		this.useTimeSteps 					= (params.useTimeSteps === "Y");
		this.timeStepDurationMinutes		= Number(params.timeStepDurationMinutes);
		this.strictCheckingOfRelations		= (params.strictCheckingOfRelations === "Y");
		this.showDoctorsWithoutDepartment	= (params.showDoctorsWithoutDepartment === "Y");

		this.isUpdate = params.isUpdate;
		this.ajaxUrl = params.ajaxPath;
		this.requestParams = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json;charset=utf-8',
			},
			body: '',
		}
		this.dataKeys = {
			clinicsKey: params.dataKeys.clinicsKey,
			specialtiesKey: params.dataKeys.specialtiesKey,
			servicesKey: params.dataKeys.servicesKey,
			employeesKey: params.dataKeys.employeesKey,
			scheduleKey: params.dataKeys.scheduleKey,
		};
		this.data = {
			clinics: [],
			employees: {},
			services: {},
			schedule: []
		}
		this.eventHandlersAdded = {}
		this.requiredInputs = [];//not used now, because checking goes by this.filledInputs
		this.filledInputs = {
			[this.dataKeys.clinicsKey]: {
				clinicUid: false,
				clinicName: false,
			},
			[this.dataKeys.specialtiesKey]: {
				specialty: false,
				specialtyUid: false,
			},
			[this.dataKeys.servicesKey]: {
				serviceUid: false,
				serviceName: false,
				serviceDuration: false,
			},
			[this.dataKeys.employeesKey]: {
				refUid: false,
				doctorName: false,
			},
			[this.dataKeys.scheduleKey]: {
				orderDate: false,
				timeBegin: false,
				timeEnd: false,
			},
			textValues: {
				name: false,
				surname: false,
				middleName: false,
				phone: false,
				address: false,
				comment: false,
			},
		}
		this.defaultText = params.defaultText;
		this.step = '';

		this.wrapper = document.getElementById(params.wrapperId);
		this.widgetBtnWrap = document.getElementById(params.widgetBtnWrapId);
		this.widgetBtn = document.getElementById(params.widgetBtnId);
		this.messageNode = document.getElementById(params.messageNodeId);
		this.submitBtn = document.getElementById(params.submitBtnId);
		this.resultBlock = document.getElementById(params.appResultBlockId);

		this.initForm(params.formId);
		this.initSelectionNodes(params.selectionNodes);
		this.initTextNodes(params.textNodes);
		this.addPhoneMasks();
		this.start().then(r => void(0));
	},

	initForm: function(id){
		this.form = this.wrapper.querySelector(`#${id}`);
		this.form.addEventListener('submit', this.submit.bind(this));
	},

	initSelectionNodes: function(nodesData){
		this.selectionNodes = {}
		for (const nodesDataKey in nodesData)
		{
			if (nodesData.hasOwnProperty(nodesDataKey))
			{
				this.eventHandlersAdded[nodesDataKey] = false;

				this.selectionNodes[nodesDataKey] = {
					blockNode: 		this.wrapper.querySelector(`#${nodesData[nodesDataKey].blockId}`),
					listNode: 		this.wrapper.querySelector(`#${nodesData[nodesDataKey].listId}`),
					selectedNode: 	this.wrapper.querySelector(`#${nodesData[nodesDataKey].selectedId}`),
					inputNode: 		this.wrapper.querySelector(`#${nodesData[nodesDataKey].inputId}`),
				}

				if (nodesData[nodesDataKey].isRequired)
				{
					this.requiredInputs.push(this.selectionNodes[nodesDataKey].inputNode);
				}
			}
		}
	},

	initTextNodes: function(nodesData){
		this.textNodes = {}
		for (const nodesDataKey in nodesData)
		{
			if (nodesData.hasOwnProperty(nodesDataKey))
			{
				const input = this.wrapper.querySelector(`#${nodesData[nodesDataKey].inputId}`);
				input && input.addEventListener('input', (e)=> {
					this.filledInputs.textValues[nodesDataKey] = e.target.value;
				});
				this.textNodes[nodesDataKey] = {
					inputNode: input,
				}
				if (nodesData[nodesDataKey].isRequired)
				{
					this.requiredInputs.push(this.textNodes[nodesDataKey].inputNode);
				}
			}
		}
	},

	start: async function(){
		this.toggleLoader(true);
		const loaded = await this.loadData();
		if (loaded){
			this.startRender();
			this.activateWidgetButton();
		}else{
			this.errorMessage("Loading data error")
		}
	},

	loadData:  async function(){
		let loaded = false;
		try{
			const clinicsResponse = await this.getListClinic();
			const clinics = await clinicsResponse.json();

			if (clinics.error){
				this.errorMessage(clinics.error);
			}else{
				if (clinics.length > 0){
					this.data.clinics = clinics;

					if (this.useServices){
						const nomenclatureResponse = await this.getListNomenclature();
						const nomenclature = await nomenclatureResponse.json();

						if (nomenclature.error){
							this.errorMessage(nomenclature.error);
						}else{
							if (Object.keys(nomenclature).length > 0){
								this.data.services = nomenclature;
							}
						}
					}

					const employeesResponse = await this.getListEmployees();
					const employees = await employeesResponse.json();

					if (employees.error){
						this.errorMessage(employees.error);
					}else{
						if (Object.keys(employees).length > 0){
							this.data.employees = employees;
							const scheduleResponse = await this.getSchedule();
							const schedule = await scheduleResponse.json();

							if (schedule.error){
								this.errorMessage(schedule.error);
							}else{
								if (schedule.hasOwnProperty("schedule")){
									this.data.schedule = schedule.schedule;
									loaded = true;
								}
							}
						}else{
							this.errorMessage("Employees not found")
						}
					}
				}else{
					this.errorMessage("Clinics not found")
				}
			}
		}catch (e) {
			this.errorMessage(e);
			return loaded;
		}
		return loaded;
	},

	getListClinic: async function(){
		try {
			this.requestParams.body = JSON.stringify({action: 'GetListClinics'});
			const response = await fetch(this.ajaxUrl, this.requestParams);
			if (response.ok) {
				return response;
			}else{
				this.errorMessage(`Get clinics error. Status code ${response.status}`);
			}
		} catch(e) {
			this.errorMessage(e);
		}
	},

	getListEmployees: async function(){
		try {
			this.requestParams.body = JSON.stringify({action: 'GetListEmployees'});
			const response = await fetch(this.ajaxUrl, this.requestParams);
			if (response.ok) {
				return response;
			}else{
				this.errorMessage(`Get employees error. Status code ${response.status}`);
			}
		} catch(e) {
			this.errorMessage(e);
		}
	},

	getListNomenclature: async function(){
		try {
			this.requestParams.body = JSON.stringify({action: 'GetListNomenclature'});
			const response = await fetch(this.ajaxUrl, this.requestParams);
			if (response.ok) {
				return response;
			}else{
				this.errorMessage(`Get nomenclature error. Status code ${response.status}`);
			}
		} catch(e) {
			this.errorMessage(e);
		}
	},

	getSchedule: async function(){
		try {
			this.requestParams.body = JSON.stringify({action: 'GetSchedule'});
			const response = await fetch(this.ajaxUrl, this.requestParams);
			if (response.ok) {
				return response;
			}else{
				this.errorMessage(`Can not get schedule. Error status - ${response.status}`);
			}
		} catch(e) {
			this.errorMessage(e.message)
		}
	},

	startRender: function(){
		const clinicsRendered = this.renderClinicList();
		if (clinicsRendered)
		{
			if (this.isUpdate === "Y")
			{
				for (const dataKey in this.filledInputs) {
					if (this.filledInputs.hasOwnProperty(dataKey)
						&& this.selectionNodes.hasOwnProperty(dataKey))
					{
						this.filledInputs[dataKey] = JSON.parse(this.selectionNodes[dataKey].inputNode.value);
					}
				}
				this.renderSpecialtiesList();
				this.renderEmployeesList();
				this.renderScheduleList();
			}
			setTimeout(()=>{
				this.toggleLoader(false);
			}, 300)
		}
		else
		{
			this.errorMessage("error on clinics rendering")
		}
	},

	renderClinicList: function(){
		let rendered = false;
		if(this.data.clinics.length)
		{
			if (this.selectionNodes.hasOwnProperty(this.dataKeys.clinicsKey))
			{
				this.data.clinics.forEach((clinic) => {
					const li = document.createElement('li');
					if (clinic.uid) {
						li.dataset.uid = clinic.uid;
						li.dataset.name = clinic.name;
						li.textContent = clinic.name;
						this.selectionNodes[this.dataKeys.clinicsKey].listNode.append(li);
					}else{
						this.errorMessage(`${clinic.name} was excluded from render, because it hasn't uid`);
					}
				});
				this.addListActions(this.dataKeys.clinicsKey);
				rendered = true;
			}
			else
			{
				this.errorMessage("clinics nodes not found");
			}
		}else{
			this.errorMessage("no clinics to render");
		}
		return rendered;
	},

	renderSpecialtiesList: function(){
		if (this.selectionNodes.hasOwnProperty(this.dataKeys.specialtiesKey))
		{
			const specialtiesList = this.selectionNodes[this.dataKeys.specialtiesKey].listNode;
			specialtiesList.innerHTML = '';
			this.eventHandlersAdded[this.dataKeys.specialtiesKey] = false;
			if(Object.keys(this.data.employees).length > 0)
			{
				for (let uid in this.data.employees)
				{
					const clinicCondition = (this.filledInputs[this.dataKeys.clinicsKey].clinicUid === this.data.employees[uid].clinicUid);
					let canRender = true;
					if(this.strictCheckingOfRelations){
						canRender = clinicCondition;
						if (this.showDoctorsWithoutDepartment){
							canRender = clinicCondition || !this.data.employees[uid].clinicUid;
						}
					}

					if (canRender && (Object.keys(this.data.employees[uid]['specialties']).length > 0))
					{
						const specialties = this.data.employees[uid]['specialties'];
						for (let specialtyUid in specialties)
						{
							if (specialties.hasOwnProperty(specialtyUid)){
								const alreadyRendered = specialtiesList.querySelector(`[data-uid="${specialtyUid}"]`);
								if (!alreadyRendered){
									const li = document.createElement('li');
									li.textContent = specialties[specialtyUid].name;
									li.dataset.uid = specialtyUid;
									specialtiesList.append(li);
								}
							}
						}
					}
				}
				if (specialtiesList.children.length === 0){
					const span = document.createElement('span');
					span.classList.add(styles["empty-selection-message"]);
					span.textContent = `В данной клинике не найдено направлений деятельности`;
					specialtiesList.append(span);
				}
				this.addListActions(this.dataKeys.specialtiesKey);
			}
		}
		else
		{
			this.errorMessage("specialties block not found")
		}
	},

	renderServicesList: function(){
		if (this.selectionNodes.hasOwnProperty(this.dataKeys.servicesKey))
		{
			const servicesList = this.selectionNodes[this.dataKeys.servicesKey].listNode;
			servicesList.innerHTML = '';
			this.eventHandlersAdded[this.dataKeys.servicesKey] = false;
			if(Object.keys(this.data.services).length > 0)
			{
				for (let uid in this.data.services)
				{
					let renderCondition = (this.filledInputs[this.dataKeys.specialtiesKey].specialtyUid
											=== this.data.services[uid].specialtyUid);
					if (this.selectDoctorBeforeService){
						const selectedEmployeeUid = this.filledInputs[this.dataKeys.employeesKey].refUid;
						renderCondition = renderCondition && this.data.employees[selectedEmployeeUid].services.hasOwnProperty(uid);
					}

					if (renderCondition)
					{
						const li = document.createElement('li');
						const price = Number((this.data.services[uid]['price']).replace(/\s+/g, ''));
						if (this.data.services.hasOwnProperty(uid)){
							li.innerHTML = `<p>
												${this.data.services[uid].name}<br>
												${price>0 ? "<b>"+price+"</b>₽" : ""}
											</p>`;
							li.dataset.uid = uid;
							li.dataset.duration = this.data.services[uid].duration;
							servicesList.append(li);
						}
					}
				}
				if (servicesList.children.length === 0){
					const span = document.createElement('span');
					span.classList.add(styles["empty-selection-message"]);
					span.textContent = `К сожалению, по выбранным параметрам нет подходящих услуг`;
					servicesList.append(span);
				}
				this.addListActions(this.dataKeys.servicesKey);
			}
		}
		else
		{
			this.errorMessage("specialties block not found")
		}
	},

	renderEmployeesList: function() {
		if (this.selectionNodes.hasOwnProperty(this.dataKeys.employeesKey))
		{
			const empList = this.selectionNodes[this.dataKeys.employeesKey].listNode;
			empList.innerHTML = '';
			this.eventHandlersAdded[this.dataKeys.employeesKey] = false;
			if(Object.keys(this.data.employees).length > 0) {
				for (let uid in this.data.employees)
				{
					if (this.data.employees.hasOwnProperty(uid))
					{
						const selectedSpecialty = this.filledInputs[this.dataKeys.specialtiesKey].specialtyUid;
						const selectedClinic = this.filledInputs[this.dataKeys.clinicsKey].clinicUid;
						const specialtyCondition = this.data.employees[uid]['specialties'].hasOwnProperty(selectedSpecialty);
						const clinicCondition = selectedClinic === this.data.employees[uid].clinicUid;

						let canRender = specialtyCondition;

						if(this.strictCheckingOfRelations){
							if (this.showDoctorsWithoutDepartment){
								canRender = (specialtyCondition && !this.data.employees[uid].clinicUid)
											||
											(specialtyCondition && clinicCondition);
							}
							else
							{
								canRender = specialtyCondition && clinicCondition;
							}
						}

						if (canRender)
						{
							if (this.useServices && !this.selectDoctorBeforeService)
							{
								const selectedServiceUid = this.filledInputs[this.dataKeys.servicesKey].serviceUid;
								if (!this.data.employees[uid].services.hasOwnProperty(selectedServiceUid)){
									continue;
								}
							}
							const li = document.createElement('li');
							li.dataset.uid = uid;
							li.textContent = `${this.data.employees[uid].surname} 
												${this.data.employees[uid].name} 
												${this.data.employees[uid].middleName}`;
							empList.append(li);
						}
					}
				}
				if (empList.children.length === 0){
					const span = document.createElement('span');
					span.classList.add(styles["empty-selection-message"]);
					span.textContent = `К сожалению, по выбранным параметрам на ближайшее время нет свободных специалистов`;
					empList.append(span);
				}
				this.addListActions(this.dataKeys.employeesKey);
			}
		}
	},

	renderScheduleList: function() {
		if (this.data.schedule.length)
		{
			const scheduleList = this.selectionNodes[this.dataKeys.scheduleKey].listNode;
			scheduleList.innerHTML = '';
			this.eventHandlersAdded[this.dataKeys.scheduleKey] = false;

			this.data.schedule.forEach((employeeSchedule) => {
				if (
					employeeSchedule.clinicUid === this.filledInputs[this.dataKeys.clinicsKey].clinicUid
					&& employeeSchedule.refUid === this.filledInputs[this.dataKeys.employeesKey].refUid
				)
				{
					const selectedEmployee = this.data.employees[employeeSchedule.refUid];
					const selectedService = this.filledInputs[this.dataKeys.servicesKey];
					let serviceDuration = Number(selectedService.serviceDuration);
					if(selectedEmployee.services.hasOwnProperty(selectedService.serviceUid))
					{
						if (selectedEmployee.services[selectedService.serviceUid].hasOwnProperty("personalDuration")){
							const personalDuration = selectedEmployee.services[selectedService.serviceUid]["personalDuration"];
							serviceDuration = Number(personalDuration) > 0 ? Number(personalDuration) : serviceDuration;
						}
					}
					const renderCustomIntervals = this.useServices && (serviceDuration > 0);
					const timeKey = renderCustomIntervals ? "freeNotFormatted" : "free";

					if (employeeSchedule['timetable'][timeKey].length)
					{
						let intervals = employeeSchedule['timetable'][timeKey];

						if (renderCustomIntervals)
						{
							const customIntervals = this.getIntervalsForServiceDuration(intervals, serviceDuration*1000);

							if (customIntervals.length === 0)
							{
								const span = document.createElement('span');
								span.classList.add(styles["empty-selection-message"]);
								span.textContent = `К сожалению, запись на данную услугу к выбранному специалисту невозможна на ближайшее время`;
								scheduleList.append(span);
								return;
							}
							else
							{
								intervals = customIntervals;
							}
						}

						intervals.forEach((day) => {
							const li = document.createElement('li');
							const span = document.createElement('span');
							li.dataset.date = day.date;
							li.dataset.start = day.timeBegin;
							li.dataset.end = day.timeEnd;
							li.textContent = `${day['formattedDate']} `;
							span.textContent = `${day['formattedTimeBegin']}-${day['formattedTimeEnd']}`;
							li.append(span);
							scheduleList.append(li);
						});
					}else{
						const span = document.createElement('span');
						span.classList.add(styles["empty-selection-message"]);
						span.textContent = `К сожалению, у данного специалиста нет записи в выбранном филиале на ближайшее время`;
						scheduleList.append(span);
					}
				}
			});
			if (scheduleList.children.length === 0){
				const span = document.createElement('span');
				span.classList.add(styles["empty-selection-message"]);
				span.textContent = `К сожалению, у данного специалиста нет записи в выбранном филиале на ближайшее время`;
				scheduleList.append(span);
			}
			this.addListActions(this.dataKeys.scheduleKey);
		}
		else
		{
			this.errorMessage("Schedule is empty");
		}
	},

	getIntervalsForServiceDuration: function(intervals, serviceDurationMs) {
		const newIntervals = [];
		intervals.length && intervals.forEach((day) => {
			const timestampTimeBegin = Number(new Date(day.timeBegin));
			const timestampTimeEnd = Number(new Date(day.timeEnd));
			const timeDifference = timestampTimeEnd - timestampTimeBegin;
			const appointmentsCount = Math.floor(timeDifference / serviceDurationMs);
			if (appointmentsCount > 0)
			{
				if (this.useTimeSteps && (serviceDurationMs >= 30*60*1000)) //use timeSteps only for services with duration>=30 minutes
				{
					let start = new Date(timestampTimeBegin);
					let end = new Date(timestampTimeBegin + serviceDurationMs);
					while(end.getTime() <= timestampTimeEnd){
						newIntervals.push({
							"date": 				day.date,
							"timeBegin": 			this.convertDateToISO(start),
							"timeEnd": 				this.convertDateToISO(end),
							"formattedDate": 		this.convertDateToDisplay(start, false),
							"formattedTimeBegin": 	this.convertDateToDisplay(start, true),
							"formattedTimeEnd": 	this.convertDateToDisplay(end, true),
						});
						start.setMinutes(start.getMinutes() + this.timeStepDurationMinutes);
						end.setMinutes(end.getMinutes() + this.timeStepDurationMinutes);
					}
				}
				else
				{
					for (let i = 0; i < appointmentsCount; i++)
					{
						let start = new Date(timestampTimeBegin + (serviceDurationMs * i));
						let end = new Date(timestampTimeBegin + (serviceDurationMs * (i+1)));
						newIntervals.push({
							"date": 				day.date,
							"timeBegin": 			this.convertDateToISO(start),
							"timeEnd": 				this.convertDateToISO(end),
							"formattedDate": 		this.convertDateToDisplay(start, false),
							"formattedTimeBegin": 	this.convertDateToDisplay(start, true),
							"formattedTimeEnd": 	this.convertDateToDisplay(end, true),
						});
					}
				}

			}
		});
		return newIntervals;
	},

	addListActions: function(dataKey) {
		if (this.eventHandlersAdded[dataKey]) {
			return false;
		}

		const selected = this.selectionNodes[dataKey].selectedNode;
		const list 	 = this.selectionNodes[dataKey].listNode;

		if (selected && list)
		{
			if (!selected.classList.contains(styles['activated'])) {
				selected.addEventListener('click', ()=>{
					list.classList.toggle(styles['active']);
					for (const nodesKey in this.selectionNodes) {
						if (
							this.selectionNodes.hasOwnProperty(nodesKey)
							&& nodesKey !== dataKey
						){
							this.selectionNodes[nodesKey].listNode.classList.remove(styles['active']);
						}
					}
				})
				selected.classList.add(styles['activated']);
			}
			this.eventHandlersAdded[dataKey] = true;
			this.addItemActions(dataKey);
		}
		else{
			this.errorMessage('selected or list not found');
		}
	},

	addItemActions: function(dataKey){
		const items = this.selectionNodes[dataKey].listNode.children;
		if (!items.length){
			return;
		}
		for (let item of items) {
			item.addEventListener('click', (e)=>{
				this.selectionNodes[dataKey].listNode.classList.toggle(styles['active']);
				this.selectionNodes[dataKey].selectedNode.innerHTML = `<span>${e.currentTarget.textContent}</span>`;
				this.changeStep(dataKey, e.currentTarget);
				this.activateBlocks();
			})
		}
	},

	changeStep: function(dataKey, target){
		switch (dataKey) {
			case this.dataKeys.clinicsKey:
				this.filledInputs[dataKey].clinicUid = target.dataset.uid;
				this.filledInputs[dataKey].clinicName = target.dataset.name;
				this.renderSpecialtiesList();
				break;
			case this.dataKeys.specialtiesKey:
				this.filledInputs[dataKey].specialty = target.textContent;
				this.filledInputs[dataKey].specialtyUid = target.dataset.uid;
				if(this.useServices){
					if (this.selectDoctorBeforeService){
						this.renderEmployeesList();
					}else{
						this.renderServicesList();
					}
				}else{
					this.renderEmployeesList();
				}
				break;
			case this.dataKeys.servicesKey:
				this.filledInputs[dataKey].serviceName = target.textContent;
				this.filledInputs[dataKey].serviceUid = target.dataset.uid;
				this.filledInputs[dataKey].serviceDuration = target.dataset.duration;
				this.selectDoctorBeforeService ? this.renderScheduleList(): this.renderEmployeesList();
				break;
			case this.dataKeys.employeesKey:
				this.filledInputs[dataKey].doctorName = target.textContent;
				this.filledInputs[dataKey].refUid = target.dataset.uid;
				if(this.useServices){
					if (this.selectDoctorBeforeService){
						this.renderServicesList();
					}else{
						this.renderScheduleList();
					}
				}else{
					this.renderScheduleList();
				}
				break;
			case this.dataKeys.scheduleKey:
				this.filledInputs[dataKey].orderDate = target.dataset.date;
				this.filledInputs[dataKey].timeBegin = target.dataset.start;
				this.filledInputs[dataKey].timeEnd = target.dataset.end;
				break;
			default:
				this.errorMessage('stepCode is invalid or empty')
				break;
		}
		this.step = dataKey;
	},

	submit: async function(event){
		event.preventDefault();

		if (this.checkRequiredFields())
		{
			this.submitBtn.classList.add(styles['loading']);
			let orderData = { 'action': 'CreateOrderUnauthorized',  ...this.filledInputs.textValues};
			for (let key in this.selectionNodes)
			{
				if (this.selectionNodes.hasOwnProperty(key) && this.filledInputs.hasOwnProperty(key))
				{
					this.selectionNodes[key].inputNode.value = JSON.stringify(this.filledInputs[key]);
					orderData = {...orderData, ...this.filledInputs[key]};
				}
			}
			await this.sendOrder(orderData);
			this.messageNode ? this.messageNode.textContent = "" : void(0);
		}
		else
		{
			if (this.messageNode){
				this.messageNode.textContent = "Не заполнены все обязательные параметры записи";
			}
			else {
				this.errorMessage('Have not all required params to creating an order');
			}
		}
	},

	sendOrder: async function (params) {
		try {
			this.requestParams.body = JSON.stringify(params);
			const response = await fetch(this.ajaxUrl, this.requestParams);

			if (response.ok)
			{
				const result = await response.json();

				if (result.error)
				{
					this.finalizingWidget(false);
					if (result.hasOwnProperty("defaultError")){
						this.errorMessage(result.defaultError);
					}
				}
				else if(result.success)
				{
					this.submitBtn.classList.remove(styles['loading']);
					this.finalizingWidget(true);
				}
				else
				{
					this.errorMessage('Can not decode server response.');
				}
			}
			else
			{
				this.errorMessage('Can not connect to 1c. Status code - ' + response.status);
			}
		} catch(e) {
			this.errorMessage(e);
		}
	},

	checkRequiredFields: function(){
		return !(
			!this.filledInputs[this.dataKeys.clinicsKey].clinicUid ||
			!this.filledInputs[this.dataKeys.clinicsKey].clinicName ||
			!this.filledInputs[this.dataKeys.specialtiesKey].specialty ||
			!this.filledInputs[this.dataKeys.employeesKey].refUid ||
			!this.filledInputs[this.dataKeys.employeesKey].doctorName ||
			!this.filledInputs[this.dataKeys.scheduleKey].orderDate ||
			!this.filledInputs[this.dataKeys.scheduleKey].timeBegin ||
			!this.filledInputs[this.dataKeys.scheduleKey].timeEnd ||
			!this.filledInputs.textValues.name ||
			!this.filledInputs.textValues.surname ||
			!this.filledInputs.textValues.middleName ||
			!this.phoneIsValid(this.textNodes.phone.inputNode)
		);
	},

	activateBlocks: function(){
		let current = false;
		let next = false;
		for (const nodesKey in this.selectionNodes)
		{
			if (!this.useServices && nodesKey === this.dataKeys.servicesKey){
				continue;
			}

			if (this.selectionNodes.hasOwnProperty(nodesKey))
			{
				const block = this.selectionNodes[nodesKey].blockNode;
				if (!current && !next){
					block.classList.remove(styles["hidden"])
				}
				else if (current && !next){
					block.classList.remove(styles["hidden"])
					this.resetValue(nodesKey);
				}
				else{
					block.classList.add(styles["hidden"]);
					this.resetValue(nodesKey);
				}
				next = (current === true);
				if(nodesKey === this.step) {
					current = true;
				}
			}
		}
	},

	resetValue: function(nodesKey) {
		this.selectionNodes[nodesKey].selectedNode.textContent = this.defaultText[nodesKey];
		if (this.filledInputs.hasOwnProperty(nodesKey)){
			for (const propKey in this.filledInputs[nodesKey]) {
				if (this.filledInputs[nodesKey].hasOwnProperty(propKey)){
					this.filledInputs[nodesKey][propKey] = false;
				}
			}
		}
	},

	toggleLoader: function(on = true){
		if (on){
			this.widgetBtnWrap.classList.add(styles['loading']);
		}else{
			this.widgetBtnWrap.classList.remove(styles['loading']);
		}
	},

	activateWidgetButton: function (){
		this.widgetBtn.addEventListener('click', this.showWidget.bind(this));
	},

	showWidget: function () {
		this.form.classList.toggle(styles['active']);
		this.widgetBtn.classList.toggle(styles['active']);
	},

	errorMessage: function(message){
		console.error("App error:\n" + message);
	},

	addPhoneMasks: function (){
		const maskedInputs = this.wrapper.querySelectorAll('input[type="tel"]');
		if (maskedInputs.length)
		{
			maskedInputs.forEach((input) => {
				input.addEventListener('input', (e) => {
					window.appointmentWidget.maskInput(e.currentTarget, '+7(000)000-00-00');
				});
			});
		}
	},

	maskInput: function(input, mask){
		const value = input.value;
		const literalPattern = /[0]/;
		const numberPattern = /[0-9]/;

		let newValue = "";

		let valueIndex = 0;

		for (let i = 0; i < mask.length; i++) {
			if (i >= value.length) break;
			if (mask[i] === "0" && !numberPattern.test(value[valueIndex])) break;
			while (!literalPattern.test(mask[i])) {
				if (value[valueIndex] === mask[i]) break;
				newValue += mask[i++];
			}
			newValue += value[valueIndex++];
		}
		input.value = newValue;
	},

	convertDateToISO: function (timestamp) {
		const date = new Date(timestamp);

		let day = date.getDate();
		if (Number(day)<10) {
			day = `0${day}`;
		}

		let month = date.getMonth()+1;
		if (Number(month)<10) {
			month = `0${month}`;
		}

		let hours = date.getHours();
		if (Number(hours)<10) {
			hours = `0${hours}`;
		}

		let minutes = date.getMinutes();
		if (Number(minutes)<10) {
			minutes = `0${minutes}`;
		}

		return `${date.getFullYear()}-${month}-${day}T${hours}:${minutes}:00`;
	},

	convertDateToDisplay: function (timestamp, onlyTime = false) {
		const date = new Date(timestamp);

		let day = date.getDate();
		if (Number(day)<10) {
			day = `0${day}`;
		}

		let month = date.getMonth()+1;
		if (Number(month)<10) {
			month = `0${month}`;
		}

		let hours = date.getHours();
		if (Number(hours)<10) {
			hours = `0${hours}`;
		}

		let minutes = date.getMinutes();
		if (Number(minutes)<10) {
			minutes = `0${minutes}`;
		}

		if (onlyTime){
			return `${hours}:${minutes}`;
		}
		return `${day}-${month}-${date.getFullYear()}`;
	},

	phoneIsValid: function(phoneInput){
		const phone = phoneInput.value;
		if (!phone){
			return false;
		}
		const validCodes = [904,900,901,902,903,905,906,908,909,910,911,912,913,914,915,916,917,918,
			919,920,921,922,923,924,925,926,927,928,929,930,931,932,933,934,936,937,938,939,950,951,
			952,953,958,960,961,962,963,964,965,966,967,968,969,978,980,981,982,983,984,985,986,987,
			988,989,992,994,995,996,997,999];
		const code = Number(phone[3] + phone[4] + phone[5]);
		const isValid = validCodes.includes(code) && phone.length === 16;
		!isValid ? phoneInput.parentElement.classList.add(styles["error"]) : phoneInput.parentElement.classList.remove(styles["error"]);
		return isValid;
	},

	finalizingWidget: function(success){
		let errorDesc = `К сожалению, создание заявки не удалось.\n 
						Возможно, выбранное вами время приёма уже было занято кем-то другим. 
						Пожалуйста, <a href="javascript:window.location.reload()">обновите страницу</a> 
						для получения актуального графика и попробуйте ещё раз.`;

		this.resultBlock.classList.add(styles['active']);

		const resText = this.resultBlock.querySelector('p');
		this.form.classList.add(styles['off']);
		if (resText) {
			if (success) {
				resText.textContent = "Заявка успешно создана";
				resText.classList.add(styles['success']);
				this.finalAnimations();
			}
			else{
				resText.innerHTML = errorDesc;
				resText.classList.add(styles['error']);
			}
		}
	},

	finalAnimations: function(){
		this.widgetBtn.classList.remove(styles['active']);
		this.widgetBtn.classList.add(styles['success']);
		setTimeout(()=>{
			this.form.classList.remove(styles['active']);
		}, 4000);
	}
}

let html = `
<div class="${styles['widget-wrapper']}" id="${settings.wrapperId}">
    <div class="${styles['appointment-button-wrapper']} ${styles['loading']}" id="${settings.widgetBtnWrapId}">
        <button id="${settings.widgetBtnId}"></button>
        <div class="${styles['appointment-loader']}">
            <div class="${styles['wBall']}" id="${styles['wBall_1']}"><div class="${styles['wInnerBall']}"></div></div>
            <div class="${styles['wBall']}" id="${styles['wBall_2']}"><div class="${styles['wInnerBall']}"></div></div>
            <div class="${styles['wBall']}" id="${styles['wBall_3']}"><div class="${styles['wInnerBall']}"></div></div>
            <div class="${styles['wBall']}" id="${styles['wBall_4']}"><div class="${styles['wInnerBall']}"></div></div>
            <div class="${styles['wBall']}" id="${styles['wBall_5']}"><div class="${styles['wInnerBall']}"></div></div>
        </div>
    </div>

    <form id="${settings.formId}" class="${styles['appointment-form']}">
`
for(const key in settings.selectionNodes)
{
	if (settings.selectionNodes.hasOwnProperty(key)){
		html = html+`
			<div class="${styles['selection-block']} ${key===settings.dataKeys.clinicsKey ? '' : styles['hidden']}" id="${key}_block">
				<p class="${styles['selection-item-selected']}" id="${key}_selected">${settings.defaultText[key]}</p>
				<ul class="${styles['appointment-form_head_list']} ${styles['selection-item-list']}" id="${key}_list"></ul>
				<input type="hidden" name="${key}" id="${key}_value">
			</div>
		`;
	}
}
for(const key in settings.textBlocks)
{
	if (settings.textBlocks.hasOwnProperty(key)){
		html = html+`<label class="${styles['appointment-form_input-wrapper']}"><${settings.textBlocks[key]["tag"]}`;
		for(const attr in settings.textBlocks[key])
		{
			if (settings.textBlocks[key].hasOwnProperty(attr) && attr !== "tag"){
				html = html+` т
					${attr}="${settings.textBlocks[key][attr]}"	
				`;
			}
		}
		html = html+`></${settings.textBlocks[key]["tag"]}></label>`;
	}
}

html = html + `<p id="${settings.messageNodeId}"></p>

        <div class="${styles['appointment-form_submit-wrapper']}">
            <button type="submit" id="${settings.submitBtnId}" class="${styles['appointment-form_button']}">Записаться на приём</button>
        </div>

        <div id="${settings.appResultBlockId}"><p></p></div>
    </form>
</div> 
`;

document.getElementById("appointment-widget-root").innerHTML = html;

window.appointmentWidget.init(settings);