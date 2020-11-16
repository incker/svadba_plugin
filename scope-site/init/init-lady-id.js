'use strict';

const pendingLadyId = (() => new Promise((resolve) => {
    const timer = setInterval(() => {
        const ladyLoginBlock = document.querySelector('#video param[name=flashvars]');
        if (ladyLoginBlock) {
            const ladyId = parseInt(ladyLoginBlock.value.match(/stream-([0-9]+)&/)[1], 10);
            if (ladyId) {
                console.log(ladyId);
                clearInterval(timer);
                resolve(ladyId);
            } else {
                console.error('something wrong', ladyId, ladyLoginBlock);
            }
            clearInterval(timer);
        }
    }, 500);
}))();
