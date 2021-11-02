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
At first go to `1cExtension/siteIntegration.cfe` and insert this extension in your 1c base.
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
        "birthday": "10-04-1967",
        "gender": "M",
        "uid": "d4f6fdf5-38a6-11e4-8012-20cf3029e98b",
        "isAppointmentBlocked": "N",
        "contacts": {
            "phone": "+71234567890",
            "email": "example@gmail.com"
        }
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
```
{
    "action": "GetListEmployees"
}
```

Success response data(json)
```
[
    {
        "name": "Иванов",
        "surname": "Иван",
        "middlename": "Иванович",
        "uid": "ac30e13a-3087-11dc-8594-005056c00008",
        "specialty": "Офтальмология",
        "clinicUid": "f679444a-22b7-11df-8618-002618dcef2c"
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
$employees = RequestController::sendRequest(json_encode(["action" => "GetListEmployees"]));
```

### Get schedule
You can configure period(30 days default) and duration(1800 seconds default) in `src/Variables.php`. 
```
SCHEDULE_PERIOD_IN_DAYS = 30;
DEFAULT_APPOINTMENT_DURATION = 1800;
```

Request data(json) DEFAULT_APPOINTMENT_DURATION
```
{
    "action": "GetSchedule"
}
```

Success response data(json)
```
{
        "employees": {
            "ac30e13a-3087-11dc-8594-005056c00008": {
                "specialty": "Офтальмология",
                "name": "Барбышева Евгения Петровна"
            },
            "2eb1f97b-6a3c-11e9-936d-1856809fe650": {
                "specialty": "Хирургия",
                "name": "Безногов Юрий Сергеевич"
            }
        },
        "schedule": [
            {
                "specialty": "Офтальмология",
                "name": "Барбышева Евгения Петровна",
                "refUid": "ac30e13a-3087-11dc-8594-005056c00008",
                "clinicUid": "4c68deb4-22c3-11df-8618-002618dcef2c",
                "duration": "0001-01-01T00:00:00",
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
                            "formattedTimeBegin": "18:30",
                            "formattedTimeEnd": "19:00",
                        }
                    ]
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
Request data(json)
```
{
    "action": "GetListOrders",
    "clientUid": "84291ec6-161a-11ec-9bc2-c03eba27318f"
}
```

Success response data(json)
```
[
    {
        "orderUid": "01fa3622-16f1-11ec-9bc2-c03eba27318f",
        "orderNumber": "00000001098",
        "orderDate": "25-09-2021",
        "timeBegin": "09:00",
        "timeEnd": "13:00",
        "orderState": "Создана на сайте",
        "orderNote": "Some text about this order",
        "clinicName": "Третий хирургический центр",
        "doctorName": "Безногов Юрий Сергеевич",
        "doctorSpecialty": "Хирургия",
        "clientName": "Иванов И.И.",
        "clientBirthday": "01-01-1970",
        "clientComment": "not used, see orderNote"
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

If this param `clientUid` is empty and `action=CreateOrder`, 1c will create new client in DB.

If param `action` = `CreateOrderUnauthorized`, it will fill param `clientUid` from `src/Variables.php` - `UNAUTHORIZED_USER_UID`.  
If constant `UNAUTHORIZED_USER_UID` is empty or not valid, it will create new user from other params:
`UNAUTHORIZED_USER_NAME
UNAUTHORIZED_USER_MIDDLE_NAME
UNAUTHORIZED_USER_SURNAME
UNAUTHORIZED_USER_PHONE`

If param `orderUid` not empty, 1c will update already existing order.

`refUid` - doctor or cabinet uuid from schedule
```
{
    "action"*: "CreateOrder"/"CreateOrderUnauthorized",
    "clinicUid"*: "f679444a-22b7-11df-8618-002618dcef2c"
    "refUid"*: "9e8b672a-9975-11e3-87ec-002618dcef2c"
    "orderDate"*: "2021-09-20T00:00:00"
    "timeBegin"*: "2021-09-20T14:00:00"
    "timeEnd"*: "2021-09-20T18:00:00"
    "name"*: "Игорь" 
    "surname"*: "Васильевич" 
    "middleName"*: "Нариманов"
    "phone"*: "8 (999) 555-55-55"
    "email": "igor12121@gmail.com"
    "comment": "Какой-то текст комментария"
    "address": "г. Москва, ул. Пушкина 56"
    "clientUid": "84291ec6-161a-11ec-9bc2-c03eba27318f",
    "orderUid": "01fa3622-16f1-11ec-9bc2-c03eba27318f"
}
```

Success response data(json)
```
{
    "orderUid": "01fa3622-16f1-11ec-9bc2-c03eba27318f",
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
    "clinicUid" => "f679444a-22b7-11df-8618-002618dcef2c"
    "specialty" => "Неврология"
    "refUid" => "9e8b672a-9975-11e3-87ec-002618dcef2c"
    "orderDate" => "2021-09-20T00:00:00"
    "timeBegin" => "2021-09-20T14:00:00"
    "timeEnd" => "2021-09-20T18:00:00"
    "name" => "Игорь" 
    "surname" => "Васильевич" 
    "middleName" => "Нариманов"
    "phone" => "8 (999) 555-55-55"
    "email" => "igor12121@gmail.com"
    "comment" => "Какой-то текст комментария"
    "address" => "г. Москва, ул. Пушкина 56"
]));
```

### Canceling order
Request data(json)
```
{
    "action": "CancelOrder",
    "orderUid": "84291ec6-161a-11ec-9bc2-c03eba27318f"
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
When the demo mode is enabled, the application will not make requests to 1C, but will return json data from the class 'src/RequestServiceDemo.php`
```
   const DEMO_MODE = "Y"; 
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
            "email": "example@gmail.com"
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
    $data = json_decode($postData);
    switch($data['action']){
        case 'user.add':
            $login = $data['contacts']['phone'];
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
