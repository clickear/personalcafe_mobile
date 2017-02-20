<template>
	<div class="wrapper" @click="showPlayList=false">
	    <div id="bg" class="bg" :style="{backgroundImage: 'url('+items[currentIndex].musicpic+')'}">
	        <div class="bg-cover" ></div>
	    </div>
	    <div class="title">
	        <div class="music-info">
	            <div class="song" id="songName">{{items[currentIndex].musicname}}</div>
	            <div class="artist" id="artist">{{items[currentIndex].musicalname}}</div>
	        </div>
	    </div>
	    <div class="play-board">
	        <img id="needle" class="play-needle" :class="{'pause-needle':!running || dragging}" src="/static/img/play_needle.png"/>
	        <div class="disk-bg"></div>
           <swiper ref="mySwiperA" style="height:300px;" :options="{notNextTick: true,lazyLoading : true,lazyLoadingInPrevNext : true,lazyLoadingInPrevNextAmount : 2,onTransitionEnd:_slideChange,onTouchStart:_slideStart,onTouchEnd:_slideEnd}">
            <swiper-slide v-for="(item,index) in items">
            <div class="disk-cover disk-cover-animation" :class="{'disk-cover-running': running && index==currentIndex}">
                <img class="album swiper-lazy" :data-src="item.musicpic" />
                <img class="disk-border" src="/static/img/play_disc.png"/>
            </div>
            </swiper-slide>
          </swiper>
	        <audio id="player" :src="items[currentIndex].musicsrc"></audio>
	        <div class="footer">
	            <div class="process" id="process">
	                <span id="currentTime">{{ currentTime }}</span>
	                <div class="process-bar" id="processbar">
	                    <div class="rdy" :style ="{'width':percentrdy+'%'}" ></div>
	                    <div class="cur" id="curbar" :style ="{'width':percentage+'%'}" >
	                        <span id="processBtn" class="process-btn c-btn" @touchstart="onTouchStart($event)" @touchend="onProcessTouchEnd($event)" @touchmove="onProcessTouchMove($event)" ></span>
	                    </div>
	                </div>
	                <span id="totalTime">{{ duration }}</span>
	            </div>
	            <div class="control" id="controls">
	                <span class="c-btn loop-btn" onclick="ctx.loop()"></span>
	                <span class="pre c-btn" @click="prev"></span>
	                <span class=" c-btn" :class="{'pause':running,'play':!running}" @click="toggerStatus"></span>
	                <span class="next c-btn" @click="next"></span>
	                <span class="c-btn list-btn" @click="clickPlayList($event)"></span>
	            </div>
	        </div>
	    </div>
	    <div class="play-list" id="playList" :style="{bottom:0}" v-if="showPlayList">
	        <div class="list-title">播放列表（<span id="playListCount">{{items.length}}</span>）</div>
	        <ul class="list-content" id="listContent">
                <li v-for="(item, index) in items" @click="clickPlayItem($event, index)" :class="{'active':currentIndex == index}" >
                    <div class="song-play" v-if="currentIndex == index"></div>
                    {{item.musicname}}
                </li>
	        </ul>
	    </div>
	</div>
</template>

<script>
import musicData from '../../mock/music.json'

function convertTimeHHMMSS (val) {
  let hhmmss = new Date(val * 1000).toISOString().substr(11, 8)
  return (hhmmss.indexOf('00:') === 0) ? hhmmss.substr(3) : hhmmss
}

