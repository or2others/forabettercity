// 전역변수 설정
var mainWidth;
var slideWidth;
var userID = "";
var currentSwiper="";
var color;
var colorDark;
var purchaseWidth;
var purchaseStatus="";
var boxWidth;
var boxHeight;
var boxStatus="";
var aboutIndex=0;
setWidth();

// main container 시작
var mainSwiper = new Swiper('.swiper_container', {
    direction: 'vertical',
    mousewheelControl : true
});

// list container 시작
var followSwiper = new Swiper('.swiper_container_follow', {
    slidesPerView: 'auto',
    centeredSlides: true,
    spaceBetween: mainWidth*0.05,
    mousewheelControl : true,
    scrollbar: '.swiper-scrollbar-follow',
    scrollbarHide: true
})
var popularSwiper = new Swiper('.swiper_container_popular', {
    slidesPerView: 'auto',
    centeredSlides: true,
    spaceBetween: mainWidth*0.05,
    mousewheelControl : true,
    scrollbar: '.swiper-scrollbar-popular',
    scrollbarHide: true
})
var newSwiper = new Swiper('.swiper_container_new', {
    slidesPerView: 'auto',
    centeredSlides: true,
    spaceBetween: mainWidth*0.05,
    mousewheelControl : true,
    scrollbar: '.swiper-scrollbar-new',
    scrollbarHide: true
})
var mySwiper = new Swiper('.swiper_container_my', {
    slidesPerView: 'auto',
    centeredSlides: true,
    spaceBetween: mainWidth*0.05,
    mousewheelControl : true,
    scrollbar: '.swiper-scrollbar-my',
    scrollbarHide: true
})

// 각각의 home 화면 (follow/popular/new/my)
function Home(){
        this.container  =$("<div>").addClass("home_container swiper-slide");
        this.prev       =$("<div>").addClass("home_prev").html('<i class="material-icons">keyboard_arrow_down</i>');
        this.title      =$("<div>").addClass("home_title");
        this.contents   =$("<div>").addClass("home_contents");
        this.add        =$("<div>").addClass("home_contents_add");
        this.next       =$("<div>").addClass("home_next").html('<i class="material-icons">keyboard_arrow_up</i>');
}

Home.prototype = {
        setTitle:       function(title){
                            this.title.html(title);
                        },
        setExplain:     function(explain){
                            this.contents.html(explain);
                        },
        setContents:    function(contents){
                            this.contents.append(contents);
                        },
        setAdd:         function(contents){
                            this.add.append(contents);
                        },
        hidePrev:       function(){
                            this.prev.hide();
                        },
        hideNext:       function(){
                            this.next.hide();
                        },
        buildStructure: function(){
                            this.container.append(this.prev);
                            this.container.append($("<div>").addClass("home_title_margin"));
                            this.container.append(this.title);
                            this.container.append($("<div>").addClass("home_contents_margin"));
                            this.container.append(this.contents);
                            this.container.append($("<div>").addClass("home_contents_margin"));
                            this.container.append(this.add);
                            this.container.append(this.next);
                            return this.container;
                        }
}

// 각각의 home 화면 설정
function initFollow(userID){
    if(userID==""){
        var welcome = new Home();
        welcome.setTitle("Welcome!");
        welcome.setExplain("환영합니다.<br>그림을 엽서로 보내거나 받아보세요.");
        welcome.hidePrev();
        followSwiper.appendSlide(welcome.buildStructure());
        $("#menu_follow").addClass("side_menu_major_inactive");
        delete welcome;
    }else{
        followSwiper.removeAllSlides();
        var followHome = new Home();
        var content1 =
            $("<div>").addClass("home_btn_follow").html("follows ").append($("<b>").html(" 12")).click(function(){initFollows()});
        var content2 =
            $("<div>").addClass("home_btn_follow").html("following ").append($("<b>").html(" 21")).click(function(){initFollowing()});
        followHome.setTitle("Follow");
        followHome.setExplain("가까운 사람들의 그림입니다.");
        followHome.setContents(content1);
        followHome.setContents(content2);
        followHome.hidePrev();
        followSwiper.appendSlide(followHome.buildStructure());
        delete followHome;
        delete content1;
        delete content2;
        $("#menu_follow").removeClass("side_menu_major_inactive");

        addPainting(followSwiper, 0, "follow");
    }
}

function initPopular(){
    var popularHome = new Home();
    popularHome.setTitle("Popular");
    popularHome.setExplain("가장 인기있는 그림입니다.");
    popularHome.setContents(totalPainting());
    popularSwiper.appendSlide(popularHome.buildStructure());
    delete popularHome;

    addPainting(popularSwiper, 0, "popular");
}

function initNew(){
    var newHome = new Home();
    newHome.setTitle("new");
    newHome.setExplain("새로 올라온 그림입니다.");
    newHome.setContents(totalPosted());
    newSwiper.appendSlide(newHome.buildStructure());
    delete newHome;

    addPainting(newSwiper, 0, "new");
}

function initMy(userID){
    if(userID==""){
        var myHome = new Home();
        var logInBtn = $("<div>").addClass("login_btn").html("Log in").click(function(){showLogin()});
        myHome.setTitle("my");
        myHome.setExplain("로그인해서 나와 팔로워의 그림을 확인하세요<br><br><br>");
        myHome.hideNext();
        myHome.setContents(logInBtn);
        mySwiper.appendSlide(myHome.buildStructure());
        delete myHome;
        delete logInBtn;
    }else{
        mySwiper.removeAllSlides();
        var myHome = new Home();
        myHome.setTitle("my");
        myHome.setExplain("내가 올리거나 포스트한 그림입니다.<br>여기에 자신을 소개할 문구를 넣어주세요. <i class='material-icons' style='font-size:1em'>create</i>");
        var content1 =
            $("<div>").addClass("home_btn_my").html("uploaded ").append($("<b>").html(" 5"))
        var content2 =
            $("<div>").addClass("home_btn_my").html("posted ").append($("<b>").html(" 14"))
        content1.click(function(){btnToggle(this)});
        content2.click(function(){btnToggle(this)});
        myHome.hideNext();
        myHome.setContents(content1);
        myHome.setContents(content2);
        mySwiper.appendSlide(myHome.buildStructure());
        delete myHome;
        delete content1;
        delete content2;

        addPainting(mySwiper, 0, "my");
    }
}


