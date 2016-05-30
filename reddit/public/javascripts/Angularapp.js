var app = angular.module("reddit", ['ui.router'])


app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
	$stateProvider
	.state('home', {
		url: "/home",
		templateUrl: "/home.html",
		controller: "MainCtrl",
		resolve: {
			postPromise: ['posts', function(posts){
				// go tho the posts module(factory) and
				// do the function where we do posts.getall()
				return posts.getAll()
			}]
		}
	})
	.state('posts', {
		url: "/posts/{id}",
		templateUrl: "/posts.html",
		controller: "PostsCtrl",
		resolve: {
			post: ['$stateParams', 'posts', function($stateParams, posts){
				return posts.getComments($stateParams.id)
			}]
		}
	})
	.state('register', {
		url: "/register",
		templateURL: "/register.html",
		controller: "AuthCtrl",
		onEnter:['$state', 'auth', function($state, auth){
			if(auth.isLoggedIn()){
				$state.go('home')
			}
		}]
	})
	.state('login', {
		url: "/login",
		templateURL: "/login.html",
		controller: "AuthCtrl",
		onEnter:['$state', "auth", function($state, auth){
			if(auth.isLoggedIn()){
				$state.go("home")
			}
		}]
	})
	$urlRouterProvider.otherwise('home')
}])




// factory allows for the data to be used in other controllers
// remember $scope is not persistent, so if we go out of scope, bye bye data
app.factory("posts", ['$http', function($http){
	var object = {
		posts: []
	}

	object.getAll = function(){
		return $http.get("/posts").success(function(data){
			angular.copy(data, object.posts)
			//deep copy of data to object.posts
		})
	}

	object.create = function(post){
		return $http.post("/posts", post).success(function(data){
			object.posts.push(data)
		})
	}

	object.upvote = function(post){
		return $http.put("/posts/" + post._id + "/upvote").success(function(data){
			// this is because we don't copy that change, but we just added 1 to the post
			// in the database
			post.upvotes += 1
		})
	}

	object.downvote = function(post){
		return $http.put("/posts/" + post._id + "/downvote").success(function(data){
			post.upvotes -= 1
		})
	}

	object.getComments = function(id){
		return $http.get("/posts/" + id).then(function(res){
			return res.data
		})
	}

	object.addComment = function(id, comment){
		return $http.post("/posts/" + id + "/comments", comment)
	}

	object.commentUpvote = function(post, comment){
		return $http.put("/posts/" + post._id + "/comments/" + comment._id + "/upvote").success(function(data){
			comment.upvotes += 1
		})
	}

	object.commentDownvote = function(post, comment){
		return $http.put("/posts/" + post._id + "/comments/" + comment._id + "/downvote").success(function(data){
			comment.upvotes -= 1
		})
	}


	return object

}])

//$http for the server interaction and $window for localstorage interaction
app.factory("auth", ['$http', "$window", function($http, $window){
	var auth = {}

	auth.saveToken = function(token){
		$window.localStorage["Meddit-token"] = token
	}

	auth.getToken = function(){
		return $window.localStorage['Meddit-token']
	}

	auth.isLoggedIn = function(){
		var token = auth.getToken()

		if(token){
			//atob decodes a string of data that has been encoded using base-64 encoding
			// atob(encodeddata)
			// ascii to binary
			var payload = JSON.parse($window.atob(token.split('.')[1]))

			// when does the payload expire(exp)
			return payload.exp > Date.now()/1000
		}
		else{
			return false
		}
	}

	auth.currentUser = function(){
		if(auth.isLoggedIn()){
			var token = auth.getToken()
			// use the token to get teh payload
			var payload = JSON.parse($window.atob(token.split('.')[1]))

			return payload.username
		}
	}

	auth.register = function(user){
		return $http.post("/register", user).success(function(data){
			auth.saveToken(data.token)
		})
	}


	auth.login = function(user){
		return $http.post("/login", user).success(function(data){
			auth.saveToken(data.token)
		})
	}

	auth.logout = function(){
		$window.localStorage.removeItem("Meddit-token")
	}

	return auth;
}])


app.controller("MainCtrl", ['$scope', 'posts', function($scope, posts){
	$scope.posts = posts.posts

	$scope.addPost = function() {
		if(!$scope.title ||  $scope.title === ""){
			return
		}
		else{
			posts.create({title: $scope.title, link:$scope.link})
			$scope.title = ""
			$scope.link = ""
		}
	}

	$scope.upvote = function(post){
		posts.upvote(post)
	}

	$scope.downvote = function(post){
		posts.downvote(post)
	}


}])


app.controller("PostsCtrl", ['$scope', 'post', 'posts', function($scope, post, posts){
	$scope.post = post


	$scope.upvote = function(comment){
		posts.commentUpvote(post, comment)
	}
	$scope.downvote = function(comment){
		posts.commentDownvote(post, comment)
	}
	$scope.addComment = function(){
		if($scope.body === ''){
			return
		}
		posts.addComment(post._id, {
			body: $scope.body,
			author: 'user',
		}).success(function(comment){
			$scope.post.comments.push(comment)
			console.log("comment")
			console.log($scope.post)
		})
		$scope.body = ''

	}
}])


app.controller("AuthCtrl", ['$scope', '$state', 'auth', function($scope, $state, auth){
	$scope.user = []
	$scope.register = function(){
		auth.register($scope.user).error(function(error){
			$scope.error = error
		}).then(function(){
			//if there is an error, go to home
			$state.go("home")
		})
	}

	$scope.login = function(){
		auth.login($scope.user).error(function(error){
			$scope.error = error
		}).then(function(){
			$state.go("home")
		})
	}

}])
