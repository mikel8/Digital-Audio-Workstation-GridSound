"use strict";function walContext(){this.ctx=new AudioContext,this.destination=this.ctx.destination,this.buffers=[],this.compositions=[],this.nbPlaying=0,this.gainNode=this.ctx.createGain(),this.filters=this.createFilters(),this.filters.pushBack(this.gainNode),this.filters.connect(this.ctx.destination),this.nodeIn=this.filters.nodeIn,delete this.filters.connect}walContext.prototype={gain:function(t){return arguments.length?(this.gainNode.gain.value=t,this):this.gainNode.gain.value},createBuffer:function(t,i){var e=new walContext.Buffer(this,t,i);return this.buffers.push(e),e},createFilters:function(){return new walContext.Filters(this)},createComposition:function(){var t=new walContext.Composition(this);return this.compositions.push(t),t}},function(){function t(t,i){var e=t.when-i,n=e>=0?t.offset:t.offset-e;t.start(e,Math.max(n,0))}function i(t){t.playTimeoutId&&clearTimeout(t.playTimeoutId),t.playTimeoutId=setTimeout(t.onended.bind(t),1e3*(t.lastSample.getEndTime()-t.getOffset()))}function e(e,n,s,o){n.getEndTime()>e.getOffset()&&"rm"!=s&&(n.load(),t(n,e.getOffset())),e.lastSample==o&&"mv"!=s||(!e.lastSample||e.lastSample.getEndTime()<=e.getOffset()?e.onended():i(e))}walContext.Composition=function(t){this.wCtx=t,this.wSamples=[],this.lastSample=null,this.fnOnended=function(){},this.fnOnpaused=function(){},this.startedTime=0,this.pausedOffset=0,this.isPlaying=!1,this.isPaused=!1},walContext.Composition.prototype={addSamples:function(t){var i=this;t.forEach(function(t){-1===i.wSamples.indexOf(t)&&(i.wSamples.push(t),t.setComposition(t),i.update(t))})},removeSamples:function(t){var i,e=this;t.forEach(function(t){-1!==(i=e.wSamples.indexOf(t))&&(e.wSamples.splice(i,1),t.setComposition(null),e.update(t,"rm"))})},update:function(t,i){var n,s=this,o=this.lastSample;this.lastSample=this.getLastSample(),this.isPlaying&&(t.started?(n=t.fnOnended,t.onended(function(){e(s,t,i,o),n(),t.onended(n)}),t.stop()):e(this,t,i,o))},load:function(t){return this.isPlaying||this.wSamples.forEach(function(i){(!t||i.getEndTime()>t)&&i.load()}),this},play:function(){this.playFrom(0)},playFrom:function(t){t=t||this.getOffset(),this.load(t),this.start(t)},start:function(e){return e=Math.max(e,0),this.wSamples.length&&!this.isPlaying&&(this.startedTime=wa.wctx.ctx.currentTime,this.pausedOffset=e,this.isPlaying=!0,this.isPaused=!1,this.wSamples.forEach(function(i){i.getEndTime()>e&&t(i,e)}),i(this)),this},stop:function(){return this.wSamples.forEach(function(t){t.stop()}),this.onended(),this},pause:function(){this.isPlaying&&(this.pausedOffset+=wa.wctx.ctx.currentTime-this.startedTime,this.wSamples.forEach(function(t){t.stop()}),clearTimeout(this.playTimeoutId),this.startedTime=0,this.isPlaying=!1,this.isPaused=!0,this.fnOnpaused())},getLastSample:function(t){var i,e=null,n=0;return!this.wSamples.length||t&&1==this.wSamples.length||this.wSamples.forEach(function(s){s!=t&&n<(i=s.getEndTime())&&(e=s,n=i)}),e},getOffset:function(){return this.isPlaying?this.pausedOffset+wa.wctx.ctx.currentTime-this.startedTime:this.pausedOffset},onended:function(t){return"function"==typeof t?this.fnOnended=t:(this.playTimeoutId&&clearTimeout(this.playTimeoutId),this.startedTime=0,this.isPlaying=!1,this.isPaused=!1,this.pausedOffset=0,this.fnOnended()),this}}}(),function(){walContext.Buffer=function(t,i,e){function n(t){s.wCtx.ctx.decodeAudioData(t,function(t){s.buffer=t,s.isReady=!0,e&&e(s)})}var s=this,o=new FileReader;this.wCtx=t,this.isReady=!1,i.name?(o.addEventListener("loadend",function(){n(o.result)}),o.readAsArrayBuffer(i)):n(i)},walContext.Buffer.prototype={createSample:function(){var t=new walContext.Sample(this.wCtx,this);return t},getPeaks:function(t,i,e,n){e=e||0,n=n||this.buffer.duration;for(var s,o,a,u=0,r=new Array(i),c=this.buffer.getChannelData(t),l=(n-e)*this.buffer.sampleRate,d=e*this.buffer.sampleRate,h=l/i,f=h/10;i>u;++u){for(s=d+u*h,o=s+h,a=0;o>s;s+=f)a=Math.max(a,Math.abs(c[~~s]));r[u]=a}return r}}}(),function(){function t(t,i,e){t[i]=e[0],t[i+1]=e[1],t[i+2]=e[2],t[i+3]=e[3]}function i(i,e,n,s){var o,a,u,r=e.data,c=0,l=e.width,d=e.height,h=d/2,f=i.getPeaks(0,l),m=i.buffer.numberOfChannels>1?i.getPeaks(1,l):f;if(s){for(;c<r.length;c+=4)t(r,c,n);n=[0,0,0,0]}for(c=0;l>c;++c){for(a=~~(h*(1-f[c])),u=~~(h*(1+m[c])),o=a;u>=o;++o)t(r,4*(o*l+c),n);t(r,4*(h*l+c),n)}return e}walContext.Buffer.prototype.drawWaveform=function(t,e){return i(this,t,e)},walContext.Buffer.prototype.drawInvertedWaveform=function(t,e){return i(this,t,e,!0)}}(),walContext.Filters=function(t){this.wCtx=t,this.nodes=[],this.nodeIn=t.ctx.createGain(),this.nodeOut=t.ctx.createGain(),this.nodeIn.connect(this.nodeOut)},walContext.Filters.prototype={pushBack:function(t){this.nodes.length>0?(this.nodes[this.nodes.length-1].disconnect(),this.nodes[this.nodes.length-1].connect(t)):(this.nodeIn.disconnect(),this.nodeIn.connect(t)),t.connect(this.nodeOut),this.nodes.push(t)},pushFront:function(t){0===this.nodes.length?this.pushBack(t):(this.nodeIn.disconnect(),this.nodeIn.connect(t),this.nodes.unshift(t),t.connect(this.nodes[1]))},popBack:function(){var t=this.nodes.length?this.nodes.pop():null;return t&&(t.disconnect(),0===this.nodes.length?(this.nodeIn.disconnect(),this.nodeIn.connect(this.nodeOut)):(this.nodes[this.nodes.length-1].disconnect(),this.nodes[this.nodes.length-1].connect(this.nodeOut))),t},popFront:function(){var t;return this.nodes.length?1===this.nodes.length?t=this.popBack():(this.nodeIn.disconnect(),this.nodes[0].disconnect(),t=this.nodes.shift(),this.nodeIn.connect(this.nodes[0])):t=null,t},popAll:function(){if(this.nodes.length>0){var t=this.nodes;return this.nodeIn.disconnect(),t[t.length-1].disconnect(),this.nodeIn.connect(this.nodeOut),this.nodes=[],t}return null},connect:function(t){t=t.nodeIn||t,this.nodeOut.connect(t),this.connectedTo=t},disconnect:function(){this.nodeOut.disconnect(),this.connectedTo=null},gain:function(t){return arguments.length?(this.gainNode.gain.value=t,this):this.gainNode.gain.value}},walContext.Sample=function(t,i,e){this.wCtx=t,this.wBuffer=i,this.connectedTo=e?e.nodeIn:t.nodeIn,this.fnOnended=function(){},this.when=0,this.offset=0,this.duration=i.buffer.duration,this.bufferDuration=i.buffer.duration,this.composition=null,this.started=this.playing=!1},walContext.Sample.prototype={connect:function(t){return this.connectedTo=t.nodeIn||t,this.source&&this.source.connect(this.connectedTo),this},disconnect:function(){return this.source&&(this.source.disconnect(),this.connectedTo=null),this},setComposition:function(t){this.composition=t},load:function(){return this.isLoaded||(this.isLoaded=!0,this.source=this.wCtx.ctx.createBufferSource(),this.source.buffer=this.wBuffer.buffer,this.source.onended=this.onended.bind(this),this.connectedTo&&this.source.connect(this.connectedTo)),this},start:function(t,i,e){function n(){++s.wCtx.nbPlaying,s.playing=!0}var s=this;return this.isLoaded?this.started?console.warn("WebAudio Library: can not start a sample twice."):(this.started=!0,t=void 0!==t?t:this.when,this.source.start(this.wCtx.ctx.currentTime+t,void 0!==i?i:this.offset,void 0!==e?e:this.duration),t?this.playTimeoutId=setTimeout(n,1e3*t):n()):console.warn("WebAudio Library: can not start an unloaded sample."),this},stop:function(){return this.started&&this.source.stop(0),this},setWhen:function(t){this.when=t},setOffset:function(t){this.offset=t>0?t:0},setDuration:function(t){this.duration=t},getWhen:function(){return this.when},getOffset:function(){return this.offset},getDuration:function(){return this.duration},getEndTime:function(){var t=this.duration+this.offset>this.bufferDuration?this.bufferDuration-this.offset:this.duration;return this.when+t},onended:function(t){return"function"==typeof t?this.fnOnended=t:(this.playing&&(this.playing=!1,--this.wCtx.nbPlaying),this.started&&(this.started=!1,clearTimeout(this.playTimeoutId)),this.isLoaded=!1,this.source=null,this.fnOnended()),this}},function(){function t(i){for(var e,n=i.firstChild;null!==n;)t(e=n),n=n.nextSibling,1!==e.nodeType&&/^\s*$/.test(e.textContent)&&i.removeChild(e)}t(document.body)}(),window.ui={jqWindow:$(window),jqBody:$("body"),jqVisual:$("#visual"),jqVisualCanvas:$("#visual canvas"),jqClockMin:$("#visual .clock .min"),jqClockSec:$("#visual .clock .sec"),jqClockMs:$("#visual .clock .ms"),jqMenu:$("#menu"),jqPlay:$("#menu .btn.play"),jqStop:$("#menu .btn.stop"),jqBpmA:$("#menu .bpm .a-bpm"),jqBpmInt:$("#menu .bpm .int"),jqBpmDec:$("#menu .bpm .dec"),jqBpmList:$("#menu .bpm-list"),jqBtnTools:$("#menu .tools [data-tool]"),jqBtnMagnet:$("#menu .tools .magnet"),jqFiles:$("#files"),jqFilelist:$("#files .filelist"),jqGrid:$("#grid"),jqGridEm:$("#grid .emWrapper"),jqGridHeader:$("#grid .header"),jqTimeline:$("#grid .timeline"),jqTimeCursor:$("#grid .timeCursor"),jqTrackList:$("#grid .trackList"),jqGridCols:$("#grid .cols"),jqGridColB:$("#grid .colB"),jqTrackNames:$("#grid .trackNames"),jqTrackLines:$("#grid .trackLines"),jqTrackLinesBg:$("#grid .trackLinesBg"),jqTrackNamesExtend:$("#grid .trackNames .extend")},ui.gridEm=parseFloat(ui.jqGrid.css("fontSize")),ui.tool={},ui.files=[],ui.tracks=[],ui.samples=[],ui.selectedSamples=[],ui.nbTracksOn=0,ui.gridColsY=ui.jqGridCols.offset().top,ui.jqVisualCanvas[0].height=ui.jqVisualCanvas.height(),ui.getGridXem=function(t){var i,e=.25,n=(t-ui.filesWidth-ui.trackNamesWidth-ui.trackLinesLeft)/ui.gridEm;return ui.isMagnetized&&(i=n%e,n-=i,i>e/2&&(n+=e)),n},function(){function t(){var o=e;wa.wctx.nbPlaying&&(o=wa.analyserArray,wa.analyser.getByteTimeDomainData(o)),wa.oscilloscope(n,s,o),i=requestAnimationFrame(t)}var i,e=[],n=ui.jqVisualCanvas[0],s=n.getContext("2d");ui.analyserEnabled=!1,ui.analyserToggle=function(e){"boolean"!=typeof e&&(e=!ui.analyserEnabled),ui.analyserEnabled=e,e?i=requestAnimationFrame(t):(s.clearRect(0,0,n.width,n.height),cancelAnimationFrame(i))}}(),function(){var t,i=$("<div class='cursor'>");ui.playFile=function(e){t&&t.stop(),e.isLoaded&&(i.css("transitionDuration",0).css("left",0),e.jqCanvasWaveform.after(i),t=e.wbuff.createSample().load().start(),setTimeout(function(){i.css("transitionDuration",e.wbuff.buffer.duration+"s").css("left","100%")},20))},ui.stopFile=function(){t&&(t.stop(),i.detach())}}(),ui.play=function(){ui.jqPlay[0].classList.remove("fa-play"),ui.jqPlay[0].classList.add("fa-pause")},ui.pause=function(){ui.jqPlay[0].classList.remove("fa-pause"),ui.jqPlay[0].classList.add("fa-play")},ui.stop=function(){ui.currentTime(0),ui.pause()},ui.selectTool=function(){var t;return function(i){var e=ui.jqBtnTools.tool[i];e!==t&&(t&&t.classList.remove("active"),t=e,ui.jqGrid[0].dataset.tool=ui.currentTool=i,e.classList.add("active"))}}(),ui.bpm=function(t){var i=~~t,e=Math.min(Math.round(100*(t-i)),99);ui.BPMem=t/60,ui.jqBpmInt.text(100>i?"0"+i:i),ui.jqBpmDec.text(10>e?"0"+e:e)},function(){function t(t){t>0&&ui.jqTimeCursor.css("left",t*ui.BPMem+"em"),ui.jqTimeCursor[0].classList.toggle("visible",t>0)}function i(t){ui._clockTime=t,ui.jqClockMin.text(~~(t/60));var i=~~(t%60);ui.jqClockSec.text(10>i?"0"+i:i),t=Math.round(1e3*(t-~~t)),10>t?t="00"+t:100>t&&(t="0"+t),ui.jqClockMs.text(t)}ui.currentTime=function(e){i(e),t(e)}}(),ui.gridTop=0,ui.setGridTop=function(t){if(t>=0)t=0;else{var i=ui.tracks.length*ui.gridEm-ui.gridColsHeight;-i>t&&(t=-i)}ui.gridTop=t,ui.jqGridCols.css("top",t/ui.gridEm+"em")},ui.gridZoom=1,ui.setGridZoom=function(t,i,e){t=Math.min(Math.max(1,t),8);var n=t/ui.gridZoom;ui.gridZoom=t,ui.gridEm*=n,ui.jqGridEm.css("fontSize",t+"em"),ui.jqGrid.attr("data-sample-size",ui.gridEm<40?"small":ui.gridEm<80?"medium":"big"),ui.setGridTop(e-(-ui.gridTop+e)*n),ui.setTrackLinesLeft(i-(-ui.trackLinesLeft+i)*n),ui.updateTimeline(),ui.updateTrackLinesBg()},ui.setFilesWidth=function(t){ui.jqFiles.css("width",t),ui.filesWidth=t=ui.jqFiles.outerWidth(),ui.gridColsWidth=ui.screenWidth-t,ui.trackLinesWidth=ui.gridColsWidth-ui.trackNamesWidth,ui.jqGrid.css("left",t),ui.jqVisual.css("width",t+ui.trackNamesWidth),ui.jqMenu.css("left",t+ui.trackNamesWidth),ui.jqVisualCanvas[0].width=ui.jqVisualCanvas.width(),ui.updateTimeline(),ui.updateTrackLinesBg()},ui.setTrackLinesLeft=function(t){ui.trackLinesLeft=t=Math.min(~~t,0),ui.jqTrackLines.css("left",t/ui.gridEm+"em")},ui.trackNamesWidth=0,ui.setTrackNamesWidth=function(t){var i,e=ui.trackNamesWidth;ui.jqTrackNames.css("width",t),ui.trackNamesWidth=t=ui.jqTrackNames.outerWidth(),ui.trackLinesWidth=ui.gridColsWidth-t,i=ui.filesWidth+t,ui.jqGridColB.css("left",t),ui.jqTimeline.css("left",t),ui.jqVisual.css("width",i),ui.jqMenu.css("left",i),ui.jqVisualCanvas[0].width=i,ui.trackLinesLeft<0&&ui.setTrackLinesLeft(ui.trackLinesLeft-(t-e)),ui.updateTimeline(),ui.updateTrackLinesBg(),ui.updateGridBoxShadow()},function(){function t(t){if(t>e){var n="",s=e;for(e=t;s++<t;)n+="<div><span></span></div>";ui.jqTimeline.append(n),i=i||ui.jqTimeline.children().eq(0)}}var i,e=0;ui.updateTimeline=function(){var e=ui.trackLinesLeft/ui.gridEm,n=ui.trackLinesWidth/ui.gridEm;t(Math.ceil(-e+n)),i&&i.css("marginLeft",e+"em")}}(),function(){function t(t){var n,s,o,a=t-e,u="";for(e=Math.max(t,e),n=0;a>n;++n){for(u+="<div>",s=0;4>s;++s){for(u+="<div>",o=0;4>o;++o)u+="<div></div>";u+="</div>"}u+="</div>"}ui.jqTrackLinesBg.append(u),i=i||ui.jqTrackLinesBg.children().eq(0)}var i,e=0;ui.updateTrackLinesBg=function(){t(Math.ceil(ui.trackLinesWidth/ui.gridEm/4)+2),i.css("marginLeft",ui.trackLinesLeft/ui.gridEm%8+"em")}}(),ui.updateGridBoxShadow=function(){function t(t,i){return(t=t||i)?(t=Math.min(2-t/8,5),(i?"0px "+t:t+"px 0")+"px 2px rgba(0,0,0,.3)"):"none"}ui.jqGridHeader.css("boxShadow",t(0,ui.gridTop)),ui.jqTrackNames.css("boxShadow",t(ui.trackLinesLeft,0))},ui.resize=function(){ui.screenWidth=ui.jqWindow.width(),ui.screenHeight=ui.jqWindow.height(),ui.gridColsWidth=ui.jqGridCols.width(),ui.gridColsHeight=ui.jqTrackList.height(),ui.trackLinesWidth=ui.gridColsWidth-ui.trackNamesWidth,ui.updateTimeline(),ui.updateTrackLinesBg()},ui.toggleTracks=function(t){for(var i,e=0,n=t.isOn&&1===ui.nbTracksOn;i=ui.tracks[e++];)i.toggle(n);t.toggle(!0)},ui.isMagnetized=!1,ui.toggleMagnetism=function(t){"boolean"!=typeof t&&(t=!ui.isMagnetized),ui.isMagnetized=t,ui.jqBtnMagnet.toggleClass("active",t)},ui.newFile=function(t){var i=new ui.File(t);ui.files.push(i),ui.jqFilelist.append(i.jqFile)},ui.newTrack=function(){ui.tracks.push(new ui.Track(this))},ui.sampleCreate=function(t,i,e){var n=new ui.Sample(t).inTrack(i).moveX(e);return ui.samples.push(n),wa.composition.addSamples([n.wsample]),n},ui.sampleSelect=function(t,i){t&&t.selected!==i&&(t.select(i),i?ui.selectedSamples.push(t):ui.selectedSamples.splice(ui.selectedSamples.indexOf(t),1))},ui.sampleDelete=function(t){t&&(ui.sampleSelect(t,!1),ui.samples.splice(ui.samples.indexOf(t),1),t["delete"]())},ui.samplesForEach=function(t,i){t&&(t.selected?ui.selectedSamples.forEach(i):i(t))},ui.samplesMoveX=function(t,i){if(t.selected&&0>i){var e=1/0;ui.selectedSamples.forEach(function(t){e=Math.min(e,t.xem)}),i=-Math.min(e,-i)}ui.samplesForEach(t,function(t){t.moveX(Math.max(0,t.xem+i))})},ui.samplesSlip=function(t,i){i/=ui.BPMem,ui.samplesForEach(t,function(t){t.slip(t.offset+i)})},ui.samplesUnselect=function(){ui.selectedSamples.forEach(function(t){t.select(!1)}),ui.selectedSamples=[]},ui.File=function(t){var i=this;this.file=t,this.fullname=t.name,this.name=t.name.replace(/\.[^.]+$/,""),this.isLoaded=this.isLoading=!1,this.jqFile=$("<a class='sample to-load' draggable='true'>"),this.jqName=$("<span class='text-overflow'>").appendTo(this.jqFile).text(this.name),this.jqToLoad=$("<i class='to-load fa fa-fw fa-download'>").prependTo(this.jqName),this.jqFile.on({contextmenu:!1,dragstart:this.dragstart.bind(this),mousedown:function(t){0!==t.button&&ui.stopFile()},click:function(){i.isLoaded?ui.playFile(i):i.isLoading||i.loaded()}})},function(){var t,i;ui.jqBody.mousemove(function(e){t&&i.css({left:e.pageX,top:e.pageY})}).mouseup(function(e){if(t){var n=Math.floor((e.pageY-ui.gridColsY-ui.gridTop)/ui.gridEm),s=ui.getGridXem(e.pageX);i.remove(),n>=0&&s>=0&&ui.sampleCreate(t,n,s),t=null}}),ui.File.prototype.dragstart=function(e){if(this.isLoaded&&!t){t=this,i=this.jqCanvasWaveform.clone();var n=i[0];n.getContext("2d").drawImage(this.jqCanvasWaveform[0],0,0,n.width,n.height),i.addClass("dragging").css({left:e.pageX,top:e.pageY}).appendTo(ui.jqBody)}return!1}}(),ui.File.prototype.loaded=function(){var t=this;this.isLoading=!0,this.jqToLoad.removeClass("fa-downloads").addClass("fa-refresh fa-spin"),wa.wctx.createBuffer(this.file,function(i){var e,n,s;t.wbuff=i,t.isLoaded=!0,t.isLoading=!1,t.jqFile.removeClass("to-load"),t.jqToLoad.remove(),t.jqCanvasWaveform=$("<canvas class='waveform'>"),e=t.jqCanvasWaveform[0],n=e.getContext("2d"),e.width=400,e.height=50,s=n.createImageData(e.width,e.height),i.drawWaveform(s,[57,57,90,255]),n.putImageData(s,0,0),t.jqFile.prepend(e),ui.playFile(t)})},ui.Track=function(t,i){i=i||{},this.grid=t,this.id=ui.tracks.length,this.jqColNamesTrack=$("<div class='track'>").appendTo(ui.jqTrackNames),this.jqColLinesTrack=$("<div class='track'>").appendTo(ui.jqTrackLines),this.jqColNamesTrack[0].uitrack,this.jqColLinesTrack[0].uitrack=this,this.initToggle().initEditName().toggle(i.toggle!==!1).editName(i.name||"")},ui.Track.prototype.initEditName=function(){var t=this;return this.jqName=$("<span class='name text-overflow'>").appendTo(this.jqColNamesTrack).dblclick(this.editName.bind(this,!0)),this.jqNameInput=$("<input type='text'/>").appendTo(this.jqColNamesTrack).blur(function(){t.editName(this.value).editName(!1)}).keydown(function(i){13!==i.keyCode&&27!==i.keyCode||t.editName(13===i.keyCode?this.value:t.name).editName(!1),i.stopPropagation()}),this},ui.Track.prototype.editName=function(t){var i=this.jqNameInput[0],e="Track "+(this.id+1);return"string"==typeof t?(t=t.replace(/^\s+|\s+$/,"").replace(/\s+/g," "),t=t===e?"":t,this.jqName.toggleClass("empty",""===t).text(t||e),this.name=t):t?(this.jqColNamesTrack.addClass("editing"),i.value=this.name||e,i.focus(),i.select()):(i.blur(),this.jqColNamesTrack.removeClass("editing")),this},ui.Track.prototype.initToggle=function(){var t=this;return this.jqToggle=$("<a class='toggle'>").appendTo(this.jqColNamesTrack).on("contextmenu",!1).mousedown(function(i){0===i.button?t.toggle():2===i.button&&ui.toggleTracks(t)}),this},ui.Track.prototype.toggle=function(t){return"boolean"!=typeof t&&(t=!this.isOn),this.isOn!==t&&(this.isOn=t,this.grid.nbTracksOn+=t?1:-1,this.jqToggle.toggleClass("on",t),this.jqColNamesTrack.add(this.jqColLinesTrack).toggleClass("off",!t)),this},ui.Sample=function(t){var i,e,n;this.uifile=t,this.wbuff=t.wbuff,this.offset=0,this.wsample=this.wbuff.createSample(),this.jqSample=$("<div class='sample'>"),this.jqWaveformWrapper=$("<div class='waveformWrapper'>").appendTo(this.jqSample),this.jqWaveform=$("<canvas class='waveform'>").appendTo(this.jqWaveformWrapper),i=this.jqWaveform[0],e=i.getContext("2d"),i.width=~~(300*this.wbuff.buffer.duration),i.height=50,n=e.createImageData(i.width,i.height),this.wbuff.drawWaveform(n,[221,221,255,255]),e.putImageData(n,0,0),this.jqName=$("<span class='text-overflow'>").text(t.name).appendTo(this.jqSample),this.jqName[0].uisample=this.jqWaveformWrapper[0].uisample=this.jqWaveform[0].uisample=this,this.updateCSS_width(),this.select(!1)},ui.Sample.prototype.when=function(t){return this.wsample.when=t,this.updateCSS_when(),this},ui.Sample.prototype.slip=function(t){return this.offset=Math.max(-this.wbuff.buffer.duration,Math.min(t,0)),this.updateCSS_offset(),this},ui.Sample.prototype.mute=function(){return lg("sample muted (in development)"),this},ui.Sample.prototype.select=function(t){return this.selected=t,this.jqSample.toggleClass("selected",t),this},ui.Sample.prototype["delete"]=function(){return this.jqSample.remove(),this.wsample.stop(),wa.composition.removeSamples([this.wsample],"rm"),this},ui.Sample.prototype.inTrack=function(t){var i=ui.tracks[t];return i!==this.track&&(this.track=i,this.track.jqColLinesTrack.append(this.jqSample)),this},ui.Sample.prototype.moveX=function(t){return this.xem=t,this.when(t/ui.BPMem),this},ui.Sample.prototype.updateCSS_when=function(){return this.jqSample.css("left",this.wsample.when*ui.BPMem+"em"),this},ui.Sample.prototype.updateCSS_offset=function(){return this.jqWaveform.css("marginLeft",this.offset*ui.BPMem+"em"),this},ui.Sample.prototype.updateCSS_width=function(){return this.jqSample.css("width",this.wbuff.buffer.duration*ui.BPMem+"em"),this},window.wa={},wa.wctx=new walContext,wa.ctx=wa.wctx.ctx,wa.composition=wa.wctx.createComposition(),wa.analyser=wa.ctx.createAnalyser(),wa.analyser.fftSize=1024,wa.wctx.filters.pushBack(wa.analyser),wa.analyserArray=new Uint8Array(wa.analyser.frequencyBinCount),wa.oscilloscope=function(){var t=0,i=Math.PI/2;return function(e,n,s){var o,a=0,u=e.width,r=e.height,c=s.length,l=c/2,d=u/c;for(n.globalCompositeOperation="source-in",n.fillStyle="rgba("+Math.round(255-255*t)+","+Math.round(64*t)+","+Math.round(255*t)+","+(.95-.25*(1-Math.cos(t*i)))+")",n.fillRect(0,0,u,r),t=0,n.globalCompositeOperation="source-over",n.save(),n.translate(0,r/2),n.beginPath(),n.moveTo(0,0);c>a;++a)o=(s[a]-128)/128,t=Math.max(Math.abs(o),t),o*=.5-Math.cos((l>a?a:c-a)/l*Math.PI)/2,n.lineTo(a*d,o*r);n.lineJoin="round",n.lineWidth=1+Math.round(2*t),n.strokeStyle="rgba(200,200,255,"+Math.min(5*t,1)+")",n.stroke(),n.restore()}}(),function(){function t(){ui.currentTime(wa.composition.getOffset()),i=requestAnimationFrame(t)}var i;wa.compositionLoop=function(e){e?t():cancelAnimationFrame(i)}}(),window.gs={},gs.bpm=function(t){return arguments.length?(gs._bpm=Math.max(20,Math.min(t,999)),ui.bpm(gs._bpm),void ui.samples.forEach(function(t){t.wsample.when=t.xem/ui.BPMem,t.updateCSS_width(),t.updateCSS_offset()})):gs._bpm},gs.currentTime=function(t){arguments.length&&ui.currentTime(t)},gs.playToggle=function(t){"boolean"!=typeof t&&(t=!gs.isPlaying),t?gs.play():gs.pause()},gs.play=function(){!gs.isPlaying&&ui.samples.length&&(gs.isPaused=gs.isStopped=!1,gs.isPlaying=!0,wa.composition.playFrom(),wa.compositionLoop(!0),ui.play())},gs.pause=function(){gs.isPlaying&&(gs.isPlaying=!1,gs.isPaused=!0,wa.composition.pause(),wa.compositionLoop(!1),ui.pause())},gs.stop=function(){gs.isStopped||(gs.isPlaying=gs.isPaused=!1,gs.isStopped=!0,wa.composition.stop(),wa.compositionLoop(!1),ui.stop())},function(){function t(t,i){i=i.originalEvent.deltaY,gs.bpm(gs._bpm+(i>0?-t:i?t:0))}ui.jqBpmA.mousedown(function(){return ui.jqBpmA.toggleClass("clicked"),!1}),ui.jqBpmList.children().mousedown(function(){gs.bpm(+this.textContent)}),ui.jqBody.mousedown(function(){ui.jqBpmA.removeClass("clicked")}),ui.jqBpmInt.on("wheel",t.bind(null,1)),ui.jqBpmDec.on("wheel",t.bind(null,.01))}(),function(){var t,i=!1,e={files:function(t){var i=t.pageX;ui.setFilesWidth(35>i?0:i)},trackNames:function(t){var i=t.pageX-ui.jqGrid.offset().left;ui.setTrackNamesWidth(35>i?0:i)}};$(".extend").mousedown(function(n){0===n.button&&(i=!0,ui.jqBody.addClass("cursor-ewResize"),t=e[this.dataset.mousemoveFn])}),ui.jqBody.mouseup(function(t){0===t.button&&i&&(i=!1,ui.jqBody.removeClass("cursor-ewResize"))}).mousemove(function(e){i&&t(e)})}(),ui.jqBody.on({dragover:!1,drop:function(t){t=t.originalEvent;var i=t&&t.dataTransfer;return $.each(i&&i.files,function(){ui.newFile(this)}),!1}}),function(){function t(){e&&(ui.selectTool(e),e=null),i=!1}var i,e,n,s=0,o=0;ui.jqWindow.blur(t),ui.jqTrackLines.on({contextmenu:!1,mousedown:function(t){if(!i){i=!0,n=ui.getGridXem(t.pageX),s=t.pageX,o=t.pageY,2===t.button&&(e=ui.currentTool,ui.selectTool("delete"));var a=ui.tool[ui.currentTool].mousedown;a&&a(t,t.target.uisample)}}}),ui.jqGrid.on("wheel",function(t){t=t.originalEvent,"zoom"===ui.currentTool?ui.tool.zoom.wheel(t):ui.setGridTop(ui.gridTop+(t.deltaY<0?.9:-.9)*ui.gridEm),ui.updateGridBoxShadow()}),ui.jqBody.on({mousemove:function(t){if(i){var e=ui.tool[ui.currentTool].mousemove,a=ui.getGridXem(t.pageX);e&&e(t,t.target.uisample,"hand"!==ui.currentTool?(a-n)*ui.gridEm:t.pageX-s,t.pageY-o),n=a,s=t.pageX,o=t.pageY}},mouseup:function(e){if(i){var n=ui.tool[ui.currentTool].mouseup;n&&n(e,e.target.uisample),t()}},wheel:function(t){return t.ctrlKey?!1:void 0}})}(),function(){function t(){i&&(ui.selectTool(i),i=null)}var i,e={16:"select",86:"select",66:"paint",68:"delete",77:"mute",83:"slip",67:"cut",32:"hand",72:"hand",17:"zoom",90:"zoom"};ui.jqWindow.blur(t),ui.jqBody.keydown(function(t){if(t=t.keyCode,8===t)return ui.toggleMagnetism(),!1;var n=e[t];n&&n!==ui.currentTool&&(16!==t&&17!==t&&32!==t||(i=ui.currentTool),ui.selectTool(n))}).keyup(function(i){i=i.keyCode,16!==i&&17!==i&&32!==i||t()})}(),ui.jqPlay.click(gs.playToggle),ui.jqStop.click(function(){ui.stopFile(),gs.stop()}),wa.composition.onended(gs.stop),ui.jqWindow.on("resize",ui.resize),ui.jqBtnMagnet.click(ui.toggleMagnetism),ui.jqBtnTools.tool={},ui.jqBtnTools.each(function(){ui.jqBtnTools.tool[this.dataset.tool]=this}).click(function(){ui.selectTool(this.dataset.tool)}),ui.tool["delete"]={mousedown:function(t,i){ui.sampleDelete(i)},mousemove:function(t,i){ui.sampleDelete(i)}},ui.tool.hand={mousedown:function(){ui.jqBody.addClass("cursor-move")},mouseup:function(){ui.jqBody.removeClass("cursor-move")},mousemove:function(t,i,e,n){ui.setTrackLinesLeft(ui.trackLinesLeft+e),ui.setGridTop(ui.gridTop+n),ui.updateTimeline(),ui.updateTrackLinesBg(),ui.updateGridBoxShadow()}},ui.tool.mute={mousedown:function(t,i){i&&i.mute()},mousemove:function(t,i){i&&i.mute()}},function(){var t;ui.tool.paint={mousedown:function(i,e){t=e},mouseup:function(){t&&(ui.samplesForEach(t,function(t){wa.composition.update(t.wsample,"mv")}),t=null)},mousemove:function(i,e,n,s){if(t){ui.samplesMoveX(t,n/ui.gridEm),i=i.target;var o,a=1/0,u=i.uitrack||i.uisample&&i.uisample.track;u&&(t.selected?(o=u.id-t.track.id,0>o&&(ui.selectedSamples.forEach(function(t){a=Math.min(t.track.id,a)}),o=-Math.min(a,-o)),ui.selectedSamples.forEach(function(t){t.inTrack(t.track.id+o)})):t.inTrack(u.id))}}}}(),ui.tool.select={mousedown:function(t,i){t.shiftKey||ui.samplesUnselect(),i&&ui.sampleSelect(i,!i.selected)}},function(){var t;ui.tool.slip={mousedown:function(i,e){t=e},mouseup:function(){t=null},mousemove:function(i,e,n){t&&ui.samplesSlip(t,n/ui.gridEm)}}}(),function(){function t(t,i){ui.setGridZoom(ui.gridZoom*i,t.pageX-ui.filesWidth-ui.trackNamesWidth,t.pageY-ui.gridColsY)}ui.tool.zoom={wheel:function(i){t(i,i.deltaY<0?1.1:.9)},mousedown:function(i){0===i.button&&t(i,i.altKey?.8:1.2)}}}(),ui.resize(),ui.setFilesWidth(200),ui.setTrackLinesLeft(0),ui.setTrackNamesWidth(125),ui.setGridZoom(1.5,0,0),ui.analyserToggle(!0),ui.toggleMagnetism(!0),ui.updateTrackLinesBg(),gs.bpm(120),gs.currentTime(0),ui.jqBtnTools.filter("[data-tool='paint']").click();