#!/usr/bin/env python3
"""Génère les icônes PWA (PNG) à partir d'un dessin simple.
   Lance : python tools/generate_icons.py
   Régénère icons/icon-180.png, icon-192.png, icon-512.png, icon-512-maskable.png
"""
import os
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(__file__), "..", "icons")
os.makedirs(OUT, exist_ok=True)

GREEN_TOP = (107, 156, 122)   # #6b9c7a
GREEN_BOT = (74, 123, 95)     # #4a7b5f
WHITE = (255, 255, 255)


def font(size):
    for path in (r"C:\Windows\Fonts\arialbd.ttf", r"C:\Windows\Fonts\Arialbd.ttf",
                 "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"):
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def draw_icon(size, padding_ratio=0.0):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pad = int(size * padding_ratio)
    box = size - 2 * pad
    radius = int(box * 0.22)
    # fond dégradé vertical
    grad = Image.new("RGB", (1, box))
    for y in range(box):
        t = y / max(1, box - 1)
        grad.putpixel((0, y), tuple(int(GREEN_TOP[i] + (GREEN_BOT[i] - GREEN_TOP[i]) * t) for i in range(3)))
    grad = grad.resize((box, box))
    mask = Image.new("L", (box, box), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, box - 1, box - 1], radius=radius, fill=255)
    img.paste(grad, (pad, pad), mask)

    # texte « 3ᵉ »
    f_big = font(int(box * 0.5))
    f_sm = font(int(box * 0.16))
    cx = size / 2
    # "3" centré, "e" en exposant
    t3 = "3"
    bb = d.textbbox((0, 0), t3, font=f_big)
    w3, h3 = bb[2] - bb[0], bb[3] - bb[1]
    x3 = cx - w3 / 2 - box * 0.06
    y3 = size / 2 - h3 / 2 - bb[1] - box * 0.04
    d.text((x3, y3), t3, font=f_big, fill=WHITE)
    # exposant "e"
    d.text((x3 + w3 + box * 0.01, y3 + box * 0.02), "e", font=f_sm, fill=WHITE)
    # libellé "MATHS" en bas
    f_lab = font(int(box * 0.12))
    lab = "MATHS"
    lb = d.textbbox((0, 0), lab, font=f_lab)
    d.text((cx - (lb[2] - lb[0]) / 2, pad + box * 0.78), lab, font=f_lab, fill=WHITE)
    return img


for size in (180, 192, 512):
    draw_icon(size).save(os.path.join(OUT, f"icon-{size}.png"))
# version « maskable » avec marge de sécurité (zone safe d'Android)
draw_icon(512, padding_ratio=0.12).save(os.path.join(OUT, "icon-512-maskable.png"))
print("Icônes générées dans", os.path.abspath(OUT))
