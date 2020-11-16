'use strict';

/**
 * @param {function} func
 * @param {int} delay
 * @constructor
 */
function Looper(func, delay) {
    if (!func || !delay) {
        throw 'err';
    }

    let id = 0;
    this.start = () => {
        if (id === 0) {
            id = setInterval(func, delay);
        }
    };

    this.clear = () => {
        clearInterval(id);
        id = 0;
    }
}
