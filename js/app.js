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
.service('cheer', function() {
	return ({
		get: function() {
		var cheers= [
				'Awesome!',
				'Fantastic!',
				'Excellent',
				'Super!',
				'Way to go!',
				'You are a genius!'];
			return cheers[Math.floor(Math.random()*cheers.length)];
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
.service('questions', function() {
	return ({
		get: function() {
			//TODO: put in logic to select questions based on previous answers
			var number = Math.floor(Math.random()*10);
			return {
				question: 'Choose the number '+ number,
				answer: number,
				//TODO: generate better options
				options: [number, number+1, number+2]
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
.controller('QuizCtrl', ['cheer', 'questions', function(cheer, questions) {

	this.clicked = function(option) {
		if (option == this.question.answer)
		{
			alert(cheer.get());
			this.question = questions.get();
		}
		else
		{

		}
	}
	this.question = questions.get();
}]);