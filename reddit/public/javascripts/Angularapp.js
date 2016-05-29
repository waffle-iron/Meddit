var app = angular.module("reddit", ['ui.router'])


app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
	$stateProvider
	.state('home', {
		url: "/home",
		templateUrl: "/home.html",
		controller: "MainCtrl"
	})
	.state('posts', {
		url: "/posts/{id}",
		templateUrl: "/posts.html",
		controller: "PostsCtrl"
	})
	$urlRouterProvider.otherwise('home')
}])




// factory allows for the data to be used in other controllers
// remember $scope is not persistent, so if we go out of scope, bye bye data
app.factory("posts", [function(){
	var object = {
		posts: []
	}

	return object

}])



app.controller("MainCtrl", ['$scope', 'posts', function($scope, posts){
	$scope.posts = posts.posts

	$scope.addPost = function() {
		// mock data
		$scope.posts.push({
		  	title: $scope.title,
		  	link: $scope.link,
		 	upvotes: 0,
		 	comments: [{author: 'Joe', body: 'Cool post!', upvotes: 0},{author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}]
		});

		/// === checks for same type and value
		if(!$scope.title ||  $scope.title === ""){
			return
		}
		else{
			$scope.posts.push({title: $scope.title, link: $scope.link, upvotes: 0})
			$scope.title = ""
			$scope.link = ""
		}
	}

	$scope.upvote = function(post){
		post.upvotes += 1
	}

	$scope.downvote = function(post){
		post.upvotes -= 1
	}


}])


app.controller("PostsCtrl", ['$scope', '$stateParams', 'posts', function($scope, $stateParams, posts){
	$scope.posts = posts.posts[$stateParams.id]
	$scope.sanity = $stateParams
	

	$scope.addComment = function(){
		if($scope.body === ''){
			return
		}
		$scope.posts.comments.push({
			body: $scope.body,
			author: 'user',
			upvotes: 0
		})
		$scope.body = ''
	}
}])
