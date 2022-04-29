/*
 * @Author       :  Ayouth
 * @Date         :  2022-03-15 GMT+0800
 * @LastEditTime :  2022-04-29 GMT+0800
 * @FilePath     :  admin.js
 * @Description  :  管理面板js
 * Copyright (c) 2022 by Ayouth, All Rights Reserved. 
 */
//load 加载对象
var load = {
    open: function () {
        var loader = document.querySelector('div.loader');
        if (loader) {
            loader.classList.toggle('active', true);
            return true;
        }
        return false;
    },
    close: function () {
        var loader = document.querySelector('div.loader');
        if (loader && loader.querySelector('div')) {
            loader.classList.toggle('active', false);
            return true;
        }
        return false;
    }
}
/**
 * @description: 定义普通消息的Swal配置
 */
var Toast = Swal && Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 2500,
})
/**
 * @description: 进度条
 * @param {void}
 * @return {void}
 */
function displayProgressBar() {
    var setPercentage = function () {
        var scrollTopMax = document.documentElement.scrollHeight - window.innerHeight;
        var scrollTop = document.documentElement.scrollTop;
        // 根据滚动位置做的事
        var bar = document.querySelector('.progress-bar');
        bar && (bar.style.width = scrollTop / scrollTopMax * window.innerWidth + 'px');    
    }
    var ticking = false;
    window.addEventListener('load', setPercentage);
    window.addEventListener('scroll', function (e) {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                setPercentage();
                ticking = false;
            });
            ticking = true;
        }
    });
}

/**
 * @description: 色彩模式切换
 * @param {void}
 * @return {void}
 */
function modeToggle() {
    var btn = document.querySelector('.darkmode-toggle');
    var css = document.querySelector('link#dark-css');
    if (localStorage.getItem('admin-panel-dark-mode') == 'true') {
        btn.classList.toggle('darkmode-toggle-light', false);
        css.disabled = true;
        localStorage.setItem('admin-panel-dark-mode', 'false');
    } else {
        btn.classList.toggle('darkmode-toggle-light', true);
        css.disabled = false;
        localStorage.setItem('admin-panel-dark-mode', 'true');
    }
}
/**
 * @description: 刷新验证码 tip表示是否提示弹窗
 * @param {Boolean} tip
 * @return {void}
 */
function refreshCaptcha(tip = true) {
    var target = document.querySelector('#captcha');
    if (!target) {
        return;
    }
    target.src = target.dataset.url + '?t=' + String(new Date().getTime());
    if (tip) {
        target.onload = function () {
            Toast.fire({
                icon: 'success',
                title: '验证码已刷新'
            })
        };
        target.onerror = function(){
            Toast.fire({
                icon: 'error',
                title: '验证码刷新失败'
            })
        };
    }
}
// 登录表单显示控制
var loginForm = {
    open: function () {
        refreshCaptcha(false);
        var login = document.querySelector('.login-container');
        login && login.classList.toggle('hide', false);
        var footer = document.querySelector('footer');
        footer & footer.classList.toggle('hide', false);
        var main = document.querySelector('main');
        main && main.classList.toggle('hide', true);
    },
    close: function () {
        var captcha = document.querySelector('img#captcha');
        captcha && captcha.removeAttribute('src');
        var login = document.querySelector('.login-container');
        login && login.classList.toggle('hide', true);
        var footer = document.querySelector('footer');
        footer & footer.classList.toggle('hide', true);
    }
}
//table数据显示控制
var dataTable = {
    open: function () {
        var login = document.querySelector('main');
        login && login.classList.toggle('hide', false);
        var footer = document.querySelector('footer');
        footer & footer.classList.toggle('hide', false);
        var main = document.querySelector('.login-container');
        main && main.classList.toggle('hide', true);
    },
    close: function () {
        var login = document.querySelector('.main');
        login && login.classList.toggle('hide', true);
        var footer = document.querySelector('footer');
        footer & footer.classList.toggle('hide', true);
    }
}
/**
 * @description: 渲染获得的数据
 * @param {Array} messages
 * @return {void}
 */
