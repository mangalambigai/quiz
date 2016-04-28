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
    .when('/stickers', {
        templateUrl: 'partials/stickers.html',
        controller: 'StickerCtrl',
        controllerAs: 'sticker'
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
 * @name StickerCtrl
 *
 * @description
 * Controller for the sticker page
 */
.controller('StickerCtrl', ['$scope', function ($scope) {
    /*    //These are cool unicodes, but safari displays them really small,
        //so I am not going to use them for now
        this.stickers = ['🐄','🐇','🐈','🐞','🐟','🐠','🐡','🐢','🐣',
        '🐤','🐥','🐦','🐧'];
        //more sticker options
        //,'🐅','🐆','🐉','🐊','🐋','🐌','🐍','🐎','🐏','🐐','🐑',
        //'🐒','🐓','🐔','🐕','🐖','🐗','🐘','🐙','🐚','🐛','🐜','🐝','🐨','🐩','🐪','🐫','🐬','🐭','🐮','🐯','🐰','🐱','🐲','🐳','🐴',
        //'🐵','🐶','🐷','🐸','🐹', '🐺', '🐻', '🐼'];
        this.currstickers = [];
        this.pick = function(sticker) {
            this.currstickers.push({id: this.currstickers.length, sticker: sticker});
        };
        */

    //Font awesome sticker choices:
    /*
       fa-futbol-o
       fa-bicycle
       fa-truck
       fa-trophy
       heart
       heart-o
       smile-o
       fa-star
       rocket
       paw
       */
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
        swfactory.startsw();
        /*
        if (!navigator.serviceWorker) return;

        var swpath = window.location.pathname + 'sw.js';

        console.log('pathname: ' + swpath);

        navigator.serviceWorker.register(swpath).then( function (reg) {
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

            reg.addEventListener('updatefound',
                function () {
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
          */
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
            navigator.serviceWorker.register('sw.js').then(function () {
                return navigator.serviceWorker.ready;
            }).then(function (serviceWorkerRegistration) {
                reg = serviceWorkerRegistration;
                swfactory.enablePush = true;
                console.log('Service Worker is ready :^)',
                    reg);
            }).catch(function (error) {
                console.log('Service Worker Error :^(',
                    error);
            });
            //TODO: use initialiseState to set current subscription status
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
        navigator.serviceWorker.ready.then(function (
            serviceWorkerRegistration) {
            // Do we already have a push message subscription?
            serviceWorkerRegistration.pushManager.getSubscription()
                .then(function (subscription) {
                    // Enable any UI which subscribes / unsubscribes from
                    // push messages.
                    this.enableSubscribe = false;

                    if (!subscription) {
                        // We aren't subscribed to push, so set UI
                        // to allow the user to enable push
                        return;
                    }

                    // Keep your server in sync with the latest subscriptionId
                    sendSubscriptionToServer(
                        subscription);

                    // Set your UI to show they have subscribed for
                    // push messages
                    this.buttonText =
                        'Disable Push Messages';
                    isPushEnabled = true;
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
        reg.pushManager.subscribe({
            userVisibleOnly: true
        }).
        then(function (pushSubscription) {
            sub = pushSubscription;
            console.log('Subscribed! Endpoint:', sub.endpoint);
            swfactory.isSubscribed = true;
            //save endpoint in a server
            var endpoint = sub.endpoint.substr(sub.endpoint.lastIndexOf('/')+1);
            endpoints.$add(endpoint);
        });
    };

    //unsubscribes from push
    swfactory.unsubscribe = function () {
        sub.unsubscribe().then(function (event) {
            console.log('Unsubscribed!', event);
            swfactory.isSubscribed = false;
            //TODO: remove endpoint from server
            //endpoints.$remove();
        }).catch(function (error) {
            console.log('Error unsubscribing', error);
            //subscribeButton.textContent = 'Subscribe';
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

    this.isSubscribed = false;
    this.save = function () {

    };

    this.init = function () {
        //TODO: set initial state of push notifications
        this.enableSubscribe = true; //swservice.getEnablePush();
        this.buttonText = "Subscribe";
    };


    this.subscribe = function () {
        //TODO: handle current state of subscription
        this.enableSubscribe = false;
        swfactory.subscribe();
        this.enableSubscribe = true;
        /*
        // Disable the button so it can't be changed while
        //   we process the permission request
        this.enableSubscribe = true;

        navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
        serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
            .then(function(subscription) {
                // The subscription was successful
                isPushEnabled = true;
                this.buttonText = 'Disable Push Messages';
                this.enableSubscribe = false;

                // TODO: Send the subscription subscription.endpoint
                // to your server and save it to send a push message
                // at a later date
                return sendSubscriptionToServer(subscription);
            })
            .catch(function(e) {
                if (Notification.permission === 'denied') {
                  // The user denied the notification permission which
                  // means we failed to subscribe and the user will need
                  // to manually change the notification permission to
                  // subscribe to push messages
                  window.Demo.debug.log('Permission for Notifications was denied');
                  this.enableSubscribe = true;
                } else {
                  // A problem occurred with the subscription, this can
                  // often be down to an issue or lack of the gcm_sender_id
                  // and / or gcm_user_visible_only
                  window.Demo.debug.log('Unable to subscribe to push.', e);
                  this.enableSubscribe = false;
                  this.buttonText = 'Enable Push Messages';
                }
            });
          });
        */
    }

    //TODO: this will probably go into the swfactory
    this.unsubscribe = function () {
        swfactory.unsubscribe();
        /*  this.enableSubscribe = true;

          navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
            // To unsubscribe from push messaging, you need get the
            // subscription object, which you can call unsubscribe() on.
            serviceWorkerRegistration.pushManager.getSubscription()
              .then(function(pushSubscription) {
                // Check we have a subscription to unsubscribe
                if (!pushSubscription) {
                  // No subscription object, so set the state
                  // to allow the user to subscribe to push
                  isPushEnabled = false;
                  this.enableSubscribe = false;
                  this.buttonText = 'Enable Push Messages';
                  return;
                }

                // TODO: Make a request to your server to remove
                // the users data from your data store so you
                // don't attempt to send them push messages anymore

                // We have a subscription, so call unsubscribe on it
                pushSubscription.unsubscribe()
                  .then(function(successful) {
                    this.enableSubscribe = false;
                    this.buttonText = 'Enable Push Messages';
                    isPushEnabled = false;
                  }).catch(function(e) {
                    // We failed to unsubscribe, this can lead to
                    // an unusual state, so may be best to remove
                    // the users data from your data store and
                    // inform the user that you have done so

                    console.log('Unsubscription error: ', e);
                    this.enableSubscribe = false;
                    this.buttonText = 'Enable Push Messages';
                  });
              }).catch(function(e) {
                console.error('Error thrown while unsubscribing from push messaging.', e);
              });
          });
        */
    }
}])
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