export default {
  props: {

  },
  data () {
    return {
      items: [],
      running: true,
      currentIndex: 0,
      showPlayList: false,
      player: {},
      currentTime: '',
      totalDuration: 0,
      percentage: 0,
      percentrdy: 0,
      processBtnState: false,
      dragging: false
    }
  },
  computed: {
    duration () {
      return this.player ? convertTimeHHMMSS(this.totalDuration) : 's'
    },
    swiper () {
      return this.$refs.mySwiperA.swiper
    }
  },
  created () {
    let vm = this
    if (musicData && musicData.code === 200) {
      var musicDataCommend = musicData.recommend
      for (let i = musicDataCommend.length - 1; i >= 0; i--) {
        vm.items.push({
          musicname: musicDataCommend[i].name,
          musicpic: musicDataCommend[i].album.picUrl,
          musicsrc: musicDataCommend[i].mp3Url,
          musicalname: musicDataCommend[i].album.name
        })
      }
    }
    window.player = this.player = document.getElementById('player')
    console.log(vm.items[vm.currentIndex].musicsrc)
    // fetch('http://localhost:8080/music').then(function (res) {
    //   if (res.ok) {
    //     res.json().then(function (data) {
    //       debugger
    //       console.log(data.entries)
    //     })
    //   } else {
    //     console.log('Looks like the response wasn\'t perfect, got status', res.status)
    //   }
    // }, function (e) {
    //   console.log('Fetch failed!', e)
    // })
  },
  methods: {
    onProcessTouchStart (e) {
      e = e.originalEvent || e
      this.processBtnState = true
      this.originX = (e.clientX || e.touches[0].clientX)
    },
    onProcessTouchEnd (e) {
      if (this.processBtnState) {
        this.player.currentTime = document.getElementById('curbar').offsetWidth / document.getElementById('processbar').offsetWidth * this.totalDuration
        this.processBtnState = false
      }
    },
    onTouchMove (e) {
      e = e.originalEvent || e
      var totalWidth = document.getElementById('processbar').offsetWidth
      e.preventDefault()
      if (this.processBtnState) {
        var moveX = (e.clientX || e.touches[0].clientX) - this.originX
        var newWidth = document.getElementById('curbar').offsetWidth + moveX
        if (newWidth > totalWidth || newWidth < 0) {
          this.processBtnState = false
        } else {
          this.percentage = newWidth / totalWidth * 100
          console.log(this.percentage)
          var currTime = newWidth / totalWidth * this.totalDuration
          this.currentTime = convertTimeHHMMSS(currTime)
        }
        this.originX = (e.clientX || e.touches[0].clientX)
      }
    },
    toggerStatus () {
      this.running = !this.running
      if (this.running) {
        this.player.play()
      } else {
        this.player.pause()
      }
    },
    next () {
      this.currentIndex++
      this.swiper.slideTo(this.currentIndex, 1000, false)
      this.$nextTick(function () {
        this.player.play()
        this.running = true
      })
    },
    prev () {
      console.log(this.items.length)
      if (this.currentIndex === 0) {
        this.currentIndex = this.items.length - 1
      } else {
        this.currentIndex--
      }
      this.swiper.slideTo(this.currentIndex, 1000, false)
      this.$nextTick(function () {
        this.player.play()
        this.running = true
      })
    },
    clickPlayList (ev) {
      this.showPlayList = !this.showPlayList
      ev.cancelBubble = true
    },
    clickPlayItem (ev, index) {
      this.currentIndex = index
      this.$nextTick(function () {
        this.player.play()
        this.running = true
      })
      ev.cancelBubble = true
    },
    _slideChange (swiper) {
      if (this.currentIndex === swiper.activeIndex) return
      this.currentIndex = swiper.activeIndex
      console.log(this.currentIndex)
      this.$nextTick(function () {
        this.player.src = this.items[this.currentIndex].musicsrc
        this.player.play()
        this.running = true
      })
    },
    _slideStart () {
      this.dragging = true
    },
    _slideEnd () {
      this.dragging = false
    },
    _handleProgress () {
      let buffer = this.player.buffered
      let bufferTime = buffer.length > 0 ? buffer.end(buffer.length - 1) : 0
      if (this.totalDuration !== 0) {
        this.percentrdy = bufferTime / this.totalDuration * 100
      }
    },
    _handleLoaded: function () {
      if (this.player.readyState >= 2) {
        this.totalDuration = parseInt(this.player.duration)
      } else {
        throw new Error('Failed to load sound file')
      }
    },
    _handlePlayingUI (e) {
      if (!this.processBtnState) {
        let currTime = parseInt(this.player.currentTime)
        let percentage = (currTime / this.totalDuration) * 100
        this.percentage = percentage
        this.progressStyle = `width:${percentage}%;`
        this.currentTime = convertTimeHHMMSS(currTime)
      }
    },
    init () {
      this.player.addEventListener('timeupdate', this._handlePlayingUI)
      this.player.addEventListener('loadeddata', this._handleLoaded)
      this.player.addEventListener('progress', this._handleProgress)
    }
  },
  mounted () {
    let vm = this
    vm.$nextTick(function () {
      vm.player = document.getElementById('player')
      vm.init()
      vm.player.play()
      vm.running = true
      // vm.player.src = vm.items[vm.currentIndex].musicsrc
    })
  }
}
</script>

