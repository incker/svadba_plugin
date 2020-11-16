'use strict';

const initLastChats = () => {
    const dataName = 'lastChats';
    const lastChats = new Map();

    const saveLastChats = () => {
        storage.set(dataName, Array.from(lastChats.entries()));
    };

    pendingLadyId.then(() => {
        const currentTime = Date.now() / 1000 | 0;
        const dataLastChats = storage.get(dataName);
        if (dataLastChats && Array.isArray(dataLastChats)) {
            dataLastChats.forEach(arr => {
                if (Array.isArray(arr)) {
                    const [id, time] = arr;
                    if (typeof id === 'number' && typeof time === 'number' && time < currentTime) {
                        lastChats.set(id, time);
                    }
                }
            });
        }
        storageKeepSaving(saveLastChats);
        // По идее девушка не отправит этим людям сообщение
        // потому что lastChats загрузится до того как скомпонуется menQueue.
        // menQueue скомпонуется только когда пользователь нажмет кнопку "отправить"
    });

    return lastChats;
}
