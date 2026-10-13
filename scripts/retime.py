# Traslada los tiempos de video.tsx de la edición vieja a la nueva alineando palabras.
import json,re,sys,difflib,bisect
old_ts,new_ts,old_tsx,new_tsx=sys.argv[1:5]
def load(p):
    s=open(p).read(); return json.loads(s[s.index("= [")+2:].rstrip().rstrip(";"))
O=load(old_ts); N=load(new_ts)
norm=lambda w: re.sub(r"[^\wáéíóúñ]","",w.lower())
sm=difflib.SequenceMatcher(None,[norm(w["w"]) for w in O],[norm(w["w"]) for w in N],autojunk=False)
pairs=[]
for bl in sm.get_matching_blocks():
    for k in range(bl.size): pairs.append((O[bl.a+k]["s"],N[bl.b+k]["s"]))
pairs.sort(); os_=[p[0] for p in pairs]
print("palabras viejas",len(O),"nuevas",len(N),"alineadas",len(pairs))
def m(t):
    i=bisect.bisect_right(os_,t+1e-6)-1
    if i<0: return round(max(0,pairs[0][1]-(pairs[0][0]-t)),2)
    o,n=pairs[i]
    # si el siguiente ancla está antes en la nueva línea de tiempo (tramo recortado), no pasarse
    r=n+(t-o)
    if i+1<len(pairs): r=min(r,pairs[i+1][1]-0.02) if t<pairs[i+1][0] else r
    return round(r,2)
src=open(old_tsx).read()
TIMEKEYS=r"(?:at|from|to|typeFrom|typeTo|strikeAt|titleAt|pickAt|fillAt|showAt)"
# JSX attrs: key={num}  (salvo <Counter ... to={..}>)
def jsx(mo):
    k,v=mo.group(1),mo.group(2)
    pre=src[max(0,mo.start()-60):mo.start()]
    if k=="to" and pre.rfind("<Counter")>pre.rfind(">"): return mo.group(0)
    return f"{k}={{{m(float(v))}}}"
src=re.sub(r"\b("+TIMEKEYS+r")=\{([\d.]+)\}",jsx,src)
src=re.sub(r"\b("+TIMEKEYS+r"): ([\d.]+)",lambda mo: f"{mo.group(1)}: {m(float(mo.group(2)))}",src)
src=re.sub(r'(\["[^"]*", )([\d.]+)(\])',lambda mo: mo.group(1)+str(m(float(mo.group(2))))+mo.group(3),src)
def arr(name):
    global src
    mo=re.search(r"const "+name+r"( = \[)([^\]]*)(\])",src)
    if mo:
        body=re.sub(r"[\d.]+",lambda x: str(m(float(x.group(0)))),mo.group(2))
        src=src[:mo.start(2)]+body+src[mo.end(2):]
for a in ["POPS","DINGS","CLICKS"]: arr(a)
# HIDE_SUBS pares
mo=re.search(r"const HIDE_SUBS[^=]*= \[(.*?)\];",src,re.S)
body=re.sub(r"\[([\d.]+), ([\d.]+)\]",lambda x: f"[{m(float(x.group(1)))}, {999 if float(x.group(2))>=999 else m(float(x.group(2)))}]",mo.group(1))
src=src[:mo.start(1)]+body+src[mo.end(1):]
open(new_tsx,"w").write(src)
# reporte de tramos donde la diferencia de desfase salta (cortes distintos)
prev=None
for o,n in pairs:
    d=n-o
    if prev is not None and abs(d-prev)>0.6: print(f"salto de desfase en viejo {o:.2f} -> nuevo {n:.2f} ({d-prev:+.2f}s)")
    prev=d
