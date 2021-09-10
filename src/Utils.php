<?php
namespace AlexNzr\BitUmcIntegration;

class Utils{
    private function __construct(){}

    /** clean request params
     * @param array $params
     * @return array
     */
    public static function cleanRequestData(array $params): array
    {
        $cleanParams = [];
        if (count($params)>0)
        {
            foreach ($params as $key => $param)
            {
                $cleanParam = $param;
                if (is_string($param))
                {
                    $cleanParam = trim(strip_tags(htmlspecialchars($param)));
                }
                elseif (is_array($param))
                {
                    $cleanParam = self::cleanRequestData($param);
                }

                if ($key === 'phone'){
                    $cleanParam = self::formatPhone($cleanParam);
                }

                $cleanParams[$key] = $cleanParam;
            }
        }
        return $cleanParams;
    }

    /** phone number formatting
     * @param string $phone
     * @return string
     */
    public static function formatPhone(string $phone): string
    {
        $phone = preg_replace(
            '/[^0-9]/',
            '',
            $phone);

        if(strlen($phone) > 10)
        {
            $phone = substr($phone, -10);
        }

        return  '+7' . $phone;
    }

    /** creates array with date interval
     * @param int $interval
     * @return array
     */
    public static function getDateInterval(int $interval): array
    {
        if (!is_int($interval)){
            $interval = 30;
        }
        $start = strtotime('today');
        $end = strtotime('today + ' . $interval . ' days');
        return [
            "startDate" => $start,
            "finishDate" => $end,
        ];
    }

    /** clean request params
     * @param array $params
     * @return bool
     */
    public static function validateOrderParams(array $params): bool
    {
        $isValid = true;
        $requiredParams = Variables::REQUIRED_ORDER_PARAMS;
        foreach ($requiredParams as $requiredParam) {
            if (empty($params[$requiredParam])){
                $isValid = false;
            }
        }
        return $isValid;
    }

    /** phone number formatting
     * @param string $dateString
     * @param bool $withTime
     * @return string
     */
    public static function formatDateToOrder(string $dateString, bool $withTime = false): string
    {
        if ($withTime){
            return date("YmdHis", strtotime($dateString));
        }
        return date("Ymd", strtotime($dateString));
    }

    /** create error message in json
     * @param string $message
     * @return string
     */
    public static function addError(string $message): string
    {
        return json_encode(["error" => $message]);
    }
}