var gulp = require('gulp'),
    crip = require('cripweb');

crip.scripts([
        '**/*.module.js',
        '**/*.js'
    ],
    'crip-core',
    'scripts',
    'src',
    'build');

crip.copy(
    'build/*',
    '../../crip-laravel/boilerplate/packages/filemanager/bower_components/crip-angular-core/build',
    'publish-filem-anager');

gulp.task('default', function () {
    crip.gulp.start('crip-default');
    crip.watch();
});