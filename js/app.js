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
angular.module('quizApp', [])
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
            var symbols = ['✓', '❤', '🎈', '🌠', '👍', '🖒',
                '🌟', '😊', '🚀', '❀', '🌷', '🌹'
            ]
            return {
                message: cheers[Math.floor(Math.random() *
                    cheers.length)],
                symbol: symbols[Math.floor(Math.random() *
                    symbols.length)]
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
    var questionPools=[];
    //TODO: load a list of jsons to questionPools
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

    return ({
        get: function() {
            return poolpromise.then(function() {
                //TODO: select random/ sequential pool from questionPools
                var pool = questionPools[0];

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
                }

            });
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
    })
}])

/**
 * @ngdoc controller
 * @name QuizCtrl
 *
 * @description
 * Controller for the quiz page
 */
.controller('QuizCtrl', ['$scope', 'cheer', 'questions', function ($scope, cheer, questions) {
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
            thingToSay = this.message;
        } else {
            // Flash the correct answer
            thingToSay = this.question.answerPrompt;
            this.flashAnswer = true;
        }
        var msg = new SpeechSynthesisUtterance(thingToSay);
        msg.onend=function(e) {
            //After cheering, clear it, show the next question, and enable the buttons
            $scope.$apply(function() {
                vm.message = '';
                vm.symbol = '';
                vm.disableButtons = false;
                vm.flashAnswer = false;
                questions.get().then(function(res) {
                    $scope.$apply(function() {
                        vm.question = res;
                    });
                    var msg1 = new SpeechSynthesisUtterance(vm.question.question);
                    window.speechSynthesis.speak(msg1);
                });
            });
        };
        window.speechSynthesis.speak(msg);
    }

    questions.get().then(function(res) {
        $scope.$apply(function() {
             vm.question = res;
        });
    });
}]);