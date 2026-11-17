"""Blender asset source. Run: blender -b --python scripts/build_graphic_protagonist.py"""
import bpy, math, os
from mathutils import Vector
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M={}
for name,c in {'skin':(.59,.40,.25,1),'skinLight':(.68,.49,.32,1),'skinShadow':(.53,.35,.22,1),'hair':(.038,.044,.039,1),'hairLight':(.07,.073,.057,1),'coat':(.052,.101,.084,1),'coatLight':(.087,.149,.115,1),'coatShadow':(.032,.061,.052,1),'shirt':(.07,.073,.062,1),'pants':(.045,.059,.053,1),'shoe':(.041,.047,.039,1),'sole':(.30,.28,.21,1),'eye':(.69,.64,.49,1),'ink':(.016,.019,.016,1),'iris':(.10,.091,.065,1),'metal':(.28,.29,.22,1)}.items():
 m=bpy.data.materials.new(name);m.diffuse_color=c;M[name]=m

def coord(p):return (p[0],-p[2],p[1])
def node(name,pos=(0,0,0),parent=None):
 o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);o.location=coord(pos);o.parent=parent;return o
root=node('GraphicProtagonist')
def mesh(name,verts,faces,mat,parent=root,smooth=False):
 g=bpy.data.meshes.new(name);g.from_pydata([coord(p) for p in verts],[],faces);g.update()
 o=bpy.data.objects.new(name,g);bpy.context.collection.objects.link(o);o.parent=parent;o.data.materials.append(M[mat])
 for p in g.polygons:p.use_smooth=smooth
 return o

def loft(name,rings,mat,parent=root,n=16):
 # Cross section (height, half-width, front depth, rear depth, x offset).
 verts=[]
 for ring in rings:
  y,w,front,back,*rest=ring;dx=rest[0] if rest else 0
  for i in range(n):
   a=i/n*math.tau;sn=math.sin(a);z=sn*(front if sn<0 else back)
   # Flatter facial/cloth planes than an elliptical primitive.
   verts.append((math.cos(a)*w+dx,y,z))
 faces=[]
 for j in range(len(rings)-1):
  for i in range(n):
   a=j*n+i;b=j*n+(i+1)%n;faces.append((a,a+n,b+n,b))
 faces.extend([tuple(range(n)),tuple((len(rings)-1)*n+i for i in reversed(range(n)))])
 return mesh(name,verts,faces,mat,parent,True)

def patch(name,points,mat,parent=root):
 # Flat authored polygon for seams, eyelids and cloth planes.
 return mesh(name,points,[tuple(range(len(points)))],mat,parent)

def wedge(name,points,depth,mat,parent=root):
 v=points+[(x,y,z+depth) for x,y,z in points];n=len(points)
 return mesh(name,v,[tuple(range(n)),tuple(reversed(range(n,n*2)))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)],mat,parent)

def ellipsoid(name,p,s,mat,parent=root,segments=16,rings=8):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=(0,0,0));o=bpy.context.object;o.name=name;o.parent=parent;o.location=coord(p);o.scale=(s[0],s[2],s[1]);o.data.materials.append(M[mat])
 for f in o.data.polygons:f.use_smooth=True
 return o

# Long trousers, taper at the knees, footwear with a readable cream sole.
for side,label in [(-1,'L'),(1,'R')]:
 hip=node('Hip_'+label,(side*.145,1.28,0),root)
 loft('Trousers_Upper_'+label,[(-.62,.10,.12,.11),(-.38,.125,.135,.13),(-.12,.14,.15,.14),(0,.14,.15,.14)],'pants',hip)
 knee=node('Knee_'+label,(0,-.61,0),hip)
 loft('Trousers_Lower_'+label,[(-.48,.075,.08,.08),(-.32,.083,.095,.10),(-.1,.105,.11,.11),(0,.10,.12,.11)],'pants',knee)
 patch('Knee_Fold_'+label,[(-.08,-.03,-.117),(.08,-.08,-.118),(.045,-.12,-.119),(-.04,-.08,-.122)],'shirt',knee)
 shoe=node('Shoe_'+label,(0,-.55,0),knee)
 o=loft('Sole_'+label,[(0,.10,.24,.10),(.055,.112,.25,.11),(.075,.106,.235,.105)],'sole',shoe)
 loft('Shoe_Upper_'+label,[(.07,.10,.23,.10),(.12,.105,.22,.10),(.19,.078,.11,.08),(.24,.07,.075,.075)],'shoe',shoe)
 for i in range(3):
  z=-.11-i*.025;patch('Lace_'+label+str(i),[(-.05,.16-i*.008,z),(.045,.16-i*.008,z),(.043,.164-i*.008,z+.008),(-.05,.164-i*.008,z+.008)],'metal',shoe)