// 그림 목록 화면
function Structure(index){

        this.index              =index;
        this.container          =$("<div>").addClass("list_contents swiper-slide");

        this.listInfo           =$("<div>").addClass("list_info");
        this.listInfoRow_1      =$("<div>").addClass("list_info_row");
        this.listInfoRow_2      =$("<div>").addClass("list_info_row");
        this.listInfoSentence   =$("<div>").addClass("list_info_sentence");
        this.listInfoPosted     =$("<div>").addClass("list_info_posted");
        this.listInfoDate       =$("<div>").addClass("list_info_date");

        this.listPainting       =$("<img>").addClass("list_painting").attr("index", this.index);

        this.bottom             =$("<div>").addClass("bottom_bar");
        this.listArtist         =$("<div>").addClass("list_artist_btn").click(function(){showPersonal("artist"+index)});
        this.listPostBtn        =$("<div>").addClass("list_post_btn").html("post it").click(function(){purchase()});

}
Structure.prototype = {
        setSentence:        function(sentence, wrighter){
                                this.listInfoSentence.html(sentence+"<br> <span class='list_info_sentence_wrighter'> by <b>"+wrighter+"</b></span>");
                            },
        setPostedNumber:    function(postedByPeople){
                                this.listInfoPosted.html("<span class='list_info_posted_num'>"+postedByPeople+"</span> people already posted it")
                            },
        setDate:            function(date){
                                this.listInfoDate.html(date)
                            },
        setPainting:        function(){
                                    if(mainWidth<729){
                                        this.listPainting.css({"width": mainWidth*0.8, "height": mainWidth*10/9});
                                    }else{
                                        this.listPainting.css({"width": "648px", "height": "900px"});
                                    }
                            // mobile 기기의 pixel ratio를 반영한 가변 이미지 반영
                                this.listPainting.attr("src", "p0-s.png");
                                if(window.devicePixelRatio<=1){
                                    this.listPainting.attr("srcset", "p0-m.png 729w, p0-s.png 405w");
                                }else if(window.devicePixelRatio>1 && window.devicePixelRatio<=2){
                                    this.listPainting.attr("srcset", "p0-l.png 675w, p0-m.png 405w, p0-s.png 225w");
                                }else if(window.devicePixelRatio>2){
                                    this.listPainting.attr("srcset", "p0-l.png 450w, p0-m.png 270w, p0-s.png 150w");
                                }
                                this.listPainting.swipe({
                                    swipeUp:function(){
                                        loadDetail($(this).attr("index"), color, colorDark);
                                    },
                                    tap:function(){
                                        loadDetail($(this).attr("index"), color, colorDark);
                                    },
                                    threshold:10
                                });
                            },
        // 수정 11.Mar
        // Lazy loading 이용
        setPaintingLazy:    function(){
                                    if(mainWidth<729){
                                        this.listPainting.css({"width": mainWidth*0.8, "height": mainWidth*10/9});
                                    }else{
                                        this.listPainting.css({"width": "648px", "height": "900px"});
                                    }
                                    this.listPainting.attr("data-src", "p"+(this.index%5)+".png");
                                    this.listPainting.addClass("swiper-lazy");
                                    this.listPainting.swipe({
                                        swipeUp:function(){
                                            loadDetail($(this).attr("index"), color, colorDark);
                                        },
                                        tap:function(){
                                            loadDetail($(this).attr("index"), color, colorDark);
                                        },
                                        threshold:10
                                    });
                            },
        setColor:           function(color){
                                this.bottom.css("background-color", color);
                                this.listPostBtn.css("color", color);
                            },
        setArtist:          function(){
                                this.listArtist.html("artist"+this.index);
                            },
        buildStructure:     function(){
                                // 삭제 13.Mar
                                this.listInfoRow_1.append(this.listInfoSentence);
                                this.listInfo.append(this.listInfoRow_1);
                                this.listInfoRow_2.append(this.listInfoPosted);
                                this.listInfoRow_2.append(this.listInfoDate);
                                this.listInfo.append(this.listInfoRow_2);
                                this.container.append(this.listInfo);
                                this.container.append(this.listPainting);
                                this.container.append(this.bottom);
                                this.container.append(this.listArtist);
                                this.container.append(this.listPostBtn);

                                return this.container;
                            }
}

// 현재 슬라이드 위치에서 앞으로 5개의 슬라이드가 없으면 새로 생성 (무한스크롤)
function addPainting(swiper, currentIndex, type){
    if(swiper.slides.length<currentIndex+5 && swiper.slides.length<=20){
        for(swiper.slides.length ; swiper.slides.length < currentIndex+5 ;){
            if(swiper.slides.length > 20){
                break;
            }
            var newSlide = new Structure(swiper.slides.length);
            newSlide.setSentence(newSlide.index+"번째 그림에 대한 설명입니다. <br> 200자 까지 적을 수 있습니다.", "wrighter");
            newSlide.setPostedNumber(newSlide.index);
            newSlide.setDate("11. Nov");
            newSlide.setArtist();
            if(type=="follow"){
                newSlide.setColor("hsl(200,60%,20%)");
            }else if(type=="popular"){
                newSlide.setColor("hsl(330,60%,20%)");
            }else if(type=="new"){
                newSlide.setColor("hsl(90,60%,20%)");
            }else if(type=="my"){
                newSlide.setColor("hsl(250,60%,20%)");
            }
            newSlide.setPainting(); // 수정 13.Mar
            swiper.appendSlide(newSlide.buildStructure());
            delete newSlide;
        }
    }
}

followSwiper.on("onSlideChangeStart", function(swiper){if(userID!=="")addPainting(swiper, swiper.activeIndex, "follow")});
popularSwiper.on("onSlideChangeStart", function(swiper){addPainting(swiper, swiper.activeIndex, "popular")});
newSwiper.on("onSlideChangeStart", function(swiper){addPainting(swiper, swiper.activeIndex, "new")});
mySwiper.on("onSlideChangeStart", function(swiper){if(userID!=="")addPainting(swiper, swiper.activeIndex, "my")});

// 개인페이지 생성

var personal = "";
var isPersonal = false;

function initPersonal(username){
        var personalHome = new Home();
        personalHome.setTitle(username);
        personalHome.setExplain(username + "님이 포스트하거나 업로드한 그림들입니다.");
        var content1 =
            $("<div>").addClass("home_btn_my").html("uploaded ").append($("<b>").html(" 5"))
        var content2 =
            $("<div>").addClass("home_btn_my").html("posted ").append($("<b>").html(" 14"))
        content1.click(function(){btnToggle(this)});
        content2.click(function(){btnToggle(this)});
        personalHome.hideNext();
        personalHome.setContents(content1);
        personalHome.setContents(content2);
        personal.swiper.appendSlide(personalHome.buildStructure());
        delete personalHome;
        delete content1;
        delete content2;

        addPainting(personal.swiper, 0, "my");
}

