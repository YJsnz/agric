export interface MotionFrame {leftRoll:number;rightRoll:number;steering:number;bob:number;moving:boolean;turning:boolean}
// Presentation only: never advances server position or changes approved navigation routes.
export class TransportMotion {
 private previous:{x:number;y:number;heading:number;time:number;version:number}|undefined
 private left=0;private right=0;private steering=0
 private radius:number;private halfTrack:number;private wheelBase:number
 constructor(radius=4.5,halfTrack=5,wheelBase=12){this.radius=radius;this.halfTrack=halfTrack;this.wheelBase=wheelBase}
 setMetrics(radius:number,halfTrack:number,wheelBase:number){this.radius=Math.max(.0001,radius);this.halfTrack=halfTrack;this.wheelBase=wheelBase}
 update(x:number,y:number,heading:number,time:number,running:boolean,version:number):MotionFrame{
  const last=this.previous;this.previous={x,y,heading,time,version}
  const dt=last?(time-last.time)/1000:0,travel=last?Math.hypot(x-last.x,y-last.y):0
  if(!last||last.version!==version||dt<=0||dt>2||travel>80){this.steering=0;return {leftRoll:this.left,rightRoll:this.right,steering:0,bob:0,moving:false,turning:false}}
  const yaw=running?Math.atan2(Math.sin(heading-last.heading),Math.cos(heading-last.heading)):0
  const direction=(x-last.x)*Math.cos(heading)+(y-last.y)*Math.sin(heading)>=0?1:-1
  const distance=running?travel*direction:0,speed=Math.abs(distance)/dt,turning=Math.abs(yaw)>.0001
  this.left+=(distance-yaw*this.halfTrack)/this.radius;this.right+=(distance+yaw*this.halfTrack)/this.radius
  const target=running?Math.max(-.48,Math.min(.48,Math.atan2(yaw/dt*this.wheelBase,Math.max(speed,8)))):0
  this.steering+=(target-this.steering)*(1-Math.exp(-dt*10))
  return {leftRoll:this.left,rightRoll:this.right,steering:this.steering,bob:speed>.1?Math.sin((this.left+this.right)*.7)*Math.min(1,speed/24):0,moving:running&&speed>.1,turning:running&&turning}
 }
}
