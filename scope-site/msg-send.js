'use strict';


/**
 * @type {{initSending: sender.initSending, startSendingNewInvite: startSendingNewInvite}}
 */
const sender = (() => {
    /** @type {!function(!number): !Promise<Response> } */
    let fetchMsg = createMsgSendFunc('hello');

    const promiseWait = (time, resp) => new Promise((resolve) => {
        setTimeout(resolve, time, resp);
    });

    const dummyFetchMsg = (_) => promiseWait(2000, {status: 429});

    const sendMsg = (id) => fetchMsg(id)
        .then((resp) => {
            switch (resp.status) {
                case 429:
                    manManager.msgSendFailNotSoulmate(id);
                    break;
                case 200:
                    manManager.msgSendSuccess(id);
                    break;
                case 502:
                    manManager.msgSendFail(id);
                    return promiseWait(10_000);
                // case when videochat is running
                case 403:
                    manManager.msgSendFail(id);
                    return promiseWait(20_000);
                default:
                    console.error('resp is not 200|429|502|403 !', resp);
            }
        });

    const startSendingNewInvite = () => {
        const msgPattern = plugin.getPatternForSending();
        if (msgPattern === '') {
            fetchMsg = dummyFetchMsg;
            plugin.setStatus.isPaused();
        } else {
            fetchMsg = createMsgSendFunc(msgPattern);
            plugin.setStatus.isSending();
            manManager.prepareForNewInvite();
        }
    };


    const consoleErrWrapper = (err) => {
        console.error(err);
    };

    async function sendNext() {
        try {
            for (const id of manManager.menQueue()) {
                await sendMsg(id).catch(consoleErrWrapper);
            }
        } catch (e) {
            console.error(e);
            setTimeout(sendNext, 10_000)
        }
    }

    return {
        startSendingNewInvite,
        initSending: function () {
            pendingLadyId.then(sendNext);
            pendingLadyId.then(sendNext);
            delete this.initSending;
        }
    };
})();


/**
 * Msg sending
 */
document.querySelector('.delivery-start').addEventListener('click', () => {
    pendingLadyId
        .then(sender.startSendingNewInvite)
        .catch(plugin.accessDenied)
}, {passive: true});


/**
 * First boot of msg sending
 */
document.querySelector('.delivery-start').addEventListener('click', () => {
    sender.initSending();
}, {once: true, passive: true});
