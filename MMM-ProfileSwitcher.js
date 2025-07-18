/* global Module */

/* Magic Mirror
 * Module: MMM-ProfileSwitcher
 *
 * By Brian Janssen
 * Special thanks to Paul-Vincent Roll http://paulvincentroll.com
 * MIT Licensed.
 */

Module.register("MMM-ProfileSwitcher", {
    defaults: {
        // The name of the profile that should be shown on startup.
        defaultProfile: "Default",
        // The module names and classes to ignore when switching profile.
        // It's wise to add these two to the ignoreModules array, else you won't be able to view incomming alerts/notifications and updates
        ignoreModules: ["alert", "updatenotification"],
        // 	An array of default incoming messages you wish to use if a profile you define does not have any incoming messages being used.
        incomingMessages: [],
        // 	An array of default outgoing messages you wish to use if a profile you define does not have any incoming outgoing being used.
        outgoingMessages: [],
        // A boolean that sets if incoming messages is enabled. This is for all profiles.
        incomingMessagesEnabled: true,
        // A boolean that sets if outgoing messages is enabled. This is for all profiles.
        outgoingMessagesEnabled: true,
        // Determines if a leaveMessage should be shown when switching between two custom profiles (excluding defaultClass).
        alwaysShowLeave: true,
        // The duration (in milliseconds) of the show and hide animation.
        animationDuration: 1000,
        // Determines if the title in the notifications should be present. If this value is set to a string it will replace the default title.
        title: true,

        // The default time when none is set for a profile in timers
        defaultTime: 60000,
        // Timers for different profiles. A timer lets you automatically swap to a different profile after a certain amount of time. 
        // Check README.md for configuration
        timersEnabled: true,
    },

    // Override the default getTranslations function
    getTranslations: function () {
        return {
            en: "translations/en.json",
            es: "translations/es.json",
            de: "translations/de.json",
            sv: "translations/sv.json",
            fr: "translations/fr.json",
            nl: "translations/nl.json"
        };
    },

    // Show a random notification depending on the change of profile and the config settings
    //Profile: the name of the profile this is for, Type: the type of message to show (incoming or outgoing)
    makeNotification: function (profile, type) {
        Log.info("ProfileSwitcher making notification for profile: " + profile + " of type: " + type);
        //check if the type of message is enabled
        if ((type === "incoming" && !this.config.incomingMessagesEnabled) || (type === "outgoing" && !this.config.outgoingMessagesEnabled)) {
            Log.info("ProfileSwitcher notifications of type: " + type + " are disabled, not making notification.");
            return;
        }
        //check if the profile exists in the config
        if (this.config.profiles.find(configProfile => configProfile.name === profile)) {
            //get the messages for the profile
            if (type === "incoming") {
                Log.info("ProfileSwitcher making incoming notification for profile: " + profile);
                var messages = this.config.profiles.find(configProfile => configProfile.name === profile).messages?.incoming ?? [];
                Log.info ("ProfileSwitcher incoming messages for profile " + profile + ": " + messages);
                //if messages === false then we don't want to show any messages
                if (messages === false) {
                    Log.info("ProfileSwitcher incoming messages are disabled for profile: " + profile);
                    return;
                }
                //if there are no messages then use the default ones
                if (messages.length === 0) {
                    //If no incoming messages are set, we get the default incoming messages based off of the language set in the config
                    if (messages.length === 0) {
                        messages = this.translate("incoming") ? [this.translate("incoming")] : [];
                        Log.info("ProfileSwitcher using language:" + this.config.language + " incoming message: " + messages[0]);
                    }
                }
            } else {
                Log.info("ProfileSwitcher making outgoing notification for profile: " + profile);
                var messages = this.config.profiles.find(configProfile => configProfile.name === profile).messages?.outgoing ?? [];
                //if messages === false then we don't want to show any messages
                if (messages === false) {
                    Log.info("ProfileSwitcher outgoing messages are disabled for profile: " + profile);
                    return;
                }
                //if there are no messages then use the default ones
                if (messages.length === 0) {
                    messages = this.translate("outgoing") ? [this.translate("outgoing")] : [];            }
            }
            //Select a random message from the messages array if there is more than one
            if (messages.length > 0) {
                var text = (messages.length === 1)
                    ? messages[0]
                    : messages[Math.floor(Math.random() * messages.length)];

                Log.info("ProfileSwitcher sending notification with message: " + text);
                this.sendNotification("SHOW_ALERT", {
                    type: "notification",
                    title: this.config.title.replace("%profile%", profile),
                    message: text.replace("%profile%", profile)
                });
            }
        }
    },

    // Change the current layout into the new layout given the current profile
    set_profile: function (newProfile) {
        var self = this;

        Log.info("ProfileSwitcher set_profile called with: " + newProfile);
        //Get all modules except the ones in ignoreModules
        var modules = MM.getModules().exceptWithClass(self.config.ignoreModules);
        Log.info("ProfileSwitcher setting profile to " + newProfile + " for modules: " + modules.map(m => m.name).join(", "));
        //Get all the modules for the current profile from the config
        var currentProfileModules = this.config.profiles.find(profile => profile.name === newProfile)?.modules || [];
        Log.info("ProfileSwitcher current profile modules: " + currentProfileModules.join(", "));
        //Go through all modules and check if they are in the current profile
        modules.enumerate(function (module) {
            // If the module is in the current profile or if it is a module that everyone should see (i.e. its in ignoreModules )
            if (currentProfileModules.includes(module.name) || self.config.ignoreModules.includes(module.name)) {
                // Show the module
                Log.info("ProfileSwitcher showing module: " + module.name);
                module.show(self.config.animationDuration, function () {
                    Log.info("ProfileSwitcher " + module.name + " is now shown.");
                });
            } else {
                // Hide the module
                Log.info("ProfileSwitcher hiding module: " + module.name);
                module.hide(self.config.animationDuration, function () {
                    Log.info("ProfileSwitcher " + module.name + " is now hidden.");
                });
            }
        });

        // if (this.config.timers && this.config.timers[this.current_profile]){
        //     this.set_timer(this.config.timers[this.current_profile]);
        // }
        var newProfileConfig = this.config.profiles.find(profile => profile.name === newProfile);
        if (newProfileConfig.timer && this.config.timersEnabled){
            this.set_timer(newProfileConfig.timer);
        }

    },

    // Clear the current timer and set a new one with the new profile.
    set_timer: function (data) {
        clearTimeout(this.timer);
        this.timer = setTimeout(
            this.change_profile.bind(this), 
            data.time    || this.config.defaultTime, 
            data.toProfile || this.config.defaultProfile);
    },

    // Take a different order of actions depening on the new profile
    // This way, when we go back to the default profile we can show a different notification
    change_profile: function (newProfile) {
        Log.info("ProfileSwitcher change_profile called. Current: " + this.current_profile + ", New: " + newProfile);
        // No need to change the layout if we are already in this current profile
        if (newProfile !== this.current_profile) {
            Log.info("ProfileSwitcher sending CHANGED_PROFILE notification with: " + newProfile);
            this.sendNotification("CHANGED_PROFILE", newProfile);

            if (newProfile == this.config.defaultProfile) {
                Log.info("ProfileSwitcher changing to default profile.");

                this.makeNotification(this.current_profile, "outgoing");
                this.current_profile = newProfile;
                this.set_profile(newProfile);

            } else {
                Log.info("ProfileSwitcher changing to profile " + newProfile + ".");

                if (this.config.alwaysShowLeave && this.current_profile !== this.config.defaultProfile) {
                    this.makeNotification(this.current_profile, "outgoing");
                }

                this.current_profile = newProfile;
                this.makeNotification(newProfile, "incoming");
                this.set_profile(newProfile);
            }
        } else {
            Log.info("ProfileSwitcher already on profile " + newProfile + ", no change needed.");
        }
    },

    // Override the default NotificationRecieved function
    notificationReceived: function (notification, payload, sender) {
        Log.info("ProfileSwitcher notification received: " + notification + " with payload: " + payload + " from sender: " + (sender ? sender.name : "system"));
        if (notification === "DOM_OBJECTS_CREATED") {
            Log.info("ProfileSwitcher DOM objects created, setting up default profile.");
            this.set_profile(this.config.defaultProfile);
            this.sendNotification("CHANGED_PROFILE", this.config.defaultProfile);
        } else if (notification === "CURRENT_PROFILE") {
            Log.info("ProfileSwitcher received CURRENT_PROFILE notification, changing to: " + payload);
            this.change_profile(payload);
        } else if (notification === "DISABLE_PROFILE_TIMERS"){
            Log.info("ProfileSwitcher disabling profile timers.");
            clearTimeout(this.timer);
        } else if (notification === "ENABLE_PROFILE_TIMERS"){
            Log.info("ProfileSwitcher enabling profile timers.");
            if (this.config.timers && this.config.timers[this.current_profile]){
                this.set_timer(this.config.timers[this.current_profile]);
            }
        }
    },

    // Initiate some of the default config information
    // Do this in start function and not in actual making of the notification.
    // This way we don't have to bother about it in that method and we only have to parse them all once.
    start: function () {
        Log.info("ProfileSwitcher starting up...");
        this.timer = null;
        this.current_profile = this.config.defaultProfile;
        Log.info("ProfileSwitcher default profile set to: " + this.current_profile);

        if (typeof this.config.ignoreModules === "string") {
            this.config.ignoreModules = this.config.ignoreModules.split(" ");
        }

        // If there is no title set then use the default one
        if (this.config.title && typeof this.config.title !== "string") {
            this.config.title = this.translate("title");
        }

        Log.info("Starting module: " + this.name);
    },

});
