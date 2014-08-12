Package.describe({
    summary: "FormBuilder - form generator for Meteor"
});

Package.on_use(function(api) {
    
    api.use('standard-app-packages');
    api.use('external-file-loader');
    api.use('session-extras');
    
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
        
        'client/lib/formbuilder.js',
        
        'client/views/layout/form.html'
        
    ],'client');
    
});