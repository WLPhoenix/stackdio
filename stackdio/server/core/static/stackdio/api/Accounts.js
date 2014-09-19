define(['q', 'settings', 'model/models'], function (Q, settings, models) {
    var self = this;

    return {
        load : function () {
            var deferred = Q.defer();

            $.ajax({
                url: settings.api.cloud.providers,
                type: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                success: function (response) {
                    var accounts = response.results.map(function (account) {
                        return new models.Account().create(account);
                    });
                    deferred.resolve(accounts);
                },
                error: function (request, status, error) {
                    deferred.reject(new Error(error));
                }
            });

            return deferred.promise;
        },
        save: function (account) {
            var deferred = Q.defer();

            $.ajax({
                url: settings.api.cloud.providers,
                type: 'POST',
                data: JSON.stringify(account),
                headers: {
                    'X-CSRFToken': stackdio.settings.csrftoken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                success: function (response) {
                    deferred.resolve(response);
                },
                error: function (request, status, error) {
                    deferred.reject(JSON.parse(request.responseText));
                }
            });

            return deferred.promise;

            /*
            var files, formData = new FormData(), xhr = new XMLHttpRequest();

            // Append required fields to the form data
            for (var key in account) {
                formData.append(key, account[key]);
            }

            // Open the connection to the provider URI and set authorization header
            xhr.open('POST', '/api/providers/');
            xhr.setRequestHeader('X-CSRFToken', stackdio.settings.csrftoken);
            xhr.setRequestHeader('Accept', 'application/json');

            // Define any actions to take once the upload is complete
            xhr.onloadend = function (evt) {
                var item;

                // Check if the upload succeeded
                if (evt.target.status === 200 || evt.target.status === 201 || evt.target.status === 302) {
                    // Parse the response to get the created item
                    item = JSON.parse(evt.target.response);

                    // Resolve the promise
                    deferred.resolve(item);
                } else {
                    var html=[];

                    try {
                        var response = JSON.parse(evt.target.response);

                        for (key in response) {
                            failure = response[key];
                            html.push('<p>' + key + ': ' + failure + '</p>');
                        }
                        deferred.reject(new Error(html));
                    } catch (e) {
                        deferred.reject('error');
                    }
                }
            };

            // Start the upload process
            xhr.send(formData);

            return deferred.promise;
            */
        },
        update: function (account) {
            var deferred = Q.defer();
            var patchAccount = {
                title: account.title,
                description: account.description,
                default_availability_zone: account.default_availability_zone
            };

            $.ajax({
                url: account.url,
                type: 'PATCH',
                data: JSON.stringify(patchAccount),
                headers: {
                    "X-CSRFToken": stackdio.settings.csrftoken,
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                success: function (response) {
                    deferred.resolve();
                }
            });

            return deferred.promise;
        },
        delete: function (account) {
            var deferred = Q.defer();

            $.ajax({
                url: account.url,
                type: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": stackdio.settings.csrftoken,
                    "Accept": "application/json"
                },
                success: function (response) {
                    deferred.resolve();
                },
                error: function (request, status, error) {
                    deferred.reject(JSON.parse(request.responseText).detail);
                }
            });
            
            return deferred.promise;
        },
        subnets: function (account) {
            var deferred = Q.defer();

            $.ajax({
                url: account.url + 'vpc_subnets/',
                type: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                success: function (response) {
                    deferred.resolve(response.results);
                },
                error: function (request, status, error) {
                    deferred.reject(JSON.parse(request.responseText).detail);
                }
            });
            
            return deferred.promise;
        },
        getGlobalComponents: function (account) {
            var deferred = Q.defer();

            $.ajax({
                url: account.global_orchestration_components,
                type: 'GET',
                headers: {
                    "Accept": "application/json"
                },
                success: function (response) {
                    deferred.resolve(response.results);
                },
                error: function (response, status, error) {
                    deferred.reject(JSON.parse(response.responseText).detail);
                }
            });

            return deferred.promise;
        },
        addGlobalComponent: function (account, component) {
            var deferred = Q.defer();

            $.ajax({
                url: account.global_orchestration_components,
                type: 'POST',
                data: JSON.stringify({
                    order: component.order,
                    component: component.id
                }),
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": stackdio.settings.csrftoken,
                    "Accept": "application/json"
                },
                success: function (response) {
                    deferred.resolve(response);
                },
                error: function (response, status, error) {
                    deferred.reject(JSON.parse(response.responseText).detail);
                }
            });

            return deferred.promise;
        },
        deleteGlobalComponent: function (componentId) {
            var deferred = Q.defer();

            $.ajax({
                url: '/api/global_orchestration_components/'+componentId+'/',
                type: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": stackdio.settings.csrftoken,
                    "Accept": "application/json"
                },
                success: function (response) {
                    deferred.resolve(response);
                },
                error: function (response, status, error) {
                    deferred.reject(JSON.parse(response.responseText).detail);
                }
            });

            return deferred.promise;
        },
        getGlobalProperties: function (account) {
            var deferred = Q.defer();

            $.ajax({
                url: account.global_orchestration_properties,
                type: 'GET',
                headers: {
                    "Accept": "application/json"
                },
                success: function (response) {
                    deferred.resolve(response);
                },
                error: function (response, status, error) {
                    deferred.reject(JSON.parse(response.responseText).detail);
                }
            });

            return deferred.promise;
        },
        setGlobalProperties: function (account, properties) {
            var deferred = Q.defer();

            $.ajax({
                url: account.global_orchestration_properties,
                type: 'PUT',
                data: properties,
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": stackdio.settings.csrftoken,
                    "Accept": "application/json"
                },
                success: function (response) {
                    deferred.resolve(response);
                },
                error: function (response, status, error) {
                    deferred.reject(JSON.parse(response.responseText).detail);
                }
            });

            return deferred.promise;
        }
    }
});
