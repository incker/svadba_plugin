'use strict';

const pendingLadyId = (() => new Promise((resolve, reject) => {
    const checkPermitted = (id) => fetch(`https://kivinix.com/api/plugin/permitted/${id}`)
        .then(resp => (resp.status === 200)
            ? resp.json()
            : Promise.reject(`checkPermitted fail: http ${resp.status}`))
        .then((respApiKey) => {
            if (respApiKey && respApiKey.loggedIn === true && parseInt(respApiKey.key, 10) === id) {
                return id;
            } else {
                return Promise.reject(`checkPermitted fail: ${JSON.stringify(respApiKey)}`);
            }
        });

    const timer = setInterval(() => {
        const ladyLoginBlock = [...document.querySelectorAll('#user-info > p')].pop();
        if (ladyLoginBlock) {
            clearInterval(timer);
            const ladyId = parseInt(ladyLoginBlock.textContent, 10) || 0;
            checkPermitted(ladyId)
                .then(resolve)
                .catch(err => {
                    console.error(err);
                    plugin.accessDenied();
                    reject(err);
                });
        }
    }, 500);
}))();
