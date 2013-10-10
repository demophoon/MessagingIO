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

    if (target == undefined) {
        /* Allows MessagingIO to send message to its parent if inside of an
         * iframe
         */
        self.target = window;
        self.type = "SERVER";
    } else {
        if (window === self) {
            return new MessagingIO(target);
        }

        self.targetSource = target;
        self.targetElement = document.createElement("iframe");
        self.targetElement.setAttribute("src", self.targetSource);
        self.targetElement.style.width = "1px";
        self.targetElement.style.height = "1px";
        document.body.appendChild(self.targetElement);
        self.target = self.targetElement.contentWindow;
        self.type = "CLIENT";
    }
    console.log(self.type + ": Starting.");

    self.messageReceiver = function(e) {
        console.log(self.type + ": Message Received - " + e.data);
        /* Handles messages from iframe
         * To-do:
         *  - Only accept messages from self.target
         */
        console.log(e);
    }
    self.clearQueue = function() {
        if (self.ready) {
            console.log(self.type + ": Clearing Queue.");
            while (self.sendQueue.length > 0) {
                var msg = self.sendQueue.pop();
                console.log(self.type + ": Sending Message - " + msg);
                self.target.postMessage(msg, "*");
            }
        }
    }
    self.setReady = function() {
        self.ready = true;
        self.clearQueue();
    },

    window.addEventListener("addedToIOQueue", self.clearQueue, false);

    return self;
}

// Used to chain together methods
MessagingIO.prototype = {
    about: {
        // About
        Version: "0.0.3",
        Author: "Britt Gresham",
        Created: "Fall 2013",
        Updated: "October 10th, 2013"
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
        /* Send messages to target iframe
         * To-do:
         *  - Restrict messages to send only to domain of iframe
         */
        this.sendQueue.push(msg);
        var event = new CustomEvent("addedToIOQueue", {
            message: msg,
            time: new Date(),
            bubbles: true,
            cancelable: false
        });
        window.dispatchEvent(event);
        return this;
    }
}
