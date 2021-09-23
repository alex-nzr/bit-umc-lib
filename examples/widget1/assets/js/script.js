'use strict';

document.addEventListener('DOMContentLoaded', ()=>{

	const state = {
		request: {
			method: 'POST',
			url: '/lebgok/examples/widget1/ajax/ajax.php',
			headers: {
				'Content-Type': 'application/json;charset=utf-8',
			},
			body: '',
		},
		clinics: [],
		employees: [],
		schedule: [],
		actionsState: {
			'appointment-form-clinic': false,
			'appointment-form-specialties': false,
			'employees-form-specialties': false,
		},
		step: 0,
		defaultValues:{
			step1: 'Выберите клинику *',
			step2: 'Выберите специализацию *',
			step3: 'Выберите врача *',
			step4: 'Выберите время *',
		},
		selected: {
			clinicUid: false,
			specialty: false,
			doctorName: false,
			refUid: false,
			orderDate: false,
			timeBegin: false,
			timeEnd: false,
			name: false,
			surname: false,
			middleName: false,
			phone: false,
			address: false,
			comment: false,
		},
		requiredInputs: false,
	}

	{//masks
		const maskedInputs = document.querySelectorAll('input[type="tel"]');
			if (maskedInputs.length)
			{
				maskedInputs.forEach((element, index) => {
					element.addEventListener('input', (e) => {
						maskInput(e.currentTarget, '+70000000000');
					});
				});
			}
	}//masks

	{//form treatment
		const sbmtBtn = document.getElementById('create_order');
		const name = document.getElementById('name');
		const surname = document.getElementById('surname');
		const middleName = document.getElementById('middleName');
		const phone = document.getElementById('phone');
		const comment = document.getElementById('comment');

		state.requiredInputs = [
			name,
			surname,
			phone,
			middleName,
		];

		state.requiredInputs.forEach(field => {
			field.addEventListener('input', (e)=>{
				checkAll();
			})
		});

		comment.addEventListener('input', (e)=>{
			state.selected.comment = e.target.value;
		})

		sbmtBtn.addEventListener('click', (e) => {
			const form = document.getElementById('appointment-form');
			if (form){
				form.classList.add('off');
			}
			return createOrder(state.selected, e.currentTarget);
		})
	}//form treatment

	{//start widget
		window.addEventListener("load", async ()=>{
			toggleWidgetLoader();
			try{
				const clinicsResponse = await GetListClinic();
				const clinics = await clinicsResponse.json();

				if (clinics.error){
					errorMessageToLog(clinics.error);
				}else{
					if (clinics.length > 0){
						state.clinics = clinics;
						const scheduleResponse = await GetSchedule();
						const schedule = await scheduleResponse.json();

						if (schedule.error){
							errorMessageToLog(schedule.error);
						}else{
							if (schedule.hasOwnProperty("employees") && schedule.hasOwnProperty("schedule")){
								state.employees = schedule.employees;
								state.schedule = schedule.schedule;
								startRender();
							}
						}
					}else{
						errorMessageToLog("Clinics not found")
					}
				}
			}catch (e) {
				errorMessageToLog(e.message)
			}
		});
	}//start widget

	async function GetListClinic(){
		try {
			state.request.body = JSON.stringify({action: 'GetListClinics'});
			const response = await fetch(state.request.url, {
				method: state.request.method,
				headers:state.request.headers,
				body: state.request.body,
			});
			if (response.ok) {
				return response;
			}else{
				errorMessageToLog(`Get clinics error. Status code ${response.status}`);
			}
		} catch(e) {
			errorMessageToLog(e.message);
		}
	}

	async function GetSchedule(){
		try {
			state.request.body = {
				"action": "GetSchedule"
			}

			const response = await fetch(state.request.url, {
				method: state.request.method,
				headers:state.request.headers,
				body: JSON.stringify(state.request.body),
			});
			if (response.ok) {
				return response;
			}else{
				errorMessageToLog(`Can not get schedule. Error status - ${response.status}`);
			}
		} catch(e) {
			errorMessageToLog(e.message)
		}
	}

	const startRender = () => {
		const clinicsRendered = renderClinicList();
		if (clinicsRendered)
		{
			setTimeout(()=>{
				toggleWidgetLoader(false);
				activateButton();
			}, 3000)
		}
	}

	const renderClinicList = () => {
		if(state.clinics.length) {
			state.clinics.forEach((clinic) => {
				const li = document.createElement('li');
				if (clinic.uid) {
					li.dataset.uid = clinic.uid;
				}else{
					li.dataset.uid = "не заполнено";
				}
				li.textContent = clinic.name;
				document.getElementById('clinic_list').append(li);
			});
			addListActions('appointment-form-clinic');
			return true;
		}
		return false;
	}

	const renderSpecialtiesList = () => {
		const specList = document.getElementById('specialties_list');
		specList.innerHTML = '';
		state.actionsState[`appointment-form-specialties`] = false;
		if(Object.keys(state.employees).length > 0) {
			for (let uid in state.employees) {
				const li = document.createElement('li');
				if (state.employees.hasOwnProperty(uid)){
					li.textContent = state.employees[uid].specialty;
					specList.append(li);
				}
			}
			return addListActions('appointment-form-specialties');
		}
	}

	const renderEmployeesList = () => {
		const empList = document.getElementById('employees_list');
		empList.innerHTML = '';
		state.actionsState[`appointment-form-employees`] = false;
		if(Object.keys(state.employees).length > 0) {
			for (let uid in state.employees)
			{
				if (state.employees.hasOwnProperty(uid))
				{
					if (state.selected.specialty === state.employees[uid].specialty)
					{
						const li = document.createElement('li');
						li.dataset.uid = uid;
						li.dataset.specialty = state.employees[uid].specialty;
						li.textContent = state.employees[uid].name;
						empList.append(li);
					}
				}
			}
			return addListActions('appointment-form-employees');
		}
	}

	const renderScheduleList = () => {
		const scheduleList = document.getElementById('schedule_list');
		scheduleList.innerHTML = '';
		state.actionsState[`appointment-form-schedule`] = false;
		if(state.schedule.length) {
			state.schedule.forEach((employeeSchedule) => {
				if (employeeSchedule.clinicUid === state.selected.clinicUid && employeeSchedule.refUid === state.selected.refUid)
				{
					if (employeeSchedule.timetable?.free?.length)
					{
						employeeSchedule.timetable.free.forEach((day) => {
							const li = document.createElement('li');
							const span = document.createElement('span');

							li.dataset.date = day.date;

							li.dataset.start = day.timeBegin;
							li.dataset.end = day.timeEnd;
							li.textContent = `${day.formattedDate} `;
							span.textContent = `${day.formattedTimeBegin}-${day.formattedTimeEnd}`;
							li.append(span);
							scheduleList.append(li);
						});
					}else{
						const span = document.createElement('span');
						span.style.display = 'block';
						span.style.fontSize = '11px';
						span.style.padding = '0 15px';
						span.textContent = `К сожалению, у данного специалиста нет записи на ближайшее время`;
						scheduleList.append(span);
					}
				}
			});
			return addListActions('appointment-form-schedule');
		}
	}

	const addListActions = (blockID) => {
		if (state.actionsState[`${blockID}`]) {
			return false;
		}
		const select = document.getElementById(blockID).querySelector('.selection-item-selected');
		const list = select.nextElementSibling;

		if (list.classList.contains('selection-item-list') && list.tagName === 'UL' && list.id) {
			if (!select.classList.contains('activated')) {
				select.addEventListener('click', (e)=>{
					list.classList.toggle('active');
					document.querySelectorAll(`.selection-item-list`).forEach((el) => {
						if (el.id !== list.id) {
							el.classList.remove('active');
						}
					});
				})
				select.classList.add('activated');
			}
			state.actionsState[`${blockID}`] = true;
			return addItemActions(list.id);
		}else{
			return errorMessageToLog('Invalid items list');
		}
	}
	const addItemActions = (listID) => {
		const list = document.getElementById(listID);
		list.querySelectorAll(`li`).forEach((el)=> {
			el.addEventListener('click', (e)=>{
				const selected = list.previousElementSibling;

				if (selected.classList.contains('selection-item-selected') && selected.tagName === 'P') {
					list.classList.toggle('active');
					selected.textContent = e.currentTarget.textContent;

					switch (listID) {
						case 'clinic_list':
							state.selected.clinicUid = e.currentTarget.dataset.uid;
							state.step = 1;
							renderSpecialtiesList();
							break;
						case 'specialties_list':
							state.selected.specialty = e.currentTarget.textContent;
							state.step = 2;
							renderEmployeesList();
							break;
						case 'employees_list':
							state.selected.doctorName = e.currentTarget.textContent;
							state.selected.refUid = e.currentTarget.dataset.uid;
							state.step = 3;
							renderScheduleList();
							break;
						case 'schedule_list':
							state.selected.orderDate = e.currentTarget.dataset.date;
							state.selected.timeBegin = e.currentTarget.dataset.start;
							state.selected.timeEnd = e.currentTarget.dataset.end;
							state.step = 4;
							break;
						default:
							console.error('no actions found')
							break;
					}
					checkAll();
					return unhideBlocks();
				}else{
					return console.error('Invalid selected')
				}
			})
		});
	}

	const createOrder = async(dataObj, button) => {
		if (checkBeforeSubmit(dataObj))
		{
			button.classList.add('loading');

			try {
				dataObj.action = 'CreateOrder';

				const response = await fetch(state.request.url, {
					method: state.request.method,
					headers:state.request.headers,
					body: JSON.stringify(dataObj),
				});

				if (response.ok)
				{
					const result = await response.json();

					if (result.error)
					{
						finalizingWidget(false);
						errorMessageToLog(result.error);
						if (result.hasOwnProperty("defaultError")){
							errorMessageToLog(result.defaultError);
						}
					}
					else if(result.success)
					{
						button.classList.remove('loading');
						finalizingWidget(true);
					}
					else
					{
						errorMessageToLog('Can not decode server response.');
					}
				}
				else
				{
					errorMessageToLog('Can not connect to 1c');
				}
			} catch(e) {
				errorMessageToLog(e);
			}
		}
		else
		{
			errorMessageToLog('Have not all required params to creating an order');
		}
	}

	const unhideBlocks = () => {
		let blocks = document.querySelectorAll('[data-step]');
		blocks.forEach((block) => {
			if (Number(block.dataset.step) > Number(state.step)) {
				if (Number(block.dataset.step) > (Number(state.step)+1)) {
					block.classList.add('hidden');
				}else{
					block.classList.remove('hidden');
				}
				resetValues(block);
			}else{
				block.classList.remove('hidden');
			}
		});
	}

	const resetValues = (block) => {
		const accord = {
			1: ['clinicUid'],
			2: ['specialty'],
			3: ['refUid','doctorName'],
			4: ['orderDate', 'timeBegin', 'timeEnd'],
		}

		let select = block.querySelector('.selection-item-selected');
		select.textContent = state.defaultValues[`step${block.dataset.step}`];
		accord[block.dataset.step].forEach((prop) => {
			state.selected[prop] = false;
		});
	}

	const checkCompletedFields = (textInputsArray) =>{
		if (!textInputsArray || !textInputsArray.length) {
			return false;
		}

		let allValid = true;
		textInputsArray.forEach((input) => {
			if (input.value) {
				if (input.type === 'tel') {
					if (input.value.length < 12) {
						allValid = false;
						state.selected[input.id] = false;
					}else if (!phoneCodeIsValid(input.value)) {
						allValid = false;
						state.selected[input.id] = false;
					}else{
						state.selected[input.id] = input.value;
					}
				}else if (input.value.length<3) {
					allValid = false;
					state.selected[input.id] = false;
				}else{
					state.selected[input.id] = input.value;
				}
			}else{
				allValid = false;
				state.selected[input.id] = false;
			}
		});

		if (!state.selected.clinicUid ||
			!state.selected.specialty ||
			!state.selected.refUid ||
			!state.selected.orderDate ||
			!state.selected.timeBegin ||
			!state.selected.timeEnd ||
			!state.selected.name ||
			!state.selected.surname ||
			!state.selected.middleName ||
			!state.selected.phone) {

			allValid = false;
		}

		return allValid;
	}
	const checkAll = () => {
		const sbmtBtnContainer = document.querySelector('.appointment-form_submit-wrapper');
		if (checkCompletedFields(state.requiredInputs)) {
			sbmtBtnContainer.classList.add('active');
		}else{
			sbmtBtnContainer.classList.remove('active');
		}
	}
	const checkBeforeSubmit = (obj) => {
		document.querySelectorAll('.selection-block, .appointment-form_input-wrapper').forEach((el) => {
			el.classList.remove('error');
		});

		let isValid = true;

		if (!obj.clinicUid) {document.getElementById('appointment-form-clinic').classList.add('error');isValid = false;}
		if (!obj.refUid) {document.getElementById('appointment-form-employees').classList.add('error');isValid = false;}
		if (!obj.specialty) {document.getElementById('appointment-form-specialties').classList.add('error');isValid = false;}
		if (!obj.orderDate||!obj.timeBegin||!obj.timeEnd) {document.getElementById('appointment-form-schedule').classList.add('error');isValid = false;}
		if (!obj.surname) {document.getElementById('surname').parentElement.classList.add('error');isValid = false;}
		if (!obj.name) {document.getElementById('name').parentElement.classList.add('error');isValid = false;}
		if (!obj.middleName) {document.getElementById('middleName').parentElement.classList.add('error');isValid = false;}
		if (!obj.phone || !phoneCodeIsValid(obj.phone) || obj.phone.length<12) {document.getElementById('phone').parentElement.classList.add('error');isValid = false;}

		return isValid;
	}

	const maskInput = (input, mask)=> {

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
	}
	const phoneCodeIsValid = (phone)=>{
		const validCodes = [904,900,901,902,903,905,906,908,909,910,911,912,913,914,915,916,917,918,
			919,920,921,922,923,924,925,926,927,928,929,930,931,932,933,934,936,937,938,939,950,951,
			952,953,958,960,961,962,963,964,965,966,967,968,969,978,980,981,982,983,984,985,986,987,
			988,989,992,994,995,996,997,999];
		const code = Number(phone[2] + phone[3] + phone[4]);
		return validCodes.includes(code);
	}

	const finalizingWidget = (success) =>{
		let errorDesc = `К сожалению, создание заявки не удалось. 
						Возможно, в процессе заполнения формы, 
						выбранное вами время приёма уже было занято кем-то другим. 
						Пожалуйста, обновите страницу для получения актуального графика и попробуйте ещё раз.`;

		document.querySelector('.appointment-result-wrapper').classList.add('active');

		const resText = document.getElementById('appointment-result');
		if (resText) {
			if (success) {
				resText.textContent = "Заявка успешно создана";
				resText.classList.add('success');
				finalAnimations();
			}
			else{
				resText.textContent = errorDesc;
				resText.classList.add('error');
			}
		}
	}

	const errorMessageToLog = (message) => {
		console.error("ERROR:\n" + message);
	}

	const toggleWidgetLoader = (on = true) => {
		const btnWrap = document.querySelector('.appointment-button-wrapper');
		if (btnWrap){
			if (on){
				btnWrap.classList.add('loading');
			}else{
				btnWrap.classList.remove('loading');
			}
		}
	}

	const activateButton = () => {
		const  btn = document.querySelector("#appointment-button");
		btn ? btn.addEventListener('click', showWidget) : void(0);
	}

	const showWidget = (e) => {
		document.getElementById('appointment-form').classList.toggle('active');
		e.currentTarget.classList.toggle('active');
	}

	const finalAnimations = () => {
		const  btn = document.querySelector("#appointment-button");
		if (btn){
			btn.removeEventListener('click', showWidget);
			btn.classList.remove('active');
			btn.classList.add('success');
		}
		const form = document.getElementById('appointment-form');
		if (form)
		{
			setTimeout(()=>{
				form.classList.remove('active');
			}, 4000);
		}
	}
})//DomContentLoaded

