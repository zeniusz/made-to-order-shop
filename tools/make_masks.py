# Builds the recolouring masks from the source photo (mann.jpg, 3008x2000, from Wikimedia Commons).
# Output: base.jpg, plain.jpg, m1.png (R jacket, G tie, B pocket square), m2.png (shirt). Crop and copy into assets/img.
# Polygons are in the coordinates of a 1200px-wide version of the photo.
from PIL import Image, ImageDraw, ImageFilter
import numpy as np, colorsys
K=1.5
W,H=int(960*K),int(638*K)
img=Image.open('mann.jpg').convert('RGB').resize((W,H),Image.LANCZOS)
s=W/1200.0
def poly(pts):
    m=Image.new('L',(W,H),0); ImageDraw.Draw(m).polygon([(x*s,y*s) for x,y in pts],fill=255); return np.asarray(m)>0
a=np.asarray(img).astype(float)/255
def dil(m,n=int(5*K)):
    x=Image.fromarray((m*255).astype('uint8')).filter(ImageFilter.MaxFilter(2*n+1)); return np.asarray(x)>0
mx=a.max(2); mn=a.min(2); V=mx; S=np.where(mx>0,(mx-mn)/np.maximum(mx,1e-6),0)
r,g,b=a[...,0],a[...,1],a[...,2]
d=np.maximum(mx-mn,1e-6)
Hh=np.where(mx==r,((g-b)/d)%6,np.where(mx==g,(b-r)/d+2,(r-g)/d+4))*60
jp=poly([(395,470),(420,425),(515,372),(640,235),(700,152),(870,104),(1008,150),(1200,140),(1200,798),(380,798),(360,560)])
tp=poly([(530,620),(538,420),(578,232),(680,158),(700,160),(742,188),(722,230),(688,305),(655,378),(620,470),(592,562),(578,620)])
sp_ex=poly([(680,395),(1000,420),(1010,570),(685,580)])&(V>0.42)&(Hh>185)&(Hh<250)&(S>0.08)
navy=((Hh>185)&(Hh<262)&(((V<0.45)&(S>0.12))|((V<0.7)&(S>0.2))))|(V<0.3)
lp=poly([(370,560),(395,470),(430,420),(520,358),(548,400),(548,800),(380,800)])
jacket=((jp&navy)|(lp&(Hh>185)&(Hh<262)&(S>0.18)&(V<0.72)))&~tp
tie=tp&(S>0.13)&~((V<0.2)&(Hh>200)&(Hh<250))
sp=poly([(680,395),(1000,420),(1010,570),(685,580)])
sq=sp_ex
shp=poly([(700,170),(915,80),(925,115),(880,150),(775,300),(690,410),(668,330),(655,210)])
shirt=shp&(S<0.26)&(V>0.33)&~tie
def close(m,n=4):
    x=Image.fromarray((m*255).astype('uint8')).filter(ImageFilter.MaxFilter(2*n+1)).filter(ImageFilter.MinFilter(2*n+1)); return np.asarray(x)>127
def fill_holes(m,maxarea=2500):
    from scipy import ndimage
    holes=ndimage.binary_fill_holes(m)&~m
    lab,n=ndimage.label(holes)
    if n==0: return m
    sizes=ndimage.sum(holes,lab,range(1,n+1))
    small=np.isin(lab,[i+1 for i,s in enumerate(sizes) if s<=maxarea])
    return m|small
def soft(m,r=1.5*K): return np.asarray(Image.fromarray((m*255).astype('uint8')).filter(ImageFilter.GaussianBlur(r))) 
tie=close(tie&tp,9)&tp; sq=poly([(708,467),(717,492),(758,479),(792,438),(879,398),(885,504),(888,492),(958,450),(985,442),(977,456),(963,500),(888,506),(833,514),(771,533),(708,554),(688,563),(696,492)]); shirt=close(shirt,5)&shp&~tie
mj,mt,ms,mh=soft(close(jacket,5)&~tie),soft(tie,1.4*K),soft(sq,1.4*K),soft(shirt,2.4*K)
Image.fromarray(np.dstack([mj,mt,ms])).save('m1.png',optimize=True)
Image.fromarray(mh).save('m2.png',optimize=True)
lum=(0.299*r+0.587*g+0.114*b)
# plain luminance: blur strongly inside jacket to remove pinstripes
L=Image.fromarray((lum*255).astype('uint8'))
jm_=Image.fromarray((jacket*255).astype('uint8'))
Lm=np.asarray(L).astype(float)*jacket
num=np.asarray(Image.fromarray(Lm.clip(0,255).astype('uint8')).filter(ImageFilter.GaussianBlur(4.5*K))).astype(float)
den=np.asarray(jm_.filter(ImageFilter.GaussianBlur(4.5*K))).astype(float)/255
Lb=np.where(den>0.05,num/np.maximum(den,0.05),np.asarray(L).astype(float)).clip(0,255)
Lo=lum*255
# blend only on jacket; outside keep original
def nblur(mask,sig):
    mm=Image.fromarray((mask*255).astype('uint8'))
    num=np.asarray(Image.fromarray((np.asarray(L).astype(float)*mask).clip(0,255).astype('uint8')).filter(ImageFilter.GaussianBlur(sig))).astype(float)
    den=np.asarray(mm.filter(ImageFilter.GaussianBlur(sig))).astype(float)/255
    return np.where(den>0.05,num/np.maximum(den,0.05),np.asarray(L).astype(float)).clip(0,255)
Tb=nblur(tie,6*K)
plain=np.where(jacket,Lb,np.where(tie,Tb,Lo)).astype('uint8')
Image.fromarray(plain).save('plain.jpg',quality=85)
img.save('base.jpg',quality=84,optimize=True,progressive=True)
print('jacket mean lum',lum[jacket].mean()*255,'px',jacket.sum(),tie.sum(),sq.sum(),shirt.sum())
np.save('jmean.npy',np.array([lum[jacket].mean()*255, Lb[jacket].mean()]))
# preview overlay of masks
pv=np.asarray(img).copy()
pv[jacket]=(pv[jacket]*0.4+np.array([255,0,0])*0.6).astype('uint8')
pv[tie]=(pv[tie]*0.4+np.array([0,255,0])*0.6).astype('uint8')
pv[sq]=(pv[sq]*0.4+np.array([255,255,0])*0.6).astype('uint8')
pv[shirt]=(pv[shirt]*0.4+np.array([0,0,255])*0.6).astype('uint8')
Image.fromarray(pv).save('mask_preview.jpg')
