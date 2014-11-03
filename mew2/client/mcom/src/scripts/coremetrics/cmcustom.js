/*
 * cmdatatagutils.js v4.0, 4/18/2005
 * $Id: cmdatatagutils - MASTER.txt 165590 2011-02-21 15:11:04Z abrink $
 * $Rev: 165590 $
 * Date			Imp. Eng.			Desc
 *									
 * 04/19/2011		HWhite				Create cmcustom.js
 * 06/04/2013       AAB				10413588,10340001 Customized cmCheckCMEM() to deobfuscate cm_lm_mo param from URL before passing registration tag. Pass certain extra field values as attributes
 * 07/09/2013		AAB				cmSetupOther to disable link impressions, add attributes to maketag request in shop5/shop9, add definition for pageelement/productelement, disable cm_useutf8 
 * 01/22/2013		AAB				change to useUTF=true (default in eluminate), fix to cm_lm_mo to allow for encoded '@' character as '%40' in URL
 */
 
cmSetupOther({"cm_TrackImpressions":""});
 
var cmReferrer;
var cmDestination;
var manual_cm_mmc;
var refURL;

function ParseRef (url) {
    var newURL=url;
	if (newURL.toLowerCase().indexOf("cm_ref=")>0){
		var paramString;
		var params;
		var goodParam;
		var keepParams = new Array();
		
		var paramIndex = newURL.indexOf("?");
	
		if (paramIndex > 0) {
			paramString = newURL.substring(paramIndex+1);
			params = paramString.split("&");

			for(var i=0; i<params.length; i++) {
				if (params[i].toLowerCase().indexOf("cm_ref")>-1) {
						goodParam = unescape(params[i]);
						if (goodParam.toLowerCase().indexOf("cm_ref=")>-1){
							goodParam=goodParam.substring(goodParam.toLowerCase().indexOf("cm_ref=")+7);
						}
				}
			}	
		}
	}
	return goodParam;
}

function cmCreateTechPropsTag(pageID, categoryID, cm_ven, cm_cat, cm_pla, cm_ite, linkShareID, custID, refURL,attributes) {
	if(pageID == null) { pageID = cmGetDefaultPageID(); }
	if (attributes){
		var cm_exAttr=new Array;
		cm_exAttr=attributes.split("-_-");
	}	
	if (cm_ven){
		this.manual_cm_mmc=cm_ven+"-_-"+cm_cat+"-_-"+cm_pla+"-_-"+cm_ite;
	}		
	cmMakeTag(["tid","6","pi",pageID,"cg",categoryID,"pc","Y","pv1",custID,"pv2",linkShareID,"cm_exAttr",cm_exAttr,"pv10",attributes]);
}

function cmCreatePageviewTag(pageID, categoryID, searchString, searchResults, cm_ven, cm_cat, cm_pla, cm_ite, linkShareID, custID, refURL,attributes) {
	if (pageID == null) { pageID = cmGetDefaultPageID(); }
	if (attributes){
		var cm_exAttr=new Array;
		cm_exAttr=attributes.split("-_-");
	}
	if (cm_ven){
		this.manual_cm_mmc=cm_ven+"-_-"+cm_cat+"-_-"+cm_pla+"-_-"+cm_ite;
	}		
	cmMakeTag(["tid","1","pi",pageID,"cg",categoryID,"se",searchString,"sr",searchResults,"pv1",custID,"pv2",linkShareID,"cm_exAttr",cm_exAttr,"pv10",attributes,"pv_a27",custID,"pv_a28",linkShareID]);
}

function cmCreateProductviewTag(productID, productName, categoryID, cm_ven, cm_cat, cm_pla, cm_ite,linkShareID, custID, refURL, cmCrossSell,totalReviewCount,avgRating,numberRatingsOnlyReviews,buyAgainPercentage,attributes) {
	if (attributes){
		var cm_exAttr=new Array;
		cm_exAttr=attributes.split("-_-");
	}	
	if (productName == null) {
		productName = "";
	}
	if (cm_ven){
		this.manual_cm_mmc=cm_ven+"-_-"+cm_cat+"-_-"+cm_pla+"-_-"+cm_ite;
	}		
	cmMakeTag(["tid","5","pi","PRODUCT: " + productName + " (" + productID + ")","pr",productID,"pm",productName,"cg",categoryID,"pc","Y","cm_vc",cmExtractParameter("cm_vc",document.location.href),"pr1",avgRating,"pv1",custID,"pv2",linkShareID,"pv13",cmCrossSell,"cm_exAttr",cm_exAttr,"li",10300,"ps1",productID,"ps2",productName,"ps3",categoryID,"ps4",totalReviewCount,"ps5",avgRating,"ps6",numberRatingsOnlyReviews,"ps7",buyAgainPercentage,"pr10",attributes,"cm_exAttr",cm_exAttr]);
}

