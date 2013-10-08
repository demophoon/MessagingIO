function MessagingIO(target) {
    return this;
}

// Used to chain together methods
MessagingIO.prototype = {
    beginClient: function() {
        // Start listening for messages
        return this;
    }
}
