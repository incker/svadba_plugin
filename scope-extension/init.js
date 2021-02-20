'use strict';

Promise.all([
    () => document.head.appendChild(
        Object.assign(document.createElement('link'), {
            rel: 'stylesheet', // хромовская ссылка
            href: chrome.runtime.getURL('plugin.css')
        })),

    fetch(chrome.runtime.getURL('plugin.html'))
        .then((resp) => resp.text())
        .then((respText) => {
            const div = document.createElement('div');
            const fragment = document.createDocumentFragment();
            div.insertAdjacentHTML('beforeend', respText);
            [...div.children].forEach(elem => (elem.nodeType === 1) && fragment.appendChild(elem));
            return fragment;
        })
        .then((htmlFragment) => () => document.getElementById('i-mount').appendChild(htmlFragment)),

    (() => {
        const fragment = document.createDocumentFragment();
        [
            'common/tools.js',
            'scope-site/init/init-lady-id.js',
            // load db
            'scope-site/storage/storage.js',
            'scope-site/storage/item/last-chats.js',
            'scope-site/storage/item/soulmates.js',
            // just funcs
            'scope-site/msg-send-func.js',
            'scope-site/msg-build.js',
            'scope-site/msg-send.js',
            'scope-site/plugin.js',
            // some process
            'scope-site/man-manager.js',
            'scope-site/active-chats.js',
            'scope-site/api-onliners.js',
            'scope-site/other/console-clear.js',
        ].forEach((src) => {
            // подключаем javascript на страницу
            const script = document.createElement('script');
            script.src = chrome.runtime.getURL(src); // хромовская ссылка
            script.async = false; // чтоб загружались последовательно
            fragment.appendChild(script);
        });
        return () => document.body.appendChild(fragment);
    })(),

    () => {
        const height = document.querySelector('.svadba-widget').offsetHeight;
        document.getElementById('contacts').style.marginBottom = `${height}px`;
    }
])
    .then((eventStack) => {
        const timer = setInterval(() => {
            const soulmatesTab = document.querySelector('#soulmates-tab');
            if (soulmatesTab && !soulmatesTab.classList.contains('hidden')) {
                clearInterval(timer);
                eventStack.forEach(event => event());
            }
        }, 500);
    });
