<?php

use Emc\BitUmcAppointment\Request;

$data = file_get_contents('php://input');
print_r($data);

?>

    <form action="" method="post">
        <input type="text" name="name"/>
        <input type="text" name="surname"/>
        <input type="text" name="phone"/>
        <input type="email" name="email"/>
        <input type="text" name="methodName">
        <button>send</button>
    </form>

<?php

if (is_file(realpath('../vendor/autoload.php')))
{
    require_once(realpath('../vendor/autoload.php'));
}
else{ die("appointment library not found"); }


if (!empty($_POST['methodName']) && $_POST['methodName'] != '')
{
    $methodName = trim(strip_tags(htmlspecialchars($_POST['methodName'])));
    $arParams = array();

    switch ($methodName) {
        case 'GetListClients':
        case 'GetListClinics':
        case 'GetListEmployees':
            //no params for this request
            break;
        case 'GetSchedule':
            if (isset($_POST['startDate'], $_POST['finishDate'])){
                $arParams['startDate'] = $_POST['startDate'];
                $arParams['finishDate'] = $_POST['finishDate'];
            }
            break;
        case 'CreateOrder':
            if (isset($_POST['doctorUID'],$_POST['surname'],$_POST['name'],$_POST['middleName'],$_POST['orderDate'],$_POST['timeBegin'],$_POST['timeEnd'],$_POST['phone'],$_POST['clinicGUID'])){
                $arParams['clinicGUID'] = strip_tags(htmlspecialchars($_POST['clinicGUID']));
                $arParams['doctorUID']  = strip_tags(htmlspecialchars($_POST['doctorUID']));
                $arParams['surname']    = urlencode(strip_tags(htmlspecialchars($_POST['surname'])));
                $arParams['name']       = urlencode(strip_tags(htmlspecialchars($_POST['name'])));
                $arParams['middleName'] = urlencode(strip_tags(htmlspecialchars($_POST['middleName'])));
                $arParams['orderDate']  = strip_tags(htmlspecialchars($_POST['orderDate']));
                $arParams['timeBegin']  = strip_tags(htmlspecialchars($_POST['timeBegin']));
                $arParams['timeEnd']    = strip_tags(htmlspecialchars($_POST['timeEnd']));
                $arParams['phone']      = strip_tags(htmlspecialchars($_POST['phone']));
                $arParams['email']    = urlencode(strip_tags(htmlspecialchars($_POST['email'])));
                $arParams['comment']    = urlencode(strip_tags(htmlspecialchars($_POST['comment'])));
            }
            break;
        default:
            print_r(json_encode(['error' => 'Unknown api method - '.$methodName]));
            break;
    }

    $arParams = urlencode(json_encode($arParams));
    print_r(Request::post_request($methodName, $arParams));
}
else
{
    print_r(json_encode(['error' => 'Api method is empty']));
}

?>