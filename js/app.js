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
                options: options
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
.controller('QuizCtrl', ['cheer', 'questions', function (cheer, questions) {

    this.clicked = function (option) {
        if (option == this.question.answer) {
            var cheerMsg = cheer.get();
            this.message = cheerMsg.message;
            this.symbol = cheerMsg.symbol;
            this.question = questions.get();
        } else {
            //TODO: Flash the correct answer
        }
    }
    this.question = questions.get();
}]);