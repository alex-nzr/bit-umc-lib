<?php

if ( !is_file(realpath(__DIR__ . '/../../vendor/autoload.php')) 
    && !is_file(realpath(__DIR__ . '/../../../../../vendor/autoload.php')))
{
    echo '<script>console.error("Autoloader not found");</script>';
}
else
{
    //options
    $useServices                    = "Y";
    $selectDoctorBeforeService      = "Y";
    $useTimeSteps                   = "N";
    $timeStepDuration               = 15;   //minutes
    $strictCheckingOfRelations      = "Y";  //strict verification of the binding of employees to the clinic and specializations to the clinic
    $showDoctorsWithoutDepartment   = "Y";
    //endOptions

    $ajaxPath = substr(realpath(__DIR__.'/ajax/ajax.php'), strlen($_SERVER['DOCUMENT_ROOT']));
    $ajaxPath = explode(DIRECTORY_SEPARATOR, $ajaxPath);
    $ajaxPath = implode("/", $ajaxPath);
    $ajaxPath = $ajaxPath[0] === "/" ? $ajaxPath : "/" . $ajaxPath;

    $styleRealPath = realpath(__DIR__.'/assets/css/style.css');
    $styleHref = substr($styleRealPath, strlen($_SERVER['DOCUMENT_ROOT']));
    $styleHref = $styleHref[0] === DIRECTORY_SEPARATOR ? $styleHref : DIRECTORY_SEPARATOR . $styleHref;

    $scriptRealPath = realpath(__DIR__.'/assets/js/script.js');
    $scriptSrc = substr($scriptRealPath, strlen($_SERVER['DOCUMENT_ROOT']));
    $scriptSrc = $scriptSrc[0] === DIRECTORY_SEPARATOR ? $scriptSrc : DIRECTORY_SEPARATOR . $scriptSrc;

    $wrapperId = "appointment-widget-wrapper";
    $widgetBtnWrapId = "appointment-button-wrapper";
    $widgetBtnId = "appointment-button";
    $formId = 'appointment-form';
    $messageNodeId = 'appointment-form-message';
    $submitBtnId = "appointment-form-button";
    $appResultBlockId = "appointment-result-block";

    $clinicsKey = "FILIAL";
    $specialtiesKey = "SPECIALTY";
    $servicesKey = "SERVICE";
    $employeesKey = "DOCTOR";
    $scheduleKey = "DATE_TIME";

    $selectionBlocks = [
        $clinicsKey => "Выберите клинику",
        $specialtiesKey => "Выберите специализацию",
    ];
    if ($selectDoctorBeforeService === "Y"){
        $selectionBlocks[$employeesKey] = "Выберите врача";
        $selectionBlocks[$servicesKey] = "Выберите услугу";
    }
    else{
        $selectionBlocks[$servicesKey] = "Выберите услугу";
        $selectionBlocks[$employeesKey] = "Выберите врача";
    }
    $selectionBlocks[$scheduleKey] = "Выберите время";

    $textBlocks = [
        [
            "type" => "text",
            "placeholder" => "Имя *",
            "id" => "appointment-form-name",
            "maxlength" => "30",
            "class" => "appointment-form_input",
            "name" => "name",
        ],
        [
            "type" => "text",
            "placeholder" => "Отчество *",
            "id" => "appointment-form-middleName",
            "maxlength" => "30",
            "class" => "appointment-form_input",
            "name" => "surname",
        ],
        [
            "type" => "text",
            "placeholder" => "Фамилия *",
            "id" => "appointment-form-surname",
            "maxlength" => "30",
            "class" => "appointment-form_input",
            "name" => "middleName",
        ],
        [
            "type" => "tel",
            "placeholder" => "Телефон *",
            "id" => "appointment-form-phone",
            "maxlength" => "30",
            "class" => "appointment-form_input",
            "name" => "phone",
            "autocomplete" => "new-password",
            "aria-autocomplete" => "list"
        ],
        [
            "placeholder" => "Комментарий",
            "id" => "appointment-form-comment",
            "maxlength" => "300",
            "class" => "appointment-form_textarea",
            "name" => "comment",
        ]
    ];
?>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="<?=$styleHref?>?<?=fileMTime($styleRealPath)?>">
<script src="<?=$scriptSrc?>?<?=fileMTime($scriptRealPath)?>"></script>

<script>
    const selectionNodes = {};
    const textNodes = {};
    const defaultText = {};
</script>

<div class="widget-wrapper" id="<?=$wrapperId?>">
    <div class="appointment-button-wrapper loading" id="<?=$widgetBtnWrapId?>">
        <button id="<?=$widgetBtnId?>"></button>
        <div class="appointment-loader">
            <?for ($i = 1; $i <= 5; $i++ ):?>
                <div class="wBall" id="wBall_<?=$i?>"><div class="wInnerBall"></div></div>
            <?endfor;?>
        </div>
    </div>

    <form id="<?=$formId?>" class="appointment-form">
        <?foreach($selectionBlocks as $key => $text):?>
            <div class="selection-block <?=($key !== $clinicsKey ? 'hidden' : '')?>" id="<?=$key?>_block">
                <p class="selection-item-selected" id="<?=$key?>_selected"><?=$text?></p>
                <ul class="appointment-form_head_list selection-item-list" id="<?=$key?>_list"></ul>
                <input type="hidden" name="<?=$key?>" id="<?=$key?>_value">
            </div>
            <script>
                selectionNodes['<?=$key?>'] = {
                    "blockId": "<?=$key?>_block",
                    "listId": "<?=$key?>_list",
                    "selectedId": "<?=$key?>_selected",
                    "inputId": "<?=$key?>_value",
                    "isRequired": <?=($key === $servicesKey ? 'false' : 'true')?>
                }
                defaultText['<?=$key?>'] = '<?=$text?>';
            </script>
        <?endforeach;?>

        <?foreach($textBlocks as $blockAttrs):?>
            <label class="appointment-form_input-wrapper">
                <?if(!empty($blockAttrs["type"])):?>
                    <input <?foreach($blockAttrs as $attrName => $attrValue){ echo $attrName.'='.'"'.$attrValue.'"'; }?>/>
                <?else:?>
                    <textarea <?foreach($blockAttrs as $attrName => $attrValue){ echo $attrName.'='.'"'.$attrValue.'"'; }?>></textarea>
                <?endif;?>
            </label>
            <script>
                textNodes["<?=$blockAttrs["name"]?>"] = {
                    "inputId": "<?=$blockAttrs["id"]?>",
                    "isRequired": <?=($blockAttrs["name"] === "comment" ? 'false' : 'true')?>
                };
            </script>
        <?endforeach;?>

        <p id="<?=$messageNodeId?>"></p>

        <div class="appointment-form_submit-wrapper">
            <button type="submit" id="<?=$submitBtnId?>" class="appointment-form_button">Записаться на приём</button>
        </div>

        <div id="<?=$appResultBlockId?>"><p></p></div>
    </form>
</div>
    <script>
        document.addEventListener('DOMContentLoaded', ()=>{
            window.appointmentWidget.init({
                "useServices": '<?=$useServices?>',
                "selectDoctorBeforeService": '<?=$selectDoctorBeforeService?>',
                "useTimeSteps": '<?=$useTimeSteps?>',
                "strictCheckingOfRelations": '<?=$strictCheckingOfRelations?>',
                "showDoctorsWithoutDepartment": '<?=$showDoctorsWithoutDepartment?>',
                "timeStepDuration": '<?=$timeStepDuration?>',
                "ajaxPath": '<?=$ajaxPath?>',
                "widgetBtnWrapId": '<?=$widgetBtnWrapId?>',
                "wrapperId": "<?=$wrapperId?>",
                "formId": '<?=$formId?>',
                "widgetBtnId": '<?=$widgetBtnId?>',
                "messageNodeId": '<?=$messageNodeId?>',
                "submitBtnId": '<?=$submitBtnId?>',
                "appResultBlockId": '<?=$appResultBlockId?>',
                "dataKeys": {
                    "clinicsKey": '<?=$clinicsKey?>',
                    "specialtiesKey": '<?=$specialtiesKey?>',
                    "servicesKey": '<?=$servicesKey?>',
                    "employeesKey": '<?=$employeesKey?>',
                    "scheduleKey": '<?=$scheduleKey?>',
                },
                "selectionNodes": selectionNodes,
                "textNodes": textNodes,
                "defaultText": defaultText,
                "isUpdate": false,
            });
        })
    </script>
<?php
}
?>

