## Usage

### Fill required options
At first go to `src/Variables.php` and fill params to access in your 1C base. Base mast be published on web-server
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
        "name": "Аркадий"
        "surname": "Ахмин"
        "middlename": "Николаевич"
        "inn": "1211321231"
        "snils": "030-213132121"
        "birthday": "10-04-1967"
        "gender": "M"
        "uid": "d4f6fdf5-38a6-11e4-8012-20cf3029e98b"
        "contacts": {
            "phone": "+71234567890"
            "email": "example@gmail.com"
        }
    }
]
```

Php code example
```
$clients = RequestController::sendRequest(json_encode(["action" => "GetListClients"]));
```


"orderUid"=>"9f51657e-16dd-11ec-9bc2-c03eba27318f"
$clientUid = "84291ec6-161a-11ec-9bc2-c03eba27318f";
##
Also, you can see the [examples](https://github.com/alex-nzr/bit-umc-lib/tree/master/examples)

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

## Contributing ##

Please feel free to contribute to this project! Pull requests and feature requests welcome!