<style>
@keyframes rotate-disk {
    100% {
        transform: rotateZ(360deg);
    }
}

@-webkit-keyframes rotate-disk {
    100% {
        -webkit-transform: rotateZ(360deg);
    }
}

html,body{
    margin: 0px;
    height: 100%;
    width: 100%;
}

.wrapper{
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.bg {
    background: #a0a0a0 center;
    position: absolute;
    top: 0px;
    left: 0px;
    height: 110%;
    width: 110%;
    margin: -5%;
    background-size: cover;
    -webkit-filter: blur(20px);
    -moz-filter: blur(20px);
   /* filter: progid:DXImageTransform.Microsoft.Blur(PixelRadius=20, MakeShadow=false);  IE6~IE9 */
    z-index: -1;
}

.bg-cover {
    background: rgba(0, 0, 0, .4);
    height: 100%;
    width: 100%;
}

.title {
    color: #fff;
    position: absolute;
    top: 0px;
    left: 0px;
    height: 10%;
    width: 100%;
    z-index: 11;
    background-color: rgba(253, 253, 253, 0.05);
}

.title .music-info {
    padding: 0 20px;
    margin: 0px auto;
    box-sizing: border-box;
    width: 100%;
    overflow: hidden;
}

.music-info .song, .artist {
    width: 100%;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 18px;
    font-weight: lighter;
    margin: 8px;
}

.music-info .artist {
    font-size: 14px;
    color: #C8C0CC;
    margin-top: 4px;
}

.play-board {
    position: relative;
    overflow: hidden;
    top: 10%;
    width: 100%;
    height: 90%;
    color: white;
}

.disk-bg {
    width: 282px;
    height: 282px;
    position: absolute;
    left: 50%;
    top: 64px;
    margin: 0px -141px;
    background-color: rgba(251, 251, 251, 0.08);
    border-radius: 141px;
}

.disk-cover {
    width: 280px;
    height: 280px;
    position: absolute;
    left: 50%;
    top: 65px;
    margin: 0% -140px;
}

.disk-cover-animation {
    animation: rotate-disk 20s infinite normal linear;
    animation-play-state: paused;
    -webkit-animation: rotate-disk 20s infinite normal linear;
    -webkit-animation-play-state: paused;
    transition: left 2s;
}

.disk-cover-running{
    -webkit-animation-play-state: running;
}

.disk-transition {
    transition: left 0.8s ease-in-out;
    -webkit-transition: left 0.8s ease-in-out;
}

.disk-cover img {
    display: block;
    width: 100%;
}

.disk-cover .album {
    width: 68%;
    margin: 16%;
}

.disk-cover .disk-border {
    position: absolute;
    top: 0px;
}

.play-needle {
    position: absolute;
    top: -23px;
    left: 50%;
    margin: 0px -12px;
    z-index: 10;
    width: 100px;
    transform-origin: 20px 20px;
    transition: transform 0.4s;
    -webkit-transform-origin: 20px 20px;
    -webkit-transition: -webkit-transform 0.4s;
}

.pause-needle {
    transform: rotateZ(-25deg);
    -webkit-transform: rotateZ(-25deg);
}

.resume-needle {
    transform: rotateZ(0deg);
    -webkit-transform: rotateZ(0deg);
}

#player {
    display: none;
}

.c-btn {
    background-position: center;
    display: inline-block;
    -webkit-filter: brightness(0.9);
}

.c-btn:hover {
    -webkit-filter: brightness(1);
}

.process {
    width: 350px;
    height: 50px;
    position: absolute;
    bottom: 100px;
    margin: 0px -175px;
    left: 50%;
    font-size: 12px;
    font-family: Arial, Helvetica, sans-serif;

}

.process .process-bar {
    position: absolute;
    left: 36px;
    width: 280px;
    margin-top: 5px;
    background-color: #615D5C;
}

.process-bar .rdy {
    background-color: #B1ADAC;
    height: 2px;

}

