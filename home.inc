<div id="cam-wrap">
  <!-- (A) VIDEO LIVE FEED -->
  <video id="cam-feed" autoplay></video>

  <!-- (B) CAMERA CONTROLS -->
  <div id="cam-btn">
    <button id="cam-pics" class="mi" onclick="window.location.hash='gallery'" disabled>
      collections
    </button>
    <button id="cam-snap" class="mi" onclick="cam.snap()" disabled>
      photo_camera
    </button>
  </div>
</div>

<!-- (C) SNAPSHOT FEEDBACK - JUST A WHITE FLASH -->
<div id="cam-flash"></div>
