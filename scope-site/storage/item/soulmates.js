'use strict';

const initSoulmates = () => {
    const dataName = 'soulmates';
    const soulmates = new Set();

    const saveSoulmates = () => {
        storage.set(dataName, Array.from(soulmates));
    };

    pendingLadyId.then(() => {
        const dataSoulmates = storage.get(dataName) || [];
        if (Array.isArray(dataSoulmates)) {
            dataSoulmates.forEach(id => {
                if (Number.isInteger(id)) {
                    soulmates.add(id);
                }
            });
        }
        storageKeepSaving(saveSoulmates);
    });

    return soulmates;
}
