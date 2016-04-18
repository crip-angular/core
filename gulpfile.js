var gulp = require('gulp'),
    cripweb = require('cripweb');

cripweb(gulp)(function (crip) {
    crip.scripts('crip-core', ['**/*.module.js', '**/*.js'], 'build', true, 'src')
        .copy('publish-file-manager', 'build/*',
        '../../crip-laravel/boilerplate/packages/filemanager/bower_components/crip-angular-core/build')
        .copy('publish-crip-menu', 'build/*', '../crip-menu/bower_components/crip-angular-core/build');
});