/*
====================================================================
 Blackbaud ISD Custom jQuery Plugin
--------------------------------------------------------------------
 Plugin: 		Localize Parts
 Author(s): 	Steve Brush [SB], Chris Wolf [CW]
 Product(s):	BBNC 6.15
 Created: 		01/27/2011
 Updated:		10/31/2012
-------------------------------------------------------------------- 
 Changelog: 
====================================================================
 03/22/2012		Removed unused variables [SB]
 				General cleanup [SB]
 04/10/2012		Added functionality for multiple selectors
====================================================================
 Plugin Description:
--------------------------------------------------------------------
  This plugin will translate the contents of an HTML container,
  specifically as it relates to forms and NetCommunity parts.
====================================================================
*/

(function($) {
	$.fn.LocalizeParts = function(options) {
	
		var defaults = {
			translateTo: 		'French',			// translate parts to this language
			termsJSON: 			'',					// url to localizeParts.json file (upload to documents)
			csvPopupHTML:		'',					// html file to replace csv popup on donation form (upload to documents)
			dateFormat: 		'w, d m, y - t p',	// formatting for dates as words
			numDateFormat: 		'd/m/y',			// formatting for dates as numbers
			currencyFormat: 	'b /cx,/a $',		// formatting for currency: a = symbol, b = delimiter, c = decimal, cx = hide cents if .00
			complete:			null
		},
			options 					= $.extend(defaults, options),
			translateTo 				= options.translateTo,
			jsonFile 					= options.termsJSON,
			csvPopup					= options.csvPopupHTML,
			dateFormat 					= options.dateFormat,
			numDateFormat 				= options.numDateFormat,
			currencyFormat 				= options.currencyFormat,
			callback					= options.complete,
			wrapContent 				= $(this).selector,
			DAYS 						= ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
			MONTHS 						= ['January','February','March','April','May','June','July','August','September','October','November','December','Jan','Feb','Mar','Apr','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
			MERIDIEMS 					= ['AM','PM','am','pm'],
			NUMBERED_DATE_CONTAINERS 	= ['.TransactionManagerGridCell'],
			CURRENCY_CONTAINERS 		= ['.TransactionManagerGridCellAmount','.TransactionManagerSummaryDetailValue','.DonationCaptureFieldControlCellAmount','.DonationFieldControlCell span','.PaymentPartGrid td','.PaymentPartLastAction','span[id$=_lblDesTotal]', '.EventItemRegistrationControlCellPrice span', '.EventTicketsBodyCell span', '.total-amount', '.added-donation', '.BBMembershipControlCell span', '.BBMembershipBenefitsGridItem td', '.BBMembershipFormReadonlyValue span'];
	
		var methods = {
		
			showAllThings: function() {
				$(wrapContent).css('visibility','visible');
			},
			
			partFixes: function(partTitle) {
				
				if (partTitle == 'Event Calendar') {
					$('.ListViewDateLabel', $('.BBFormTable[summary="Event Calendar"]')).each(function() {
						var thisHTML = $(this).html().split(': ');
						$(this).html('<span class="labelText">'+thisHTML[0]+': </span><span class="date">'+thisHTML[1]+'</span>');
					});
					$('input[alt="Filter Events"]').closest('td').css('visibility','hidden');
				}
				
				if (partTitle == 'Donation Form') {
				
					// Switch country option values from '&' to 'and'...
					$('select[id*="Country"] option:contains("&")').each(function() {
						$(this).html($(this).html().replace('&amp;','and'));
					});
					if ($('select[id*="Country"] option:contains("Iran")').html() != null) {
						$('select[id*="Country"] option:contains("Iran")').html($('select[id*="Country"] option:contains("Iran")').html().replace(' (Islamic Rep of)',''));
					}
				
					// Date fixes...
					$('span:contains("T00")', $('.DonationFormTable')).each(function() {
						var dateItem = $(this).text().replace('T00:00:00','').split('-'); 
						$(this).text(dateItem[2]+'/'+dateItem[1]+'/'+dateItem[0]);
					});
					
					// Translate CSV Popup
					if ($('table[class*="DonationFormTable"]').length && typeof csvPopup != "undefined") {
						$('a.BBLinkHelpIcon').removeAttr('onclick').attr('href','#').unbind('click').click(function() {
							window.open(csvPopup,"mywindow","menubar=1,scrollbars=1,resizable=1,width=475,height=350");
							return false;
						});
					}
					
				}
				
				if (partTitle == 'Event Registration') {
					$('span[id*=_lblEventTotal]', $('.EventTable')).each(function() {
						if ($(this).html().match('added')) {
							var thisHTML = $(this).text().replace(']','').split(' [');
							$(this).html('<span class="added-donation">'+thisHTML[1]+'</span><span class="total-amount">'+thisHTML[0]+'</span>');
						} else {
							$(this).html('<span class="total-amount">'+$(this).text()+'</span>');
						}
					});
				}
				
				if (partTitle == 'Profile Form' || partTitle == 'Job Board' || partTitle == "Login Validations" || partTitle == "Membership") {	
				
					$('.ProfileFormSubmitButton, .JobBoardSubmitButton, .LoginFormSubmitButton, .BBMembershipSubmitButton').bind('click',function(){
						$.getJSON(jsonFile, function(json) {
							var theParts = json.localizer[0];
							$.each(theParts,function(i,partArr){
								$.each(partArr,function(i,parts){
									if (parts['part'] == partTitle) {
										$.each(parts.terms,function(i,term){
											var _element = this["Element"];
											var _old = this["English"];
											if (this[translateTo] != null) var _new = this[translateTo];
											$(_element+':contains("'+_old+'")').each(function(){
												var errorMsg = $(this).html();
												var newError = errorMsg.replace(_old,_new);
												$(this).html(newError);
											}); 
										});
									}
								});
							});
							
						});
						
					});
				}
				
				$('.hasDatepicker').each(function(){
					var dateInput = $(this);
					dateInput.hide();
					var thisParent = $(this).parent();
					$('.ui-datepicker-trigger',thisParent).hide();
					if ($('.dateInputFix',thisParent).length == 0) {
						$(this).after('<input class="dateInputFix"/>'); 
					}
					$('.dateInputFix',thisParent).each(function(){		 
						var elSplits = dateInput.val().split('/');
						if (elSplits.length == 3) {
							var m = elSplits[0];
							var d = elSplits[1];
							var y = elSplits[2];
							var display = '';
							var dateSplit = numDateFormat.split('');
							$.each(dateSplit,function(i,s){				
								var dateVal = '';
								if (s == "m") dateVal = m;
								else if (s == "d") dateVal = d;
								else if (s == "y") dateVal = y;
								else dateVal = s;
								if (dateVal != null) display = display+dateVal;
							});	
							var dateOutput = display;
							$(this).val(dateOutput);	
						}
					});
					$('.dateInputFix',thisParent).change(function(){
						var elSplits = $(this).val().split('/');
						if (elSplits.length == 3) {
							var d = elSplits[0];
							var m = elSplits[1];
							var y = elSplits[2];
							var display = '';
							var dateSplit = ['m','/','d','/','y'];
							$.each(dateSplit,function(i,s){				
							
								var dateVal = '';
								
								if (s == "m") dateVal = m;
								else if (s == "d") dateVal = d;
								else if (s == "y") dateVal = y;
								else dateVal = s;
								
								if (dateVal != null) display = display+dateVal;
							
							});		  
							var dateOutput = display;
							dateInput.val(dateOutput);	
						}
					});
				});
				
			},
			
			formatDates: function(part) {
				$.each(NUMBERED_DATE_CONTAINERS,function(i,_element){
					var thisElement 	= $(part).find(_element+':contains("/")'),
						elSplits 		= thisElement.text().split('/');
						
					if (elSplits.length == 3) {
						var m 			= elSplits[0],
							d 			= elSplits[1],
							y 			= elSplits[2],
							display 	= '',
							dateSplit 	= numDateFormat.split('');
						
						$.each(dateSplit,function(i,s){				
							var dateVal = '';
							
							if (s == "m") 			dateVal = m;
							else if (s == "d") 		dateVal = d;
							else if (s == "y") 		dateVal = y;
							else 					dateVal = s;
							if (dateVal != null) 	display = display+dateVal;
							
						});
						
						thisElement.text(display);
					}
				});
			},
			
			formatCurrency: function(part) {
				$.each(CURRENCY_CONTAINERS, function(i,_element) {
				
					// Loop through those elements that do, in fact, contain currency: 
					$(part).find(_element+':contains("$")').each(function(a) {
						
						// If currency has a matching number with it...
						if ($(this).text() != '$') {
						
							var currencyInstances 	= $(this).text().split(';'),
								updatedCurrency 	= '';
								
							// Loop through all instances of the currency:
							$.each(currencyInstances, function(i,curr) {
	
								if (typeof curr != "undefined") {
								
									var cents = (curr.match('.')) ? curr.split('.')[1] : '';
									if (typeof cents != "undefined") {
										if (cents.split('').length > 2) cents = cents.substr(0,2);
										
										var dollars 			= curr.split('.')[0].split('$')[1],
											stringBeforeAmount 	= curr.split('.')[0].split('$')[0],
											stringAfterAmount 	= curr.split('.')[1].replace(cents,'');
											if (stringAfterAmount == null) stringAfterAmount = '';
										
										var updatedCurrencyAmount 	= '',
											data 					= '',
											currSplit 				= currencyFormat.split('/');
										
										// a = symbol
										// b = delimiter
										// c = decimal
										// cx = hide cents if .00
										
										$.each(currSplit, function(i,s) {
										
											// Get Symbol:
											if (s.match('a')) data = s.replace('a','');
											
											// Get Delimiter:
											else if (s.match('b')) data = dollars.replace(/,/g,s).replace('b','');
											
											// Get Decimal:
											else if (s.match('c')) { 
												if ((s.match('x')) && (cents == '00')) {
													data = '';
												} else if (cents != '00') {
													data = (s.replace('c','').replace('x',''))+cents;
												} else if (!s.match('x')) {
													data = s.replace('c','')+cents;
												}			
											} else { 
												data = '';
											}
											
											// Update currency amount string:
											if (data != null) {
												updatedCurrencyAmount += data;
											}
										});		
										var currOutput = stringBeforeAmount+updatedCurrencyAmount+stringAfterAmount;
										updatedCurrency = updatedCurrency+currOutput;
									}
								}
							});
							$(this).text(updatedCurrency);
						}
					});
				});	
			},
			
			fixDollarInputFields: function(o) {
				$(o).find('input[id*="txtAmount"], input[id*="dgCart_txtDesAmount"]').keypress(function(e) {
					if (e.which == 44) {
						e.preventDefault();
					}
					if (e.which == 46) {
						e.preventDefault();
					}
				});
			}
			
		};
	
		return this.each(function() {
		
			var container = this;
		
			// Fetch JSON:
			$.ajax({
				url: jsonFile,
				dataType: 'json',
				type: 'get',
				success: function(json) {
				
					// Begin Translation
					// -----------------
					$.each(json.localizer, function(i,localizer) {
					
						// Translate Parts
						// ---------------
						if (this.parts) {
							
							// Go through each part ...
							$.each(this.parts, function(i,parts) {
								
								var part 		= this,
									selector 	= part.selector,
									title 		= part.part,
									terms 		= part.terms;
								
								// If this part is on the page ...
								if ($(container).find(selector).length) {
	
									// Run fixes for this part ...
									methods.partFixes(title);
									
									// Go through terms associated with this part ...
									$.each(terms, function() {									
										var oldPhrase 	= this["English"],
											newPhrase 	= this[translateTo],
											selectors 	= selector.split(','),
											elements;
										
										for (var i=0; i<selectors.length; i++) {
											elements = $(container).find($.trim(selectors[i])+' '+this["Element"]+':contains("'+oldPhrase+'")');
											$.each(elements, function() {
												if ($(this).length) $(this).html($(this).html().replace(oldPhrase,newPhrase));
											});
										}
									});
								}
							});
						}
					
					
						// Translate Dates
						// ---------------
						else if (this.dates) {
							$.each(this.dates, function() {
								
								var _old = this["English"];
								if (this[translateTo] != null) { 
									var _new = this[translateTo];
									// run date relabeling script
									$(container).find('.date:contains("'+_old+'"),option:contains("'+_old+'"),span:contains("'+_old+'")').each(function(){
										if (jQuery.inArray(_old, MONTHS) != -1) {
											if (!$(this).hasClass('dateFormat')) {
												$(this).addClass('dateFormat');
											}
											$('.dateFormat').each(function(){		  
												var dateSplits = $(this).html().replace(/,/g,'').split(' ');
												var dateSplitLength = dateSplits.length;
												var weekday = '';
												var month = ''; var monthIndex = '';
												var mer = '';
												var time = '';
												var day = '';
												var year = '';
												$.each(dateSplits,function(i,s){
													if (jQuery.inArray(s, DAYS) != -1) { 
														weekday = s;
													} else if (jQuery.inArray(s, MONTHS) != -1) { 
														month = s; 
														monthIndex = i;
													} else if (jQuery.inArray(s, MERIDIEMS) != -1) { 
														mer = s;
													} else if (s.match(':')) { 
														time = s;
													}
													day = dateSplits[monthIndex + 1];
													year = dateSplits[monthIndex + 2];
												});
														  
												var c = ''
												var dateSplit = dateFormat.split('');
												$.each(dateSplit,function(i,s){				
													var dateVal = '';
													if (s == "w") dateVal = weekday;
													else if (s == "m") dateVal = month;
													else if (s == "d") dateVal = day;
													else if (s == "y") dateVal = year;
													else if (s == "t") dateVal = time;
													else if (s == "p") dateVal = mer;
													else dateVal = s;
													if (dateVal != null) {
														c = c+dateVal;
													}
												});		 
												
												var dateOutput = c;
												if (weekday != '') {
													$(this).html(dateOutput).removeClass('dateFormat');
												} else {
													$(this).removeClass('dateFormat');
												}
											});
										}	 
										// replace text in element
										var selHTML = $(this).html().replace(_old,_new);
										$(this).html(selHTML);
									});
								}
							});
						} 
						
						
						// Translate Buttons
						// -----------------
						else if (this.buttons) {
							$.each(this.buttons, function(){
								var _old = this["English"];
								if (this[translateTo] != null) { 
									var _new = this[translateTo];
								}
								$('input[value="'+_old+'"]', container).each(function(){ 
									$(this).val(_new);
								});
							});
						} 
						
						
					});
					
					methods.formatDates($(container));
					methods.formatCurrency($(container));
					methods.showAllThings();
					
					// Run callback
					// ------------
					if (typeof callback == "function") {
						callback();
					}
				
				},
				
				error: function() {
					console.log("ERROR LOADING FILE: ",jsonFile);
					methods.showAllThings();
				}
				
			});
			
			// Translate AddThis
			var src = $('.addthis_button img').attr('src');
			if (typeof src != "undefined") {
				src = src.replace('en','fr');
				$('.addthis_button img').attr('src',src);
			}
			
			// Prevent French users from entering '.' or ',' in amount fields
			methods.fixDollarInputFields(container);
			
		});
		
	};
})(jQuery);