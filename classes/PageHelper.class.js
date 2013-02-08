/*
====================================================================
 PageHelper (class)
--------------------------------------------------------------------
 Needs to be instantiated to use, e.g.:
 var helper = new PageHelper({opts});
 
====================================================================
 Constructor Methods:
--------------------------------------------------------------------
 showPartTitle();		Visual cue to content author that 
 						Javascript is present

====================================================================
 Public Methods:
--------------------------------------------------------------------
 helper.getEditView(); 	returns 'true' or 'false'
 helper.getUrlVars();	returns vars values from URL
 
====================================================================
*/

function PageHelper(opts) {
	
	
	// ==============
	//  private vars
	// --------------
	var isEditView = false,
		BBNC = {},
		options = {},
		defaults = {
			BBNC: {
				version: '6.41'
			}
		};



	// =================
	//  private methods
	// -----------------
	var methods = {
	
		checkEditView: function() {
		
			var pageEdit,
				templateEdit;
			
			// different versions have different page structures...
			switch (BBNC.version) {
				case '6.10':
				case '6.1':
					pageEdit = '&edit=';
					templateEdit = '&edit=';
					break;
				case '6.41':
				default:
					pageEdit = 'pagedesign';
					templateEdit = 'templatedesigner';
					break;
			}
			isEditView = location.href.indexOf(pageEdit)>-1; // page edit
			if (!isEditView) isEditView = location.href.indexOf(templateEdit)>-1; // template edit
		},
		
		showPartTitle: function() {
			// inform the user that javascript code is present,
			// must include "javascript" in the part title:
			if (isEditView) {
				if (!$('.jsPartLabel').length) {
					$('td[id*="tdPartName"]:contains("Javascript")').each(function() {
						var uniqueID = $(this).attr("id");
						uniqueID = uniqueID.slice(0,uniqueID.length-11);
						var partName = $(this).html();
						var contentPane = $('div[id*="'+uniqueID+'_pnlPart"]');
						contentPane.append('<div class="jsPartLabel" style="padding:0 4px 0 24px;background:#000;color:#fff;font-size:11px;">'+partName+'</div>');
					});
				}
			}
		}
		
	};
	
	

	// =============
	//  constructor
	// -------------
	var main = function() {
		options = $.extend(true, defaults, opts);
		BBNC.version = options.BBNC.version;
		methods.checkEditView();
		$(document).ready(function() {
			methods.showPartTitle();
		});
	}(); // auto-run
	


	// =======================
	//  public methods & vars
	// -----------------------
	return {
	
		getEditView: function() {
			return isEditView;
		},
		
		getUrlVars: function() {
			var vars = {},
				parts = location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
					vars[key] = unescape(value.replace(/\+/g, " "));
				});
			return vars;
		},
		
		urlContains: function(url) {
			return window.location.href.indexOf(url)>-1;
		}
		
	}
	
}