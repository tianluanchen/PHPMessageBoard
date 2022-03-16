<?php
/*
 * @Author       :  Ayouth
 * @Date         :  2022-03-14 GMT+0800
 * @LastEditTime :  2022-03-16 GMT+0800
 * @FilePath     :  captcha.php
 * @Description  :  验证码功能
 * Copyright (c) 2022 by Ayouth, All Rights Reserved. 
 */
require_once('../config/api_config.php');
require_once('../function/check_request.php');
$case=new Captcha();
class Captcha
{
    public  function __construct()
    {
        $this->process();
    }
    public function send_response($response)
    {
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit(0);
    }
    public  function process()
    {
        if(($res=check_request())!=null){
            $this->send_response($res);
        };
        $this->send_captcha_img();
    }
    public function send_captcha_img()
    {
        //会话安全配置
        session_start(
            [
                "cookie_httponly" => true,
                "cookie_samesite" => "Strict"
            ]
        );
        $_SESSION['CAPTCHA'] = $this->random_codes(CAPTCHA_LENGTH, CAPTCHA_FORMAT);
        $this->make_captcha_img($_SESSION['CAPTCHA'],CAPTCHA_FONT_FAMILY,CAPTCHA_WIDTH,CAPTCHA_HEIGHT);
    }

    public function make_captcha_img($codes = "", $font_family = "", $width = 100, $height = 40)
    {
        // $captcha_font_family=null;
        $num = strlen($codes);
        //1.创建画布
        $img = imagecreatetruecolor($width, $height);
        //2.分配颜色
        $back_color = imagecolorallocate($img, mt_rand(200, 255), mt_rand(200, 255), mt_rand(200, 255));
        $black = imagecolorallocate($img, 128, 128, 128);
        //3.绘画
        //填充背景颜色
        imagefill($img, 0, 0, $back_color);
        //绘制一个矩形不填充模拟验证码的边框
        imagerectangle($img, 0, 0, $width - 1, $height - 1, $black);
        //干扰线
        for ($i = 0; $i < 10; $i++) {
            $lineColor = imagecolorallocate($img, mt_rand(150, 180), mt_rand(150, 180), mt_rand(150, 180));
            imageline($img, mt_rand(2, $width - 2), mt_rand(2, $height - 2), mt_rand(2, $width - 2), mt_rand(2, $height - 2), $lineColor);
        }
        //干扰点
        for ($i = 0; $i < 250; $i++) {
            $pixelColor = imagecolorallocate($img, mt_rand(120, 150), mt_rand(120, 150), mt_rand(120, 150));
            imagesetpixel($img, mt_rand(2, $width - 2), mt_rand(2, $height - 2), $pixelColor);
        }
        //循环挑选四个不同的字符为了后期单独保存该数字
        for ($i = 0; $i < $num; $i++) {
            //定义字体的随机颜色
            $font_color = imagecolorallocate($img, mt_rand(10, 120), mt_rand(10, 120), mt_rand(10, 120));
            if (empty($font_family)) { //使用系统内置字体库
                //写字
                $x = $width / $num * $i + mt_rand(1, 8);
                $y = mt_rand(10, $height / 2);
                imagechar($img, mt_rand(4, 5), $x, $y, $codes[$i], $font_color);
            } else { 
                $x = $width / $num * $i + mt_rand(9, 12);
                $y = mt_rand($height / 3 * 2, $height / 6 * 5);
                imagefttext($img, mt_rand($height / 5 * 2, $height / 2), mt_rand(0, 45), $x, $y, $font_color, $font_family, $codes[$i]);
            }
        }
        header('Content-type:image/jpeg');
        //5.输出图片到浏览器
        imagejpeg($img);
        //6.释放资源
        imagedestroy($img);
    }

    public  function random_codes($num = 4, $format = 'mix')
    {
        if ($format == 'number') {
            $str = '123456789';
        } else if ($format == 'string') {
            $str = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
        } else
            $str = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
        $codes = "";
        for ($i = 0; $i < $num; $i++) {
            $codes .= $str[mt_rand(0, strlen($str) - 1)];
        }
        return $codes;
    }
}


