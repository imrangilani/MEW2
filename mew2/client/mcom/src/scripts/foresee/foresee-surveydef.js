FSR.surveydefs = [{
    site: 'macys',
    name: 'mobile_web',
    invite: {
        when: 'onentry'
    },
    pop: {
        when: 'later'
    },
    criteria: {
        sp: 20,
        lf: 1
    },
    include: {
        urls: ['.']
    }
}];
FSR.properties = {
    repeatdays: 90,

    repeatoverride: false,

    altcookie: {},

    language: {
        locale: 'en'
    },

    exclude: {},

    zIndexPopup: 10000,

    ignoreWindowTopCheck: false,

    ipexclude: 'fsr$ip',

    mobileHeartbeat: {
        delay: 60, /*mobile on exit heartbeat delay seconds*/
        max: 3600 /*mobile on exit heartbeat max run time seconds*/
    },

    invite: {

        // Is this an MDOT Site?
        isMDOT: true,

        // Is this site zoomable? (aka pinch-able)
        isZoomable: false,

        // For no site logo, comment this line:
        siteLogo: "sitelogo.gif",

        dialogs: [[{
            reverseButtons: false,
            headline: "Tell us what you think!",
            blurb: "Can we email or text you later for a brief survey so we can improve your mobile experience?",
            attribution: "Conducted by ForeSee.",
            declineButton: "No thanks",
            acceptButton: "Yes, I'll help",
            locale: "en"
        }], [{
            reverseButtons: false,
            headline: "Thanks for helping!",
            blurb: "Please enter your mobile phone number or email address.  After your visit, we'll send you a link to a brief survey.  Text messaging rates apply.<br /><br />ForeSee's <a href='//www.foresee.com/privacy-policy.shtml' target='_blank'>Privacy Policy</a><br /><br />",
            attribution: "Conducted by ForeSee.",
            declineButton: "Cancel",
            acceptButton: "email/text me",
            locale: "en",
            mobileExitDialog: {
                support: "b", //e for email only, s for sms only, b for both
                inputMessage: "phone number or email",
                emailMeButtonText: "email me",
                textMeButtonText: "text me",
                fieldRequiredErrorText: "Enter a phone number or email address",
                invalidFormatErrorText: "Format should be: 123-456-7890 or name@domain.com"
            }
        }]],

        exclude: {
            //local: ['/registry/', '/bag/', '/account/', '/chkout/', '/checkoutswf/', '/service/', '/chkout/', '/store/'],
            // local: ['/account/signin?fromCheckout=fromCheckout', '/chkout/shipping', '/chkout/', '/store/', '//macys.circularhub.com/', '/registry/', '/account/'],
            local: ['/registry/', '/bag/', '/account/', '/chkout/', '/checkoutswf/', '/service/', 'macys.com/$', 'fds.com/$', 'localhost:8080/$', 'cm_sp=mew_navigation-_-top_nav-_-macys_icon', 'cookieCheck=true'],
            referrer: []
        },
        include: {
            local: ['.']
        },

        delay: 20,
        timeout: 0,

        hideOnClick: false,

        hideCloseButton: false,

        css: 'foresee-dhtml.css',

        hide: [],

        hideFlash: false,

        type: 'dhtml',
        /* desktop */
        // url: 'invite.html'
        /* mobile */
        url: 'invite-mobile.html',
        back: 'url'

        //SurveyMutex: 'SurveyMutex'
    },

    tracker: {
        width: '690',
        height: '415',
        timeout: 3,
        adjust: true,
        alert: {
            enabled: true,
            message: 'The survey is now available.'
        },
        url: 'tracker.html'
    },

    survey: {
        width: 690,
        height: 600
    },

    qualifier: {
        footer: '<div div id=\"fsrcontainer\"><div style=\"float:left;width:80%;font-size:8pt;text-align:left;line-height:12px;\">This survey is conducted by an independent company ForeSee,<br>on behalf of the site you are visiting.</div><div style=\"float:right;font-size:8pt;\"><a target="_blank" title="Validate TRUSTe privacy certification" href="//privacy-policy.truste.com/click-with-confidence/ctv/en/www.foreseeresults.com/seal_m"><img border=\"0\" src=\"{%baseHref%}truste.png\" alt=\"Validate TRUSTe Privacy Certification\"></a></div></div>',
        width: '690',
        height: '500',
        bgcolor: '#333',
        opacity: 0.7,
        x: 'center',
        y: 'center',
        delay: 0,
        buttons: {
            accept: 'Continue'
        },
        hideOnClick: false,
        css: 'foresee-dhtml.css',
        url: 'qualifying.html'
    },

    cancel: {
        url: 'cancel.html',
        width: '690',
        height: '400'
    },

    pop: {
        what: 'survey',
        after: 'leaving-site',
        pu: false,
        tracker: true
    },

    meta: {
        referrer: true,
        terms: true,
        ref_url: true,
        url: true,
        url_params: false,
        user_agent: false,
        entry: false,
        entry_params: false
    },

    events: {
        enabled: true,
        id: true,
        codes: {
            purchase: 800,
            items: 801,
            dollars: 802,
            followup: 803,
            information: 804,
            content: 805
        },
        pd: 7,
        custom: {}
    },

    previous: false,

    analytics: {
        google_local: true,
        google_remote: false
    },

    cpps: {
        isAuthenticated: {
            init: 'none',
            source: 'variable',
            name: 'isAuth'
        },
        MEW_2_0: {
            source: 'cookie',
            name: 'm_sl',
            init: 'false'
        },
        Currency: {
            source: 'cookie',
            name: 'auth',
            init: 'false'
        },
        Shipping_Country: {
            source: 'cookie',
            name: 'auth',
            init: 'false'
        }
    },

    mode: 'first-party'
};
