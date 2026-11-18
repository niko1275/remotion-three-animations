import {makeTrapShader} from '../la-trampa/shader';
import {signature} from './signature';

const signatureInk = signature.slice(0,-1).map(([x,z],i) => {
  const [endX,endZ] = signature[i+1];
  return `if (INK_PROGRESS > ${i}.0) {
    vec3 start = vec3(${x},.965,${z});
    vec3 end = mix(start,vec3(${endX},.965,${endZ}),min(1.,INK_PROGRESS-${i}.0));
    if (cap(vec3(p.x,.965,p.z),start,end,.0024) < 0.) return ink;
  }`;
}).join('\n    ');

export const resultsShader = makeTrapShader({
  declarations: `uniform float SHOW_PAPER, INK_PROGRESS;
uniform vec3 PEN;
uniform sampler2D DECLARATION;
`,
  map: `  if (SHOW_PAPER > .5) {
    NEAR(rbox(p,vec3(.477,.960,.65),vec3(.132,.005,.170),.004),32.)
    vec3 penBack = PEN+vec3(.095,.209,.193);
    vec3 wood = mix(PEN,penBack,.12);
    NEAR(cap(p,wood,penBack,.0068),33.)
    NEAR(cap(p,PEN+vec3(0.,.002,0.),wood,.004),34.)
  }
`,
  palette: `  if (id == 32.) {
    ${signatureInk}
    vec2 uv = vec2((p.x-.477)/.264+.5,.5-(p.z-.65)/.340);
    float print = texture(DECLARATION,uv).a;
    return mix(vec3(.92,.90,.82),vec3(.43,.41,.37),print*.75);
  }
  if (id == 33.) return vec3(.72,.49,.25);
  if (id == 34.) return vec3(.37,.28,.20);
`,
});
