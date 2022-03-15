<?php
/*
 * @Author       :  Ayouth
 * @Date         :  2022-03-14 GMT+0800
 * @LastEditTime :  2022-03-16 GMT+0800
 * @FilePath     :  filter.php
 * @Description  :  提交信息筛选函数
 * Copyright (c) 2022 by Ayouth, All Rights Reserved. 
 */
require_once('../config/api_config.php');
function name_check($name)
{
    if (strlen($name) > 64) {
        return "昵称过长";
    }
    if (strlen(str_replace(" ", "", $name)) == 0) {
        return "昵称不能全为空格";
    }
    if (in_array($name, PROHIBITED_NAMES, true)) {
        return "该昵称被禁止使用";
    }
    return null;
}
function content_check($content)
{
    if (strlen($content) > 1024) {
        return "留言过长";
    }
    return null;
}
