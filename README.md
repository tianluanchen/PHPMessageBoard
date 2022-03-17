# PHPMessageBoard

[![PHPVersion](https://img.shields.io/badge/PHP-v7.4-blue?logo=php&style=flat-square)](https://www.php.net/downloads)
[![](https://img.shields.io/github/license/tianluanchen/PHPMessageBoard?style=flat-square)](https://github.com/tianluanchen/PHPMessageBoard/blob/main/LICENSE)

前后端分离的留言板Web应用，使用原生PHP和原生JavaScript，另外前端借助到DarkReader和SweetAlert2两个库

## 介绍

这是一个拥有简洁美观的UI和单向交互的留言板，所有留言者对留言板主即站长一人留言，站长可以对单个留言进行回复，目前用户只需提交昵称和内容，然后验证码通过后就会发布在留言板上，整个过程很简单，所以也只有一张数据表。本仓库整个Web程序从前端到后端基本都是原生代码，不过前端用到两个组件库，一个是[SweetAlert2](https://github.com/sweetalert2/sweetalert2)提供优雅的弹窗功能，还有就是[DarkReader](https://github.com/darkreader/darkreader)，快速生成深色模式的CSS样式。

[在线演示](https://tianluanchen.github.io/PHPMessageBoard/)

## 效果

- [x] 简洁设计
- [x] 顶部进度条
- [x] loading加载动效
- [x] 深色模式切换
- [x] 留言板页数切换动效
- [x] 诸多tips
- [x] 响应式网页
- [x] 验证码防护

## 安装

PHP版本>=`7.4`，且需要开启PHP的GD库扩展和mysqli库扩展，使用MySql数据库，在/php/config/目录下分别配置两个文件，文件内附有注释。可以通过msgboard.sql创建默认的message表。

**留言板主信息设置**，在/index.html文件中第43行左右设置留言板标题，第73行左右设置footer版权声明，另外在/js/msgboard.js中第151行左右将`data-name="Ayouth"`中的Ayouth更改为你的板主名称。

## 其它

感谢开源的[SweetAlert2](https://github.com/sweetalert2/sweetalert2)和
[DarkReader](https://github.com/darkreader/darkreader)，这两个库真的非常棒！

## License

The GPL-3.0 License.