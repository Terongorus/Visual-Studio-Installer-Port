// (c) 2001 Microsoft Corporation
var bValidating = false;

//SET DIRECTION FUNCTION*************************************
//***********************************************************
function setDirection()
{
	if (document.dir == "rtl")
	{
		
		//SET CONTENT FRAME FLOW FOR RTL*********************
		//***************************************************
		var CatcHERa = document.all.tags("LI");
		var CatcHERb = document.all.tags("DIV");
		var CatcHERc = document.all.tags("SPAN");
		var CatcHERd = document.all.tags("INPUT");
		var CatcHERe = document.all.tags("TABLE");
		var CatcHERf = document.all.tags("BUTTON");
		var CatcHERg = document.all.tags("SELECT");
		var CatcHERg = document.all.tags("OBJECT");
		
		if (CatcHERa != null)
		{
		  for (var i = 0; i < CatcHERa.length; i++)
		  {
            if (CatcHERa[i].className.toLowerCase() == "list")
			{
			  CatcHERa[i].style.left = "0px";
			  CatcHERa[i].style.right = "-15px";
			}
		  }
		}
		
		if (CatcHERb != null)
		{
		  for (var i = 0; i < CatcHERb.length; i++)
		  {
            if (CatcHERb[i].className.toLowerCase() == "vertline")
			{
			  CatcHERb[i].style.left = "0px";
			  CatcHERb[i].style.right = "0px";
			}
            if (CatcHERb[i].className.toLowerCase() == "itemtextradiob")
			{
			  CatcHERb[i].style.left = "0px";
			  CatcHERb[i].style.right = "25px";
			}
            if (CatcHERb[i].className.toLowerCase() == "itemtextradioindenta")
			{
			  CatcHERb[i].style.left = "0px";
			  CatcHERb[i].style.right = "30px";
			}
            if (CatcHERb[i].className.toLowerCase() == "itemtextradioindentb")
			{
			  CatcHERb[i].style.left = "0px";
			  CatcHERb[i].style.right = "42px";
			}
            if (CatcHERb[i].className.toLowerCase() == "itemtextcheckboxa")
			{
			  CatcHERb[i].style.left = "0px";
			  CatcHERb[i].style.right = "15px";
			}
            if (CatcHERb[i].className.toLowerCase() == "itemtextcheckboxb")
			{
			  CatcHERb[i].style.left = "0px";
			  CatcHERb[i].style.right = "25px";
			}
            if (CatcHERb[i].className.toLowerCase() == "itemtextcheckboxindentb")
			{
			  CatcHERb[i].style.left = "0px";
			  CatcHERb[i].style.right = "42px";
			}
		  }
		}
		
		if (CatcHERc != null)
		{
		  for (var i = 0; i < CatcHERc.length; i++)
		  {
            if (CatcHERc[i].className.toLowerCase() == "vertline1")
			{
			  CatcHERc[i].style.left = "0px";
			  CatcHERc[i].style.right = "-1px";
			}
            if (CatcHERc[i].className.toLowerCase() == "itemtextindent")
			{
			  CatcHERc[i].style.left = "0px";
			  CatcHERc[i].style.right = "17px";
			}
		  }
		}
		
		if (CatcHERd != null)
		{
		  for (var i = 0; i < CatcHERd.length; i++)
		  {
            if (CatcHERd[i].className.toLowerCase() == "radio")
			{
			  CatcHERd[i].style.left = "0px";
			  CatcHERd[i].style.right = "6px";
			}
            if (CatcHERd[i].className.toLowerCase() == "checkbox")
			{
			  CatcHERd[i].style.marginLeft = "0px";
			  CatcHERd[i].style.marginRight = "-4px";
			}
            if (CatcHERd[i].className.toLowerCase() == "checkboxa")
			{
			  CatcHERd[i].style.marginLeft = "0px";
			  CatcHERd[i].style.marginRight = "10px";
			}
            if (CatcHERd[i].className.toLowerCase() == "sidebtn")
			{
			  CatcHERd[i].style.left = "0px";
			  CatcHERd[i].style.right = "9px";
			}
            if (CatcHERd[i].className.toLowerCase() == "sidebtn2")
			{
			  CatcHERd[i].style.left = "0px";
			  CatcHERd[i].style.right = "9px";
			}
            if (CatcHERd[i].className.toLowerCase() == "sidebtnb")
			{
			  CatcHERd[i].style.left = "0px";
			  CatcHERd[i].style.right = "9px";
			}
            if (CatcHERd[i].className.toLowerCase() == "checkboxindent")
			{
			  CatcHERd[i].style.marginLeft = "0px";
			  CatcHERd[i].style.marginRight = "23px";
			}
            if (CatcHERd[i].className.toLowerCase() == "radioindent")
			{
			  CatcHERd[i].style.marginLeft = "0px";
			  CatcHERd[i].style.marginRight = "23px";
			}
            if (CatcHERd[i].className.toLowerCase() == "radioindenta")
			{
			  CatcHERd[i].style.marginLeft = "0px";
			  CatcHERd[i].style.marginRight = "9px";
			}
            if (CatcHERd[i].className.toLowerCase() == "comment")
			{
			  CatcHERd[i].style.left = "0px";
			  CatcHERd[i].style.right = "8px";
			}
		  }
		}
		
		if (CatcHERe != null)
		{
		  for (var i = 0; i < CatcHERe.length; i++)
		  {
            if (CatcHERe[i].className.toLowerCase() == "linktextselected")
			{
			  CatcHERe[i].style.left = "0px";
			  CatcHERe[i].style.right = "10px";
			}
            if (CatcHERe[i].className.toLowerCase() == "linktextselectedindent")
			{
			  CatcHERe[i].style.left = "0px";
			  CatcHERe[i].style.right = "16px";
			}
            if (CatcHERe[i].className.toLowerCase() == "linktext")
			{
			  CatcHERe[i].style.left = "0px";
			  CatcHERe[i].style.right = "10px";
			}
            if (CatcHERe[i].className.toLowerCase() == "linktextindent")
			{
			  CatcHERe[i].style.left = "0px";
			  CatcHERe[i].style.right = "16px";
			}
		  }
		}
		
		if (CatcHERf != null)
		{
		  for (var i = 0; i < CatcHERf.length; i++)
		  {
            if (CatcHERf[i].className.toLowerCase() == "buttonclass")
			{
			  CatcHERf[i].style.marginLeft = "0px";
			  CatcHERf[i].style.marginRight = "8px";
			}
		  }
		}
		
		if (CatcHERg != null)
		{
		  for (var i = 0; i < CatcHERg.length; i++)
		  {
            if (CatcHERg[i].className.toLowerCase() == "sidebtn")
			{
			  CatcHERg[i].style.left = "0px";
			  CatcHERg[i].style.right = "9px";
			}
            if (CatcHERg[i].className.toLowerCase() == "sidebtn2")
			{
			  CatcHERg[i].style.left = "0px";
			  CatcHERg[i].style.right = "17px";
			}
            if (CatcHERg[i].className.toLowerCase() == "sidebtn2a")
			{
			  CatcHERg[i].style.left = "0px";
			  CatcHERg[i].style.right = "25px";
			}
            if (CatcHERg[i].className.toLowerCase() == "sidebtn2b")
			{
			  CatcHERg[i].style.left = "0px";
			  CatcHERg[i].style.right = "8px";
			}
		  }
		}
		
		if (CatcHERh != null)
		{
		  for (var i = 0; i < CatcHERh.length; i++)
		  {
            if (CatcHERh[i].className.toLowerCase() == "itemtext")
			{
			  CatcHERh[i].style.left = "0px";
			  CatcHERh[i].style.right = "8px";
			}
		  }
		}
		
		//SET INTRODUCTION FRAME FLOW FOR RTL****************
		//***************************************************
		
		//SET INTRODUCTION SUBHEADING TEXT ALIGNMENT*********
		document.all("SUBHEAD").style.marginLeft = "0px";
		document.all("SUBHEAD").style.marginRight = "10px";
		
		//SET INTRODUCTION IMAGE ALIGNMENT*******************
		document.all("IMAGE_TABLE").style.textAlign = "left";
	}
}

