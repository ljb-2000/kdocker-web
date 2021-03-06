app

.controller("dockerHostConfigCtrl", function() {})

.directive("dockerHostConfig"
	, [       "$rootScope", "$modal", "DockerData", "DockerHost"
	, function($rootScope,   $modal,   DockerData,   DockerHost) {
	return {
		restrict: "E",
		templateUrl: "directives/dockerHostConfig.html",
		link: function(scope, elem, attrs) {

			var $scope = scope;
			$scope.dockerHost = new DockerHost(DockerData.dockerHost);
			$scope.DockerData = DockerData;
			DockerData.ConfigCtrl = $scope;

			$scope.addDocker = function() {
				var dockerHost = new DockerHost($scope.dockerHost);
				dockerHost.containers = [];
				dockerHost.images = [];
				DockerData.dockerHosts.unshift(dockerHost);
				DockerData.curDockerIdx = "0";
			};

			$scope.delDocker = function(idx) {
				DockerData.dockerHosts.splice(idx, 1);
			};

			$scope.setDocker = function(idx) {
				DockerData.curDockerIdx = "" + idx;
				$scope.dockerHost = new DockerHost(DockerData.dockerHost);
			};

			$scope.moveUp = function(idx) {
				var list = DockerData.dockerHosts;
				list.splice(idx-1, 0, list.splice(idx, 1)[0]);
			};

			$scope.moveDown = function(idx) {
				var list = DockerData.dockerHosts;
				list.splice(idx+1, 0, list.splice(idx, 1)[0]);
			};

			$scope.reset = function() {
				DockerData.reset();
			};

			$scope.openExportConfigModal = function() {
				$modal.open({
					templateUrl: "index/ExportConfigModalContent.html",
					controller: "ExportConfigModalCtrl"
				});
			};

			$scope.openImportConfigModal = function() {
				$modal.open({
					templateUrl: "index/ImportConfigModalContent.html",
					controller: "ImportConfigModalCtrl"
				})
				.result
					.then(function(data) {
						DockerData.curDockerIdx = -1;
						DockerData.dockerHosts.splice(0);
						angular.forEach(data.config, function(dockerHostConfig) {
							var dockerHost = new DockerHost(dockerHostConfig);
							DockerData.dockerHosts.push(dockerHost);
							DockerData.curDockerIdx = "0";
						});
					});
			};

			$rootScope.$on("ConfigCtrl.setDocker", function(e, idx) {
				DockerData.curDockerIdx = "" + idx;
			});

		}
	};
}])

;
