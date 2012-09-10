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
		currentId : 1,
		modals   : {},
		status  : null,

};
MycheckModal.modal = function(element){
	
	this.id = MycheckModal.currentId;
	MycheckModal.blackout.css("z-index", 5000 + this.id).fadeIn(250);
	this.element = element;
	this.url = this.element.attr("data-url");
	MycheckModal.modals[this.id] = this;
	
	this.title = "";
	if (typeof this.element.attr("data-title") != "undefined"){
		this.title = this.element.attr("data-title");
	}
	this.style = "";
	if (typeof this.element.attr("data-style") != "undefined"){
		this.style = this.element.attr("data-style");
	}
	this.contentStyle = "";
	if (typeof this.element.attr("data-content-style") != "undefined"){
		this.contentStyle = this.element.attr("data-content-style");
	}
	
	
	this.modal = $("<div class='modal hide'><div class='modal-header'><h3>" + this.title + "</h3><div class='modal-close'>x</div></div><div class='modal-content'></div></div>")
	.attr("style", 'left:35%;top:25%;position:fixed;' + this.style)
	.attr("data-modal-id", this.id)
	.css("z-index", 5000 + this.id)
	.addClass("shadow");
	$("body").append(this.modal);
	this.modal.fadeIn(250);
	// load modal with data
	this.modal.find(".modal-content").attr("style", this.contentStyle).load(this.url, function(){
		MycheckModal.centerize(MycheckModal.modals[MycheckModal.getId($(this))].modal);
		MycheckModal.formSubmissionInit(MycheckModal.modals[MycheckModal.getId($(this))].modal);
		});
	// destruct modal event handlers
	MycheckModal.blackout.click( function(){
		MycheckModal.__destruct("all");
	});
	
	this.modal.find(".modal-close").click( function(){
		MycheckModal.__destruct(MycheckModal.modals[MycheckModal.getId($(this))].modal);
	});
	/*
	$(window).bind("resize.MycheckModal." + MycheckModal.getId($(this)), function(){
		MycheckModal.centerize(MycheckModal.modals[MycheckModal.getId($(this))].modal);
	});
	*/
	MycheckModal.currentId++;
}
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

MycheckModal.getId = function(element){
	if (element.hasClass("modal")) return element.attr("data-modal-id");
	return element.parents(".modal").attr("data-modal-id");
}

MycheckModal.formSubmissionInit = function(element)
{
	var form = element.find("form");
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
		var url = $(this).attr("action");
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
MycheckModal.centerize = function(element){
	offsetX = ($(window).width() - element.width()) / 2;
	offsetY = ($(window).height() - element.height()) / 2;
	element.css("left", offsetX + 'px');
	element.css("top", offsetY + 'px');
};
MycheckModal.__destruct = function(element){
	if (element == "all"){
		$.each(MycheckModal.modals, function(){
			this.modal.fadeOut(150, function(){this.remove});
		});
		MycheckModal.blackout.fadeOut(150);
		MycheckModal.modals = {};
		MycheckModal.currentId = 1;
		return;
		
	}
	modalId = parseInt(MycheckModal.getId(element));
	MycheckModal.blackout.css("z-index", 5000 + modalId - 1);
	$(window).unbind("resize.MycheckModal." + modalId);
	element.fadeOut(150, function(){
		element.remove();
		element = null;
		});
	MycheckModal.currentId--;
	delete MycheckModal.modals[modalId];
	if ($.isEmptyObject(MycheckModal.modals)) MycheckModal.blackout.fadeOut(150);
};
MycheckModal.hideStatus = function(){
	this.status.slideUp(250, function(){MycheckModal.status.remove()});
};
MycheckModal.processPostResponse = function(data){
	this.status = $("<div class='modal-status'><div class='container'><span class='message'></span><span class='modal-status-dismiss'>x</span></div></div>")
	.attr("style", 'left:0px;top:0px;position:fixed;').hide()
	//.hide()
	.css("width", $(document).width() + 'px')
	.css("z-index", "9000");
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

MycheckModal.init = function(){
	MycheckModal.blackout =  $("<div class='modal-backdrop'></div>")
	.attr("style", 'left:0px;top:0px;position:absolute;background:black;')
	.css("opacity", "0.5")
	.css("height", $(document).height() + 'px')
	.css("width", $(document).width() + 'px')
	.css("z-index", "5000")
	.hide();
	$("body").append(MycheckModal.blackout);
}

$(document).ready(function(){
	MycheckModal.init();
});
MycheckModal.removeResidue = function(){
	$(".modal-status").remove();
}
/* bind modal constructor */
$("[rel=modal]").live("click", function(e){
	e.preventDefault();
	new MycheckModal.modal($(this));
});