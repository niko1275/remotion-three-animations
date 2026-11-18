import {seatedBody, seatedDimensions, seatedTransforms} from '../seatedActor';
import {forms, hair, lighting} from '../efecto-foco/shaderParts';

export const accusationShader = `
precision highp float;
uniform vec2 R, HANDS;
uniform float T;
uniform vec3 CAM, TA;
// Each actor supplies torso pitch, head yaw, head pitch and mouth opening.
uniform vec4 INTERROGATOR, PROTAGONIST;
float NOL = 0.;
${forms}
${hair}

${seatedDimensions}const vec3 LAMP = vec3(0.,2.28,0.);

#define NEAR(distance, material) {float next = distance; if (next < d) {d = next; id = material;}}

vec3 actorSpace(vec3 p, bool protagonist) {
  p.z -= protagonist ? 1.02 : -1.02;
  if (!protagonist) p.xz = -p.xz;
  return p;
}
${seatedTransforms}vec2 actor(vec3 p, bool protagonist) {
  vec4 pose = protagonist ? PROTAGONIST : INTERROGATOR;
  float gesture = protagonist ? HANDS.y : HANDS.x;
  float offset = protagonist ? 0. : 6.;
  vec2 seat = chair(p);
  float d = seat.x, id = seat.y;
  vec3 body = torsoSpace(p, pose.x);
  vec3 q = vec3(abs(p.x), p.y, p.z);
  vec3 head = headSpace(p, pose);
  float breath = .006*sin(T*2.4 + offset);

${seatedBody}  for (int i=0;i<2;i++) {
    float side = i == 0 ? -1. : 1.;
    float shoulderWidth = protagonist ? .23 - .038 * gesture : .23;
    vec3 shoulder = vec3(side*shoulderWidth,1.02,-.13)-HIP;
    shoulder.yz = rot(pose.x)*shoulder.yz;
    shoulder += HIP;
    float reach = i == 0 ? gesture : gesture*.84;
    vec3 elbow = protagonist
      ? mix(vec3(side*.28,.92,-.285),vec3(side*.205,.86,-.20),reach)
      : mix(vec3(side*.28,.90,-.24),vec3(side*.285,.966,-.39),reach);
    vec3 hand = protagonist
      ? mix(vec3(side*.16,1.012,-.49),vec3(side*.094,.913,-.27),reach)
      : mix(vec3(side*.16,1.012,-.49),vec3(side*.155,1.011,-.63),reach);
    // The investigator keeps both hands down. The student draws the hands together.
    if (protagonist) {
      hand.x -= side * (.005+.005*sin(T*3.6+side)) * gesture;
      hand.y += .006*sin(T*2.1+side);
    } else {
      hand.z += .003*sin(T*2.+side);
    }
    NEAR(min(cap(p,shoulder,elbow,.06),cap(p,elbow,hand,.055)),4.+offset)
    NEAR(length(p-hand)-.062,9.+offset)
  }
  return vec2(d,id);
}
const vec2 FORM_CENTER = vec2(-.11,-.13);
vec2 formSpace(vec2 xz) {
  return rot(.12) * (xz-FORM_CENTER);
}
vec2 map(vec3 p) {
  float d = p.y, id = 0.;
  NEAR(min(min(5.25-abs(p.x),3.3-abs(p.z)),2.95-p.y),2.)
  NEAR(rbox(p,vec3(0.,.91,0.),vec3(.55,.045,.68),.024),1.)
  NEAR(rbox(vec3(abs(p.x),p.y,abs(p.z)),vec3(.47,.455,.56),vec3(.035,.455,.035),.009),1.)
  NEAR(rbox(p,vec3(0.,2.53,0.),vec3(.25,.095,.22),.07),3.)
  NEAR(rbox(p,vec3(0.,2.445,0.),vec3(.205,.012,.175),.01),17.)
  NEAR(rbox(p,vec3(0.,2.77,0.),vec3(.016,.22,.016),.006),3.)
  NEAR(rbox(vec3(formSpace(p.xz).x,p.y,formSpace(p.xz).y),vec3(0.,.96,0.),vec3(.126,.006,.16),.004),16.)
  for (int i=0;i<2;i++) {
    bool protagonist = i == 0;
    vec3 v = actorSpace(p,protagonist);
    // Conservative bounding volume keeps empty rays inexpensive.
    float bound = rbox(v,vec3(0.,.83,-.17),vec3(.39,.84,.58),0.);
    if (bound < d) {
      if (bound > .075) d = bound;
      else {
        vec2 a = actor(v,protagonist);
        NEAR(a.x,a.y)
      }
    }
  }
  return vec2(d,id);
}
${lighting}

vec3 palette(vec3 p, float id, vec3 ink) {
  if (id == 0.) {
    vec3 wood = vec3(.78,.68,.55);
    return abs(fract(p.z/.7)-.5) > .485 ? wood*.86 : wood;
  }
  if (id == 1.) return vec3(.72,.54,.38);
  if (id == 2.) {
    // Door on the rear wall and the original low baseboard.
    if (p.x < -5.24 && rect(p.zy,vec2(.94,1.01),vec2(.44,1.03)) < 0.)
      return vec3(.36,.32,.30);
    return p.y < .16 ? vec3(.60,.60,.56) : vec3(.80,.84,.78);
  }
  if (id == 3. || id == 7.) return vec3(.22,.20,.20);
  if (id == 4.) return vec3(.96,.95,.91);
  if (id == 10.) return vec3(.45,.55,.66);
  if (id == 6. || id == 12.) return vec3(.30,.30,.37);
  if (id == 8.) return vec3(.42,.27,.17);
  if (id == 14.) return vec3(.30,.20,.14);
  if (id == 16.) {
    vec2 paper = formSpace(p.xz);
    vec3 stock = vec3(.92,.90,.82);
    vec3 printColor = vec3(.43,.41,.37);
    // A printed header, ruled fields and a single signature line.
    if (rect(paper,vec2(-.047,-.111),vec2(.060,.010)) < 0.) return printColor;
    for (int line=0;line<4;line++) {
      float z = -.061 + float(line)*.032;
      if (rect(paper,vec2(0.,z),vec2(.10,.0023)) < 0.) return stock*.69;
    }
    if (rect(paper,vec2(.041,.097),vec2(.058,.0035)) < 0.) return printColor;
    return stock;
  }
  if (id == 17.) return vec3(1.,.90,.62);
  bool protagonist = id < 10.;
  vec4 pose = protagonist ? PROTAGONIST : INTERROGATOR;
  vec3 h = headSpace(actorSpace(p,protagonist),pose);
  if ((id == 5. || id == 11.) && length(h) < .21) {
    if (eye(h,protagonist ? .4 : -.22)) return ink;
    vec3 mouth = normalize(h);
    if (mouth.z < 0. && length((mouth.xy-vec2(0.,-.40))/vec2(.20,.035+.080*pose.w)) < 1.)
      return ink;
  }
  return protagonist ? vec3(.90,.72,.58) : vec3(.82,.63,.50);
}
void main() {
  vec2 fc = gl_FragCoord.xy;
  ro = CAM;
  fw = normalize(TA-ro);
  rt = normalize(cross(fw,vec3(0.,1.,0.)));
  up = cross(rt,fw);
  vec3 rd = ray(fc);
  vec2 hit = trace(rd);
  vec3 p = ro + rd*hit.x;
  vec3 ink = vec3(.17,.11,.09);
  vec3 base = palette(p,hit.y,ink);
  vec3 n = nrm(p);
  float edge = 0.;
  for (int i=0;i<4;i++) {
    vec2 offset = i==0 ? vec2(1.3,0.) : i==1 ? vec2(-1.3,0.) : i==2 ? vec2(0.,1.3) : vec2(0.,-1.3);
    vec2 neighbor = trace(ray(fc+offset));
    if (abs(neighbor.y-hit.y)>.5 || abs(neighbor.x-hit.x)>.16) edge = 1.;
  }

  vec3 light = LAMP-p;
  float lit = smoothstep(-.01,.01,dot(n,normalize(light))-.1);
  float fall = 1.-smoothstep(.6,3.15,length(light));
  float pool = 1.-smoothstep(.52,2.35,length(p.xz-vec2(0.,.27)));
  float exposure = mix(.70,1.07,smoothstep(-1.20,.80,p.z));
  vec3 ambient = vec3(.34,.39,.47);
  vec3 warm = vec3(1.07,1.03,.94);
  vec3 color = base*mix(ambient,warm,lit*fall*pool)*exposure;
  color *= mix(.70,1.,shadow(p+n*.02,LAMP));
  if (base == ink || edge > .5) color = ink * mix(.60,1.,fall*pool);
  if (hit.y == 17.) color = base;
  vec2 grain = rot(.6)*fc;
  color *= .91+.09*vn(vec3(grain.x*.9,grain.y*.05,1.));
  color *= 1.-.1*pow(length((fc-.5*R)/R.x)*1.15,2.6);
  gl_FragColor = vec4(color,1.);
}
`;
