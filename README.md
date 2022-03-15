# PHPMessageBoard

[![PHPVersion](https://img.shields.io/badge/PHP-v7.4-blue?logo=php&style=flat-square)](https://www.php.net/downloads)
[![](https://img.shields.io/github/license/tianluanchen/PHPMessageBoard?style=flat-square)](https://github.com/tianluanchen/PHPMessageBoard/blob/main/LICENSE)

前后端分离的留言板Web应用，使用原生PHP和原生JavaScript，另外前端借助到DarkReader和SweetAlert2两个库

## 介绍

这是一个拥有简洁美观的UI和单向交互的留言板，所有留言者对留言板主即站长一人留言，站长可以对单个留言进行回复，目前用户只需提交昵称和内容，然后验证码通过后就会发布在留言板上，整个过程很简单，所以也只有一张数据表。本仓库整个Web程序从前端到后端基本都是原生代码，不过前端用到两个组件库，一个是[SweetAlert2](https://github.com/sweetalert2/sweetalert2)提供优雅的弹窗功能，还有就是[DarkReader](https://github.com/darkreader/darkreader)，快速生成深色模式的CSS样式。

[在线演示](https://tianluanchen.github.io/PHPMessageBoard/)

**目前留言板后端已完成，前端还剩管理原界面未完成**

## 安装

PHP需在7.4版本及其以上，开启了PHP的GD库扩展和mysqli扩展，在/php/config/目录下分别按需配置两个文件，数据库可以通过msgboard.sql创建可用的表。

## License

The GPL-3.0 License.