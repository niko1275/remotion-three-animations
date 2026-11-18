import {forms, hair, lighting} from '../efecto-foco/shaderParts';
import {seatedBody, seatedDimensions, seatedTransforms} from '../seatedActor';
import {alt, keyboardDepth, keyboardWidth, keys, keyboardZ, keyPitch} from './keyboard';
import {studentZ} from './timeline';

const rowLookup = Array.from({length: 5}, (_, row) => {
  const group = keys.filter(key => Math.floor(key.id / 16) === row);
  return `if (row == ${row}) {
    ${group.map(({x,width,id}, i) => {
      const value = `vec3(${x.toFixed(6)},${width.toFixed(6)},${id}.0)`;
      return i === group.length - 1 ? `return ${value};` : `if (x < ${(x + width / 2).toFixed(6)}) return ${value};`;
    }).join('\n    ')}
  }`;
}).join('\n  ');

export const experimentShader = `
precision highp float;
uniform vec2 R, PRESS;
uniform float T, RULE;
uniform vec3 CAM, TA, LEFT_HAND, RIGHT_HAND;
uniform vec2 REACH;
uniform vec4 STUDENT;
uniform sampler2D LEGENDS, DISPLAY;
float NOL = 0.;
${forms}
${hair}
${seatedDimensions}
${seatedTransforms}
#define NEAR(distance, material) {float next = distance; if (next < d) {d = next; id = material;}}
const vec3 SEAT = vec3(0.,0.,${studentZ});
const vec3 LAMP = vec3(0.,2.28,.39);
const float KEY_Z = ${keyboardZ};
const float KEY_STEP = ${keyPitch};
const float ALT_ID = ${alt.id}.0;

vec3 keyboardKey(int row, float x) {
  ${rowLookup}
  return vec3(0.);
}

float fingers(vec3 p, vec3 wrist, float side, float reach) {
  // The index finger extends to a key. Its neighbors stay curled above the deck.
  vec3 palm = wrist + vec3(0.,0.,-.027);
  float d = rbox(p, palm, vec3(.040,.028,.052), .023);
  for (int i=0;i<4;i++) {
    float x = side * (-.026 + float(i)*.017);
    bool indexFinger = i == 0;
    vec3 knuckle = palm + vec3(x,-.004,-.037);
    vec3 joint = knuckle + vec3(0.,.004,indexFinger ? -.024-.012*reach : -.023);
    vec3 tip = joint + vec3(0.,indexFinger ? -.005-.023*reach : -.018,indexFinger ? -.028-.007*reach : -.014);
    d = min(d,min(cap(p,knuckle,joint,.0105),cap(p,joint,tip,.010)));
  }
  return min(d,cap(p,palm+vec3(-side*.025,-.003,.007),palm+vec3(-side*.048,-.016,-.033),.013));
}

vec2 student(vec3 p) {
  vec4 pose = STUDENT;
  float offset = 0.;
  vec2 seat = chair(p);
  float d = seat.x, id = seat.y;
  vec3 body = torsoSpace(p,pose.x);
  vec3 q = vec3(abs(p.x),p.y,p.z);
  vec3 head = headSpace(p,pose);
  float breath = .006*sin(T*2.4);
${seatedBody}
  for (int i=0;i<2;i++) {
    float side = i == 0 ? -1. : 1.;
    float reach = i == 0 ? REACH.x : REACH.y;
    vec3 wrist = i == 0 ? LEFT_HAND : RIGHT_HAND;
    vec3 shoulder = vec3(side*.218,1.02,-.13)-HIP;
    shoulder.yz = rot(pose.x)*shoulder.yz;
    shoulder += HIP;
    // Keep the elbow outside the torso, then narrow the sleeve into the wrist.
    vec3 elbow = vec3(side*.294,.995,-.240) + vec3(wrist.x*.12,reach*.008,-reach*.016);
    vec3 forearm = mix(elbow,wrist,.52);
    vec3 cuff = mix(elbow,wrist,.90);
    NEAR(cap(p,shoulder,elbow,.059),4.)
    NEAR(min(cap(p,elbow,forearm,.047),cap(p,forearm,cuff,.038)),4.)
    NEAR(cap(p,cuff,wrist,.027),9.)
    float bounds = rbox(p,wrist+vec3(0.,-.005,-.065),vec3(.075,.055,.112),0.);
    if (bounds < d) {
      if (bounds > .025) d = bounds;
      else { NEAR(fingers(p,wrist,side,reach),9.) }
    }
  }
  return vec2(d,id);
}

vec2 map(vec3 p) {
  float d = p.y, id = 0.;
  NEAR(min(min(4.2-abs(p.x),3.25-abs(p.z)),2.95-p.y),2.)
  NEAR(rbox(p,vec3(0.,.91,.35),vec3(.68,.045,.57),.024),1.)
  NEAR(rbox(vec3(abs(p.x),p.y,abs(p.z-.35)),vec3(.60,.455,.49),vec3(.035,.455,.035),.009),1.)
  NEAR(rbox(p,vec3(0.,2.53,.39),vec3(.25,.095,.22),.07),3.)
  NEAR(rbox(p,vec3(0.,2.445,.39),vec3(.205,.012,.175),.01),17.)
  NEAR(rbox(p,vec3(0.,2.77,.39),vec3(.016,.22,.016),.006),3.)

  // CRT housing, pedestal, system unit and recessed curved glass.
  NEAR(rbox(p,vec3(0.,1.232,.055),vec3(.30,.231,.235),.055),20.)
  NEAR(rbox(p,vec3(0.,1.013,.059),vec3(.168,.056,.136),.019),20.)
  NEAR(rbox(p,vec3(.389,1.018,.018),vec3(.088,.063,.199),.012),20.)
  NEAR(rbox(p,vec3(0.,1.239,.283),vec3(.264,.192,.016),.024),21.)
  NEAR(rbox(p,vec3(0.,1.249,.300),vec3(.226,.152,.012),.029),22.)

  NEAR(rbox(p,vec3(0.,.968,KEY_Z),vec3(${keyboardWidth / 2},.014,${keyboardDepth / 2}),.013),20.)
  float keyBounds = rbox(p,vec3(0.,.991,KEY_Z),vec3(.316,.014,.108),0.);
  if (keyBounds < d) {
    if (keyBounds > .014) d = keyBounds;
    else {
      int row = int(clamp(floor((p.z-KEY_Z)/KEY_STEP+2.5),0.,4.));
      vec3 key = keyboardKey(row,p.x);
      float z = KEY_Z + (float(row)-2.)*KEY_STEP;
      float travel = key.z == PRESS.x ? PRESS.y : 0.;
      NEAR(rbox(p,vec3(key.x,.989-travel,z),vec3(key.y*.5-.0025,.011,.017),.0025),40.+key.z)
    }
  }

  vec3 v = p-SEAT;
  float bound = rbox(v,vec3(0.,.83,-.35),vec3(.43,.84,.86),0.);
  if (bound < d) {
    if (bound > .065) d = bound;
    else {
      vec2 actor = student(v);
      NEAR(actor.x,actor.y)
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
  if (id == 2.) return p.y < .16 ? vec3(.60,.60,.56) : vec3(.80,.84,.78);
  if (id == 3. || id == 7.) return vec3(.22,.20,.20);
  if (id == 4.) return vec3(.96,.95,.91);
  if (id == 6.) return vec3(.30,.30,.37);
  if (id == 8.) return vec3(.42,.27,.17);
  if (id == 17.) return vec3(1.,.90,.62);
  if (id == 20.) return vec3(.73,.70,.61);
  if (id == 21.) return vec3(.37,.35,.31);
  if (id == 22.) return vec3(.12,.20,.17);
  if (id >= 40.) {
    vec2 uv = vec2(p.x/${keyboardWidth}+.5, .5-(p.z-KEY_Z)/${keyboardDepth});
    float legend = p.y >= .986-PRESS.y ? texture(LEGENDS,uv).a : 0.;
    float emphasis = id == 40.+ALT_ID ? RULE : 0.;
    vec3 capColor = mix(vec3(.83,.79,.68),vec3(.98,.87,.65),emphasis*.57);
    return mix(capColor,ink,legend*.89);
  }
  vec3 h = headSpace(p-SEAT,STUDENT);
  if (id == 5. && length(h) < .21) {
    if (eye(h,0.)) return ink;
    vec3 mouth = normalize(h);
    if (mouth.z < 0. && length((mouth.xy-vec2(0.,-.40))/vec2(.20,.035)) < 1.) return ink;
  }
  return vec3(.90,.72,.58);
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  ro = CAM;
  fw = normalize(TA-ro);
  rt = normalize(cross(fw,vec3(0.,1.,0.)));
  up = cross(rt,fw);
  vec3 rd = ray(fc);
  vec2 hit = trace(rd);
  vec3 p = ro+rd*hit.x;
  vec3 ink = vec3(.17,.11,.09);
  vec3 base = palette(p,hit.y,ink);
  vec3 n = nrm(p);
  float edge = 0.;
  float stroke = max(.8,1.3*R.x/540.);
  for (int i=0;i<4;i++) {
    vec2 o = i==0 ? vec2(stroke,0.) : i==1 ? vec2(-stroke,0.) : i==2 ? vec2(0.,stroke) : vec2(0.,-stroke);
    vec2 neighbor = trace(ray(fc+o));
    if (abs(neighbor.y-hit.y)>.5 || abs(neighbor.x-hit.x)>.16) edge = 1.;
  }
  vec3 light = LAMP-p;
  float lit = smoothstep(-.01,.01,dot(n,normalize(light))-.1);
  float fall = 1.-smoothstep(.6,3.15,length(light));
  float pool = 1.-smoothstep(.52,2.35,length(p.xz-vec2(0.,.50)));
  vec3 color = base*mix(vec3(.34,.39,.47),vec3(1.07,1.03,.94),lit*fall*pool);
  color *= mix(.70,1.,shadow(p+n*.02,LAMP));

  if (hit.y == 22. && p.z > .304) {
    vec2 uv = vec2(p.x/.448+.5,(p.y-1.249)/.302+.5);
    float text = texture(DISPLAY,uv).a;
    color = mix(vec3(.095,.164,.137),vec3(.72,.83,.63),text);
    color *= .945+.055*sin(uv.y*480.);
  }
  if (base == ink || edge > .5) color = ink*mix(.60,1.,fall*pool);
  if (hit.y == 17.) color = base;
  vec2 grain = rot(.6)*fc*(540./R.x);
  color *= .91+.09*vn(vec3(grain.x*.9,grain.y*.05,1.));
  color *= 1.-.1*pow(length((fc-.5*R)/R.x)*1.15,2.6);
  gl_FragColor = vec4(color,1.);
}
`;
