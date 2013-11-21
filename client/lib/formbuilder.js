FormBuilder = (function() {

    var charNumsOnly = /^[a-z0-9\s]*$/,
        
        TEXT=           1,
        SELECT=         2,
        CHECKBOX=       3,
        SELECTMULTI=    4,
        DATE=           5,
        TEXTAREA=       6,
        WYSIWYG=        7,
        TYPEAHEAD=      8,
        PASSWORD=       9,
        DATETIME=       12,
        EMAIL=          13,
        PHONE=          14,
        NUMBER=         15,
        WEBURL=         16,
        RADIO=          17,
        MULTITEXT=      18,
        SORTABLE=       19,
		FILE=			100,
        
        getFieldTpl = function(code) {
            if(typeof code === "string")    return code;
            switch(code) {
                case DATE:
                case DATETIME:
                    return 'datepicker';
                case MULTITEXT:
                    return 'multioption';
                    
                case TEXTAREA:
                    return 'formBuilder_textarea';
                case SELECT:
                case SELECTMULTI:
                    return 'formBuilder_select';
                case CHECKBOX:  
                    return 'formBuilder_checkbox';
                case SORTABLE:
                    return 'formBuilder_sortable';
                case WYSIWYG:
                    return 'formBuilder_wysiwyg';
                    
                case TEXT:
                case TYPEAHEAD:
                case PASSWORD:
                case EMAIL:
                case NUMBER:
                case PHONE:
                case WEBURL:
				case FILE:
                default:
                    return 'formBuilder_input';
    
            }
        },
        
        optionStore = {},
        
        // adds options
        
        addOptions = function(key,fn) {
            if(typeof key === "object")
                _.each(key, function(fn, hashkey) {
                    if(typeof fn === "function")    optionStore[hashkey] = fn;
                    else    console.log.warn('Option handler for key "'+hashkey+'" not added. Handler must be a function.');
                });
            else if(typeof key === "string" && typeof fn === "function")
                optionStore[key] = fn;
            else
                console.warn('Invalid option handler received.', key, fn);
        },
            
        // interface for declaring form options & how they're retrieved
        
        getFormOpts = function(key) {
            if(!optionStore[key])
                return console.error('No form options handler found for key: '+key);
            
            var opts = optionStore[key]();
            if(!_.isArray(opts))    return [];
            else                    return opts;
        },
        
        // db response handler
        
        responseHandler = function(err, idOrRes) {
            if(typeof err === "string")
                err = {
                    reason: err
                };
            if(err) {
                var errTxt = err ? err.reason || err.message : 'Unknown Error Encountered';
                if(err.invalid) {
                    Session.set('formerror', err.invalid);
                    return;
                } else if(err.error == 403) {
                    Toast.error('Sorry, you don\'t have permission to do this.');
                    if(typeof Modal === "object" && Modal && typeof Modal.close === "function")
                        Modal.close();
                    return;
                }
                console.error(errTxt,err);
                Toast.error(errTxt);
            }
            else {
                if(typeof Modal === "object" && Modal && typeof Modal.close === "function")
                    Modal.close();
                Session.set('formerror', undefined);
                this.btns.removeAttr('disabled');
                if(this.cfg.buttonDone) {
                    var btn = $(this.btns[0]),
                        init = btn.html();
                    btn.html(this.cfg.buttonDone);
                    Meteor.setTimeout(function() {
                        if(jQuery.contains(document.documentElement, btn[0]))
                            btn.html(init);
                    }, 5000);
                }
            }
            if(this.cfg && typeof this.cfg.onAfterSubmit === "function")
                this.cfg.onAfterSubmit(err,this.data, idOrRes);
        },

        // from http://stackoverflow.com/questions/7753448/how-do-i-escape-quotes-in-html-attribute-values        
        quoteAttr = function(s, preserveCR) {
            preserveCR = preserveCR ? '&#13;' : '\n';
            return ('' + s)
                .replace(/&/g, '&amp;')
                .replace(/'/g, '&apos;')
                .replace(/"/g, '&quot;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\r\n/g, preserveCR)
                .replace(/[\r\n]/g, preserveCR);
        },
        
        unquoteAttr = function(s) {
            s = ('' + s);
            s = s
                .replace(/\r\n/g, '\n') /* To do before the next replacement. */ 
                .replace(/[\r\n]/, '\n')
                .replace(/&#13;&#10;/g, '\n') /* These 3 replacements keep whitespaces. */
                .replace(/&#1[03];/g, '\n')
                .replace(/&#9;/g, '\t')
                .replace(/&gt;/g, '>') /* The 4 other predefined entities required. */
                .replace(/&lt;/g, '<')
                .replace(/&quot;/g, '"')
                .replace(/&apos;/g, "'");
            
            s = s.replace(/&amp;/g, '&');
            return s;
        },
        
        getFormData = function(form) {
            
            if(!form || !form.length)   return {};
            
            var vals = form.serialize(),
                data = {};
				
			// check for file inputs
			var filesin = $('input[type=file]');
			if(filesin.length)
				_.each(filesin.get(), function(inp) {
					if(inp.files)	data[inp.name] = inp.files;
				});
    
            _.each(vals.split('&'),function(v) {
                var pair = v.split('=');
                if(data[pair[0]] && !_.isArray(data[pair[0]])) {
                    data[pair[0]] = [data[pair[0]]];
                }
                else if(!data[pair[0]])
                  data[pair[0]] = pair[1] ? decodeURIComponent(pair[1].replace(/\+/g,' ')) : undefined;
                
                if(_.isArray(data[pair[0]]))
                    data[pair[0]].push((pair[1] ? decodeURIComponent(pair[1].replace(/\+/g,' ')) : undefined));
            });
            
            return data;
        },
        
        init = function() {
            
            Template.formBuilder.helpers({
                
                // allows us to define css styling on the form element
                
                formClass: function() {
                    return this.formClass || 'pure-form-aligned';
                },
                
                // handles rendering form errors for the specified field name
                // session format is an array of objects with "name" and "message keys"
                
                formerror: function(field) {
                    var errors = Session.get('formerror');
                    if(typeof field !== "string" && _.isArray(errors) && errors.length)
                        return true;
                    
                    var indexed = _.isArray(errors) ? _.groupBy(errors, 'name') : {};
                    return _.map(indexed[field], function(errOb) {
                        if(errOb.message=="Round undefined")
                            return {message:"Round contained invalid characters.",name:"round"};
                        return errOb;
                    });
                },
                
                // determines the fields to show from the provided schema / whitelist
                // optional fields are ignored if "reqOnly=true", as are fields with no input types
                
                fields: function() {
                    var that = this,
                        schema = this.proto && this.proto._simpleSchema && this.proto._simpleSchema._schema,
                        whitelist = typeof this.whitelist === "function" ? this.whitelist() : this.whitelist;
            
                    if(schema || this.schema) {
                        var keys;
                        schema = _.extend(_.clone(schema || {}), _.clone(this.schema));
                        keys = _.keys(schema);
                        
                        return _.filter(_.map(keys, function(key) {
                            var augment = {
                                name:   key
                            };
                            if(!schema[key].label)  augment.label = SixUtils.toProper(key);
                            return _.extend(schema[key], augment);
                        }), function(f) {
                            if(whitelist && whitelist.indexOf(f.name)==-1)
                                return false;
                            if(that.reqOnly)
                                return !!f.input && !f.optional;
                            return !!f.input || !!f.text;
                        });
                    } else
                        return false;
                },
                
                // build the button list for our form from those provided or the buttonText label override
                
                button: function() {
                    if(!this.buttons)
                        return [{
                            name:   this.name,
                            text:   this.buttonText || 'Save',
                            classn: 'pure-button-primary'
                        }];
                    else
                        return this.buttons;
                },
                
                // determine if a field is showable (if an option list has only one option it's hidden
                // with the value set to the one option value
                
                fieldShow: function(parent) {
                    if([SixC.Forms.SELECT,SixC.Forms.SELECTMULTI].indexOf(this.input) != -1 && !this.showAnyway) {
                        return getFormOpts(this.opts).length > 1;
                    }
                    return true;
                },
                
                // picks the only option value if fieldShow returns false
                
                getOnlyValue: function(parent) {
                    var options = getFormOpts(this.opts);
                    if(options.length && _.isObject(options[0]) && (options[0].value||typeof options[0].value === "string")) {
                        return options[0].value;
                    } else if(options.length)
                        return options[0];
                },
                
                // core logic for building our form fields
                // - field: current field we're building
                // - parent: the context object passed to formBuilder
                
                buildInput: function(field,parent) {
                    
                    var ret = '',
                        fieldContext = _.extend({}, field);
                    
                    if(!field.input && field.text) {
                        fieldContext.value = new Handlebars.SafeString(field.text);
                        return new Handlebars.SafeString(Template['formBuilder_text'](fieldContext));
                    }
                    else if(!field.input)
                        return; // don't continue if there's no field type otherwise
                    
                    var vals = parent && "values" in parent ? parent.values||{} : {};
                    if(typeof vals === "function")  vals = vals() || {};
            
                    if(vals[field.name])    fieldContext.value = vals[field.name];
                    if(!fieldContext.label) fieldContext.label = field.name;
                    if(field.__isFirst)     fieldContext.autofocus = "autofocus";
                    if(field.multi)         fieldContext.multiple = "multiple";
                    
                    if(typeof field.hint === "string")
                        fieldContext.hint = quoteAttr(field.hint);
                    
                    switch(field.input) {
                        
                        // all use base input field with unique type
                        case TEXT:
                            fieldContext.type = "text";
                            break;
                        case DATE:
                        case DATETIME:
                            _.extend(fieldContext, {
                                type:   "text",     // consider using native (check first)
                                classn: field.input==DATETIME ? "datetimepicker" : "datepicker"
                            });
							fieldContext.value = fieldContext.value ? moment(fieldContext.value).format('YYYY/M/D h:mm a') : '';
                            break;
                        case PASSWORD:
                            fieldContext.type = "password";
                            break;
                        case NUMBER:
                            fieldContext.type = "number";
                            break;
                        case EMAIL:
                            fieldContext.type = "email";
                            break;
                        case PHONE:
                            fieldContext.type = "phone";
                            break;
                        case WEBURL:
                            fieldContext.type = "url";
                            break;
                        case FILE:
                            fieldContext.type = "file";
                            break;
							
                        case WYSIWYG:
                            fieldContext.field = new Handlebars.SafeString(Template.wysiwyg_editor(fieldContext));
                            break;
                            
                        case SORTABLE:
                            var sortablelist = getFormOpts(field.opts);
                            if(_.isArray(vals[field.name]))
                                sortablelist = _.sortBy(sortablelist, function(li,i) {
                                    return vals[field.name].indexOf(li.value);
                                });
                            fieldContext.list = sortablelist;
                            fieldContext.field = new Handlebars.SafeString(Template.sortable(fieldContext));
                            break;
                            
                        case SELECT:
                        case SELECTMULTI:
                            if(!vals[field.name])   vals[field.name] = "";
                            fieldContext.option = _.without(_.map(getFormOpts(field.opts), function(o) {
                                var ret = false;
                                if(typeof o === "string")
                                    o = {value: o, text: o};
                                
                                ret = {
                                    text:   o.text || o.value,
                                    value:  typeof o.value !== "string" && typeof o.value !== "number" ? o.text : o.value
                                };
                                
                                if((_.isArray(vals[field.name]) && vals[field.name].indexOf(o.value||o.text)!=-1)
                                    || vals[field.name]==(o.value||o.text))
                                        ret.selected="selected";
                                
                                return ret;
                                
                            }),false);
                            
                            if(field.input==SELECTMULTI) {
                                fieldContext.multiple = "multiple";
                                fieldContext.size = fieldContext.size || _.min([5,fieldContext.option.length]);
                            }
                            break;
                    }
                    
                    return new Handlebars.SafeString(Template[getFieldTpl(field.input)](fieldContext));
                    
                },
                
                // class to apply to a field group depending on the input type
                
                groupClass: function() {
                    switch(this.input) {
                        case SixC.Forms.MULTITEXT:
                            return "pure-controls multioption";
                        case SixC.Forms.TEXT:
                        case SixC.Forms.SELECT:
                        case SixC.Forms.SELECTMULTI:
                        case SixC.Forms.DATE:
                        case SixC.Forms.DATETIME:
                        case SixC.Forms.TEXTAREA:
                        case SixC.Forms.WYSIWYG:
                        case SixC.Forms.TYPEAHEAD:
                        case SixC.Forms.PASSWORD:
                            return "pure-control-group";
                        case SixC.Forms.CHECKBOX:
                        default:
                            return "pure-controls";
                    }
                },
                
                hideClass: function() {
                    return this.show || this.hidden ? " hidden" : "";
                }
            });
                        
            // form submission handler
            // handles parsing data, db ops and callbacks
            
            Template.formBuilder.events({
                
                'change input, change select': function(evt,tpl) {
                    if(tpl && tpl.data && typeof tpl.data.onChange === "function") {
                        var form = tpl.data.name ? $('#form_'+tpl.data.name) : $('form');
                        tpl.data.onChange(evt, getFormData(form));
                    }
                },
                
                'submit form': function(evt,ctx) {
                    evt.preventDefault();
                    
                    var target,
                        form = $(evt.target),
                        formbtns = form.find('button'),
                        itemId = form.data('id') || [],
                        wygeditors = form.find('.wygeditor'),
                        self = this,
                        schema = this.schema || ((this.proto||{})._simpleSchema||{})._schema;
                    
                    if(evt.type=="submit" && typeof evt.target.id === "string")
                        target = evt.target.id.replace('form_','');
                    else
                        target = '';
                    
                    // disable buttons for now
                    formbtns.attr('disabled',true);
                    
                    if(!form.length) return false;

                    var data = getFormData(form);
                    
                    if(form.data('clearonsubmit'))
                        form[0].reset();
                    
                    var multitext = _.find(schema, function(cfg) {
                        return cfg.input==SixC.Forms.MULTITEXT;
                    }),
                        
                        sortable = _.find(schema, function(cfg) {
                            return cfg.input==SixC.Forms.SORTABLE;
                        });
                    
                    if(multitext)   {
                        data[multitext.name] = [];
                        $('#'+multitext.name+' option').each(function(i, opt) {
                            data[multitext.name].push(opt.text);
                        });
                    }
                    
                    if(sortable) {
                        data[sortable.name] = _.without(_.map($('.sortable').children(), function(child) {
                            return $(child).data('id');
                        }), false, undefined, null);
                    }
                    
                    // check if we had an HTML editor
                    if(wygeditors.length) {
                        var sani = new Sanitize({
                            elements:   ['div','b','i','u','a','h1','h2','h3','h4','span','strike','br','p','ul','li','ol','img'],
                            attributes: {
                                a:      ['href','title','alt'],
                                img:    ['src','title','alt','width','height']
                            },
                            protocols: {
                                a: { href: ['http','https','mailto'] },
                                img: { src: ['http','https'] }
                            }
                        });
                        _.each(wygeditors, function(wyg) {
                            var temp = $('<div/>'),
                                html = $(temp).html(sani.clean_node(wyg));
                            data[wyg.id] = html.html();
                        });
                    }
                    
                    // check if passed onSubmit from helper
                    //
                    if(typeof this.onSubmit === "function") {
                        if(this.onSubmit(evt,data,ctx)===false)
                            return;
                    }
                    
                    //
                    // process form values
                    //
                    
                    var respCtx = {
                        cfg:    self,
                        data:   data,
                        btns:   formbtns
                    };
                    
                    var newForm = target.split('_'),
                        newId;
                    switch(newForm[0]) {
                        case "add":
                            newId = window[newForm[1]].insert(data, function() {
                                responseHandler.apply(respCtx, arguments);
                            });
                            break;
                        case "update":
                            if(typeof itemId === "string") {
                                if(itemId.indexOf(',')!=-1)
                                    itemId = itemId.split(',');
                                else
                                    itemId = [itemId];
                            }
                            if(itemId.length) {
                                _.each(itemId, function(id) {
                                    //console.log('update '+newForm[1], id, data);
                                    window[newForm[1]].update(id, {$set:data}, function() {
                                        responseHandler.apply(respCtx, arguments);
                                    });
                                });
                            }
                            else console.warn('No itemId for update');
                            break;
                        case "custom":
                            switch(newForm[1]) {
                                case "addPool":
                                    var ev = Events.findOne(Router.get('target'));
                                    if(typeof data.pool === "string")   data.pool = data.pool.toLowerCase();
                                    if(typeof data.round === "string")  data.round = data.round.toLowerCase().replace('round:','');

                                    if(!charNumsOnly.test(data.pool) || !charNumsOnly.test(data.round))
                                        return Toast.error('Invalid characters used in Pool or Round name.');
                                    
                                    if(!ev || (ev.pools && _.isArray(ev.pools[data.pool])) || (data.round && ev.pools && ev.pools[data.round] && _.isArray(ev.pools[data.pool])))
                                    { return false; } // already exists
                                    
                                    var dots = "", set = {};
                                    if(data.round)  dots += "."+data.round;
                                    if(data.pool)   dots += "."+data.pool;
                                    set.$set = {};
                                    set.$set["pools"+dots] = [];
                                    Events.update(Router.get('target'), set, function() {
                                        responseHandler.apply(respCtx, arguments);
                                    });
                                    break;
                                case "addPoolTeam":
                                    var pool = data.pool.toLowerCase().split(', '),
                                        upd = {},
                                        poolteams = false;
                                    upd.$addToSet = {};
                                    poolteams = _.isArray(data.team) ? {$each:data.team} : (data.team || false);
                                    if(poolteams) {
                                        upd.$addToSet['pools.'+pool.join('.')] = poolteams;
                                        Events.update(Router.get('target'), upd, function() {
                                            responseHandler.apply(respCtx, arguments);
                                        });
                                    }
                                    break;
                                case "addCrmField":
                                    var set = {};
                                    data.label = data.label || "";
                                    set['fields.'+data.field] = {
                                        label:  data.label.toLowerCase() || data.field.toLowerCase(),
                                        type:   parseInt(data.type),
                                        field:  data.field,
                                        order:  parseInt(data.fieldcount)+1
                                    };
                                    
                                    if(data.options)
                                        set['options.'+data.field] = data.options;
                                    
                                    CRMs.update(data.crmid, {
                                        $set: set
                                    }, function() {
                                        responseHandler.apply(respCtx, arguments);
                                    });
                                    break;
                            }
                            break;
                        default:
                            console.warn('Skipped processing form', target, data);
                            break;
                    }
                    
                    if(newId) {
                        var callMethod, doneRoute;
                        
                        if(callMethod = form.data('call'))
                            switch(callMethod) {
                                case "updateUserDefaultOrg":
                                    Meteor.users.update(data.users[0], {
                                        $set:   {
                                            "profile.settings.defaultOrg":  newId
                                        }
                                    }, function(err) {
                                        console.log('org create',err);
                                    });
                                    break;
                            }
                        
                        if(doneRoute = form.data('done')) {
                            var params;
                            if(newForm[1]=="Orgs" && newId) // should handle this in a helper callback
                                params = { org: newId };
                            else if(newForm[1]=="Boards" && newId)
                                params = {
                                    org:    Router.get('org'),
                                    type:   'event',
                                    target: Router.get('target'),
                                    sub:    newId
                                };
                            
                            Router.go(doneRoute,params);
                        }
                        
                        formbtns.attr('disabled',false);
                    }
                    
                    return false;
                }
            });
            
            // reset some vars and determine if we need to lazyload libraries
            
            Template.formBuilder.created = function() {
                Session.set('formerror', false);
            };
            
            // applies libraries to third party form fields
            
            Template.formBuilder.rendered = function() {
                var schema = this.data.proto && this.data.proto._simpleSchema && this.data.proto._simpleSchema._schema;
            
                if(this.data.schema)
                    schema = _.extend(_.clone(schema || {}), _.clone(this.data.schema));
            
                if(schema) {
                    // show dependent  fields
                    var cfg = schema,
                        show = _.filter(cfg, function(c) {
                            return !!c.show;
                        }),
                        that = this;
                    
                    _.each(show, function(s) {
                        var parts = s.show.split(/=|\|/),
                            field = parts.shift(),
                            el = $('#'+field),
                            target = $('#'+s.name);
                
                        el.change(function(evt) {
                            if(parts.indexOf(evt.target.value)!=-1)
                                target.closest('div').removeClass('hidden');
                            else
                                target.closest('div').addClass('hidden');
                        });
                    });
                    
                    $('form').tooltip({
                        items:  "i.fb_formhelp",
                        content: function() {
                            var el = $(this),
                                hint = el.data('hint');
                            return unquoteAttr(hint);
                        }
                    });
                }
            };

        };
    
    // public api

    return {
        init:       init,
        addOptions: addOptions
    };

})();