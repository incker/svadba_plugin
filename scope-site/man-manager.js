'use strict';

const manManager = (() => {
    const soulmates = initSoulmates();
    const strangers = new Set();
    const onliners = new Set();
    const received = new Set();
    const menForSpam = [];

    const msgSendSuccess = (id) => {
        counter.increment();
        soulmates.set(id, 5);
        strangers.delete(id);
    };

    const msgSendFail = (id) => {
        received.delete(id);
        const count = soulmates.get(id);
        if (count) {
            if (count < 2) {
                soulmates.delete(id);
            } else {
                soulmates.set(id, count - 1);
            }
        } else {
            strangers.add(id);
        }
    };

    const dropCurrentMenQueue = () => {
        menForSpam.length = 0;
    };

    const removeActiveChatFromQueue = (activeChatId) => {
        received.add(activeChatId);
        const index = menForSpam.indexOf(activeChatId);
        if (index > -1) {
            menForSpam.splice(index, 1);
        }
    }

    /**
     * @returns {Generator<!number, void, *>}
     */
    function* menQueue() {
        // такая странная реализация через pop
        // чтоб итератор можно было вызывать много раз не ломая единую последовательность
        while (true) {
            let id = 0;
            while ((id = menForSpam.pop())) {
                received.add(id);
                yield id;
            }
            refreshManToInvite();
        }
    }

    const refreshManToInvite = () => {
        (() => {
            dropCurrentMenQueue();
            const soulmatesOnline = [];
            onliners.forEach((id) => {
                if (!strangers.has(id) && !received.has(id)) {
                    if (soulmates.has(id)) {
                        soulmatesOnline.push(id);
                    } else {
                        menForSpam.push(id);
                    }
                }
            });
            // добавляем soulmates последними, чтоб им пришло сообщение первым
            soulmatesOnline.forEach((id) => {
                menForSpam.push(id);
            });
        })();

        if (menForSpam.length === 0) {
            if (strangers.size === 0) {
                throw `no men, onliners count: ${onliners.size}`;
            } else {
                strangers.clear();
                refreshManToInvite();
            }
        }
    }

    /** @param {!number[]} newOnliners */
    const setNewOnliners = (newOnliners) => {
        if (newOnliners.length !== onliners.size) {
            onliners.clear();
            newOnliners.forEach(onliners.add, onliners);
            dropCurrentMenQueue();
            plugin.onlineMenCounterSet(onliners.size);
        }
    };

    const prepareForNewInvite = () => {
        counter.toZero();
        received.clear();
        takeLastChats();
        dropCurrentMenQueue();
    };

    const takeLastChats = () => {
        lastChats.getLastMenChats().forEach((id) => {
            received.add(id);
        });
        dropCurrentMenQueue();
    };

    return {
        removeActiveChatFromQueue,
        menQueue,
        msgSendSuccess,
        msgSendFail,
        setNewOnliners,
        takeLastChats,
        prepareForNewInvite,
    };
})();

