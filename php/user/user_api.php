<?php
/*
 * @Author       :  Ayouth
 * @Date         :  2022-03-14 GMT+0800
 * @LastEditTime :  2022-03-16 GMT+0800
 * @FilePath     :  user_api.php
 * @Description  :  留言板普通用户api
 * Copyright (c) 2022 by Ayouth, All Rights Reserved. 
 */
require_once('../config/api_config.php');
require_once('../db/db_handle.php');
require_once('../db/message.php');
require_once('../function/filter.php');
require_once('../function/check_request.php');
require_once('../function/ip.php');
header('Content-Type:application/json; charset=utf-8');
$case = new UserApi();
class UserApi
{
    private $handle;
    public function __construct()
    {
        $this->process();
    }
    //发送json响应并结束程序
    public function send_response($response)
    {
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit(0);
    }
    public function parse_request()
    {
        $this->handle = new DBHandle();
        $res = array('code' => 406, 'msg' => '不合理的请求，请勿恶意请求！');
        //判断post请求是否正确
        if ($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['get'])) {
            if ($_GET['get'] == 'latest') {
                $res = $this->get_user_msg('latest');
            } else if ($_GET['get'] == 'total') {
                $res = $this->get_user_msg('total');
            }
        }
        if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['captcha']) && isset($_POST['name']) && isset($_POST['content'])) {
            //会话安全配置
            session_start(
                [
                    "cookie_httponly" => true,
                    "cookie_samesite" => "Strict"
                ]
            );
            //判断验证码正确否
            if (isset($_SESSION['CAPTCHA']) && strtolower($_SESSION['CAPTCHA']) == strtolower($_POST['captcha'])) {

                $error_msg = name_check($_POST['name']);
                $error_msg = $error_msg ? $error_msg : content_check($_POST['content']);
                if ($error_msg)
                    $res = array("code" => 403, "msg" => $error_msg);
                else if ($this->submit_user_message())
                    $res = array("code" => 200, "msg" => "留言提交成功");
                else
                    $res = array("code" => 500, "msg" => "留言提交失败");
            } else {
                $res = array("code" => 401, "msg" => "验证码错误");
            }
            //删除验证码会话
            if (isset($_SESSION['CAPTCHA'])) {
                unset($_SESSION['CAPTCHA']);
            }
        }
        $this->handle->close();
        $this->send_response($res);
    }
    //请求处理函数
    function process()
    {
        if (($res = check_request()) != null) {
            $this->send_response($res);
        };
        $this->parse_request();
    }
    //api发送客户端
    function get_user_msg($instruct)
    {
        $latest_num = LATEST_NUMBER;
        if ($instruct == "latest")
            $msg_list = $this->handle->query_latest($latest_num);
        else
            $msg_list = $this->handle->query_all();
        if ($msg_list === null) {
            return array('code' => 500, 'msg' => '服务器错误，无法获取数据');
        }
        $res = array('code' => 200, 'msg' => '获取成功', 'count' => count($msg_list), 'messages' => array());
        for ($i = 0; $i < count($msg_list); $i++) {
            //xss转码
            $msg_list[$i]->rm_xss();
            $res['messages'][]=$msg_list[$i]->to_array(['name', 'date', 'content', 'reply']);
        }
        return $res;
    }
    //api接收客户端提交信息
    function submit_user_message()
    {
        $submit_date = date('Y-m-d H:i:s', time());
        $msg = new Message(
            $_POST['name'],
            $submit_date,
            $_POST['content'],
            get_client_ip(),
            isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : ''
        );
        return $this->handle->insert_msg($msg->to_array());
    }
}
