Template.formBuilder_optionchanger.helpers({
    
    options: function(strArr) {
        try {
            return JSON.parse(strArr).join(', ');
        }
        catch(e) { return; }
    }
    
});

Template.formBuilder_optionchanger.events({
    
    'click button': function(event) {
        var name = event.target.name.replace(/\_add$/,'').replace(/\./,'\\.'),
            input = '#'+name+'_input',
            list = '#'+name+'_options',
            hidden = '#'+name,
            hiddenel = $(hidden),
            inputel = $(input),
            listel = $(list),
            options = hiddenel.val ? JSON.parse(hiddenel.val()||'[]') : [];
        
        var val = parseInt(inputel.val());
        if(!_.isNumber(val)) return;
        options.push(val);
        inputel.val('');
        options = _.uniq(_.without(options, undefined,null,''));
        options.sort(function(a,b) { return a-b; });
        hiddenel.val(JSON.stringify(options));
        listel.html(options.join(', '));
    }
    
});