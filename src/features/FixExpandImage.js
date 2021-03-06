AVE.Modules['FixExpandImage'] = {
    ID: 'FixExpandImage',
    Name: 'Fix expanding images',
    Desc: 'Let images expand over the sidebar and disallow the selection/highlighting of the image.',
    Category: 'Fixes',

    Enabled: false,

    Store: AVE.storage,

    RunAt: "load",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
        OverSidebar: {
            Type: 'boolean',
            Desc: 'Let images expand over the sidebard.',
            Value: true,
        },
    },

    SavePref: function (POST) {
        var _this = this;

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST[_this.ID]));
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        if (Opt != undefined) {
            Opt = JSON.parse(Opt);
            $.each(Opt, function (key, value) {
                _this.Options[key].Value = value;
            });
        }
        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.SetOptionsFromPref();

        if ($.inArray(AVE.Utils.currentPageType,
            ["frontpage", "set", "subverse", "thread",
             "domain", "search", "saved", "user-submissions", "user-comments"]) === -1) {
            this.Enabled = false;
        }

        if (this.Enabled) {
            this.Start();
        }
    },

    ImgMedia: "a[title='JPG'],a[title='PNG'],a[title='GIF']",//These are the only media that are resizable

    Start: function () {
        if (this.Options.OverSidebar.Value &&
            $.inArray(AVE.Utils.currentPageType, ["saved", "user-submissions", "user-comments"]) === -1) {
            /*
            !! THIS CSS FIX IS BORROWED FROM /V/SCRIBBLE 1.5 !!
            */
            AVE.Utils.AddStyle('\
                .usertext {\
                    font-size: small;\
                    overflow: auto;\
                }\
                .md {overflow: visible;}\
                /*.comment > .entry:has(ul.flat-list.buttons:nth-child(1):has(.first)) {margin-left:30px;}*/\
                .comment > .entry {margin-left:30px;}\
                .usertext {overflow: visible !important;}\
                .link-expando {\
                    overflow: visible;\
                    position: relative;\
                    z-index: 1;\
                }\
                .submission > .entry {margin-left: 59px;}\
                .entry {overflow: visible;}\
                .comment {overflow: visible;}\
                form > div.row {overflow:hidden;}');
        }

        this.Listeners();
    },

    Update: function () {
        if (this.Enabled) {
            this.Listeners();
        }
    },

    obsImgExp: null,

    Listeners: function () {
        if (this.obsImgExp) {
            this.obsImgExp.targets = $("div.expando, " + this.ImgMedia);
        }
        else {
            this.obsImgExp = new OnNodeChange($("div.expando, " + this.ImgMedia), function (e) {
                var img = $(e.target).find("img:first"); //In sub
                if (img.length === 0) { img = $(this).next("div.link-expando").find("img"); } //In thread

                if (img.length > 0) {
                    img.OnAttrChange(function () { window.getSelection().removeAllRanges(); });
                }
            });
        }
        this.obsImgExp.observe();
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['FixExpandImage'];
            var htmlStr = "";
            htmlStr += '<input ' + (_this.Options.OverSidebar.Value ? 'checked="true"' : "") + ' id="OverSidebar" type="checkbox"/><label for="OverSidebar"> '+_this.Options.OverSidebar.Desc+'</label>';
            return htmlStr;
        },
    },
};