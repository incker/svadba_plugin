'use strict';
/**
 * YANDEX TRANSLATE
 * 1. take russian text from messageArea
 * 2. translate it using proxy to avoid Ukraine block and coors policy
 * 3. paste english text back in messageArea
 */

// Яндекс переводчик стал платным, и не ясно как его привязать к банковской украинской карте

/*
const messageArea = document.getElementById('message');

const yandexTranslate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    fetch('https://kivinix.com/api/plugin/yandex-translate?text='.concat(encodeURIComponent(messageArea.value)))
        .then((resp) => resp.json()) // превращаем в json
        .then((data) => data.text) // вытягиваем из json перевод
        .then((text) => {
            if (text) {
                messageArea.value = text;
            }
        });
};


setTimeout(() => {
    const yanBtn = Object.assign(document.createElement('button'), {
        className: 'btn approve yandex-translate',
        innerText: 'Yandex',
        onclick: yandexTranslate
    });
    [...document.querySelectorAll('#send-message')].pop().parentElement.appendChild(yanBtn);
}, 10 * 1000)
*/

