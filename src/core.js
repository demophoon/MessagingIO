function MessagingIO(target) {
    if (target == undefined) {
        this.initializeServer();
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
        console.log(e);
    }
    return this;
}

// Used to chain together methods
MessagingIO.prototype = {
    about: {
        Version: "0.0.1",
        Author: "Britt Gresham",
        Created: "Fall 2013",
        Updated: "October 7th, 2013",
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
        this.target.postMessage(msg, "*");
    },
    initializeServer: function() {
        this.target = window;
    }
}
