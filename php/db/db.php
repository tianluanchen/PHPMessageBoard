<?php
/*
 * @Author       :  Ayouth
 * @Date         :  2022-03-14 GMT+0800
 * @LastEditTime :  2022-03-16 GMT+0800
 * @FilePath     :  db.php
 * @Description  :  数据库基本操作类
 * Copyright (c) 2022 by Ayouth, All Rights Reserved. 
 */
//数据库
class DB
{
    public $conn;
    function __construct($db_config)
    {
        $username = $db_config['username'];
        $password = $db_config['password'];
        $database = $db_config['database'];
        $hostname = $db_config['hostname'];
        $port = $db_config['port'];
        $this->conn = mysqli_connect($hostname, $username, $password, $database, $port);
        if (!$this->conn) {
            die("Connection failed: " . mysqli_connect_error());
        }
    }
    //执行sql语句
    function excute_sql($sql)
    {
        $result = mysqli_query($this->conn, $sql);
        return $result;
    }
    //注意创建类后，要记得关闭数据库连接
    function close()
    {
        mysqli_close($this->conn);
    }
}