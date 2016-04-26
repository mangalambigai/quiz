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
angular.module('quizApp', ['ngRoute'])
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

        this.init = function() {
            questions.getList('data/' + $routeParams.id).then(function (list) {
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
 * Controller for service worker and its updates
 */
.controller('ServiceController', ['$scope', function ($scope) {

    /**
     * Starts the service worker
     */
    $scope.init = function () {
        $scope.newversion = false;
        if (!navigator.serviceWorker) return;

        var swpath = window.location.pathname + 'sw.js';

        console.log('pathname: ' + swpath);

        navigator.serviceWorker.register(swpath).then(function (
            reg) {
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

}]);