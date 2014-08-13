Template.formBuilder_input.rendered = function() {
  
  if(this.data.input == SixC.Forms.TAGS) {
    $('.tagsinput').selectize({
      delimiter:    ',',
      create:       true,
      createOnBlur: true,
      openOnFocus:  false,
      selectOnTab:  true
    });
  }
  
};