body=node('Torso',(0,1.22,0),root)
loft('Shirt',[(-.01,.23,.13,.14),(.35,.225,.155,.13),(.69,.28,.14,.14),(.79,.155,.10,.10)],'shirt',body)
loft('Jacket',[(-.08,.255,.17,.16),(.0,.255,.175,.17),(.18,.23,.16,.155),(.42,.245,.185,.17),(.65,.29,.17,.16),(.76,.28,.13,.13),(.8,.175,.12,.115)],'coat',body)
# Open front, zipper and inset shirt, all geometry.
wedge('Open_Shirt',[(-.045,.76,-.158),(.055,.76,-.158),(.035,.05,-.182),(-.015,.04,-.182)],.008,'shirt',body)
for side,label in [(-1,'L'),(1,'R')]:
 wedge('Collar_'+label,[(side*.05,.76,-.168),(side*.09,.85,-.11),(side*.17,.79,-.09),(side*.125,.65,-.19)],.025,'coatLight',body)
 wedge('Jacket_Pocket_'+label,[(side*.08,.20,-.172),(side*.21,.29,-.162),(side*.225,.24,-.167),(side*.11,.15,-.177)],.014,'coatLight',body)
 wedge('Hem_Fold_'+label,[(side*.22,.0,-.13),(side*.21,.19,-.14),(side*.18,.05,-.18)],.005,'coatShadow',body)
 wedge('Chest_Fold_'+label,[(side*.25,.57,-.10),(side*.13,.48,-.174),(side*.22,.45,-.15)],.006,'coatLight',body)
 patch('Shoulder_Seam_'+label,[(side*.19,.75,-.10),(side*.29,.70,-.06),(side*.295,.68,-.062),(side*.19,.735,-.11)],'coatLight',body)
 for i in range(15):
  y=.06+i*.041;patch('Zipper_'+label+str(i),[(side*.022,y,-.189),(side*.033,y,-.19),(side*.033,y+.009,-.19),(side*.022,y+.009,-.19)],'metal',body)
 shoulder=node('Shoulder_'+label,(side*.275,.69,0),body)
 ellipsoid('Shoulder_Cap_'+label,(0,-.035,0),(.12,.105,.115),'coat',shoulder,16,8)
 loft('Sleeve_Upper_'+label,[(-.43,.085,.085,.085),(-.24,.105,.11,.105),(-.08,.12,.12,.11),(0,.105,.105,.10)],'coat',shoulder)
 elbow=node('Elbow_'+label,(0,-.42,0),shoulder)
 loft('Sleeve_Lower_'+label,[(-.37,.063,.07,.065),(-.29,.076,.084,.075),(-.13,.086,.09,.09),(0,.087,.085,.085)],'coat',elbow)
 loft('Cuff_'+label,[(-.40,.068,.075,.072),(-.35,.072,.078,.075)],'coatShadow',elbow)
 patch('Sleeve_Fold_'+label,[(-.074,-.06,-.087),(.06,-.13,-.087),(.025,-.15,-.095),(-.064,-.1,-.095)],'coatLight',elbow)
 hand=node('Hand_'+label,(0,-.45,0),elbow)
 loft('Palm_'+label,[(-.12,.045,.035,.035),(-.06,.062,.038,.039),(.03,.058,.04,.038),(.08,.044,.032,.033)],'skin',hand,n=12)
 ellipsoid('Thumb_'+label,(-side*.052,-.012,-.025),(.025,.061,.03),'skin',hand,12,6)
 for i in range(3):
  x=-.035+i*.025;patch('Finger_Line_'+label+str(i),[(x,-.075,-.036),(x+.004,-.075,-.037),(x+.004,-.11,-.032),(x,-.11,-.032)],'skinShadow',hand)

