<?php
/*
 * @Author       :  Ayouth
 * @Date         :  2022-03-14 GMT+0800
 * @LastEditTime :  2022-03-16 GMT+0800
 * @FilePath     :  api_config.php
 * @Description  :  api配置
 * Copyright (c) 2022 by Ayouth, All Rights Reserved. 
 */
//生产环境请打开下面两行注释，隐藏可能出现的错误
// error_reporting(E_ERROR);
// ini_set("display_errors", "Off");

//中国北京时间时区
ini_set('date.timezone', 'Asia/Shanghai');

//管理员账户和密码
define("ADMIN_ACCOUNT",    "Test");
define("ADMIN_PASSWORD",    "123");

//允许调用api的主机或域名，非80、443需带端口号
define('ALLOWED_HOSTS', [
    "127.0.0.1:3000",
    "localhost"
]);


//禁止的昵称（可写自己昵称）
define('PROHIBITED_NAMES', [
    'Ayouth'
]);


//获取最新消息的数量
define('LATEST_NUMBER', 10);

//验证码格式和大小
define('CAPTCHA_FORMAT', 'mix');
define('CAPTCHA_LENGTH', 4);
define('CAPTCHA_FONT_FAMILY', null); // $captcha_font_family='../static/font.ttf';
define('CAPTCHA_HEIGHT', 40);
define('CAPTCHA_WIDTH', 100);
