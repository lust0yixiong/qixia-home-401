# 原效果图材质

参考用户提供施工图中的原设计效果图 interior-03、07、10。使用内置 image_gen 图像编辑模式重建平视贴图，去除透视、物件和光照痕迹；并非取回设计师原始贴图，亦非经测量的 PBR 材料。微表面细节及粗糙度为视觉近似，实时光照下仍会有色差。保留源图的权利归属，不将这些衍生素材声明为 CC0。

五种贴图已作为默认材质，也列在材质库“原效果图”分类中。底色、柜体及织物配色依据参考图校准。白色窗框保持用户确认的白色。

## 处理提示词与原图

### wood

输出：`wood.png`。参考：interior-03.jpg、interior-10.jpg

Create ONE square seamless base-color texture derived from the muted warm taupe-brown oak veneer in the attached interior renders (kitchen tall side panels and bedroom wardrobe). Front orthographic flat surface filling the entire image. Fine vertical straight grain with subtle long cathedral grain. Faithfully keep the reference wood neutral beige-brown, low saturation, gently pink/taupe, NOT golden yellow/orange. Remove all perspective, objects, seams, borders, handles, fixtures, highlights, lighting gradients and shadows. Uniform diffuse albedo appearance, seamless tileable on all edges, no text. Texture represents about 1 meter across. This is a texture asset, not a room or moodboard. Output 1024 square if possible.

### floor

输出：`floor.png`。参考：interior-03.jpg、interior-07.jpg

Create ONE square seamless base-color texture derived from the greige limestone floor in the attached original interior rendering images. Match the reference fine irregular mineral aggregate and subtle mottled warm grey-beige ground, moderate fine grain and quiet stone variation, no strong marble veins. Flat orthographic view, entire image is only one continuous stone surface, no tile grout lines, seams, shadows, directional light, reflections, objects or perspective. Neutral even diffuse lighting for a base-color map. All edges tile seamlessly. Represents about 1 meter of floor. Do not make a room. 1024 square if possible.

### countertop

输出：`countertop.png`。参考：interior-03.jpg

Create ONE square seamless base-color texture for the DARK WARM CHARCOAL countertop and island facing in the attached kitchen render. Faithfully reproduce the nearly solid neutral warm charcoal brown-grey, roughly sRGB #35332f, subtle ultra-fine stone speckle only, extremely low contrast. NO veins, tile joints or mottled cloud patterns. Orthographic completely flat uniform diffuse albedo, no reflections, lighting gradients, shadows, objects, perspective, text or borders. Fill the entire image with the dark charcoal sintered-stone surface. Seamless all edges. Represents 1 meter across. 1024 square if possible.

### green

输出：`green.png`。参考：interior-03.jpg

Create ONE square seamless base-color surface texture derived from the rich deep emerald/bottle-green glossy ceramic kitchen backsplash in the attached render. Only the glaze COLOR of a single tile, extended into a seamless surface. Restrained organic tonal variation, rich deep green matching the middle unlit region of the reference backsplash, roughly sRGB #23502b. Remove baked shine and undercabinet lighting. NO grout, tile outlines, edges, seams, gradients, reflections, shadows, objects or text. Flat orthographic uniformly lit albedo texture, seamless all four edges, not a room. 1024 square if possible.

### vanity

输出：`vanity.png`。参考：interior-07.jpg

Create ONE square seamless base-color texture from the white/light-grey stone backsplash directly beneath the mirror and behind the faucet in the supplied vanity render. Match its dense fine dark-grey spiderweb-like mineral veins on an ivory-light-grey base. Fine irregular interlocking vein network, elegant subtle grey-green cast, no giant marble streaks. Orthographic uniform albedo, remove all objects, taps, perspective, panel seams, sink, shadows and lighting gradients. Entire image one continuous tileable stone surface. Texture represents about 60 cm wide. Seamless all edges, no borders or text. 1024 square if possible.

