;(function(){
    var $container = $("#container"),
        pagesize = {
            width: $(window).width(),
            height: $(window).height()
        };
    var START = 1,MOVE = 2,END = 3,THRESHOLD = 30,
        QUIZ_DATA;
    var COLOR = {
        primary: "#157EFB" 
    };
    var options = {
        waittime: 200 
    };
    var tpl = {
        correct: '<div class="notice-wrap correct"><div class="icon-wrap sprite sprite-correct"></div></div>',
        wrong: '<div class="notice-wrap wrong"><div class="icon-wrap sprite sprite-wrong"></div></div>'
    };
    //container translateY 
    var conTranslatey = 0;
    function run(){
        InitModule.run();
        CoverModule.run(); 
        StartModule.run();
        PlayModule.run();
    }

    /***
        Init Module
    ***/
    var InitModule = function(){
        var con_padding = 15,con_top = 55;
        var question_tpl = $("#question-tpl").html(),
            answer_tpl = $("#answer-tpl").html(),
            $questions ;
        var answerVals = {
            bgs: ['bg1','bg2','bg3','bg4','bg5','bg6','bg7','bg8','bg9','bg10'],
            item_gap: 10,
            item_padding: 5,
            item_border: 1,
            contentClass: ["content-i-wrap","content-t-wrap"],
            padding_left: "padding-left-5",
            padding_right: "padding-right-5"
        };
        function run(){
            try{
                QUIZ_DATA = JSON.parse($("#data-tpl").html());
                createQuiz();
                relayout();
                ProgressModule.resetBar(0,QUIZ_DATA.questions.length);
                
                $questions = $(".question");
                //加载的一个个问题的答案
                LazyLoad.execute(0);
            }catch(e){
            
            }
        }
        function getQuestions(){
            return $questions; 
        }
        function createQuiz(){
            var result = [],que,ans,
                len = QUIZ_DATA.questions.length;
            //create cover
            CoverModule.setCoverData({title: QUIZ_DATA.title,img_src: QUIZ_DATA.img_src,desc: QUIZ_DATA.description});
            //create questions and answers
            for(var i=0;i<len;i++){
                que = createQuestionWidget(i); 
                ans = createAnswerWidget(i);
                que = que.replace("{%ans%}",ans);
                result.push(que);
            }
            result = result.join("");
            $(result).insertAfter($container.find(".cover"));
        }
        function relayout(){
            var pages = $("#container > li");
            pages.css({
                height: pagesize.height+"px"
            });
            $container.css({
                height: pagesize.height*pages.length + "px" 
            });
            
            //reset size answers
            function resetSizeAnswers($_this){
                var $answers_item = $_this.find(".ans-wrap  > li > div");
                var height1,height2,$item1,$item2;
                for(var i = 0;i<$answers_item.length;i+=2){
                    $item1 = $($answers_item[i]);
                    $item2 = $($answers_item[i+1]);
                    height1 = $item1.height();
                    height2 = $item2.height();
                    if(height1 > height2){
                        $item2.css("height",height1); 
                    }else {
                        $item1.css("height",height2); 
                    }
                }
            } 
            //reset top content
            function resetTopContent($_this){
                var $content_wrap = $_this.find(".content-wrap");
                if($content_wrap.height() < pagesize.height - con_top){
                    $content_wrap.css({
                        top: (pagesize.height - con_top - $content_wrap.height()) / 2 + "px"
                    }); 
                }
            }

            pages.each(function(){
                var $_this = $(this);
                if(!$_this.hasClass("question")){
                    return; 
                }
                resetSizeAnswers($_this);
                resetTopContent($_this);
            });
        }
        function createQuestionWidget(index){
            var data = {},style="",ratio,height;
            data.caption = QUIZ_DATA.questions[index].caption;
            data.img_src = QUIZ_DATA.questions[index].img_src;
            if(!data.img_src){
                style += "background-color:#000;height: 200px;"; 
            }else {
                ratio = QUIZ_DATA.questions[index].imgHeight / QUIZ_DATA.questions[index].imgWidth;
                height = (pagesize.width - con_padding * 2) * ratio;
                style += "height:"+height+"px";
            }
            data.style = style;
            var HTML = JTE.clear().assign("data",data).execute(question_tpl,"question_tpl"); 
            return HTML;
        }

        function createAnswerWidget(index){
            var data = {},result = [];
            var style = "",
                ratio,height;
            var answers = QUIZ_DATA.questions[index].answers;
            data.isExistsImg = answers[0].img_src ? true : false;
            data.contentClass = data.isExistsImg ? answerVals.contentClass[0]:answerVals.contentClass[1];

            for(var i = 0;i<answers.length;i++){
                data.caption = answers[i].caption; 
                data.id = i;
                data.correct = answers[i].results.is_correct;
                data.liClass = (i+1)%2 == 1 ? answerVals.padding_right : answerVals.padding_left;
                
                if(data.isExistsImg){   
                    ratio = answers[i].imgHeight / answers[i].imgWidth;
                    height = ratio * (pagesize.width-con_padding * 2 - answerVals.item_gap - answerVals.item_padding*2-answerVals.item_border*2)/2;
                    data.img_style = "height:"+height+"px";
                    data.img_src = answers[i].img_src;
                }else {
                    data.contentClass += " "+answerVals.bgs[(i+1)%(answerVals.bgs.length)];  
                }
                var HTML = JTE.clear().assign("data",data).execute(answer_tpl,"answer_tpl"); 
                result.push(HTML);
            }
            return result.join("");
        }
        return {
            run: run ,
            getQuestions: getQuestions
        }
    }();
        
    /**
        progress module
    **/
    var ProgressModule = function(){
        var $progress_wrap = $("#progress-wrap"),
            $bar = $progress_wrap.find(".bar"),
            $text = $progress_wrap.find(".text"); 
        var progress_width = $progress_wrap.find(".progressbar").width(),
            transition = "none"; 
        function resetBar(curnum,totals){
            transition = "all 200ms cubic-bezier(0.08, 0.8, 0.43, 0.9)";
            UtilModule.setTransition($bar,transition);
            $text.html(curnum+"/"+totals); 
            var width =( progress_width / totals ) * curnum;
            width = width <= 0 ? 8 : width; 
            $bar.css({
                width: width + "px" 
            });
        } 
        function entrances(){
            transition = "none";
            UtilModule.setTransition($bar,transition);
            UtilModule.animate($progress_wrap,"bounceInDown",{visibility: "visible"}); 
        }
        function exits(){
            transition = "none";
            UtilModule.setTransition($bar,transition);
            UtilModule.animate($progress_wrap,"fadeOut",{visibility: "hidden"}); 
        }
        return {
            resetBar: resetBar,
            entrances: entrances,
            exits: exits
        }
    }();

    /***
        Util Module 
    ***/
    var UtilModule = function(){
        function setTransition($obj,transition){
            $obj.css({
                "-webkit-transition": transition,
                "-moz-transition": transition,
                "-o-transition": transition,
                "-ms-transition": transition, 
                "transition": transition 
            }); 
        }
        function setTransform($obj,transform){
            $obj.css({
                "-webkit-transform": transform,
                "-moz-transform": transform,
                "-o-transform": transform,
                "-ms-transform": transform,
                "transform": transform
            }); 
        }
        function animate($obj,x,css){
            $obj.css(css).removeClass().addClass(x + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                  $(this).removeClass();
             });
        }
        return {
            setTransform: setTransform,
            setTransition: setTransition,
            animate: animate 
        }
    }();
    
    /***
        start quiz module
    ***/
    var StartModule = function(){
        var pos = {
                start: {},
                move: {},
                end: {},
                newstart: {
                    x: 0,
                    y: 0
                }
            },
            timer;
        function run(){
            var pages = $("#container > li:nth-of-type(1),#container > li:nth-of-type(2)");
            pages.bind("touchstart",function(e){
                if(CoverModule.getIsMove()){
                    return; 
                }
                pos.start.x = e.changedTouches[0].pageX;  
                pos.start.y = e.changedTouches[0].pageY;  
                pos.newstart.x = pos.start.x;
                pos.newstart.y = pos.start.y;
                
                showHandler($(this),null,START);
            });
            pages.bind("touchmove",function(e){
                if(CoverModule.getIsMove()){
                    return; 
                }
                pos.move.x = e.changedTouches[0].pageX; 
                pos.move.y = e.changedTouches[0].pageY;

                var distance = pos.move.y - pos.newstart.y;
                
                pos.newstart.x = pos.move.x;
                pos.newstart.y = pos.move.y;

                showHandler($(this),distance,MOVE);
            });
            pages.bind("touchend",function(e){
                if(CoverModule.getIsMove()){
                    return; 
                }
                pos.end.x = e.changedTouches[0].pageX;
                pos.end.y = e.changedTouches[0].pageY;

                var distance = pos.end.y - pos.start.y; 
                showHandler($(this),distance,END);
            });
        }
        function showHandler($target,distance,flags){
            if(!distance){
                return; 
            }
            var transform,transition;
            if(flags != END){
                conTranslatey += distance;
                conTranslatey = Math.abs(conTranslatey) >= pagesize.height ? - pagesize.height: conTranslatey;  
                conTranslatey = conTranslatey > 0 ? 0 : conTranslatey;
            }
            switch(flags){
                case START:
                    transition = "none";
                    break;
                case MOVE: 
                    if(distance <= 0 && !$target.hasClass("cover")
                        || $($(".question").get(0)).find(".question-page").scrollTop() > 0){
                    }else { 
                        transform = "translate3d(0,"+conTranslatey+"px,0)";
                    }
                    break;
                case END: 
                    transition = "all 600ms cubic-bezier(0.32, 0.96, 0.72, 1.01)";
                    if($target.hasClass("cover")){
                        if(Math.abs(distance) > THRESHOLD && distance < 0){
                            transform = "translate3d(0,"+(-pagesize.height)+"px,0)";
                            conTranslatey = -pagesize.height;

                            clearTimeout(timer);
                            setTimeout(function(){
                                ProgressModule.entrances(); 
                            },300);

                            //preload image
                            LazyLoad.execute(1);
                            LazyLoad.execute(2);
                        }else{
                            transform = "translate3d(0,0,0)";
                            conTranslatey = 0;
                            
                            clearTimeout(timer);
                            setTimeout(function(){
                                ProgressModule.exits(); 
                            },300);

                        } 
                    }else {
                        if($($(".question").get(0)).find(".question-page").scrollTop() > 0){
                            return; 
                        }
                        if(Math.abs(distance) > THRESHOLD && distance > 0){
                            transform = "translate3d(0,0,0)";
                            conTranslatey = 0;
                            
                            clearTimeout(timer);
                            setTimeout(function(){
                                ProgressModule.exits(); 
                            },300);

                        }else{
                            transform = "translate3d(0,"+(-pagesize.height)+"px,0)";
                            conTranslatey = -pagesize.height;
                            
                            clearTimeout(timer);
                            setTimeout(function(){
                                ProgressModule.entrances(); 
                            },300);
                            //preload image
                            LazyLoad.execute(1);
                            LazyLoad.execute(2);
                        } 
                    }
                    break;
                default:
                    break;
            }
            transition && UtilModule.setTransition($container,transition);
            transform && UtilModule.setTransform($container,transform);
        }
        return {
            run: run 
        }
    }();

    /**
        cover page module
    **/
    var CoverModule = function(){
        var $cover_page = $("#cover-page"),
            $cover_image = $cover_page.find(".cover-image"),
            $cap_wrap = $cover_page.find(".cap-wrap"),
            $title = $cover_page.find(".info-wrap h1"),
            $base_info = $cover_page.find(".info-wrap .base-info");
        var pos = {
            start: {},
            move: {},
            end: {}
        };
        var isMove = false,timer;
        function run(){
            $cap_wrap.bind("touchstart",function(e){
                if(conTranslatey < 0){
                    return; 
                }

                pos.start.x = e.changedTouches[0].pageX;  
                pos.start.y = e.changedTouches[0].pageY;  
                

                //cap animate
                capHandler(null,START);
                //image animate
                imageHandler(null,START);
                //title animate
                titleHandler(null,START);
                //info animate
                infoHandler(null,START);
            });
            $cap_wrap.bind("touchmove",function(e){
                if(conTranslatey < 0){
                    return; 
                }

                pos.move.x = e.changedTouches[0].pageX; 
                pos.move.y = e.changedTouches[0].pageY;

                var distance = pos.move.y - pos.start.y;
                if(distance > 0){
                    isMove = true; 
                }

                //cap animate
                capHandler(distance,MOVE);
                //image animate
                imageHandler(distance,MOVE);
                //title animate
                titleHandler(distance,MOVE);
                //info animate
                infoHandler(distance,MOVE);
            });
            $cap_wrap.bind("touchend",function(e){
                if(conTranslatey < 0){
                    return; 
                }
                
                pos.end.x = e.changedTouches[0].pageX;
                pos.end.y = e.changedTouches[0].pageY;

                var distance = pos.end.y - pos.start.y;
               
                //cap animate
                capHandler(distance,END);
                //image animate
                imageHandler(distance,END);
                //title animate
                titleHandler(distance,END);
                //info animate
                infoHandler(distance,END);

                clearTimeout(timer);
                timer = setTimeout(function(){
                    isMove = false; 
                },160);
            });
        }
        function capHandler(distance,flags){
            var transform,transition,
                distance = distance < 0 ? 0 : distance;
            switch(flags){
                case START:
                    transition = "none";
                    break;
                case MOVE: 
                    transform = "translate3d(0,"+distance+"px,0)";
                    break;
                case END: 
                    transition = "all 160ms cubic-bezier(0.32, 0.96, 0.72, 1.01)";
                    transform = "translate3d(0,0,0)";
                    break;
                default:
                    break;
            }
            transition && UtilModule.setTransition($cap_wrap,transition);
            transform && UtilModule.setTransform($cap_wrap,transform);
        }
        function titleHandler(distance,flags){
            var transform,transition,
                css = {};
            distance = distance > 40 ? 40 : distance;
            switch(flags){
                case START:
                    transition = "all 160ms cubic-bezier(0.1, 0.96, 0.52, 0.85)";
                    break;
                case MOVE:
                    if(distance>0){
                        css.padding = "0 20px"; 
                        css.color = "rgba(255,255,255,.8)";
                        css["font-size"] = "24px";
                        css["line-height"] = "30px";
                        transform = "translate3d(0,"+distance+"px,0)";
                    }else {
                        css.padding = "0 0"; 
                        css.color = "#fff";
                        css["font-size"] = "28px";
                        css["line-height"] = "36px";
                        transform = "translate3d(0,0,0)";
                    }
                    break;
                case END:
                    css.padding = "0 0"; 
                    css.color = "#fff";
                    css["font-size"] = "28px";
                    css["line-height"] = "36px";
                    transform = "translate3d(0,0,0)";
                    break;
                default:
                    break;
            }
            transition && UtilModule.setTransition($title,transition);
            transform && UtilModule.setTransform($title,transform);
            $title.css(css);
        }
        function infoHandler(distance,flags){
            var transform,transition,
                distance = distance < 0 ? 0 : distance*2,
                css = {};
            switch(flags){
                case START:
                    transition = "none";
                    css.opacity = 0.8;
                    break;
                case MOVE: 
                    transform = "translate3d(0,"+distance+"px,0)";
                    css.opacity = 0.8;
                    break;
                case END: 
                    transition = "all 160ms cubic-bezier(0.32, 0.96, 0.72, 1.01)";
                    transform = "translate3d(0,0,0)";
                    css.opacity = 1;
                    break;
                default:
                    break;
            }
            transform && UtilModule.setTransform($base_info,transform);
            transition && UtilModule.setTransition($base_info,transition);
            $base_info.css(css);
        }
        function imageHandler(distance,flags){
            var transform,transition,
                $img = $cover_image.find("img"),
                scale = 1 + (distance / $cap_wrap.height())/2;
                scale = scale < 1 ? 1 : scale;
            switch(flags){
                case START:
                    transition = "none";
                    break;
                case MOVE: 
                    transform = "scale3d("+scale+","+scale+",1)";
                    break;
                case END: 
                    transition = "all 160ms cubic-bezier(0.32, 0.96, 0.72, 1.01)";
                    transform = "scale3d(1,1,1)";
                    break;
                default:
                    break;
            }
            transform && UtilModule.setTransform($img,transform);
            transition && UtilModule.setTransition($img,transition);
        }
        function getIsMove(){
            return isMove; 
        }
        function setCoverData(data){
            $cover_image.html('<img src="'+data.img_src+'"/>');
            $title.html(data.title);
            $base_info.html(data.desc);

        }
        return {
            run: run,
            getIsMove: getIsMove,
            setCoverData: setCoverData
        }
    }();

    /**
        play module 
    **/
    var PlayModule = function(){
        var index = 0,
            result = [],
            correct_count = 0;
        var ANSWERTYPE = {
            image: 1,
            text: 0
        };
        var $result_page = $("#result-page");
        function run(){
            $("body").on("click",function(e){
                var target = e.target || e.srcElement,
                    $target = $(target);
                if($target.hasClass("answer-item")){
                    answerHandler($target);         
                }else if($target.parents(".answer-item").length > 0){
                    answerHandler($target.parents(".answer-item"));         
                }
            });
        } 
        function answerHandler($target){
            var data_id = $target.attr("data-id"),
                data_type = $target.attr("data-type"),
                data_correct = $target.attr("data-correct");
            if(data_correct == 1){
                $target.children("div").append(tpl.correct);  
                correct_count++;
            }else {
                $target.children("div").append(tpl.wrong);  
            }
            if(index >= QUIZ_DATA.questions.length-1){
                //show result
                showResult();
                return;
            }
            //next questions
            nextQuestion();
        }
        function nextQuestion(){
            index += 1;
            var transition,transform;
            transition = "all 300ms cubic-bezier(0.32, 0.96, 0.72, 1.01)";
            transform = "translate3d(0,"+(-pagesize.height*(index+1))+"px,0)";
            ProgressModule.resetBar(index,QUIZ_DATA.questions.length);
            ;(function(transition,transform){ 
                setTimeout(function(){
                    UtilModule.setTransition($container,transition);
                    UtilModule.setTransform($container,transform);
                },options.waittime);
            })(transition,transform);
            //preload image
            LazyLoad.execute(index+2);
        }
        function showResult(){
            index += 1;
            var transition,transform;
            transition = "all 300ms cubic-bezier(0.32, 0.96, 0.72, 1.01)";
            transform = "translate3d(0,"+(-pagesize.height*(index+1))+"px,0)";
            ProgressModule.exits();
            ;(function(transition,transform){ 
                setTimeout(function(){
                    UtilModule.setTransition($container,transition);
                    UtilModule.setTransform($container,transform);
                },options.waittime);
            })(transition,transform);
            var result,val; 
            for(val in QUIZ_DATA.results){
                if(correct_count >= QUIZ_DATA.results[val].condition){
                    result = QUIZ_DATA.results[val]; 
                    break;
                } 
            } 
            //set data to html
            var desc = JTE.clear().assign("num",correct_count).execute(result.description);
            $result_page.find(".desc-wrap").html(desc); 
            
            var $content_wrap = $result_page.find(".content-wrap");
            $content_wrap.css({
                top: "50%",
                "margin-top": (-$content_wrap.height()/2) + "px"
            });
        }
        return {
            run: run 
        }
    }();
    
    /**
        image load
    **/
    var LazyLoad = function(){
        function execute(index){
            var $questions = InitModule.getQuestions();
            if(index >= $questions.length){
                return; 
            } 
            var $objs = $($questions[index]).find(".img-box");
            $objs.each(function(){
                loadind($(this)); 
            });  
        }
        function loadind($obj){
            var image = new Image();
            image.src = $obj.attr("data-src");
            image.onload = function(){
                $obj.html('<img src="'+image.src+'"/>'); 
            }
        }
        return {
            execute: execute 
        }    
    }();

    window.WttTrivia = {
        run: run 
    }
})(window);
