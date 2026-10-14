// Atlas order: E, NE, N, NW, W, SW, S, SE. Map headings have positive Y down.
export function transportDirection(heading:number){
 return ((Math.round(-heading/(Math.PI/4))%8)+8)%8
}

// Select the view relative to the observer, rather than spinning a flat billboard.
export function observerHeading(groundHeading:number,cameraX:number,cameraY:number,cameraZ:number){
 const length=Math.hypot(cameraX,cameraZ)||1
 const x=Math.cos(groundHeading),z=Math.sin(groundHeading)
 const screenX=(x*cameraZ-z*cameraX)/length
 const screenY=(x*cameraX+z*cameraZ)/length*Math.sin(Math.atan2(Math.max(.01,cameraY),length))
 return Math.atan2(screenY,screenX)
}
