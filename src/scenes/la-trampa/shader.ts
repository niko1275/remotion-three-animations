import {makeLabShader} from '../el-experimento/shader';

type TrapShaderParts = Pick<NonNullable<Parameters<typeof makeLabShader>[0]>, 'declarations' | 'figures' | 'map' | 'palette' | 'hand'> & {researcherYaw?: string};

export function makeTrapShader(parts: TrapShaderParts = {}) {
  return makeLabShader({
  declarations: `uniform float POINT, RESEARCHER_MOUTH, SURPRISE, SCREEN_LEVEL, RESEARCHER_PRESENT;
${parts.declarations ?? ''}`,
  figures: `
// Same seated head and shirt proportions as the investigator in La acusación.
// Only the pelvis is raised and the original trouser and shoe shapes stand upright.
const vec3 RESEARCHER = vec3(-1.05,.0,.55);
vec3 researcherSpace(vec3 p) {
  p -= RESEARCHER;
  return vec3(p.z,p.y,-p.x);
}
vec4 researcherPose() { return vec4(.04+.10*POINT,${parts.researcherYaw ?? '-.22'},-.06,RESEARCHER_MOUTH); }

vec2 investigator(vec3 p) {
  float d = 100., id = 10., offset = 6.;
  vec4 pose = researcherPose();
  vec3 lifted = p-vec3(0.,.30,0.);
  vec3 body = torsoSpace(lifted,pose.x);
  vec3 head = headSpace(lifted,pose);
  float breath = .006*sin(T*2.4+offset);
  NEAR(cap(body,vec3(0.,.7,.05),vec3(0.,1.02,-.13),.18+breath),10.)
  NEAR(cap(body,vec3(0.,1.15,-.16),vec3(0.,1.24,-.17),.055),11.)
  NEAR(length(head)-.2,11.)
  NEAR(hairL(head),14.)
  vec3 q = vec3(abs(p.x),p.y,p.z);
  NEAR(cap(q,vec3(.10,.11,.015),vec3(.10,1.00,.045),.087),12.)
  NEAR(cap(q,vec3(.10,.067,.025),vec3(.10,.067,-.10),.065),7.)

  for (int i=0;i<2;i++) {
    float side = i==0 ? -1. : 1.;
    float emphasis = i==0 ? POINT : 0.;
    vec3 shoulder = vec3(side*.218,1.02,-.13)-HIP;
    shoulder.yz = rot(pose.x)*shoulder.yz;
    shoulder += HIP+vec3(0.,.30,0.);
    vec3 elbow = mix(vec3(side*.255,1.10,-.095),vec3(-.23,1.31,-.230),emphasis);
    vec3 palm = mix(vec3(side*.23,.92,-.13),vec3(-.16,1.30,-.45),emphasis);
    NEAR(min(cap(p,shoulder,elbow,.059),cap(p,elbow,palm,.045)),10.)
    NEAR(length(p-palm)-.047,15.)
    vec3 tip = palm+vec3(-.023,-.026,-.104)*emphasis+vec3(0.,-.017,-.027);
    NEAR(cap(p,palm+vec3(0.,-.014,-.022),tip,.016),15.)
  }
  return vec2(d,id);
}
${parts.figures ?? ''}`,
  map: `  vec3 person = researcherSpace(p);
  float personBounds = rbox(person,vec3(0.,.93,-.163),vec3(.42,.94,.52),0.);
  if (RESEARCHER_PRESENT > .5 && personBounds < d) {
    if (personBounds > .065) d = personBounds;
    else {
      vec2 figure = investigator(person);
      NEAR(figure.x,figure.y)
    }
  }
${parts.map ?? ''}`,
  palette: `  if (id == 10.) return vec3(.45,.55,.66);
  if (id == 12.) return vec3(.30,.30,.37);
  if (id == 14.) return vec3(.30,.20,.14);
  if (id == 15.) return vec3(.82,.63,.50);
  if (id == 11.) {
    vec3 head = headSpace(researcherSpace(p)-vec3(0.,.30,0.),researcherPose());
    if (length(head) < .21) {
      if (eye(head,-.22)) return ink;
      vec3 face = normalize(head);
      if (face.z < 0. && length((face.xy-vec2(0.,-.40))/vec2(.20,.035+.080*RESEARCHER_MOUTH)) < 1.) return ink;
    }
    return vec3(.82,.63,.50);
  }
${parts.palette ?? ''}`,
  hand: parts.hand,
  studentEyes: 'eye(h,0.) || (SURPRISE > .001 && dot(normalize(h), normalize(vec3(sign(h.x)*.4,-.06,-1.))) > .98-.007*SURPRISE)',
  studentMouth: '.035+.035*SURPRISE+.080*STUDENT.w',
  screen: '    color *= SCREEN_LEVEL;\n',
});
}

export const trapShader = makeTrapShader();
