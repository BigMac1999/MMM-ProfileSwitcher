# MMM-ProfileSwitcher

This an extension for the [MagicMirror²](https://magicmirror.builders/).
This Module adds the ability to have different layouts for different profiles.

This module was owned and maintained by [tosti007](https://github.com/tosti007/MMM-ProfileSwitcher) who 
has since stopped maintaining or working on this module. I went ahead and forked it and saw areas I could improve and so I forked off of his repo in order to give this great module some love and attention. 

There are breaking changes compared to the old module that you would need to fix in your config.js in order to use this module.

## Installation

In your terminal, go to your MagicMirror's Module folder:
````
cd ~/MagicMirror/modules
````

Clone this repository:
````
git clone https://github.com/tosti007/MMM-ProfileSwitcher.git
````

## Using the module

To use this module, you need to add it to the modules array in the `config/config.js` file and define profiles and their alloted modules. For instance, if you had clock, weather, newsfeet, and compliments, this is what some profiles could look like in your config.js:

````javascript
{
    module: 'MMM-ProfileSwitcher',
    config: {
        defaultProfile: "Default",
        ignoreModules: ["MMM-OnScreenMenu", "alert", "updatenotification"],
        title: "Hello %profile%!"
        incomingMessages: ["Welcome %profile%!"],
        outgoingMessages: ["Thanks for using the Magic Mirror %profile%!"],
        profiles: [
            {
                name: "Default",
                modules: ["clock", "weather", "newsfeed"],
                messages: {
                    incoming: ["Hello, this is the default profile!"],
                    outgoing: ["Thanks for using the Default profile!"]
                }
            },
            {
                name: "Family",
                modules: ["calendar", "compliments"],
                messages: {
                    incoming: ["Welcome to the Family profile!"],
                    outgoing: ["Thanks for using the Family profile!"]
                },
                timer: {
                    toProfile: "Mom",
                    time: 5000
                }
            },
            {
                name: "Mom",
                modules: ["calendar", "compliments", "clock"],
                messages: {
                    incoming: ["Welcome to Mom's profile!"],
                    outgoing: ["Thanks for using Mom's profile!"]
                },
                timer: {
                    toProfile: "Dad",
                    time: 5000
                }
            },
            {
                name: "Dad",
                modules: ["clock", "weather", "newsfeed"],
                messages: {
                    incoming: ["Welcome to Dad's profile!"],
                    outgoing: ["Thanks for Dad's profile!"]
                },
                timer: {
                    toProfile: "Family"
                    time: 5000
                }
            },
        ]
    }
}
````

## Configuration options

The following properties can be configured:

| Option                     | Description
| -------------------------- | -----------
| `defaultProfile`           | The name of the profile which should be shown on startup and when there is no other set profile. <br><br> **Possible values:** `string` <br> **Default value:** `"Default"`
| `ignoreModules`            | The module names and classes to ignore when switching profiles. Can be one string with multiple classes splitted with spaces or a string array.<br><br> **Note:** It's wise to add the two default values to the ignoreModules array, else you won't be able to view incomming alerts/notifications and updates. `alert` can be omitted if you want different profiles to have different notifications. <br> **Possible values:** `string` or `string array` <br> **Default value:** `["alert", "updatenotification"]`  
| `incomingMessages`         | An array of default incoming messages you wish to use if a profile you define does not have any incoming messages being used. <br><br> **Possible values:** `string[]` <br> **Default value:** `[]`
| `outgoingMessages`         | An array of default outgoing messages you wish to use if a profile you define does not have any outgoing messages being used. <br><br> **Possible values:** `string[]` <br> **Default value:** `[]`
| `incomingMessagesEnabled`  | A boolean that sets if incoming messages is enabled. This is for all profiles. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `true`
| `outgoingMessagesEnabled`  | A boolean that sets if outgoing messages is enabled. This is for all profiles. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `true`
| `profiles`                 | An array of objects that each is a profile.  <br><br> **Possible values:** `{}` <br> **Default value:** `{}` <br> **Options:** `{name: "", modules: [], messages: {incoming: [], outgoing: []}, timer: { toProfile: "", time: 0}}`
| `alwaysShowLeave`          | Determines if a leaveMessage should be shown when switching between two custom profiles (except for the default profile). <br><br> **Possible values:** `true` or `false` <br> **Default value:** `true`
| `animationDuration`        | The duration (in milliseconds) of the show and hide animation. <br><br> **Possible values:** `int` <br> **Default value:** `1000`
| `title`                    | Determines if the title in the notifications should be present. If this value is set to a string it will replace the default title.<br><br> **Possible values:** `true`, `false` or `string` <br> **Default value:** `true`
| `defaultTime`              | The default time (in microseconds) when none is set for a profile in `timers`. <br><br> **Possible values:** `number` <br> **Default value:** `60000` (`60` seconds)
| `timersEnabled`            | Enables timers for all profiles. See [Configuring Timers](#configuring-timers) for more information. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `true`

## Defining Profiles
There will be more details about certain attributes, but now profile switcher is organized using profiles in the config.js of ProfileSwitcher only. In the past, you could need to add classes to all other modules. Now you can configure all of ProfileSwitcher in only the ProfileSwitcher config object. 

The main organizational tool for profiles is the profiles array in the config itself. Here you can create an array of profiles:

````javascript
profiles: [
    {
        name: "Default",
        modules: ["clock", "weather", "newsfeed"],
        messages: {
            incoming: ["Hello, this is the default profile!"],
            outgoing: ["Thanks for using the Default profile!"]
        }
    },
    {
        name: "Family",
        modules: ["calendar", "compliments"],
        messages: {
            incoming: ["Welcome to the Family profile!"],
            outgoing: ["Thanks for using the Family profile!"]
        },
        timer: {
            toProfile: "Test User 1",
            time: 5000 // Time in milliseconds to switch to the next profile
        }
    },
    {
        name: "Test User 1",
        modules: ["clock", "weather", "newsfeed"],
        messages: {
            incoming: false,
            outgoing: ["Thanks for using Test User 1 profile!"]
        },
        timer: {
            toProfile: "Test User 2",
            time: 10000 // Time in milliseconds to switch to the next profile
        }          
    },
]
````

You can have as many profiles as you want but we'll only have these three examples. I recommend keeping a default profile even if you dont plan on using it (whether through timers or other organizational means).

| Option                     | Description
| -------------------------- | -----------
| `name`                     | This is the name of the profile and can also be thought of as its ID. To change to this profile you need this case specific name and this is also displayed in notifications using the `%profile%` identifier. <br><br> **Possible values:** `string`
| `modules`                  | This is how you set which modules display for each profile. Eventually I'd like to implement the ability to modify modules more per profile but for now this base functionality is enough. <br><br> **Possible values:** `string[]`
| `messages`                 | This is how you can set personalized messages per profile for both incoming and outgoing notifications (when you enter or leave a profile) <br><br> **Possible values:** `{incoming: [], outgoing: []}`
| `timer`                    | This is how you set timers for each profile to move onto another profile after the set amount of time. <br><br> **Possible values:** `{ toProfile: "", time: 0 }`

## Configuring Profile Messages
There are two main ways to define messages for profiles. You can set the default messages using the `incomingMessages` and/or `outgoingMessages` variables in the config. 

````javascript
config: {
    ...
    incomingMessages: ["Welcome!"],
    outgoingMessages: ["Thanks for using the profile!"],
    profiles: []
    ...
}
````

You can then also set messages for each profile in the profile object in the config as well. If a profile doesn't have an incoming or outgoing message set, it will then use the default options when needed. 

````javascript
config: {
    ...
    profiles: [
        {
            name: "Default",
            modules: ["clock", "weather", "newsfeed"],
            messages: {
                incoming: ["Hello, this is the default profile!"],
                outgoing: ["Thanks for using the Default profile!"]
            }
        },
    ]
    ...
}
````


If you don't have any default incoming or outgoing messages set in the config file, or any messages set in the profile, the messages will be set to the options in the language file depending on the language set in the Magic Mirror config section of you config.js 

In your messages you can use the identifier %profile% to be replaced by the name of the profile you're leaving or using respectively.

````javascript
config: {
    ...
    profiles: [
        {
            name: "Default",
            modules: ["clock", "weather", "newsfeed"],
            messages: {
                incoming: ["Hello, this is the %profile% profile!"],
                outgoing: ["Thanks for using the %profile% profile!"]
            }
        },
    ]
    ...
}
````

#### Disabling Messages
There are two ways to disable messages. The main one is applied for all profiles. If you set the `incomingMessagesEnabled` or the `outgoingMessagesenabled` to `false` in your config.js, this will disable all messages of that type.

The other way to disable messages is profile specific. If you set the incoming/outgoing object in profiles.messages to false, it will disable that type of message for that particular profile. What do I mean?

````javascript
config: {
    profiles: [
        {
            name: "Default",
            modules: ["clock", "weather", "newsfeed"],
            messages: {
                incoming: ["Hello, this is the default profile!"],
                outgoing: ["Thanks for using the Default profile!"]
            }
        },
        {
            name: "Family",
            modules: ["calendar", "compliments"],
            messages: {
                incoming: ["Welcome to the Family profile!"],
                outgoing: false
            }
        },
        {
            name: "Test User 1",
            modules: ["clock", "weather", "newsfeed"],
            messages: {
                incoming: false,
                outgoing: false
            }             
        },

    ]
}
````

Notice how under the config, under the profiles array, we have certain profiles have different settings for messages. The first profile: Default, has both messages defined thus enabled. The second profile, Family, has an incoming message defined so it has incoming messages enabled, but outgoing messages are set to false, thus they are disabled. And Test User 1 has all messages disabled.

## Configuring Timers
A timer is for switching to a different profile after a certain profile has been selected. These timers are set within the profiles and can point to one other profile. Ex:

````javascript
profiles: [
    {
        name: "Default",
        modules: ["clock", "weather", "newsfeed"],
    },
    {
        name: "Family",
        modules: ["calendar", "compliments"],
        timer: {
            toProfile: "Test User 1",
            time: 5000 // Time in milliseconds to switch to the next profile
        }
    },
    {
        name: "Test User 1",
        modules: ["clock", "weather", "newsfeed"],
        timer: {
            toProfile: "Test User 2",
            time: 10000 // Time in milliseconds to switch to the next profile
        }          
    },
    {
        name: "Test User 2",
        modules: ["calendar", "compliments"],
        timer: {
            toProfile: "Family",
            time: 10000 // Time in milliseconds to switch to the next profile
        }
    }
]
````

In the example above, each profile points to another with the final one pointing at the first one, this causes a loop you can rotate through all day.

## Switching Profiles
Switching Profiles can be done by sending a notification with the payload being the desired profile.
Like so (replace `'DESIRED_PROFILE_NAME_HERE'` with your profile name):
````javascript
this.sendNotification('CURRENT_PROFILE', 'DESIRED_PROFILE_NAME_HERE');
````

## Using With Other Modules
Since this module uses notifications, as described in [Switching profiles](#switching-profiles), it can easily be used in conjunction with other modules.


### [MMM-OnScreenMenu](https://github.com/shbatm/MMM-OnScreenMenu) by shbatm
You can use OnScreenMenu in order to easily switch between profiles. You will need to configure the module something along these lines to the OnScreenMenu config in order to do so:
````javascript
{
    module: 'MMM-OnScreenMenu',
    position: 'bottom_right',
    /* Valid positions: 'top_right', 'top_left', 'bottom_right', 'bottom_left' */
    position: "bottom_right",
    config: {
        touchMode: true,
        enableKeyboard: true,
        menuItems: {
            monitorOff: { title: "Turn Off Monitor", icon: "television", source: "SERVER" },
            restart: { title: "Restart MagicMirror", icon: "recycle", source: "ALL" },
            refresh: { title: "Refresh MagicMirror", icon: "refresh", source: "LOCAL" },
            reboot: { title: "Reboot", icon: "spinner", source: "ALL" },
            shutdown: { title: "Shutdown", icon: "power-off", source: "ALL" },
            notify1: { title: "Switch to Profile Default User", icon: "user", notification: "CURRENT_PROFILE", payload: "Default" },
            notify2: { title: "Switch to Profile Test User 1", icon: "user", notification: "CURRENT_PROFILE", payload: "Test User 1" },
            notify3: { title: "Switch to Profile Test User 2", icon: "user-times", notification: "CURRENT_PROFILE", payload: "Test User 2" },
            notify4: { title: "Switch to Profile Test User 3", icon: "user-secret", notification: "CURRENT_PROFILE", payload: "Test User 3" },
            notify5: { title: "Switch to Profile Test User 4", icon: "user-plus", notification: "CURRENT_PROFILE", payload: "Test User 4" },
            notify6: { title: "Switch to Profile Family User", icon: "user", notification: "CURRENT_PROFILE", payload: "Family" },

        },
    }
},
````
The key of the menu item (notify1) is how you signal an event to that module. The title and icon are arbitrary and is what is actually shown in the module onscreen. The important part is that notification is "CURRENT_PROFILE" and the payload be the case sensitive name of the profile you wish to use.

**Note: All the below modules were done with the old implementation. They should still work fine since the mechanism for switching profiles is the same, but they have not been tested with the new implementation yet. The only one I know works for sure is MMM-OnScreenMenu since I use it personally.**

### [MMM-ModuleScheduler](https://github.com/ianperrin/MMM-ModuleScheduler/) by Ian Perrin
You can switch to a profile on a certain given time by scheduling a notification in the MMM-ModulesScheduler's config. For example like so:
````javascript
{
    module: 'MMM-ModuleScheduler',
    config: {
        notification_schedule: [
            // SWITCH TO THE DAY PROFILE AT 07:30 EVERY DAY
            {notification: 'CURRENT_PROFILE', schedule: '30 7 * * *', payload: 'Day'},
            // SWITCH TO THE NIGHT PROFILE AT 23:30 EVERY DAY
            {notification: 'CURRENT_PROFILE', schedule: '30 23 * * *', payload: 'Night'},
        ]
    }
},
````
**Note:** If you have `useLockStrings` on `true` and you want to unhide a module you will have to force it.


### [MMM-Facial-Recognition] by Paviro
**Note:** Paviro and I made some changes to use these two modules together more convenient. Once we are sure it fully works I will update this guide.

Using the [MMM-Facial-Recognition] module and [MMM-ProfileSwitcher] together does not work straight out of the box.
In order for [MMM-Facial-Recognition] to use the [MMM-ProfileSwitcher] module we will have to change a few lines of the code in the [MMM-Facial-Recognition] module's javascript file.
This file can be found in (after installing his module):
````
~/MagicMirror/modules/MMM-Facial-Recognition
````
Here we will have to remove the lines. Since his translations are not being used anymore we can also delete these lines (the `getTranslations` function).
Since we will be removing all his code inside the `notificationReceived` function, we might remove that one as well.

The lines are (all inclusive):
````
34-37, 53-65, 69-81, 100-103, 110-119 and 39-50 (translations)
````
If you removed the getTranslations method as mentioned above you can also safely delete the translation folder.
````
~/MagicMirror/modules/MMM-Facial-Recognition/translations
````
Lastly you will have to edit two of his calls to the `sendNotification` function on lines `65` and `81`. We will have to change `CURRENT_USER` into `CURRENT_PROFILE` and `"None"` into the `defaultClass`, which has to have the same value as the profile switcher module's `defaultClass`.
At the end the logout and login functions should look like this:
````javascript
// Code from paviro's MMM-Facial-Recognition
login_user: function () {
    this.sendNotification("CURRENT_PROFILE", this.current_user);
},
logout_user: function () {
    this.sendNotification("CURRENT_PROFILE", this.config.defaultClass);
},
````
And then you should be done!

### [MagicMirror-LocalTransport-Module](https://github.com/CFenner/MagicMirror-LocalTransport-Module) by CFenner
The [MagicMirror-LocalTransport-Module](https://github.com/CFenner/MagicMirror-LocalTransport-Module) module does not work (without a fix) with the [MMM-ProfileSwitcher].
This due to his code overwriting a variable that it a default variable used by the [MagicMirror Framework](https://github.com/MichMich/MagicMirror) and my code need this. Luckily this problem can be solved fairly easily with any text editor.

Go to the module's main file `localtransport.js` and replace the occurences of `this.data` with `this.info`.

**Note:** There should be three occurences on lines `170`, `204` and `209`.

**Side note:** I have send him a pull request with this fix as well so hopefully this will be solved in the future.

## Current Supported Languages
* English
* German
* Dutch
* Swedish (thanks to Snille)
* Spanish (thanks to roramirez)

## Notes
* Using [MagicMirror-LocalTransport-Module](https://github.com/CFenner/MagicMirror-LocalTransport-Module) by CFenner results in this module to break. See [Using With Other Modules](#magicmirror-localtransport-module-by-cfenner) for a fix.
* All the profile names are case sensitive.
* Multiple messages for a single profile will result in a randomly chosen message.
* It's wise to add `alert` and `updatenotification` to the `ignoreModules` array.

## Notes For Other Developers
* A `CHANGED_PROFILE` notifcation will be send after the `current_user` was modified.
* The timers can be disabled/enabled by sending an `DISABLE_PROFILE_TIMERS` / `ENABLE_PROFILE_TIMERS` notifcation with an empty payload.


## The MIT License (MIT)

Copyright (c) 2017 Brian Janssen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

**THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.**
