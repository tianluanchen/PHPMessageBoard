<?php
/*
 * @Author       :  Ayouth
 * @Date         :  2022-03-14 GMT+0800
 * @LastEditTime :  2022-03-16 GMT+0800
 * @FilePath     :  check_request.php
 * @Description  :  通用请求处理并过滤函数
 * Copyright (c) 2022 by Ayouth, All Rights Reserved. 
 */
require_once('../config/api_config.php');
function check_request()
{
    $allowed = ALLOWED_HOSTS;
    header('Content-Type:application/json; charset=utf-8');
    if (!isset($_SERVER['HTTP_HOST']) || !in_array($_SERVER['HTTP_HOST'], $allowed, true) || !in_array($_SERVER['REQUEST_METHOD'], ['GET', 'POST'], true)) {
        $res = array('code' => 400, 'msg' => '非法的主机名或方法，请停止爬虫或恶意请求');
        return $res;
    }
    if (isset($_SERVER['HTTP_REFERER'])) {
        $ref = $_SERVER['HTTP_REFERER'];
        $arr = parse_url($ref);
        if ($arr) {
            $ref_port = isset($arr['port']) ? ':'.$arr['port'] : '';
            $ref_host = $arr['host'].$ref_port;
        }
    }
    if (!isset($_SERVER['HTTP_USER_AGENT']) || strpos($_SERVER['HTTP_USER_AGENT'], 'Mozilla') === false || !isset($ref_host) || !in_array($ref_host, $allowed, true)) {
        $res = array('code' => 400, 'msg' => '非法来路或UA，请停止爬虫或恶意请求');
        return $res;
    }
    return null;
}
