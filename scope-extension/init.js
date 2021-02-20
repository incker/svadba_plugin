'use strict';

const buildUrl = (path) => `chrome-extension://${chrome.runtime.id}/${path}`;

fetch(buildUrl('plugin.html'))
    .then((resp) => resp.text())
    .then((respText) => {
        const div = document.createElement('div');
        const fragment = document.createDocumentFragment();
        div.insertAdjacentHTML('beforeend', respText);
        [...div.children].forEach(elem => (elem.nodeType === 1) && fragment.appendChild(elem));
        return fragment;
    })
    .then((pluginHtmlFragment) => [() => {
        document.getElementById('i-mount').appendChild(pluginHtmlFragment);
    }])
    .then((eventStack) => {
        // внедряем /plugin.css в страницу
        document.head.appendChild(
            Object.assign(document.createElement('link'), {
                rel: 'stylesheet', // хромовская ссылка
                href: buildUrl('plugin.css')
            })
        );
        return eventStack;
    })
    .then((eventStack) => {
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
            script.src = buildUrl(src); // хромовская ссылка
            script.async = false; // чтоб загружались последовательно
            fragment.appendChild(script);
        });
        eventStack.push(() => document.body.appendChild(fragment));
        return eventStack;
    })
    .then((eventStack) => {
        eventStack.push(() => {
            const height = document.querySelector('.svadba-widget').offsetHeight.toString();
            document.getElementById('contacts').style.marginBottom = height.concat('px');
        });
        return eventStack;
    })
    .then((eventStack) => {
        const timer = setInterval(() => {
            const soulmatesTab = document.querySelector('#soulmates-tab');
            if (soulmatesTab && !soulmatesTab.classList.contains('hidden')) {
                clearInterval(timer);
                eventStack.forEach(event => event());
            }
        }, 500);
    });
