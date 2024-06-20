'use strict';

const plugin = (() => {
    const textarea = document.querySelector('.plugin-textarea');

    ((eventListener) => {
        const passive = {passive: true};
        document.querySelectorAll('.pattern-select').forEach((elem) => {
            elem.addEventListener('click', eventListener, passive)
        });
    })(function () {
        const pattern = this.textContent.trim();
        textarea.value = textarea.value.trim() + ' ' + pattern;
    });


    /**
     * @type {Set<string>}
     */
    const oldPatterns = new Set;

    const popupError = document.querySelector('.popup-error');

    /**
     * @type {!Node}
     */
    const sendingStatus = document.querySelector('.sending-status').firstChild;

    /**
     * @type {!Node}
     */
    const msgPreview = document.querySelector('.msg-preview').firstChild;


    const onlineCounterNode = document.querySelector('.men-counter-onl').firstChild;


    msgPreview.parentElement.onclick = () => {
        textarea.value = msgPreview.nodeValue.trim();
        textarea.select();
    };


    /**
     * @returns {!string}
     */
    const getPatternForSending = () => {
        const msgPattern = textarea.value.trim();
        textarea.value = msgPattern;

        const err = (() => {
            if (msgPattern === '') {
                return 'Шаблон пустой';
            } else if (!msgInserter.isPatternValid(msgPattern)) {
                return 'Шаблон нельзя рассылать,\nневерные вставки "%"';
            } else if (msgPattern.length < 2) {
                return 'Шаблон сильно короткий';
            } else if (oldPatterns.has(msgPattern)) {
                return 'Шаблон недавно рассылался';
            }
            return '';
        })();


        if (err === '') {
            oldPatterns.add(msgPattern);
            setMsgPreview(msgPattern);
            textarea.value = '';
            return msgPattern;
        } else {
            setMsgPreview('');
            setError(err);
            return '';
        }
    };

    /** @param {!string} msg  */
    const setMsgPreview = (msg) => {
        msgPreview.nodeValue = msg;
    };

    /**
     * @param {!string} err
     */
    const setError = (err) => {
        popupError.textContent = err;
        if (err !== '') {
            popupError.classList.remove('invis');
            popupError.focus();
        } else {
            popupError.classList.add('invis');
        }
    };

    const modifyStatus = (text, isRed = false) => {
        sendingStatus.nodeValue = text;
        sendingStatus.parentElement.classList.toggle('text-red', isRed);
    }

    const setStatus = {
        isSending: () => modifyStatus('Рассылается...'),
        isPaused: () => modifyStatus('Приостановлено.'),
        done: () => modifyStatus('Готово! Напишите новый зазыв', true),
    }

    /**
     * @param {!number} count
     */
    const onlineMenCounterSet = (count) => {
        onlineCounterNode.nodeValue = count.toString();
    };

    const accessDenied = () => {
        setError('Нет доступа');
    }

    return {
        setStatus,
        accessDenied,
        getPatternForSending,
        onlineMenCounterSet
    };
})();


// Hide popupInserts, popupError
((eventListener) => {
    const popupError = document.querySelector('.popup-error');
    const popupInserts = document.querySelector('.popup-inserts');
    const passive = {passive: true};

    popupInserts.addEventListener('blur', eventListener, passive);
    popupError.addEventListener('click', eventListener, passive);
    popupError.addEventListener('blur', eventListener, passive);
})(function () {
    this.classList.add('invis');
});


// Show popupInserts
(() => {
    const popupInserts = document.querySelector('.popup-inserts');

    document.querySelector('.inserts-btn').addEventListener('click', () => {
        popupInserts.classList.remove('invis');
        popupInserts.focus();
    }, {passive: true});
})();


const counter = (() => {

    const sentCounterNode = document.querySelectorAll('.men-counter')[0].firstChild;
    let sentCount = 0;

    const toZero = () => {
        sentCount = -1;
        increment();
    };

    const increment = () => {
        sentCounterNode.nodeValue = (++sentCount).toString();
    };

    return {
        toZero,
        increment
    }
})();