.process-bar .cur {
    background-color: #FB0D0D;
    height: 2px;
    position: absolute;
    top: 0;
    left: 0;
}

.cur .process-btn {
    cursor: pointer;
    background-image: url(/static/img//process_btn.png);
    background-size: cover;
    position: absolute;
    top: -9px;
    right: -13px;
    width: 22px;
    height: 22px;
    margin-left: -11px;
}

.process > span:first-child {
    position: absolute;
    left: 0px;
}

.process > span:last-child {
    position: absolute;
    right: 0px;
}

.control {
    position: absolute;
    text-align: center;
    width: 350px;
    bottom: 10px;
    left: 50%;
    margin: 0px -175px;
}

.control .c-btn {
    cursor: pointer;
    background-position:center;
    background-size: contain;
    width: 50px;
    height: 50px;
    margin: 20px 10px;
}

.control .c-btn.pre {
    background-image: url(/static/img//play_btn_prev.png);
}

.control .c-btn.play, .c-btn.pause {
    width: 70px;
    height: 70px;
    margin-bottom: 10px;
}

.control .c-btn.play {
    background-image: url(/static/img//play_rdi_btn_play.png);
}

.control .c-btn.pause {
    background-image: url(/static/img//play_rdi_btn_pause.png);
}

.control .c-btn.next {
    background-image: url(/static/img//play_btn_next.png);
}

.control .c-btn.list-btn,.control .c-btn.loop-btn {
    width: 32px;
    height: 32px;
    margin-bottom: 30px;
}

.control .c-btn.list-btn{
    background-image: url(/static/img//play_icn_src.png);
}

.control .c-btn.loop-btn {
    position: relative;
    background-image: url(/static/img//play_icn_loop.png);
}

.control .c-btn.loop-btn.active:after {
    content: '1';
    position: absolute;
    top: 14px;
    font-size: 12px;
    left: 14px;
}

.play-list {
    background: #fff;
    position: fixed;
    width: 100%;
    height: 60%;
    max-height: 390px;
    margin: 0 auto;
    bottom: -60%;
    z-index: 999
}

.play-list .list-title {
    position: absolute;
    background: inherit;
    text-align: center;
    border-bottom: #ccc solid 1px;
    height: 20px;
    margin: 0px auto;
    font-size: 20px;
    padding: 15px;
    top: -50px;
    width: 100%;
    
}

.play-list ul.list-content {
    position: absolute;
    height: 100%;
    width: 102%;
    padding: 0 4% 0 0;
    overflow-x: hidden;
    overflow-y: scroll;
    margin: 0;
}

ul.list-content > li {
    height: 16px;
    border-bottom: #E2DFDF solid 1px;
    font-size: 16px;
    padding: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

ul.list-content > li > span {
    font-size: 14px;
    color: #A0A0A0;
    overflow: hidden;
}

li.active, li.active > span {
    color: #CF3D3A !important;
}

.song-play {
    display: inline-block;
    width: 17px;
    height: 15px;
    margin-right: 5px;
    background-size: cover;
    background-image: url("/static/img//song_play_icon.png");
}

@media screen and (max-height: 650px) {
    .process {
        width: 320px;
        height: 20px;
        position: absolute;
        margin: 0px -160px;
    }

    .process .process-bar {
        left: 40px;
        width: 240px;
    }

    .disk-bg {
        width: 252px;
        height: 252px;
        position: absolute;
        left: 50%;
        top: 50px;
        margin: 0px -126px;
        background-color: rgba(251, 251, 251, 0.08);
        border-radius: 126px;
    }

    .disk-cover {
        width: 250px;
        height: 250px;
        left: 50%;
        top: 52px;
        margin: 0px -125px;
    }

    .play-needle {
        top: -20px;
        margin: 0px -12px;
        width: 85px;
        transform-origin: 16px 16px;
    }

    .control .c-btn {
        width: 45px;
        height: 45px;
        margin: 14px 8px;
    }

    .control .c-btn.play, .c-btn.pause {
        width: 62px;
        height: 62px;
        margin-bottom: 8px;
    }

    .control .c-btn.list-btn,.control .c-btn.loop-btn {
        width: 36px;
        height: 36px;
        margin-bottom: 20px;
    }

    .cur .process-btn {
        width: 20px;
        height: 20px;
    }
}
</style>
