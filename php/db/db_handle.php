<?php
/*
 * @Author       :  Ayouth
 * @Date         :  2022-03-14 GMT+0800
 * @LastEditTime :  2022-03-16 GMT+0800
 * @FilePath     :  db_handle.php
 * @Description  :  数据库高级处理类
 * Copyright (c) 2022 by Ayouth, All Rights Reserved. 
 */
require_once('db.php');
require_once('message.php');
require_once('../config/db_config.php');
//数据库管理
class DBHandle
{
   private  $db;
   private  $table_name;
   private  $is_closed;
   public function __construct()
   {
      $this->table_name = DB_CONFIG['table_name'];
      $this->db = new DB(DB_CONFIG);
      $this->is_closed=false;
   }
   public function __destruct()
   {
      $this->close();
   }
   public function close()
   {

      if(!$this->is_closed){
         $this->db->close();
         $this->is_closed=true;
      }
   }
   //保存message
   public function insert_msg($msg)
   {
      //防止sql注入
      $msg['name'] = mysqli_real_escape_string($this->db->conn, $msg['name']);
      $msg['user_agent'] = mysqli_real_escape_string($this->db->conn, $msg['user_agent']);
      $msg['content'] = mysqli_real_escape_string($this->db->conn, $msg['content']);
      $msg['reply'] = mysqli_real_escape_string($this->db->conn, $msg['reply']);
      $msg['ip'] = mysqli_real_escape_string($this->db->conn, $msg['ip']);
      $format = "insert into `%s` (`name`,`date`,`content`,`ip`,`user_agent`,`reply`)values('%s','%s','%s','%s','%s','%s')";
      $sql = sprintf($format, $this->table_name, $msg['name'], $msg['date'], $msg['content'], $msg['ip'], $msg['user_agent'], $msg['reply']);
      if ($this->db->excute_sql($sql)) {
         return true;
      } else {
         return false;
      }
   }
   //获取所有message
   public function query_all()
   {
      $sql = 'select * from ' . $this->table_name.' order by `id` desc';
      if ($result = $this->db->excute_sql($sql)) {
         $msg_list = array();
         while ($row = mysqli_fetch_assoc($result)) {
            $msg = new Message($row['name'], $row['date'], $row['content'], $row['ip'], $row['user_agent'], $row['reply'],$row['id']);
            $msg_list[]=$msg;
         }
         mysqli_free_result($result);
         return $msg_list;
      }
      return null;
   }
   public function query_latest($num = 10)
   {
      $sql = 'select * from `' . $this->table_name . '` order by `id` desc limit ' . (string)($num);
      if ($result = $this->db->excute_sql($sql)) {
         /* Fetch the results of the query 返回查询的结果 */
         $msg_list = array();
         while ($row = mysqli_fetch_assoc($result)) {
            $msg = new Message($row['name'], $row['date'], $row['content'],  $row['ip'], $row['user_agent'], $row['reply'],$row['id']);
            $msg_list[]= $msg;
         }
         mysqli_free_result($result);
         return $msg_list;
      }
      return null;
   }
   public function update_reply($id = '', $reply = '')
   {
      //防止sql注入
      $reply = mysqli_real_escape_string($this->db->conn, $reply);
      $sql = 'select * from `' . $this->table_name . '` where `id` = "' . $id . '"';
      if ($result = $this->db->excute_sql($sql)) {
         $num = mysqli_num_rows($result);
         mysqli_free_result($result);
         $result = false;
         if ($num == 1) {
            $sql = 'update `' . $this->table_name . '` set `reply`="' . $reply . '" where `id` = "' . $id . '"';
            $result = $this->db->excute_sql($sql);
         }
         return $result;
      }
      return false;
   }
   //先查再删除表中指定数据
   public  function delete($id)
   {
      //防止sql注入
      $id = mysqli_real_escape_string($this->db->conn, $id);
      $sql = 'select * from `' . $this->table_name . '` where `id` = "' . $id . '"';
      if ($result = $this->db->excute_sql($sql)) {
         $num = mysqli_num_rows($result);
         mysqli_free_result($result);
         $result = false;
         if ($num == 1) {
            $sql = 'delete from `' . $this->table_name . '` where `id` = "' . $id . '"';
            $result = $this->db->excute_sql($sql);
         }
         return $result;
      }
      return false;
   }
   //删除表中所有数据
   public function delete_all()
   {
      $sql = 'delete from ' . $this->table_name;
      $result = $this->db->excute_sql($sql);
      return $result;
   }
   
}
  