function Personal(username){
    this.container  = $("<div>").addClass("personal_container").addClass("swiper-slide");
    this.list       = $("<div>").addClass("list_container").addClass("swiper_container_personal");
    this.homeBtn    = $("<div>").addClass("home_btn").css("font-weight", 700).html(username);
    this.bottom     = $("<div>").addClass("bottom_bar").css("background-color", "hsl(250,60%,20%)");
    this.wrapper    = $("<div>").addClass("swiper-wrapper");
    this.scroll     = $("<div>").addClass("swiper-scrollbar").addClass("swiper-scrollbar-personal");
    this.swiper;
}
Personal.prototype = {
    setSwiper       : function(){
                        this.swiper = new Swiper('.swiper_container_personal', {
                            slidesPerView: 'auto',
                            centeredSlides: true,
                            spaceBetween: mainWidth*0.05,
                            mousewheelControl : true,
                            scrollbar: '.swiper-scrollbar-personal',
                            scrollbarHide: true,
                            // 수정 11.Mar
                            lazyLoading: true,
                            lazyLoadingInPrevNext: true,
                            lazyLoadingInPrevNextAmount: 3
                        })
                    },
    buildStructure  : function(){
                        this.list.append(this.homeBtn);
                        this.list.append(this.bottom);
                        this.list.append(this.wrapper);
                        this.list.append(this.scroll);
                        this.container.append(this.list);

                        return this.container;
                    }
}

function showPersonal(username){
    if(personal!="")hidePersonal();
    isPersonal = true;
    color = "250,60%,50%";
    colorDark = "250,60%,20%";

    personal = new Personal(username);
    mainSwiper.appendSlide(personal.buildStructure());
    personal.setSwiper();
    personal.swiper.on("onSlideChangeStart", function(swiper){addPainting(swiper, swiper.activeIndex, "my")});
    personal.swiper.on("onTransitionEnd", function(swiper){listLock(swiper)});
    personal.swiper.on("onSetTranslate", function(swiper, translate){swipeToMenu(swiper, translate)});

    initPersonal(username);
    selectMenu(4);
}

function hidePersonal(){
    isPersonal = false;
    mainSwiper.removeSlide(4);
    personal = "";
}

// 최초 5개 미리 생성
initFollow(userID);
initPopular();
initNew();
initMy(userID);
initMenu(userID);


// mainSwiper의 첫항목과 마지막항목에서 스와이프 방지
function mainLock(mainSwiper){
    if(mainSwiper.activeIndex==0){
        mainSwiper.lockSwipeToPrev();
        color = "190,60%,50%";
        colorDark = "200,60%,20%";
        if(isPersonal){hidePersonal()};
    }else if(mainSwiper.activeIndex==1){
        mainSwiper.unlockSwipes();
        color = "330,60%,50%";
        colorDark = "330,60%,20%";
        if(isPersonal){hidePersonal()};
    }else if(mainSwiper.activeIndex==2){
        mainSwiper.unlockSwipes();
        color = "80,60%,45%";
        colorDark = "90,60%,20%";
        if(isPersonal){hidePersonal()};
    }else if(mainSwiper.activeIndex==3){
        mainSwiper.lockSwipeToNext();
        color = "250,60%,50%";
        colorDark = "250,60%,20%";
        if(isPersonal){hidePersonal()};
    }
    currentSwiper="";
};


// list 상태에서 mode container 스와이프 방지 && 마우스휠 해제/설정 && 페이지네이션 show/hide
function listLock(swiper){
    if(swiper.isBeginning){
        if(mainSwiper.isBeginning){
            mainSwiper.unlockSwipeToNext();
        }else if(mainSwiper.isEnd){
            mainSwiper.unlockSwipeToPrev();
        }else{
            mainSwiper.unlockSwipes();
        }
        swiper.disableMousewheelControl();
        $(".swiper-scrollbar").hide();
        $(".home_btn").hide()
        $(".bottom_bar").css("opacity", 0);
    }else{
        mainSwiper.lockSwipes();
        swiper.enableMousewheelControl();
        $(".swiper-scrollbar").show();
        $(".home_btn").show()
        if(!fullImage){$(".bottom_bar").css("opacity", 1)};
        currentSwiper=swiper;
    }
}
mainSwiper.on("onTransitionEnd", function(mainSwiper){mainLock(mainSwiper)});
followSwiper.on("onTransitionEnd", function(swiper){listLock(swiper)});
popularSwiper.on("onTransitionEnd", function(swiper){listLock(swiper)});
newSwiper.on("onTransitionEnd", function(swiper){listLock(swiper)});
mySwiper.on("onTransitionEnd", function(swiper){listLock(swiper)});


// side menu 초기설정
function initMenu(userID){
    var sideLogin = $("#side_menu").find(".side_menu_login");
    if(userID==""){
        sideLogin.append($("<div>").addClass("login_btn").html("Log in").css("border-color", "rgb(100,100,100)").click(function(){showLogin()}));
    }else{
        sideLogin.empty()
        sideLogin.append($("<div>").addClass("side_menu_login_id").html(userID));
        sideLogin.append($("<div>").html("thisdayis@hotmail.com").click(function(){showProfile()}));
    }
}

// 로그인과 함께 다시 side menu 초기화
function logIn(){
    console.log("log in!!!");
    $(".login_container").hide();
    userID = "asummer";
    initFollow(userID);
    initMy(userID);
    initMenu(userID);

    mainSwiper.slideTo(0);
    mainSwiper.unlockSwipes();
    mainSwiper.lockSwipeToPrev();
}


// side menu 이동
sideMenu = $("#side_menu");
function sideOn(){
    sideMenu.css("right", mainWidth-sideMenu.width());
    sideMenu.find(".side_menu_btn").hide();
    sideMenu.find(".side_menu_close").show();

    mainSwiper.lockSwipes();
    $(".modal").show();
    $(".modal").on("touchstart mousedown click", function(e){
        e.stopPropagation();
        sideOff();
    });
}
function sideOff(){
    sideMenu.css("right", "100%");
    sideMenu.find(".side_menu_close").hide();
    sideMenu.find(".side_menu_btn").show();
    mainSwiper.unlockSwipes();

    $(".modal").hide();
}
sideMenu.find(".side_menu_btn").click(function(){
    sideOn();
});
sideMenu.find(".side_menu_close").click(function(){
    sideOff();
});
sideMenu.swipe({
    swipeLeft:function(){
        sideOff();
    }
});


//side menu에 이벤트 설정
function selectMenu(index){
    if(currentSwiper!==""){
        currentSwiper.slideTo(0);
    }
    sideOff();
    mainSwiper.slideTo(index);
}

