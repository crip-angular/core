var gulp = require('gulp'),
    cripweb = require('cripweb');


cripweb.scripts([
        '**/*.module.js',
        '**/*.js'
    ],
    'angular-script-core',
    'scripts',
    'resources',
    'build');

gulp.task('default', function () {
    cripweb.gulp.start('crip-default');
    cripweb.watch();
});