//SET POTENTIALLY DISABLED TABS FOR MOUSEOVER****************
//***********************************************************

function MouseOver(obj)
{

	if ((obj == null) || (typeof(obj) == "undefined"))
		return;
	
	else if ((obj.id != "DatSupBtn") || (obj.id != "BrowseBtn"))
	{
		obj.className = "activelink";
	}
	
	else if (obj.id == "DBSupport")
	{
		if (window.external.FindSymbol("APP_TYPE_DLG"))
		{ 
			obj.className = "inactivelink"; 
		}
	}
	
	else if ((obj.id == "CompoundDoc") || (obj.id == "DocTemp"))
	{
		if ((!window.external.FindSymbol("DOCVIEW")) || (window.external.IsSymbolDisabled("DOCVIEW")))
		{ 
			obj.className = "inactivelink";
		}
	} 
	else if (obj.id == "Notifications")
	{
		if (!GENERATE_FILTER.checked) 
		{ 
			obj.className = "inactivelink"; 
		}
	}
	else if (obj.id == "DatSupBtn")
	{
		if ((DB_VIEW_WITH_FILE.checked) || (DB_VIEW_NO_FILE.checked))
		{
			DatSupBtn.disabled = false;
			sdstitle.disabled = false;
		}
		
		else if ((!DB_VIEW_WITH_FILE.checked) && (!DB_VIEW_NO_FILE.checked))
		{
			DatSupBtn.disabled = true;
			sdstitle.disabled = true;
		}
	}
}

//SET POTENTIALLY DISABLED TABS FOR MOUSEOUT*****************
//***********************************************************
function MouseOut(obj)
{

	if ((obj == null) || (typeof(obj) == "undefined"))
		return;
	
	else if (obj.id == "DBSupport")
	{
	
		if (obj.className == "")
		{
			obj.className = ""
		}
		
		else
		{
			obj.className = "activelink"; 
		}
		
		if (window.external.FindSymbol("APP_TYPE_DLG")) 
		{ 
			obj.className = "inactivelink"; 
		}
	}
	
	else if ((obj.id == "CompoundDoc") || (obj.id == "DocTemp"))
	{
	
		if (obj.className == "")
		{
			obj.className = ""
		}
		
		else
		{
			obj.className = "activelink"; 
		}
		
		if ((!window.external.FindSymbol("DOCVIEW")) || (window.external.IsSymbolDisabled("DOCVIEW")))
		{ 
			obj.className = "inactivelink";
		}
	} 
	
	else if (obj.id == "Notifications")
	{
	
		if (obj.className == "")
		{
			obj.className = ""
		}
		
		else
		{
			obj.className = "activelink"; 
		}
		
		if (!window.external.FindSymbol("GENERATE_FILTER")) 
		{
			obj.className = "inactivelink";
		}
	}
	
	else if (obj.id == "DatSupBtn")
	{
	
		if ((DB_VIEW_WITH_FILE.checked) || (DB_VIEW_NO_FILE.checked))
		{
			DatSupBtn.disabled = false;
			sdstitle.disabled = false;
		}
		
		else if ((!DB_VIEW_WITH_FILE.checked) && (!DB_VIEW_NO_FILE.checked))
		{
			DatSupBtn.disabled = true;
			sdstitle.disabled = true;
		}
	}	
	
	else if (obj.id == "ServerOptions")
	{
	
		if (obj.className == "")
		{
			obj.className = ""
		}
		
		else
		{
			obj.className = "activelink"; 
		}
		
		if ((!window.external.FindSymbol("GENERATE_ISAPI")) && (!window.external.FindSymbol("COMBINE_PROJECTS")))
		{ 
			obj.className = "inactivelink"; 
		}
	}
	
	else if (obj.id == "AppOptions")
	{
		if (obj.className == "")
		{
			obj.className = ""
		}
		
		else
		{
			obj.className = "activelink"; 
		}
		
		if ((!window.external.FindSymbol("GENERATE_APP")) && (!window.external.FindSymbol("COMBINE_PROJECTS")))
		{
			obj.className = "inactivelink";
		}
	}
	
	else if (obj.id == "BrowseBtn")
	{
		obj.disabled = true;
		
		if ((GENERATE_ISAPI.checked) && (GENERATE_ISAPI.disabled == false))
		{
			obj.disabled = false;
		}
	}	
}

