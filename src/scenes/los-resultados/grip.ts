export const writingHand = {
  functions: `
vec3 pencilAcross() { return normalize(vec3(PEN_AXIS.z,0.,-PEN_AXIS.x)); }
vec3 pencilUp(vec3 across) { return cross(PEN_AXIS,across); }
float signingHand(vec3 p, vec3 wrist) {
  vec3 across = pencilAcross(), up = pencilUp(across);
  vec3 grip = PEN + PEN_AXIS*.088 - SEAT;
  vec3 palm = grip + across*.052 + PEN_AXIS*.018;
  float d = cap(p,wrist,palm,.024);

  vec3 thumbJoint = grip+across*.037-up*.014+PEN_AXIS*.013;
  vec3 thumbTip = grip+across*.016;
  d = min(d,min(cap(p,palm,thumbJoint,.012),cap(p,thumbJoint,thumbTip,.0105)));

  vec3 indexBase = palm+up*.010;
  vec3 indexJoint = grip+up*.021+PEN_AXIS*.018-across*.001;
  vec3 indexTip = grip+up*.011-across*.013+PEN_AXIS*.005;
  d = min(d,min(cap(p,indexBase,indexJoint,.0115),cap(p,indexJoint,indexTip,.011)));

  vec3 middleJoint = grip+across*.022-up*.022-PEN_AXIS*.013;
  vec3 middleTip = grip-up*.017-PEN_AXIS*.009;
  d = min(d,min(cap(p,palm-up*.014,middleJoint,.011),cap(p,middleJoint,middleTip,.0105)));

  // These two fingers remain curled beside the palm.
  d = min(d,cap(p,palm+across*.015,palm+across*.006-up*.024,.010));
  return min(d,cap(p,palm+across*.025+PEN_AXIS*.007,palm+across*.022-up*.016,.009));
}
`,
  sample: `    if (SHOW_PAPER > .5 && i == 1) {
      NEAR(signingHand(p,wrist),9.)
      continue;
    }
`,
};