$("#menu_follow").click(function(){
    selectMenu(0);
});
$("#menu_popular").click(function(){
    selectMenu(1);
});
$("#menu_new").click(function(){
    selectMenu(2);
});
$("#menu_my").click(function(){
    selectMenu(3);
});
$("#menu_upload").click(function(){
    upload();
    sideOff();
});
$("#menu_reward").click(function(){
    reward();
    sideOff();
});

// 초기 설정들
// 가로휠방지 && 페이지네이션숨김 && 위로스와이프방지
followSwiper.disableMousewheelControl();
popularSwiper.disableMousewheelControl();
newSwiper.disableMousewheelControl();
mySwiper.disableMousewheelControl();
mainSwiper.lockSwipeToPrev();
$(".swiper-scrollbar").hide();
$(".home_btn").hide()

// 화면 리사이즈할때 layout 재 설정
$(window).resize(function (){
	setWidth();
    sideOff();
    if(isDetail){
        setDetailLayout();
    }
});

var fullImage=false;

function setWidth() {
    mainWidth = $(window).width();
    mainHeight = $(window).height();
    if(mainWidth>729){
    	slideWidth=648;
        $(".list_painting").css({"width": "648px", "height": "900px"});
    }else{
    	slideWidth=mainWidth*0.8;
        $(".list_painting").css({"width": slideWidth, "height": mainWidth*10/9});
    }
    if(purchaseStatus!=""){
        setPurchase();
    }

    if($(".list_artist_btn").position()){
        if($(".list_artist_btn").position().top>($(".list_painting").position().top+$(".list_painting").height())){
            fullImage = true;
        }else{
            fullImage = false;
        }
    }

    setBox();
}

// upload/posted 버튼 설정
function btnToggle(btn){
    $(btn).toggleClass("home_btn_inactive");
}

// 전체그림/전체좋아요 숫자설정
function totalPainting(){
    var contents = $("<div>");
    contents.html("1776명이 paintee에서 좋아하는 그림을 찾았습니다.")
    return contents;
}
function totalPosted(){
    var contents = $("<div>");
    contents.html("195개 그림이 paintee에 있습니다.")
    return contents;
}

// list의 맨앞으로 되돌아가기 버튼
$(".home_btn").click(function(){
    currentSwiper.slideTo(0);
})

// 스와이프해서 메뉴창 띄우기
 function swipeToMenu(swiper, translate){
     if(translate>((mainWidth/2)-(slideWidth/3))){
         sideOn();
     }
 }
followSwiper.on("onSetTranslate", function(swiper, translate){swipeToMenu(swiper, translate)});
popularSwiper.on("onSetTranslate", function(swiper, translate){swipeToMenu(swiper, translate)});
newSwiper.on("onSetTranslate", function(swiper, translate){swipeToMenu(swiper, translate)});
mySwiper.on("onSetTranslate", function(swiper, translate){swipeToMenu(swiper, translate)});

// 모바일 웹브라우져를 전체화면으로 표시
$("#fullscreen_btn").click(function(){toggleFullScreen()});

function toggleFullScreen() {
    var doc = window.document;
    var docEl = doc.documentElement;

    var requestFull = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen;
    var cancelFull = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen;

    if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement) {
        requestFull.call(docEl);
        $("#fullscreen_btn").find("i").html("fullscreen_exit");
    }else {
        cancelFull.call(doc);
        $("#fullscreen_btn").find("i").html("fullscreen");
    }
}

// 상세화면의 구조
function DetailStructure(index){
    this.index          = index;

    this.detail             =$(".detail");

    this.detailBgContainer  =$("<div>").addClass("detail_bg_container");
    this.detailBgImg        =$("<img>").addClass("detail_bg_img");
    this.detailBgBottom     =$("<div>").addClass("detail_bg_bottom")

    this.detailContainer    =$("<div>").addClass("detail_container").addClass("swiper_container_detail");
    this.wrapper            =$("<div>").addClass("swiper-wrapper");

    this.detailMargin       =$("<div>").addClass("detail_margin").addClass("swiper-slide").swipe({
                                swipeUp:function(){
                                    detailSwiper.wrapper.css("transition-duration", "300ms");
                                    detailSwiper.setWrapperTranslate(postedLockBreakpoint);
                                    detailSwiper.unlockSwipes();
                                },
                                threshold:10
                            });
    this.detailCloseIcon    =$("<i>").addClass("material-icons").addClass("detail_margin_close").html("close");
    this.detailMarginIcon   =$("<i>").addClass("material-icons").addClass("detail_margin_guide").html("keyboard_arrow_up");

    this.detailArtist       =$("<div>").addClass("detail_artist").addClass("swiper-slide");
    this.detailArtistTop    =$("<div>").addClass("detail_artist_top");
    this.detailArtistBtn    =$("<div>").addClass("detail_artist_btn").click(function(){closeDetail();showPersonal("artist"+index);});
    this.detailArtistFollow =$("<div>").addClass("detail_artist_follow");
    this.detailArtistSentence=$("<div>").addClass("detail_artist_sentence");
    this.detailArtistDate   =$("<div>").addClass("detail_artist_date");
    this.detailArtistBottom =$("<div>").addClass("detail_artist_bottom").html("Share to ");
    this.sociconFacebook    =$("<span>").addClass("social_btn").addClass("socicon-facebook");
    this.sociconTwitter     =$("<span>").addClass("social_btn").addClass("socicon-twitter");
    this.sociconInstagram   =$("<span>").addClass("social_btn").addClass("socicon-instagram");
    this.sociconPinterest   =$("<span>").addClass("social_btn").addClass("socicon-pinterest");

    this.detailPostbar      =$("<div>").addClass("detail_postbar").addClass("swiper-slide");
    this.detailPostbarPostnum=$("<div>").addClass("detail_postbar_postnum");
    this.detailPostbarPostedNum=$("<span>").addClass("list_info_posted_num");

    this.detailPostBtn      =$("<div>").addClass("detail_post_btn").html("post it").click(function(){purchase()});
    // this.detailScroll       =$("<div>").addClass("swiper-scrollbar").addClass("swiper-scrollbar-detail");
    this.returnBtn          =$("<div>").addClass("return_btn").append($("<i>").addClass("material-icons").html("keyboard_backspace"));
}

