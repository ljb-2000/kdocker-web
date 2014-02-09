angular.module("KDockerWeb", ["KDockerWeb-config", "ui.bootstrap", "pascalprecht.translate"
	, "angular-websocket", "LocalStorageModule"])

.controller("MainCtrl", ["$scope", "DockerData"
	, function($scope, DockerData) {

	if (DockerData.host) {
		$scope.tab = "Containers";
	} else {
		$scope.tab = "Config";
	}

}])

.controller("ContainerCtrl", ["$scope", "$translate", "$http", "DockerData", "WebSocket", "UpdateConfig"
	, function($scope, $translate, $http, DockerData, WebSocket, UpdateConfig) {

	$scope.UpdateConfig = UpdateConfig;
	$scope.DockerData = DockerData;
	$scope.containers = [];
	$scope.tabs = [];
	$scope.curtab = null;

	$scope.reload = function() {
		$scope.curtab = null;
		if (!DockerData.host) {
			return;
		}
		$http
		.get("http://" + DockerData.host + ":" + DockerData.port + "/" + DockerData.apiver + "/containers/json?all=1")
		.success(function(data) {
			angular.forEach(data, function(v) {
				v.name = v.Names.join().substr(1);
				v.running = !!v.Status.match(/^Up /);
			});
			$scope.containers = data;
		})
		.error(function(data, status) {
			console.error("Get container list failed", data, status);
		});
	};

	$scope.attach = function(container) {
		$scope.curtab = container;
		if (!container) {
			return;
		}
		for (var i=0 ; i<$scope.tabs.length ; i++) {
			var c = $scope.tabs[i];
			if (container.Id === c.Id) {
				return;
			}
		}
		$scope.tabs.unshift(container);

		if (!container.terminal) {
			container.terminal = new Terminal();
			$scope.setupWebsocket(container);
		}
	};

	$scope.setupWebsocket = function(container) {
		if (!document.getElementById(container.Id + "_terminal")) {
			setTimeout(function() {
				$scope.setupWebsocket(container);
			}, 500);
			return;
		}

		container.terminal.open(document.getElementById(container.Id + "_terminal"));

		container.websocket = WebSocket
		.new("ws://" + DockerData.host + ":" + DockerData.port + "/" + DockerData.apiver + "/containers/" + container.Id + "/attach/ws?logs=0&stderr=1&stdout=1&stream=1&stdin=1")
		.onopen(function(e) {
			container.terminal.write($translate("WebSocket connected: {{url}}", {url: e.target.URL}));
		})
		.onerror(function(e) {
			container.terminal.write($translate("WebSocket error: {{url}}", {url: e.target.URL}));
		})
		.onclose(function(e) {
			container.terminal.write($translate("WebSocket closed: {{url}}", {url: e.target.URL}));
			container.terminal.destroy();
			delete container.terminal;
			delete container.websocket;
		})
		.onmessage(function(e) {
			container.terminal.write(e.data);
		});

		container.terminal.on("data", function(data) {
			container.websocket.send(data);
		});
	};

	$scope.closeContainer = function(container) {
		for (var i=0 ; i<$scope.tabs.length ; i++) {
			if (container.Id === $scope.tabs[i].Id) {
				var c = $scope.tabs.splice(i, 1)[0];
				c.websocket.close();
				$scope.curtab = null;
				return;
			}
		}
	};

	$scope.reload();

}])

.controller("ConfigCtrl", ["$scope", "DockerData", "UpdateConfig"
	, function($scope, DockerData, UpdateConfig) {

	$scope.DockerData = DockerData;

	$scope.UpdateConfig = UpdateConfig;

}])

;
