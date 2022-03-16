<?php
/*
 * @Author       :  Ayouth
 * @Date         :  2022-03-14 GMT+0800
 * @LastEditTime :  2022-03-16 GMT+0800
 * @FilePath     :  ip.php
 * @Description  :  获取IP
 * Copyright (c) 2022 by Ayouth, All Rights Reserved. 
 */
/** 
 * 获取客户端IP地址 
 * @param integer $type 返回类型 0 返回IP字符串 1 返回IP数组 
 * @return mixed 
 */
function get_client_ip($type = 0)
{
    $ip = [];
    if (isset($_SERVER['REMOTE_ADDR'])) {
        $ip[] = $_SERVER['REMOTE_ADDR'];
    } else {
        $ip[] = 'null';
    }
    //> 判断用户是否通过代理服务器访问（用户可能伪造ip地址）
    if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $arr    =   explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        $pos    =   array_search('unknown', $arr);
        if (false !== $pos)
            unset($arr[$pos]);
        //> 去除字符串开始和结尾的空格或其他。
        foreach ($arr as $item) {
            $temp = trim($item);
            if (false !== filter_var(
                $temp,
                FILTER_VALIDATE_IP,
                FILTER_FLAG_IPV4 | FILTER_FLAG_IPV6 |
                    FILTER_FLAG_NO_PRIV_RANGE |
                    FILTER_FLAG_NO_RES_RANGE
            ))
                $ip[] = trim($arr[0]);
        }
    }
    if (isset($_SERVER['HTTP_CLIENT_IP'])) {
        $ip[] = $_SERVER['HTTP_CLIENT_IP'];
    }
    // IP地址合法验证 
    if($type==1){
        return $ip;
    }else{
        return implode(",", $ip);
    }
}