DetailStructure.prototype   ={
    setBG       : function(index){
        this.detailBgImg.attr("src", "p"+index%5+".png");
    },
    setArtist   : function(index){
        this.detailArtistBtn.html("artist"+index);
    },
    setFollow   : function(index){
        this.detailArtistFollow.append('<i class="material-icons" style="font-size:12px">star</i> follow artist');
    },
    setSentence : function(index){
        this.detailArtistSentence.html("여기에는 작가가 쓴 한마디가 나오겠지?");
    },
    setDate     : function(index){
        this.detailArtistDate.html("05. May");
    },
    setPostedNum: function(index){
        this.detailPostbarPostedNum.html(1+index);
    },
    buildDetail : function(){
        this.setBG(this.index);
        this.setArtist(this.index);
        this.setFollow(this.index);
        this.setSentence(this.index);
        this.setDate(this.index);
        this.setPostedNum(this.index);

        this.detailBgContainer.append(this.detailBgImg);

        this.detailMargin.append(this.detailCloseIcon);
        this.detailMargin.append(this.detailMarginIcon);

        this.detailArtistTop.append(this.detailArtistBtn);
        this.detailArtistTop.append(this.detailArtistFollow);
        this.detailArtistSentence.append(this.detailArtistDate);
        this.detailArtistBottom.append(this.sociconFacebook);
        this.detailArtistBottom.append(this.sociconTwitter);
        this.detailArtistBottom.append(this.sociconInstagram);
        this.detailArtistBottom.append(this.sociconPinterest);
        this.detailArtist.append(this.detailArtistTop);
        this.detailArtist.append(this.detailArtistSentence);
        this.detailArtist.append(this.detailArtistBottom);

        this.detailPostbarPostnum.append(this.detailPostbarPostedNum).append(" people already posted it");
        this.detailPostbar.append(this.detailPostbarPostnum);

        this.wrapper.append(this.detailMargin);
        this.wrapper.append(this.detailArtist);
        this.wrapper.append(this.detailPostbar);

        this.detailContainer.append(this.wrapper);

        this.detail.append(this.detailBgContainer);
        this.detail.append(this.detailBgBottom);
        this.detail.append(this.detailContainer);
        this.detail.append(this.detailPostBtn);
        // this.detail.append(this.detailScroll);
    }
}

// 상세화면을 위한 변수들
var isDetail = false;
var postedLock = true;
var postedObj = new Array();
var postedIndex = new Array();
var postedLockBreakpoint;

// 디테일화면 표시
function loadDetail(index, color, colorDark){
    initDetail(index);
    setDetailLayout();

    $(".detail").show().css("top", 200);
    $(".detail").animate({top: 0, opacity: 1}, 200);
    $(".detail_bg_container").css("background-color", "hsl("+color+")");
    $(".detail_bg_bottom").css("background-color", "hsla("+colorDark+", 1)");
    $(".detail_artist").css("background-color", "hsla("+colorDark+", 0.7)");
    $(".detail_postbar").css("background-color", "hsla("+colorDark+", 1)");
    lockPosted(detailSwiper);
    callPosted(detailSwiper);
    detailSwiper.lockSwipes();
}

// 디테일화면 초기화
function initDetail(index){
    isDetail = true;
    postedLock = true;
    postedObj = new Array();
    postedIndex = new Array();

    this.detailStructure = new DetailStructure(index);
    this.detailStructure.buildDetail();

    this.detailSwiper = new Swiper('.swiper_container_detail', {
        direction: 'vertical',
        slidesPerView: 'auto',
        centeredSlides: false,
        freeMode: true,
        freeModeMomentumRatio: 0.4,
        freeModeMomentumBounceRatio: 0.5,
        mousewheelControl : true,
        // scrollbar: '.swiper-scrollbar-detail',
        // scrollbarHide: true
    });
    this.detailSwiper.on("onSliderMove", function(swiper){
        changeMode(swiper);
    });
    this.detailSwiper.on("onSetTranslate", function(swiper){
        changeMode(swiper);
    });
}

// 디테일화면 css값 설정
function setDetailLayout(){
    mainWidth = $(window).width();
    mainHeight = $(window).height();
    $(".detail_bg_container").css("height", mainHeight-50);
    $(".detail_bg_container").find("img").css("height", "100%");
    $(".detail_bg_img").css("left", (mainWidth-(mainHeight-50)*0.72)/2);
    $(".detail_margin").css("height", mainHeight-50);
    $(".detail_artist_sentence").css("width", mainWidth);
    $(".detail_artist_sentence").css("height", $(".detail_artist").height()-100);
    if(mainHeight<625){
        postedLockBreakpoint = -250;
        $(".detail_artist_sentence").css("height", 150);
    }else{
        postedLockBreakpoint = -(mainHeight*0.4);
        $(".detail_artist_sentence").css("height", -(postedLockBreakpoint)-100);
    };
}

// 디테일화면 닫기
function closeDetail(){
    if(isDetail){
        $(".detail").animate({top: 200, opacity: 0}, 200, "linear", function(){
            $(".detail").empty();
            $(".detail").hide().css("top", 0);
            delete detailStructure;
            delete detailSwiper;
        });
        isDetail = false;
    }
}

// 디테일화면의 스크롤 잠금/열기
function changeMode(swiper){
    var translate = swiper.translate;

    if(translate>50){
        closeDetail();
    }else if(translate<postedLockBreakpoint){
        if(postedLock){
            unlockPosted(swiper);
        }
        callPosted(swiper);
    }else if(translate>=postedLockBreakpoint){
        if(!postedLock){
            lockPosted(swiper);
        }
    }
}

// 디테일화면의 스크롤 잠금
function lockPosted(swiper){
    console.log("lock!");
    postedLock = true;
    // hidePosted(swiper);
    // swiper.params.freeMode = false;
    // $(".swiper-scrollbar-detail").hide();
    $(".detail_post_btn").appendTo($(".swiper_container_detail"))
}

// 디테일화면의 스크롤 열기
function unlockPosted(swiper){
    console.log("unlock!");
    postedLock = false;
    // swiper.params.freeMode = true;
    //$(".swiper-scrollbar-detail").show();
    $(".detail_post_btn").appendTo($(".detail_postbar"))
}

// Detail화면의 댓글 구조
function Posted(index){
    this.index      =index;
    this.container  =$("<div>").addClass("detail_posted swiper-slide").html("posted by ").css("background-color", "hsl("+colorDark+")");
    this.postee     =$("<div>").addClass("detail_postee_btn");
    this.sentence   =$("<div>").addClass("detail_posted_sentence").css("width", mainWidth*0.96);
}
Posted.prototype = {
    setPostee:      function(index){
        this.postee.html("postee");
    },
    setSentence:    function(index){
        this.sentence.html("여기서는 구매한 사람들이 남긴 한마디들을<br>볼수있을거야");
    },
    buildPosted:    function(){
        this.setPostee(this.index);
        this.setSentence(this.index);
        this.container.append(this.postee);
        this.container.append(this.sentence);

        return this.container;
    }
}

