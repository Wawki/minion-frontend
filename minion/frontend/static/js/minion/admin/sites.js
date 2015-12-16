// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.


var minionAdminSitesModule = angular.module('minionAdminSitesModule', []);


minionAdminSitesModule.controller("AdminEditSiteController", function ($scope, dialog, site, plans) {
    $scope.site = site;
    $scope.plans = plans;

    $scope.cancel = function () {
        dialog.close(null);
    };

    $scope.submit = function(site) {
        dialog.close(site);
    };
});


minionAdminSitesModule.controller("AdminCreateSiteController", function ($scope, dialog, plans, sites) {
    $scope.site = {url:"",plans:[],verification:{enabled:false,value:null}};
    $scope.plans = plans;

    $scope.cancel = function () {
        dialog.close(null);
    };

    $scope.submit = function(site) {
        if (_.find(sites, function (s) { return s.url === site.url; })) {
            $scope.error = "The site already exists.";
        } else {
            dialog.close(site);
        }
    };
});


minionAdminSitesModule.controller("AdminSitesController", function($scope, $routeParams, $http, $dialog) {
    $scope.navItems = app.navContext('admin');

    var reload = function() {
        $http.get('/api/admin/sites')
            .success(function(response, status, headers, config) {
                $scope.sites = response.data;
            });
    };

    $scope.editSite = function (site) {
        $http.get('/api/admin/plans').success(function(response) {
            $scope.plans = response.data;
                var d = $dialog.dialog({
                    templateUrl: "static/partials/admin/sites/edit-site.html",
                    controller: "AdminEditSiteController",
                    resolve: { plans: function() { return $scope.plans; },
                               site: function() { return angular.copy(site); } }
                });
                d.open().then(function(site) {
                    if (site) {
                        var verify = site.verification;
                        $http.post('/api/admin/sites/' + site.id,
                                   {plans: site.plans,
                                    verification: {'enabled': verify.enabled,
                                                   'value': verify.value}}
                        ).success(function(response) {
                            reload();
                        });
                    }
                });
        });
    };

    $scope.createSite = function () {

        $http.get('/api/admin/plans').success(function(response) {
            $scope.plans = response.data;
            $http.get('/api/admin/sites').success(function(response) {
                $scope.sites = response.data;
                var d = $dialog.dialog({
                    templateUrl: "static/partials/admin/sites/create-site.html",
                    controller: "AdminCreateSiteController",
                    resolve: { plans: function() { return $scope.plans; },
                               sites: function() { return $scope.sites; } }
                });
                d.open().then(function(site) {
                    if(site) {
                        var verify = {'enabled': site.verification.enabled, 'value': null};
                        $http.post('/api/admin/sites', {url: site.url, plans: site.plans, verification: verify}).success(function(response) {
                            if (response.success) {
                                reload();
                            }
                        });
                    }
                });
            });
        });
    };

    $scope.removeSite = function(site) {
        var title = 'Delete definitely the site';
        var msg = 'Are you sure you want to delete everything relating to ' + site.url + ' ? ';
        msg += 'Warning this will delete every reference to the target and existing results';
        var btns = [{result:false, label: 'Cancel'}, {result:true, label: 'OK', cssClass: 'btn-primary'}];
        $dialog.messageBox(title, msg, btns).open().then(function(result) {
            if (result) {
                $http.delete('/api/admin/sites/' + site.id).success(function(response) {
                    reload();
                });
            }
        });
    };

    $scope.$on('$viewContentLoaded', function() {
        reload();
    });
});
