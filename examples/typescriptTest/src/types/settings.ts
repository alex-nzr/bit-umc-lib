export interface ITextObject {
    [key: string]: string
}

export interface IDataKeys {
    clinicsKey:     string,
    specialtiesKey: string,
    servicesKey:    string,
    employeesKey:   string,
    scheduleKey:    string,
}

export interface SelectionNode{
    blockId: string,
    listId: string,
    selectedId: string,
    inputId: string,
    isRequired: boolean
}
export interface ITextNode{
    inputId: string,
    isRequired: boolean
}

export interface INodes {
    [key: string]: SelectionNode | ITextNode
}

export interface ISettings {
    useServices: string,
    selectDoctorBeforeService: string,
    useTimeSteps: string,
    strictCheckingOfRelations: string,
    showDoctorsWithoutDepartment: string,
    timeStepDurationMinutes: number,
    ajaxPath: string,
    wrapperId: string,
    widgetBtnWrapId: string,
    widgetBtnId: string,
    formId: string,
    messageNodeId: string,
    submitBtnId: string,
    appResultBlockId: string,
    dataKeys: IDataKeys,
    selectionNodes: INodes,
    textBlocks: Array<ITextObject>,
    textNodes: INodes,
    defaultText: ITextObject,
    isUpdate: boolean,
}