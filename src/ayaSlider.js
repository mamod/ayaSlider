/**
* ayaSlider
* MIT Licensed
* @author Mamod Mehyar
* http://twitter.com/mamod
* http://mamod.me
* version : 1.2.4
*/

(function($) {
    function _action(){}
    $.fn.ayaSlider = function(customOptions) {
        var action = new _action();
        var options = $.extend({},$.fn.ayaSlider.defaultOptions, customOptions);
        action.inout = 'in';
        action.items = undefined;
        action.currentSlide = undefined;
        
        action.clearTimeOuts = function(){
            for (var i = 0; i < action.timeOuts.length; i++){
                clearTimeout(action.timeOuts[i]);
            }
        };
        
        action.timer = function(delay){
            var container = action.appendTimerTo;
            if (!(container && container.length)) return;
            
            action.appendTimerTo.find('._ayaSlider_timer').each(function(){
                var $this = $(this);
                
                if (!delay) delay = 0;
                
                $this.stop().animate({
                    width : '100%',
                    height : '100%'
                },{
                    duration : delay
                }); 
            });
        };
        
        action.move = function(pack){
            action.timeOuts = [];
            action.currentSlide = pack;
            if (!pack) return false;
            
            var items = pack.find('._ayaSlider_move').andSelf();
            action.items = items;
            items.stop();
            
            var length = items.length;
            pack.css({
                display: 'block',
                opacity: 1
            });
            
            if (action.appendTimerTo){
                action.appendTimerTo.find('._ayaSlider_timer').stop().css({
                    width : 0
                });
            }

            if (options.list){
                var $index = pack.data('slideIndex');
                var $list = $(options.list);
                $list.find('li').removeClass('current');
                $list.find('li:eq('+$index+')').addClass('current');
            }
            
            items.each(function(i){
                var ele = $(this);
                var opt = ele.data("_options");
                if (!opt) return true;
                
                var durationIn = parseFloat(opt.In.duration) || 1000+(i*300),
                delayIn = parseFloat(opt.In.delay) || 0,
                easeIn = opt.In.ease || options.easeIn || 'easeOutBack',
                easeOut = opt.Out.ease || options.easeOut || easeIn,
                durationOut = parseFloat(opt.Out.duration) || durationIn,
                delayOut = parseFloat(opt.Out.delay) || options.delay;
                
                var defaultIn = {};
                
                if (typeof options.defaultIn === 'object'){
                    defaultIn = options.defaultIn;
                }
                
                if ( opt.In.top || opt.In.left || opt.In.opacity ){
                    defaultIn = {
                        top: parseFloat(opt.In.top) || 0,
                        left : parseFloat(opt.In.left) || 0
                    };
                    
                    if (opt.In.opacity){
                        defaultIn.opacity = parseFloat(opt.In.opacity);
                    }
                }
                
                ele.css(defaultIn);
                var posType = ele.css('position');
                if (posType == 'static'){
                    ele.css({
                        position : 'relative'
                    });
                }
                
                action.timeOuts.push(setTimeout(function(){
                    ele.stop().animate({
                        opacity : opt.opacity,
                        left: opt.left+'px',
                        top: opt.top+'px'
                    },{
                        queue: false,
                        duration: durationIn,
                        complete: function(){
                            var css = {};
                            if (ele[0] !== pack[0]){
                                css = defaultIn;
                            }
                            
                            if (opt.Out.top || opt.Out.left || opt.Out.opacity){
                                css = {
                                    top: parseFloat(opt.Out.top) || 0,
                                    left : parseFloat(opt.Out.left) || 0,
                                    opacity : parseFloat(opt.Out.opacity) || ele.css('opacity') || 1
                                };
                            }
                            //out animation
                            if (ele[0] === pack[0]){
                                if (action.previousSlide){
                                    action.previousSlide.hide();
                                }
                                //play timer
                                action.timer(delayOut);
                            }
                            
                            if (opt.Out.opacity){
                                css.opacity = parseFloat(opt.Out.opacity);
                            }
                            
                            if (delayOut > -1) {
                                action.timeOuts.push(setTimeout(function(){
                                    clearInterval(action.interval);
                                    var inter = setInterval(function(){
                                        if (action.pause == true){
                                        
                                        } else {
                                            clearInterval(inter);
                                            if (ele[0] === pack[0]){
                                                action.move(pack.loopSiblings(action));
                                                items.stop();
                                            }
                                            
                                            ele.stop().animate(css,{
                                                duration: durationOut,
                                                queue: false,
                                                complete: function(){},
                                                easing : easeOut
                                            });
                                        }
                                    },60);
                                },delayOut));
                            }
                        },
                        easing : easeIn
                    });
                },delayIn));
            });
            return false;
        };
        
        action.add = function(text){
            var data = {};
            var options = text.split(';');
            for (var x = 0; x < options.length; x++){
                var values = options[x].split(':');
                if (values && values.length == 2){
                    //if (key == 'opacity') continue;
                    var key = values[0].replace(/\s+/,'');
                    var value = values[1].replace(/\s+/,'');
                    data[key] = value;
                }
            }
            return data;
        };
        
        action.ini = function($this){
            var next,previous;
            $this.mouseenter(function(){
                action.pause = true;
            }).mouseleave(function(){
                action.pause = false;
            });
            
            //set required style
            $this.css({
                'position' : 'relative',
                'overflow' : 'hidden'
            });
            
            if (options.next) next = options.next;
            if (options.previous) previous = options.previous;
            
            $(previous).click(function(event){
                event.stopPropagation();
                //stop all previous animations
                if (action.items) action.items.stop();
                action.clearTimeOuts();
                action.currentSlide.fadeOut('slow');
                action.move(action.currentSlide.loopSiblings(action,'previous'));
                return false;
            });
            
            $(next).click(function(event){
                event.stopPropagation();
                //stop all previous animations
                if (action.items) action.items.stop();
                action.clearTimeOuts();
                action.currentSlide.fadeOut('fast');
                action.move(action.currentSlide.loopSiblings(action));
                return false;
            });
            
            if (options.list){
                var $list = $(options.list);
                $list.find('li').each(function(i){
                    var $li = $(this);
                    $li.click(function(){
                        if ($li.hasClass('current')) return false;
                        if (action.items) action.items.stop();
                        action.clearTimeOuts();
                        action.currentSlide.fadeOut('fast');
                        action.move(action.currentSlide.loopSiblings(action,i));
                        return false;
                    });
                });
            }
            
            var _first, _height = $this.height();
            $this.children().each(function(i){
                var ele = $(this);
                ele.addClass('_ayaSlider_slide').data('slideIndex',i);
                ele.css({
                    position: 'absolute',
                    overflow:'hidden',
                    display: 'none',
                    width : '100%',
                    height : _height
                });
                
                if (i == 0){
                    _first = ele;
                    action.firstElement = _first.clone();
                }
            });
            
            $this.find('*').each(function(){
                var ele = $(this);
                var data = {
                    In : {},
                    Out : {}
                };
                
                if(!ele.data("_in")){
                    var options = ele.data('in');
                    if (options) data.In = action.add(options);
                }
                
                if(!ele.data("_out")){
                    var options = ele.data('out');
                    if (options) data.Out = action.add(options);
                }
                
                data.left = 0;
                data.top = 0;
                //save opacity in data
                if (!ele.data('_opacity')) ele.data('_opacity',ele.css('opacity'));
                
                data.opacity = ele.data('_opacity');
                ele.data("_options",data);
                ele.addClass('_ayaSlider_move');
            });
            
            if (options.timer){
                //var appendTimerTo;
                if (options.timer == true){
                    action.appendTimerTo = $this;
                } else {
                    action.appendTimerTo = $(options.timer);
                }
                
                $('<div class="_ayaSlider_timer" style="z-index:9999;width:0;left:0;top:0;margin:0;padding:0"></div>')
                .css({
                    opacity: options.timerOpacity,
                    height: '100%',
                    position : options.timerPosition,
                    backgroundColor : options.timerColor
                }).appendTo(action.appendTimerTo);
                
                $(window).resize(function(){
                    action.timer();
                });
            }
            
            action.move(_first);
        };
        
        this.destroySlider = function(){
            if (action.items) action.items.stop();
            action.clearTimeOuts();
            var item = this.find(':first');
            item.replaceWith(action.firstElement);
            action.firstElement.show();
        };
        
        this.reloadSlider = function(newoptions){
            options = $.extend({},options, newoptions);
            this.destroySlider();
            action.ini($(this));
        };
        
        return this.each(function() {
            action.ini($(this));
        });
    };
    
    $.fn.ayaSlider.defaultOptions = {
        delay : 5000,
        easeIn : "linear",
        easeOut : "linear",
        timerColor : '#000',
        timerPosition : 'relative',
        timerOpacity : .5
    };
    
    $.fn.loopSiblings = function(_action,type){
        var $this = this;
        
        $this.css('zIndex','2');
        _action.previousSlide = $this;
        var item;
        if (parseInt(type) >= 0 ){
            item = $('._ayaSlider_slide:eq('+type+')');
        }else if (type === 'previous'){
            item = $this.prev('._ayaSlider_slide');
            var len = item.length;
            if (item.length == 0) {
                item = $this.nextAll('._ayaSlider_slide').eq(len-1);
            }
        } else {
            item = $this.next('._ayaSlider_slide');
            var len = item.length;
            if (item.length == 0) {
                item = $this.prevAll('._ayaSlider_slide').eq(len-1);
            }
        }
        item.css('zIndex','3');
        return item;
    };
    
})(jQuery);