function cmCreateBazaarViewTag(productID, productName,categoryID) {
     cmMakeTag(["tid","7","li",10301,"ps1",productID,"ps2",productName,"ps3",categoryID]);
}

function cmCreateMasterMemberTag(MasterProductID, MasterProductName, MasterCatID, IsMaster, custID) {
     cmMakeTag(["tid","7","li",55,"ps2",MasterProductID,"ps3",MasterProductName,"ps4",MasterCatID,"ps5",IsMaster,"ps6",custID]);
}

function cmCreateShopAction5Tag(productID, productName, productQuantity, productPrice, categoryID,MasterProductID, MasterProductName, MasterCatID, IsMaster, cmCrossSell,attributes) {

	productID = productID.toUpperCase();
	var pattern = /[^\-0-9\.]/gi;
    productPrice = productPrice.toString().replace(pattern, "");
	if (attributes){
		__ex=attributes.split("-_-");
	} else {
	__ex=new Array();
	}

	cmAddShop(["pr",productID,"pm",productName,"qt",productQuantity,"bp",productPrice,"cg",categoryID,"ha1",attributes ? cm_hex_sha1(attributes) : null,"at","5","tid","4","pc","N","sx1",MasterProductID,"sx2",MasterProductName,"sx3",cmCrossSell,"sx4",MasterCatID,"sx5",IsMaster,"sx10",attributes,"cmAttributes",attributes]);
}

function cmCreateShopAction9Tag(productID, productName, productQuantity,
				productPrice, customerID, orderID,
				orderTotal, categoryID, MasterProductID, MasterProductName, 
				MasterCatID, IsMaster, cmCrossSell, attributes) {

	productID = productID.toUpperCase();
	var pattern = /[^\-0-9\.]/gi;
	var pattern1 = /^\s+|\s+$/gi;
    productPrice = productPrice.toString().replace(pattern, "");
	orderTotal = orderTotal.toString().replace(pattern, "");
	productID = productID.toString().replace(pattern1, "");
	if (attributes){
		__ex=attributes.split("-_-");
	} else {
	__ex=new Array();
	}
	
	cmAddShop(["pr",productID,"pm",productName,"qt",productQuantity,"bp",productPrice,"cg",categoryID,"ha1",attributes ? cm_hex_sha1(attributes) : null,"cd",customerID,"on",orderID,"tr",orderTotal,"at","9","tid","4","pc","N","sx1",MasterProductID,"sx2",MasterProductName,"sx3",cmCrossSell,"sx4",MasterCatID,"sx5",IsMaster,"sx10",attributes,"cmAttributes",attributes]);
	cmCalcSKUString();
}
function cmCreateOrderTag(orderID, orderTotal, orderShipping, customerID, 
			  customerCity, customerState, customerZIP, custID, attributes) {
	var pattern = /[^\-0-9\.]/gi;
    orderShipping = orderShipping.toString().replace(pattern, "");
	orderTotal = orderTotal.toString().replace(pattern, "");
	if (attributes){
		var cm_exAttr=new Array;
		cm_exAttr=attributes.split("-_-");
	}	
	cmMakeTag(["tid","3","osk",__skuString,"on",orderID,"tr",orderTotal,"sg",orderShipping,"cd",customerID,"ct",customerCity,"sa",customerState,"zp",customerZIP,"or1",custID,"cm_exAttr",cm_exAttr,"or10",attributes,"o_a14",custID]);
	__skuString = "";
}

function cmCreateRegistrationTag(customerID, customerEmail, customerCity,
				customerState, customerZIP, customerGender, newsletterName, 
				subscribe) {
	cmMakeTag(["tid","2","cd",customerID,"em",customerEmail,"ct",customerCity,"sa",customerState,"zp",customerZIP,"gd",customerGender,"nl",newsletterName,"sd",subscribe]);
}

function cmCreateUserErrorTag(pageID, categoryID, mMsgCode, mMsgType, mMsgClass, mMsgDesc, mServerName, mCloneName) {
     cmMakeTag(["tid","7","li",52,"ps2",pageID,"ps3",categoryID,"ps4",mMsgCode,"ps5",mMsgType,"ps6",mMsgClass,"ps7",mMsgDesc,"ps8",mServerName,"ps9",mCloneName]);
}

function cmCreateDelayedShopTag(productID, productName, productQuantity, productPrice, categoryID, cmReason, cmShipDays) {
     cmMakeTag(["tid","7","li",50,"ps2",productID,"ps3",productName,"ps4",productQuantity,"ps5",productPrice,"ps6",categoryID,"ps7",cmReason,"ps8",cmShipDays]);
}

