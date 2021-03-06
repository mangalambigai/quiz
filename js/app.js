//util function to shuffle array
function shuffle(arr) {
    var len = arr.length;
    var randomArr = [];
    for (var i = 0; i < len; i++) {
        var index = Math.floor(Math.random() * arr.length);
        randomArr.push(arr[index]);
        arr.splice(index, 1);
    }
    return randomArr;
}

/**
 * @ngdoc object
 * @name quizApp
 * @requires
 */
angular.module('quizApp', ['ngRoute', 'firebase'])
.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
    .when('/quiz/:id', {
        templateUrl: 'partials/quizthree.html',
        controller: 'QuizCtrl',
        controllerAs: 'quiz'
    })
    .when('/home', {
        templateUrl: 'partials/main.html',
        controller: 'MainCtrl',
        controllerAs: 'menu'
    })
    .when('/parents', {
        templateUrl: 'partials/parents.html',
        controller: 'ParentCtrl',
        controllerAs: 'settings'
    })
    .when('/pushtest', {
        templateUrl: 'partials/pushtest.html',
        controller: 'PushTestCtrl',
        controllerAs: 'pushtest'
    })
    .otherwise({
        redirectTo: '/home'
    });
}])
/**
 * @ngdoc service
 * @name cheer
 *
 * @description
 * Gets randomly generated cheers
 */
.service('cheer', function () {
    return ({
        get: function () {
            var cheers = [
                'Awesome!!!',
                'Fantastic!',
                'Excellent!!',
                'Super!',
                'Way to go!',
                'You are a genius!'
            ];

            var icons = [
                'fa-check',
                'fa-thumbs-o-up',
                'fa-thumbs-up',
                'fa-trophy',
                'fa-heart',
                'fa-heart-o',
                'fa-smile-o',
                'fa-star',
                'fa-rocket',
                'fa-paw'
            ];

            var symbols = ['✓', '❤', '🎈', '🌠', '👍', '🖒',
                '🌟', '😊', '🚀', '❀', '🌷', '🌹'
            ];
            return {
                message: cheers[Math.floor(Math.random() *
                    cheers.length)],
                symbol: symbols[Math.floor(Math.random() *
                    symbols.length)],
                icon: icons[Math.floor(Math.random() *
                    icons.length)]
            };
        }
    });
})
/**
 * @ngdoc service
 * @name questions
 *
 * @description
 * Gets randomly generated questions
 */
.service('questions', ['$http', function ($http) {
    return ({

        //gets the list from a json file
        getList: function (jsonname) {
            return $http.get(jsonname);
        },

        //gets a randomly chosen question from a pool of questions
        get: function (pool) {
            //get the number of questions in the selected pool
            var numQuestions = pool.length;
            //choose a random question
            var questionIndex = Math.floor(Math.random() *
                numQuestions);
            //hardcode 3 options for now, since option button width is 33%
            var optioncount = 3;

            var options = pool[questionIndex].options;
            if (!options) {
                //There are no options specified in question.
                //Select randomly from other answers.
                options = [];
                //make sure the correct answer is in the options!
                options.push(pool[questionIndex].answer);
                //Add some other answers

                for (var i = 1; i < optioncount; i++) {
                    var findAnotherOption = true;
                    while (findAnotherOption) {
                        var opt = pool[Math.floor(Math.random() *
                            numQuestions)].answer;
                        //if this option is already choosen, choose another one
                        findAnotherOption = false;
                        for (var j = 0; j < i; j++) {
                            if (opt === options[j])
                                findAnotherOption =
                                true;
                        }
                        if (!findAnotherOption)
                            options[i] = opt;
                    }
                }
                //shuffle the options so the answer is not first everytime
                options = shuffle(options);
            }

            return {
                question: pool[questionIndex].question,
                answer: pool[questionIndex].answer,
                questionprompt: pool[questionIndex].questionprompt,
                options: options,
                answerPrompt: pool[questionIndex].prompt
            };
        }
    });
}])

/**
 * @ngdoc controller
 * @name QuizCtrl
 *
 * @description
 * Controller for the quiz page
 */