// Detail화면의 댓글 무한스크롤 (10개씩 추가)
function callPosted(swiper){
    var isPostedEnd;
    if(swiper.slides.length<swiper.activeIndex+10 && swiper.slides.length<=20){
        for(swiper.slides.length ; swiper.slides.length < swiper.activeIndex+10 ;){
            if(swiper.slides.length > 20){
                break;
            }
            if(!postedObj[swiper.slides.length-3]){
                var newPosted = new Posted(swiper.slides.length-3);
                postedObj[swiper.slides.length-3] = newPosted.buildPosted();
                postedIndex.push(swiper.slides.length);
                delete newPosted;
            }
            swiper.appendSlide(postedObj[swiper.slides.length-3]);
        }
    }
}

// Detail화면의 댓글 지우기
function hidePosted(swiper){
    swiper.removeSlide(postedIndex);
}

// 수정 11.Mar
// 특정 index로 바로 이동
function goPainting(username, page){
    showPersonal(username);
    for(personal.swiper.slides.length ; personal.swiper.slides.length <= page ;){
        var newSlide = new Structure(personal.swiper.slides.length);
        newSlide.setSentence(newSlide.index+"번째 그림에 대한 설명입니다. <br> 200자 까지 적을 수 있습니다.", "wrighter");
        newSlide.setPostedNumber(newSlide.index);
        newSlide.setDate("11. Nov");
        newSlide.setArtist();
        newSlide.setColor("hsl(250,60%,20%)");
        newSlide.setPaintingLazy(); // 수정 13.Mar
        personal.swiper.appendSlide(newSlide.buildStructure());
        delete newSlide;
    }
    personal.swiper.slideTo(page, 0);
}

// 수정 11.Mar
// 디테일화면 닫기
function closeDetail(){
    if(isDetail){
        if(get.page){
            goPainting(get.user, get.page);
            get = new Object();
        }
        $(".detail").animate({top: 200, opacity: 0}, 200, "linear", function(){
            $(".detail").empty();
            $(".detail").hide().css("top", 0);
            delete detailStructure;
            delete detailSwiper;
        });
        isDetail = false;
    }
}

// 수정 11.Mar
// get 방식으로 user, painting 가져오기
function getRequest() {
    if(location.search.length > 1) {
        var get = new Object();
        var ret = location.search.substr(1).split('&');
        for(var i = 0; i < ret.length; i++) {
            var r = ret[i].split('=');
            get[r[0]] = r[1];
        }
        return get;
    }else{
        return false;
    }
}
var get = getRequest();

// user만 있으면 개인페이지로 이동, user, page가 있으면 상세화면으로 이동
if(get){
    if(get.page){
        loadDetail(get.page, "200,60%,50%", "200,60%,20%");
        showPersonal(get.user);
    }else if(get.user){
        showPersonal(get.user);
    }
};


// 구매화면으로 이동
function purchase(){
    $(".purchase_container").show();
    $(".purchase_pay_btn").click(function(){payment()});
    purchaseStatus = "sentence";
    setWidth();
}

function setPurchase(){
    if(mainWidth<500){
        purchaseWidth = mainWidth*0.9;
        if(purchaseStatus!="address"){
            $(".purchase_box").css("left", mainWidth*0.1);
            $(".purchase_next_btn").show();
        }else{
            $(".purchase_box").css("left", -purchaseWidth);
            $(".purchase_prev_btn").show();
        }
    }else if(mainWidth<950){
        purchaseWidth = 450;
        if(purchaseStatus!="address"){
            $(".purchase_box").css("left", mainWidth*0.1);
            $(".purchase_next_btn").show();
        }else{
            $(".purchase_box").css("left", mainWidth*0.9-900);
            $(".purchase_prev_btn").show();
        }
    }else{
        purchaseWidth = 450;
        $(".purchase_box").css("left", (mainWidth-900)/2);
        $(".purchase_next_btn").hide();
        $(".purchase_prev_btn").hide();
    }
    $(".purchase_box").width(purchaseWidth*2);
    $(".purchase_box_left").width(purchaseWidth);
    $(".purchase_box_right").width(purchaseWidth);
}

$(".purchase_next_btn").click(function(){
    purchaseStatus="address";
    if(mainWidth<500){
        $(".purchase_box").css("left", -purchaseWidth);
        $(".purchase_next_btn").hide();
        $(".purchase_prev_btn").show();
    }else if(mainWidth<950){
        $(".purchase_box").css("left", mainWidth*0.9-900);
        $(".purchase_next_btn").hide();
        $(".purchase_prev_btn").show();
    }
})
$(".purchase_prev_btn").click(function(){
    purchaseStatus="sentence";
    if(mainWidth<500){
        purchaseWidth = mainWidth*0.9;
        $(".purchase_box").css("left", mainWidth*0.1);
        $(".purchase_next_btn").show();
        $(".purchase_prev_btn").hide();
    }else if(mainWidth<950){
        purchaseWidth = 450;
        $(".purchase_box").css("left", mainWidth*0.1);
        $(".purchase_next_btn").show();
        $(".purchase_prev_btn").hide();
    }
})

// 결재화면
function payment(){
    purchaseStatus = "";
    boxStatus = "payment";
    $(".purchase_container").hide();
    $(".payment_container").show();
    initPayment();
    setBox();
}

function Payment(){
    this.title      = $("<div>").addClass("payment_title").addClass("popup_title");
    this.contents   = $("<div>").addClass("payment_contents").addClass("popup_contents");
    this.bottom     = $("<div>").addClass("payment_bottom").addClass("popup_bottom");
    this.sociconFacebook    =$("<span>").addClass("social_btn").addClass("socicon-facebook");
    this.sociconTwitter     =$("<span>").addClass("social_btn").addClass("socicon-twitter");
    this.sociconInstagram   =$("<span>").addClass("social_btn").addClass("socicon-instagram");
    this.sociconPinterest   =$("<span>").addClass("social_btn").addClass("socicon-pinterest");

}

Payment.prototype = {
    setTitle    : function(title){
        $(this.title).html(title);
    },
    setContents : function(contents){
        $(this.contents).html(contents);
    },
    setBottom   : function(bottom){
        $(this.bottom).html(bottom);
    },
    buildPayment : function(){
        $(".payment_box").append(this.title);
        $(".payment_box").append(this.contents);
        $(".payment_box").append(this.bottom);
    }
}

