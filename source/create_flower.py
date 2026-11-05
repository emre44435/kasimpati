"""Restored original chrysanthemum scene from the project generation source.
Blender 4.3.2: blender -b -t 8 --python source/create_flower.py -- setup
"""
import bpy, math, random, os, sys
from mathutils import Vector
from math import sin,cos,pi
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for d in ['renders','qa']:os.makedirs(os.path.join(ROOT,d),exist_ok=True)
random.seed(44)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.device='CPU';s.cycles.samples=14;s.cycles.use_denoising=False
s.cycles.max_bounces=5;s.cycles.diffuse_bounces=3;s.cycles.transmission_bounces=2
s.render.resolution_x=768;s.render.resolution_y=1024;s.render.resolution_percentage=100
s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';s.render.film_transparent=True
s.render.fps=12;s.frame_start=1;s.frame_end=193;s.frame_step=2
s.view_settings.view_transform='AgX';s.view_settings.look='AgX - Medium High Contrast'
s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.12,.16,.12,1);s.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.23
head=bpy.data.objects.new('Chrysanthemum',None);bpy.context.collection.objects.link(head);head.location=(0,0,.5);head.rotation_euler=(math.radians(43),0,0)
def petal_material(name,variant):
 m=bpy.data.materials.new(name);m.use_nodes=True;n=m.node_tree.nodes;l=m.node_tree.links;n.clear()
 out=n.new('ShaderNodeOutputMaterial');bs=n.new('ShaderNodeBsdfPrincipled')
 for key,val in [('Roughness',.57),('IOR',1.38),('Specular IOR Level',.24),('Subsurface Weight',.16),('Subsurface Scale',.07)]:bs.inputs[key].default_value=val
 bs.inputs['Subsurface Radius'].default_value=(1,.6,.3)
 tex=n.new('ShaderNodeTexCoord');sep=n.new('ShaderNodeSeparateXYZ');l.new(tex.outputs['UV'],sep.inputs[0])
 ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.02;ramp.color_ramp.elements[0].color=(.32,.37,.12,1)
 ramp.color_ramp.elements[1].position=.68;ramp.color_ramp.elements[1].color=(.84+variant*.04,.78+variant*.03,.65+variant*.03,1)
 e=ramp.color_ramp.elements.new(.3);e.color=(.73,.71,.48,1)
 e=ramp.color_ramp.elements.new(.96);e.color=(.91,.82+variant*.035,.73+variant*.025,1)
 l.new(sep.outputs['Y'],ramp.inputs[0]);l.new(ramp.outputs['Color'],bs.inputs['Base Color'])
 noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=135;noise.inputs['Detail'].default_value=2;l.new(tex.outputs['Generated'],noise.inputs['Vector'])
 wave=n.new('ShaderNodeTexWave');wave.wave_type='BANDS';wave.bands_direction='X';wave.inputs['Scale'].default_value=22;wave.inputs['Distortion'].default_value=3;wave.inputs['Detail Scale'].default_value=.9;l.new(tex.outputs['UV'],wave.inputs['Vector'])
 mix=n.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=.6;l.new(wave.outputs['Color'],mix.inputs[1]);l.new(noise.outputs['Fac'],mix.inputs[2])
 bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.12;bump.inputs['Distance'].default_value=.005;l.new(mix.outputs[0],bump.inputs['Height']);l.new(bump.outputs['Normal'],bs.inputs['Normal']);l.new(bs.outputs[0],out.inputs[0])
 return m
mats=[petal_material('Ivory petal %02d'%i,(i-2)/4) for i in range(5)]
def green_material(name,base):
 m=bpy.data.materials.new(name);m.use_nodes=True;n=m.node_tree.nodes;l=m.node_tree.links;bs=n.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*base,1);bs.inputs['Roughness'].default_value=.74;bs.inputs['Subsurface Weight'].default_value=.04
 no=n.new('ShaderNodeTexNoise');no.inputs['Scale'].default_value=48;no.inputs['Detail'].default_value=3
 bu=n.new('ShaderNodeBump');bu.inputs['Strength'].default_value=.28;bu.inputs['Distance'].default_value=.025;l.new(no.outputs['Fac'],bu.inputs['Height']);l.new(bu.outputs['Normal'],bs.inputs['Normal']);return m
