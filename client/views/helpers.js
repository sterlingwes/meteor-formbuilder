if(Handlebars && typeof (Handlebars._default_helpers||{}).eachIs !== "function") {
    /*
     * Adds the {{#eachIs}} block helper to handlebars templates
     *
     * each iteration of the #eachIs loop has access to an object with the following properties:
     * - item: the initial value / current item in the list if the original array item was not an object
     * - __isFirst: this is the first item in the list
     * - __isMiddle: this is neither the first nor last item in the list
     * - __isLast: this is the last item in the list
     * - __count: index of the current item in the list (zero-indexed)
     */
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
                __isMiddle: i!=0 && i!=(j-1),
                __isLast:   i==(j-1),
                __count:    i
            });
            ret = ret + options.fn(newCtx);
        }
        return ret;
    });
}

/*
 * Hack for Spark landmark naming issue, see https://github.com/meteor/meteor/issues/281#issuecomment-16191927
 */
Handlebars.registerHelper('labelBranch', function (label, options) {
  var data = this;
  return Spark.labelBranch(label, function () {
    return options.fn(data);
  });
});