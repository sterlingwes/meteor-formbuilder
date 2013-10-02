# Form Builder

## Configuration Options

options = {
    name:       "form_name_and_id",
    reqOnly:    false,
    proto:      Collection2modalInstance,
    buttons:    [{
        name:   'button_name',
        text:   'OK' || 'Save',
        classn: 'button-primary'
    }],
    routeTo:    '/go/here/when/done',
    itemId:     'itemReference',
    buttonText: 'OK',
    schema: {
        field: {
            input:  INPUT_TYPE,
            text:   'Text-only field (label)',
            label:  'Label instead of Key',
            opts:   OPTIONS_TYPE,
            show:   'field:value1|value2' // field is the one changing,
            disable:true // disable field
        }
    },
    values:     function() {
        return {
            field:  'value'
        };
    },
    onSubmit:   function() {
        // called before attempting processing
        return false; // return false to abort beforehand
    },
    onAfterSubmit: function(err,res) {
        // called with result of form submission operations (db result, err, etc)
    },
    whitelist: ['field1','field2'] // allowed fields
};