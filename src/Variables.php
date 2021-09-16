<?

namespace AlexNzr\BitUmcIntegration;

/**
 * 
 */
class Variables
{
    const AUTH_LOGIN = 'siteIntegration';
    const AUTH_PASSWORD = '123456';

	const PROTOCOL = 'http';
	const BASE_ADDR = 'localhost:3500';
	const BASE_NAME = 'umc_corp';
	const HTTP_SERVICE_PREFIX = 'hs';
	const HTTP_SERVICE_NAME = 'siteIntegration';
	const HTTP_SERVICE_API_VERSION = 'V1';

	const SCHEDULE_PERIOD_IN_DAYS = 30;

	const REQUIRED_ORDER_PARAMS = [
        'refUid',
        'surname',
        'name',
        'middleName',
        'orderDate',
        'timeBegin',
        'timeEnd',
        'phone',
        'clinicUid'
    ];

	const UNAUTHORIZED_USER_NAME = "|";
    const UNAUTHORIZED_USER_MIDDLE_NAME = "|";
    const UNAUTHORIZED_USER_SURNAME = "Запись с сайта";
    const UNAUTHORIZED_USER_PHONE = "+70000000000";
    const UNAUTHORIZED_USER_UID = "84291ec6-161a-11ec-9bc2-c03eba27318f";

	const SEP = '/';
    const D_SEP = '//';
    const COLON = ':';
}
