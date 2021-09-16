'use strict';

document.addEventListener('DOMContentLoaded', ()=>{

const state = {
	request: {
		method: 'POST',
		url: '/appointment-widget/module/ajax.php',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: {
			methodName: 'empty',
		},
	},
	clinics: [],
	specialties: [],
	employees: [],
	shedule: [],
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
		clinicGUID: false,
		specialty: false,
		doctorName: false,
		doctorUID: false,
		orderDate: false,
		timeBegin: false,
		timeEnd: false,
		name: false,
		surname: false,
		parentname: false,
		phone: false,
		address: false,
		comment: false,
	},
	requiredInputs: false,
}

{//masks
	var maskedInputs = document.querySelectorAll('input[type="tel"]')
		   .forEach( (element, index)=> {
		    	element.addEventListener('input', (e)=>{
		    		return maskInput(e.currentTarget, '+70000000000');
		    	});
			});
}//masks

{//form treatment
	const sbmtBtn = document.getElementById('create_order');
	const name = document.getElementById('name');
	const surname = document.getElementById('surname');
	const parentname = document.getElementById('parentname');
	const phone = document.getElementById('phone');
	const comment = document.getElementById('comment');

	state.requiredInputs = [
		name,
		surname,
		phone,
		parentname,
	];

	state.requiredInputs.forEach((field, i, fields) => {
		field.addEventListener('input', (e)=>{
			checkAll();
		})
	});

	comment.addEventListener('input', (e)=>{
		state.selected.comment = e.target.value;
	})

	sbmtBtn.addEventListener('click', (e) => {
		document.getElementById('appointment-form').classList.add('off');
		return createOrder(state.selected, e.currentTarget);
	})
}//form treatment

{//start widget
	window.addEventListener("message", (e)=>{
	    if (e.data == 'startWidget' /*&& (event.origin == document.getElementById('SITE_URL').value)*/) {
			return GetListClinic();        
	    }else{
	    	console.error('invalid message data')
	    }
	});
}//start widget

async function GetListClinic(){
	try {
		state.request.body.methodName = 'GetListClinic';
		const response = await fetch(state.request.url, {
	        method: state.request.method,
	        headers:state.request.headers,
	        body: encodeToUrl(state.request.body),
		});
		if (response.ok) {
			const clinics = await response.json();
			if (clinics.requestError) {
				throw new Error(clinics.requestError);
				return false;
			}else if(clinics.СписокКлиник){
				if (clinics.СписокКлиник.Клиника.length) {
					state.clinics = clinics.СписокКлиник.Клиника;
				}else{
					state.clinics = [clinics.СписокКлиник.Клиника];
				}
				return GetSchedule();
			}else{
				throw new Error('Something went wrong...');
				return false;
			}
		}else{
			throw new Error('Can not get clinic list');
			return false;
		}
	} catch(e) {
		throw new Error(e);
		return false;
	}
}

async function GetSchedule(){
	try {
		state.request.body.methodName = 'GetSchedule';
		state.request.body.startDate = ((Number(new Date()))/1000).toFixed(0);//current time in seconds
		state.request.body.finishDate = Number(state.request.body.startDate) + 60*60*24*30;//currend time plus one month

		const response = await fetch(state.request.url, {
	        method: state.request.method,
	        headers:state.request.headers,
	        body: encodeToUrl(state.request.body),
		});
		if (response.ok) {
			const shedule = await response.json();
			if (shedule.requestError) {
				throw new Error(shedule.requestError);
				return false;
			}else if(shedule.ГрафикиДляСайта.ГрафикДляСайта){
				if (shedule.ГрафикиДляСайта.ГрафикДляСайта.length) {
					state.shedule = shedule.ГрафикиДляСайта.ГрафикДляСайта;
				}else{
					state.shedule = [shedule.ГрафикиДляСайта.ГрафикДляСайта];
				}

				return GetListSpecialties();
			}else{
				throw new Error('Something went wrong...');
				return false;
			}
		}else{
			throw new Error('Can not get shedule');
			return false;
		}
	} catch(e) {
		console.error(e);
		return false;
	}
}

const GetListSpecialties = () => {
	state.specialties = [...new Set(state.shedule.map((item)=> {
		if (item.Специализация && item.Специализация.length>0) {
			return item.Специализация;
		}else{
			return 'Без специализации';
		}
	}))];

	return GetListEmployees();
}

const GetListEmployees = () => {
	state.employees = state.shedule.map((item)=> {
		let spec = 'Без специализации';
		if (item.Специализация && item.Специализация.length>0) {
			spec = item.Специализация;
		}
		return {
			name: item.СотрудникФИО,
			spec: spec,
			UID: item.СотрудникID
		}
	}); 
	return renderClinicList();
}

const renderClinicList = () => {
    if(state.clinics.length) {
    	state.clinics.forEach((clinic) => {
    		const li = document.createElement('li');
    		if (clinic.УИД) {
    			li.dataset.guid = clinic.УИД;
    		}else{
    			li.dataset.guid = "не заполнено";
    		}
    		li.textContent = clinic.Наименование;
    		document.getElementById('clinic_list').append(li);
    	});
        addListActions('appointment-form-clinic');
        return window.top.postMessage('activateButton', '*');
    }
}

const renderSpecialtiesList = () => {
	//на данный момент нет возможности разбить специализации по клиникам, как планировалось,
	// поэтому нет провеки параметра state.selected.clinicGUID
	//по этой же причине специализации сохраняются в массиве без доп параметров
	const specList = document.getElementById('specialties_list');
	specList.innerHTML = '';
	state.actionsState[`appointment-form-specialties`] = false;
    if(state.specialties.length) {
    	state.specialties.forEach((specialty) => {
    		const li = document.createElement('li');
    		li.textContent = specialty;
    		specList.append(li);
    	});
        return addListActions('appointment-form-specialties');
    }
}

const renderEmployeesList = () => {
	const empList = document.getElementById('employees_list');
	empList.innerHTML = '';
	state.actionsState[`appointment-form-employees`] = false;
    if(state.employees.length) {
    	state.employees.forEach((employee) => {
    		if (employee.spec == state.selected.specialty) {
    			const li = document.createElement('li');
    			li.dataset.uid = employee.UID;
    			li.dataset.specialty = employee.spec;
    			li.textContent = employee.name;
    			empList.append(li);
    		}
    	});
        return addListActions('appointment-form-employees');
    }
} 

const renderSheduleList = () => {
	const sheduleList = document.getElementById('shedule_list');
	sheduleList.innerHTML = '';
	state.actionsState[`appointment-form-shedule`] = false;
    if(state.shedule.length) {
    	state.shedule.forEach((employeeShedule) => {
    		if (employeeShedule.Клиника == state.selected.clinicGUID && employeeShedule.СотрудникID == state.selected.doctorUID) {
    			if (employeeShedule.ПериодыГрафика.СвободноеВремя && employeeShedule.ПериодыГрафика.СвободноеВремя.ПериодГрафика) {
    				if (!employeeShedule.ПериодыГрафика.СвободноеВремя.ПериодГрафика.length) {
    					employeeShedule.ПериодыГрафика.СвободноеВремя.ПериодГрафика = [employeeShedule.ПериодыГрафика.СвободноеВремя.ПериодГрафика];
    				}
    			
	    			employeeShedule.ПериодыГрафика.СвободноеВремя.ПериодГрафика.forEach((day) => {
	    				const dateDiff = convertDate(day.ВремяОкончания, false, true) - convertDate(day.ВремяНачала, false, true);//свободное для записи время в миллисекундах
	    				let duration = 1000*60*30;//длительность приёма. Ставим 30 минут. По желанию можно брать из объекта day и конвертировать в миллисекунды
	    				const halfHoursCount = (dateDiff/duration).toFixed(0);//количество приёмов в промежутке свободного времени
	    				const tail = dateDiff%duration;//остаток времени, если интервалы не делятся на длительность ровно
	    				const periods = []; //массив, в который упадут интервалы приёмов, в читабельном формате
	    				for (let i = 0; i < halfHoursCount; i++) {
	    					let start = convertDate(day.ВремяНачала, false, true) + (duration * i);//время в мс
	    					let finish = convertDate(day.ВремяНачала, false, true) + (duration * (i+1));//время в мс

	    					periods.push({
	    						start: convertTime(start),//читабельное время для показа в форме
	    						finish: convertTime(finish),//читабельное время для показа в форме
	    					});
	    				}
	    				if(tail && tail>(15*60*1000)){//если остаток больше 15 минут делаем его ещё одним приёмом
	    					periods.push({
	    						start: convertTime((convertDate(day.ВремяОкончания, false, true) - tail)),
	    						finish: convertTime(convertDate(day.ВремяОкончания, false, true)),
	    					});
	    				}

	    				periods.forEach((period) => {
	    					const li = document.createElement('li');
	    					const span = document.createElement('span');
	    					
	    					li.dataset.date = convertDate(day.Дата);//дата для вывода пользователю в форме

	    					li.dataset.start = period.start;
	    					li.dataset.finish = period.finish;
	    					li.textContent = `${li.dataset.date} `;
	    					span.textContent = `${li.dataset.start}-${li.dataset.finish}`;
	    					li.append(span);
	    					sheduleList.append(li);
	    				});
	    			});
	    		}else{
	    			const span = document.createElement('span');
	    			span.style.display = 'block';
	    			span.style.fontSize = '11px';
	    			span.style.padding = '0 15px';
	    			span.textContent = `К сожалению, у данного специалиста нет записи на ближайшее время`;
	    			sheduleList.append(span);
	    		}
    		}
    	});
        return addListActions('appointment-form-shedule');
    }
}

const addListActions = (blockID) => {
	if (state.actionsState[`${blockID}`]) {
		return false;
	}
	const select = document.getElementById(blockID).querySelector('.selection-item-selected');
	const list = select.nextElementSibling;

	if (list.classList.contains('selection-item-list') && list.tagName == 'UL' && list.id) {
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
		return console.error('Invalid itemlist');
	}
}
const addItemActions = (listID) => {
	const list = document.getElementById(listID);
	list.querySelectorAll(`li`).forEach((el)=> {
		el.addEventListener('click', (e)=>{
			const selected = list.previousElementSibling;

			if (selected.classList.contains('selection-item-selected') && selected.tagName == 'P') {
				list.classList.toggle('active');
				selected.textContent = e.currentTarget.textContent;
				
				switch (listID) {
					case 'clinic_list':
						state.selected.clinicGUID = e.currentTarget.dataset.guid;
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
						state.selected.doctorUID = e.currentTarget.dataset.uid;
						state.step = 3;
    					renderSheduleList();
						break;
					case 'shedule_list':
						state.selected.orderDate = convertDateToRequest(e.currentTarget.dataset.date);//конвертирование даты и времени в формат который нужен 1С
						state.selected.timeBegin = convertTimeToRequest(e.currentTarget.dataset.date, e.currentTarget.dataset.start);//конвертирование даты и времени в формат который нужен 1С
						state.selected.timeEnd = convertTimeToRequest(e.currentTarget.dataset.date, e.currentTarget.dataset.finish);//конвертирование даты и времени в формат который нужен 1С
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
	return;
}

const createOrder = async(dataObj, button) => {
	if (checkBeforeSubmit(dataObj)) {
		
		button.classList.add('loading');

		try {
			state.request.body.methodName = 'CreateOrder';

			state.request.body.doctorUID 	= dataObj.doctorUID;
			state.request.body.surname 		= dataObj.surname;
			state.request.body.parentname 	= dataObj.parentname;
			state.request.body.name 		= dataObj.name;
			state.request.body.orderDate 	= dataObj.orderDate;
			state.request.body.timeBegin 	= dataObj.timeBegin;
			state.request.body.timeEnd 		= dataObj.timeEnd;
			state.request.body.phone 		= dataObj.phone;
			state.request.body.clinicGUID 	= dataObj.clinicGUID;
			if (dataObj.comment) {
				state.request.body.comment 	= dataObj.comment;
			}
			
			const response = await fetch(state.request.url, {
		        method: state.request.method,
		        headers:state.request.headers,
		        body: encodeToUrl(state.request.body),
			});

			if (response.ok) {

				const result = await response.json();  

				if (result.requestError) {
					throw new Error(result.requestError);
					return false;
				}else if(result.ОтветНаЗаписьССайта){
					
					button.classList.remove('loading');

					if (result.ОтветНаЗаписьССайта.Результат == "true") {
						return finalizingWidget(true);
					}else{
						return finalizingWidget(false);
					}
				}else{
					throw new Error('Can not decode server response.');
					return false;
				}
			}else{
				throw new Error('Can not connect to 1c');
				return false;
			}
		} catch(e) {
			console.error(e);
			return false;
		}
	}else{
		console.error('Have not all required params to creating an order');
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
		1: ['clinicGUID'],
		2: ['specialty'],
		3: ['doctorUID','doctorName'],
		4: ['orderDate', 'timeBegin', 'timeEnd'],
	}

	let select = block.querySelector('.selection-item-selected');
	select.textContent = state.defaultValues[`step${block.dataset.step}`];
	accord[block.dataset.step].forEach((prop) => {
		state.selected[prop] = false;
	});
}

const encodeToUrl = (obj)=>{
	let params = new URLSearchParams();

	for (let prop in obj) {
	  	params.append(prop, obj[prop]);
	}

	return params.toString();
}

const convertDate = (string, time = false, full = false) => {
	//const formattedString = string.replace('T', ' ');
	const date = new Date(string);

	if (full) {
		return Number(date);
	}

	if (time) {
		let hours = date.getHours();
		if (Number(hours)<10) {
			hours = `0${hours}`;
		}

		let minutes = date.getMinutes();
		if (Number(minutes)<10) {
			minutes = `0${minutes}`;
		}

		return `${hours}:${minutes}`;
	}else{
		let day = date.getDate();
		if (Number(day)<10) {
			day = `0${day}`;
		}

		let month = date.getMonth()+1;
		if (Number(month)<10) {
			month = `0${month}`;
		}

		return `${day}.${month}.${date.getFullYear()}`;
	}
}

const convertTime = (unixTime) => {
	const date = new Date(unixTime);

	let hours = date.getHours();
	if (Number(hours)<10) {
		hours = `0${hours}`;
	}

	let minutes = date.getMinutes();
	if (Number(minutes)<10) {
		minutes = `0${minutes}`;
	}

	return `${hours}:${minutes}`;
}

const convertTimeToRequest = (date, time) => {
	//"2021-01-28T13:00:00"
	let newDate = date.split('.').reverse().join('-');
	let newDateString =  `${newDate} ${time}:00`;
	let newDateNumberInSec = (Number(new Date(newDateString))/1000).toFixed(0);
	return newDateNumberInSec;
}
const convertDateToRequest = (date) => {
	return date.split('.').reverse().join('');
}

const checkCompletedFields = (textInputsArray) =>{
	if (!textInputsArray || !textInputsArray.length) {
		return false;
	}

	let allValid = true;
	textInputsArray.forEach((input) => {
		if (input.value) {
			if (input.type == 'tel') {
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

	if (!state.selected.clinicGUID ||
		!state.selected.specialty ||
		!state.selected.doctorUID ||
		!state.selected.orderDate ||
		!state.selected.timeBegin ||
		!state.selected.timeEnd ||
		!state.selected.name ||
		!state.selected.surname ||
		!state.selected.parentname ||
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

	if (!obj.clinicGUID) {document.getElementById('appointment-form-clinic').classList.add('error');isValid = false;}
	if (!obj.doctorUID) {document.getElementById('appointment-form-employees').classList.add('error');isValid = false;}
	if (!obj.specialty) {document.getElementById('appointment-form-specialties').classList.add('error');isValid = false;}
	if (!obj.orderDate||!obj.timeBegin||!obj.timeEnd) {document.getElementById('appointment-form-shedule').classList.add('error');isValid = false;}
	if (!obj.surname) {document.getElementById('surname').parentElement.classList.add('error');isValid = false;}
	if (!obj.name) {document.getElementById('name').parentElement.classList.add('error');isValid = false;}
	if (!obj.parentname) {document.getElementById('parentname').parentElement.classList.add('error');isValid = false;}
	if (!obj.phone || !phoneCodeIsValid(obj.phone) || obj.phone.length<12) {document.getElementById('phone').parentElement.classList.add('error');isValid = false;}

	return isValid;
}

const maskInput = (input, mask)=> {
	    	
	const value = input.value;
	const literalPattern = /[0\*]/;
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
			return window.top.postMessage('appointmentSuccess', '*');
		}
		else{
			resText.textContent = errorDesc;
			resText.classList.add('error');
		}
	}
	return;
}
})//DomContentLoaded


/*
async function GetListEmployees(){//not used function. Employees and specialties can be taken from shedule
	
	try {
		state.request.body.methodName = 'GetListEmployees';
		const response = await fetch(state.request.url, {
	        method: state.request.method,
	        headers:state.request.headers,
	        body: encodeToUrl(state.request.body),
		});
		if (response.ok) {
			const employees = await response.json();
			if (employees.requestError) {
				throw new Error(employees.requestError);
				return false;
			}else{
				state.specialties = [...new Set(employees.Сотрудники.Сотрудник.map((employee)=> {
					if (employee.Специализация && employee.Специализация.length>0) {
						return employee.Специализация;
					}else{
						return 'Без специализации';
					}
				}))];

				state.employees = employees.Сотрудники.Сотрудник.map((employee)=> {
					let spec = 'Без специализации';
					if (employee.Специализация && employee.Специализация.length>0) {
						spec = employee.Специализация;
					}
					return {
						name: employee.Наименование,
						spec: spec,
						UID: employee.UID
					}
				})
				return GetSchedule();
			}
		}else{
			throw new Error('Can not get employees list');
			return false;
		}
	} catch(e) {
		throw new Error(e);
		return false;
	}
}
*/