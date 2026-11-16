import numpy as np, base64, json, sys
from skimage import measure
h=0.0075
xs=np.arange(-0.52,0.52,h); ys=np.arange(-0.02,1.80,h); zs=np.arange(-0.2,0.24,h)
X,Y,Z=np.meshgrid(xs,ys,zs,indexing='ij')
P=np.stack([X,Y,Z],-1)
def sph(c,r):return np.linalg.norm(P-np.array(c),axis=-1)-r
def ell(c,r):
    c=np.array(c);r=np.array(r);q=(P-c)/r;k0=np.linalg.norm(q,axis=-1);k1=np.linalg.norm(q/r,axis=-1);return k0*(k0-1)/np.maximum(k1,1e-6)
def rcone(a,b,r1,r2):
    a=np.array(a);b=np.array(b);ba=b-a;pa=P-a;t=np.clip((pa@ba)/(ba@ba),0,1);d=np.linalg.norm(pa-t[...,None]*ba,axis=-1);return d-(r1+(r2-r1)*t)
def smin(a,b,k):
    hh=np.clip(0.5+0.5*(b-a)/k,0,1);return b*(1-hh)+a*hh-k*hh*(1-hh)
parts=[]
def add(d,k=0.03):parts.append((d,k))
# Maniquí anatómico neutro y atlético (sin volumen extra en pecho, cadera ni glúteos)
add(ell([0,1.63,0.004],[0.074,0.1,0.09]))
add(ell([0,1.565,0.026],[0.054,0.045,0.058]),0.025)
add(rcone([0,1.44,-0.004],[0,1.56,0.0],0.048,0.043),0.022)
add(ell([0,1.30,-0.004],[0.148,0.15,0.084]),0.035)
add(rcone([-0.17,1.395,-0.008],[0.17,1.395,-0.008],0.05,0.05),0.035)
add(ell([0,1.11,-0.004],[0.118,0.15,0.074]),0.04)
add(ell([0,0.95,-0.008],[0.128,0.085,0.08]),0.035)
for s in(-1,1):
    add(rcone([s*0.085,0.93,-0.006],[s*0.098,0.5,0.0],0.068,0.047),0.03)
    add(rcone([s*0.098,0.5,0.0],[s*0.106,0.09,-0.01],0.046,0.032),0.02)
    add(ell([s*0.1,0.37,-0.022],[0.038,0.09,0.04]),0.025)
    add(rcone([s*0.106,0.048,-0.018],[s*0.114,0.026,0.11],0.032,0.025),0.018)
    add(ell([s*0.2,1.37,-0.006],[0.055,0.055,0.055]),0.03)
    add(rcone([s*0.21,1.36,-0.006],[s*0.29,1.115,-0.006],0.042,0.034),0.022)
    add(rcone([s*0.29,1.115,-0.006],[s*0.35,0.875,0.025],0.033,0.025),0.018)
    add(ell([s*0.362,0.812,0.033],[0.02,0.054,0.034]),0.015)
d=parts[0][0]
for p,k in parts[1:]:d=smin(d,p,k)
v,f,n,_=measure.marching_cubes(d,0.0,spacing=(h,h,h),step_size=int(sys.argv[1]) if len(sys.argv)>1 else 2)
v=v+np.array([xs[0],ys[0],zs[0]])
print('verts',len(v),'faces',len(f),file=sys.stderr)
# recompute smooth normals from gradient (skimage normals point outward along -grad?); compute from mesh
nn=np.zeros_like(v);tri=v[f];fn=np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0])
for i in range(3):np.add.at(nn,f[:,i],fn)
nn/=np.linalg.norm(nn,axis=1,keepdims=True)+1e-9
# orient: normals should point away from body center line roughly; check sign using sdf gradient = n from skimage
if (nn*n).sum()<0: nn=-nn
# skimage normals point toward increasing d (outward); ensure face winding matches
if (fn*n[f[:,0]]).sum()<0: f=f[:,[0,2,1]]
q=np.round(v*16000).astype(np.int16);qn=np.round(nn*127).astype(np.int8);fi=f.astype(np.uint16 if len(v)<65536 else np.uint32)
out={'v':base64.b64encode(q.tobytes()).decode(),'n':base64.b64encode(qn.tobytes()).decode(),'i':base64.b64encode(fi.tobytes()).decode(),'i32':len(v)>=65536}
open(sys.argv[2],'w').write('window.BODY_MESH='+json.dumps(out)+';')
