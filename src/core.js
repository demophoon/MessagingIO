/*
 * MessagingIO
 * ===========
 * core.js
 * Core methods for basic functionality
 */

function MessagingIO(target) {
    if (target == undefined) {
        /* Allows MessagingIO to send message to its parent if inside of an
         * iframe
         */
        this.target = window;
    } else {
        if (window === this) {
            return new MessagingIO(target);
        }

        this.targetSource = target;
        this.targetElement = document.createElement("iframe");
        this.targetElement.setAttribute("src", this.targetSource);
        this.targetElement.style.width = "1px";
        this.targetElement.style.height = "1px";
        document.body.appendChild(this.targetElement);
        this.target = this.targetElement.contentWindow;

    }

    this.messageReciever = function(e) {
        // Handles messages from iframe
        // To-do:
        //  - Only accept messages from this.target
        console.log(e);
    }
    return this;
}

// Used to chain together methods
MessagingIO.prototype = {
    about: {
        // About
        Version: "0.0.2",
        Author: "Britt Gresham",
        Created: "Fall 2013",
        Updated: "October 8th, 2013",
    },
    start: function() {
        // Start listening for messages
        if (window.addEventListener) {
            window.addEventListener("message", this.messageReciever, false);
        } else if (window.attachEvent) {
            window.attachEvent("message", this.messageReciever);
        }
        return this;
    },
    stop: function() {
        // Stops listening for messages
        if (window.removeEventListener) {
            window.removeEventListener("message", this.messageReciever, false);
        } else if (window.removeEvent) {
            window.removeEvent("message", this.messageReciever);
        }
        return this;
    },
    sendMessage: function(msg) {
        // Send messages to target iframe
        // To-do:
        //  - Restrict messages to send only to domain of iframe
        this.target.postMessage(msg, "*");
    },
}