function cmCreateDivisionTag(cmDivisionID, cmZipCode) {
     cmMakeTag(["tid","7","li",51,"ps2",cmDivisionID,"ps3",cmZipCode]);
}

function cmCreatePageElementTag(elementID, elementCategory,attributes) {
	if (attributes){
		var cm_exAttr=new Array;
		cm_exAttr=attributes.split("-_-");
	}
	cmMakeTag(["tid","15","eid",elementID,"ecat",elementCategory,"pflg","0","cm_exAttr",cm_exAttr]);
}

function cmCreateProductElementTag(elementID, elementCategory, productID, productCategoryID, elementLocation,attributes) {
	if (attributes){
		cm_exAttr=attributes.split("-_-");
	}
	cmMakeTag(["tid","15","eid",elementID,"ecat",elementCategory,"pflg","1","pid",productID,"pcat",productCategoryID,"eloc",elementLocation,"cm_exAttr",cm_exAttr]);
}

function myNormalizeURL(url, isHref) {
    var newURL = url;
	var pageURL=document.URL;
    if (isHref) {
		if (pageURL.toLowerCase().indexOf("www.") || pageURL.toLowerCase().indexOf("www1.")){
			pageURL=pageURL.substr(pageURL.indexOf(".")+1);
		}
		if (newURL.toLowerCase().indexOf("www.") || newURL.toLowerCase().indexOf("www1.")){
			newURL=newURL.substr(newURL.indexOf(".")+1);
		}

		if ((pageURL.toLowerCase().indexOf("/search/")>-1 || pageURL.toLowerCase().indexOf("/bag/")>-1) && (newURL.toLowerCase().indexOf("/product/")>-1 || newURL.toLowerCase().indexOf("/search/")>-1 || newURL.toLowerCase().indexOf("searchpagination")>-1)) {
			var whiteList = ["cm_re=", "cm_re_o=", "cm_sp=", "cm_sp_o=","cm_mmc=","cm_mmc_o="];
			var paramString;
			var paramIndex = newURL.indexOf("?");
			var params;
			var keepParams = new Array();
			
			if (paramIndex > 0) {
			paramString = newURL.substring(paramIndex+1);
			newURL = newURL.substring(0, paramIndex);
			params = paramString.split("&");
				for(var i=0; i<params.length; i++) {
					for(var j=0; j<whiteList.length; j++) {
						if (params[i].toLowerCase().indexOf(whiteList[j].toLowerCase()) == 0) {
							keepParams[keepParams.length] = params[i];
						}
					}
				}
			}
			if (newURL.toLowerCase().indexOf("searchpagination")>-1){
				newURL="/search/results.ognc";
			}
			else {
				newURL += "?" + keepParams.join("&");
			}
		}
		else{
		    var blackList = ["LinkShareID=", "LinkshareID=", "PartnerID=", "BannerID="];
			var paramString;
			var paramIndex = newURL.indexOf("?");
			var params;
			var keepParams = new Array();
			var goodParam;
		
			if (paramIndex > 0) {
			paramString = newURL.substring(paramIndex+1);
			newURL = newURL.substring(0, paramIndex);
			params = paramString.split("&");
		
			for(var i=0; i<params.length; i++) {
				goodParam = true;
				for(var j=0; j<blackList.length; j++) {
					if (params[i].toLowerCase().indexOf(blackList[j].toLowerCase()) == 0) {
						goodParam = false;
					}
				}
				if(goodParam == true) {
					keepParams[keepParams.length] = params[i];
				}
			}
			
			newURL += "?" + keepParams.join("&");
		
			}
		}

		if (defaultNormalize != null) {
			newURL = defaultNormalize(newURL, isHref);
		}	
	}
    return newURL;
}

function cmCheckCMEM(){
if(cmIndexOfParameter("cm_em",document.location.href)!=-1)
	{
		var a=cmExtractParameter("cm_em",document.location.href);
		if(a.indexOf(":")>-1)
		{
			a=a.substring(a.indexOf(":")+1);
		}
		cmCreateRegistrationTag(a,a);
	}
if(cmIndexOfParameter("cm_lm_mo",document.location.href)!=-1)
	{
		var a=cmExtractParameter("cm_lm_mo",document.location.href);
		if(a.indexOf(":")>-1)
		{
			a=a.substring(a.indexOf(":")+1);
		}
		a=a.replace("%40","@");
		a=_cmPartnerUtils.deObfuscate(a);
		cmCreateRegistrationTag(a,a);
	}
else if(cmIndexOfParameter("cm_lm",document.location.href)!=-1)
	{
		var a=cmExtractParameter("cm_lm",document.location.href);
		if(a.indexOf(":")>-1)
		{
			a=a.substring(a.indexOf(":")+1);
		}
		cmCreateRegistrationTag(a,a);
	}

}


