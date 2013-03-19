var EventSpeakerClass = Class.extend({
    dispatch: function (eventName, data) {
        EventSpeakerClass.listeners.map(function (listener) {
            if (listener.eventName === eventName) {
                dispatchEvent(new CustomEvent(eventName, data));
            }
        });
    },
    listen: function (eventName, callback) {
        addEventListener(eventName, callback);
        EventSpeakerClass.listeners.push({eventName: eventName,  callback: callback});
    },
    stopListening: function (eventName, callback) {
        removeEventListener(eventName, callback);
        EventSpeakerClass.listeners.some(function (listener, key) {
            if (listener.eventName === eventName
            &&  listener.callback === callback) {
                EventSpeakerClass.listeners();
            }
        });
    }
});

EventSpeakerClass.listeners = [];