.controller('QuizCtrl', ['$scope', '$routeParams', 'cheer', 'questions',
    function ($scope, $routeParams, cheer, questions) {
        var vm = this;

        //SpeechSynthesisUtterance should not be local variable,
        //or when it goes out of scope, end event does not fire
        this.speechAnswer = new SpeechSynthesisUtterance();
        this.speechQuestion = new SpeechSynthesisUtterance();
        this.disableButtons = false;
        this.flashAnswer = false;

        //handles answer click event
        this.clicked = function (option) {
            this.score.attempted++;
            //disable the buttons so user has to wait for cheering, or reading correct answer
            this.disableButtons = true;
            var thingToSay = '';
            if (option == this.question.answer) {
                this.score.correct++;
                //when a correct answer is clicked
                //create a cheer and say it
                var cheerMsg = cheer.get();
                this.message = cheerMsg.message;
                this.symbol = cheerMsg.symbol;
                this.icon = cheerMsg.icon;
                thingToSay = this.message;
            } else {
                // Flash the correct answer
                thingToSay = this.question.answerPrompt;
                this.flashAnswer = true;
            }
            //say the cheer/ correct answer, but set the end handler before saying it
            vm.speechAnswer.text = thingToSay;
            vm.speechAnswer.onend = function (e) {
                //After cheering, clear it, show the next question, and enable the buttons
                $scope.$apply(function () {
                    vm.message = '';
                    vm.symbol = '';
                    vm.disableButtons = false;
                    vm.flashAnswer = false;
                    vm.askNextQuestion();
                });
            };
            window.speechSynthesis.speak(vm.speechAnswer);
        };

        this.askNextQuestion = function () {
            vm.question = questions.get(this.questionList);
            vm.speechQuestion.text = vm.question.question;
            window.speechSynthesis.speak(vm.speechQuestion);
        };

        this.score = {
            correct: 0,
            attempted: 0
        };

        this.init = function () {
            questions.getList('data/' + $routeParams.id).then(
                function (list) {
                    vm.questionList = list.data;
                    vm.askNextQuestion();
                });
        };


    }
])

/**
 * @ngdoc controller
 * @name MainCtrl
 *
 * @description
 * Controller for the landing page
 */
.controller('MainCtrl', ['questions', function (questions) {
    var vm = this;
    questions.getList('data/list.json').then(function (response) {
        vm.menuItems = response.data;
    });
}])

/**
 * @ngdoc controller
 * @name ServiceController
 *
 * @description
 * Controller for service worker updates
 */
.controller('ServiceController', ['$scope', 'swfactory',
    function ($scope, swfactory) {
    /**
     * Starts the service worker
     */
    $scope.init = function () {
        $scope.newversion = false;
        swfactory.startsw()
        .then(function (reg) {
            if (!navigator.serviceWorker.controller) {
                return;
            }

            if (reg.waiting) {
                $scope.updateReady(reg.waiting);
                return;
            }

            if (reg.installing) {
                $scope.trackInstalling(reg.installing);
                return;
            }

            reg.addEventListener('updatefound', function () {
                $scope.trackInstalling(reg.installing);
            });
        });
        // Ensure refresh is only called once.
        // This works around a bug in "force update on reload".
        var refreshing;
        navigator.serviceWorker.addEventListener(
            'controllerchange',
            function () {
                if (refreshing) return;
                window.location.reload();
                refreshing = true;
            });
    };

    /**
     * When a worker is installed, display prompt
     */
    $scope.trackInstalling = function (worker) {
        worker.addEventListener('statechange', function () {
            if (worker.state == 'installed') {
                $scope.updateReady(worker);
            }
        });
    };


    /**
     * When a worker is installed, display prompt
     */
    $scope.updateReady = function (worker) {
        $scope.$apply(function () {
            $scope.readyWorker = worker;
            $scope.newUpdateReady = true;
        });
    };

    /**
     * When user wants to upgrade, tell the worker to skip waiting
     */
    $scope.update = function () {
        $scope.readyWorker.postMessage({
            action: 'skipWaiting'
        });
    };

}])
/**
 * @ngdoc factory
 * @name swfactory
 *
 * @description
 * Handles the service worker instantiation and subscription.
 */
