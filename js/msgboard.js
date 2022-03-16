/*
 * @Author       :  Ayouth
 * @Date         :  2022-03-14 GMT+0800
 * @LastEditTime :  2022-03-16 GMT+0800
 * @FilePath     :  msgboard.js
 * @Description  :  留言板js 模板演示
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
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
})

/**
 * @description: 刷新验证码 tip表示是否提示弹窗
 * @param {void} tip
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
    }
}

/**
 * @description: 提交表单
 * @param {void}
 * @return {void}
 */
async function submitForm() {
    var name = document.querySelector('#input-name');
    if (name.value.replace(/\s/g, '').length <= 0) {
        Toast.fire({
            title: '昵称不能全为空格',
            icon: 'error',
            position: 'center'
        });
        return;
    }
    var msg = document.querySelector('#input-content');
    if (msg.value.replace(/\s/g, '').length <= 0) {
        Toast.fire({
            title: '留言不能全为空格',
            icon: 'error',
            position: 'center'
        });
        return;
    }
    var captcha = document.querySelector('#input-captcha');
    if (!/[0-9a-zA-Z]+/.test(captcha.value.replace(/\s/g, ''))) {
        Toast.fire({
            title: '验证码格式错误',
            icon: 'error',
            position: 'center'
        });
        return;
    }
    var body = '';
    captcha.value = captcha.value.replace(/\s/g, '')
    for (var item of [name, msg, captcha]) {
        body += encodeURIComponent(item.name) + '=' + encodeURIComponent(item.value) + '&';
    }
    try {
        load.open();
        var res = await fetch("./sample/message-submit.json",
            // {
            //     method: "GET",
            //     headers: {
            //         "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            //     },
            //     body: body
            // }
        );
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
        refreshCaptcha(false);
        load.close();
    }
    if (json.code != 200) {
        Swal.fire({
            title: '提交失败！',
            text: json.msg,
            icon: 'error',
            confirmButtonText: '确认'
        });
    } else {
        Swal.fire({
            title: '提交成功！',
            text: json.msg,
            icon: 'success',
            confirmButtonText: '确认'
        }).then(initDataLoad);
    }
    document.querySelector('#input-captcha').value = '';
}
/**
 * @description: 生成每一条消息的li element
 * @param {object} msg
 * @return {HTMLElement}
 */
function generateMsgEle(msg) {
    var li = document.createElement('li')
    var replyHTML = '';
    if (msg.reply) {
        replyHTML = `<div data-name="Ayouth" class="text reply">${msg.reply}</div>`;
    }
    var innerHTML =
        `<div class="info">
                <span class="nickname">${msg.name}</span>
                <span class="whether-to-reply ${msg.reply ? 'replied' : ''}" ${msg.reply ? 'onclick="displayReply(this)"' : ''} >${msg.reply ? '站长已回复' : '尚未回复'}</span>
            </div>
            <div class="text msg">${msg.content}</div>
            <div class="date">${msg.date}</div>
            ${replyHTML}
            `;
    li.insertAdjacentHTML('afterbegin', innerHTML);
    return li;
}
/**
 * @description: 数据初始化
 * @param {void}
 * @return {void}
 */
async function initDataLoad() {
    load.open();
    var url = './sample/latest-messages.json?get=latest';
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
        Swal.fire({
            title: '加载异常！',
            text: json.msg,
            icon: 'error',
            confirmButtonText: '确认'
        })
    }
    else if (!json.count || json.count <= 0) {
        Swal.fire({
            title: '暂无留言',
            text: '您不妨写下第一条留言✨🎈',
            icon: 'info',
            confirmButtonText: '确认'
        })
    }
    else {
        Toast.fire({
            icon: 'success',
            title: '成功加载最近留言'
        });
        var df = document.createDocumentFragment();
        for (var msg of json.messages) {
            df.appendChild(generateMsgEle(msg));
        }
        var parent = document.querySelector('ul.msg-list');
        parent.dataset.page = 0;
        parent.innerHTML = '';
        parent.appendChild(df);
        var pageNav = document.querySelector('.page-nav');
        while (pageNav && pageNav.lastChild) {
            pageNav.removeChild(pageNav.lastChild);
        }
        pageNav && (pageNav.innerHTML = `
        <span onclick="loadAllData()" class="load-more">加载更多</span>
        `);
    }
    load.close();
}
/**
 * @description: 进度条
 * @param {void}
 * @return {void}
 */
