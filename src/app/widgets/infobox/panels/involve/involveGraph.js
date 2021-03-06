(function () {
    "use strict";
    /**
     * @desc
     */
    angular.module('SportsensusApp')
        .controller('involveGraphCrtl', involveGraphCrtl);

    involveGraphCrtl.$inject = [
        '$scope',
        '$controller',
        'ParamsSrv',
        'ApiSrv',
        'graphHelpersSrv'
    ];

    function involveGraphCrtl(
        $scope,
        $controller,
        ParamsSrv,
        ApiSrv,
        graphHelpersSrv
    ) {

        $controller('baseGraphCtrl', {$scope: $scope});

	    $scope.setParams = function(params){
            $scope.prepareLegends();
            requestGraph();
		}


        $scope.showCharts = false;

        function requestGraph() {
            var audience = ParamsSrv.getSelectedAudience();
            var sports = {};
            $scope.parameters.sport.lists.forEach(function (list) {
                sports[list.key] = {interested: true}
            });
            var involve = $scope.parameters.involve.lists.map(function (list) {
                return list.id;
            });
            var sportInvolve = { // все спорты и все интересы
                sport: sports, // ParamsSrv.getParams().sport //ParamsSrv.getSelectedParams('sport'),
                involve: involve // [1, 2, 3, 4, 5, 6, 7] // ParamsSrv.getSelectedParams('image')
            };
            ApiSrv.getInvolveGraph(audience, sportInvolve).then(function (graphData) {
                $scope.prepareData(graphData);
                $scope.updateGraph();
            }).finally(function () {
                $scope.showPreloader = false;
            });
        }

        $scope.prepareLegends = function () {
            $scope.sportLegend = graphHelpersSrv.getSportLegend({sport: $scope.parameters.sport, color:'#555555'});
            $scope.involveLegend = graphHelpersSrv.getInvolveLegend({involve: $scope.parameters.involve});

            $scope.$watch('sportLegend', $scope.updateGraph, true);
            $scope.$watch('involveLegend', $scope.updateGraph, true);
        };



        $scope.prepareData = function (data) {

            var involves = {};
            $scope.parameters.involve.lists.forEach(function (list) {
                involves[list.id] = {
                    id: list.id,
                    name: list.name,
                    count: 0
                }
            });

            var sports = {};
            $scope.parameters.sport.lists.forEach(function (list) {
                sports[list.id] = angular.merge({
                    data: angular.merge({}, involves)
                }, list);
            });


            var legendIndexes = {};
            data.legends.forEach(function(item, index){
                legendIndexes[item.name] = index;
            });

            var maxValue = 0;
            data.data.forEach(function (item) {
                var sportId = item.legend[legendIndexes['sport']];
                var involveId = item.legend[legendIndexes['involve']];
                sports[sportId].data[involveId].count += item.count;
                maxValue = Math.max(maxValue, sports[sportId].data[involveId].count);
            }, this);
            var multiplier = maxValue > 1000*1000 ? 1000*1000 : maxValue > 1000 ? 1000 : 1;


            $scope.chartsData = {
                multiplier: multiplier,
                maxValue: maxValue,
                sports: sports
            };
            

        };

        $scope.updateGraph = function () {
            if (!$scope.chartsData) return;
            

            var sports = $scope.sportLegend.filter(function(item) {
                return item.selected;
            });

            var involves = $scope.involveLegend.filter(function(item) {
                return item.selected;
            });

            var charts = [];
            sports.forEach(function(sport){
                // if (!sport.selected) return;
                //charts.push(sport);
                var chartData = {labels:[],datasets:[]};

                    var dataDs = { label:[], fillColor:[], data:[] };
                    var emptyDs = { label:[], fillColor:[], data:[] };

                    involves.forEach(function(involve){
                        var value = $scope.chartsData.sports[sport.id].data[involve.id].count;
                        if (value == 0) return;

                        dataDs.label.push(involve.name + ': ' + value.toLocaleString('en-US'));
                        dataDs.fillColor.push(involve.color);
                        dataDs.data.push($scope.chartsData.sports[sport.id].data[involve.id].count);

                        emptyDs.label.push(involve.name);
                        emptyDs.fillColor.push(involve.color);
                        emptyDs.data.push(0);

                        chartData.labels.push('');
                    });

                    chartData.datasets.push(dataDs);
                    chartData.datasets.push(emptyDs);
                // }


                charts.push({
                    sport:sport,
                    chartData:{data:chartData, options:{
                        showLabels: $scope.formatValue,
                        scaleLabel: function(obj){return $scope.formatValue(obj.value);}
                    }}
                })
            });

            $scope.showCharts = !!charts.length && !!involves.length;
            $scope.charts = charts;

            // Combine all sports in one graph
            var combineChart = {data:{labels:[], datasets:[]}, options:{
                scaleLabel: function(obj){return $scope.formatValue(obj.value);},
                barWidth: 40,
                barHeight: 300,
                barValueSpacing: 30
            }};
            combineChart.data.labels = sports.map(function(item){return item.name;});
            involves.forEach(function(involve){
                var ds = { label:[], fillColor:[], data:[] };
                sports.forEach(function(sport) {
                    var value = $scope.chartsData.sports[sport.id].data[involve.id].count;
                    ds.label.push(involve.name + ': ' + value.toLocaleString('en-US'));//item[0].name);
                    ds.fillColor.push(involve.color);
                    ds.data.push(value);

                });
                combineChart.data.datasets.push(ds);
            });
            $scope.combineChart = (combineChart.data.labels.length > 1 ? combineChart : null);
        };

    }

}());
