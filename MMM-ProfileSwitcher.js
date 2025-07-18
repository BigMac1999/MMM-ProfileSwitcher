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
        // The name of the class which should be shown on startup and when there is no current profile.
        // defaultClass: "default",
        // The name of the profile that should be shown on startup.
        defaultProfile: "Default",
        // // The name of the class which should be shown for every profile.
        // everyoneClass: "everyone",
        // Determines if the default class includes the classes that everyone has.
        includeEveryoneToDefault: false,
        // Determines if a leaveMessage should be shown when switching between two custom profiles (excluding defaultClass).
        alwaysShowLeave: true,
        // The duration (in milliseconds) of the show and hide animation.
        animationDuration: 1000,
        // The module names and classes to ignore when switching profile.
        // It's wise to add these two to the ignoreModules array, else you won't be able to view incomming alerts/notifications and updates
        // "alert" can be omitted if you want different profiles to have different notifications
        ignoreModules: ["alert", "updatenotification"],

        // Determines if the title in the notifications should be present.
        //  If this value is set to a string it will replace the default title.
        title: true,

        // Custom messages for different profiles.
        // Check README.md for configuration
        enterMessages: {},
        leaveMessages: {},

        // Determines if the messages for everyone should also be set for profiles that have custome messages.
        includeEveryoneMessages: false,

        // use lock strings by default
        useLockStrings: true,

        // The default time when none is set for a profile in timers
        defaultTime: 60000,
        // Timers for different profiles. A timer lets you automatically swap to a different profile after a certain amount of time. 
        // Check README.md for configuration
        timers: undefined,

        // Modules that should be visible for everyone, regardless of profile
        everyone: [], 
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
    makeNotification: function (messages) {
        Log.info("ProfileSwitcher making notification for profile: " + this.current_profile);
        if (messages) {
            var text = messages[this.current_profile];

            if (text === undefined) {
                text = messages[this.config.everyoneClass];

            } else if (this.config.includeEveryoneMessages) {
                text = messages[this.config.everyoneClass].concat(text);
            }

            if (text.length > 0) {
                // if there are more than one options then take a random one
                text = (text.length === 1)
                    ? text[0]
                    : text[Math.floor(Math.random() * text.length)];

                Log.info("ProfileSwitcher sending notification with message: " + text);
                this.sendNotification("SHOW_ALERT", {
                    type: "notification",
                    title: this.config.title,
                    message: text.replace("%profile%", this.current_profile)
                });
            } else {
                Log.info("ProfileSwitcher no messages to show for profile: " + this.current_profile);
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
        //Get the modules that everyone should see
        var everyoneModules = this.config.everyone || [];
        Log.info("ProfileSwitcher everyone modules: " + everyoneModules.join(", "));
        //Go through all modules and check if they are in the current profile
        modules.enumerate(function (module) {
            // If the module is in the current profile or if it is a module that everyone should see
            if (currentProfileModules.includes(module.name) || everyoneModules.includes(module.name)) {
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

        if (this.config.timers && this.config.timers[this.current_profile]){
            this.set_timer(this.config.timers[this.current_profile]);
        }

    },

    // Clear the current timer and set a new one with the new profile.
    set_timer: function (data) {
        clearTimeout(this.timer);
        this.timer = setTimeout(this.change_profile.bind(this), 
            data.time    || this.config.defaultTime, 
            data.profile || this.config.defaultProfile);
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

                this.makeNotification(this.config.leaveMessages);
                this.current_profile = newProfile;
                this.set_profile(newProfile);

            } else {
                Log.info("ProfileSwitcher changing to profile " + newProfile + ".");

                if (this.config.alwaysShowLeave && this.current_profile !== this.config.defaultProfile) {
                    this.makeNotification(this.config.leaveMessages);
                }

                this.current_profile = newProfile;
                this.makeNotification(this.config.enterMessages);
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
            // this.set_profile(this.config.includeEveryoneToDefault);
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

        // Parse the Message data from enter and add everyone if needed
        this.config.enterMessages = this.parseMessages(this.config.enterMessages, this.translate("enter"));

        // Parse the Message data from leave and add everyone if needed
        this.config.leaveMessages = this.parseMessages(this.config.leaveMessages, this.translate("leave"));

        Log.info("Starting module: " + this.name);
    },

    // Given a message configuration and a translation, parse the configuration and return the new one
    parseMessages: function (data, translated) {
        var result = {};

        if (typeof data === "boolean") {
            if (data) {
                result[this.config.everyoneClass] = [translated];
                return result;
            }
            
            return false;
        }

        // go through all the configuered classes, split them and add each single one to the result
        for (var classes in data) {
            var value = data[classes];

            if (value !== false) {
                if (typeof value !== "object") {
                    value = [value];
                }

                value = value.map(function (x) {
                    return x === true ? translated : x;
                });

                classes.split(" ").forEach(function (key) {
                    if (result[key] === undefined) {
                        result[key] = [];
                    }

                    result[key] = result[key].concat(value);
                });
            }

        }

        // Assign the everyoneClass value if this hasn't been done yet.
        if (data[this.config.everyoneClass] === undefined || data[this.config.everyoneClass] === true) {
            result[this.config.everyoneClass] = [translated];
        }

        return result;
    }
});
