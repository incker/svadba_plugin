'use strict';
/**
 * отслеживаем активные чаты
 */


const lastChats = (() => {
    const time = () => Date.now() / 1000 | 0;

    const lastChats = initLastChats();

    const add = (id) => {
        const isNewId = !lastChats.has(id);
        lastChats.set(id, time());
        if (isNewId) {
            manManager.removeActiveChatFromQueue(id);
        }
    };

    const getLastMenChats = () => {
        // 5 hours
        const expireTime = time() - (5 * 60 * 60);
        const menSet = new Set();
        for (const [id, time] of Array.from(lastChats.entries())) {
            if (time < expireTime) {
                lastChats.delete(id);
            } else {
                menSet.add(id);
            }
        }
        return menSet;
    };

    return {
        add,
        getLastMenChats,
    };
})();


/**
 * @type {!HTMLDivElement}
 */
const activeChatsBlock = Object.assign(document.getElementById('toolbar').appendChild(document.createElement('div')), {
    className: 'active-chats-block',
});


/**
 * отслеживаем акивные чаты
 *
 * @returns {Promise<Response>}
 */
const detectActiveChats = () => fetch('https://www.svadba.com/chat/updates/status/everyone/', {credentials: 'include'})
    .then((resp) => (resp.status === 200) ? resp.json() : Promise.reject(resp))
    .then((data) => data[0].updates[0].girl.chats)
    .then((chats) => chats.map(chat => chat['client-id']))
    .then((activeChats) => {
        const fragment = document.createDocumentFragment();
        for (const id of activeChats) {
            lastChats.add(id);
            fragment.appendChild(Object.assign(document.createElement('a'), {
                href: `https://www.svadba.com/chat/#/${id}`,
                textContent: id.toString(),
            }));
            // пробелы между ссылками
            fragment.appendChild(document.createTextNode(' '));
        }
        activeChatsBlock.textContent = '';
        activeChatsBlock.appendChild(fragment);
    });

const loopFetchChats = new Looper(detectActiveChats, 20 * 1000);

/**
 * создаём экземпляр MutationObserver
 */
new MutationObserver(() => {
    if (soulSearchClass.contains('disabled')) {
        detectActiveChats();
        loopFetchChats.start();
    } else {
        activeChatsBlock.textContent = '';
        loopFetchChats.clear();
    }
}).observe(
    document.getElementById('soulmates-tab'),
    {attributes: true}
);

/**
 * @type {DOMTokenList}
 */
const soulSearchClass = document.getElementById('soulmates-tab').classList;

detectActiveChats();
