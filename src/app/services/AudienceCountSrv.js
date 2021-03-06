(function () {

    "use strict";
    angular.module('SportsensusApp')
        .factory('AudienceCountSrv', AudienceCountSrv);

    // инициализируем сервис
    // angular.module('SportsensusApp').run(['AudienceCountSrv', function(AudienceCountSrv) { }]);

    // events:
    // 'AudienceCountSrv.countLoading'
    // 'AudienceCountSrv.countLoaded'
    // 'AudienceCountSrv.countError'
    AudienceCountSrv.$inject = [
        '$rootScope',
        '$q',
        'ApiSrv',
        'UserSrv'
    ];


    function AudienceCountSrv(
        $rootScope,
        $q,
        ApiSrv,
        UserSrv
    ) {
        
        // кеш на 10 последних запросов аудитории
        var audienceCache = [];
        var audienceCacheSize = 100;
        function getCachedCount(audience) {
            audience = audience || {};
            var audienceKey = JSON.stringify(audience);
            var audienceObj = audienceCache.find(function(obj){
                return obj.key == audienceKey;
            });
            
            if (audienceObj) {
                return $q.resolve(audienceObj.result);
            }
            
            return ApiSrv.getAudienceCount(audience).then(function(result){
                audienceCache.push({
                    key: audienceKey,
                    result: result
                });
                while (audienceCache.length > audienceCacheSize)
                    audienceCache.shift();
                return result;
            });
        }
        
        function clearCache(){
            audienceCache = [];
        }
        
        // всегда резолвится, не реджектится
        // нужна для подсчета процентного соотношения выбранной аудитории к полной
        
        //var getTotalCount = UserSrv.loadWhenAuth(function(resolve, reject){
        //     getCachedCount().then(function(result){
        //         resolve(result.audience_count)
        //     }, function(){
        //         return $q.resolve(0);
        //     });
        // }, true);
        
        // var getTotalCount = ParamsSrv.getParams().then(function(){
        //     return getCachedCount().then(function(result){
        //         return result.audience_count
        //         // resolve(result.audience_count)
        //     }, function(){
        //         return 0;
        //     });
        // }, function(){
        //     return 0;
        // });
        
        
        function getTotalCount(){
            return getCachedCount().then(function(result){
                return result.audience_count
            }, function(){
                return 0;
            });
        };
        
        // при первом обращении к сервису запрашиваем начальное значение аудитории
        //getCount();
        
        var lastCountResult = null;
        function getLastCountResult(){ return lastCountResult; }
        
        // вызывается только из ParamsSrv и только после загрузки списка радаров
        // events:
        // 'AudienceCountSrv.countLoading'
        // 'AudienceCountSrv.countLoaded'
        // 'AudienceCountSrv.countError'
        function getCount(audience){
            $rootScope.$broadcast('AudienceCountSrv.countLoading');
            
            return getTotalCount().then(function(totalCount){
                return getCachedCount(audience).then(function(result){
                    var percent = totalCount ? result.audience_count / totalCount * 100 : 0;
                    result.audiencePercent = percent;
                    lastCountResult = result;
                    $rootScope.$broadcast('AudienceCountSrv.countLoaded', result);
                    return result;
                }, function(result){
                    lastCountResult = null;
                    $rootScope.$broadcast('AudienceCountSrv.countError');
                    return $q.reject(result);
                });
            })
        }
        
        
        
        
        
        var me = {
            getCount: getCount,
            getLastCountResult: getLastCountResult,
            clearCache: clearCache
        };

        return me;
    }
}());