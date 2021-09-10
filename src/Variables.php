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
        'refUID',
        'surname',
        'name',
        'middleName',
        'orderDate',
        'timeBegin',
        'timeEnd',
        'phone',
        'clinicGUID'
    ];

	const SEP = '/';
    const D_SEP = '//';
    const COLON = ':';
}
