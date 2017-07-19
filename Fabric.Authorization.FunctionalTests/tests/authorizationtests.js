var chakram = require("chakram");
var expect = require("chakram").expect;

describe("authorization tests", function () {
    var baseAuthUrl = process.env.BASE_AUTH_URL;
    var baseIdentityUrl = process.env.BASE_IDENTITY_URL;

    if (!baseAuthUrl) {
        baseAuthUrl = "http://localhost:5004";
    }

    if (!baseIdentityUrl) {
        baseIdentityUrl = "http://localhost:5001";
    }


    console.log("baseAuthUrl: '" + baseAuthUrl + "'")
    console.log("baseIdentityUrl: '" + baseIdentityUrl + "'")

    var newAuthClientAccessToken = "";
    var authRequestOptions = {
        headers: {
                "content-type": "application/json",
                "Authorization": ""
            }   
    }
    var requestOptions = {
        headers:{
            "content-type": "application/json"
        }
    }   

    var identityClientFuncTest = {
        "clientId": "func-test",
        "clientName": "Functional Test Client",
        "requireConsent": "false",
        "allowedGrantTypes": ["client_credentials"], 
        "allowedScopes": [
            "fabric/identity.manageresources", 
            "fabric/authorization.read",
            "fabric/authorization.write"
        ]    
    }

    var authClientFuncTest = {
        "id": "func-test",
        "name": "Functional Test Client",
        "topLevelSecurableItem": { "name": "func-test" }
    }

    var groupFoo = {
        "id": "roleFoo",
        "groupName": "roleFoo"
    }

    var groupBar = {
        "id": "roleBar",
        "groupName": "roleBar"
    }

    var roleFoo = {
        "Grain": "app",
        "SecurableItem": "func-test",
        "Name": "roleFoo"
    }

    var roleBar = {
        "Grain": "app",
        "SecurableItem": "func-test",
        "Name": "roleBar"
    }    

    var userCanViewPermission = {
        "Grain": "app",
        "SecurableItem": "func-test",
        "Name": "userCanView"
    }

    var userCanEditPermission = {
        "Grain": "app",
        "SecurableItem": "func-test",
        "Name": "userCanEdit"
    }

    function registerAuthorizationApi(){
        var authApiResource = { 
            "name": "authorization-api", 
            "userClaims": ["name", "email", "role", "groups"], 
            "scopes": [
                {"name": "fabric/authorization.read"}, 
                {"name": "fabric/authorization.write"}, 
                {"name":"fabric/authorization.manageclients"}
            ]
        }

        return chakram.post(baseIdentityUrl + "/api/apiresource", authApiResource, authRequestOptions);
    }

    function registerRegistrationApi(){
        var registrationApi = {
            "name": "registration-api", 
            "userClaims": ["name","email", "role", "groups"], 
            "scopes": [{ "name": "fabric/identity.manageresources"}]
        }

        return chakram.post(baseIdentityUrl + "/api/apiresource", registrationApi, requestOptions);
    }

    function getAccessToken(clientData){
        return chakram.post(baseIdentityUrl + "/connect/token", undefined, clientData)
            .then(function(postResponse){  
                console.log("response for access token: " + JSON.stringify(postResponse.body));
                var accessToken = "Bearer " + postResponse.body.access_token;                                             
                return accessToken;
            });
    }

    function getAccessTokenForInstaller(installerSecret){        
        var postData = {
            form: {
                "client_id": "fabric-installer",
                "client_secret": installerSecret,
                "grant_type": "client_credentials",
                "scope": "fabric/identity.manageresources fabric/authorization.read fabric/authorization.write fabric/authorization.manageclients"
            }
        };      

        return getAccessToken(postData);
    }

    function getAccessTokenForAuthClient(newAuthClientSecret){        
        var clientData = {
            form:{
                "client_id": "func-test",
                "client_secret": newAuthClientSecret,
                "grant_type": "client_credentials",
                "scope":"fabric/authorization.read fabric/authorization.write"
            }
        }

        return getAccessToken(clientData);
    }

    function bootstrapIdentityServer(){
        return registerRegistrationApi()
        .then(registerAuthorizationApi())
        .then(function(){
            var installerClient = { 
                "clientId": "fabric-installer",
                "clientName": "Fabric Installer",
                "requireConsent": "false",
                "allowedGrantTypes": ["client_credentials"], 
                "allowedScopes": [
                    "fabric/identity.manageresources", 
                    "fabric/authorization.read", 
                    "fabric/authorization.write", 
                    "fabric/authorization.manageclients"]
            }
        
            return chakram.post(baseIdentityUrl + "/api/client", installerClient, requestOptions);             
        })
        .then(function(postResponse){            
            return postResponse.body.clientSecret;                        
        })
        .then(function(installerSecret){            
            return getAccessTokenForInstaller(installerSecret);
        })
        .then(function(retrievedAccessToken){                                   
            authRequestOptions.headers.Authorization = retrievedAccessToken;            
        });
    }

    before("running before", function(){
        this.timeout(5000);            
        return bootstrapIdentityServer();
    });

    describe("validate security", function(){
        it("should return a 403 when no access token provided", function(){
            var response = chakram.get(baseAuthUrl + "/clients", requestOptions);

            expect(response).to.have.status(403);
            return chakram.wait();
        });       
    });

    describe("register client", function(){      
        
        it("should register a client", function(){        
           return chakram.post(baseIdentityUrl + "/api/client", identityClientFuncTest, authRequestOptions)
            .then(function(clientResponse){
                expect(clientResponse).to.have.status(201);                                    
                return getAccessTokenForAuthClient(clientResponse.body.clientSecret);
            })
            .then(function(authClientAccessToken){                
                newAuthClientAccessToken = authClientAccessToken;
            })    
            .then(function(){
                return chakram.post(baseAuthUrl + "/clients", authClientFuncTest, authRequestOptions);           
            }) 
            .then(function(clientResponse){                
                expect(clientResponse).to.have.status(201);    
            });
            
        }); 
    });

    describe("register groups", function(){
        it("should register group foo", function(){
            var registerGroupFooResponse = chakram.post(baseAuthUrl + "/groups", groupFoo, authRequestOptions);
            return expect(registerGroupFooResponse).to.have.status(201);            
        });

        it("should register group bar", function(){
            var registerGroupBarResponse = chakram.post(baseAuthUrl + "/groups", groupBar, authRequestOptions);
            return expect(registerGroupBarResponse).to.have.status(201);           
        });
    });

    describe("register roles", function(){
        it("should register role foo", function(){
            authRequestOptions.headers.Authorization = newAuthClientAccessToken;
            
            var registerRoleFooResponse = chakram.post(baseAuthUrl + "/roles", roleFoo, authRequestOptions);            
            return expect(registerRoleFooResponse).to.have.status(201);
        });

        it("should register role bar", function(){
            authRequestOptions.headers.Authorization = newAuthClientAccessToken;
            
            var registerRoleBarResponse = chakram.post(baseAuthUrl + "/roles", roleBar, authRequestOptions);            
            return expect(registerRoleBarResponse).to.have.status(201);
        });
    });

    describe("register permissions", function(){
        it("should register permission userCanView", function(){
            authRequestOptions.headers.Authorization = newAuthClientAccessToken;

            var registerPermissionResponse = chakram.post(baseAuthUrl + "/Permissions", userCanViewPermission, authRequestOptions);
            return expect(registerPermissionResponse).to.have.status(201);
        });

         it("should register permission userCanEdit", function(){
            authRequestOptions.headers.Authorization = newAuthClientAccessToken;

            var registerPermissionResponse = chakram.post(baseAuthUrl + "/Permissions", userCanEditPermission, authRequestOptions);
            return expect(registerPermissionResponse).to.have.status(201);
        });
    });

    describe("associate groups to roles", function(){
        it("should associate group foo with role foo", function(){
            authRequestOptions.headers.Authorization = newAuthClientAccessToken;
            
            return chakram.get(baseAuthUrl + "/roles/"+ roleFoo.Grain + "/" + roleFoo.SecurableItem + "/" + roleFoo.Name, authRequestOptions)
            .then(function(getResponse){            
                expect(getResponse).to.have.status(200);
                expect(getResponse).to.comprise.of.json([{name:"roleFoo"}]);              
                return getResponse.body;                
            })
            .then(function(role){                
                return chakram.post(baseAuthUrl + "/groups/" + groupFoo.groupName + "/roles", role[0], authRequestOptions);
            })
            .then(function(postResponse){
                expect(postResponse).to.have.status(204);
            });            
        });

        it("should associate group bar with role bar", function(){
            authRequestOptions.headers.Authorization = newAuthClientAccessToken;
            
            return chakram.get(baseAuthUrl + "/roles/"+ roleBar.Grain + "/" + roleBar.SecurableItem + "/" + roleBar.Name, authRequestOptions)
            .then(function(getResponse){            
                expect(getResponse).to.have.status(200);
                expect(getResponse).to.comprise.of.json([{name:"roleBar"}]);              
                return getResponse.body;                
            })
            .then(function(role){                
                return chakram.post(baseAuthUrl + "/groups/" + groupBar.groupName + "/roles", role[0], authRequestOptions);
            })
            .then(function(postResponse){
                expect(postResponse).to.have.status(204);
            });            
        });
    });  

    describe("associate roles to permissions", function(){
        it("should associate roleFoo with userCanViewPermission and userCanEditPermission", function(){
            authRequestOptions.headers.Authorization = newAuthClientAccessToken;
            var permissions = [];
            chakram.startDebug();
            return chakram.get(baseAuthUrl + "/permissions/" + userCanViewPermission.Grain + "/" + userCanViewPermission.SecurableItem, authRequestOptions)
            .then(function(getResponse){
                expect(getResponse).to.have.status(200);
                permissions = getResponse.body;
                chakram.stopDebug();
                return chakram.get(baseAuthUrl + "/roles/"+ roleFoo.Grain + "/" + roleFoo.SecurableItem + "/" + roleFoo.Name, authRequestOptions);
            })            
            .then(function(getResponse){
                expect(getResponse).to.have.status(200);
                expect(getResponse).to.comprise.of.json([{name:"roleFoo"}]);  
                return getResponse.body;                
            })            
            .then(function(role){            
                var roleId = role[0].id;
                
                return chakram.post(baseAuthUrl + "/roles/" + roleId + "/permissions",  permissions, authRequestOptions);
            })
            .then(function(postResponse){       
                expect(postResponse).to.comprise.of.json({name:"roleFoo"});          
                
                expect(postResponse).to.have.status(200);
            });            
        });        
    });

    describe("get user permissions", function(){
        it("can get the users permissions", function(){
            //  var webdriver = require('selenium-webdriver');
            // By = webdriver.By,
            // until = webdriver.until;

            // var driver = new webdriver.Builder()
            //     .forBrowser('chrome')
            //     .build();
            
            var webdriver = require('selenium-webdriver'),
            By = webdriver.By,
            until = webdriver.until;
            var chrome = require('selenium-webdriver/chrome');
            var path = require('chromedriver').path;

            var service = new chrome.ServiceBuilder(path).build();
            chrome.setDefaultService(service);

            var driver = new webdriver.Builder()
                .withCapabilities(webdriver.Capabilities.chrome())
                .build();
            driver.get('http://www.google.com/ncr');
            driver.findElement(By.name('q')).sendKeys('webdriver');
            driver.findElement(By.name('btnG')).click();
            driver.wait(until.titleIs('webdriver - Google Search'), 1000);
            driver.quit();  
            
        });
    });
});