AVE.Modules['HeaderFixedPos'] = {
    ID: 'HeaderFixedPos',
    Name: 'Fix header position',
    Desc: 'Set the subverse list header position as fixed.',
    Category: 'Fixes',
    Index: 99,
    Enabled: false,

    RunAt: 'load',

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
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

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        $(window).resize(function () {
            AVE.Utils.ListHeaderHeight = $('#sr-header-area').height();
        });

        AVE.Utils.ListHeaderHeight = $('#sr-header-area').height(); //23

        this.SetAltBackground();
    },

    SetAltBackground: function () {
        if(!AVE.Modules['InjectCustomStyle'] || !AVE.Modules['InjectCustomStyle'].Enabled){return;}

        var bg, border;
        //Subverse list bg
        bg = $("#sr-header-area").css("background-color");
        //If alpha channel isn't 1
        if (  bg === "transparent" ||
            bg[3] === "a" &&
            parseInt(bg.replace(")", "").split(",")[3], 10) !== 1){
            //general header background
            bg = $("div#header[role='banner']").css("background-color");
            if (bg === "transparent") {
                //If there is no colour nor any image set, we set it by default
                bg = AVE.Utils.CSSstyle === "dark" ? "rgba(41, 41, 41, 0.80)" : "rgba(246, 246, 246, 0.80)";
            }
        }

        border = $("#sr-header-area").css("borderBottomWidth") + " " +
            $("#sr-header-area").css("borderBottomStyle") + " " +
            $("#sr-header-area").css("borderBottomColor");

        $('.width-clip').css('position', 'fixed')
            .css("z-index", "1000")
            .css('border-bottom', border)//'1px solid ' + (AVE.Utils.CSSstyle == "dark" ? "#222" : "#DCDCDC"))
            .css("height", AVE.Utils.ListHeaderHeight + "px")
            .css("background-color", bg);//AVE.Utils.CSSstyle == "dark" ? "#333" : "#FFF");

        $('.width-clip').find("br:last").remove();//Chrome

        //If you have so many subscriptions that the "my subverses" list goes out of the screen, this is for you.
        var li_Height = $("ul.whoaSubscriptionMenu > li > ul:first").find("li > a").outerHeight();
        if (($(window).height() - AVE.Utils.ListHeaderHeight - li_Height) < $("ul.whoaSubscriptionMenu > li > ul:first").height()) {
            var li_Width = $("ul.whoaSubscriptionMenu > li > ul:first").find("li > a").outerWidth();
            var elPerCol = parseInt(($(window).height() - AVE.Utils.ListHeaderHeight) / li_Height, 10) - 1;
            var columns = $("ul.whoaSubscriptionMenu > li > ul:first").find("li").length / elPerCol - 1;

            for (var col = 0; col < columns; col++) {
                el = $("ul.whoaSubscriptionMenu > li > ul:nth(" + col + ")").find("li:gt(" + (elPerCol - 1) + ")");
                $('<ul style="width:' + li_Width + 'px;margin-left:' + (li_Width * (col + 1)) + 'px"></ul>')
                    .insertAfter("ul.whoaSubscriptionMenu > li > ul:nth(" + col + ")")
                    .append(el);
            }
        }
    }
};