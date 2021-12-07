<?php
if (is_file(realpath(__DIR__ . '/../../vendor/autoload.php')))
{
    require_once(realpath(__DIR__ . '/../../vendor/autoload.php'));
}
elseif(is_file(realpath(__DIR__ . '/../../../../../vendor/autoload.php'))){
    require_once(realpath(__DIR__ . '/../../../../../vendor/autoload.php'));
}
else{ die("integration library not found"); }

use AlexNzr\BitUmcIntegration\RequestController;
use AlexNzr\BitUmcIntegration\Utils;

$resText = '';
$errText = [];

$clinics = [];
$employees = [];
$schedule = [];
if (!empty($_POST["action"])){
    $data = RequestController::sendRequest(json_encode($_POST));
    if (is_string($data)){
        $data = json_decode($data, true);
        $resText = $data['success'] ? "Заявка создана успешно" : $data['error'];
        $errorFrom1C = $data['defaultError'];
        echo "<script>console.log(`".$errorFrom1C."`)</script>";
    }
    //Utils::print($data);
}else{
    $clinics = json_decode(RequestController::sendRequest(json_encode(["action" => "GetListClinics"])), true);
    if (!empty($clinics["error"]))
    {
        $errText[] = $clinics["error"];
    }
    $employees = json_decode(RequestController::sendRequest(json_encode(["action" => "GetListEmployees"])), true);
    $schedule = json_decode(RequestController::sendRequest(json_encode(["action" => "GetSchedule"])), true);
}
?>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">

    <div class="container">
        <div class="row mt-5">
            <?if($resText > ''):?>
                <p class="text-center"><?=$resText?></p>
                <p class="text-center"><a href="./index.php" class="icon-link">Назад</a></p>
            <?elseif(count($errText) > 0):?>
                <p class="alert alert-warning">
                    <?foreach ($errText as $err):?>
                        <?=$err?><br>
                    <?endforeach;?>
                </p>
                <p class="text-center"><a href="./index.php" class="icon-link">Back</a></p>
            <?else:?>
                <h2 class="text-center">Выберите параметры записи</h2>
                <form action="" method="post" class="row g-3 align-items-center m-auto" style="max-width: 600px;">
                <fieldset>
                    <div class="input-group mb-1">
                        <select name="clinicUid" class="form-select" required>
                            <option selected disabled>Выберите клинику</option>
                            <?foreach ($clinics as $clinic):?>
                                <option value="<?=$clinic["uid"]?>"><?=$clinic["name"]?></option>
                            <?endforeach;?>
                        </select>
                    </div>

                    <div class="input-group mb-1">
                        <select name="specialty" class="form-select" style="display: none;" required>
                            <option selected disabled>Выберите специализацию</option>
                            <?foreach ($employees as $employee):?>
                                <option value="<?=$employee["specialty"]?>"><?=$employee["specialty"]?></option>
                            <?endforeach;?>
                        </select>
                    </div>

                    <div class="input-group mb-1">
                        <select name="refUid" class="form-select" style="display: none;" required>
                            <option selected disabled>Выберите врача</option>
                            <?foreach ($schedule["schedule"] as $ref):?>
                                <option value="<?=$ref["refUid"]?>"
                                        data-clinicUid="<?=$ref['clinicUid']?>"
                                        data-specialty="<?=$ref['specialty']?>"
                                >
                                    <?=$ref["name"]?>
                                </option>
                            <?endforeach;?>
                        </select>
                    </div>

                    <div class="input-group mb-1">
                        <select name="dateTime" class="form-select" style="display: none;" required></select>
                        <input type="hidden" name="orderDate" value="20210913">
                        <input type="hidden" name="timeBegin" value="2021-09-13T18:30:00">
                        <input type="hidden" name="timeEnd" value="2021-09-13T21:00:00">
                    </div>

                    <div class="input-group mb-1">
                        <input class="form-control" type="text" name="surname" placeholder="Фамилия" value="Петров" required>
                    </div>
                    <div class="input-group mb-1">
                        <input class="form-control" type="text" name="name" placeholder="Имя" value="Сергей" required>
                    </div>
                    <div class="input-group mb-1">
                        <input class="form-control" type="text" name="middleName" placeholder="Отчество" value="Петрович" required>
                    </div>
                    <div class="input-group mb-1">
                        <input class="form-control" type="text" name="phone" placeholder="Телефон" value="8 (999) 666-55-11" required>
                    </div>
                    <div class="input-group mb-1">
                        <input class="form-control" type="email" name="email" placeholder="Email" value="serg_petrov@gmail.com" required>
                    </div>
                    <div class="input-group mb-1">
                        <input class="form-control" type="text" name="comment" placeholder="Комментарий" value="Можно перенести на более ранее время, если станет свободно">
                    </div>
                    <div class="input-group mb-1">
                        <input class="form-control" type="text" name="address" placeholder="Адрес" value="г.Москва, пр-кт Ленина, 15">
                    </div>

                    <input type="hidden" name="clientUid" value="<?=$clientUid?>">
                    <input type="hidden" name="action" value="CreateOrderUnauthorized">
                </fieldset>

                <div class="m-auto col-6 mt-2 d-flex justify-content-center">
                    <button type="submit" class="btn btn-primary container-fluid">Отправить</button>
                </div>
            </form>
            <?endif;?>
        </div>
    </div>

    <script>
        const schedule = JSON.parse('<?=json_encode($schedule)?>');
        if (!schedule.error){
            const clinic = document.querySelector('select[name="clinicUid"]');
            clinic && clinic.addEventListener("change", (e) => {
                changeScheduleData(e.target.value);
            })

            const specialty = document.querySelector('select[name="specialty"]');
            specialty && specialty.addEventListener("change", (e) => {
                changeScheduleData(clinic.value, e.target.value);
            })
            const ref = document.querySelector('select[name="refUid"]');
            ref && ref.addEventListener("change", (e) => {
                changeScheduleData(clinic.value, specialty.value, e.target.value, schedule);
            })
        }

        function changeScheduleData(clinic, specialty = false, refUid = false, schedule = false){
            const select = document.querySelector('select[name="refUid"]');
            let all = select.querySelectorAll(`option`);

            let selector = `option[data-clinicUid="${clinic}"]`;
            if (specialty){
                selector = `option[data-clinicUid="${clinic}"][data-specialty="${specialty}"]`;
            }

            let enabled = select.querySelectorAll(selector);

            all.forEach(item=>item.style.display = 'none')
            enabled.forEach(item=>item.style.display = '')

            const dateTime = document.querySelector('[name="dateTime"]');
            if (clinic){
                document.querySelector('select[name="specialty"]').style.display = "block";
                document.querySelector('select[name="refUid"]').style.display = "none";
                dateTime.style.display = "none";

                specialty ? void(0) : document.querySelector('select[name="specialty"]').selectedIndex = 0;
                refUid ? void(0) : document.querySelector('select[name="refUid"]').selectedIndex = 0;
            }
            if (specialty){
                document.querySelector('select[name="specialty"]').style.display = "block";
                document.querySelector('select[name="refUid"]').style.display = "block";
                dateTime.style.display = "none";

                refUid ? void(0) : document.querySelector('select[name="refUid"]').selectedIndex = 0;
            }
            if (refUid){
                document.querySelector('select[name="specialty"]').style.display = "block";
                document.querySelector('select[name="refUid"]').style.display = "block";
                dateTime.style.display = "block";
            }

            if (clinic && specialty && refUid && schedule){
                dateTime.innerHTML = '<option selected disabled>Выберите время</option>';
                const filtered = schedule.schedule.filter(item => (item.clinicUid === clinic)&&(item.specialty === specialty)&&(item.refUid === refUid))
                if(filtered.length){
                    filtered.forEach(fItem => {
                        if (fItem.timetable?.free?.length){
                            fItem.timetable.free.forEach(time=>{
                                const option = document.createElement('option')
                                option.textContent = `${time.formattedDate} c ${time.formattedTimeBegin} по ${time.formattedTimeEnd}`;
                                option.value = JSON.stringify([time.date, time.timeBegin, time.timeEnd]);

                                dateTime.onchange = (e) => {
                                    const data = JSON.parse(e.target.value);
                                    document.querySelector('[name="orderDate"]').value = data[0];
                                    document.querySelector('[name="timeBegin"]').value = data[1];
                                    document.querySelector('[name="timeEnd"]').value = data[2];
                                }
                                dateTime.append(option)
                            })
                        }
                    })
                }

            }
        }
    </script>
