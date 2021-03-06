/*!
  * Copyright 2014,  Digital Reasoning
  * 
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  * 
  *     http://www.apache.org/licenses/LICENSE-2.0
  * 
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  * 
*/

define(['q', 'knockout', 'util/galaxy', 'util/alerts', 'api/api'],
function (Q, ko, $galaxy, alerts, API) {
    var vm = function () {
        var self = this;

        /*
         *  ==================================================================================
         *   V I E W   V A R I A B L E S
         *  ==================================================================================
         */
        self.selectedAccount = ko.observable(null);


        /*
         *  ==================================================================================
         *   R E G I S T R A T I O N   S E C T I O N
         *  ==================================================================================
         */
        self.id = 'user.profile';
        self.templatePath = 'user.profile.html';
        self.domBindingId = '#user-profile';

        try {
            $galaxy.join(self);
        } catch (ex) {
            console.log(ex);            
        }

        /*
         *  ==================================================================================
         *   E V E N T   S U B S C R I P T I O N S
         *  ==================================================================================
         */
        $galaxy.network.subscribe(self.id + '.docked', function (data) {
            API.Users.load().then(function (public_key) {
                $('#first_name').val(window.stackdio.user.first_name);
                $('#last_name').val(window.stackdio.user.last_name);
                $('#public_key').val(public_key);
            })
        });


        /*
         *  ==================================================================================
         *   V I E W   M E T H O D S
         *  ==================================================================================
        */
        self.saveProfile = function () {
            API.Users.saveKey($('#public_key').val()).then(function () {
                alerts.showMessage('#success', 'Cloud profile successfully saved.', true);
            });
        };

    };
    return new vm();
});
