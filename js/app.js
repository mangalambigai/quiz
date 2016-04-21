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
.service('questions', function () {
    return ({
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
    })
})

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
                vm.question = questions.get();
                vm.disableButtons = false;
                vm.flashAnswer = false;
            });
            var msg1 = new SpeechSynthesisUtterance(vm.question.question);
            window.speechSynthesis.speak(msg1);
        };
        window.speechSynthesis.speak(msg);
    }

    this.question = questions.get();
}]);