function initPayment(){
    $(".payment_box").empty();
    var payment = new Payment();
    payment.setTitle("Payment");
    payment.setContents("<span class='reward_money'>0/5</span><br>지금은 beta 운영기간입니다. 곧 정식서비스를 시작합니다.<br><br><br><b>beta 운영기간 중에는 5개까지 무료로 엽서를 구입할 수 있습니다.</b><br>정식 서비스가 시작되면 개수 제한없이 $2에 어떤 그림이든 가질 수 있습니다.<br><br>아래 구매버튼을 눌러 post를 계속하세요.");
    payment.setBottom("<div class='popup_cancle_btn payment_cancle_btn'><i class='material-icons'>edit</i><div class='purchase_btn_text'>edit address</div></div><div class='popup_btn payment_btn'><div class='purchase_btn_text'>Payment </div><i class='material-icons'>payment</i></div>");
    payment.buildPayment();
    $(".payment_btn").click(function(){
        completePayment();
    })
    delete payment;
}

function completePayment(){
    $(".payment_box").empty();
    var payment = new Payment();
    payment.setTitle("Thanks!");
    payment.setContents("곧 엽서가 발송됩니다.<br>하지만, 기다리세요, 조금 더 시간이 걸립니다.<br>구매한 엽서는 우편을 통해 배송됩니다. 우편은 충분히 빠르지 않습니다.<br>기다린 만큼 더 큰 기쁨이 될 수 있습니다.<br><br><br><b>Post한 그림을 친구들과 함께 하세요.</b><br><br>");
    payment.contents.append(payment.sociconFacebook.css("color", "rgb(80,80,80)"));
    payment.contents.append(payment.sociconTwitter.css("color", "rgb(80,80,80)"));
    payment.contents.append(payment.sociconInstagram.css("color", "rgb(80,80,80)"));
    payment.contents.append(payment.sociconPinterest.css("color", "rgb(80,80,80)"));
    payment.setBottom("<div class='popup_btn payment_btn'><div class='purchase_btn_text'>Go to my history </div><i class='material-icons'>person</i></div>");
    payment.buildPayment();
    $(".payment_btn").click(function(){
        $(".popup_container").hide();
        selectMenu(3);
        mySwiper.slideTo(1);
    })
    delete payment;
}


// 업로드/리워드가 표시되는 팝업창 사이즈 설정
function setBox(){
    if(boxStatus=="upload"){
        if(mainHeight>=400 && mainWidth >= 288){
            $(".popup_box").height(mainHeight*0.8);
            $(".popup_box").width($(".popup_box").height()*0.72);

            if($(".popup_box").width()>mainWidth*0.8){
                $(".popup_box").width(mainWidth*0.8);
                $(".popup_box").height(mainWidth*10/9);
            }
        }
    }else if(boxStatus=="about"){
        $(".about_wrapper").width(mainWidth*5);
        $(".about_card").width(mainWidth);
        $(".about_navi").css("left", (mainWidth/2)-(aboutIndex*140)-70);
    }
}

// 업로드화면
function upload(){
    boxStatus = "upload"
    $(".upload_container").show();
    initUpload();
    setBox();
}

function Upload(){
    this.title      = $("<div>").addClass("upload_title").addClass("popup_title");
    this.contents   = $("<div>").addClass("upload_contents").addClass("popup_contents");
    this.bottom     = $("<div>").addClass("upload_bottom").addClass("popup_bottom");
}

Upload.prototype = {
    setTitle    : function(title){
        $(this.title).html(title);
    },
    setContents : function(contents){
        $(this.contents).html(contents);
    },
    setBottom   : function(bottom){
        $(this.bottom).html(bottom);
    },
    buildUpload : function(){
        $(".upload_box").append(this.title);
        $(".upload_box").append(this.contents);
        $(".upload_box").append(this.bottom);
    }
}

function initUpload(){
    $(".upload_box").empty();
    var upload = new Upload();
    upload.setTitle("Upload Painting");
    upload.setContents("당신의 그림이 Post될 때 마다,<br>추가로 업로드할 수 있는 그림의 수가 늘어납니다.<br>지금까지 253회 Post된 당신은 최대 50개의 그림을 올릴 수 있고<br> 지금 <span class='reward_money'>7</span>개 의 그림을 더 올릴 수 있습니다.<br><br><br>업로드를 위해서는<br>가로 사이즈 <b>1080px</b> 세로 사이즈 <b>1440px</b><br>이상의 이미지가 필요합니다.<br><br><br><br><span style='color:rgb(150,0,0)'>타인의 저작물을 무단으로 업로드할 경우, 게시물에 대해 재재를 받을 수 있습니다. 자세한 사항은 <b>Terms & Policy</b> 항목을 확인하세요.</span>");
    upload.setBottom("<div class='popup_btn upload_btn'><div class='purchase_btn_text'>Select image file </div><i class='material-icons'>folder</i></div>");
    upload.buildUpload();
    $(".upload_btn").click(function(){
        failUpload();
    })
    delete upload;
}
function failUpload(){
    $(".upload_box").empty();
    var uploadFail = new Upload();
    uploadFail.setTitle("Upload Painting");
    uploadFail.setContents('고화질의 출력을 위해 더 큰 이미지가 필요합니다.<br><b>가로 사이즈 1080px 세로 사이즈 1440px</b><br>이상의 이미지가 필요합니다.');
    uploadFail.setBottom("<div class='popup_btn upload_btn'><div class='purchase_btn_text'>Select image file </div><i class='material-icons'>folder</i></div>");
    uploadFail.buildUpload();
    $(".upload_btn").click(function(){
        successUpload();
    })
    delete uploadFail;
}
function successUpload(){
    $(".upload_box").empty();
    var uploadSuccess = new Upload();
    uploadSuccess.setTitle("Upload Painting");
    uploadSuccess.setContents('성공적으로 그림이 등록되었습니다.<br>당신의 생각, 당신의 느낌을 그림과 함께 적어주세요.<br><div class="upload_sentence"><span class="character_counter">0/200</span><textarea class="upload_sentence_textarea" length="200"></textarea><input type="checkbox"> private</div>');
    uploadSuccess.setBottom("<div class='popup_cancle_btn upload_btn'><i class='material-icons'>folder</i><div class='purchase_btn_text'>Select again</div></div><div class='popup_btn upload_btn'><div class='purchase_btn_text'>Done </div><i class='material-icons'>done</i></div>");
    uploadSuccess.buildUpload();
    delete uploadSuccess;
}

// 리워드화면
function reward(){
    boxStatus = "reward";
    $(".reward_container").show();
    initReward();
    setBox();
}