function renderData(messages) {
    var tbody = document.querySelector('tbody');
    while (tbody.lastChild) {
        tbody.removeChild(tbody.lastChild);
    }
    if (messages.length <= 0) {
        Swal.fire({
            icon: 'warning',
            title: '暂无留言',
            confirmButtonText: '确认'
        })
        dataTable.open();
        return;
    }
    var df = document.createDocumentFragment();
    messages.forEach(function (msg) {
        var tr = document.createElement('tr');
        var td;
        for (var item of ['id', 'name', 'date', 'content', 'ip', 'user_agent', 'reply']) {
            td = document.createElement('td');
            td.title = item;
            if (msg[item] === null || String(msg[item]).length == 0) {
                td.classList.toggle('empty', true);
            }
            td.innerHTML = msg[item];
            tr.appendChild(td);
        }
        td = document.createElement('td');
        td.innerHTML = `<button onclick="updateReply(this)" data-id="${msg.id}">回复</button>`;
        tr.appendChild(td);
        td = document.createElement('td');
        td.innerHTML = `<input type="checkbox" name="${msg.id}">`;
        var checkbox = td.lastElementChild;
        td.onclick=checkbox.onclick=function(){
            checkbox.checked = !checkbox.checked;
            checkbox.checked ? Toast.fire({
                icon: 'success',
                title: '已选中' + checkbox.name+'号留言',
            }) : Toast.fire({
                icon: 'info',
                title: '已取消选中' + checkbox.name+'号留言',
            })
        };
        tr.appendChild(td);
        df.appendChild(tr);
    });
    tbody.appendChild(df);
    dataTable.open();
    Toast.fire({
        icon: 'success',
        title: '成功加载' + messages.length + '条留言'
    });
}

/**
 * @description: 页面初始加载或刷新数据
 * @param {void}
 * @return {void}
 */
async function initDataLoad() {
    load.open();
    var url = '../php/admin/admin_api.php?get';
    try {
        var res = await fetch(url);
        var json = await res.json();
    } catch (error) {
        console.log(error)
        Swal.fire({
            title: '服务器响应出错！',
            text: '请等待站长修复',
            icon: 'error',
            confirmButtonText: '确认'
        });
        load.close();
        return;
    }
    if (json.code != 200) {
        loginForm.open();
        Toast.fire({
            title: json.msg,
            icon: 'warning',
        })
    }
    else {
        renderData(json.messages);
    }
    load.close();
    console.log('%cProject:PHPMessageBoard  Author:Ayouth  GitHub:https://github.com/tianluanchen/PHPMessageBoard','display:block;padding:5px;border-radius:3px;color:#f3f3f3;background-color:#4882ee;font-size:18px');
}

/**
 * @description: 提交登录表单
 * @param {void}
 * @return {void}
 */