/******************************************************************************
 Description: OnKeyPress event handler for HTML pages
******************************************************************************/
function OnPress()
{
	// get outermost window for new UI with frames
	var oDefault = window;
	while (oDefault != oDefault.parent)
		oDefault = oDefault.parent;

	var bPreviousTab = false;

	if (event.keyCode != 0)
	{
		if (!event.repeat)
		{
			switch(event.keyCode)
			{
				// Enter
				case 13:
					if (event.srcElement.className && (event.srcElement.className.toLowerCase() == "activelink" || event.srcElement.className.toLowerCase() == "inactivelink"))
					{
						event.cancelBubble = true;
						event.srcElement.click();
						break;
					}
					if (event.srcElement.type == null ||
						(event.srcElement.type && event.srcElement.type != "button"))
						oDefault.FinishBtn.click();
					break;

				// Backspace		
				case 8:
					if (event.srcElement.type == null ||
						(event.srcElement.type && event.srcElement.type != "text"))
						event.returnValue = false;
					break;
					
				// Escape
				case 27:
					oDefault.CancelBtn.click();
					break;
			}
		}
	}
}

/*****************************************************************************
 Description: OnKeyDown event handler for HTML pages.
******************************************************************************/
function OnKey()
{
	//Get outermost window
	var oDefault = window;
	while (oDefault != oDefault.parent)
		oDefault = oDefault.parent;

	var bPreviousTab = false;

	if (event.keyCode != 0)
	{
		if (!event.repeat)
		{
			switch(event.keyCode)
			{
				// Enter key for <SELECT>, other controls handled in OnPress()
				case 13:
					if (event.srcElement.type && event.srcElement.type.substr(0,6) == "select")
						oDefault.FinishBtn.click();
					break;
					
				// Escape key for <SELECT>, other controls handled in OnPress()
				case 27:
					if (event.srcElement.type && event.srcElement.type.substr(0,6) == "select")
						oDefault.CancelBtn.click();
					break;

				//F1
				case 112:
					oDefault.HelpBtn.click();
					break;
					
				case 65:
				case 70:
				case 78:
					{
						if (event.ctrlKey)
							event.returnValue = false;
					}
					
					break;
					
				//Case for 33,9,34 have to be in this order
				//Page Up
				case 33:
					bPreviousTab = true;
					
				//Tab
				case 9:
					if (event.shiftKey)
						bPreviousTab = true;
						
				//Page Down
				case 34:
					if (event.ctrlKey && oDefault.tab_array != null && oDefault.tab_array.length > 1)
					{
						for (i = 0; i < oDefault.tab_array.length; i++)
						{
							if ((oDefault.tab_array[i].className.toLowerCase() == "activelink") || (oDefault.tab_array[i].className.toLowerCase() == "inactivelink"))
							{
								var j = 0;
								
								if (bPreviousTab)
								{
									j = i - 1;
									while (j != i)
									{
										if (j < 0)
										{
											j = oDefault.tab_array.length - 1;
										}
										if ((oDefault.tab_array[j].className.toLowerCase() == "activelink") || (oDefault.tab_array[j].className.toLowerCase() == "inactivelink"))
										{
											j--;
										}
										else
										{
											break;
										}
									}
									while ((oDefault.tab_array[j].className.toLowerCase() == "") || (oDefault.tab_array[j].className.toLowerCase() == "inactivelink"))
									{
										if (j == 0)
										{
											break;
										}
										if (oDefault.tab_array[j - 1].className.toLowerCase() == "inactivelink")
										{
											j--;
										}
										else
										{
											break;
										}
									}
									if (j == 0)
									{
										j = oDefault.tab_array.length - 1;
									}
									else
									{
										j = j - 1;
									}
								}
								else
								{
									j = i + 1;
									while (j != i)
									{
										if (j >= oDefault.tab_array.length)
										{
											j = 0;
										}
										if ((oDefault.tab_array[j].className.toLowerCase() == "activelink") || (oDefault.tab_array[j].className.toLowerCase() == "inactivelink"))
										{
											j++;
										}
										else
										{
											break;
										}
									}
									while ((oDefault.tab_array[j].className.toLowerCase() == "") || (oDefault.tab_array[j].className.toLowerCase() == "inactivelink"))
									{
										if (j == oDefault.tab_array.length - 1)
										{
											break;
										}
										if (oDefault.tab_array[j + 1].className.toLowerCase() == "inactivelink")
										{
											j++;
										}
										else
										{
											break;
										}
									}
									if (j == oDefault.tab_array.length - 1)
									{
										j = 0;
									}
									else
									{
										j = j + 1;
									}
								}
								//Prevent double notification when we pop up an error
								event.cancelBubble = true;
								oDefault.tab_array[j].click();
								break;
							}
						}
					}
					break;
							
				//Alt-Left arrow
				case 37:
					if (event.altKey)
						event.returnValue = false;
					break;
					
				//Alt-Right arrow
				case 39:					
					if (event.altKey)
						event.returnValue = false;
					break;

				default:
					break;				
			}
		}
	}
}

/******************************************************************************
 Description: KeyDown event handler for WizCombo control
    nKeyCode: Ascii code for key
******************************************************************************/
function OnWizComboKeyDown(nKeyCode)
{
	// Get outermost window
	var oDefault = window;
	while (oDefault != oDefault.parent)
		oDefault = oDefault.parent;

	switch(nKeyCode)
	{
		// Enter
		case 13:
			oDefault.FinishBtn.click();
			break;
			
		// Escape
		case 27:
			oDefault.CancelBtn.click();
			break;

		// F1
		case 112:
			oDefault.HelpBtn.click();
			break;
	}
}

