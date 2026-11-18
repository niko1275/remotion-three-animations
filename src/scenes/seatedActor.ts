// The seated silhouette, face transforms and chair are shared by both shots of the student.
export const seatedDimensions = `const vec3 HEAD = vec3(0.,1.42,-.19);
const vec3 HIP = vec3(0.,.66,.05);
`;

export const seatedTransforms = `vec3 torsoSpace(vec3 p, float lean) {
  p -= HIP;
  p.yz = rot(-lean) * p.yz;
  return p + HIP;
}
vec3 headSpace(vec3 p, vec4 pose) {
  vec3 h = torsoSpace(p, pose.x) - HEAD;
  h.xz = rot(-pose.y) * h.xz;
  h.yz = rot(-pose.z) * h.yz;
  return h;
}
vec2 chair(vec3 p) {
  vec3 q = vec3(abs(p.x), p.y, abs(p.z-.05));
  float seat = rbox(p, vec3(0.,.5,.05), vec3(.24,.03,.24), .02);
  float back = rbox(p, vec3(0.,.86,.3), vec3(.24,.3,.025), .02);
  float leg = rbox(q, vec3(.2,.25,.2), vec3(.025,.25,.025), .005);
  return vec2(min(min(seat, back), leg), 1.);
}
`;

export const seatedBody = `  NEAR(cap(body,vec3(0.,.7,.05),vec3(0.,1.02,-.13),.18+breath),4.+offset)
  NEAR(cap(body,vec3(0.,1.15,-.16),vec3(0.,1.24,-.17),.055),5.+offset)
  NEAR(length(head)-.2,5.+offset)
  NEAR(hairL(head),8.+offset)
  NEAR(min(cap(q,vec3(.1,.63,.02),vec3(.1,.63,-.38),.085),
           cap(q,vec3(.1,.63,-.38),vec3(.1,.13,-.4),.07)),6.+offset)
  NEAR(cap(q,vec3(.1,.06,-.4),vec3(.1,.06,-.56),.065),7.)

`;
