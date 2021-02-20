'use strict';


/**
 * Сбор онлайнеров, запись в бд
 * @returns {!Promise}
 */
const getOnlinersIds = () => fetch('https://kivinix.com/api/plugin/men')
    .then(resp => {
        if (resp.status !== 200) {
            console.error(resp.status)
            return [];
        }
        return resp.json();
    })
    .then((onliners) => {
        manManager.setNewOnliners(onliners);
    });

setInterval(getOnlinersIds, 30_000);
setTimeout(getOnlinersIds, 3_000);
