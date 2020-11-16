'use strict';


/**
 * @type {{initSending: sender.initSending, startSendingNewInvite: startSendingNewInvite}}
 */
const sender = (() => {
    /** @type {!function(!number): !Promise<Response> } */
    let fetchMsg = createMsgSendFunc('hello');

    const dummyFetchMsg = (_) => new Promise((resolve) => {
        setTimeout(() => {
            resolve({status: 429});
        }, 2000);
    });

    const sendMsg = (id) => fetchMsg(id)
        .then((resp) => {
            switch (resp.status) {
                case 429:
                    manManager.msgSendFail(id);
                    break;
                case 200:
                    manManager.msgSendSuccess(id);
                    break;
                case 502:
                    break;
                default:
                    console.error('resp is not 200|429|502 !', resp);
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
            setTimeout(sendNext, 10 * 1000)
        }
    }

    return {
        startSendingNewInvite,
        initSending: function () {
            sendNext();
            sendNext();
            delete this.initSending;
        }
    };
})();


/**
 * Msg sending
 */
document.querySelector('.delivery-start').addEventListener('click', () => {
    sender.startSendingNewInvite();
}, {passive: true});


/**
 * First boot of msg sending
 */
document.querySelector('.delivery-start').addEventListener('click', () => {
    sender.initSending();
}, {once: true, passive: true});

// todo из апишки получить тех мужиков кто в контактном списке? И спользовать их как soulmates?
