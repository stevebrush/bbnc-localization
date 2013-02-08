/*
====================================================================
 Blackbaud ISD Custom jQuery Plugin
--------------------------------------------------------------------
 Plugin: 		Localization Page Mapper
 Author(s): 	Chris Wolf [CW], Steve Brush [SB]
 Product(s):	BBNC, Sphere CMS
 Created: 		10/04/2011
 Updated:		10/31/2012
-------------------------------------------------------------------- 
 Changelog: 
====================================================================
 03/16/2012		Added XML capabilities [SB]
 				Added plugin description [SB]
 				Added callback [SB]
 				Added cookie and sessvars support
 				Consolidated functions into "methods" array [SB]
 				General cleanup [SB]
 10/31/2012		Inserted all functions into the methods variable
====================================================================
 Plugin Description:
--------------------------------------------------------------------
 This plugin keeps track of what pages belong together for multiple 
 translations. In other words, it will send the user to the 
 French or Spanish equivalent of the English page, and vice versa.

 It's designed to be applied to the language selection links, or 
 "switches", usually located in the header area. For each page, the 
 plugin attempts to locate the matching URLs to be placed in the HREFs 
 for all language switches. In the Menu Part for the switches, be sure 
 to add classes to each link to tell the plugin what language to load 
 when clicked.

 For example: 
 * The link to view English would have the class "local-set-en".
 * The link to view French/Spanish would have the class 
   "local-set-fr", or "local-set-es".
====================================================================
*/

(function($){
	
	var prefLink = "";
	
	var methods = {
	
		mapPages: function (options,pages) {
		
			// Loop through language switches (links) and create new HREFs:
			this.each(function(iteration, link) {

				// Get the language of this link:
				var linkLang = $(link).attr('class').split('local-set-')[1].toLowerCase();
				var thisPage = pages[linkLang];
				
				// Compare with current URL
				// Add selected class
				if (window.location.href==thisPage) {
					$(link).addClass(options.activeClass);
				}
				$.each(pages,function(key,value){
					if (linkLang == key) {
						if ($(link).find('a').length) {
							$(link).find('a').attr('href',value);
						} else {
							$(link).attr('href',value);
						}
					}
					// Add .preferencePage to link if cookie matches link's language
					if (sessvars.languagePref == linkLang) {
						$(link).addClass('preferencePage');
					}
				});	
			});
			
			// Get redirect link
			var doRedirect = methods.findPreferenceLink(options,pages);
			
			// Redirect if not on language preference page:
			if (doRedirect && options.redirect) location.href = prefLink;
			
			// Callback
			if (options.complete) options.complete.call(this);
		},
		
		findPreferenceLink: function(options,pages) {
			
			var currentUrl = location.href;
		
			// Add URLs to language switches
			$.each(pages, function(key,value) {			
				if (typeof sessvars.languagePref != "undefined") {
					if (sessvars.languagePref == key) prefLink = value;
				} else {
					prefLink = pages['en'];
				}
			});
			var pid = prefLink.split('.aspx?')[1];
			return (currentUrl != prefLink && currentUrl.indexOf(pid)==-1) ? true : false;
		}
		
	};

	$.fn.PageMapper = function(options) {
		var defaults = {
			defaultLang: 	'en',						// language default
			root: 			'en=='+location.protocol+'//www.domain.org/en/,fr=='+location.protocol+'//www.domain.org/fr/,es=='+location.protocol+'//www.domain.org/es/',
			activeClass: 	'selected', 				// class to apply to language link
			dataType: 		'meta', 					// how are the pages' urls stored? can be meta or xml
			xmlUrl: 		null, 						// link to XML file that stores pages
			complete: 		null, 						// callback function
			redirect: 		false 						// redirect to matching page if language is different than pref
		},
		element = this,
		options = $.extend(defaults, options),
		URLs = {};
		
		// Set cookie if undefined
		if (typeof sessvars.languagePref == "undefined" || sessvars.languagePref == null) {
			sessvars.languagePref = options.defaultLang;
		}
		
		// Group Roots
		// ------------
		var theRoots = options.root.split(','); // define root URLs
		var rootArray = {};
		$.each(theRoots, function(i,v) {
			var rootLang = $.trim(v.split('==')[0]);
			var rootLink = $.trim(v.split('==')[1]);
			rootArray[rootLang] = rootLink;
		});
		
		
		// Group Pages and Join w/ Roots
		// ------------------------------
		
		//-----
		// XML
		//-----
		// Grab mapped pages from XML File:
		if (options.dataType == "xml") {
			var matchFound = false;
			$.ajax({
				type: "GET",
				url: options.xmlUrl,
				dataType: "xml",
				success: function(data) {
					$(data).find("page").each(function(){
						$(this).children().each(function() {
							var thisLang = jQuery(this)[0].tagName;
							var thisPage = rootArray[thisLang]+$(this).text();
							URLs[thisLang] = thisPage;
							if (!matchFound) matchFound = (window.location.href.indexOf($(this).text())>-1) ? true : false;
						});
						if (matchFound) return false;
					});
					if (matchFound) {
						if (URLs["en"]) {
							var args = [options,URLs];
							return methods.mapPages.apply(element,args);
						}
					} else {
						URLs = {};
					}
				}
			});
		} else 

		//------
		// META
		//------
		// Grab mapped pages from Meta Keywords:
		if (options.dataType == "meta") {
			
			var pageArray = {};

			// Create associative array of pages
			if ($('meta[name="keywords"]').length) {  

				var pagemeta = $('meta[name="keywords"]').attr('content');
				
				// Determine if page map indicators exist.
				// Then, return the mapper URLs in an array.
				if (pagemeta.match('==')) {
					var metaData = pagemeta.split(',');
					for (var i=0; i<metaData.length; i++) {
						var metaLang = $.trim(metaData[i].split('==')[0]);
						var metaLink = $.trim(metaData[i].split('==')[1]);
						pageArray[metaLang] = metaLink;
					}
				}
				
				// Combine roots and pages into single array
				$.each(rootArray, function(rootLang,rootUrl) {
					$.each(pageArray, function(pageLang,pageUrl) {
						if (rootLang==pageLang) {
							URLs[pageLang] = rootUrl+pageUrl;
						}
					});
				});
				
				// Send to mapper function:
				var args = [options,URLs];
				return methods.mapPages.apply(element,args);
			}
		}
	};
	
})(jQuery);