function displayProgressBar() {
    var setPercentage = function () {
        var topMax = document.documentElement.scrollHeight - window.innerHeight;
        var top = document.documentElement.scrollTop;
        // 根据滚动位置做的事
        var bar = document.querySelector('.progress-bar');
        bar && (bar.style.width = Math.round(top / topMax * 10) * 10 + '%');
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
 * @description: 显示回复
 * @param {HTMLElement} ele
 * @return {void}
 */
function displayReply(ele) {
    var li = ele.parentElement.parentElement;
    var reply = li && li.querySelector('.reply');
    if (reply) {
        reply.style.display = 'block';
        reply.classList.toggle('display-reply', true);
        Toast && Toast.fire({
            toast: true,
            icon: 'success',
            title: '已显示回复',
        });
    }
}

/**
 * @description: 快捷跳转至留言 
 * @param {void}
 * @return {void}
 */
function leaveAMsg() {
    var inp = document.querySelector('#input-name');
    if (!inp) {
        return;
    }
    inp.scrollIntoView({ block: "center" });
    inp.focus();
    Toast && Toast.fire({
        icon: 'info',
        title: '请写下您的留言'
    })
}

function modeToggle() {
    var btn = document.querySelector('.darkmode-toggle');
    var css = document.querySelector('link#dark-css');
    if (localStorage.getItem('dark-mode') == 'true') {
        btn.classList.toggle('darkmode-toggle-light', false);
        css.disabled = true;
        localStorage.setItem('dark-mode', 'false');
    } else {
        btn.classList.toggle('darkmode-toggle-light', true);
        css.disabled = false;
        localStorage.setItem('dark-mode', 'true');
    }
}

// 所有页面
var pages = [];

/**
 * @description: 
 * @param {Array} messages
 * @param {Number} max
 * @return {void}
 */
function generatePages(messages, max) {
    var pageNum = Math.ceil(messages.length / max);
    pages.forEach(function (ele, i) {
        while (pages[i].lastChild) {
            pages[i].removeChild(pages[i].lastChild);
        }
    });
    var difference = pageNum - pages.length;
    if (difference > 0) {
        for (var i = 0; i < difference; i++) {
            var ul = document.createElement('ul');
            ul.className = 'msg-list';
            pages.push(ul);
            pages[pages.length - 1].dataset.page = pages.length - 1;
        }
    } else if (difference < 0) {
        while (difference < 0) {
            pages.pop();
            difference++;
        }
    }
    var counter = 0;
    for (var msg of messages) {
        pages[Math.floor(counter / 10)].appendChild(generateMsgEle(msg));
        counter++;
    }
}

/**
 * @description: 页面跳转
 * @param {HTMLElement|String} instruct
 * @return {void}
 */
function pageJump(instruct) {
    var index = 0;
    var current = Number(document.querySelector('.msg-list').dataset.page);
    if (typeof instruct == 'string' && ['previous', 'next', 'last'].includes(instruct.toLowerCase())) {
        switch (instruct) {
            case 'previous':
                if (current <= 0) {
                    Toast.fire({
                        toast: true,
                        icon: 'warning',
                        title: '已经是首页',
                    });
                    return;
                }
                index = current - 1;
                break;
            case 'next':
                if (current + 1 >= pages.length) {
                    Toast.fire({
                        toast: true,
                        icon: 'warning',
                        title: '已经是最后一页',
                    });
                    return;
                };
                index = current + 1;
                break;
            case 'last':
                if (current + 1 >= pages.length) {
                    Toast.fire({
                        toast: true,
                        icon: 'warning',
                        title: '已经是最后一页',
                    });
                    return;
                };
                index = pages.length - 1;
                break;
        }
    } else if (instruct instanceof HTMLElement) {
        index = Number(instruct[instruct.selectedIndex].value);
        if (index + 1 > pages.length) {
            Toast.fire({
                toast: true,
                icon: 'error',
                title: '超出最大页数',
            });
            return;
        }
    }
    var select = document.querySelector('#jump');
    select && (select.selectedIndex = index);
    var container = document.querySelector('.message-container');
    if (index > current) {
        pages[index].classList.toggle('msg-list-right-shift', true);
        pages[index].classList.toggle('msg-list-left-shift', false);
    } else {
        pages[index].classList.toggle('msg-list-right-shift', false);
        pages[index].classList.toggle('msg-list-left-shift', true);
    }
    container.replaceChild(pages[index], container.children[0]);
    Toast.fire({
        toast: true,
        icon: 'success',
        title: '当前第' + (index + 1) + '页',
    });
}

/**
 * @description: 加载全部
 * @param {void}
 * @return {void}
 */
async function loadAllData() {
    load.open();
    var url = './sample/total-messages.json?get=total';
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
        Swal.fire({
            title: '加载异常！',
            text: json.msg,
            icon: 'error',
            confirmButtonText: '确认'
        })
    }
    else if (!json.count || json.count <= 0) {
        Swal.fire({
            title: '暂无留言',
            text: '您不妨写下第一条留言✨🎈',
            icon: 'info',
            confirmButtonText: '确认'
        })
    } else {
        generatePages(json.messages, 10);
        pageJump();
        var pageNum = Math.ceil(json.count / 10);
        var optionHTML = '';
        for (var i = 1; i < pageNum; i++) {
            optionHTML += `<option value="${i}" >${i + 1}</option>`;
        }
        var pageNav = document.querySelector('.page-nav');
        if (pageNav) {
            pageNav.innerHTML = '';
            pageNav.insertAdjacentHTML('afterbegin', `
            <span onclick='pageJump("previous")'>上一页</span>
            <span onclick='pageJump("next")'>下一页</span>
            <span onclick='pageJump("last")'>最后一页</span>
            <label for="jump">跳转至<select onchange='pageJump(this)' autocomplete="off" id="jump">
                <option value="0" selected="selected">1</option>
                ${optionHTML}
            </select></label>
            `);
        }
        Toast.fire({
            toast: true,
            icon: 'success',
            title: '成功加载' + json.count + '条消息',
        });
    }
    load.close();
}
Swal.fire({
    icon: 'info',
    title: 'PHPMessageBoard项目演示',
    text: '留言板内容为虚构，仅演示用，欢迎Star',
    timer: 9000,
    footer: '<a style="color:#3367ff;text-decoration:underline" href="https://github.com/tianluanchen/PHPMessageBoard">GitHub仓库地址</a>',
    timerProgressBar: true,
}).then(function () {
    //执行
    displayProgressBar();
    initDataLoad();
})