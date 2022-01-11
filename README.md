## Installation

### Install composer package
Set up `composer.json` in your project directory:
```
{
    "require":{"alex-nzr/bit-umc-integration":"dev-master"}
}
```

Run [composer](https://getcomposer.org/doc/00-intro.md#installation):
```
$ php composer.phar install
```
or
```
composer require alex-nzr/bit-umc-integration:dev-master
```

### Direct download

Download [latest version](https://github.com/alex-nzr/bit-umc-lib/archive/refs/heads/master.zip), unzip and copy to your project folder.


## Usage

### Install 1C extension
At first download `siteIntegration.cfe` and insert this extension in your 1c base.
Then publish it on web-server.

### Fill required options
At second go to `src/Variables.php` and fill params to access your 1C base.
```
AUTH_LOGIN_1C
AUTH_PASSWORD_1C
PROTOCOL
BASE_ADDR
BASE_NAME
```

### Get all clients
Request data(json)
```
{
    "action": "GetListClients"
}
```

Success response data(json)
```
[
    {
        "name": "Аркадий",
        "surname": "Ахмин",
        "middlename": "Николаевич",
        "inn": "1211321231",
        "snils": "030-213132121",
        "birthday": "1967-04-10T00:00:00",
        "displayBirthday": "10-04-1967",
        "gender": "M",
        "uid": "d4f6fdf5-38a6-11e4-8012-20cf3029e98b",
        "isAppointmentBlocked": "N",
        "contacts": {
            "phone": "+71234567890",
            "emailHome": "example_home@gmail.com"
            "emailWork": "example_work@gmail.com"
        },
        "relatives": [
            {
                "uid": "20cf30-38a6-11e4-8012-20cf3029e98b",
                "name": "Ахмин Иван Аркадьевич"
                "relation": "Сын"
            },
            {
                "uid": "9e98b0-38a6-11e4-8012-20cf3029e98b",
                "name": "Иванова Ксения Николаевна"
                "relation": "Сестра"
            },
            {
                //uid can be undefined if relative is not in Catalog.Clients
                "name": "Ахмин Петр Николаевич"
                "relation": "Брат"
            },
        ]
    }
]
```

Error response data(json)
```
{
    error: "something went wrong..."
}
```

Php code example
```
$clients = RequestController::sendRequest(json_encode(["action" => "GetListClients"]));
```

### Update client in 1C
Request data(json) 
"action" and "clientUid" are required fields
```
{
    "action": "UpdateClient",
    "clientUid": "d4f6fdf5-38a6-11e4-8012-20cf3029e98b",
    "name": "Аркадий",
    "surname": "Ахмин",
    "middlename": "Николаевич",
    "phone": "+71234567890",
    "emailHome": "example_home@gmail.com",
    "emailWork": "example_work@gmail.com"
}
```

Success response data(json)
```
{
    "success": true
}
```

Error response data(json)
```
{
    error: "something went wrong..."
}
```

Php code example
```
$res = RequestController::sendRequest(json_encode([
    "action"     => "UpdateClient",
    "clientUid"  => "d4f6fdf5-38a6-11e4-8012-20cf3029e98b",
    "name"       => "Аркадий",
    "surname"    => "Ахмин",
    "middlename" => "Николаевич",
    "phone"      => "+71234567890",
    "emailHome"  => "example_home@gmail.com",
    "emailWork"  => "example_work@gmail.com"
]));
```


### Get all clinics
Request data(json)
```
{
    "action": "GetListClinics"
}
```

Success response data(json)
```
[
    {
        "name": "Центральная клиника",
        "uid": "df7870cc3-38a6-11e4-8012-20cf3029e98b"
    }
]
```

Error response data(json)
```
{
    error: "something went wrong..."
}
```

Php code example
```
$clinics = RequestController::sendRequest(json_encode(["action" => "GetListClinics"]));
```

### Get all employees
Request data(json)

`employeeUid` is optionally param to get only one employee
```
{
    "action": "GetListEmployees",
    "employeeUid" => "ac30e139-3087-11dc-8594-005056c00008",
}
```

Success response data(json)
```
{
    "2eb1f97b-6a3c-11e9-936d-1856809fe650": {
    "name": "Юрий",
    "surname": "Безногов",
    "middleName": "Сергеевич",
    "clinic": "Центральная клиника",
    "inSchedule": true,
    "clinicUid": "f679444a-22b7-11df-8618-002618dcef2c",
    "specialties": {
        "ce182405-5065-11e4-8cb1-c80aa974ec9e": {
            "name": "Хирургия"
        },
    },
    "services": {
      "dc58bfaf-65b4-11e9-936d-1856809fe650": {
        "title": "Перевязка инфицированной раны малая"
      },
      "dc58bfa5-65b4-11e9-936d-1856809fe650": {
        "title": "Удаление вросшего ногтя без учета анестезии"
      },
      "dc58bfa2-65b4-11e9-936d-1856809fe650": {
        "title": "Удаление скальпелем ганглия"
      },
      "dc58bfa1-65b4-11e9-936d-1856809fe650": {
        "title": "Повторная консультация хирурга "
      },
      "dc58bfa0-65b4-11e9-936d-1856809fe650": {
        "title": "Первичная консультация хирурга "
      },
      "dc58bfae-65b4-11e9-936d-1856809fe650": {
        "title": "Перевязка неинфицированной раны большая"
      },
    }
  },
  "e7005e6f-65c9-11e9-936d-1856809fe650": {
    "name": "Семен",
    "surname": "Малоухов",
    "middleName": "Семенович",
    "clinic": "Центральная клиника",
    "inSchedule": true,
    "clinicUid": "f679444a-22b7-11df-8618-002618dcef2c",
    "specialties": {
        "ce558715-4561-11e4-8cb1-c80ee974bf9e": {
            "name": "Сурдология"
        },
        "eebe3e98-233d-11e2-9496-1803736d59cd": {
            "name": "Оториноларингология"
        }
    },
    "services": {
      "ca04032f-9f39-11e6-8221-985fd33a0f52": {
        "title": "Консультация врача-оториноларинголога"
      },
      "ca040333-9f39-11e6-8221-985fd33a0f52": {
        "title": "Снятие тональной аудиограммы"
      },
      "ca040334-9f39-11e6-8221-985fd33a0f52": {
        "title": "Аудиометрия"
      },
      "ca040339-9f39-11e6-8221-985fd33a0f52": {
        "title": "Удаление серной пробки из одного уха"
      },
      "ca040335-9f39-11e6-8221-985fd33a0f52": {
        "title": "Подбор слухового аппарата"
      },
    }
  },
}
```

Error response data(json)
```
{
    error: "something went wrong..."
}
```

Php code example
```
$employees = RequestController::sendRequest(json_encode(["action" => "GetListEmployees"]));
```


### Get nomenclature
Request data(json)

`nomenclatureUid` is optionally param to get only one employee
```
{
    "action": "GetListNomenclature",
    "nomenclatureUid" => "ac30e139-3087-11dc-8594-005056c00008",
}
```

Success response data(json)
```
{
    "8e045f06-da18-11e1-bab2-1803736d59cd": {
        "name": "Прогревание свечой",
        "typeOfItem": "Услуга",
        "duration": 1800,
        "specialty": "Терапия",
        "specialtyUid": "91d8a3f0-d7cf-11e1-bab2-1803736d59cd",
        "artNumber": "NBS-17",
        "isAnalysis": false,
        "isMedicalCheck": false,
        "VAT": "20%",
        "prices": {
            "4c68deb4-22c3-11df-8618-002618dcef2c": {
                "priceList": "Прейскурант ДМС",
                "price": "270"
            }
            "f679444a-22b7-11df-8618-002618dcef2c": {
                "priceList": "Основной прейскурант",
                "price": "300"
            }
            "66abf7b4-2ff9-11df-8625-002618dcef2c": {
                "priceList": "Основной прейскурант",
                "price": "300"
            }
        }
    },
    "22d1b485-b34b-11de-8171-001583078ee5": {
        "name": "Подбор очков сложной коррекции",
        "typeOfItem": "Услуга",
        "duration": 3600,
        "specialty": "Офтальмология",
        "specialtyUid": "785d8a6e-5c72-11dd-8423-005056c00008",
        "artNumber": "OFT-21",
        "isAnalysis": false,
        "isMedicalCheck": false,
        "VAT": "",
        "price": "1 000"
    },
    "9ab45d77-c599-11e1-818b-80c16e5c9fe3": {
        "name": "Анализ мочи",
        "typeOfItem": "Услуга",
        "duration": 600,
        "specialty": "Лабораторные исследования",
        "specialtyUid": "e866ea50-093d-11e2-87b2-002618dcef2c",
        "artNumber": "А1",
        "isAnalysis": true,
        "isMedicalCheck": false,
        "VAT": "",
        "price": "300"
    },
}
```

Error response data(json)
```
{
    error: "something went wrong..."
}
```

Php code example
```
$nomenclature = RequestController::sendRequest(json_encode(["action" => "GetListNomenclature"]));
```


### Get schedule
You can configure period(30 days default) and duration(1800 seconds default) in `src/Variables.php`. 
```
SCHEDULE_PERIOD_IN_DAYS = 30;
DEFAULT_APPOINTMENT_DURATION = 1800;
```

Request data(json) 
`freeNotFormatted`  contains time intervals without formatting by the duration of reception. This is necessary when using services, for the correct calculation of intervals, based on the duration of the selected service.
`free` contains time intervals formatted taking into account the duration of the doctor's appointment specified in 1C. If there is no information in 1C, then the value of the constant `DEFAULT_APPOINTMENT_DURATION` is used.

```
{
    "action": "GetSchedule"
}
```

Success response data(json)
```
{
        "schedule": [
            {
                "specialty": "Офтальмология",
                "name": "Барбышева Евгения Петровна",
                "refUid": "ac30e13a-3087-11dc-8594-005056c00008",
                "clinicUid": "4c68deb4-22c3-11df-8618-002618dcef2c",
                "duration": "0001-01-01T00:30:00",
                "durationInSeconds": 1800,
                "timetable": {
                    "free": [
                        {
                            "typeOfTimeUid": "624f2a40-5aa8-4f01-83f4-0f38535364bb",
                            "date": "2021-09-18T00:00:00",
                            "timeBegin": "2021-09-18T18:30:00",
                            "timeEnd": "2021-09-18T19:00:00",
                            "formattedDate": "18-09-2021",
                            "formattedTimeBegin": "18:30",
                            "formattedTimeEnd": "19:00",
                        },
                        {
                            "typeOfTimeUid": "624f2a40-5aa8-4f01-83f4-0f38535364bb",
                            "date": "2021-09-18T00:00:00",
                            "timeBegin": "2021-09-18T19:00:00",
                            "timeEnd": "2021-09-18T19:30:00",
                            "formattedDate": "18-09-2021",
                            "formattedTimeBegin": "19:00",
                            "formattedTimeEnd": "19:30",
                        }
                    ],
                    "busy": [
                        {
                            "typeOfTimeUid": "624f2a40-5aa8-4f01-83f4-0f38535364bb",
                            "date": "2021-09-30T00:00:00",
                            "timeBegin": "2021-09-30T18:30:00",
                            "timeEnd": "2021-09-30T19:00:00",
                            "formattedDate": "30-09-2021",
                            "formattedTimeBegin": "19:30",
                            "formattedTimeEnd": "20:00",
                        }
                    ],
                    "freeNotFormatted": [
                        {
                            "typeOfTimeUid": "624f2a40-5aa8-4f01-83f4-0f38535364bb",
                            "date": "2021-09-18T00:00:00",
                            "timeBegin": "2021-09-18T18:30:00",
                            "timeEnd": "2021-09-18T19:30:00",
                            "formattedDate": "18-09-2021",
                            "formattedTimeBegin": "18:30",
                            "formattedTimeEnd": "19:30",
                        },
                        {
                            "typeOfTimeUid": "624f2a40-5aa8-4f01-83f4-0f38535364bb",
                            "date": "2021-09-19T00:00:00",
                            "timeBegin": "2021-09-19T18:30:00",
                            "timeEnd": "2021-09-19T19:30:00",
                            "formattedDate": "19-09-2021",
                            "formattedTimeBegin": "18:30",
                            "formattedTimeEnd": "19:30",
                        }
                    ],
                }
            }
        ]
}
```

Error response data(json)
```
{
    error: "something went wrong..."
}
```

Php code example
```
$schedule = RequestController::sendRequest(json_encode(["action" => "GetSchedule"]));
```

### Get user orders
"getChanges" is optionally parameter, default value is `false`.
All synchronized orders are stored in the information register, and if you switch the value to `true`, only orders that are not in the register will be given on request.

Request data(json)
```
{
    "action": "GetListOrders",
    "clientUid": "84291ec6-161a-11ec-9bc2-c03eba27318f",
    "getChanges": false,
}
```

Success response data(json)
```
[
    {
        "orderUid": "01fa3622-16f1-11ec-9bc2-c03eba27318f",
        "orderNumber": "00000001098",
        "orderDate": "2021-09-25T00:00:00"
        "timeBegin": "2021-09-25T14:00:00"
        "timeEnd": "2021-09-25T14:30:00"
        "displayOrderDate": "25-09-2021",
        "displayTimeBegin": "14:00",
        "displayTimeEnd": "14:30",
        "orderState": "Создана на сайте",
        "orderNote": "Some text about this order",
        "clinicName": "Третий хирургический центр",
        "doctorName": "Безногов Юрий Сергеевич",
        "doctorSpecialty": "Хирургия",
        "clientName": "Иванов И.И.",
        "clientBirthday": "1984-12-22T00:00:00",
        "displayClientBirthday": "22-12-1984",
        "clientComment": "not used, see orderNote",
        "cancelled": "N",
    }
]
```

Error response data(json)
```
{
    error: "something went wrong..."
}
```

Php code example
```
$orders = RequestController::sendRequest(json_encode([
    "action" => "GetListOrders", 
    "clientUid"=>"84291ec6-161a-11ec-9bc2-c03eba27318f"
]));
```

### Create/Update order
Request data(json)

Param `clientUid` is required if param `action=CreateOrder`.

If param `action` = `CreateOrderUnauthorized`, there are two possible ways depending on 1C settings in the integration form.

1. There will be a search for a client by phone number and, if the search is unsuccessful, then the creation of a new client. 

2. All orders will be attached to one client selected in the 1C settings.
   
2. Not an order will be created, but an entry in the waiting list, which the clinic administrator will process according to the accepted regulations.

If param `orderUid` not empty, 1c will update already existing order.

`refUid` - doctor or cabinet uuid from schedule

`serviceUid`, `email`, `comment` and `address` are not required params.

`action` and `orderUid` influence the logic of saving the document in 1C.

`serviceUid` will add selected service in 1C document. 
```
{
    "action": "CreateOrder"/"CreateOrderUnauthorized",
    "clinicUid": "f679444a-22b7-11df-8618-002618dcef2c"
    "refUid": "9e8b672a-9975-11e3-87ec-002618dcef2c"
    "orderDate": "2021-09-20T00:00:00"
    "timeBegin": "2021-09-20T14:00:00"
    "timeEnd": "2021-09-20T18:00:00"
    "name": "Игорь" 
    "surname": "Васильевич" 
    "middleName": "Нариманов"
    "phone": "8 (999) 555-55-55"
    "email": "igor12121@gmail.com"
    "comment": "Какой-то текст комментария"
    "address": "г. Москва, ул. Пушкина 56"
    "clientUid": "84291ec6-161a-11ec-9bc2-c03eba27318f",
    "orderUid": "01fa3622-16f1-11ec-9bc2-c03eba27318f",
    "serviceUid": "91d8a3f1-d7cf-11e1-bab2-1803736d59cd"
}
```

Success response data(json)
```
{
    "orderUid": "01fa3622-16f1-11ec-9bc2-c03eba27318f",
    "success" => true
}
```
Or if a waiting list was created instead of an order
```
{
    "success" => true
}
```

Error response data(json)
```
{
    error: "error description for user",
    "defaultError": "original error description from 1C"
}
```

Php code example
```
$result = RequestController::sendRequest(json_encode([
    "action" => "CreateOrderUnauthorized", 
    "clinicUid" => "f679444a-22b7-11df-8618-002618dcef2c",
    "specialty" => "Неврология",
    "refUid" => "9e8b672a-9975-11e3-87ec-002618dcef2c",
    "orderDate" => "2021-09-20T00:00:00",
    "timeBegin" => "2021-09-20T14:00:00",
    "timeEnd" => "2021-09-20T18:00:00",
    "serviceUid" => "91d8a3f1-d7cf-11e1-bab2-1803736d59cd",
    "name" => "Игорь",
    "surname" => "Васильевич" ,
    "middleName" => "Нариманов",
    "phone" => "8 (999) 555-55-55",
    "email" => "igor12121@gmail.com",
    "comment" => "Какой-то текст комментария",
    "address" => "г. Москва, ул. Пушкина 56"
]));
```

### Canceling order
"reason" is not required param

Request data(json)
```
{
    "action": "CancelOrder",
    "orderUid": "84291ec6-161a-11ec-9bc2-c03eba27318f",
    "reason": "I don't want to visit your clinic",
}
```

Success response data(json)
```
{
    "success": true
}
```

Error response data(json)
```
{
    error: "something went wrong..."
}
```

Php code example
```
$result = RequestController::sendRequest(json_encode([
    "action" => "CancelOrder", 
    "orderUid"=>"84291ec6-161a-11ec-9bc2-c03eba27318f"
]));
```


## Demo mode
You can switch demo mode by changing special constant value in `src/Variables.php`. Set `"Y"` to turn on, set `"N"`, to turn off.
When the demo mode is enabled, the application will not make requests to 1C, but will return json data from the class `src/RequestServiceDemo.php`
```
   const DEMO_MODE = "Y"; 
```

## Logging
You can print logs to screen with `Utils::print($message)` or print to file with `Utils::printLog($message)`. Path to log's file you can set in Variables.php:
```
const PATH_TO_LOG_FILE = __DIR__."/log.txt";
```

## Examples
Also, you can see the [examples](https://github.com/alex-nzr/bit-umc-lib/tree/master/examples)

## 1C features
Added a form with settings in the section `"Administration"->"Services"->"Site integration"`. 
Also added the ability to connect to the site from 1C and send customer data. 
On the form of the element in the catalog "Clients", a section "Integration with the site" has been created. 
This section has some features:
1. Button "Create PA" and a checkbox showing whether the personal account has already been created earlier. 
    When you click on the button, the client's data is sent to the site and, in case of a successful response, checkbox is put down that the profile has been created.
2. "isAppointmentBlocked" checkbox has also been added. Depending on its value, you can prohibit or allow an appointment from the site by implementing your own logic.
3. Button "Recover Password". It makes request to your site with special action and you can process this event  by implementing your own logic.
4. On the integration settings form, you can
   a) enable/disable sending of user's personal data. When this option is enabled, all fields specified in the method of receiving clients will be sent. If the option is disabled, only the name and SNILS will be transmitted.
   b) enable/disable the transfer of authorization data to the site. Authorization is implemented through the request header "Authorization: Basic".
   c) enable/disable automatic transfer of client data to the site when changing and saving client data in 1C.

