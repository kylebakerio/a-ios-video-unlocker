# a-ios-video-unlocker
aframe component for unlocking videos form the user gesture requirement in iOS safari (and other browsers).

problem it solves:
iOS videos won't play _with audio_ unless the play event was initiated from a specific user gesture. this is a problem if you want to trigger playing a video with audio because of, say, an event occuring in 3d space. 

tl;dr

1. include the script after a-frame but before your scene
2. add `unlock-me` class to all videos you want to unlock
3. add a unique ID to each video

the component will listen for all valid unlock events and keep trying to unlock the videos, until it succeeds. then it will remove the events.

it exposes promises for each video, and public booleans the rest of your app can use as well.

slightly more documentation is at top of component file. it's pretty simple, just look at the source code.

demo coming... eventually...

## possible improvements:
- add a default overlay to click before site is accessible
- more configurability for users who want some kind of custom integration, like clicks for dom elements that are not the canvas
- probably should just remove listeners from canvas and put it on document.body, honestly. 

sources:
- https://webkit.org/blog/6784/new-video-policies-for-ios/
- https://stackoverflow.com/questions/74145147/videos-do-not-autoplay-with-audio-after-user-gesture