function Reward(){
    this.title      = $("<div>").addClass("reward_title").addClass("popup_title");
    this.contents   = $("<div>").addClass("reward_contents").addClass("popup_contents");
    this.bottomMargin = $("<div>").addClass("popup_margin_bottom");
    this.bottom     = $("<div>").addClass("reward_bottom").addClass("popup_bottom");
}

Reward.prototype = {
    setTitle    : function(title){
        $(this.title).html(title);
    },
    setContents : function(contents){
        $(this.contents).html(contents);
    },
    setBottom   : function(bottom){
        $(this.bottom).html(bottom);
    },
    buildUpload : function(){
        $(".reward_box").append(this.title);
        $(".reward_box").append(this.contents);
        $(".reward_box").append(this.bottomMargin);
        $(".reward_box").append(this.bottom);
    }
}

function initReward(){
    $(".reward_box").empty();
    var reward = new Reward();
    reward.setTitle("Reward");
    reward.setContents("당신의 그림이 post될 때 마다 reward가 쌓입니다.<br> 지금까지 253회 post된 당신이 얻은 총 Reward는<br><span class='reward_money'>$63.25 </span>입니다.<br><br><br>지금 Reward를 신청하면 남은 <b>$53.25 </b>에<br><b>수수료 $5</b>가 제외된 금액을 받을 수 있습니다.<br>");
    reward.setBottom("<div class='popup_cancle_btn purchase_btn'><i class='material-icons'>folder</i><div class='purchase_btn_text'>Select again</div></div><div class='popup_btn reward_btn'><div class='purchase_btn_text'>Get reward now </div><i class='material-icons'>attach_money</i></div>");
    reward.buildUpload();
    $(".reward_btn").click(function(){
        checkReward();
    })
    delete reward;
}

function checkReward(){
    $(".reward_box").empty();
    var reward = new Reward();
    reward.setTitle("Reward");
    reward.setContents('아래 계좌로 지금 받을 수 있는 <b>$53.25</b> 에<br>reward <b>수수료 $5</b>를 제외한<br><br><span class="reward_money">$48.25</span> 이 입금됩니다.<br><br><br><select class="purchase_select" style="width:50%"><option value="1">City Bank</option></select><br><br><input type="text" class="purchase_input" placeholder="name of account holder"><br><input type="text" class="purchase_input" placeholder="account"><br>계좌명과 계좌번호를 정확하게 입력해주세요.<br>계좌명이 정확하지 않을 경우, 입금에 장애가 있을 수 있습니다.');
    reward.setBottom("<div class='popup_btn upload_btn'><div class='purchase_btn_text'>Done </div><i class='material-icons'>done</i></div>");
    reward.buildUpload();
}

// 팔로우즈/팔로잉 화면
function People(){
    this.title      = $("<div>").addClass("people_title").addClass("popup_title");
    this.contents   = $("<div>").addClass("people_contents").addClass("popup_contents");
}

People.prototype = {
    setTitle    : function(title){
        $(this.title).html(title);
    },
    buildUpload : function(){
        $(".people_box").append(this.title);
        $(".people_box").append(this.contents);
    }
}

function Following(){
    this.following  = $("<div>").addClass("people_list");
    this.name       = $("<div>").addClass("people_list_name");
    this.btn        = $("<div>").addClass("people_list_remove").html("<div class='people_list_btn_text'></div><i class='material-icons'>clear</i>");
    this.build      = function(name){
                        $(this.name).html(name);
                        $(this.following).append(this.name);
                        $(this.following).append(this.btn);
                        return this.following;
                    }
}

function addFollowing(name){
        var adder = new Following();
        $(adder.build(name)).appendTo($(".people_contents"));
        delete adder;
}

function Follows(){
    this.follows   = $("<div>").addClass("people_list");
    this.name       = $("<div>").addClass("people_list_name");
    this.btn        = $("<div>").addClass("people_list_add").html("<div class='people_list_btn_text'> </div><i class='material-icons'>add</i>");
    this.freind     = $("<div>").addClass("people_list_add").html("<div class='people_list_btn_text'> </div><i class='material-icons' style='color:rgba(120,120,120,0.5)'>done</i>");
    this.build      = function(name, isfriend){
                        $(this.name).html(name);
                        $(this.follows).append(this.name);
                        if(isfriend){
                            $(this.follows).append(this.freind);
                        }else{
                            $(this.follows).append(this.btn);
                        }
                        return this.follows;
                    }
}

function addFollows(name, isfriend){
        var adder = new Follows();
        $(adder.build(name, isfriend)).appendTo($(".people_contents"));
        delete adder;
}

function initFollows(){
    setBox();
    $(".people_container").show();
    $(".people_box").empty();
    var people = new People();
    people.setTitle("Follows");
    people.buildUpload();
    for(var i=0 ; i<20 ; i++){
        addFollows("name", i%3);
    }
}

function initFollowing(){
    boxStatus = "people";
    setBox();
    $(".people_container").show();
    $(".people_box").empty();
    var people = new People();
    people.setTitle("Following");
    people.buildUpload();
    for(var i=0 ; i<20 ; i++){
        addFollowing("name");
    }
}

// 프로필 수정화면
function showProfile(){
    boxStatus = "profile";
    setBox();
    sideOff();
    $(".profile_container").show();
}

// 로그인 화면
function showLogin(){
    $(".login_container").show();
}

$(".login_btn_main").click(function(){
    logIn();
});
$(".login_signup_btn").click(function(){
    $(".signup_container").show();
});
$(".signup_login_btn").click(function(){
    $(".signup_container").hide();
});
$(".login_help").click(function(){
    $(".loginhelp_container").show();
});
$(".help_login_btn").click(function(){
    $(".loginhelp_container").hide();
});
// 팝업 닫기
$(".return_btn").click(function(){
    $(".purchase_container").hide();
    $(".popup_container").hide();
    purchaseStatus = "";
    boxStatus = "";
})
$(".purchase_container").click(function(){
    $(".purchase_container").hide();
    purchaseStatus = "";
    boxStatus = "";
})
$(".purchase_box").click(function(e){
    e.stopPropagation();
})
$(".popup_container").click(function(){
    $(".purchase_container").hide();
    $(".popup_container").hide();
})
$(".popup_box").click(function(e){
    e.stopPropagation();
})

setWidth();

$(".home_next").click(function(){
    mainSwiper.slideNext();
})
$(".home_prev").click(function(){
    mainSwiper.slidePrev();
})

// 디테일 수정
$(".detail_margin").swipe({
    swipeUp:function(){
        detailSwiper.setWrapperTranslate(postedLockBreakpoint);
    },
    threshold:10
});

$(".detail_margin").click(function(){
    console.log("!");
})

//$("body").css("overflow", "hidden");
