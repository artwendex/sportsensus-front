(function () {

    "use strict";
    angular.module('SportsensusApp')
        .factory('ApiSrv', ApiSrv);

    // инициализируем сервис
    angular.module('SportsensusApp').run(['ApiSrv', function(ApiSrv) {
        //ApiSrv.init();
        //ApiSrv.logout();

    }]);

    // angula
    // r.module('SportsensusApp').run(ApiSrv.init);

    ApiSrv.$inject = [
        '$rootScope',
        '$http',
        '$q',
        '$cookies',
        'ConfigSrv'
    ];


    /**
     * events:
     * ApiSrv.highlightItem
     */
    function ApiSrv(
        $rootScope,
        $http,
        $q,
        $cookies,
        ConfigSrv
    ) {

        var proxyURL = ConfigSrv.get().proxyURL || '';
        var url = proxyURL + ConfigSrv.get().apiUrl;
        
        var sid = null;
        
        function setSid(_sid){
            sid = _sid;
        }
        
        function request(method, params, responsePath){
            var data = {
                jsonrpc: "2.0",
                method: method,
                params: angular.extend({sid:sid}, params),
                id: "id"
            };
            
            return $http.post(url, data).then(function(response){
                var error = response.data && response.data.error;
                if (error){
                    $rootScope.$broadcast('ApiSrv.requestError', error);
                    return $q.reject(response);
                }
                
                var value = get(response, responsePath);
                if (typeof value == "undefined")
                    return $q.reject(response);
                else
                    return(value);
            }, function(response){
                return $q.reject(response);
            });


            function get(obj, key) {
                return key.split(".").reduce(function(o, x) {
                    return (typeof o == "undefined" || o === null) ? o : o[x];
                }, obj);
            }
        }


        function register(params){
            return request('register', params, 'data.result.created');
        }

        function activate(secret){
            return request('activateProfile', {secret: secret}, 'data.result');
        }

        function auth(params){
            return request('auth', params, 'data.result');
        }

        function checkSession(_sid){ 
            return request('check_session', {sid: _sid || sid}, 'data.result');
            // return request('check_session', {sid: _sid || sid}, 'data.result').then(function(data){
                
            // })
        }

        function logout(){
            return request('logout', null, 'data.result.deleted');
        }

        function getStatic(type){
            return request('get_static', {type:type}, 'data.result.data');
        }
        
        function getTranslations(){
            return request('get_translations', null, 'data.result.data');
        }

        function getAudienceCount(audience){
            return request('audienceCount', {audience:audience}, 'data.result')
        }
        
        function getImageGraph(audience, sportimage){
            return request('info_sportimage', {audience:audience, sportimage:sportimage}, 'data.result.graph');
        }

        function getInterestGraph(audience, sportinterest){
            return request('info_sportinterest', {audience:audience, sportinterest:sportinterest}, 'data.result.graph');
        }

        function getInvolveGraph(audience, involve){
            return request('info_fan_involvment', {audience:audience, involve:involve}, 'data.result.graph');
        }

        function getRootingGraph(audience, sport, rooting){
            return request('info_sportrooting',  {audience:audience, sportrooting:{sport: sport, rooting: rooting}}, 'data.result.graph');
        }

        function getRootingWatchGraph(audience, sport, rooting){
            return request('info_sportrooting', {audience:audience, sportrooting:{sport: sport, rooting_watch: rooting}}, 'data.result.graph');
        }

        function getRootingWalkGraph(audience, sport, rooting){
            return request('info_sportrooting', {audience:audience, sportrooting:{sport: sport, rooting_walk: rooting}}, 'data.result.graph');
        }

        function getExpressSport(audience, sport, clubs){
            return request('info_express_sport', {audience: audience, sport: sport, clubs: clubs}, 'data.result');
        }

        function getExpressAudience(audience){
            return request('info_express_audience', {audience: audience}, 'data.result');
        }

        function getProfilesList(){
            return request('get_profiles_list', null, 'data.result.profiles');
        }

        function addRole(uid, acl){
            return request('addProfileRole', {uid:uid, acl:acl}, 'data.result');
        }

        function getProfile(){
            return request('getProfile', null, 'data.result');
        }

        function editProfile(params){
            return request('editProfile', params, 'data.result.edit_result');
        }

        function changePassword(password){
            return request('change_pass', {password: password}, 'data.result.changed');
        }

        function getArticles(){
            return request('cms.get_articles', null, 'data.result.articles');
        }
        
        function createArticle(article) {
            return request('cms.create_article', article, 'data.result.article');
        }
        
        function editArticle(article){
            return request('cms.update_article', article, 'data.result.article');
        }
        
        function getArticle(id){
            return request('cms.get_article', {id: id}, 'data.result.article');
        }
        
        function removeArticle(id){
            return request('cms.delete_article', {id: id}, 'data.result.deleted');
        }
        
        function getTariffs(){
            return request('get_tariffs', null, 'data.result.tariffs');
            
            var d = $q.defer();
            
            var tariffs = [{
                id:1,
                name:'tariff 1',
                description: 'описание тарифа',
                duration:3, // продолжительность подписки (3-12 мес) - хз, в каких единицах. наверное в месяцах
                sessionCount:2, // количество (часовых) сессий, доступное на тарифе
                sessionDuration:3600, // продолжительность каждой сессии (час) - в секундах
                accessCases:true, // доступ к кейсам ??? доступно на всех тарифах - надо ли делать поле?
                accessInfoblock:true, // доступ к инфоблоку ??? доступно на всех тарифах - надо ли делать поле?
                accessAnalytics:false, // доступ к аналитике
                accessScheduler:false // доступ к планировщику
            },{
                id:2,
                name:'tariff 2',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                duration:3, // продолжительность подписки (3-12 мес) - хз, в каких единицах. наверное в месяцах
                sessionCount:2, // количество (часовых) сессий, доступное на тарифе
                sessionDuration:3600, // продолжительность каждой сессии (час) - в секундах
                accessCases:true, // доступ к кейсам ??? доступно на всех тарифах - надо ли делать поле?
                accessInfoblock:true, // доступ к инфоблоку ??? доступно на всех тарифах - надо ли делать поле?
                accessAnalytics:false, // доступ к аналитике
                accessScheduler:false // доступ к планировщику
            },{
                id:3,
                name:'tariff 3',
                description: 'описание тарифа',
                duration:3, // продолжительность подписки (3-12 мес) - хз, в каких единицах. наверное в месяцах
                sessionCount:2, // количество (часовых) сессий, доступное на тарифе
                sessionDuration:3600, // продолжительность каждой сессии (час) - в секундах
                accessCases:true, // доступ к кейсам ??? доступно на всех тарифах - надо ли делать поле?
                accessInfoblock:true, // доступ к инфоблоку ??? доступно на всех тарифах - надо ли делать поле?
                accessAnalytics:false, // доступ к аналитике
                accessScheduler:false // доступ к планировщику
            }];
            d.resolve(tariffs);
            return d.promise;
        }
        
        function sendEmail(options) {
            // var a = {
            //     "sid": "UMoEnDBCLNsXXbTEiPmcjGSjpnswnD7W04VzBBHvdNudOJHEPuaKT9Xzb4aYrFhH",
            //     "demo": false,
            //     "ttl": "03/03/2018 02:03:04",
            //     "address": ["redvsice@gmail.com"],
            //     "theme": "hello",
            //     "message": "hi",
            //     "attachments": [{"filename": "1.txt", "data": "YXNkcw=="}]
            // };
            var params = {
                //sid: sid,
                address: angular.isArray(options.address) ? options.address : [options.address],
                theme: options.theme,
                message: options.message,
                attachments: options.attachments // [{"filename": "1.txt", "data": "YXNkcw=="}]
            };
            return request('send_email', params, 'data.result.sent');
        }

        var me = {
            setSid: setSid,

            register: register,
            activate: activate,
            auth: auth,
            checkSession: checkSession,
            logout: logout,
            getStatic: getStatic,
            getTranslations: getTranslations,
            getAudienceCount: getAudienceCount,
            getImageGraph: getImageGraph,
            getInterestGraph: getInterestGraph,
            getInvolveGraph: getInvolveGraph,
            getRootingGraph: getRootingGraph,
            getRootingWatchGraph: getRootingWatchGraph,
            getRootingWalkGraph: getRootingWalkGraph,
            
            getExpressSport: getExpressSport,
            getExpressAudience: getExpressAudience,

            sendEmail: sendEmail,

            getProfilesList: getProfilesList,
            addRole: addRole,
            getProfile: getProfile,
            editProfile: editProfile,
            changePassword: changePassword,
            
            getArticles: getArticles,
            getArticle: getArticle,
            createArticle: createArticle,
            editArticle: editArticle,
            removeArticle: removeArticle,
            getTariffs: getTariffs
        };


        return me;
    }
}());