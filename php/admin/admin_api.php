<?php
/*
 * @Author       :  Ayouth
 * @Date         :  2022-03-14 GMT+0800
 * @LastEditTime :  2022-03-16 GMT+0800
 * @FilePath     :  admin_api.php
 * @Description  :  管理员API
 * Copyright (c) 2022 by Ayouth, All Rights Reserved. 
 */
require_once('../config/api_config.php');
require_once('../db/db_handle.php');
require_once('../db/message.php');
require_once('../function/check_request.php');
header('Content-Type:application/json; charset=utf-8');
$case = new AdminApi();
class AdminApi
{
    private $handle;
    public function __construct()
    {
        $this->process();
    }
    public  function logout()
    {
        unset($_SESSION['ADMIN']);
        $res = array('code' => 200, 'msg' => '成功退出已验证状态');
        $this->send_response($res);
    }
    public  function deal_with_login()
    {
        if (isset($_SESSION['ADMIN']) && $_SESSION['ADMIN'] == ADMIN_ACCOUNT) {
            return;
        }
        $res = array('code' => 401, 'msg' => '身份尚未认证');
        if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['account']) && isset($_POST['password'])) {
            if (!isset($_POST['captcha']) || !isset($_SESSION['CAPTCHA']) || strtolower($_SESSION['CAPTCHA']) != strtolower($_POST['captcha']))
                $res = array('code' => 401, 'msg' => '验证码错误');
            else if ($_POST['account'] != ADMIN_ACCOUNT || $_POST['password'] != ADMIN_PASSWORD)
                $res = array('code' => 406, 'msg' => '账户或密码错误');
            else {
                $_SESSION['ADMIN'] = ADMIN_ACCOUNT;
                $this->send_response(array('code' => 200, 'msg' => '验证成功'));
            }
        }
        //删除验证码会话
        if (isset($_SESSION['CAPTCHA'])) {
            unset($_SESSION['CAPTCHA']);
        }
        $this->send_response($res);
    }
    public function parse_request()
    {
        $res = array('code' => 406, 'msg' => '不合理的请求，请勿恶意请求！');
        $this->handle = new DBHandle();
        if (isset($_GET['logout'])) {
            $this->logout();
        }
        if ($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['get'])) {
            $res = $this->get_user_msg();
        }
        if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['id']) && isset($_POST['instruct']) && in_array($_POST['instruct'], ['delete', 'reply'], true)) {
            $res = array('code' => 406, 'msg' => '参数类型错误');
            if ($_POST['instruct'] == 'delete' && is_array($_POST['id'])) {
                $error_param = 0;
                foreach ($_POST['id'] as $item) {
                    if (!is_string($item)) {
                        $error_param += 1;
                        break;
                    }
                }
                if ($error_param == 0) {
                    $res = array('code' => 200, 'msg' => '全部删除成功', 'total' => count($_POST['id']), 'success' => array(), 'failure' => array());
                    if ($this->handle->delete($item)) {
                        $res['success'][] = $item;
                    } else
                        $res['failure'][] = $item;
                    if (count($res['failure']) > 0)
                        $res['msg'] = '部分删除成功';
                    if (count($res['success']) == 0)
                        $res['msg'] = '全部删除失败';
                }
            } else if ($_POST['instruct'] == 'reply' && isset($_POST['reply']) && is_string($_POST['id']) && is_string($_POST['reply'])) {
                if ($this->handle->update_reply($_POST['id'], $_POST['reply'])) {
                    $res = array('code' => 200, 'msg' => '回复更新成功');
                } else
                    $res = array('code' => 500, 'msg' => 'id不存在或服务器故障');
            }
        }
        $this->send_response($res);
        //判断post请求是否正确
        if ($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['get'])) {
        }
        if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['captcha']) && isset($_POST['name']) && isset($_POST['content'])) {
            //会话安全配置
            session_start(
                [
                    "cookie_httponly" => true,
                    "cookie_samesite" => "Strict"
                ]
            );
        }
        $this->handle->close();
        $this->send_response($res);
    }
    //请求处理函数
    public function process()
    {
        if (($res = check_request()) != null) {
            $this->send_response($res);
        };
        //会话安全配置
        session_start(
            [
                "cookie_httponly" => true,
                "cookie_samesite" => "Strict"
            ]
        );
        $this->deal_with_login();
        $this->parse_request();
    }
    //发送json响应并结束程序
    public function send_response($response)
    {
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit(0);
    }
    public function update_admin_reply($id, $reply)
    {
        $res = array('code' => 500, 'msg' => '服务器错误或id不存在，无法更新回复');
        if ($this->handle->update_reply($id, $reply)) {
            $res = array('code' => 200, 'msg' => '回复更新成功');
        }
        return $res;
    }
    public function get_user_msg()
    {
        $msg_list = $this->handle->query_all();
        if ($msg_list === null) {
            return array('code' => 500, 'msg' => '服务器错误，无法获取数据');
        }
        $res = array('code' => 200, 'msg' => '获取成功', 'count' => count($msg_list), 'messages' => array());
        for ($i = 0; $i < count($msg_list); $i++) {
            //xss转码
            $msg_list[$i]->rm_xss();
            $res['messages'][]=$msg_list[$i]->to_array();
        }
        return $res;
    }
    public function delete_one_msg($id)
    {
        $res = array('code' => 500, 'msg' => '服务器错误或id不存在，无法删除此条消息');
        if ($this->handle->delete($id)) {
            $res = array('code' => 200, 'msg' => '消息已成功删除');
        }
        return $res;
    }
    public function delete_all_msg()
    {
        $res = array('code' => 500, 'msg' => '服务器错误或id不存在，无法删除此条消息');
        if ($this->handle->delete_all()) {
            $res = array('code' => 200, 'msg' => '消息已成功删除');
        }
        return $res;
    }
}
