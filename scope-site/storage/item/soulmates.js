'use strict';

const initSoulmates = () => {
    const dataName = 'soulmates';
    const soulmates = new Map();

    const saveSoulmates = () => {
        storage.set(dataName, Array.from(soulmates.entries()));
    };

    pendingLadyId.then(() => {
        const dataSoulmates = storage.get(dataName) || [];
        if (Array.isArray(dataSoulmates)) {
            dataSoulmates.forEach(arr => {
                if (Array.isArray(arr)) {
                    const [id, count] = arr;
                    if (typeof id === 'number' && typeof count === 'number' && count < 6) {
                        soulmates.set(id, count);
                    }
                }
            });
        }
        storageKeepSaving(saveSoulmates);
    });

    return soulmates;
}
