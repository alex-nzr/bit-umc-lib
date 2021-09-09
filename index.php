<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Medical appointment page</title>
    <link rel="stylesheet" href="css/style.css?<?=time()?>">
    <link rel="icon" href="favicon.ico" type="image/x-icon">
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon">
</head>

<body>

<!--<div id="appointment-form" class="appointment-form">
    <div class="selection-block" id="appointment-form-clinic" data-step="1">
        <p class="selection-item-selected" data-test="asd" data-mode="def">Выберите клинику *</p>
        <ul class="appointment-form_head_list selection-item-list" id="clinic_list"></ul>
    </div>

    <div class="selection-block hidden" id="appointment-form-specialties" data-step="2">
        <p class="selection-item-selected">Выберите специализацию *</p>
        <ul class="appointment-form_head_list selection-item-list" id="specialties_list"></ul>
    </div>

    <div class="selection-block hidden" id="appointment-form-employees" data-step="3">
        <p class="selection-item-selected">Выберите врача *</p>
        <ul class="appointment-form_head_list selection-item-list" id="employees_list"></ul>
    </div>

    <div class="selection-block hidden" id="appointment-form-shedule" data-step="4">
        <p class="selection-item-selected">Выберите время *</p>
        <ul class="appointment-form_head_list selection-item-list" id="shedule_list"></ul>
    </div>

    <div class="appointment-form_input-wrapper">
        <input type="text" class="appointment-form_input" placeholder="Имя *" id="name" maxlength="30" autocomplete="off">
    </div>

    <div class="appointment-form_input-wrapper">
        <input type="text" class="appointment-form_input" placeholder="Отчество *" id="parentname" maxlength="30" autocomplete="off">
    </div>

    <div class="appointment-form_input-wrapper">
        <input type="text" class="appointment-form_input" placeholder="Фамилия *" id="surname" maxlength="30" autocomplete="off">
    </div>

    <div class="appointment-form_input-wrapper">
        <input type="tel" class="appointment-form_input" placeholder="Телефон *" id="phone" autocomplete="off">
    </div>

    <div class="appointment-form_input-wrapper">
        <textarea type="text" class="appointment-form_textarea" placeholder="Комментарий" id="comment" maxlength="300"></textarea>
    </div>

    <div class="appointment-form_submit-wrapper">
        <button type="submit" id="create_order" class="appointment-form_button">Записаться на приём</button>
    </div>
</div>-->
<pre>
    <?
    //$res = send("GetListClients");
    //$res = send("GetListClinics");
    //$res = send("GetListEmployees");

    $params = json_encode([ "startDate" => time(), "finishDate" => time() + 60*60*24*30]);
    //$res = send("GetSchedule", $params);

    $params = json_encode([
        "clinicGUID" => "4c68deb4-22c3-11df-8618-002618dcef2c",
        "doctorUID" => "ac30e13a-3087-11dc-8594-005056c00008",
        "surname" => urlencode("Nzr"),
        "middleName" => urlencode("JC"),
        "name" => urlencode("Alex"),
        "orderDate" => "20210902",
        "timeBegin" => date("YmdHis", strtotime("2021-09-02T18:30:00")),
        "timeEnd" => date("YmdHis", strtotime("2021-09-02T21:00:00")),
        "phone" => "+79991234567",
        "email" => "example@mail.ru",
        "comment" => urlencode("some comment text"),
    ]);
    $res = send("CreateOrder", $params);
    print_r($res);
    ?>
</pre>

<div class="appointment-result-wrapper">
    <p id="appointment-result"></p>
</div>

<script src="js/script.js"></script>

</body>
</html>
<?
function send($method, $params = "sas"){
    $headers = array(
        "Accept: application/json",
        "Authorization: Basic " . base64_encode("siteIntegration:123456"),
        "Content-Type: application/json;charset=utf-8",
    );
    $url = "http://localhost:3500/umc_corp/hs/siteIntegration/V1/";
    if($curl = curl_init()) {
        curl_setopt($curl, CURLOPT_URL, $url.$method."/".$params);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER,true);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, null);
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        $response = curl_exec($curl);
        curl_close($curl);

        return $response;
    }else{
        echo 'Curl init error';
    }
}
?>