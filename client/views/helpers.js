if(Handlebars && typeof (Handlebars._default_helpers||{}).eachIs !== "function") {
    Handlebars.registerHelper('eachIs', function(context, options) {
        var ret = "";
        if(!context)    return ret;
        for(var i=0, j=context.length; i<j; i++) {
            if(typeof context[i] !== "object")
                context[i] = {
                    item:   context[i]
                };
            var newCtx = _.extend(context[i], {
                __isFirst:  i==0,
                __isLast:   i==(j-1),
                __count:    i
            });
            ret = ret + options.fn(newCtx);
        }
        return ret;
    });
}

Handlebars.registerHelper('labelBranch', function (label, options) {
  var data = this;
  return Spark.labelBranch(label, function () {
    return options.fn(data);
  });
});