The request and response formats:
 
From 1C (format: json, method: POST)  
```
 {
    "action" : "user.add", //or "user.update", or "user.recoverPassword"
    "client" : {
        "name": "Аркадий",
        "surname": "Ахмин",
        "middlename": "Николаевич",
        "inn": "1211321231",
        "snils": "030-213132121",
        "birthday": "10-04-1967",
        "gender": "M",
        "uid": "d4f6fdf5-38a6-11e4-8012-20cf3029e98b",
        "isAppointmentBlocked": "N",
        "isNew" => "Y", //if user is new and need be created
        "recoverPassword" => "Y", //need to recover user's password and return it
        "contacts": {
            "phone": "+71234567890",
            "emailHome": "home@gmail.com",
            "emailWork": "work@gmail.com",
        }
    }
 }   
```

Expected response(json)
```
{
    "success": true, //required if response is success. Otherwise there must be an "error" key
    "site" => "site.ru", //not required
    "login": "+71234567890", //required on "user.add" and "user.recoverPassword" requests
    "password": "1asdWQdsWpA#!9", //required on "user.add" and "user.recoverPassword" requests
    "info": "The password is valid for 24 hours" //not required
}
```
or
```
{
    "error": "something went wrong..."
}
```

Php code example
```
$postData = trim(file_get_contents("php://input"));
if (!empty($postData))
{
    $data = json_decode($postData, true);
    switch($data['action']){
        case 'user.add':
            $login = $data['client']['contacts']['phone'];
            $password = mt_rand();
            //create user in your site DB
            echo json_encode([
                "success" => true,
                "site" => "mysite.com",
                "login" => $login,
                "password" => $password,
                "info" => "Don't forget to change your password after first logging in"
            ]);    
            break;
        case 'user.update':
            //to do something
            break;
        case 'user.recoverPassword':
            //to do something
            break;
        default:
            echo json_encode(["error" => "Unknown action"]);    
    } 
}
```

Please note that you need to write the reception and processing of data on the site side yourself, since it depends only on your tasks and the architecture of the project.

## Contributing ##

Please feel free to contribute to this project! Pull requests and feature requests welcome!