green=green_material('Deep botanical green',(.035,.085,.018));sepals=green_material('Fresh bud sepals',(.095,.18,.036))
NU=22;NV=6;petals=[]
def coords(layer,angle,length,width,seed,openness,sepal=False):
 vs=[];q=layer/11
 for j in range(NU+1):
  t=j/NU;o=max(0,min(1,openness*(1.12-.12*t)));root=.012+.22*(1-q)
  if sepal:rc=.22*(1-t)+.56*sin(pi*t*.94);zc=-.13+.94*t;ro=.22+.62*t;zo=-.13-.30*t+.10*sin(pi*t)
  else:
   rc=root*(1-t)+(.46-.18*q)*sin(pi*t)+.012*t;zc=.02+.12*q+(.84-.12*q)*t
   ro=root+length*(t-.035*sin(2*pi*t));zo=.025+.57*q+(.24+.27*q)*sin(pi*t*.78)-.18*(1-q)*t**3;zo+=.07*sin(seed+3*t)*t*t
  rr=rc*(1-o)+ro*o;zz=zc*(1-o)+zo*o
  for i in range(NV+1):
   v=i/NV*2-1;profile=sin(pi*(.015+.96*t))**.36*(.69+.31*t);w=width*profile*(.72+.28*o);x=v*w
   cup=abs(v)**2.4*(.035+.028*(1-o))*sin(pi*t);fold=.012*cos(v*5*pi+seed)*sin(pi*t)*(.4+.6*o);twist=.027*sin(t*4+seed)*v*t;r=rr+twist;a=angle+.05*sin(seed+t*2)*t*o
   vs.append((r*cos(a)-x*sin(a),r*sin(a)+x*cos(a),zz+cup+fold))
 return vs
def make_petal(layer,angle,length,width,seed,sepal=False):
 vs=coords(layer,angle,length,width,seed,0,sepal);fs=[]
 for j in range(NU):
  for i in range(NV):a=j*(NV+1)+i;fs.append((a,a+1,a+NV+2,a+NV+1))
 me=bpy.data.meshes.new('Petal membrane');me.from_pydata(vs,[],fs);me.update();ob=bpy.data.objects.new(('Sepal' if sepal else 'Ray floret')+' %03d'%len(petals),me);bpy.context.collection.objects.link(ob);ob.parent=head
 uv=me.uv_layers.new(name='Petal UV')
 for f in me.polygons:
  f.use_smooth=True
  for li in f.loop_indices:vi=me.loops[li].vertex_index;uv.data[li].uv=(vi%(NV+1)/NV,vi//(NV+1)/NU)
 me.materials.append(sepals if sepal else random.choice(mats));ob.shape_key_add(name='Closed')
 for idx,o in enumerate([.35,.7,1]):
  key=ob.shape_key_add(name=['Unfurl','Extend','Bloom'][idx])
  for v,c in zip(key.data,coords(layer,angle,length,width,seed,o,sepal)):v.co=c
 start=(0 if sepal else 10+layer*6)+random.uniform(-4,4);duration=88 if sepal else 92+random.uniform(-6,6)
 for k,key in enumerate(list(me.shape_keys.key_blocks)[1:]):
  key.value=0;key.keyframe_insert('value',frame=1);key.keyframe_insert('value',frame=max(1,start+k*duration/3));key.value=1;key.keyframe_insert('value',frame=start+(k+1)*duration/3)
  if k<2:key.value=0;key.keyframe_insert('value',frame=start+(k+2)*duration/3)
 sol=ob.modifiers.new('Petal thickness','SOLIDIFY');sol.thickness=.004 if sepal else .0018;petals.append(ob)
counts=[47,47,43,41,37,33,28,24,21,18,16,12]
for layer,count in enumerate(counts):
 q=layer/11
 for i in range(count):
  angle=2*pi*i/count+layer*2.399963+random.uniform(-.025,.025);length=(1.34*(1-q)**.85+.24)*random.uniform(.91,1.07);width=(.113*(1-q)+.031)*random.uniform(.85,1.12)
  make_petal(layer,angle,length,width,random.random()*8)
for i in range(9):make_petal(11,2*pi*i/9,.10,.026,random.random()*8)
for i in range(16):make_petal(0,2*pi*i/16,.55,.135,random.random()*8,True)
bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=16,radius=1);base=bpy.context.object;base.name='Receptacle';base.parent=head;base.location=(0,0,-.055);base.scale=(.33,.33,.16);base.data.materials.append(green)
for p in base.data.polygons:p.use_smooth=True
cu=bpy.data.curves.new('Stem curve','CURVE');cu.dimensions='3D';cu.resolution_u=24;cu.bevel_depth=.034;cu.bevel_resolution=5;sp=cu.splines.new('BEZIER');sp.bezier_points.add(3)
for b,co,ra in zip(sp.bezier_points,[(.06,.03,-3),(-.08,.04,-1.9),(.02,.01,-.55),(0,0,.5)],[1.23,1.13,1,.85]):b.co=co;b.radius=ra;b.handle_left_type='AUTO';b.handle_right_type='AUTO'
ob=bpy.data.objects.new('Living stem',cu);bpy.context.collection.objects.link(ob);cu.materials.append(green)
for sign,z0,ang in [(-1,-.8,-.18),(1,-1.8,.35)]:
 vs=[];fs=[];n=32;w=8
 for j in range(n+1):
  t=j/n
  for i in range(w+1):
   v=i/w*2-1;lobes=1+.23*sin(t*8*pi)+.075*sin(t*23*pi);ww=.28*sin(pi*t)**.7*lobes;x=sign*t*.95;y=v*ww+.07*sin(t*pi);z=z0+.36*t+.04*sin(t*pi)-.07*abs(v)+.025*sin(v*3*pi)*t;vs.append((x,y,z))
 for j in range(n):
  for i in range(w):a=j*(w+1)+i;fs.append((a,a+1,a+w+2,a+w+1))
 me=bpy.data.meshes.new('Lobed chrysanthemum leaf');me.from_pydata(vs,[],fs);me.update();ob=bpy.data.objects.new('Leaf',me);bpy.context.collection.objects.link(ob);me.materials.append(green)
 for f in me.polygons:f.use_smooth=True
 ob.modifiers.new('Leaf membrane','SOLIDIFY').thickness=.006
