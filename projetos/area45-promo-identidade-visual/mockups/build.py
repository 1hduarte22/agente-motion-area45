# Monta mockups.built.html a partir de mockups.html (marca fictícia "Aurora Café")
h=open('mockups.html').read()
def sun(size,c1,c2):
    rays=''.join(f'<rect x="47" y="2" width="6" height="16" rx="3" fill="{c2}" transform="rotate({a} 50 50)"/>' for a in range(-90,91,30))
    return f'<svg width="{size}" height="{size//2+size//10}" viewBox="0 0 100 60"><g>{rays}<path d="M22 58 A28 28 0 0 1 78 58 Z" fill="{c1}"/></g><rect x="10" y="57" width="80" height="3" rx="1.5" fill="{c2}"/></svg>'
h=h.replace('__SUNBIG__',sun(260,'#C8553D','#E0A458')).replace('__SUNW__',sun(220,'#F4EBDD','#F4EBDD')).replace('__SUNSM2__',sun(90,'#C8553D','#E0A458')).replace('__SUNSM__',sun(110,'#F4EBDD','#E0A458')).replace('__SUN__',sun(150,'#C8553D','#E0A458'))
sw=[('Verde Aurora','#2F4538','#F4EBDD'),('Terracota','#C8553D','#F4EBDD'),('Mel','#E0A458','#1E2A23'),('Creme','#F4EBDD','#1E2A23')]
h=h.replace('__SWATCHES__',''.join(f'<div class="shadow" style="width:220px;height:1000px;background:{c};border-radius:20px;display:flex;flex-direction:column;justify-content:flex-end;padding:30px 24px;color:{t}"><div class="serif" style="font-size:34px;font-weight:600;line-height:1.1">{n}</div><div style="font-size:24px;margin-top:10px;opacity:.85">{c}</div></div>' for n,c,t in sw))
ic=[('Cardápio','☕','#2F4538'),('Doces','🍰','#C8553D'),('Pedidos','🛍️','#E0A458'),('Eventos','🎉','#2F4538'),('Sobre','✨','#C8553D')]
h=h.replace('__HIGHLIGHTS__',''.join(f'<div style="text-align:center;font-size:18px;color:#222"><div style="width:96px;height:96px;border-radius:50%;background:{c};border:4px solid #fff;outline:2px solid #ddd;display:flex;align-items:center;justify-content:center;font-size:42px">{e}</div><div style="margin-top:8px">{n}</div></div>' for n,e,c in ic))
cols=['#2F4538','#F4EBDD','#C8553D','#E0A458','#2F4538','#F4EBDD','#C8553D','#E0A458','#2F4538']
h=h.replace('__GRID__',''.join(f'<div style="aspect-ratio:1;background:{c}"></div>' for c in cols))
open('mockups.built.html','w').write(h)
