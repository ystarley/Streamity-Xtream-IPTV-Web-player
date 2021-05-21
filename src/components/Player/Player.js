import React, {useRef,useState,useEffect} from "react"
import ReactPlayer from 'react-player'
import {useSelector} from "react-redux"
import Fullscreen from "../Live/Fullscreen"
import Button from "./Buttons/Button"
import VolumeButton from "./Buttons/VolumeButton"
import PiPButton from "./Buttons/PiPButton"
import {generateUrl, catchupUrlGenerator} from "../../other/generate-url"

import "./Player.css"

import styled from "styled-components"
const PlayerDiv = styled.div`
width: 100%;
background: #0000003d;
padding: 0.7rem;
border-radius: 0.4rem;
height: 40vh;
position: relative;
overflow: hidden;
user-select:none;
`

const ContainerButtons = styled.div`
display: flex;
width: 100%;
position: absolute;
bottom: 0;
left: 0;
right: 0;
height: 3em;
background-color: rgba(43, 51, 63, 0.7);
color: white;
transition:  bottom .5s ease;
`

let timeout = null;
const Player = () => {
  const ref = useRef();

  const playingChannel = useSelector(state => state.playingCh || {});
  const [play, setPlay] = useState(!!playingChannel);
  const [volume, setVolume] = useState(50);
  const [pip, setPip] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const [hoverStyle, setHoverStyle] = useState({bottom:"-3rem"});
  const [showCursor, setShowCursor] = useState({cursor: ""})

  const [url, setUrl] = useState();

  useEffect(() => {
    if (ref.current) {
      const elem = ref.current;
      if (fullscreen) {
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
          elem.msRequestFullscreen();
        }
        showOverlayTimer();
      }
      else {
        setShowCursor({cursor: ""})
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => { });
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    }
  }, [fullscreen])

  useEffect(() => {
    if(!play)
      showOverlay(true)
  }, [play])
  
  useEffect(() => {
    if (!playingChannel)
      return;

    let ip = playingChannel.url || generateUrl("live", playingChannel.stream_id, "m3u8");
    if (playingChannel.url) {
      let splitted = ip.split("/");
      if (splitted.includes("/live/"))
        ip = ip.replace(".ts", ".m3u8");
      else if (splitted.length >= 5) {
        ip = splitted.slice(0, splitted.length - 3).join("/") + "/live/" + splitted.slice(splitted.length - 3, splitted.length).join("/") + ".m3u8"
      } else ip = ip.replace("ts", "m3u8");
    }

    if (playingChannel.timeshift)
      ip = catchupUrlGenerator(ip, playingChannel.timeshift, playingChannel.duration);

      setUrl(ip)
    setPlay(true)
  }, [playingChannel])

  const showOverlay = (show) =>{
    setShowCursor({cursor: ""})
    setHoverStyle({
      bottom: show ? "0rem" : "-3rem"
    })
  }

  const showOverlayTimer = () =>{
    setShowCursor({cursor: ""})
    clearTimeout(timeout);
    showOverlay(true);
    timeout = setTimeout(()=>{
      showOverlay(false);
      setShowCursor({cursor: "none"})
    },4000);
  }
 

    return (
      <PlayerDiv ref={ref} 
      onDoubleClick={() => setFullscreen(!fullscreen)} 
      onMouseEnter={()=> showOverlay(true)} 
      onMouseLeave = {()=> showOverlay(false)} 
      onMouseMove={() => fullscreen && showOverlayTimer()} 
      style={showCursor}>
        <ReactPlayer
         className='react-player'
         width='100%'
         height='100%'
         playing={play}
         volume={volume/100}
         url={url}
         pip={pip}
         controls={false}
        />
        <Fullscreen externalShow={fullscreen && hoverStyle.bottom !== "-3rem"} cTitle={playingChannel.title} cDesc={playingChannel.desc} cDuration={playingChannel.duration}/>
        <ContainerButtons dir="ltr" style={hoverStyle}>
        	<Button enabled={play} onClick={() => setPlay(!play)} iconOn={"fas fa-play"} iconOff={"fas fa-pause"} textOn={"Play"} textOff={"Pause"}/>
          <VolumeButton enabled={volume===0} onClick={() => setVolume(0)} onChangeInput={(e) => setVolume(e.target.value)} volume={volume}/>
          <PiPButton enabled={pip} onClick={() => setPip(!pip)}/>
          <Button enabled={fullscreen} onClick={() => setFullscreen(!fullscreen)} iconOn={"fas fa-expand"} iconOff={"fas fa-compress"} textOn={"Fullscreen"} textOff={"Exit fullscreen"}/>
        </ContainerButtons>
      </PlayerDiv>
      
    )
}

export default Player