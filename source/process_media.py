"""Denoise the original 97 RGBA renders and make self-contained mobile media.
Requires Python 3.12+, oidn==0.2.1, Pillow, NumPy and FFmpeg with libx264.
Run after: blender -b -t 8 --python source/create_flower.py
"""
from pathlib import Path
import os, sys, subprocess
ROOT = Path(__file__).resolve().parents[1]
local_deps = ROOT / 'qa/render-deps'
if local_deps.exists(): sys.path.insert(0, str(local_deps))
os.environ.setdefault('OMP_NUM_THREADS', '4')
import numpy as np
from PIL import Image
import oidn
assets = ROOT / 'dist/assets' if (ROOT / 'dist').exists() else ROOT / 'assets'
assets.mkdir(parents=True, exist_ok=True)
clean = ROOT / 'renders/clean'; clean.mkdir(parents=True, exist_ok=True)
opaque = ROOT / 'renders/opaque'; opaque.mkdir(parents=True, exist_ok=True)
frames = sorted((ROOT / 'renders').glob('bloom-*.png'))
if len(frames) != 97: raise SystemExit(f'Expected 97 frames, got {len(frames)}')
dev = oidn.NewDevice(); oidn.CommitDevice(dev)
for i, source in enumerate(frames):
    image = Image.open(source).convert('RGBA')
    rgba = np.array(image)
    color = np.ascontiguousarray(rgba[:, :, :3].astype(np.float32) / 255)
    output = np.zeros_like(color)
    filt = oidn.NewFilter(dev, 'RT')
    oidn.SetSharedFilterImage(filt, 'color', color, oidn.FORMAT_FLOAT3, image.width, image.height)
    oidn.SetSharedFilterImage(filt, 'output', output, oidn.FORMAT_FLOAT3, image.width, image.height)
    oidn.CommitFilter(filt); oidn.ExecuteFilter(filt)
    error = oidn.GetDeviceError(dev)
    if error: raise RuntimeError(f'OIDN error: {error}')
    oidn.ReleaseFilter(filt)
    rgba[:, :, :3] = np.clip(output * 255, 0, 255).astype(np.uint8)
    denoised = Image.fromarray(rgba)
    denoised.save(clean / f'{i:04d}.png')
    Image.alpha_composite(Image.new('RGBA', image.size, (232, 236, 223, 255)), denoised).convert('RGB').save(opaque / f'{i:04d}.png')
    if i in (0, 96): denoised.save(assets / ('bud.webp' if i == 0 else 'flower.webp'), 'WEBP', quality=94, method=6)
    if i % 16 == 0: print(f'Denoised {i + 1}/97', flush=True)
oidn.ReleaseDevice(dev)
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'warning', '-y', '-framerate', '6', '-i', str(opaque / '%04d.png'), '-vf', 'format=rgb24,tpad=stop_mode=clone:stop_duration=0.34,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,hqdn3d=1:1:2:2,pad=ceil(iw/2)*2:ceil(ih/2)*2', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-profile:v', 'high', '-level', '4.0', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', str(assets / 'bloom.mp4')], check=True)
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'warning', '-y', '-i', str(assets / 'bloom.mp4'), '-vf', 'scale=384:512', '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-profile:v', 'baseline', '-level', '3.0', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', str(assets / 'bloom-lite.mp4')], check=True)
for path in assets.iterdir():
    if path.is_file(): print(path.name, path.stat().st_size, flush=True)