loft('Neck',[(.72,.082,.07,.07),(.99,.083,.075,.075)],'skin',body)
head=node('Head',(0,1.11,-.008),body)
# Cheekbones and a tapered chin, rather than a sphere.
loft('Face',[(-.22,.063,.108,.055),(-.18,.108,.14,.10),(-.09,.154,.157,.13),(.02,.174,.161,.145),(.13,.174,.15,.155),(.24,.145,.13,.14),(.29,.08,.08,.09)],'skin',head,n=24)
for side,label in [(-1,'L'),(1,'R')]:
 ellipsoid('Ear_'+label,(side*.174,-.005,.0),(.032,.064,.031),'skin',head,12,8)
 ellipsoid('Ear_Inset_'+label,(side*.19,-.004,-.02),(.012,.034,.012),'skinShadow',head,12,6)
 # Almond eyes: polygon eyelids and oval iris, explicitly following the facial plane.
 points=[(side*.029,.01,-.158),(side*.06,.035,-.158),(side*.108,.027,-.137),(side*.125,.006,-.123),(side*.092,-.009,-.145),(side*.05,-.009,-.16)]
 wedge('Eye_White_'+label,points,.003,'eye',head)
 ellipsoid('Iris_'+label,(side*.073,.01,-.159),(.017,.019,.009),'iris',head,16,8)
 ellipsoid('Pupil_'+label,(side*.073,.01,-.167),(.008,.013,.004),'ink',head,12,8)
 ellipsoid('Eye_Glint_'+label,(side*.068,.02,-.171),(.003,.005,.002),'eye',head,8,6)
 wedge('Lid_'+label,[(side*.027,.013,-.166),(side*.059,.041,-.164),(side*.11,.032,-.145),(side*.127,.007,-.13),(side*.106,.021,-.149),(side*.06,.03,-.169)],.003,'hair',head)
 brow=node('Brow_'+label,(side*.077,.075,-.15),head)
 wedge('Brow_Mesh_'+label,[(-.052,.0,-.012),(-.025,.017,-.018),(.032,.012,-.01),(.05,-.001,.0),(.025,-.008,-.012),(-.03,-.004,-.019)],.012,'hair',brow)
 patch('Cheek_Plane_'+label,[(side*.10,-.048,-.152),(side*.14,-.025,-.126),(side*.138,-.10,-.129),(side*.095,-.14,-.147)],'skinShadow',head)
# Nose bridge, tip, nostril planes and understated mouth.
mesh('Nose',[(-.025,.035,-.16),(.025,.035,-.16),(-.024,-.09,-.17),(.026,-.09,-.17),(0,-.065,-.206),(0,.005,-.177)],[(0,5,4,2),(5,1,3,4),(2,4,3)],'skinLight',head)
patch('Nose_Shadow',[(-.024,-.09,-.171),(0,-.065,-.206),(.026,-.09,-.171),(0,-.1,-.169)],'skinShadow',head)
ellipsoid('Surprise_Mouth',(0,-.145,-.161),(.026,.032,.008),'skinShadow',head,16,8)
mouth=node('Mouth',(0,-.145,-.158),head)
wedge('Mouth_Line',[(-.041,0,0),(.012,-.005,-.008),(.04,.002,.002),(.01,-.015,-.006),(-.034,-.009,0)],.002,'skinShadow',mouth)
# Authored directional hair locks. Each lock is a bent, tapered polyhedral mass.
cap=loft('Hair_Cap',[(.09,.182,.149,.16),(.22,.186,.153,.167),(.31,.152,.137,.14),(.35,.08,.075,.08)],'hair',head,n=20)
for i in range(20):
 a=i/20*math.tau;cap.data.vertices[i].co.z=.09-.24*max(0,math.sin(a))-.10*abs(math.cos(a))
cap.data.update()
def lock(name,a,b,c,width,mat):
 a=Vector(a);b=Vector(b);c=Vector(c);verts=[]
 for p,w in [(a,width*.78),(b,width),(c,.002)]:
  for dx,dy,dz in [(-w,0,0),(0,w*.42,-w*.5),(w,0,0),(0,-w*.35,w*.4)]:verts.append(tuple(p+Vector((dx,dy,dz))))
 return mesh(name,verts,[(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0),(4,8,9,5),(5,9,10,6),(6,10,11,7),(7,11,8,4)],mat,head)
locks=[((-.1,.29,-.08),(-.08,.23,-.17),(-.16,.08,-.17),.09),((-.03,.33,-.06),(.0,.24,-.18),(-.06,.06,-.19),.09),((.06,.33,-.04),(.09,.24,-.16),(.045,.13,-.18),.09),((.12,.29,0),(.17,.19,-.07),(.17,.035,-.05),.07),((-.15,.27,.05),(-.19,.16,.01),(-.18,.0,-.01),.065),((0,.25,.04),(-.05,.33,.015),(-.14,.32,-.025),.10),((.08,.29,.12),(.14,.23,.15),(.21,.16,.14),.075),((-.07,.24,.14),(-.14,.19,.15),(-.21,.1,.13),.07)]
for i,(a,b,c,w) in enumerate(locks):lock('Hair_Lock_%02d'%i,a,b,c,w,'hairLight' if i in [0,2,5] else 'hair')
# Store authored source and interoperable glTF scene hierarchy.
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'public/models/graphic-protagonist.blend'))
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'public/models/graphic-protagonist.glb'),export_format='GLB',export_yup=True,export_normals=True,export_materials='EXPORT',export_cameras=False,export_lights=False)
print('ASSET_COMPLETE',len(bpy.data.objects),'objects')
