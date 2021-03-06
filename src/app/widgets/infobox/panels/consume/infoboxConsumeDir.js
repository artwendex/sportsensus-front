(function () {
    "use strict";
    /**
     * @desc
     * @example
     */
    angular.module('SportsensusApp')
        .directive('infoboxConsumeDir', infoboxConsumeDir);

    infoboxConsumeDir.$inject = [
        '$rootScope'
    ];

    function infoboxConsumeDir(
        $rootScope
    )    {
        return {
            restrict: 'E',
            // transclude: true,
            // scope: {
            //     type: '@'
            // },
            templateUrl: '/views/widgets/infobox/panels/consume/infoboxConsume.html',
            // templateUrl: '/views/widgets/articles/articles.html',
            // link: function ($scope, $el, attrs) {
            // //   $scope.contentEl = $el[0].querySelector('div.infobox-content');
            // },

            controller: [
                '$scope',
                '$controller',
                '$compile',
                '$routeParams',
                '$location',
                '$window',
                'ParamsSrv',
                'ApiSrv',
                function(
                    $scope,
                    $controller,
                    $compile,
                    $routeParams,
                    $location,
                    $window,
                    ParamsSrv,
                    ApiSrv
                ) {

                    $controller('baseInfoboxCtrl', {$scope: $scope});

                    $scope.onParamsUpdated = function(){
                        prepareConsume($scope.parameters);
                    }
                    // prepareConsume();
                    
                    
                    // возвращает все наборы параметров, включая вложенные в виде линейной структуры
            		$scope.getAllSubchildren2 = function(item){
            			if (!item) return;
            			var finalItems = [];
            			if (!item.lists || item.lists.every(function(subitem){ return !subitem.lists; }))
            				finalItems.push(item);
            			else item.lists.forEach(function(subitem){
            				finalItems = finalItems.concat($scope.getAllSubchildren(subitem));
            			});
            			return finalItems;
            		};
            
            		$scope.getAllSubchildren = function(item){
            			if (!item) return;
            			var finalItems = [];
            			if (item.lists){
            				//finalItems.push(item);
            
            				item.lists.forEach(function (subitem) {
            					if (subitem.lists){
            						finalItems.push(subitem);
            						if (subitem.visible !== undefined){
            							subitem.visibleFn = function(){
            								if (subitem.visible === false)
            									return false;
            								if (subitem.visible instanceof Object){
            									return Object.keys(subitem.visible).some(function(key){
            										var params = $scope.parameters[key];
            										return params.lists.some(function(child){
            											var value = subitem.visible[key];
            											if (value instanceof Array)
            												return child.selected && value.indexOf(child.id) >= 0;
            											else
            												return child.selected && child.id == value;
            										})
            									});
            								}
            							}
            						}
            					}
            
            					finalItems = finalItems.concat($scope.getAllSubchildren(subitem));
            				});
            			}
            
            			return finalItems;
            		};
            
            		//function
            
            		$scope.blocks = [];
            		function prepareConsume(params){
            			//var consume = $scope.parameters && $scope.parameters.consume;
            			var consume = params && params.consume;
            			
            			$scope.blocks = [];
            			
            			if (!consume) {
            				return;
            			}
            			
            			$scope.blocks = consume.lists.map(function(list){ 
            				return {
            					origin: list,
            					//name: list.name, 
            					lists: list.lists,
            					//visible: false,
            					isSelected: $scope.checkSelected.bind(null, list.key),
            				}; 
            			});
            			$scope.blocks.forEach(function(block){
            				if (block.lists.every(function(list){ return !list.lists })){ // terminate list (like antivirus)
            					block.lists = [{
            						lists: block.lists
            					}]
            				} else {
            					block.lists = $scope.getAllSubchildren(block);
            				}
            			});
            		}
            
            // 		// переопределяем setParams
            // 		var parentSetParams = $scope.setParams;
            // 		$scope.setParams = function(params){
            // 			parentSetParams(params);
            // 			$scope.prepareConsume();
            // 		}
                   
                    
                   
                    
                }]
        };
    }
}());
