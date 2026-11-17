export const fragmentShader = `
precision highp float;
uniform vec2 R;uniform float F,T,SP,LT,WK;uniform vec3 CAM,TA,PP;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float h1(float n){return fract(sin(n*91.3458)*47453.5453);}
float h3(vec3 p){p=fract(p*0.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vn(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float rbox(vec3 p,vec3 c,vec3 h,float r){vec3 d=abs(p-c)-h+r;return length(max(d,0.))+min(max(d.x,max(d.y,d.z)),0.)-r;}
float cap(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-r;}
float rect(vec2 p,vec2 c,vec2 h){vec2 d=abs(p-c)-h;return max(d.x,d.y);}
const vec2 G0=vec2(-.1,.1);const float SX=.95,SZ=1.05;
const vec2 FD=vec2(.674,.739);
const vec3 HV=vec3(0.,1.42,-.19),HP=vec3(0.,1.74,0.);
float NOL=0.,br;vec3 PH;
vec2 cellOf(vec3 p){return vec2(clamp(floor((p.x-G0.x)/SX+.5),0.,3.),clamp(floor((p.z-G0.y)/SZ+.5),0.,2.));}
vec3 cellC(vec2 c){return vec3(G0.x+c.x*SX,0.,G0.y+c.y*SZ+.15);}
vec2 faceDir(vec2 c){vec3 hc=cellC(c)+HV;float a=smoothstep(0.,.3,LT-.4*h1(c.x*7.+c.y*13.+1.));return normalize(mix(vec2(0.,-1.),normalize(PH.xz-hc.xz),a));}
vec3 toFace(vec3 hp,vec2 f){vec2 b=-f;return vec3(hp.x*b.y-hp.z*b.x,hp.y,hp.x*b.x+hp.z*b.y);}
float hairL(vec3 hp){return max(length(hp-vec3(0.,.03,.03))-.214,.02-dot(hp,normalize(vec3(0.,.55,.84))));}
vec3 pl(vec3 p){return toFace(p-PP,FD);}
#define U(dd,ii) {float e_=dd;if(e_<d){d=e_;id=ii;}}
vec2 map(vec3 p){float d=p.y,id=0.;
U(min(min(p.x+2.6,3.4-p.x),min(p.z+2.8,5.4-p.z)),2.)
U(3.6-p.y,2.)
float db=rbox(p,vec3(G0.x+1.5*SX,.85,G0.y+SZ+.15),vec3(1.5*SX+.5,.85,SZ+.56),0.);
if(db<d){if(db>.25&&NOL<.5){d=db;}else{
vec2 c=cellOf(p);vec3 v=p-cellC(c);float gx=.5*SX-abs(v.x),gz=.5*SZ-abs(v.z+.15);vec3 q=vec3(abs(v.x),v.y,v.z);
U(min(min(rbox(v,vec3(0.,.5,.05),vec3(.24,.03,.24),.02),rbox(v,vec3(0.,.86,.3),vec3(.24,.3,.025),.02)),rbox(vec3(q.x,q.y,abs(q.z-.05)),vec3(.2,.25,.2),vec3(.025,.25,.025),.005)),1.)
U(min(cap(v,vec3(0.,.7,.05),vec3(0.,1.02,-.13),.18+br),min(cap(q,vec3(.23,1.02,-.13),vec3(.28,.8,-.16),.06),cap(q,vec3(.28,.8,-.16),vec3(.16,.74,-.38),.055))),4.)
U(min(cap(q,vec3(.1,.63,.02),vec3(.1,.63,-.38),.085),cap(q,vec3(.1,.63,-.38),vec3(.1,.13,-.4),.07)),6.)
U(cap(q,vec3(.1,.06,-.4),vec3(.1,.06,-.56),.065),7.)
U(min(min(length(q-vec3(.15,.74,-.41))-.062,cap(v,vec3(0.,1.15,-.16),vec3(0.,1.24,-.17),.055)),length(v-HV)-.2),5.)
U(hairL(toFace(v-HV,faceDir(c))),8.)
if(NOL<.5){float g=min(gx<0.?9.:gx,gz<0.?9.:gz)+.06;if(g<d)d=g;}}}
if(length(p-PP-vec3(0.,.95,0.))-1.25<d){vec3 x=pl(p);float s=x.x<0.?-1.:1.,sw=s*WK*sin(T*11.)*.15;vec3 q=vec3(abs(x.x),x.y,x.z);
U(cap(q,vec3(.11,.06,sw+.02),vec3(.11,.06,sw-.14),.065),7.)
U(min(cap(q,vec3(.11,.12,sw),vec3(.11,.5,sw*.5),.07),cap(q,vec3(.11,.5,sw*.5),vec3(.1,.85,0.),.085)),10.)
U(min(cap(x,vec3(0.,.62,0.),vec3(0.,1.3,0.),.2+br),min(cap(q,vec3(.27,1.3,0.),vec3(.32,1.03,.02),.062),cap(q,vec3(.32,1.03,.02),vec3(.3,.8,-.05),.058))),9.)
U(min(min(length(q-vec3(.3,.76,-.06))-.065,cap(x,vec3(0.,1.47,0.),vec3(0.,1.56,0.),.055)),length(x-HP)-.2),11.)
U(hairL(x-HP),12.)}
return vec2(d,id);}
float shadow(vec3 p,vec3 lp){vec3 l=lp-p;float dm=length(l);l/=dm;float res=1.,t=.04;NOL=1.;for(int i=0;i<40;i++){float hh=map(p+l*t).x;res=min(res,8.*hh/t);t+=clamp(hh*.8,.03,.2);if(res<.02||t>dm-.05)break;}NOL=0.;return clamp(res,0.,1.);}
vec3 nrm(vec3 p){vec2 e=vec2(.002,-.002);return normalize(e.xyy*map(p+e.xyy).x+e.yyx*map(p+e.yyx).x+e.yxy*map(p+e.yxy).x+e.xxx*map(p+e.xxx).x);}
vec3 ro,rt,up,fw;
vec3 ray(vec2 fc){vec2 uv=(fc-.5*R)/R.x;return normalize(uv.x*rt+uv.y*up+1.6*fw);}
vec2 trace(vec3 rd){float t=0.;for(int i=0;i<110;i++){vec2 m=map(ro+rd*t);if(m.x<.0012*t)return vec2(t,m.y);t+=m.x*.9;if(t>45.)break;}return vec2(45.,0.);}
bool eye(vec3 hp,float w){hp=normalize(hp);float th=.98-.014*max(w,0.),ax=abs(hp.x);if(hp.z<0.&&abs(ax-.34)<.14&&abs(hp.y-(.2+.05*max(w,0.)+w*(.34-ax)*1.3))<.028)return true;return dot(hp,normalize(vec3(.4,-.06,-1.)))>th||dot(hp,normalize(vec3(-.4,-.06,-1.)))>th;}
void main(){br=.006*sin(T*2.4);PH=PP+HP;
ro=CAM;fw=normalize(TA-ro);rt=normalize(cross(fw,vec3(0,1,0)));up=cross(rt,fw);
vec2 fc=gl_FragCoord.xy;vec3 rd=ray(fc);vec2 h=trace(rd);float lw=1.3,edge=0.;
for(int i=0;i<4;i++){vec2 o=i==0?vec2(lw,0.):i==1?vec2(-lw,0.):i==2?vec2(0.,lw):vec2(0.,-lw);vec2 g=trace(ray(fc+o));
if(abs(g.y-h.y)>.5||((g.y>.5||h.y>.5)&&abs(g.x-h.x)>.16))edge=1.;}
vec3 ink=vec3(.17,.11,.09),p=ro+rd*h.x,n=nrm(p),base;float id=h.y;
vec2 c=cellOf(p);float ch=h1(c.x*3.+c.y*17.+2.),ch2=h1(c.x*11.+c.y*5.+7.);
if(id<.5){base=vec3(.78,.68,.55);if(abs(fract(p.z/.7)-.5)>.485)base*=.86;}
else if(id<1.5)base=vec3(.72,.54,.38);
else if(id<2.5){base=vec3(.8,.84,.78);
if(p.y>3.55)base=vec3(.84,.85,.8);
if(p.y<.16)base=vec3(.6,.6,.56);if(abs(p.y-.16)<.012)base=ink;
if(p.x<-2.57&&p.z<-2.77)base=ink;
if(p.x<-2.59){float dr=rect(p.zy,vec2(-1.5,.99),vec2(.44,1.03));if(dr<0.){base=vec3(.36,.32,.3);if(p.y<.03)base=ink;}
if(dr>0.&&dr<.07)base=vec3(.93,.91,.85);if(abs(dr)<.012||abs(dr-.07)<.01)base=ink;
float sw=rect(p.zy,vec2(-.82,1.25),vec2(.05,.08));if(sw<0.)base=vec3(.95,.94,.9);if(abs(sw)<.01)base=ink;}
if(p.z<-2.79){float wb=rect(p.xy,vec2(.75,1.5),vec2(1.3,.62));if(wb<0.){base=vec3(.96,.95,.9);
float ly=floor((p.y-1.)/.17),lf=fract((p.y-1.)/.17);if(wb<-.14&&abs(lf-.5)<.06&&p.x<-.2+2.*h1(ly+3.)&&ly>0.5)base=vec3(.5,.52,.58);}
if(abs(wb)<.016)base=ink;if(rect(p.xy,vec2(.75,.85),vec2(1.,.018))<0.)base=vec3(.5,.5,.54);
float ck=length(p.xy-vec2(-1.35,2.45));if(ck<.24)base=vec3(.96,.95,.9);if(abs(ck-.24)<.014)base=ink;
if(rect(p.xy,vec2(-1.35,2.54),vec2(.009,.09))<0.||rect(p.xy,vec2(-1.28,2.45),vec2(.07,.009))<0.)base=ink;}}
else if(id<4.5)base=ch<.2?vec3(.47,.52,.44):ch<.4?vec3(.45,.55,.66):ch<.6?vec3(.68,.47,.4):ch<.8?vec3(.72,.62,.4):vec3(.56,.52,.6);
else if(id<5.5){base=ch2<.3?vec3(.82,.63,.5):vec3(.9,.72,.58);if(eye(toFace(p-cellC(c)-HV,faceDir(c)),0.))base=ink;}
else if(id<6.5)base=ch2<.5?vec3(.5,.42,.36):vec3(.36,.38,.44);
else if(id<7.5)base=vec3(.2,.18,.18);
else if(id<8.5)base=ch2<.25?vec3(.3,.2,.14):ch2<.5?vec3(.22,.2,.2):ch2<.7?vec3(.76,.6,.36):ch2<.85?vec3(.5,.27,.17):vec3(.6,.58,.55);
else if(id<9.5){base=vec3(.96,.95,.91);vec3 x=pl(p);
if(x.z<0.){vec2 s=x.xy-vec2(.03,1.02);float a=atan(s.y,s.x),rr=length(s/vec2(.105,.13))+.16*sin(a*3.+1.)+.09*sin(a*7.+2.);
if(rr<1.)base=vec3(.56,.36,.2);if(rr<.74)base=vec3(.44,.26,.13);
if(rect(x.xy,vec2(.045,.86),vec2(.011,.06))<0.||length(x.xy-vec2(.045,.79))<.02||length(x.xy-vec2(-.07,.84))<.015||length(x.xy-vec2(.15,1.16))<.013)base=vec3(.5,.3,.16);
if(x.y>1.28&&abs(abs(x.x)-(x.y-1.28)*.9)<.008)base=ink;}}
else if(id<10.5)base=vec3(.3,.3,.37);
else if(id<11.5){base=vec3(.9,.72,.58);if(eye(pl(p)-HP,.6*SP))base=ink;}
else base=vec3(.42,.27,.17);
vec3 S=vec3(PP.x+FD.x*.9,2.9,PP.z+FD.y*.9),Lp=mix(vec3(.6,2.9,.8),S,SP);
float lit=smoothstep(-.01,.01,dot(n,normalize(Lp-p))-.1),fall=smoothstep(8.,1.6,length(p-Lp));
vec3 col=base*mix(vec3(.74,.73,.84),vec3(1.07,1.03,.94),lit)*mix(.84,1.,fall);
if(id<2.5)col=mix(vec3(dot(col,vec3(.3,.59,.11))),col,.7);
if(base==ink)col=ink;
col*=mix(.7,1.,shadow(p+n*.02,Lp));
float cr=.14+(2.9-p.y)*.24,inC=step(0.,cr)*smoothstep(cr+.03,cr-.03,length(p.xz-PP.xz));
col*=mix(1.,mix(.58,1.12,inC),SP);col=mix(col,col*vec3(.86,.9,1.08),SP*(1.-inC)*.7);
if(edge>.5)col=ink;
float acc=0.,jt=h3(vec3(fc,1.));for(int i=0;i<16;i++){vec3 q=ro+rd*h.x*(float(i)+jt)/16.;float r=.14+(2.9-q.y)*.24;acc+=step(0.,r)*smoothstep(r+.05,r-.05,length(q.xz-PP.xz));}
col+=vec3(1.,.9,.62)*min(acc/16.*h.x*.075,.17)*SP;
vec2 uv=(fc-.5*R)/R.x;vec2 s2=rot(.6)*fc;col*=.91+.09*vn(vec3(s2.x*.9,s2.y*.05,1.));
col*=1.-.1*pow(length(uv)*1.15,2.6);
gl_FragColor=vec4(mix(col,vec3(.11,.09,.08),F),1.);}
`;
