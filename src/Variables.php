<?

namespace AlexNzr\BitUmcIntegration;


class Variables
{
    const DEMO_MODE = "N";

    const AUTH_LOGIN_1C = 'siteIntegration';
    const AUTH_PASSWORD_1C = '123456';

	const PROTOCOL = 'http';
	const BASE_ADDR = 'localhost:3500';
	const BASE_NAME = 'umc_corp';

	const HTTP_SERVICE_PREFIX = 'hs';
	const HTTP_SERVICE_NAME = 'siteIntegration';
	const HTTP_SERVICE_API_VERSION = 'V1';

	const SCHEDULE_PERIOD_IN_DAYS = 30;
	const DEFAULT_APPOINTMENT_DURATION = 1800;

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

	const PATH_TO_LOG_FILE = __DIR__."/log.txt";

	const SEP = '/';
    const D_SEP = '//';
    const COLON = ':';
}
