import {forms, hair, lighting} from '../efecto-foco/shaderParts';
import {seatedBody, seatedDimensions, seatedTransforms} from '../seatedActor';
import {toLabFragmentShader} from '../el-experimento/ElExperimento';

export const driveShader = toLabFragmentShader(`
precision highp float;
uniform vec2 R;
uniform vec3 CAM, TA;
uniform float T, DISTANCE, PEDAL, BUCKLE, STEERING, GLANCE, INSERT;
float NOL = 0.;
${forms}
${hair}
${seatedDimensions}
${seatedTransforms}
#define NEAR(distance, material) {float next = distance; if(next<d){d=next;id=material;}}
const vec3 DRIVER = vec3(-.47,-.095,.34);
const vec3 CLASP = vec3(-.19,.64,.28);

vec4 driverPose(){return vec4(.033,-1.16*GLANCE,0.,0.);}
float bend(float s){float q=max(0.,s-43.);return .016*q*q;}
vec3 roadSpace(vec3 p){
  float yaw=-atan(.032*max(0.,DISTANCE-43.));
  p.xz=rot(yaw)*p.xz;
  p.x+=bend(DISTANCE)+1.66;
  p.z-=DISTANCE;
  return p;
}
vec3 tongue(){return CLASP+vec3(.21,.19,.034)*(1.-BUCKLE)+vec3(0.,.055,.016);}
vec3 shoe(){return vec3(-.36,.105+.16*(1.-PEDAL),-.59+.22*(1.-PEDAL));}

vec2 driver(vec3 p){
  float d=3., id=4., offset=0.;
  vec4 pose=driverPose();
  vec3 local=p-DRIVER;
  vec3 body=torsoSpace(local,pose.x), head=headSpace(local,pose);
  vec3 q=vec3(abs(local.x),local.y,local.z);
  float breath=.003*sin(T*2.4);
  if(INSERT==2.){
    vec3 foot=shoe();
    NEAR(cap(p,vec3(-.36,.49,-.12),foot+vec3(0.,.04,.12),.062),6.)
    NEAR(rbox(p,foot,vec3(.078,.057,.141),.047),7.)
    NEAR(rbox(p,foot-vec3(0.,.047,0.),vec3(.079,.013,.143),.012),22.)
    return vec2(d,id);
  }
  ${seatedBody}
  for(int i=0;i<2;i++){
    float side=i==0?-1.:1.;
    vec2 h=rot(.72*STEERING)*vec2(side*.178,.115);
    vec3 hand=vec3(-.47+h.x,1.05+h.y,-.395);
    if(i==1 && INSERT==1. && BUCKLE<.985) hand=tongue()+vec3(.037,.033,.028);
    vec3 shoulder=DRIVER+vec3(side*.19,1.025,-.13);
    vec3 elbow=DRIVER+vec3(side*.25,.865,-.21);
    NEAR(cap(p,shoulder,elbow,.060),4.)
    NEAR(cap(p,elbow,hand,.046),9.)
    NEAR(rbox(p,hand,vec3(.053,.040,.045),.032),9.)
  }
  return vec2(d,id);
}

vec2 map(vec3 p){
  vec3 road=roadSpace(p);
  float s=-road.z, x=road.x-bend(s);
  float d=p.y+.02,id=0.;
  float bank=max((x+4.35)/2.8,max(30.-s,p.y-2.16));
  NEAR(bank,17.)
  vec3 sign=road-vec3(4.15,1.92,-25.);
  vec3 diamond=sign;
  diamond.xy=rot(.7854)*diamond.xy;
  NEAR(rbox(diamond,vec3(0.),vec3(.335,.335,.033),.023),18.)
  NEAR(rbox(sign,vec3(0.,-1.0,0.),vec3(.035,.96,.035),.013),3.)
  NEAR(rbox(p,vec3(0.,.025,.12),vec3(.88,.055,1.00),.038),3.)
  NEAR(rbox(p,vec3(0.,.896,-.82),vec3(.88,.114,.28),.077),3.)
  NEAR(rbox(p,vec3(0.,.995,-.76),vec3(.875,.027,.24),.024),13.)
  NEAR(rbox(p,vec3(0.,.73,-1.20),vec3(.83,.07,.47),.05),14.)
  NEAR(rbox(p,vec3(0.,.32,.05),vec3(.125,.24,.65),.046),13.)
  vec3 q=vec3(abs(p.x),p.y,p.z);
  NEAR(rbox(q,vec3(.875,.68,.14),vec3(.057,.31,.76),.046),14.)
  NEAR(cap(q,vec3(.847,1.02,-.68),vec3(.83,1.70,.06),.038),3.)
  NEAR(rbox(p,vec3(0.,1.70,.33),vec3(.86,.030,.50),.028),3.)
  NEAR(rbox(p,vec3(-.48,.40,.42),vec3(.255,.070,.32),.060),14.)
  NEAR(rbox(p,vec3(-.48,.88,.62),vec3(.255,.44,.076),.071),14.)
  if(INSERT==2.){
    NEAR(rbox(p,vec3(-.42,.30,-.78),vec3(.44,.24,.045),.038),3.)
    vec3 ped=p-vec3(-.36,.15,-.718);
    ped.yz=rot(.23+PEDAL*.45)*ped.yz;
    NEAR(rbox(ped,vec3(0.),vec3(.065,.100,.021),.016),16.)
  }
  vec3 wheel=p-vec3(-.47,1.05,-.41);
  wheel.yz=rot(-.12)*wheel.yz;
  NEAR(length(vec2(length(wheel.xy)-.207,wheel.z))-.024,3.)
  wheel.xy=rot(-.72*STEERING)*wheel.xy;
  NEAR(rbox(wheel,vec3(0.),vec3(.187,.022,.019),.016),13.)
  NEAR(rbox(wheel,vec3(0.),vec3(.066,.052,.035),.028),3.)
  if(INSERT!=2.){
    NEAR(rbox(p,CLASP,vec3(.047,.057,.052),.016),3.)
    NEAR(rbox(p,CLASP+vec3(0.,.051,.009),vec3(.039,.013,.043),.009),19.)
    NEAR(rbox(p,tongue(),vec3(.029,.014,.037),.006),16.)
    vec3 a=vec3(-.68,1.08,.284), b=tongue();
    vec3 v=b-a;
    float along=clamp(dot(p.xy-a.xy,v.xy)/dot(v.xy,v.xy),0.,1.);
    vec3 belt=a+along*v;
    belt.z-=.33*sin(along*3.14159);
    NEAR(max(length(p.xy-belt.xy)-.027,abs(p.z-belt.z)-.012),20.)
  }
  float bodyBound=rbox(p,vec3(-.47,.79,.15),vec3(.44,.77,.90),0.);
  if(bodyBound<d){
    if(bodyBound>.07) d=bodyBound;
    else {vec2 body=driver(p);NEAR(body.x,body.y)}
  }
  return vec2(d,id);
}
${lighting}
vec3 palette(vec3 p,float id){
  vec3 road=roadSpace(p);float s=-road.z,x=road.x-bend(s);
  if(id==0.){
    if(abs(x)>3.70)return vec3(.53,.43,.32);
    if(abs(abs(x)-3.40)<.045)return vec3(.72,.68,.57);
    if(abs(x)<.055 && mod(s,4.)<2.)return vec3(.76,.55,.29);
    return vec3(.34,.33,.30);
  }
  if(id==3.)return vec3(.21,.21,.22);
  if(id==4.)return vec3(.96,.95,.91);
  if(id==6.)return vec3(.30,.30,.37);
  if(id==7.)return vec3(.22,.20,.20);
  if(id==8.)return vec3(.42,.27,.17);
  if(id==13.)return vec3(.31,.33,.35);
  if(id==14.)return vec3(.35,.33,.30);
  if(id==16.)return vec3(.69,.66,.57);
  if(id==17.)return vec3(.64,.51,.37)*mix(.79,1.,smoothstep(0.,.10,fract(s/3.4)));
  if(id==18.){
    vec2 k=road.xy-vec2(4.15,1.92);
    float stem=min(rect(k,vec2(-.082,-.058),vec2(.019,.112)),rect(k,vec2(.012,.046),vec2(.111,.017)));
    float arrow=abs(abs(k.y-.046)+k.x-.162);
    if(stem<0. || (arrow<.020 && k.x>.062 && k.x<.162))return vec3(.20,.13,.08);
    return vec3(.87,.62,.28);
  }
  if(id==19.)return vec3(.67,.25,.17);
  if(id==20.)return vec3(.235,.22,.202);
  if(id==22.)return vec3(.44,.38,.32);
  if(id==5.){
    vec3 h=headSpace(p-DRIVER,driverPose());
    if(length(h)<.21){
      vec3 m=normalize(h);
      if(eye(h,.36) || (m.z<0. && length((m.xy-vec2(0.,-.40))/vec2(.20,.035))<1.))return vec3(.17,.11,.09);
    }
  }
  return vec3(.90,.72,.58);
}
void main(){
  vec2 fc=gl_FragCoord.xy;
  ro=CAM;fw=normalize(TA-ro);rt=normalize(cross(fw,vec3(0.,1.,0.)));up=cross(rt,fw);
  vec2 uv=(fc-.5*R)/R.x;
  float focal=R.y/R.x<1. ? 1.20 : 1.14;
  vec3 rd=normalize(uv.x*rt+uv.y*up+focal*fw);
  vec2 hit=trace(rd);
  vec3 p=ro+rd*hit.x;
  vec3 sky=mix(vec3(.68,.57,.44),vec3(.48,.49,.47),smoothstep(.0,.7,rd.y));
  vec3 color=sky;
  if(hit.x<44.999){
    vec3 n=nrm(p);
    vec3 base=palette(p,hit.y);
    float lit=smoothstep(.04,.10,dot(n,normalize(vec3(-.38,.78,-.43))));
    color=base*mix(vec3(.57,.60,.64),vec3(.99,.91,.78),lit);
    float ink=0.;
    float steps=max(1.2,R.x/640.);
    for(int i=0;i<2;i++){
      vec3 offset=(i==0?rt:up)*steps/R.x;
      vec2 other=trace(normalize(rd+offset));
      if(abs(hit.y-other.y)>.5 || abs(hit.x-other.x)>.13+.055*hit.x)ink=1.;
    }
    if(ink>.5)color=vec3(.17,.11,.09);
    color=mix(color,sky,smoothstep(12.,45.,hit.x)*.78);
  }
  vec2 grain=rot(.6)*fc;
  color*=.91+.09*vn(vec3(grain.x*.9,grain.y*.05,1.));
  color*=1.-.075*min(1.,dot(uv,uv));
  gl_FragColor=vec4(color,1.);
}
`);
