## Installation

### Install composer package
Set up `composer.json` in your project directory:
```
{
    "require":{"alex-nzr/bit-umc-integration":"dev-master"}
}
```

Run [composer](https://getcomposer.org/doc/00-intro.md#installation):
```sh
$ php composer.phar install
```
or
```
composer require alex-nzr/bit-umc-integration
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

Response data(json)
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
        "contacts": {
            "phone": "+71234567890",
            "email": "example@gmail.com"
        }
    }
]
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

Response data(json)
```
[
    {
        "name": "Центральная клиника",
        "uid": "df7870cc3-38a6-11e4-8012-20cf3029e98b"
    }
]
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

Response data(json)
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

Php code example
```
$employees = RequestController::sendRequest(json_encode(["action" => "GetListEmployees"]));
```

### Get schedule
You can configure period in `src/Variables.php`. 30 days default
```
SCHEDULE_PERIOD_IN_DAYS = 30;
```

Request data(json)
```
{
    "action": "GetSchedule"
}
```

Response data(json)
```
{
        "specialties": [
            "Офтальмология",
            "Кардиология",
            "Дерматология и косметология"
        ],
        "schedule": [
            {
                "specialty": "Офтальмология",
                "name": "Барбышева Евгения Петровна",
                "refUid": "ac30e13a-3087-11dc-8594-005056c00008",
                "clinicUid": "4c68deb4-22c3-11df-8618-002618dcef2c",
                "duration": "0001-01-01T00:00:00",
                "timetable": {
                    "free": [
                        {
                            "typeOfTimeUid": "624f2a40-5aa8-4f01-83f4-0f38535364bb",
                            "date": "2021-09-18T00:00:00",
                            "timeBegin": "2021-09-18T18:30:00",
                            "timeEnd": "2021-09-18T21:00:00",
                            "formattedDate": "18-09-2021",
                            "formattedTimeBegin": "18:30",
                            "formattedTimeEnd": "21:00"
                        }
                    ],
                    "busy": [
                        {
                            "typeOfTimeUid": "624f2a40-5aa8-4f01-83f4-0f38535364bb",
                            "date": "2021-09-30T00:00:00",
                            "timeBegin": "2021-09-30T18:30:00",
                            "timeEnd": "2021-09-30T21:00:00",
                            "formattedDate": "30-09-2021",
                            "formattedTimeBegin": "18:30",
                            "formattedTimeEnd": "21:00"
                        }
                    ]
                }
            }
        ]
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

Response data(json)
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

Php code example
```
$orders = RequestController::sendRequest(json_encode([
    "action" => "GetListOrders", 
    "clientUid"=>"84291ec6-161a-11ec-9bc2-c03eba27318f"
]));
```

"9f51657e-16dd-11ec-9bc2-c03eba27318f"orderUid
## Examples
Also, you can see the [examples](https://github.com/alex-nzr/bit-umc-lib/tree/master/examples)


## Contributing ##

Please feel free to contribute to this project! Pull requests and feature requests welcome!