async function submitLoginForm() {
    var account = document.querySelector('#account');
    if (account.value.replace(/\s/g, '').length <= 0) {
        Toast.fire({
            title: '账号不能为空',
            icon: 'error',
        });
        return;
    }
    var password = document.querySelector('#password');
    if (password.value.replace(/\s/g, '').length <= 0) {
        Toast.fire({
            title: '密码不能为空',
            icon: 'error',
        });
        return;
    }
    var captcha = document.querySelector('#input-captcha');
    if (!/[0-9a-zA-Z]+/.test(captcha.value.replace(/\s/g, ''))) {
        Toast.fire({
            title: '验证码格式错误',
            icon: 'error',
        });
        return;
    }
    var body = '';
    captcha.value = captcha.value.replace(/\s/g, '')
    for (var item of [account, password, captcha]) {
        body += encodeURIComponent(item.name) + '=' + encodeURIComponent(item.value) + '&';
    }
    try {
        load.open();
        var res = await fetch("../php/admin/admin_api.php", {
            method: "POST",
            headers: {
                "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: body
        });
        var json = await res.json();
    } catch (error) {
        Swal.fire({
            title: '服务器响应出错！',
            text: '请等待站长修复',
            icon: 'error',
            confirmButtonText: '确认'
        });
        return;
    } finally {
        captcha.value = '';
        load.close();
    }
    if (json.code != 200) {
        Swal.fire({
            title: '登录失败！',
            text: json.msg,
            icon: 'error',
            confirmButtonText: '确认'
        }).then(function () {
            refreshCaptcha();
        });
    } else {
        Swal.fire({
            title: '登录成功！',
            text: json.msg,
            icon: 'success',
            confirmButtonText: '确认'
        }).then(function () {
            loginForm.close();
            initDataLoad();
        });
    }
}


/**
 * @description: 全选，再按一下全不选
 * @param {void}
 * @return {void}
 */
function selectAll() {
    var btn = document.querySelector('.select-all');
    if (!btn) {
        return;
    }
    var value = btn.dataset.selectAll == 'true' ? false : true;
    var counter = 0;
    document.querySelectorAll('table input[type="checkbox"]').forEach(function (ele) {
        ele.checked = value;
        counter++;
    });
    btn.dataset.selectAll = value ? 'true' : 'false';
    var title = '';
    if (value) {
        title = '已全选' + counter + '条留言';
    } else {
        title = '已取消全选';
    }
    Toast.fire({
        icon: 'success',
        title: title
    })
}

/**
 * @description: 退出登录
 * @param {void}
 * @return {void}
 */
async function logout() {
    var result = await Swal.fire({
        title: '登出提示',
        text: "您确定退出当前登录状态吗？",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
    });
    if (!result.isConfirmed) {
        return;
    }
    load.open();
    var url = '../php/admin/admin_api.php?logout=true';
    try {
        var res = await fetch(url);
        var json = await res.json();
    } catch (error) {
        console.log(error)
        Swal.fire({
            title: '服务器响应出错！',
            text: '请等待站长修复',
            icon: 'error',
            confirmButtonText: '确认'
        });
        return;
    }
    finally {
        load.close();
    }
    if (json.code != 200) {
        Swal.fire({
            title: '出现错误！',
            text: json.msg,
            icon: 'error',
            confirmButtonText: '确认'
        })
    } else {
        Swal.fire({
            title: json.msg,
            icon: 'success',
            confirmButtonText: '确认'
        }).then(initDataLoad);
    }
}

/**
 * @description: 更新回复
 * @param {HTMLElement} target
 * @return {*}
 */
async function updateReply(target) {
    var id = target.dataset.id;
    if (!target.dataset.id) {
        Swal.fire({
            icon: 'error',
            title: '找不到对应的ID',
            confirmButtonText: '确认'
        });
        return;
    }
    var result = await Swal.fire({
        icon: 'info',
        title: '请输入您的回复',
        input: 'textarea',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: '确认',
        cancelButtonText: '取消',
    });
    if (!result.isConfirmed) {
        return;
    }
    var reply = result.value;
    result = await Swal.fire({
        icon: 'question',
        title: '您确定为' + id + '号留言回复以下内容',
        html: '<textarea class="swal2-textarea" autocomplete="off" readonly id="your-update-reply"></textarea>',
        willOpen: function (target) {
            target.querySelector('#your-update-reply').value = reply;
        },
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: '更新',
        cancelButtonText: '取消',
    });
    if (!result.isConfirmed) {
        return;
    }
    load.open();
    try {
        var body = 'instruct=reply&id=' + id + '&reply=' + encodeURIComponent(reply);
        var res = await fetch("../php/admin/admin_api.php", {
            method: "POST",
            headers: {
                "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: body
        });
        var json = await res.json();
    } catch (error) {
        console.log(error)
        Swal.fire({
            title: '服务器响应出错！',
            text: '请等待站长修复',
            icon: 'error',
            confirmButtonText: '确认'
        });
        return;
    }
    finally {
        load.close();
    }
    if (json.code != 200) {
        Swal.fire({
            title: json.msg,
            icon: 'error',
            confirmButtonText: '确认'
        })
    } else {
        Swal.fire({
            title: json.msg,
            icon: 'success',
            confirmButtonText: '确认'
        }).then(initDataLoad);
    }
}

/**
 * @description: 删除留言
 * @param {void}
 * @return {void}
 */
async function deleteMsg() {
    var idList = [];
    document.querySelectorAll('input[type="checkbox"]').forEach(function (ele) {
        if (ele.checked) {
            idList.push(ele.name);

        }
    });
    if (idList.length <= 0) {
        Swal.fire({
            title: '没有选中的留言',
            icon: 'warning',
            confirmButtonText: '确认',
        });
        return;
    }
    var result = await Swal.fire({
        icon: 'question',
        title: '您确定删除以下ID的留言吗？',
        text: idList.join(),
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        showCancelButton: true,
        allowOutsideClick: false
    });
    if (!result.isConfirmed) {
        return;
    }
    load.open();
    try {
        var body = 'instruct=delete';
        var brackets = encodeURIComponent('[]');
        idList.forEach(function (id) {
            body += '&id' + brackets + '=' + id;
        });
        var res = await fetch("../php/admin/admin_api.php", {
            method: "POST",
            headers: {
                "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: body
        });
        var json = await res.json();
    } catch (error) {
        console.log(error)
        Swal.fire({
            title: '服务器响应出错！',
            text: '请等待站长修复',
            icon: 'error',
            confirmButtonText: '确认'
        });
        return;
    }
    finally {
        load.close();
    }
    if (json.code != 200) {
        Swal.fire({
            title: json.msg,
            icon: 'error',
            confirmButtonText: '确认'
        })
        return;
    }
    if (json.failure.length == 0) {
        await Swal.fire({
            title: json.msg,
            text: '删除的ID为' + json.success.join(),
            icon: 'success',
            confirmButtonText: '确认'
        });
    } else if (json.success.length == 0) {
        await Swal.fire({
            title: json.msg,
            text: '未删除的ID为' + json.failure.join(),
            icon: 'error',
            confirmButtonText: '确认'
        });
    } else {
        await Swal.fire({
            title: json.msg,
            text: '成功删除的ID为' + json.success.join() + ';未删除的ID为' + json.failure.join(),
            icon: 'warning',
            confirmButtonText: '确认'
        });
    }
    result = await Swal.fire({
        title: "是否现在刷新？",
        icon: 'question',
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        showCancelButton: true
    });
    if (result.isConfirmed) {
        initDataLoad();
    }
}

//执行
displayProgressBar();
initDataLoad();