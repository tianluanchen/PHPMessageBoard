<?php
/*
 * @Author       :  Ayouth
 * @Date         :  2022-03-14 GMT+0800
 * @LastEditTime :  2022-03-16 GMT+0800
 * @FilePath     :  message.php
 * @Description  :  留言类
 * Copyright (c) 2022 by Ayouth, All Rights Reserved. 
 */
//message 数据类
class Message
{
    private $msg;
    public   function __construct($name, $date, $content, $ip = '', $user_agent = '', $reply ='',$id = '')
    {
        $this->msg = array();
        $this->msg['name'] = $name;
        $this->msg['date'] = $date;
        $this->msg['content'] = $content;
        $this->msg['id'] = $id;
        $this->msg['ip'] = $ip;
        $this->msg['user_agent'] = $user_agent;
        $this->msg['reply'] = $reply;
    }

    //返回可选json字符串
    public function to_json($opts = ['id', 'name', 'date', 'content', 'ip', 'user_agent', 'reply'], $unicode = false)
    {
        $arr = $this->to_array($opts);
        $json = $unicode ? json_encode($arr, JSON_UNESCAPED_UNICODE) : json_encode($arr);
        return $json;
    }
    //返回可选参数的数组
    public   function to_array($opts = ['id', 'name', 'date', 'content', 'ip', 'user_agent', 'reply'])
    {
        $arr = array();
        foreach ($opts as $key) {
            if (array_key_exists($key, $this->msg)) {
                $arr[$key] = $this->msg[$key];
            }
        }
        return $arr;
    }
    //去除xss攻击
    public function rm_xss(){
        foreach( $this->msg  as $key => $value){
            if($value!=null){
                $this->msg[$key]=htmlspecialchars($value);
            }
        }
    }
}
