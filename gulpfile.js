var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var eslint = require('gulp-eslint');
var jasmine = require('gulp-jasmine-phantom');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');

gulp.task('default', ['copy-html', 'copy-data','copy-manifest','copy-bower', 'styles', 'lint', 'scripts'], function() {
	gulp.watch('js/**/*.js', ['lint', 'scripts']);
	gulp.watch('sw.js', ['lint', 'scripts']);
	gulp.watch('partials/**/*.html', ['copy-html']);
	gulp.watch('index.html', ['copy-html']);
	gulp.watch('style/*.css', ['styles']);
	gulp.watch('data/**/*.json', ['copy-data']);
	gulp.watch('data/**/*.csv', ['copy-data']);
	gulp.watch('./dist/sw.js').on('change', browserSync.reload);
	gulp.watch('./dist/index.html').on('change', browserSync.reload);
	gulp.watch('./dist/partials/*.html').on('change', browserSync.reload);
	gulp.watch('./dist/js/**/*.js').on('change', browserSync.reload);
	gulp.watch('./dist/style/*.css').on('change', browserSync.reload);
	browserSync.init({
		server: './dist'
	});
});

gulp.task('dist', [
	'copy-html',
	'copy-bower',
	'copy-data',
	'styles',
	'lint',
	'scripts-dist'
]);

gulp.task('scripts', function() {
	gulp.src('js/lib/*.js')
		.pipe(gulp.dest('dist/js/lib'));
	gulp.src('js/*.js')
		.pipe(concat('all.js'))
		.pipe(gulp.dest('dist/js'));
	gulp.src('sw.js')
		.pipe(gulp.dest('dist'));
});

gulp.task('scripts-dist', function() {
	gulp.src('js/lib/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('dist/js/lib'));
	gulp.src('js/*.js')
		.pipe(concat('all.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'));
	gulp.src('sw.js')
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
});

gulp.task('copy-html', function() {
	gulp.src('./index.html')
		.pipe(gulp.dest('./dist'));
	gulp.src('./partials/*.html')
		.pipe(gulp.dest('./dist/partials'));
});

gulp.task('copy-bower', function() {
	gulp.src('bower_components/**/*')
		.pipe(gulp.dest('./dist/bower_components'));
});

gulp.task('copy-manifest', function() {
	gulp.src('icons/*')
		.pipe(gulp.dest('./dist/icons'));
	gulp.src('manifest.json')
		.pipe(gulp.dest('./dist'));
});

gulp.task('copy-data', function() {
	gulp.src('data/*')
		.pipe(gulp.dest('dist/data'));
});

gulp.task('styles', function() {
	gulp.src('style/**/*.css')
		.pipe(gulp.dest('dist/style'))
		.pipe(concat('all.css'))
		.pipe(cleanCSS())
		.pipe(browserSync.stream());
});

gulp.task('lint', function () {
	return gulp.src(['js/**/*.js'])
		// eslint() attaches the lint output to the eslint property
		// of the file object so it can be used by other modules.
		.pipe(eslint())
		// eslint.format() outputs the lint results to the console.
		// Alternatively use eslint.formatEach() (see Docs).
		.pipe(eslint.format())
		// To have the process exit with an error code (1) on
		// lint error, return the stream and pipe to failOnError last.
		.pipe(eslint.failOnError());
});

gulp.task('tests', function () {
	gulp.src('tests/spec/extraSpec.js')
		.pipe(jasmine({
			integration: true,
			vendor: 'js/**/*.js'
		}));
});

gulp.task('ngdocs', [], function () {
  var gulpDocs = require('gulp-ngdocs');
  return gulp.src('js/*.js')
    .pipe(gulpDocs.process())
    .pipe(gulp.dest('./docs'));
});
