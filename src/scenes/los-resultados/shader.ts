import {makeTrapShader} from '../la-trampa/shader';
import {writingHand} from './grip';
import {signature} from './signature';

const trace = signature.map(([x,z]) => `vec2(${x},${z})`).join(',');

export const resultsShader = makeTrapShader({
  declarations: `uniform float SHOW_PAPER, INK_PROGRESS;
uniform vec3 PEN, PEN_AXIS;
uniform sampler2D DECLARATION;
const vec2 SIGNATURE[${signature.length}] = vec2[](${trace});
`,
  map: `  if (SHOW_PAPER > .5) {
    NEAR(rbox(p,vec3(.477,.960,.65),vec3(.132,.005,.170),.004),32.)
    vec3 q = p-PEN;
    vec3 across = pencilAcross(), up = pencilUp(across);
    vec2 section = abs(vec2(dot(q,across),dot(q,up)));
    float along = dot(q,PEN_AXIS);
    float hexagon = max(section.x,.5*section.x+.8660254*section.y);
    NEAR(max(hexagon-.0052,max(.023-along,along-.240)),33.)
    float cone = hexagon-(.0052*clamp(along/.023,0.,1.));
    NEAR(max(cone,max(.006-along,along-.023)),35.)
    NEAR(max(cone,max(-along,along-.006)),34.)
  }
`,
  hand: writingHand,
  palette: `  if (id == 32.) {
    for (int i=0;i<${signature.length-1};i++) {
      if (float(i)>=INK_PROGRESS) break;
      vec2 start = SIGNATURE[i];
      vec2 end = mix(start,SIGNATURE[i+1],min(1.,INK_PROGRESS-float(i)));
      if (cap(vec3(p.xz,0.),vec3(start,0.),vec3(end,0.),.0024) < 0.) return ink;
    }
    vec2 uv = vec2((p.x-.477)/.264+.5,.5-(p.z-.65)/.340);
    float print = texture(DECLARATION,uv).a;
    return mix(vec3(.92,.90,.82),vec3(.43,.41,.37),print*.75);
  }
  if (id == 33.) return vec3(.72,.49,.25);
  if (id == 35.) return vec3(.71,.56,.39);
  if (id == 34.) return vec3(.37,.28,.20);
`,
});
