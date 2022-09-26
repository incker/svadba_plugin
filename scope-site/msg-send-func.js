'use strict';


/**
 * @param {string} msgPattern
 * @returns {!function(!number): !Promise<Response>}
 */
const createMsgSendFunc = (msgPattern) => {
    console.log('createMsgSendFunc: ' + msgPattern);
    const isMsgDynamic = msgInserter.hasInserts(msgPattern);

    if (isMsgDynamic) {
        // const buildMsgFunc = msgInserter.getMsgBuilderFunc(msgPattern);
        // return dynamicMsgFetchFunc(buildMsgFunc);
        return staticMsgFetchFunc('hello');
    } else {
        return staticMsgFetchFunc(msgPattern);
    }
}

/**
 * @returns {function(string): RequestInit}
 */
const getMutableHeaders = () => {
    /** @type {!FormData} */
    const formData = (() => {
        const formData = new FormData;
        formData.append('source', 'lc');
        formData.append('type', '1');
        formData.set('message', 'hello');
        return formData;
    })();

    const headers = {
        credentials: 'same-origin',
        method: 'POST',
        body: formData,
    };

    return (msg) => {
        formData.set('message', msg);
        return headers;
    };
}


/**
 * @param {!string} msg
 * @returns {!function(!number): !Promise<Response>}
 */
const staticMsgFetchFunc = (msg) => {
    const headers = getMutableHeaders()(msg);
    return (id) => fetchWrapper(id, headers);
}


/**
 * @param {!(function({object}): !string)} buildMsgFunc
 * @returns {!function(!number): !Promise<Response>}
 */
const dynamicMsgFetchFunc = (buildMsgFunc) => {
    const headerBuilder = getMutableHeaders();
    return (id) => new Promise((resolve) => {
        indDB.getManInfo(id, resolve)
    }).then((man) => {
        return fetchWrapper(id, headerBuilder(buildMsgFunc(man)));
    });
}

/**
 *
 * @param {!number} id
 * @param {RequestInit} headers
 * @returns {Promise<Response>}
 */
const fetchWrapper = (id, headers) => {
    return fetch(`https://www.affiliact.com/chat/send-message/${id}`, headers)
};
