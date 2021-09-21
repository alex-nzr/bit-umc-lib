<?php

if (is_file(realpath('../../vendor/autoload.php')))
{
    require_once(realpath('../../vendor/autoload.php'));
}
elseif (is_file(realpath('../../../../autoload.php')))
{
    require_once(realpath('../../../../autoload.php'));
}
else{ die("integration library not found"); }

use AlexNzr\BitUmcIntegration\RequestController;

//die("Sorry, this page is in development now");
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Medical appointment page</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <link rel="stylesheet" href="assets/css/style.css?<?=filemtime(realpath('./css/style.css'))?>">
</head>

<body>

<div class="appointment-button-wrapper loading">
    <button id="appointment-button"></button>
    <div class="windows8">
        <div class="wBall" id="wBall_1">
            <div class="wInnerBall"></div>
        </div>
        <div class="wBall" id="wBall_2">
            <div class="wInnerBall"></div>
        </div>
        <div class="wBall" id="wBall_3">
            <div class="wInnerBall"></div>
        </div>
        <div class="wBall" id="wBall_4">
            <div class="wInnerBall"></div>
        </div>
        <div class="wBall" id="wBall_5">
            <div class="wInnerBall"></div>
        </div>
    </div>
</div>

<div class="row">
    <div class="container">
        <div id="appointment-form" class="appointment-form mx-auto">
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

            <div class="selection-block hidden" id="appointment-form-schedule" data-step="4">
                <p class="selection-item-selected">Выберите время *</p>
                <ul class="appointment-form_head_list selection-item-list" id="schedule_list"></ul>
            </div>

            <div class="appointment-form_input-wrapper">
                <input type="text" class="appointment-form_input" placeholder="Имя *" id="name" maxlength="30" autocomplete="off">
            </div>

            <div class="appointment-form_input-wrapper">
                <input type="text" class="appointment-form_input" placeholder="Отчество *" id="middleName" maxlength="30" autocomplete="off">
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

            <div class="appointment-result-wrapper">
                <p id="appointment-result"></p>
            </div>
        </div>
    </div>
</div>

<script src="assets/js/script.js"></script>
</body>
</html>
