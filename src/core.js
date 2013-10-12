/*
 * MessagingIO
 * ===========
 * core.js
 * Core methods for basic functionality
 */

function MessagingIO(target) {

    var self = this;

    self.ready = false;
    self.sendQueue = [];
    self.receiveQueue = [];

    if (target == undefined) {
        /* Allows MessagingIO to send message to its parent if inside of an
         * iframe
         */
        self.target = window;
    } else {
        if (window === self) {
            return new MessagingIO(target);
        }

        self.targetSource = target;
        self.targetElement = document.createElement("iframe");
        self.targetElement.setAttribute("src", self.targetSource);
        self.targetElement.style.display = "none";
        document.body.appendChild(self.targetElement);
        self.target = self.targetElement.contentWindow;
    }

    self.messageReceiver = function(e) {
        // Handles messages from iframe
        if (self.target.location.origin == e.origin) {
            self.receiveQueue.push(e.data);
            var event = new CustomEvent("addedToInQueue", {
                message: msg,
                time: new Date(),
                bubbles: true,
                cancelable: false
            });
            window.dispatchEvent(event);
        }
    }
    self.flushQueues = function() {
        if (self.ready) {
            while (self.sendQueue.length > 0) {
                var msg = self.sendQueue.pop();
                self.target.postMessage(msg, self.target.location.origin);
            }
        }
    }
    self.setReady = function() {
        self.ready = true;
        self.flushQueues();
    },

    window.addEventListener("addedToOutQueue", self.flushQueues, false);
    window.addEventListener("addedToInQueue", self.flushQueues, false);

    return self;
}

// Used to chain together methods
MessagingIO.prototype = {
    about: {
        // About
        Version: "0.0.4",
        Author: "Britt Gresham",
        Created: "Fall 2013",
        Updated: "October 11th, 2013"
    },
    start: function() {
        // Start listening for messages
        if (window.addEventListener) {
            window.addEventListener("message", this.messageReceiver, false);
        } else if (window.attachEvent) {
            window.attachEvent("message", this.messageReceiver);
        }
        this.target.addEventListener("load", this.setReady, false);
        return this;
    },
    stop: function() {
        // Stops listening for messages
        if (window.removeEventListener) {
            window.removeEventListener("message", this.messageReceiver, false);
        } else if (window.removeEvent) {
            window.removeEvent("message", this.messageReceiver);
        }
        return this;
    },
    sendMessage: function(msg) {
        // Send messages to target iframe using queue
        this.sendQueue.push(msg);
        var event = new CustomEvent("addedToOutQueue", {
            message: msg,
            time: new Date(),
            bubbles: true,
            cancelable: false
        });
        window.dispatchEvent(event);
        return this;
    }
}
