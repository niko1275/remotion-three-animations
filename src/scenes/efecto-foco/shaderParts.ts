export const forms = `mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float h1(float n){return fract(sin(n*91.3458)*47453.5453);}
float h3(vec3 p){p=fract(p*0.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vn(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float rbox(vec3 p,vec3 c,vec3 h,float r){vec3 d=abs(p-c)-h+r;return length(max(d,0.))+min(max(d.x,max(d.y,d.z)),0.)-r;}
float cap(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-r;}
float rect(vec2 p,vec2 c,vec2 h){vec2 d=abs(p-c)-h;return max(d.x,d.y);}
`;

export const hair = `float hairL(vec3 hp){return max(length(hp-vec3(0.,.03,.03))-.214,.02-dot(hp,normalize(vec3(0.,.55,.84))));}
`;

export const lighting = `float shadow(vec3 p,vec3 lp){vec3 l=lp-p;float dm=length(l);l/=dm;float res=1.,t=.04;NOL=1.;for(int i=0;i<40;i++){float hh=map(p+l*t).x;res=min(res,8.*hh/t);t+=clamp(hh*.8,.03,.2);if(res<.02||t>dm-.05)break;}NOL=0.;return clamp(res,0.,1.);}
vec3 nrm(vec3 p){vec2 e=vec2(.002,-.002);return normalize(e.xyy*map(p+e.xyy).x+e.yyx*map(p+e.yyx).x+e.yxy*map(p+e.yxy).x+e.xxx*map(p+e.xxx).x);}
vec3 ro,rt,up,fw;
vec3 ray(vec2 fc){vec2 uv=(fc-.5*R)/R.x;return normalize(uv.x*rt+uv.y*up+1.6*fw);}
vec2 trace(vec3 rd){float t=0.;for(int i=0;i<110;i++){vec2 m=map(ro+rd*t);if(m.x<.0012*t)return vec2(t,m.y);t+=m.x*.9;if(t>45.)break;}return vec2(45.,0.);}
bool eye(vec3 hp,float w){hp=normalize(hp);float th=.98-.014*max(w,0.),ax=abs(hp.x);if(hp.z<0.&&abs(ax-.34)<.14&&abs(hp.y-(.2+.05*max(w,0.)+w*(.34-ax)*1.3))<.028)return true;return dot(hp,normalize(vec3(.4,-.06,-1.)))>th||dot(hp,normalize(vec3(-.4,-.06,-1.)))>th;}
`;