//DO MOUSEOVER***********************************************
//***********************************************************
function MouseOverActiveText()
{
  	var e = window.event.srcElement;
	
	if (e && e.className.toLowerCase() == "activelink")
		{
		  e.className = "activelink2";
		}
}

//DO MOUSEOUT************************************************
//***********************************************************
function MouseOutActiveText()
{
  	var e = window.event.srcElement;
	
	if (e && e.className.toLowerCase() == "activelink2")
		{
		  e.className = "activelink";
		}
}


//SET MOUSEOVERS AND MOUSOUTS********************************
//***********************************************************
document.onmouseover = MouseOverActiveText;
document.onmouseout = MouseOutActiveText;
// SIG // Begin signature block
// SIG // MIIoRAYJKoZIhvcNAQcCoIIoNTCCKDECAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // GaS1/sPy4pJLgh6v9hgEgwMJnBviNIQmirRfwck7icig
// SIG // gg12MIIF9DCCA9ygAwIBAgITMwAABARsdAb/VysncgAA
// SIG // AAAEBDANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTI0MDkxMjIwMTExNFoX
// SIG // DTI1MDkxMTIwMTExNFowdDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEeMBwGA1UEAxMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // tCg32mOdDA6rBBnZSMwxwXegqiDEUFlvQH9Sxww07hY3
// SIG // w7L52tJxLg0mCZjcszQddI6W4NJYb5E9QM319kyyE0l8
// SIG // EvA/pgcxgljDP8E6XIlgVf6W40ms286Cr0azaA1f7vaJ
// SIG // jjNhGsMqOSSSXTZDNnfKs5ENG0bkXeB2q5hrp0qLsm/T
// SIG // WO3oFjeROZVHN2tgETswHR3WKTm6QjnXgGNj+V6rSZJO
// SIG // /WkTqc8NesAo3Up/KjMwgc0e67x9llZLxRyyMWUBE9co
// SIG // T2+pUZqYAUDZ84nR1djnMY3PMDYiA84Gw5JpceeED38O
// SIG // 0cEIvKdX8uG8oQa047+evMfDRr94MG9EWwIDAQABo4IB
// SIG // czCCAW8wHwYDVR0lBBgwFgYKKwYBBAGCN0wIAQYIKwYB
// SIG // BQUHAwMwHQYDVR0OBBYEFPIboTWxEw1PmVpZS+AzTDwo
// SIG // oxFOMEUGA1UdEQQ+MDykOjA4MR4wHAYDVQQLExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xFjAUBgNVBAUTDTIzMDAx
// SIG // Mis1MDI5MjMwHwYDVR0jBBgwFoAUSG5k5VAF04KqFzc3
// SIG // IrVtqMp1ApUwVAYDVR0fBE0wSzBJoEegRYZDaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jcmwvTWlj
// SIG // Q29kU2lnUENBMjAxMV8yMDExLTA3LTA4LmNybDBhBggr
// SIG // BgEFBQcBAQRVMFMwUQYIKwYBBQUHMAKGRWh0dHA6Ly93
// SIG // d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMvTWlj
// SIG // Q29kU2lnUENBMjAxMV8yMDExLTA3LTA4LmNydDAMBgNV
// SIG // HRMBAf8EAjAAMA0GCSqGSIb3DQEBCwUAA4ICAQCI5g/S
// SIG // KUFb3wdUHob6Qhnu0Hk0JCkO4925gzI8EqhS+K4umnvS
// SIG // BU3acsJ+bJprUiMimA59/5x7WhJ9F9TQYy+aD9AYwMtb
// SIG // KsQ/rst+QflfML+Rq8YTAyT/JdkIy7R/1IJUkyIS6srf
// SIG // G1AKlX8n6YeAjjEb8MI07wobQp1F1wArgl2B1mpTqHND
// SIG // lNqBjfpjySCScWjUHNbIwbDGxiFr93JoEh5AhJqzL+8m
// SIG // onaXj7elfsjzIpPnl8NyH2eXjTojYC9a2c4EiX0571Ko
// SIG // mhENF3RtR25A7/X7+gk6upuE8tyMy4sBkl2MUSF08U+E
// SIG // 2LOVcR8trhYxV1lUi9CdgEU2CxODspdcFwxdT1+G8YNc
// SIG // gzHyjx3BNSI4nOZcdSnStUpGhCXbaOIXfvtOSfQX/UwJ
// SIG // oruhCugvTnub0Wna6CQiturglCOMyIy/6hu5rMFvqk9A
// SIG // ltIJ0fSR5FwljW6PHHDJNbCWrZkaEgIn24M2mG1M/Ppb
// SIG // /iF8uRhbgJi5zWxo2nAdyDBqWvpWxYIoee/3yIWpquVY
// SIG // cYGhJp/1I1sq/nD4gBVrk1SKX7Do2xAMMO+cFETTNSJq
// SIG // fTSSsntTtuBLKRB5mw5qglHKuzapDiiBuD1Zt4QwxA/1
// SIG // kKcyQ5L7uBayG78kxlVNNbyrIOFH3HYmdH0Pv1dIX/Mq
// SIG // 7avQpAfIiLpOWwcbjzCCB3owggVioAMCAQICCmEOkNIA
// SIG // AAAAAAMwDQYJKoZIhvcNAQELBQAwgYgxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xMjAwBgNVBAMTKU1pY3Jvc29mdCBSb290
// SIG // IENlcnRpZmljYXRlIEF1dGhvcml0eSAyMDExMB4XDTEx
// SIG // MDcwODIwNTkwOVoXDTI2MDcwODIxMDkwOVowfjELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEoMCYGA1UEAxMfTWljcm9zb2Z0
// SIG // IENvZGUgU2lnbmluZyBQQ0EgMjAxMTCCAiIwDQYJKoZI
// SIG // hvcNAQEBBQADggIPADCCAgoCggIBAKvw+nIQHC6t2G6q
// SIG // ghBNNLrytlghn0IbKmvpWlCquAY4GgRJun/DDB7dN2vG
// SIG // EtgL8DjCmQawyDnVARQxQtOJDXlkh36UYCRsr55JnOlo
// SIG // XtLfm1OyCizDr9mpK656Ca/XllnKYBoF6WZ26DJSJhIv
// SIG // 56sIUM+zRLdd2MQuA3WraPPLbfM6XKEW9Ea64DhkrG5k
// SIG // NXimoGMPLdNAk/jj3gcN1Vx5pUkp5w2+oBN3vpQ97/vj
// SIG // K1oQH01WKKJ6cuASOrdJXtjt7UORg9l7snuGG9k+sYxd
// SIG // 6IlPhBryoS9Z5JA7La4zWMW3Pv4y07MDPbGyr5I4ftKd
// SIG // gCz1TlaRITUlwzluZH9TupwPrRkjhMv0ugOGjfdf8NBS
// SIG // v4yUh7zAIXQlXxgotswnKDglmDlKNs98sZKuHCOnqWbs
// SIG // YR9q4ShJnV+I4iVd0yFLPlLEtVc/JAPw0XpbL9Uj43Bd
// SIG // D1FGd7P4AOG8rAKCX9vAFbO9G9RVS+c5oQ/pI0m8GLhE
// SIG // fEXkwcNyeuBy5yTfv0aZxe/CHFfbg43sTUkwp6uO3+xb
// SIG // n6/83bBm4sGXgXvt1u1L50kppxMopqd9Z4DmimJ4X7Iv
// SIG // hNdXnFy/dygo8e1twyiPLI9AN0/B4YVEicQJTMXUpUMv
// SIG // dJX3bvh4IFgsE11glZo+TzOE2rCIF96eTvSWsLxGoGyY
// SIG // 0uDWiIwLAgMBAAGjggHtMIIB6TAQBgkrBgEEAYI3FQEE
// SIG // AwIBADAdBgNVHQ4EFgQUSG5k5VAF04KqFzc3IrVtqMp1
// SIG // ApUwGQYJKwYBBAGCNxQCBAweCgBTAHUAYgBDAEEwCwYD
// SIG // VR0PBAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8wHwYDVR0j
// SIG // BBgwFoAUci06AjGQQ7kUBU7h6qfHMdEjiTQwWgYDVR0f
// SIG // BFMwUTBPoE2gS4ZJaHR0cDovL2NybC5taWNyb3NvZnQu
// SIG // Y29tL3BraS9jcmwvcHJvZHVjdHMvTWljUm9vQ2VyQXV0
// SIG // MjAxMV8yMDExXzAzXzIyLmNybDBeBggrBgEFBQcBAQRS
// SIG // MFAwTgYIKwYBBQUHMAKGQmh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2kvY2VydHMvTWljUm9vQ2VyQXV0MjAx
// SIG // MV8yMDExXzAzXzIyLmNydDCBnwYDVR0gBIGXMIGUMIGR
// SIG // BgkrBgEEAYI3LgMwgYMwPwYIKwYBBQUHAgEWM2h0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvZG9jcy9w
// SIG // cmltYXJ5Y3BzLmh0bTBABggrBgEFBQcCAjA0HjIgHQBM
// SIG // AGUAZwBhAGwAXwBwAG8AbABpAGMAeQBfAHMAdABhAHQA
// SIG // ZQBtAGUAbgB0AC4gHTANBgkqhkiG9w0BAQsFAAOCAgEA
// SIG // Z/KGpZjgVHkaLtPYdGcimwuWEeFjkplCln3SeQyQwWVf
// SIG // Liw++MNy0W2D/r4/6ArKO79HqaPzadtjvyI1pZddZYSQ
// SIG // fYtGUFXYDJJ80hpLHPM8QotS0LD9a+M+By4pm+Y9G6XU
// SIG // tR13lDni6WTJRD14eiPzE32mkHSDjfTLJgJGKsKKELuk
// SIG // qQUMm+1o+mgulaAqPyprWEljHwlpblqYluSD9MCP80Yr
// SIG // 3vw70L01724lruWvJ+3Q3fMOr5kol5hNDj0L8giJ1h/D
// SIG // Mhji8MUtzluetEk5CsYKwsatruWy2dsViFFFWDgycSca
// SIG // f7H0J/jeLDogaZiyWYlobm+nt3TDQAUGpgEqKD6CPxNN
// SIG // ZgvAs0314Y9/HG8VfUWnduVAKmWjw11SYobDHWM2l4bf
// SIG // 2vP48hahmifhzaWX0O5dY0HjWwechz4GdwbRBrF1HxS+
// SIG // YWG18NzGGwS+30HHDiju3mUv7Jf2oVyW2ADWoUa9WfOX
// SIG // pQlLSBCZgB/QACnFsZulP0V3HjXG0qKin3p6IvpIlR+r
// SIG // +0cjgPWe+L9rt0uX4ut1eBrs6jeZeRhL/9azI2h15q/6
// SIG // /IvrC4DqaTuv/DDtBEyO3991bWORPdGdVk5Pv4BXIqF4
// SIG // ETIheu9BCrE/+6jMpF3BoYibV3FWTkhFwELJm3ZbCoBI
// SIG // a/15n8G9bW1qyVJzEw16UM0xghomMIIaIgIBATCBlTB+
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMSgwJgYDVQQDEx9NaWNy
// SIG // b3NvZnQgQ29kZSBTaWduaW5nIFBDQSAyMDExAhMzAAAE
// SIG // BGx0Bv9XKydyAAAAAAQEMA0GCWCGSAFlAwQCAQUAoIGu
// SIG // MBkGCSqGSIb3DQEJAzEMBgorBgEEAYI3AgEEMBwGCisG
// SIG // AQQBgjcCAQsxDjAMBgorBgEEAYI3AgEVMC8GCSqGSIb3
// SIG // DQEJBDEiBCAoWhE3VDCC1r/57btTn439Vp2rmVOcywNt
// SIG // IFHL9NkAHzBCBgorBgEEAYI3AgEMMTQwMqAUgBIATQBp
// SIG // AGMAcgBvAHMAbwBmAHShGoAYaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tMA0GCSqGSIb3DQEBAQUABIIBAAAae+3l
// SIG // BDtb7fujcL0jyNM6KUzocBcG0kv+eHHdFgJLL0sj01jv
// SIG // pfYn/bJqSUsNU2z5cS2gfGvihEMxhQM8akSs3/6Sg+vF
// SIG // Pag8AXi1tzyNGm2BI65YlD9+3offeeIStwFJWHNeVvtb
// SIG // E5OOMk2t/kg2S75gOJ5PVToYDlDQ3A7j84qxNLpGjRxQ
// SIG // az/9KViL/eKNI65v7baPX8oyFf9KNENv5ikj15JyLBoB
// SIG // 6DTb4pM7A7dVvZKnnng/qs2WTd9t2zWZsLKMhamFYgCN
// SIG // Hsi8ombKEf7cHz73krV2N+rHXGrvZaPoM7LzhcMV+2Me
// SIG // hREZDY6T6JDGNIDMLkfWYDyyCkOhghewMIIXrAYKKwYB
// SIG // BAGCNwMDATGCF5wwgheYBgkqhkiG9w0BBwKggheJMIIX
// SIG // hQIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBWgYLKoZIhvcN
// SIG // AQkQAQSgggFJBIIBRTCCAUECAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQg/HMbpEg25QROdKhVZiSn
// SIG // NjL5of9uykXn67SGr9EnQlICBmftI+t8HxgTMjAyNTA0
// SIG // MTUxOTI3MjQuNDI2WjAEgAIB9KCB2aSB1jCB0zELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0
// SIG // IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVkMScwJQYD
// SIG // VQQLEx5uU2hpZWxkIFRTUyBFU046NEMxQS0wNUUwLUQ5
// SIG // NDcxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFNlcnZpY2WgghH+MIIHKDCCBRCgAwIBAgITMwAAAf8S
// SIG // OHz3wWXWoQABAAAB/zANBgkqhkiG9w0BAQsFADB8MQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAeFw0yNDA3MjUx
// SIG // ODMxMTlaFw0yNTEwMjIxODMxMTlaMIHTMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJl
// SIG // bGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJzAlBgNVBAsT
// SIG // Hm5TaGllbGQgVFNTIEVTTjo0QzFBLTA1RTAtRDk0NzEl
// SIG // MCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vy
// SIG // dmljZTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoC
// SIG // ggIBAMnoldKQe24PP6nP5pIg3SV58yVj2IJPZkxniN6c
// SIG // 0KbMq0SURFnCmB3f/XW/oN8+HVOFQpAGRF6r5MT+UDU7
// SIG // QRuSKXsaaYeD4W4iSsL1/lEuCpEhYX9cH5QwGNbbvQkK
// SIG // oYcXxxVe74bZqhywgpg8YWT5ggYff13xSUCFMFWUfEbV
// SIG // JIM5jfW5lomIH19EfmwwJ53FHbadcYxpgqXQTMoJPytI
// SIG // d21E1M0B2+JD39spZCj6FhWJ9hjWIFsPDxgVDtL0zCo2
// SIG // A+qS3gT9IWQ4eT93+MYRi5usffMbiEKf0RZ8wW4LYckl
// SIG // xpfjU9XGQKhshIU+y9EnUe6kJb+acAzXq2yt2EhAypN7
// SIG // A4fUutISyTaj+9YhypBte+RwMoOs5hOad3zja/f3yBKT
// SIG // wJQvGIrMV2hl+EaQwWFSqRo9BQmcIrImbMZtF/cOmUpP
// SIG // Djl3/CcU2FiKn0bls3VIq9Gd44jjrWg6u13cqQeIGa4a
// SIG // /dCnD0w0cL8utM60HGv9Q9Sez0CQCTm24mm6ItdrrFfG
// SIG // sbZU/3QnjwuJ3XBXGq9b/n5wpYbPbtxZ+i5Bw0WXzc4V
// SIG // 4CwxMG+nQOMt7OhvoEN+aPdI9oumpmmvCbFf3Ahfog0h
// SIG // swMWWNbENZq3TJs8X1s1zerDyTMuPbXbFkyIGVlTkkvb
// SIG // lB4UmJG4DMZy3oil3geTAfUDHDknAgMBAAGjggFJMIIB
// SIG // RTAdBgNVHQ4EFgQUw/qV5P60/3exP9EBO4R9MM/ulGEw
// SIG // HwYDVR0jBBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIw
// SIG // XwYDVR0fBFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIw
// SIG // VGltZS1TdGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwG
// SIG // CCsGAQUFBwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9N
// SIG // aWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAx
// SIG // MCgxKS5jcnQwDAYDVR0TAQH/BAIwADAWBgNVHSUBAf8E
// SIG // DDAKBggrBgEFBQcDCDAOBgNVHQ8BAf8EBAMCB4AwDQYJ
// SIG // KoZIhvcNAQELBQADggIBADkjTeTKS4srp5vOun61iItI
// SIG // XWsyjS4Ead1mT34WIDwtyvwzTMy5YmEFAKelrYKJSK2r
// SIG // Yr14zhtZSI2shva+nsOB9Z+V2XQ3yddgy46KWqeXtYlP
// SIG // 2JNHrrT8nzonr327CM05PxudfrolCZO+9p1c2ruoSNih
// SIG // shgSTrwGwFRUdIPKaWcC4IU+M95pBmY6vzuGfz3JlRrY
// SIG // xqbNkwrSOK2YzzVvDuHP+GiUZmEPzXVvdSUazl0acl60
// SIG // ylD3t5DfDeeo6ZfZKLS4Xb3fPUWzrCTX9l86mwFe141e
// SIG // HGgoJQNm7cw8XMn38F4S7vRzFN3S2EwCPdYEzVBewQPa
// SIG // tRL0pQiipTfDddGOIlNJ8iJH6UcWMgG0cquUD2DyRxgN
// SIG // E8tDw/N2gre/UWtCHQyDErsF5aVJ8iMscKw8pYHzhssr
// SIG // FgcEP47NuPW6kDmD3acjnYEXvLV3Rq4A6AXrlTivnEQp
// SIG // V6YpjWMK+taGdv5DzM1a80VGDJAV3vVqnUns4fLcrbrp
// SIG // WGHESveaooRdIq0LOv1jkCZbUF+/ZcxVxPRRZZ/TIsdG
// SIG // rPguBz83fktGwTdwN10UTsAL9NeiArk/IWNSJ8lu48FZ
// SIG // jfjpENc3ouui61OUbQM9J08ceTnj8o502iLU0mODhrhl
// SIG // NUl2h+PSUj97fMhmAP76K21uFZ3ng+9tRYMGiU6BxZDi
// SIG // MIIHcTCCBVmgAwIBAgITMwAAABXF52ueAptJmQAAAAAA
// SIG // FTANBgkqhkiG9w0BAQsFADCBiDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEyMDAGA1UEAxMpTWljcm9zb2Z0IFJvb3QgQ2Vy
// SIG // dGlmaWNhdGUgQXV0aG9yaXR5IDIwMTAwHhcNMjEwOTMw
// SIG // MTgyMjI1WhcNMzAwOTMwMTgzMjI1WjB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMDCCAiIwDQYJKoZIhvcNAQEB
// SIG // BQADggIPADCCAgoCggIBAOThpkzntHIhC3miy9ckeb0O
// SIG // 1YLT/e6cBwfSqWxOdcjKNVf2AX9sSuDivbk+F2Az/1xP
// SIG // x2b3lVNxWuJ+Slr+uDZnhUYjDLWNE893MsAQGOhgfWpS
// SIG // g0S3po5GawcU88V29YZQ3MFEyHFcUTE3oAo4bo3t1w/Y
// SIG // JlN8OWECesSq/XJprx2rrPY2vjUmZNqYO7oaezOtgFt+
// SIG // jBAcnVL+tuhiJdxqD89d9P6OU8/W7IVWTe/dvI2k45GP
// SIG // sjksUZzpcGkNyjYtcI4xyDUoveO0hyTD4MmPfrVUj9z6
// SIG // BVWYbWg7mka97aSueik3rMvrg0XnRm7KMtXAhjBcTyzi
// SIG // YrLNueKNiOSWrAFKu75xqRdbZ2De+JKRHh09/SDPc31B
// SIG // mkZ1zcRfNN0Sidb9pSB9fvzZnkXftnIv231fgLrbqn42
// SIG // 7DZM9ituqBJR6L8FA6PRc6ZNN3SUHDSCD/AQ8rdHGO2n
// SIG // 6Jl8P0zbr17C89XYcz1DTsEzOUyOArxCaC4Q6oRRRuLR
// SIG // vWoYWmEBc8pnol7XKHYC4jMYctenIPDC+hIK12NvDMk2
// SIG // ZItboKaDIV1fMHSRlJTYuVD5C4lh8zYGNRiER9vcG9H9
// SIG // stQcxWv2XFJRXRLbJbqvUAV6bMURHXLvjflSxIUXk8A8
// SIG // FdsaN8cIFRg/eKtFtvUeh17aj54WcmnGrnu3tz5q4i6t
// SIG // AgMBAAGjggHdMIIB2TASBgkrBgEEAYI3FQEEBQIDAQAB
// SIG // MCMGCSsGAQQBgjcVAgQWBBQqp1L+ZMSavoKRPEY1Kc8Q
// SIG // /y8E7jAdBgNVHQ4EFgQUn6cVXQBeYl2D9OXSZacbUzUZ
// SIG // 6XIwXAYDVR0gBFUwUzBRBgwrBgEEAYI3TIN9AQEwQTA/
// SIG // BggrBgEFBQcCARYzaHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraW9wcy9Eb2NzL1JlcG9zaXRvcnkuaHRtMBMG
// SIG // A1UdJQQMMAoGCCsGAQUFBwMIMBkGCSsGAQQBgjcUAgQM
// SIG // HgoAUwB1AGIAQwBBMAsGA1UdDwQEAwIBhjAPBgNVHRMB
// SIG // Af8EBTADAQH/MB8GA1UdIwQYMBaAFNX2VsuP6KJcYmjR
// SIG // PZSQW9fOmhjEMFYGA1UdHwRPME0wS6BJoEeGRWh0dHA6
// SIG // Ly9jcmwubWljcm9zb2Z0LmNvbS9wa2kvY3JsL3Byb2R1
// SIG // Y3RzL01pY1Jvb0NlckF1dF8yMDEwLTA2LTIzLmNybDBa
// SIG // BggrBgEFBQcBAQROMEwwSgYIKwYBBQUHMAKGPmh0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9wa2kvY2VydHMvTWlj
// SIG // Um9vQ2VyQXV0XzIwMTAtMDYtMjMuY3J0MA0GCSqGSIb3
// SIG // DQEBCwUAA4ICAQCdVX38Kq3hLB9nATEkW+Geckv8qW/q
// SIG // XBS2Pk5HZHixBpOXPTEztTnXwnE2P9pkbHzQdTltuw8x
// SIG // 5MKP+2zRoZQYIu7pZmc6U03dmLq2HnjYNi6cqYJWAAOw
// SIG // Bb6J6Gngugnue99qb74py27YP0h1AdkY3m2CDPVtI1Tk
// SIG // eFN1JFe53Z/zjj3G82jfZfakVqr3lbYoVSfQJL1AoL8Z
// SIG // thISEV09J+BAljis9/kpicO8F7BUhUKz/AyeixmJ5/AL
// SIG // aoHCgRlCGVJ1ijbCHcNhcy4sa3tuPywJeBTpkbKpW99J
// SIG // o3QMvOyRgNI95ko+ZjtPu4b6MhrZlvSP9pEB9s7GdP32
// SIG // THJvEKt1MMU0sHrYUP4KWN1APMdUbZ1jdEgssU5HLcEU
// SIG // BHG/ZPkkvnNtyo4JvbMBV0lUZNlz138eW0QBjloZkWsN
// SIG // n6Qo3GcZKCS6OEuabvshVGtqRRFHqfG3rsjoiV5PndLQ
// SIG // THa1V1QJsWkBRH58oWFsc/4Ku+xBZj1p/cvBQUl+fpO+
// SIG // y/g75LcVv7TOPqUxUYS8vwLBgqJ7Fx0ViY1w/ue10Cga
// SIG // iQuPNtq6TPmb/wrpNPgkNWcr4A245oyZ1uEi6vAnQj0l
// SIG // lOZ0dFtq0Z4+7X6gMTN9vMvpe784cETRkPHIqzqKOghi
// SIG // f9lwY1NNje6CbaUFEMFxBmoQtB1VM1izoXBm8qGCA1kw
// SIG // ggJBAgEBMIIBAaGB2aSB1jCB0zELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0IElyZWxhbmQg
// SIG // T3BlcmF0aW9ucyBMaW1pdGVkMScwJQYDVQQLEx5uU2hp
// SIG // ZWxkIFRTUyBFU046NEMxQS0wNUUwLUQ5NDcxJTAjBgNV
// SIG // BAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2Wi
// SIG // IwoBATAHBgUrDgMCGgMVAKkTjGzEvCXFJXJz5MESxUT1
// SIG // xbKZoIGDMIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNV
// SIG // BAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQx
// SIG // HjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEm
// SIG // MCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENB
// SIG // IDIwMTAwDQYJKoZIhvcNAQELBQACBQDrqMURMCIYDzIw
// SIG // MjUwNDE1MTE0NDE3WhgPMjAyNTA0MTYxMTQ0MTdaMHcw
// SIG // PQYKKwYBBAGEWQoEATEvMC0wCgIFAOuoxRECAQAwCgIB
// SIG // AAICGoMCAf8wBwIBAAICEgkwCgIFAOuqFpECAQAwNgYK
// SIG // KwYBBAGEWQoEAjEoMCYwDAYKKwYBBAGEWQoDAqAKMAgC
// SIG // AQACAwehIKEKMAgCAQACAwGGoDANBgkqhkiG9w0BAQsF
// SIG // AAOCAQEAHcwf6BDnJP8CDjCbKGg82UXqlX2RhTaDLvwN
// SIG // ZgtfTI8mCqznvZJeCsCskD0KCXxNDocgC9zuwIMAhmQt
// SIG // TteDiFKwNKOwN4N541nmr7w3IXgI8H9K6rZvuCzAwEls
// SIG // 3YadfX/r/QlVaoMfl9kjr4mA5uXEqkzF6iQaDOgl4BT0
// SIG // q2ORTFUEd21w6ftHkDJf4FMhztXmRJxA5MeYvY9sT4eR
// SIG // vh3EY9xiiIORO3MYI2X9vU8ePEWnjoP4PQdXvVrTIdW5
// SIG // oTpSTsiEQr56y2ht23Ah65RnQhVpKnOLBGsozGYDxxFL
// SIG // /hQ5QWGAo2ebnA4GVaDEN0B+q1x6KiXVXDw50chxXjGC
// SIG // BA0wggQJAgEBMIGTMHwxCzAJBgNVBAYTAlVTMRMwEQYD
// SIG // VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25k
// SIG // MR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24x
// SIG // JjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBD
// SIG // QSAyMDEwAhMzAAAB/xI4fPfBZdahAAEAAAH/MA0GCWCG
// SIG // SAFlAwQCAQUAoIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZI
// SIG // hvcNAQkQAQQwLwYJKoZIhvcNAQkEMSIEIK2+yne23kbe
// SIG // 92Wf79RA2TM9vTbh0E99MInF2T0Lx2J5MIH6BgsqhkiG
// SIG // 9w0BCRACLzGB6jCB5zCB5DCBvQQg5DLvvskCd2msnCLj
// SIG // E+rwOyTbjGlTiN6g40hFfLqcp/0wgZgwgYCkfjB8MQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAf8SOHz3
// SIG // wWXWoQABAAAB/zAiBCC71gxGF2YuKKDL03iN2HaEbDTO
// SIG // hRP8vcn2gQOro+yTKTANBgkqhkiG9w0BAQsFAASCAgCy
// SIG // 0gfymHgVSBT+ZN4FwKH96AeacvTHV+vOxoD1ROxTaGAd
// SIG // pm8X+kiDwEQcKF2D0g0jRS33KZ3+6KWaJStdNuOUkwzu
// SIG // DIx1aqArLugvHqdpLv3yCEeFAERnQ1N/7uNWaTQt73gj
// SIG // EC/FE2fBMv6CRhuSGdeNZGcjyz4HVc4Edxht0C2NkETS
// SIG // UaEe9wSLDPJ1YLn+g3YL3zYXqIjn7fZgJtr66JQZoO0u
// SIG // b0bKTZu1tquhZ5cyCe62h1yNneJpk0CIje3I6b7Pc1uQ
// SIG // +nGlZ41wDhaPcHVudW5/7sTGud/A5E3aI352yIw7D6gj
// SIG // QKrwD7gLNGRTyvZQCJD/CPYnkidk7sT+EZi3Tf9RWlRL
// SIG // t2ZwQGh+VIuQpMiqI5qN6zv7BNi/dZVnFM0Crc978Oxm
// SIG // 7Rf8LoF9qTBZBxh9j0LjELFmTJjmQOLyju2SsS/7fUa1
// SIG // 9c2Ys6KJ4S6F7Si1XlU2nBc2s6b2q1kE8Ryo5BnKmxKZ
// SIG // Ptd61CbXlmCD2BMT7e+3YVAiFULOlFQrgKb97Pc/iKeD
// SIG // B90DzNOrOIf40U5stNPcjj10VkxDnhodPpSYo0izGw2i
// SIG // NKka0BMLLvpSG0kih98SuFvDEjVAYAvAfJAmkKsC1P0b
// SIG // 9pZ/zX/FlZOASlEpt1+TpWpTFCjU2WsslosgZN/ARc8P
// SIG // tS7XPs+BB3+iwOqWcYtYow==
// SIG // End signature block
