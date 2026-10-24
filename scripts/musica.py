#!/usr/bin/env python3
"""Cama musical ambiental generada por código (sin derechos de terceros): pad de 4 acordes, pulso grave en
cada tiempo y ticks suaves en corcheas. Para cuando la persona dice "elige tú" y no hay pista libre a mano.
No es una gran canción: es un fondo discreto para hablar encima. La IA no la puede oír: avisar que la escuchen.
Uso: musica.py <salida.wav> <duración en s> [bpm=96] [semilla=7]
Luego: render.sh <carpeta> <salida.mp4> <salida.wav> 0.14"""
import numpy as np, wave, sys
SR=48000; D=float(sys.argv[2]) if len(sys.argv)>2 else 58.0; N=int(SR*D); t=np.arange(N)/SR
rng=np.random.default_rng(int(sys.argv[4]) if len(sys.argv)>4 else 7)
def note(m): return 440*2**((m-69)/12)
BPM=float(sys.argv[3]) if len(sys.argv)>3 else 96; beat=60/BPM; bar=4*beat
prog=[[57,60,64,69],[53,57,60,65],[48,55,60,64],[55,59,62,67]]  # Am F C G
pad=np.zeros((2,N))
for k in range(int(D/(2*bar))+2):
    ch=prog[k%4]; s0=k*2*bar; e0=s0+2*bar
    i0=int(s0*SR); i1=min(N,int((e0+1.5)*SR))
    if i0>=N: break
    tt=t[i0:i1]-s0
    env=np.minimum(1,tt/1.2)*np.minimum(1,np.maximum(0,(e0+1.5-s0-tt)/1.5))
    for m in ch:
        for ch_i,det in enumerate((-0.11,0.11)):
            f=note(m)*2**(det/12)
            w=np.sin(2*np.pi*f*tt)+0.35*np.sin(2*np.pi*2*f*tt+0.3)+0.15*np.sin(2*np.pi*3*f*tt)
            pad[ch_i,i0:i1]+=w*env*0.05
# sub pulse on beats
sub=np.zeros(N)
for b in np.arange(0,D,beat):
    i0=int(b*SR); L=int(0.35*SR); i1=min(N,i0+L); tt=np.arange(i1-i0)/SR
    k=int(b/(2*bar))%4; f=note(prog[k][0]-12)
    sub[i0:i1]+=np.sin(2*np.pi*f*tt)*np.exp(-tt*9)*0.22
# ticks on 8ths (filtered noise)
noise=rng.standard_normal(N); hp=np.diff(np.diff(noise,prepend=0),prepend=0)*0.5  # agudos (pasa-altos barato)
tick=np.zeros(N)
for b in np.arange(beat/2,D,beat/2):
    i0=int(b*SR); L=int(0.05*SR); i1=min(N,i0+L); tt=np.arange(i1-i0)/SR
    tick[i0:i1]+=hp[i0:i1]*np.exp(-tt*80)*0.05
mix=pad+sub+tick
fade=np.minimum(1,t/2.0)*np.minimum(1,(D-t)/2.5)
mix*=fade; mix/=np.max(np.abs(mix))*1.12
out=(mix.T*32767).astype(np.int16)
with wave.open(sys.argv[1],'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
