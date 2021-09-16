<?php

if (is_file(realpath('../../vendor/autoload.php')))
{
    require_once(realpath('../../vendor/autoload.php'));
}
else{ die("integration library not found"); }

use AlexNzr\BitUmcIntegration\RequestController;

if (!empty($_POST["action"])){
    print_r(RequestController::sendRequest($_POST));
}
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Medical appointment page</title>
    <link rel="stylesheet" href="assets/css/style.css?<?=filemtime(realpath('./css/style.css'))?>">
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

<form action="" method="post">
    <input type="text" name="clinicGUID" placeholder="clinicGUID" value="4c68deb4-22c3-11df-8618-002618dcef2c">
    <input type="text" name="refUID" placeholder="refUID" value="ac30e13a-3087-11dc-8594-005056c00008">
    <br>
    <input type="text" name="surname" placeholder="surname" value="bot">
    <input type="text" name="middleName" placeholder="middleName" value="bot">
    <input type="text" name="name" placeholder="name" value="bot">
    <br>
    <input type="text" name="orderDate" placeholder="orderDate" value="20210913">
    <input type="text" name="timeBegin" placeholder="timeBegin" value="2021-09-13T18:30:00">
    <input type="text" name="timeEnd" placeholder="timeEnd" value="2021-09-13T21:00:00">
    <br>
    <input type="text" name="phone" placeholder="phone" value="8 (999) 666-55-11">
    <input type="email" name="email" placeholder="email" value="bot@1cbit.ru">
    <input type="text" name="comment" placeholder="comment" value="Lorem ipsum dastard">
    <input type="text" name="address" placeholder="address" value="Street and home">
    <br>
    <input type="text" name="action" placeholder="action name" value="CreateOrder">
    <button>send</button>
</form>

<div class="appointment-result-wrapper">
    <p id="appointment-result"></p>
</div>

</body>
</html>
