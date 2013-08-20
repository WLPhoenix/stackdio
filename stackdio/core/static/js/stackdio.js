$(document).ready(function () {

    /*
     *  ==================================================================================
     *  D A T A   T A B L E   E L E M E N T S
     *  ==================================================================================
     */
    $('#snapshots').dataTable({
        "bPaginate": false,
        "bLengthChange": false,
        "bFilter": true,
        "bSort": false,
        "bInfo": false,
        "bAutoWidth": true,
        "bFilter": false
    });

    $('#stacks').dataTable({
        "bPaginate": false,
        "bLengthChange": false,
        "bFilter": true,
        "bSort": false,
        "bInfo": false,
        "bAutoWidth": true,
        "bFilter": false
    });

    $('#accounts').dataTable({
        "bPaginate": false,
        "bLengthChange": false,
        "bFilter": true,
        "bSort": false,
        "bInfo": false,
        "bAutoWidth": true,
        "bFilter": false
    });

    $('#stack-hosts').dataTable({
        "bPaginate": false,
        "bLengthChange": false,
        "bFilter": true,
        "bSort": false,
        "bInfo": false,
        "bAutoWidth": true,
        "bFilter": false
    });

    $('#profiles').dataTable({
        "bPaginate": false,
        "bLengthChange": false,
        "bFilter": true,
        "bSort": false,
        "bInfo": false,
        "bAutoWidth": true,
        "bFilter": false
    });


    /*
     *  ==================================================================================
     *  D I A L O G   E L E M E N T S
     *  ==================================================================================
     */
    $( "#stack-form-container" ).dialog({
        autoOpen: false,
        width: window.innerWidth - 225,
        height: 400,
        position: [200,50],
        modal: false
    });

    $( "#snapshot-form-container" ).dialog({
        autoOpen: false,
        width: 650,
        modal: false
    });

    $( "#accounts-form-container" ).dialog({
        autoOpen: false,
        width: 650,
        modal: false
    });

    $( "#host-form-container" ).dialog({
        position: [(window.innerWidth / 2) - 275,50],
        autoOpen: false,
        width: 550,
        modal: true
    });

    $( "#volume-form-container" ).dialog({
        position: [(window.innerWidth / 2) - 250,50],
        autoOpen: false,
        width: 500,
        modal: true
    });

    $( "#profile-form-container" ).dialog({
        autoOpen: false,
        width: 650,
        modal: false
    });




    /*
     *  **********************************************************************************
     *  ==================================================================================
     *  V I E W   M O D E L
     *  ==================================================================================
     *  **********************************************************************************
     */
    function stackdioModel() {
        var self = this;

        self.showVolumes = ko.observable(false);
        self.sections = ['Stacks', 'Accounts', 'Profiles', 'Snapshots'];
        self.stackActions = ['Stop', 'Terminate', 'Start', 'Launch'];
        self.currentSection = ko.observable();

        /*
         *  ==================================================================================
         *  C O L L E C T I O N S
         *  ==================================================================================
         */
        self.roles = ko.observableArray([]);
        self.launchedHosts = ko.observableArray([]);
        self.instanceSizes = ko.observableArray([]);

        self.providerTypes = ko.observableArray([]);
        self.selectedProviderType = null;


        //
        //      S T A C K S
        //
        self.saveStack = function (autoLaunch) {
            var h, host, hosts = stackdio.stores.NewHosts();

            var stack = {
                cloud_provider: self.selectedAccount.id,
                auto_launch: autoLaunch === true,
                title: document.getElementById('stack_title').value,
                description: document.getElementById('stack_purpose').value,
                hosts: []
            };

            for (h in hosts) {
                host = hosts[h];
                stack.hosts.push({
                     host_count: host.count
                    ,host_size: host.instance_size.id
                    ,host_pattern: host.hostname
                    ,cloud_profile: self.selectedProfile.id
                    ,salt_roles: _.map(host.roles, function (r) { return r.value; })
                    ,host_security_groups: host.security_groups
                });
            }

            stackdio.api.Stacks.save(stack)
                .then(function () {
                    stackdio.stores.NewHosts.removeAll();

                    // Clear the stack form
                    $('#stack_title').val('');
                    $('#stack_purpose').val('');

                    // Hide the stack form
                    $( "#stack-form-container" ).dialog("close");
                });
        }
        self.launchStack = function (model, evt) {
            self.saveStack(true);
        };


        // 
        //      P R O F I L E S
        // 
        self.selectedProfile = null;
        self.addProfile = function (model, evt) {
            var profile = self.collectFormFields(evt.target.form);
            stackdio.api.Profiles.save(profile);
        };
        self.removeProfile = function (profile) {


        };


        // 
        //      A C C O U N T S
        // 
        self.selectedAccount = null;
        self.addAccount = function (model, evt) {
            var record = self.collectFormFields(evt.target.form);
            var files, formData = new FormData(), xhr = new XMLHttpRequest();

            // A reference to the files selected
            // files = me.accountForm.down('filefield').fileInputEl.dom.files;
            console.log(record);

            // Append private key file to the FormData() object
            formData.append('private_key_file', record.private_key_file.files[0]);

            // Add the provider type that the user chose from the account split button
            formData.append('provider_type', self.selectedProviderType.id);

            // Append all other required fields to the form data
            for (r in record) {
                rec = record[r];
                formData.append(r, rec.value);
            }

            // Open the connection to the provider URI and set authorization header
            xhr.open('POST', '/api/providers/');
            xhr.setRequestHeader('Authorization', 'Basic ' + Base64.encode('testuser:password'));

            // Define any actions to take once the upload is complete
            xhr.onloadend = function (evt) {
                var record = JSON.parse(evt.target.response);

                // Show an animated message containing the result of the upload
                if (evt.target.status === 200 || evt.target.status === 201 || evt.target.status === 302) {
                    $( "#accounts-form-container" ).dialog( "close" );
                    self.accounts.push(new Account(record.id.value, 
                                                    record.title.value,
                                                    record.description.value,
                                                    record.provider_type.value,
                                                    record.provider_type_name.value
                                                  ));
                    console.log('accounts', self.accounts());
                } else {
                    // var html=[], response = JSON.parse(evt.target.response);

                    // for (key in response) {
                    //     failure = response[key];
                    //     html.push('<p>' + key + ': ' + failure + '</p>');
                    // }
                    // me.application.notification.scold('New account failed to save. Check your data and try again...'+html, 5000);
                }
            };

            // Start the upload process
            xhr.send(formData);
        };
        self.removeAccount = function (account) {
            self.accounts.remove(account);
        };


        // 
        //      S N A P S H O T S
        // 
        self.addSnapshot = function (model, evt) {
            var record = self.collectFormFields(evt.target.form);

            $.ajax({
                url: '/api/snapshots/',
                type: 'POST',
                data: {
                    title: record.snapshot_title.value,
                    description: record.snapshot_description.value,
                    cloud_provider: self.selectedAccount.id,
                    size_in_gb: record.snapshot_size.value,
                    snapshot_id: record.snapshot_id.value
                },
                headers: {
                    "Authorization": "Basic " + Base64.encode('testuser:password'),
                    "Accept": "application/json"
                },
                success: function (response) {
                    // Create new snapshot
                    var snapshot = new Snapshot(
                            response.id,
                            response.url,
                            response.title,
                            response.description,
                            response.cloud_provider,
                            response.size_in_gb,
                            response.snapshot_id
                        );

                    // Inject account name
                    snapshot.account_name = _.find(self.accounts(), function (account) {
                        return account.id === response.cloud_provider;
                    }).title;

                    // Add to observable collection
                    self.snapshots.push(snapshot);

                    // Close dialog
                    $( "#snapshot-form-container" ).dialog("close");
                }
            });
        };
        self.removeSnapshot = function (snapshot) {
            self.snapshots.remove(snapshot);
        };



        // 
        //      N E W   H O S T   V O L U M E S
        // 
        self.addHostVolume = function (model, evt) {
            var record = self.collectFormFields(evt.target.form);
            var volume = new NewHostVolume(0, record.volume_snapshot.value, record.volume_device.value, record.volume_mount_point.value);

            volume.snapshot = _.find(self.snapshots(), function (s) {
                return s.id === parseInt(record.volume_snapshot.value, 10);
            });

            self.newHostVolumes.push(volume);
        };
        self.removeHostVolume = function (volume) {
            self.newHostVolumes.remove(volume);
        };


        // 
        //      N E W   H O S T S
        // 
        self.addHost = function (model, evt) {
            var record = self.collectFormFields(evt.target.form);

            var host = new stackdio.models.NewHost().create({ 
                id: '',
                count: record.host_count.value,
                cloud_profile: self.selectedProfile.id,
                instance_size: record.host_instance_size.value,
                roles: record.host_roles,
                hostname: record.host_hostname.value,
                security_groups: record.host_security_groups.value
            });

            host.size = _.find(stackdio.stores.InstanceSizes(), function (i) {
                return i.id === parseInt(record.host_instance_size.value, 10);
            });

            host.flat_roles = _.map(host.roles, function (r) { 
                return '<div style="line-height:15px !important;">' + r.text + '</div>'; 
            }).join('');

            stackdio.stores.NewHosts.push(host);
        };

        self.removeHost = function (host) {
            stackdio.stores.NewHosts.remove(host);
        };


        /*
         *  ==================================================================================
         *  M E T H O D S
         *  ==================================================================================
         */

        self.doStackAction = function (action, evt, stack) {
            var data = JSON.stringify({
                action: action.toLowerCase()
            });

            $.ajax({
                url: '/api/stacks/' + stack.id + '/',
                type: 'PUT',
                data: data,
                headers: {
                    "Authorization": "Basic " + Base64.encode('testuser:password'),
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                success: function (response) {
                    console.log(response);
                    self.loadStacks();
                }
            });
        };

        self.collectFormFields = function (obj) {
            var i, item, el, form = {}, id, idx;
            var o, option, options, selectedOptions;

            // Collect the fields from the form
            for (i in obj) {
                item = obj[i];
                if (item !== null && item.hasOwnProperty('localName') && ['select','input'].indexOf(item.localName) !== -1) {

                    id = item.id;
                    form[id] = {};

                    switch (item.localName) {
                        case 'input':
                            if (item.files === null) {
                                form[id].text = item.text;
                                form[id].value = item.value;
                            } else {
                                form[id].text = '';
                                form[id].value = '';
                                form[id].files = item.files;
                            }
                            break;
                        case 'select':
                            el = document.getElementById(id);

                            if (el.multiple) {
                                form[id] = [];
                                options = el.selectedOptions;
                                for (o in options) {
                                    option = options[o];
                                    if (typeof option.text !== 'undefined') {
                                        form[id].push({ text: option.text, value: option.value });
                                    }
                                }
                            } else {
                                idx = el.selectedIndex;
                                if (idx !== -1) {
                                    form[id].text = el[idx].text;
                                    form[id].value = el[idx].value;
                                    form[id].selectedIndex = idx;
                                }
                            }

                            break;
                    }
                }
            }

            return form;
        }

        self.showProfileForm = function (account) {
            self.selectedAccount = account;
            $( "#profile-form-container" ).dialog("open");
        }

        self.showSnapshotForm = function (account) {
            self.selectedAccount = account;
            $( "#snapshot-form-container" ).dialog("open");
        }

        self.showAccountForm = function (type) {
            self.selectedProviderType = type;
            $( "#accounts-form-container" ).dialog("open");
        }

        self.showStackForm = function (account) {
            self.selectedAccount = account;
            $( "#stack-form-container" ).dialog("open");
        }

        self.closeStackForm = function () {
            $( "#stack-form-container" ).dialog("close");
        }

        self.showHostForm = function (profile) {
            self.selectedProfile = profile;
            $( "#host-form-container" ).dialog("open");
        }

        self.closeHostForm = function () {
            $( "#host-form-container" ).dialog("close");
        }

        self.showVolumeForm = function () {
            $( "#volume-form-container" ).dialog("open");
        }

        self.closeVolumeForm = function () {
            $( "#volume-form-container" ).dialog("close");
        }

        self.gotoSection = function (section) { 
            location.hash = section;
            self.currentSection(section);
        };

        self.profileSelected = function (profile) { 
            self.selectedProfile = profile;
        };

        self.toggleVolumeForm = function () { 
            self.showVolumes(!self.showVolumes());
        };



        /*
         *  ==================================================================================
         *  N A V I G A T I O N   H A N D L E R
         *  ==================================================================================
         */
        $.sammy(function() {
            this.get('#:section', function () {
                self.currentSection(this.params.section);

                switch (this.params.section) {

                    case 'Stacks':
                        stackdio.api.InstanceSizes.load();
                        stackdio.api.Roles.load();

                        stackdio.api.ProviderTypes.load()
                            .then(stackdio.api.Accounts.load)
                            .then(stackdio.api.Profiles.load)
                            .then(stackdio.api.Stacks.load);

                        break;

                    case 'Snapshots':
                        stackdio.api.ProviderTypes.load()
                            .then(stackdio.api.Accounts.load)
                            .then(stackdio.api.Snapshots.load)

                        break;

                    case 'Profiles':
                        stackdio.api.ProviderTypes.load()
                            .then(stackdio.api.Accounts.load)
                            .then(stackdio.api.Profiles.load);

                        break;

                    case 'Accounts':
                        stackdio.api.ProviderTypes.load()
                            .then(stackdio.api.Accounts.load);

                        break;
                }
            });

            this.get('', function() { this.app.runRoute('get', '#Stacks') });
        }).run();


    };

    stackdio.mainModel = new stackdioModel();
    ko.applyBindings(stackdio.mainModel);

});