/*
====================================================================
 Blackbaud ISD Javascript Class
--------------------------------------------------------------------
 Name: 			Localize
 Author(s): 	Steve Brush [SB]
 Product(s):	BBNC
 Created: 		10/31/2012
 Updated:		...
-------------------------------------------------------------------- 
 Changelog: 
====================================================================
 mm/dd/yyyy		...
====================================================================
 Plugin Description:
--------------------------------------------------------------------
 This class, when instantiated, handles all actions associated with
 the localization process, including page mapping and NetCommunity 
 part localizations.
====================================================================
*/

function Localizer(opts) {
	
	// ==============
	//  private vars
	// --------------
	var helper = new PageHelper({
			BBNC: {
				version: '6.41'
			}
		}), // include the PageHelper class
		defaults = {
			frenchUrlKeyword: 	'/fr/',					// a constant, distinguishing keyword for all French URLs, used to determine if on French page; could be subdomain or directory
			container: 			'#wrapContentOuter',	// html element to apply localization
			languageCookieName: 'languagePref',			// name of cookie that stores language pref
			bbncParts: {
				complete: function() {
					$('.BBFormTable').show();
					$('.loader').hide();
				}
			},
			pageMapper: {}
		},
		options = {};


	// =================
	//  private methods
	// -----------------
	var methods = {
		
		initLocalizeParts: function() {
			if (typeof $.fn.LocalizeParts != 'undefined' && location.href.indexOf(options.frenchUrlKeyword)>-1) {
				$(options.container).LocalizeParts(options.bbncParts);
			}
		},
		
		initPageMapper: function() {
			if (typeof $.fn.PageMapper != 'undefined') {
			
				$('li[class*="local-set"]').PageMapper(options.pageMapper);
				
				// Onclick 'English'
				$('.local-set-en').click(function() {
					methods.setLanguage('en');
					location.href = $(this).find('a').attr('href');
					return false;
				});
				
				// Onclick 'French'
				$('.local-set-fr').click(function() {
					methods.setLanguage('fr');
					location.href = $(this).find('a').attr('href');
					return false;
				});
				
				// Onclick 'Spanish'
				$('.local-set-es').click(function() {
					methods.setLanguage('es');
					location.href = $(this).find('a').attr('href');
					return false;
				});
				
			}
		},
		
		cleanUp: function() {			
			// remove apostrophes for French users:
			if (options.languagePref == "fr") {
				if ($("option:contains(\'s)").length) {
					$("option:contains(\'s)").each(function(){
						var posSplit = $(this).html().split("\'s ");
						$(this).html(posSplit[1].replace(/^\w/, function($0) { return $0.toUpperCase(); })+' de '+posSplit[0]);
					});
				}
			}
		},
		
		setLanguage: function(val) {
			if (typeof sessvars != "undefined" && typeof $.cookie != "undefined") {
				sessvars.languagePref = val;
				$.cookie(options.languageCookieName, null);
				$.cookie(options.languageCookieName, val, {expires:7});
			}
			options.languagePref = val;
		},
		
		getLanguage: function() {
			if (helper.urlContains(options.frenchUrlKeyword)) {
				return 'fr';
			} else if (typeof sessvars != "undefined" && typeof $.cookie != "undefined") {
				if (sessvars.languagePref != undefined) {
					return sessvars.languagePref;
				} else if ($.cookie(options.languageCookieName) != null) {
					return $.cookie(options.languageCookieName);
				}
			} else {
				return navigator.language.split('-')[0];
			}
		}
		
	};



	// =============
	//  constructor
	// -------------
	var main = function() {
		
		// vars setup
		options = $.extend(true, defaults, opts);
		if (typeof sessvars != "undefined") sessvars.$.prefs.crossDomain = true;
		options.languagePref = methods.getLanguage();

		// methods
		if (!helper.getEditView()) {
			methods.setLanguage(options.languagePref);
			methods.initPageMapper();
			methods.initLocalizeParts();
			methods.cleanUp();
		} else {
			// show forms
			$('.BBFormTable').show();
			$('.loader').hide();
		}
		
	}(); // auto-run
	
	
} // end class