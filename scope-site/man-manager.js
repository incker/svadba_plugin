'use strict';

const manManager = (() => {
    const strangers = new Set();
    const onliners = new Set();
    const received = new Set();
    const menForSpam = [];

    const msgSendSuccess = (_id) => {
        counter.increment();
    };

    const msgSendFail = (id) => {
        received.delete(id);
    };

    const msgSendFailNotSoulmate = (id) => {
        received.delete(id);
        strangers.add(id);
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
        const strangersOnline = [];
        let i = 0;

        onliners.forEach((id) => {
            if (!received.has(id)) {
                if (strangers.has(id)) {
                    strangersOnline.push(id);
                } else {
                    menForSpam[i] = id;
                    i++;
                }
            }
        });

        menForSpam.length = strangersOnline.length + i;
        strangersOnline.forEach((id) => {
            menForSpam[i] = id;
            i++;
        });

        if (menForSpam.length < 5) {
            plugin.setStatus.done();
            throw `no men, onliners count: ${onliners.size}`;
        } else {
            plugin.setStatus.isSending();
        }
    }

    /** @param {!number[]} newOnliners */
    const setNewOnliners = (newOnliners) => {
        onliners.clear();
        newOnliners.forEach(onliners.add, onliners);
        plugin.onlineMenCounterSet(onliners.size);
        refreshManToInvite();
    };

    // clear strangers offline
    setInterval(() => {
        const strangersOffline = [];
        strangers.forEach(id => {
            if (!onliners.has(id)) {
                strangersOffline.push(id);
            }
        });
        strangersOffline.forEach(strangers.delete, strangers);
    }, 1000_000);

    const dropReceived = () => {
        received.clear();
        lastChats.getLastMenChats().forEach(received.add, received);
    }

    const prepareForNewInvite = () => {
        counter.toZero();
        dropReceived();
        refreshManToInvite();
    };


    return {
        removeActiveChatFromQueue,
        menQueue,
        msgSendSuccess,
        msgSendFail,
        msgSendFailNotSoulmate,
        setNewOnliners,
        prepareForNewInvite,
    };
})();
