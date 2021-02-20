'use strict';

const storage = (() => {
    let ladyId = 0;

    pendingLadyId.then((parsedLadyId) => {
        ladyId = parsedLadyId;
    });

    const rowName = (name) => `${name}${ladyId}`;

    const get = (name) => {
        try {
            return JSON.parse(localStorage.getItem(rowName(name)));
        } catch (e) {
            localStorage.removeItem(rowName(name))
            return null;
        }
    };

    const set = (name, data) => {
        const slot = rowName(name);
        if (typeof data === 'object') {
            localStorage.setItem(slot, JSON.stringify(data));
        } else {
            console.error(data);
            throw 'data is not array or object'
        }
    };

    return {
        get,
        set,
    }
})();


const storageKeepSaving = (saveFunc) => {
    setInterval(saveFunc, 300_000);
    window.addEventListener('beforeunload', saveFunc);
}
