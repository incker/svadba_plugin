'use strict';

const manManager = (() => {
    const soulmates = initSoulmates();
    const strangers = new Set();
    const onliners = new Set();
    const received = new Set();
    const menForSpam = [];

    const msgSendSuccess = (id) => {
        counter.increment();
        soulmates.add(id);
        strangers.delete(id);
    };

    const msgSendFail = (id) => {
        received.delete(id);
    };

    const msgSendFailNotSoulmate = (id) => {
        received.delete(id);
        soulmates.delete(id);
        strangers.add(id);
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

    const chunkOnliners = () => {
        const soulmatesOnline = [];
        const strangersOnline = [];
        const othersOnline = [];

        onliners.forEach((id) => {
            if (!received.has(id)) {
                if (soulmates.has(id)) {
                    soulmatesOnline.push(id);
                } else if (strangers.has(id)) {
                    strangersOnline.push(id);
                } else {
                    othersOnline.push(id);
                }
            }
        });
        return [soulmatesOnline, strangersOnline, othersOnline];
    }


    const addToQueueStack = (arr) => {
        arr.forEach((id) => {
            menForSpam.push(id);
        })
    }

    const refreshManToInvite = () => {
        const [soulmatesOnline, strangersOnline, othersOnline] = chunkOnliners();
        dropCurrentMenQueue();
        // first need to spam all soulmates, than all others, than all strangers

        if (soulmatesOnline.length > 30) {
            addToQueueStack(soulmatesOnline);
        } else if (othersOnline.length > 200) {
            addToQueueStack(othersOnline);
            addToQueueStack(soulmatesOnline);
        } else {
            addToQueueStack(strangersOnline);
            addToQueueStack(othersOnline);
            addToQueueStack(soulmatesOnline);
        }

        if (menForSpam.length < 5) {
            plugin.setStatus.done();
            throw `no men, onliners count: ${onliners.size}`;
        } else {
            plugin.setStatus.isSending();
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
        msgSendFailNotSoulmate,
        setNewOnliners,
        takeLastChats,
        prepareForNewInvite,
    };
})();
