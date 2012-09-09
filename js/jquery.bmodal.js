/**
 *
 * A reusable AJAX modal interface created on the GO.
 *
 * @namespace MycheckModal
 *
 * @property jQuery element - the element that was clicked
 * @property String url - the url to take the data from
 * @propety blackout - the backdrop to the modal (ui blocker)
 * @property modal - the modal containing the page requested (automatically a GET request)
 *
 * Html markup example:
 * <HTMLELEMENT rel='modal' data-url='/myurl/'>click here</HTMLELEMENT>
 *
 * Please note: any forms on the requested URL will be processed in the modal ( MycheckModal.formSubmissionInit() )
 * @author Itai (itai@mycheck.co.il)
 */
MycheckModal = {
		element : null,
		url     : null,
		blackout: null,
		modal   : null,
		dlg     : null,
		status  : null,

};
/**
 * Modal constructor function
 */
MycheckModal.__construct = function(element){
	this.removeResidue();
	
	this.element = element;
	this.url = this.element.attr("data-url");

	// 	Build backdrop
	this.blackout = $("<div class='modal-backdrop'></div>")
	.attr("style", 'left:0px;top:0px;position:absolute;background:black;')
	.css("opacity", "0.5")
	.css("height", $(document).height() + 'px')
	.css("width", $(document).width() + 'px')
	.css("z-index", "5000");
	$("body").append(this.blackout);
	var title = "";
	if (typeof this.element.attr("data-title") != "undefined"){
		title = this.element.attr("data-title");
	}
	var style = "";
	if (typeof this.element.attr("data-style") != "undefined"){
		style = this.element.attr("data-style");
	}
	var contentStyle = "";
	if (typeof this.element.attr("data-content-style") != "undefined"){
		contentStyle = this.element.attr("data-content-style");
	}
	
	this.modal = $("<div class='modal hide'><div class='modal-header'><h3>" + title + "</h3><div class='modal-close'>x</div></div><div class='modal-content'></div></div>")
	.attr("style", 'left:35%;top:25%;position:fixed;' + style)
	.css("z-index", "5001")
	.addClass("shadow");
	$("body").append(this.modal);
	this.modal.fadeIn(250);
	// load modal with data
	this.modal.find(".modal-content").attr("style", contentStyle).load(this.url, function(){
		MycheckModal.centerize();
		MycheckModal.formSubmissionInit();
		});
	// destruct modal event handlers
	this.blackout.click( function(){
	    MycheckModal.__destruct();
	});

	this.modal.find(".modal-close").click( function(){
	    MycheckModal.__destruct();
	});
	
	
	$(window).bind("resize.MycheckModal", function(){
		MycheckModal.centerize();
	})
};
/**
 * MycheckModal.formSubmissionInit()
 *
 * attach event handler to modal form submission.
 * should only be called after we populated the modal with content.
 *
 * assumptions:
 * Target page should return a JSON string containing atleast:
 * success - [true | false] - true will default to destroy the modal
 * message - the message to display in case of success/failure.
 *
 * @return void
 */
MycheckModal.formSubmissionInit = function()
{
	var form = this.modal.find("form");
	if (form.attr("enctype")){
		if (form.attr("enctype").toLowerCase() == 'multipart/form-data')
		{
			return false;
		}
	}

	form.submit(function(e)
	{
		e.preventDefault();
		var formStr = $(this).serialize();
		// var action  = $(this).attr("action");
		var method  = $(this).attr("method").toUpperCase();
		var url = MycheckModal.url;
		var buttons;
		$.ajax({
			  type: method,
			  url: url,
			  data: formStr,
			  success: function(data){
				  MycheckModal.removeResidue();
					MycheckModal.processPostResponse(data);
			},
			dataType: "json"
		});
	});
};
/**
 * MycheckModal.centerize()
 *
 * centerize the modal in the middle of the viewport.
 *
 */
MycheckModal.centerize = function(){
	offsetX = ($(window).width() - this.modal.width()) / 2;
	offsetY = ($(window).height() - this.modal.height()) / 2;
	this.modal.css("left", offsetX + 'px');
	this.modal.css("top", offsetY + 'px');
};
MycheckModal.__destruct = function(){
	this.element = null;
	this.url = null;
	$(window).unbind("resize.MycheckModal");
	this.blackout.fadeOut(150, function(){
		MycheckModal.blackout.remove();
		MycheckModal.blackout = null;
		} );
	this.modal.fadeOut(150, function(){
		MycheckModal.modal.remove();
		MycheckModal.modal = null;
		} );
};
MycheckModal.hideStatus = function(){
	this.status.slideUp(250, function(){MycheckModal.status.remove()});
}
MycheckModal.processPostResponse = function(data){
	this.status = $("<div class='modal-status'><div class='container'><span class='message'></span><span class='modal-status-dismiss'>x</span></div></div>")
	.attr("style", 'left:0px;top:0px;position:fixed;').hide()
	//.hide()
	.css("width", $(document).width() + 'px')
	.css("z-index", "5001");
	$("body").prepend(this.status);
	this.status.find(".modal-status-dismiss").bind("click.MycheckModal", function(){
		MycheckModal.hideStatus();
	});
	MycheckModal.status.slideDown(500);
	if (data.success)
	{
		if (typeof data.message == "undefined") data.message = "Success";
		MycheckModal.status.addClass("success")
			.find(".container .message").text(data.message);
		setTimeout("MycheckModal.hideStatus()", 3000);
		MycheckModal.__destruct();
	}
	else
	{
		if (typeof data.message == "undefined") data.message = "Failed";
		MycheckModal.status.addClass("error")
			.find(".container .message").text(data.message);
	}
}

MycheckModal.removeResidue = function(){
	$(".modal-status").remove();
}
/* bind modal constructor */
$("[rel=modal]").live("click", function(e){
	e.preventDefault();
	MycheckModal.__construct($(this));
});