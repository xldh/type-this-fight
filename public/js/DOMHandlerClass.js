var DOMHandlerClass = Class.extend({
    bind: function (DOMElement, eventName, fnCallback) {
        DOMElement.addEventListener(eventName, fnCallback, false);
    },
    unbind: function (DOMElement, eventName, fnCallback) {
        DOMElement.removeEventListener(eventName, fnCallback, false);
    }
});