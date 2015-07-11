Package.describe({
    name: "formbuilder",
    description: "Widget",
    summary: "FormBuilder - form generator for Meteor",
    author: "Wes Johnson",
    version: "0.1.1",
    git: "http://github.com/sterlingwes/meteor-formbuilder"
});

Package.on_use(function(api) {

    api.versionsFrom('1.0');
    api.use('templating','client');

    api.use(['ui','session','deps'],'client'); 
    api.use('mrt:external-file-loader','client');
    api.use('session-extras','client');
    api.use('jeremy:selectize','client');
    
    api.export('FormBuilder','client');
    
    api.add_files([
        'client/views/helpers.js',
        
        'client/views/fields/fb_checkbox.html',
        'client/views/fields/fb_input.html',
        'client/views/fields/fb_select.html',
        'client/views/fields/fb_sortable.html',
        'client/views/fields/fb_text.html',
        'client/views/fields/fb_textarea.html',
        'client/views/fields/fb_wysiwyg.html',
        'client/views/fields/fb_optionchanger.html',
        
        'client/views/fields/fb_optionchanger.js',
        
        'client/views/fields/fields.js',
        'client/views/fields/selectize.css',
        
        'client/lib/formbuilder.js',
        
        'client/views/layout/form.html'
        
    ],'client');
    
});