def area(name,loc,power,color,size,target):
 bpy.ops.object.light_add(type='AREA',location=loc);ob=bpy.context.object;ob.name=name;ob.data.energy=power;ob.data.color=color;ob.data.shape='DISK';ob.data.size=size;ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler();return ob
key=area('Window / warm key',(-3,-4,6),350,(1,.87,.67),4,(0,0,.7));area('Soft cool fill',(3,-2,1),110,(.72,.84,1),3,(0,0,.5));area('Sun edge',(-1,2,4),410,(1,.78,.46),2,(0,0,.5))
bpy.ops.object.camera_add(location=(.15,-8.8,3.4));cam=bpy.context.object;cam.name='Botanical macro';s.camera=cam;cam.data.type='PERSP';cam.data.lens=55;cam.rotation_euler=(Vector((0,0,.05))-cam.location).to_track_quat('-Z','Y').to_euler()
focus=bpy.data.objects.new('Focus on bloom',None);bpy.context.collection.objects.link(focus);focus.location=(0,-.28,.62);cam.data.dof.use_dof=True;cam.data.dof.focus_object=focus;cam.data.dof.aperture_fstop=9
cam.keyframe_insert('location',frame=1);cam.keyframe_insert('rotation_euler',frame=1);cam.location=(.30,-8.65,3.55);cam.rotation_euler=(Vector((0,0,.05))-cam.location).to_track_quat('-Z','Y').to_euler();cam.keyframe_insert('location',frame=193);cam.keyframe_insert('rotation_euler',frame=193)
key.data.energy=300;key.data.keyframe_insert('energy',frame=1);key.data.energy=390;key.data.keyframe_insert('energy',frame=193)
s.render.filepath=os.path.join(ROOT,'renders','bloom-');bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'renders','chrysanthemum.blend'))
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
if 'setup' not in args:bpy.ops.render.render(animation=True)
