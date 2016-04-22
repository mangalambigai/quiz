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
.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/quiz/:id', {
        templateUrl:'partials/quizthree.html',
        controller: 'QuizCtrl',
        controllerAs: 'quiz'
    })
    .when('/stickers', {
        templateUrl: 'partials/stickers.html',
        controller: 'StickerCtrl',
        controllerAs: 'sticker'
    })
    .when('/home', {
        templateUrl: 'partials/main.html'
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

            var icons=[
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
                icon: icons[Math.floor(Math.random()*icons.length)]
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
/*
//Use this while using multiple pools at a time
    var questionPools=[];
    var jsons = [
        'data/shapes.json',
        'data/numbers.json'
    ];
    var poolpromise = new Promise( function (resolve, reject) {
        Promise.all(jsons.map($http.get))
        .then(function(pools) {
            pools.forEach(function(pool){
                questionPools.push(pool.data);
            });
            resolve(questionPools);
        });
    });
*/
    return ({
        getList: function(jsonname) {
            return $http.get(jsonname);
        },
        get: function(pool) {
            //return poolpromise.then(function() {

                //get the number of questions in the selected pool
                var numQuestions = pool.length;
                //choose a random question
                var questionIndex = Math.floor(Math.random()*numQuestions);
                //hardcode 3 options for now, since option button width is 33%
                var optioncount = 3;

                var options = pool[questionIndex].options;
                if (!options)
                {
                    //There are no options specified in question.
                    //Select randomly from other answers.
                    options = [];
                    //make sure the correct answer is in the options!
                    options.push(pool[questionIndex].answer);
                    //Add some other answers

                    for (var i = 1; i < optioncount; i++) {
                        var findAnotherOption = true;
                        while (findAnotherOption) {
                            var opt = pool[Math.floor(Math.random() * numQuestions)].answer;
                            //if this option is already choosen, choose another one
                            findAnotherOption = false;
                            for (var j = 0; j < i; j++) {
                                if (opt === options[j])
                                    findAnotherOption = true;
                            }
                            if (!findAnotherOption)
                                options[i] = opt;
                        }
                    }
                    options = shuffle(options);
                }

                return {
                    question: pool[questionIndex].question,
                    answer: pool[questionIndex].answer,
                    options: options,
                    answerPrompt: pool[questionIndex].prompt
                };

            //});
        }
        /*
        get: function () {
            //TODO: get alphabets,
            //TODO: put in logic to select questions based on previous answers
            var number = Math.floor(Math.random() * 10);
            var optioncount = 3;
            var options = [];

            options[0] = number;
            for (var i = 1; i < optioncount; i++) {
                var findAnotherOption = true;
                while (findAnotherOption) {
                    var opt = Math.floor(Math.random() * 10);
                    //if this option is already choosen, choose another one
                    findAnotherOption = false;
                    for (var j = 0; j < i; j++) {
                        if (opt === options[j])
                            findAnotherOption = true;
                    }
                    if (!findAnotherOption)
                        options[i] = opt;
                }
            }
            options = shuffle(options);

            return {
                question: 'Choose the number ' + number,
                answer: number,
                options: options,
                answerPrompt: 'No, this is the number '+ number
            }
        }
        */
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
    this.disableButtons = false;
    this.flashAnswer = false;
    this.clicked = function (option) {
        this.disableButtons = true;
        var thingToSay = '';
        if (option == this.question.answer) {
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
        var msg = new SpeechSynthesisUtterance(thingToSay);
        msg.onend=function(e) {
            console.log('onend');
            //After cheering, clear it, show the next question, and enable the buttons
            $scope.$apply(function() {
                vm.message = '';
                vm.symbol = '';
                vm.disableButtons = false;
                vm.flashAnswer = false;
                vm.askNextQuestion();
            });
        };
        console.log('speaking');
        window.speechSynthesis.speak(msg);
    };

    this.askNextQuestion = function() {
        vm.question = questions.get(this.questionList);
        var msg1 = new SpeechSynthesisUtterance(vm.question.question);
        window.speechSynthesis.speak(msg1);
    };

    questions.getList('data/'+$routeParams.id).then(function(list) {
        vm.questionList = list.data;
        vm.askNextQuestion();
    });


}])

/**
 * @ngdoc controller
 * @name StickerCtrl
 *
 * @description
 * Controller for the sticker page
 */
.controller('StickerCtrl', ['$scope', function($scope) {
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

}]);