.factory('swfactory', ['endpoints', function (endpoints) {
    var swfactory = {
        enablePush: false,
        isSubscribed: false
    };

    /*
     * start the serviceworker
     */
    swfactory.startsw = function () {
        if ('serviceWorker' in navigator) {
            console.log('Service Worker is supported');

            //don't just register sw.js, take the path into account.
            //this will register sw while running from github pages
            var swpath = window.location.pathname + 'sw.js';
            console.log('pathname: ' + swpath);

            return navigator.serviceWorker.register(swpath).then(function () {
                return navigator.serviceWorker.ready;
            }).then(function (serviceWorkerRegistration) {
                swfactory.reg = serviceWorkerRegistration;
                swfactory.enablePush = true;
                console.log('Service Worker is ready :^)', swfactory.reg);

                return swfactory.initialiseState();
            }).then(function(){
                return swfactory.reg;
            }).catch(function (error) {
                console.log('Service Worker Error :^(', error);
            });
        }
    };

    // Once the service worker is registered set the initial state
    swfactory.initialiseState = function () {
        // Are Notifications supported in the service worker?
        if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
            console.warn('Notifications aren\'t supported.');
            return;
        }

        // Check the current Notification permission.
        // If its denied, it's a permanent block until the
        // user changes the permission
        if (Notification.permission === 'denied') {
            console.warn('The user has blocked notifications.');
            return;
        }

        // Check if push messaging is supported
        if (!('PushManager' in window)) {
            console.warn('Push messaging isn\'t supported.');
            return;
        }

        // We need the service worker registration to check for a subscription
        return navigator.serviceWorker.ready.then(function (
            serviceWorkerRegistration) {
            // Do we already have a push message subscription?
            serviceWorkerRegistration.pushManager.getSubscription()
                .then(function (subscription) {
                    // Enable any UI which subscribes / unsubscribes from
                    // push messages.
                    swfactory.enablePush = true;

                    if (!subscription) {
                        // We aren't subscribed to push, so set UI
                        // to allow the user to enable push
                        swfactory.isSubscribed = false;
                        return;
                    }

                    swfactory.sub = subscription;
                    swfactory.isSubscribed = true;
                    //save endpoint for unsubscribing
                    swfactory.endpoint = swfactory.sub.endpoint.substr(swfactory.sub.endpoint.lastIndexOf('/')+1);
                    console.log('already Subscribed! Endpoint:', swfactory.endpoint);

                    // Set your UI to show they have subscribed for
                    // push messages
                    swfactory.isSubscribed = true;
                })
                .catch(function (err) {
                    console.warn(
                        'Error during getSubscription()',
                        err);
                });
        });
    }

    //returns if push is allowed
    swfactory.getEnablePush = function () {
        return this.enablePush;
    };

    //subscribes to push notification
    swfactory.subscribe = function () {
        return this.reg.pushManager.subscribe({
            userVisibleOnly: true
        })
        .then(function (pushSubscription) {
            swfactory.sub = pushSubscription;
            console.log('Subscribed! Endpoint:', swfactory.sub.endpoint);
            swfactory.isSubscribed = true;
            //save endpoint in a server
            swfactory.endpoint = swfactory.sub.endpoint.substr(swfactory.sub.endpoint.lastIndexOf('/')+1);
            endpoints.$add(swfactory.endpoint)
            .then(function(param) {
                swfactory.firebaseKey = param.key();
            });
        })
        .catch(function(e) {
            if (Notification.permission === 'denied') {
                // The user denied the notification permission which
                // means we failed to subscribe and the user will need
                // to manually change the notification permission to
                // subscribe to push messages
                console.log('Permission for Notifications was denied');
                swfactory.enableSubscribe = false;
            } else {
                // A problem occurred with the subscription, this can
                // often be down to an issue or lack of the gcm_sender_id
                // and / or gcm_user_visible_only
                console.log('Unable to subscribe to push.', e);
                swfactory.enableSubscribe = true;
                swfactory.isSubscribed = false;
            }
        });
    };

    //unsubscribes from push
    swfactory.unsubscribe = function () {
        return swfactory.sub.unsubscribe().then(function (event) {
            console.log('Unsubscribed from service worker!', event);
            swfactory.isSubscribed = false;
            //remove endpoint from server
            if (!swfactory.firebaseKey)
            {
                endpoints.forEach (function(val) {
                    if (val.$value== swfactory.endpoint)
                        swfactory.firebaseKey = val.$id;
                });
            }

            if (swfactory.firebaseKey)
                endpoints.$remove(endpoints.$indexFor(swfactory.firebaseKey))
            .then(function(param) {
                console.log('Removed subscription endpoint from firebase');
            })
            .catch(function(error) {
                console.log(error);
            });
        }).catch(function (error) {
            console.log('Error unsubscribing', error);
            swfactory.isSubscribed = false;
        });
    };

    //returns current subscription status
    swfactory.getSubscription = function () {
        return swfactory.isSubscribed;
    }

    return swfactory;
}])
/**
 * @ngdoc controller
 * @name ParentCtrl
 *
 * @description
 * Controller for settings page to be used by parents
 */
.controller('ParentCtrl', ['$scope', 'swfactory', function ($scope,
    swfactory) {
    vm = this;
    this.isSubscribed = false;
    this.save = function () {

    };

    this.init = function () {
        //set initial state of push notifications
        this.enableSubscribe = swfactory.getEnablePush();
        this.isSubscribed = swfactory.getSubscription();
    };


    this.subscribe = function () {
        // handle current state of subscription
        this.enableSubscribe = false;
        swfactory.subscribe()
        .then(function() {
            vm.isSubscribed = swfactory.getSubscription();
        });

        this.enableSubscribe = true;
    }

    this.unsubscribe = function () {
        this.enableSubscribe = false;
        swfactory.unsubscribe()
        .then(function() {
            vm.isSubscribed = swfactory.getSubscription();
        });

        this.enableSubscribe = true;
    }
}])
/**
 * @ngdoc service
 * @name endpoints
 *
 * @description
 * handles storing the push endpoints in firebase
 */
.service('endpoints', function($firebaseArray) {
    var ref = new Firebase("https://flickering-torch-1240.firebaseio.com/endpoints/");
    // create a synchronized array
    return $firebaseArray(ref);
})
/**
 * @ngdoc controller
 * @name PushTestCtrl
 *
 * @description
 * Shows curl command to run in terminal- to demonstrate push notifications
 */
.controller('PushTestCtrl', ['endpoints', function( endpoints ) {
    // create a synchronized array
    this.endpoints = endpoints;
}]);