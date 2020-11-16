'use strict';

const pendingBdConnection = (() => new Promise((resolve) => {
    // создаем/подключаемся к бд
    const request = indexedDB.open('diona', 1);
    // обработка ошибок
    request.onerror = console.error;
    // создание бд если ее нет
    request.onupgradeneeded = () => {
        // информация о мужике
        request.result.createObjectStore('manInfo', {keyPath: 'id', autoIncrement: false});
    };
    // при подключении к бд
    request.onsuccess = () => {
        request.onerror = null;
        request.onsuccess = null;
        request.onupgradeneeded = null;
        resolve(request.result);
    }
}))();
