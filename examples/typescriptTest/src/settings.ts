import {ISettings, ITextObject} from "./types/settings";

const getProjectSettings = (params: any):ISettings => {
    const settings: ISettings = {
        useServices:                  'Y',
        selectDoctorBeforeService:    'Y',
        useTimeSteps:                 'N',
        strictCheckingOfRelations:    'Y',
        showDoctorsWithoutDepartment: 'Y',
        timeStepDurationMinutes:      15,

        ajaxPath:                     'http://bit-umc/1. integration-library/web/examples/typescriptTest/server/ajax.php',
        wrapperId:                    params.wrapperId,
        widgetBtnWrapId:              params.widgetBtnWrapId,
        widgetBtnId:                  params.widgetBtnId,
        formId:                       params.formId,
        messageNodeId:                params.messageNodeId,
        submitBtnId:                  params.submitBtnId,
        appResultBlockId:             params.appResultBlockId,

        dataKeys: {
            clinicsKey:       "FILIAL",
            specialtiesKey:   "SPECIALTY",
            servicesKey:      "SERVICE",
            employeesKey:     "DOCTOR",
            scheduleKey:      "DATE_TIME",
        },
        selectionNodes: {},
        textBlocks: [
            {
                "tag": "input",
                "type": "text",
                "placeholder": "Имя *",
                "id": "appointment-form-name",
                "maxlength": "30",
                "class": params.inputClass,
                "name": "name",
            },
            {
                "tag": "input",
                "type": "text",
                "placeholder": "Отчество *",
                "id": "appointment-form-middleName",
                "maxlength": "30",
                "class": params.inputClass,
                "name": "surname",
            },
            {
                "tag": "input",
                "type": "text",
                "placeholder": "Фамилия *",
                "id": "appointment-form-surname",
                "maxlength": "30",
                "class": params.inputClass,
                "name": "middleName",
            },
            {
                "tag": "input",
                "type": "tel",
                "placeholder": "Телефон *",
                "id": "appointment-form-phone",
                "maxlength": "30",
                "class": params.inputClass,
                "name": "phone",
                "autocomplete": "new-password",
                "aria-autocomplete": "list"
            },
            {
                "tag": "textarea",
                "placeholder": "Комментарий",
                "id": "appointment-form-comment",
                "maxlength": "300",
                "class": params.textareaClass,
                "name": "comment",
            }
        ],
        textNodes: {},
        defaultText: {},
        isUpdate: false,
    };


    const selectionBlocks: ITextObject = {
        [settings.dataKeys.clinicsKey]:     "Выберите клинику",
        [settings.dataKeys.specialtiesKey]: "Выберите специализацию",
    };
    if (settings.selectDoctorBeforeService === "Y")
    {
        selectionBlocks[settings.dataKeys.employeesKey] = "Выберите врача";
        selectionBlocks[settings.dataKeys.servicesKey]  = "Выберите услугу";
    }
    else{
        selectionBlocks[settings.dataKeys.servicesKey]  = "Выберите услугу";
        selectionBlocks[settings.dataKeys.employeesKey] = "Выберите врача";
    }
    selectionBlocks[settings.dataKeys.scheduleKey] = "Выберите время";

    for (const blocksKey in selectionBlocks) {
        if (selectionBlocks.hasOwnProperty(blocksKey)){
            settings.selectionNodes[blocksKey] = {
                blockId: `${blocksKey}_block`,
                listId: `${blocksKey}_list`,
                selectedId: `${blocksKey}_selected`,
                inputId: `${blocksKey}_value`,
                isRequired: blocksKey === settings.dataKeys.servicesKey
            }
            settings.defaultText[blocksKey] = selectionBlocks[blocksKey];
        }
    }

    settings.textBlocks.forEach(attrs=>{
        settings.textNodes[attrs["name"]] = {
            "inputId": attrs["id"],
            "isRequired": !(attrs["name"] === "comment")
        };
    })

    return settings;
}

export default getProjectSettings;