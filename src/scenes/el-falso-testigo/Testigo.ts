export const witnessPosition = [-1.28, 0, -.44] as const;
export const witnessYaw = 2.42;

// The new actor uses the lab's signed-distance shapes, materials and face shading.
export const witnessFigures = `
const vec3 WITNESS = vec3(${witnessPosition.join(',').replace(',0,',',0.,')});
vec3 witnessSpace(vec3 p) {
  p -= WITNESS;
  p.xz = rot(${witnessYaw})*p.xz;
  return p;
}
vec4 witnessPose() { return vec4(.035,WITNESS_HEAD.x,WITNESS_HEAD.y,WITNESS_MOUTH); }
vec2 witness(vec3 p) {
  float d = 100., id = 28.;
  vec3 lifted = p-vec3(0.,.24,0.);
  vec4 pose = witnessPose();
  vec3 body = torsoSpace(lifted,pose.x);
  vec3 head = headSpace(lifted,pose);
  float breath = .004*sin(T*2.3);
  NEAR(cap(body,vec3(0.,.71,.05),vec3(0.,1.02,-.13),.164+breath),28.)
  NEAR(cap(body,vec3(0.,1.13,-.16),vec3(0.,1.24,-.17),.054),29.)
  NEAR(length(head)-.188,29.)
  NEAR(hairL(head*1.061),30.)
  NEAR(length(head-vec3(-.073,-.101,.166))-.076,30.)
  vec3 q = vec3(abs(p.x),p.y,p.z);
  NEAR(cap(q,vec3(.10,.12,.012),vec3(.10,.94,.025),.075),31.)
  NEAR(cap(q,vec3(.10,.061,.022),vec3(.10,.061,-.105),.059),7.)
  for (int i=0;i<2;i++) {
    float side = i==0 ? -1. : 1.;
    vec3 shoulder = vec3(side*.177,1.02,-.13)-HIP;
    shoulder.yz = rot(pose.x)*shoulder.yz;
    shoulder += HIP+vec3(0.,.24,0.);
    vec3 elbow = vec3(side*.208,1.044,-.10);
    vec3 hand = vec3(side*.184,.87,-.147+side*.007*sin(T*1.5));
    NEAR(min(cap(p,shoulder,elbow,.050),cap(p,elbow,hand,.036)),28.)
    NEAR(length(p-hand)-.045,29.)
  }
  return vec2(d,id);
}
`;

export const witnessMap = `  vec3 witnessPoint = witnessSpace(p);
  float witnessBounds = rbox(witnessPoint,vec3(0.,.92,-.08),vec3(.30,.94,.37),0.);
  if (witnessBounds < d) {
    if (witnessBounds > .065) d = witnessBounds;
    else {
      vec2 figure = witness(witnessPoint);
      NEAR(figure.x,figure.y)
    }
  }
`;

export const witnessPalette = `  if (id == 28.) return vec3(.52,.56,.49);
  if (id == 30.) return vec3(.30,.22,.17);
  if (id == 31.) return vec3(.34,.32,.31);
  if (id == 29.) {
    vec3 head = headSpace(witnessSpace(p)-vec3(0.,.24,0.),witnessPose());
    if (length(head) < .197) {
      if (eye(head,-.05)) return ink;
      vec3 face = normalize(head);
      if (face.z < 0. && length((face.xy-vec2(0.,-.40))/vec2(.18,.027+.067*WITNESS_MOUTH)) < 1.) return ink;
    }
    return vec3(.85,.67,.53);
  }
`;
