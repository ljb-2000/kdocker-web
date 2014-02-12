angular.module("KDockerWeb", [
	"ui.bootstrap",
	"pascalprecht.translate",
	"angular-websocket",
	"LocalStorageModule"
])

.provider("DockerData", function() {
	function DockerData(localStorageService) {
		var $data = this;

		$data.init = function() {
			$data.host = "";
			$data.port = 4243;
			$data.apiver = "v1.9";
			$data.containers = [];
			$data.images = [];
		};
		$data.init();

		$data.reset = function() {
			$data.init();
			localStorageService.clearAll();
		};

		angular.forEach(localStorageService.keys(), function(key) {
			var value;
			if (angular.isNumber($data[key])) {
				value = +localStorageService.get(key);
			} else if (typeof($data[key]) === "boolean") {
				value = localStorageService.get(key) != "false";
			} else {
				value = localStorageService.get(key);
			}
			if ($data[key] === value) {
				localStorageService.remove(key);
			} else {
				$data[key] = value;
			}
		});
	};
	this.$get = ["localStorageService", function(localStorageService) {
		return new DockerData(localStorageService);
	}];
})

.provider("UpdateConfig", function() {
	function UpdateConfig(localStorageService, DockerData) {
		var $uc = this;
		$uc.UpdateConfig = function(key) {
			if (DockerData[key] === undefined) {
				localStorageService.remove(key);
			} else {
				localStorageService.set(key, DockerData[key]);
				localStorageService.set(key + "_time", new Date());
			}
		};
	};
	this.$get = ["localStorageService", "DockerData", function(localStorageService, DockerData) {
		return new UpdateConfig(localStorageService, DockerData).UpdateConfig;
	}];
})

.config(["$translateProvider"
	, function($translateProvider) {

	$translateProvider
	.translations("zh-tw", {
		"OK": "確定",
		"Cancel": "取消",
		"Config": "設定",
		"Description": "說明",
		"Status": "狀態",
		"Create": "建立",
		"Action": "操作",
		"Attach": "連線",
		"Start": "啟動",
		"Stop": "停止",
		"Remove": "刪除",
		"Port Type": "類型",
		"Init start config": "初始化設定參數",
		"WebSocket connected: {{url}}": "WebSocket 已連線: {{url}}",
		"WebSocket error: {{url}}": "WebSocket 錯誤: {{url}}",
		"WebSocket closed: {{url}}": "WebSocket 已中斷: {{url}}"
	})
	.preferredLanguage("zh-tw");
}])

;
