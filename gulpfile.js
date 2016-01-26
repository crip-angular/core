var gulp = require('gulp'),
    cripweb = require('cripweb');

cripweb.scripts([
        '**/*.module.js',
        '**/*.js'
    ],
    'crip-core',
    'scripts',
    'resources',
    'build');

gulp.task('default', function () {
    cripweb.gulp.start('crip-default');
    cripweb.watch();
});