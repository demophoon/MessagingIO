/*
 * MessagingIO
 * ===========
 * core.js
 * Core methods for basic functionality
 */

var MessagingIO = function() {
    var self = this;
    self.about = {
        Version: "0.0.4",
        Author: "Britt Gresham",
        Created: "Fall 2013",
        Updated: "October 11th, 2013"
    };

    self.defaults = {
        target: undefined,
        sendReciept: true,
    };

    self.utils = {
        extend: function(defaults, options) {
            var keys = Object.keys(defaults);
            for (var x in keys) {
                if (!(keys[x] in Object.keys(options))) {
                    options[keys[x]] = defaults[keys[x]];
                }
            }
        }
    };

    self.flushQueues = function() {
        if (self.ready) {
            while (self.sendQueue.length > 0) {
                var msg = self.sendQueue.pop();
                self.target.postMessage(msg, self.target.location.origin);
            }
            while (self.receiveQueue.length > 0) {
                var msg = self.receiveQueue.pop();
                self.callback(msg);
            }
        }
    };

    self.initialize = function(options) {
        self.options = options;
        self.utils.extend(defaults, self.options);

        self.target = options.target;

        self.ready = false;
        self.sendQueue = [];
        self.receiveQueue = [];

        if (self.target == undefined) {
            /* Allows MessagingIO to send message to its parent if inside of an
             * iframe
             */
            self.target = window;
        } else {
            if (window === self) {
                return new MessagingIO(target);
            }

            self.targetSource = self.target;
            self.targetElement = document.createElement("iframe");
            self.targetElement.setAttribute("src", self.targetSource);
            self.targetElement.style.display = "none";
            document.body.appendChild(self.targetElement);
            self.target = self.targetElement.contentWindow;
        }

        window.addEventListener("addedToOutQueue", self.flushQueues, false);
        window.addEventListener("addedToInQueue", self.flushQueues, false);

    };

    self.messageReceiver = function(e) {
        // Handles messages from iframe
        if (self.target.location.origin == e.origin) {
            self.receiveQueue.push(e.data);
            var event = new CustomEvent("addedToInQueue", {
                message: e.data,
                time: new Date(),
                bubbles: true,
                cancelable: false
            });
            window.dispatchEvent(event);
        }
    };

    self.callback = function(e) {
        // Work on callback functions
        console.log(e);
    };

    self.start = function() {
        // Start listening for messages
        if (window.addEventListener) {
            window.addEventListener("message", self.messageReceiver, false);
        } else if (window.attachEvent) {
            window.attachEvent("message", self.messageReceiver);
        }
        self.target.addEventListener("load", self.setReady, false);
        return self;
    };

    self.stop = function() {
        // Stops listening for messages
        if (window.removeEventListener) {
            window.removeEventListener("message", self.messageReceiver, false);
        } else if (window.removeEvent) {
            window.removeEvent("message", self.messageReceiver);
        }
        return self;
    };

    self.setReady = function() {
        self.ready = true;
        self.flushQueues();
    };

    self.sendMessage = function(msg) {
        // Send messages to target iframe using queue
        self.sendQueue.push(msg);
        var event = new CustomEvent("addedToOutQueue", {
            message: msg,
            time: new Date(),
            bubbles: true,
            cancelable: false
        });
        window.dispatchEvent(event);
        return self;
    };

    return function(options) {
        if (options == undefined) {
            options = {};
        }
        self.initialize(options);
        return {
            start: self.start,
            stop: self.stop,
            sendMessage: self.sendMessage,
        }
    }

}();
