var Ln=Object.defineProperty;var Nn=(o,t)=>{for(var e in t)Ln(o,e,{get:t[e],enumerable:!0})};import{RGBAFormat as fr,FloatType as mr,HalfFloatType as dr,Color as jn,Vector2 as Qn,WebGLRenderTarget as hr,NoBlending as Zn,NormalBlending as Kn,Vector4 as pr}from"three";import{BufferGeometry as zn,Float32BufferAttribute as hi,OrthographicCamera as On,Mesh as Hn}from"three";var kn=new On(-1,1,1,-1,0,1),lr=class extends zn{constructor(){super(),this.setAttribute("position",new hi([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new hi([0,2,0,0,2,0],2))}},Un=new lr,X=class{constructor(t){this._mesh=new Hn(Un,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,kn)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}};import{NoBlending as Gn}from"three";import{ShaderMaterial as Vn}from"three";var Q=class extends Vn{constructor(t){super(t);for(let e in this.uniforms)Object.defineProperty(this,e,{get(){return this.uniforms[e].value},set(r){this.uniforms[e].value=r}})}setDefine(t,e=void 0){e==null?t in this.defines&&(delete this.defines[t],this.needsUpdate=!0):this.defines[t]!==e&&(this.defines[t]=e,this.needsUpdate=!0)}};var re=class extends Q{constructor(t){super({blending:Gn,uniforms:{target1:{value:null},target2:{value:null},opacity:{value:1}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				uniform float opacity;

				uniform sampler2D target1;
				uniform sampler2D target2;

				varying vec2 vUv;

				void main() {

					vec4 color1 = texture2D( target1, vUv );
					vec4 color2 = texture2D( target2, vUv );

					float invOpacity = 1.0 - opacity;
					float totalAlpha = color1.a * invOpacity + color2.a * opacity;

					if ( color1.a != 0.0 || color2.a != 0.0 ) {

						gl_FragColor.rgb = color1.rgb * ( invOpacity * color1.a / totalAlpha ) + color2.rgb * ( opacity * color2.a / totalAlpha );
						gl_FragColor.a = totalAlpha;

					} else {

						gl_FragColor = vec4( 0.0 );

					}

				}`}),this.setValues(t)}};import{FloatType as Wn,NearestFilter as xi,NoBlending as qn,RGBAFormat as Xn,Vector2 as Yn,WebGLRenderTarget as $n}from"three";function ie(o=1){let t="uint";return o>1&&(t="uvec"+o),`
		${t} sobolReverseBits( ${t} x ) {

			x = ( ( ( x & 0xaaaaaaaau ) >> 1 ) | ( ( x & 0x55555555u ) << 1 ) );
			x = ( ( ( x & 0xccccccccu ) >> 2 ) | ( ( x & 0x33333333u ) << 2 ) );
			x = ( ( ( x & 0xf0f0f0f0u ) >> 4 ) | ( ( x & 0x0f0f0f0fu ) << 4 ) );
			x = ( ( ( x & 0xff00ff00u ) >> 8 ) | ( ( x & 0x00ff00ffu ) << 8 ) );
			return ( ( x >> 16 ) | ( x << 16 ) );

		}

		${t} sobolHashCombine( uint seed, ${t} v ) {

			return seed ^ ( v + ${t}( ( seed << 6 ) + ( seed >> 2 ) ) );

		}

		${t} sobolLaineKarrasPermutation( ${t} x, ${t} seed ) {

			x += seed;
			x ^= x * 0x6c50b47cu;
			x ^= x * 0xb82f1e52u;
			x ^= x * 0xc7afe638u;
			x ^= x * 0x8d22f6e6u;
			return x;

		}

		${t} nestedUniformScrambleBase2( ${t} x, ${t} seed ) {

			x = sobolLaineKarrasPermutation( x, seed );
			x = sobolReverseBits( x );
			return x;

		}
	`}function oe(o=1){let t="uint",e="float",r="",n=".r",a="1u";return o>1&&(t="uvec"+o,e="vec"+o,r=o+"",o===2?(n=".rg",a="uvec2( 1u, 2u )"):o===3?(n=".rgb",a="uvec3( 1u, 2u, 3u )"):(n="",a="uvec4( 1u, 2u, 3u, 4u )")),`

		${e} sobol${r}( int effect ) {

			uint seed = sobolGetSeed( sobolBounceIndex, uint( effect ) );
			uint index = sobolPathIndex;

			uint shuffle_seed = sobolHashCombine( seed, 0u );
			uint shuffled_index = nestedUniformScrambleBase2( sobolReverseBits( index ), shuffle_seed );
			${e} sobol_pt = sobolGetTexturePoint( shuffled_index )${n};
			${t} result = ${t}( sobol_pt * 16777216.0 );

			${t} seed2 = sobolHashCombine( seed, ${a} );
			result = nestedUniformScrambleBase2( result, seed2 );

			return SOBOL_FACTOR * ${e}( result >> 8 );

		}
	`}var ne=`

	// Utils
	const float SOBOL_FACTOR = 1.0 / 16777216.0;
	const uint SOBOL_MAX_POINTS = 256u * 256u;

	${ie(1)}
	${ie(2)}
	${ie(3)}
	${ie(4)}

	uint sobolHash( uint x ) {

		// finalizer from murmurhash3
		x ^= x >> 16;
		x *= 0x85ebca6bu;
		x ^= x >> 13;
		x *= 0xc2b2ae35u;
		x ^= x >> 16;
		return x;

	}

`,pi=`

	const uint SOBOL_DIRECTIONS_1[ 32 ] = uint[ 32 ](
		0x80000000u, 0xc0000000u, 0xa0000000u, 0xf0000000u,
		0x88000000u, 0xcc000000u, 0xaa000000u, 0xff000000u,
		0x80800000u, 0xc0c00000u, 0xa0a00000u, 0xf0f00000u,
		0x88880000u, 0xcccc0000u, 0xaaaa0000u, 0xffff0000u,
		0x80008000u, 0xc000c000u, 0xa000a000u, 0xf000f000u,
		0x88008800u, 0xcc00cc00u, 0xaa00aa00u, 0xff00ff00u,
		0x80808080u, 0xc0c0c0c0u, 0xa0a0a0a0u, 0xf0f0f0f0u,
		0x88888888u, 0xccccccccu, 0xaaaaaaaau, 0xffffffffu
	);

	const uint SOBOL_DIRECTIONS_2[ 32 ] = uint[ 32 ](
		0x80000000u, 0xc0000000u, 0x60000000u, 0x90000000u,
		0xe8000000u, 0x5c000000u, 0x8e000000u, 0xc5000000u,
		0x68800000u, 0x9cc00000u, 0xee600000u, 0x55900000u,
		0x80680000u, 0xc09c0000u, 0x60ee0000u, 0x90550000u,
		0xe8808000u, 0x5cc0c000u, 0x8e606000u, 0xc5909000u,
		0x6868e800u, 0x9c9c5c00u, 0xeeee8e00u, 0x5555c500u,
		0x8000e880u, 0xc0005cc0u, 0x60008e60u, 0x9000c590u,
		0xe8006868u, 0x5c009c9cu, 0x8e00eeeeu, 0xc5005555u
	);

	const uint SOBOL_DIRECTIONS_3[ 32 ] = uint[ 32 ](
		0x80000000u, 0xc0000000u, 0x20000000u, 0x50000000u,
		0xf8000000u, 0x74000000u, 0xa2000000u, 0x93000000u,
		0xd8800000u, 0x25400000u, 0x59e00000u, 0xe6d00000u,
		0x78080000u, 0xb40c0000u, 0x82020000u, 0xc3050000u,
		0x208f8000u, 0x51474000u, 0xfbea2000u, 0x75d93000u,
		0xa0858800u, 0x914e5400u, 0xdbe79e00u, 0x25db6d00u,
		0x58800080u, 0xe54000c0u, 0x79e00020u, 0xb6d00050u,
		0x800800f8u, 0xc00c0074u, 0x200200a2u, 0x50050093u
	);

	const uint SOBOL_DIRECTIONS_4[ 32 ] = uint[ 32 ](
		0x80000000u, 0x40000000u, 0x20000000u, 0xb0000000u,
		0xf8000000u, 0xdc000000u, 0x7a000000u, 0x9d000000u,
		0x5a800000u, 0x2fc00000u, 0xa1600000u, 0xf0b00000u,
		0xda880000u, 0x6fc40000u, 0x81620000u, 0x40bb0000u,
		0x22878000u, 0xb3c9c000u, 0xfb65a000u, 0xddb2d000u,
		0x78022800u, 0x9c0b3c00u, 0x5a0fb600u, 0x2d0ddb00u,
		0xa2878080u, 0xf3c9c040u, 0xdb65a020u, 0x6db2d0b0u,
		0x800228f8u, 0x400b3cdcu, 0x200fb67au, 0xb00ddb9du
	);

	uint getMaskedSobol( uint index, uint directions[ 32 ] ) {

		uint X = 0u;
		for ( int bit = 0; bit < 32; bit ++ ) {

			uint mask = ( index >> bit ) & 1u;
			X ^= mask * directions[ bit ];

		}
		return X;

	}

	vec4 generateSobolPoint( uint index ) {

		if ( index >= SOBOL_MAX_POINTS ) {

			return vec4( 0.0 );

		}

		// NOTEL this sobol "direction" is also available but we can't write out 5 components
		// uint x = index & 0x00ffffffu;
		uint x = sobolReverseBits( getMaskedSobol( index, SOBOL_DIRECTIONS_1 ) ) & 0x00ffffffu;
		uint y = sobolReverseBits( getMaskedSobol( index, SOBOL_DIRECTIONS_2 ) ) & 0x00ffffffu;
		uint z = sobolReverseBits( getMaskedSobol( index, SOBOL_DIRECTIONS_3 ) ) & 0x00ffffffu;
		uint w = sobolReverseBits( getMaskedSobol( index, SOBOL_DIRECTIONS_4 ) ) & 0x00ffffffu;

		return vec4( x, y, z, w ) * SOBOL_FACTOR;

	}

`,gi=`

	// Seeds
	uniform sampler2D sobolTexture;
	uint sobolPixelIndex = 0u;
	uint sobolPathIndex = 0u;
	uint sobolBounceIndex = 0u;

	uint sobolGetSeed( uint bounce, uint effect ) {

		return sobolHash(
			sobolHashCombine(
				sobolHashCombine(
					sobolHash( bounce ),
					sobolPixelIndex
				),
				effect
			)
		);

	}

	vec4 sobolGetTexturePoint( uint index ) {

		if ( index >= SOBOL_MAX_POINTS ) {

			index = index % SOBOL_MAX_POINTS;

		}

		uvec2 dim = uvec2( textureSize( sobolTexture, 0 ).xy );
		uint y = index / dim.x;
		uint x = index - y * dim.x;
		vec2 uv = vec2( x, y ) / vec2( dim );
		return texture( sobolTexture, uv );

	}

	${oe(1)}
	${oe(2)}
	${oe(3)}
	${oe(4)}

`;var ur=class extends Q{constructor(){super({blending:qn,uniforms:{resolution:{value:new Yn}},vertexShader:`

				varying vec2 vUv;
				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}
			`,fragmentShader:`

				${ne}
				${pi}

				varying vec2 vUv;
				uniform vec2 resolution;
				void main() {

					uint index = uint( gl_FragCoord.y ) * uint( resolution.x ) + uint( gl_FragCoord.x );
					gl_FragColor = generateSobolPoint( index );

				}
			`})}},se=class{generate(t,e=256){let r=new $n(e,e,{type:Wn,format:Xn,minFilter:xi,magFilter:xi,generateMipmaps:!1}),n=t.getRenderTarget();t.setRenderTarget(r);let a=new X(new ur);return a.material.resolution.set(e,e),a.render(t),t.setRenderTarget(n),a.dispose(),r}};function*Jn(){let{_renderer:o,_fsQuad:t,_blendQuad:e,_primaryTarget:r,_blendTargets:n,_sobolTarget:a,_subframe:s,alpha:i,camera:c,material:d}=this,m=new pr,u=new pr,l=e.material,[g,y]=n;for(;;){i?(l.opacity=this._opacityFactor/(this._samples+1),d.blending=Zn,d.opacity=1):(d.opacity=this._opacityFactor/(this._samples+1),d.blending=Kn);let[x,h,p,f]=s,v=r.width,T=r.height;d.resolution.set(v*p,T*f),d.sobolTexture=a.texture,d.stratifiedTexture.init(20,d.bounces+d.transmissiveBounces+5),d.stratifiedTexture.next(),d.seed++;let b=this.tiles.x||1,w=this.tiles.y||1,S=b*w,I=Math.ceil(v*p),A=Math.ceil(T*f),_=Math.floor(x*v),M=Math.floor(h*T),R=Math.ceil(I/b),F=Math.ceil(A/w);for(let P=0;P<w;P++)for(let D=0;D<b;D++){d.cameraWorldMatrix.copy(c.matrixWorld),d.invProjectionMatrix.copy(c.projectionMatrixInverse);let B=0;c.projectionMatrix.elements[15]>0&&(B=1),c.isEquirectCamera&&(B=2),d.setDefine("CAMERA_TYPE",B);let q=o.getRenderTarget(),at=o.autoClear,ct=o.getScissorTest();o.getScissor(m),o.getViewport(u);let ar=D,mi=P;if(!this.stableTiles){let cr=this._currentTile%(b*w);ar=cr%b,mi=~~(cr/b),this._currentTile=cr+1}let di=w-mi-1;r.scissor.set(_+ar*R,M+di*F,Math.min(R,I-ar*R),Math.min(F,A-di*F)),r.viewport.set(_,M,I,A),o.setRenderTarget(r),o.setScissorTest(!0),o.autoClear=!1,t.render(o),o.setViewport(u),o.setScissor(m),o.setScissorTest(ct),o.setRenderTarget(q),o.autoClear=at,i&&(l.target1=g.texture,l.target2=r.texture,o.setRenderTarget(y),e.render(o),o.setRenderTarget(q)),this._samples+=1/S,D===b-1&&P===w-1&&(this._samples=Math.round(this._samples)),yield}[g,y]=[y,g]}}var vi=new jn,gr=class{get material(){return this._fsQuad.material}set material(t){this._fsQuad.material=t}get target(){return this._alpha?this._blendTargets[1]:this._primaryTarget}set alpha(t){this._alpha!==t&&(t||(this._blendTargets[0].dispose(),this._blendTargets[1].dispose()),this._alpha=t,this.reset())}get alpha(){return this._alpha}get samples(){return this._samples}constructor(t){this.camera=null,this.tiles=new Qn(1,1),this.stableNoise=!1,this.stableTiles=!0,this._samples=0,this._subframe=new pr(0,0,1,1),this._opacityFactor=1,this._renderer=t,this._alpha=!1,this._fsQuad=new X(null),this._blendQuad=new X(new re),this._task=null,this._currentTile=0,this._sobolTarget=new se().generate(t);let e=t.extensions.get("OES_texture_float_linear");this._primaryTarget=new hr(1,1,{format:fr,type:e?mr:dr}),this._blendTargets=[new hr(1,1,{format:fr,type:e?mr:dr}),new hr(1,1,{format:fr,type:e?mr:dr})]}setSize(t,e){t=Math.ceil(t),e=Math.ceil(e),!(this._primaryTarget.width===t&&this._primaryTarget.height===e)&&(this._primaryTarget.setSize(t,e),this._blendTargets[0].setSize(t,e),this._blendTargets[1].setSize(t,e),this.reset())}dispose(){this._primaryTarget.dispose(),this._blendTargets[0].dispose(),this._blendTargets[1].dispose(),this._sobolTarget.dispose(),this._fsQuad.dispose(),this._blendQuad.dispose(),this._task=null}reset(){let{_renderer:t,_primaryTarget:e,_blendTargets:r}=this,n=t.getRenderTarget(),a=t.getClearAlpha();t.getClearColor(vi),t.setRenderTarget(e),t.setClearColor(0,0),t.clearColor(),t.setRenderTarget(r[0]),t.setClearColor(0,0),t.clearColor(),t.setRenderTarget(r[1]),t.setClearColor(0,0),t.clearColor(),t.setClearColor(vi,a),t.setRenderTarget(n),this._samples=0,this._task=null,this.stableNoise&&(this.material.seed=0)}update(){this._task||(this._task=Jn.call(this)),this._task.next()}};import{BufferGeometry as Kr,MeshBasicMaterial as da,BufferAttribute as ha,Mesh as pa}from"three";import{BufferAttribute as Ws,Box3 as go,FrontSide as ho}from"three";var yi=Math.pow(2,-24),ae=Symbol("SKIP_GENERATION");import{BufferAttribute as ts}from"three";function xr(o){return o.index?o.index.count:o.attributes.position.count}function Z(o){return xr(o)/3}function vr(o,t=ArrayBuffer){return o>65535?new Uint32Array(new t(4*o)):new Uint16Array(new t(2*o))}function bi(o,t){if(!o.index){let e=o.attributes.position.count,r=t.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,n=vr(e,r);o.setIndex(new ts(n,1));for(let a=0;a<e;a++)n[a]=a}}function yr(o){let t=Z(o),e=o.drawRange,r=e.start/3,n=(e.start+e.count)/3,a=Math.max(0,r),s=Math.min(t,n)-a;return[{offset:Math.floor(a),count:Math.floor(s)}]}function br(o){if(!o.groups||!o.groups.length)return yr(o);let t=[],e=new Set,r=o.drawRange,n=r.start/3,a=(r.start+r.count)/3;for(let i of o.groups){let c=i.start/3,d=(i.start+i.count)/3;e.add(Math.max(n,c)),e.add(Math.min(a,d))}let s=Array.from(e.values()).sort((i,c)=>i-c);for(let i=0;i<s.length-1;i++){let c=s[i],d=s[i+1];t.push({offset:Math.floor(c),count:Math.floor(d-c)})}return t}function Ti(o){if(o.groups.length===0)return!1;let t=Z(o),e=br(o).sort((a,s)=>a.offset-s.offset),r=e[e.length-1];r.count=Math.min(t-r.offset,r.count);let n=0;return e.forEach(({count:a})=>n+=a),t!==n}function ce(o,t,e,r,n){let a=1/0,s=1/0,i=1/0,c=-1/0,d=-1/0,m=-1/0,u=1/0,l=1/0,g=1/0,y=-1/0,x=-1/0,h=-1/0;for(let p=t*6,f=(t+e)*6;p<f;p+=6){let v=o[p+0],T=o[p+1],b=v-T,w=v+T;b<a&&(a=b),w>c&&(c=w),v<u&&(u=v),v>y&&(y=v);let S=o[p+2],I=o[p+3],A=S-I,_=S+I;A<s&&(s=A),_>d&&(d=_),S<l&&(l=S),S>x&&(x=S);let M=o[p+4],R=o[p+5],F=M-R,P=M+R;F<i&&(i=F),P>m&&(m=P),M<g&&(g=M),M>h&&(h=M)}r[0]=a,r[1]=s,r[2]=i,r[3]=c,r[4]=d,r[5]=m,n[0]=u,n[1]=l,n[2]=g,n[3]=y,n[4]=x,n[5]=h}function wi(o,t=null,e=null,r=null){let n=o.attributes.position,a=o.index?o.index.array:null,s=Z(o),i=n.normalized,c;t===null?(c=new Float32Array(s*6*4),e=0,r=s):(c=t,e=e||0,r=r||s);let d=n.array,m=n.offset||0,u=3;n.isInterleavedBufferAttribute&&(u=n.data.stride);let l=["getX","getY","getZ"];for(let g=e;g<e+r;g++){let y=g*3,x=g*6,h=y+0,p=y+1,f=y+2;a&&(h=a[h],p=a[p],f=a[f]),i||(h=h*u+m,p=p*u+m,f=f*u+m);for(let v=0;v<3;v++){let T,b,w;i?(T=n[l[v]](h),b=n[l[v]](p),w=n[l[v]](f)):(T=d[h+v],b=d[p+v],w=d[f+v]);let S=T;b<S&&(S=b),w<S&&(S=w);let I=T;b>I&&(I=b),w>I&&(I=w);let A=(I-S)/2,_=v*2;c[x+_+0]=S+A,c[x+_+1]=A+(Math.abs(S)+A)*yi}}return c}function E(o,t,e){return e.min.x=t[o],e.min.y=t[o+1],e.min.z=t[o+2],e.max.x=t[o+3],e.max.y=t[o+4],e.max.z=t[o+5],e}function Tr(o){let t=-1,e=-1/0;for(let r=0;r<3;r++){let n=o[r+3]-o[r];n>e&&(e=n,t=r)}return t}function wr(o,t){t.set(o)}function Sr(o,t,e){let r,n;for(let a=0;a<3;a++){let s=a+3;r=o[a],n=t[a],e[a]=r<n?r:n,r=o[s],n=t[s],e[s]=r>n?r:n}}function zt(o,t,e){for(let r=0;r<3;r++){let n=t[o+2*r],a=t[o+2*r+1],s=n-a,i=n+a;s<e[r]&&(e[r]=s),i>e[r+3]&&(e[r+3]=i)}}function xt(o){let t=o[3]-o[0],e=o[4]-o[1],r=o[5]-o[2];return 2*(t*e+e*r+r*t)}var K=32,rs=(o,t)=>o.candidate-t.candidate,tt=new Array(K).fill().map(()=>({count:0,bounds:new Float32Array(6),rightCacheBounds:new Float32Array(6),leftCacheBounds:new Float32Array(6),candidate:0})),le=new Float32Array(6);function Ri(o,t,e,r,n,a){let s=-1,i=0;if(a===0)s=Tr(t),s!==-1&&(i=(t[s]+t[s+3])/2);else if(a===1)s=Tr(o),s!==-1&&(i=is(e,r,n,s));else if(a===2){let c=xt(o),d=1.25*n,m=r*6,u=(r+n)*6;for(let l=0;l<3;l++){let g=t[l],h=(t[l+3]-g)/K;if(n<K/4){let p=[...tt];p.length=n;let f=0;for(let T=m;T<u;T+=6,f++){let b=p[f];b.candidate=e[T+2*l],b.count=0;let{bounds:w,leftCacheBounds:S,rightCacheBounds:I}=b;for(let A=0;A<3;A++)I[A]=1/0,I[A+3]=-1/0,S[A]=1/0,S[A+3]=-1/0,w[A]=1/0,w[A+3]=-1/0;zt(T,e,w)}p.sort(rs);let v=n;for(let T=0;T<v;T++){let b=p[T];for(;T+1<v&&p[T+1].candidate===b.candidate;)p.splice(T+1,1),v--}for(let T=m;T<u;T+=6){let b=e[T+2*l];for(let w=0;w<v;w++){let S=p[w];b>=S.candidate?zt(T,e,S.rightCacheBounds):(zt(T,e,S.leftCacheBounds),S.count++)}}for(let T=0;T<v;T++){let b=p[T],w=b.count,S=n-b.count,I=b.leftCacheBounds,A=b.rightCacheBounds,_=0;w!==0&&(_=xt(I)/c);let M=0;S!==0&&(M=xt(A)/c);let R=1+1.25*(_*w+M*S);R<d&&(s=l,d=R,i=b.candidate)}}else{for(let v=0;v<K;v++){let T=tt[v];T.count=0,T.candidate=g+h+v*h;let b=T.bounds;for(let w=0;w<3;w++)b[w]=1/0,b[w+3]=-1/0}for(let v=m;v<u;v+=6){let w=~~((e[v+2*l]-g)/h);w>=K&&(w=K-1);let S=tt[w];S.count++,zt(v,e,S.bounds)}let p=tt[K-1];wr(p.bounds,p.rightCacheBounds);for(let v=K-2;v>=0;v--){let T=tt[v],b=tt[v+1];Sr(T.bounds,b.rightCacheBounds,T.rightCacheBounds)}let f=0;for(let v=0;v<K-1;v++){let T=tt[v],b=T.count,w=T.bounds,I=tt[v+1].rightCacheBounds;b!==0&&(f===0?wr(w,le):Sr(w,le,le)),f+=b;let A=0,_=0;f!==0&&(A=xt(le)/c);let M=n-f;M!==0&&(_=xt(I)/c);let R=1+1.25*(A*f+_*M);R<d&&(s=l,d=R,i=T.candidate)}}}}else console.warn(`MeshBVH: Invalid build strategy value ${a} used.`);return{axis:s,pos:i}}function is(o,t,e,r){let n=0;for(let a=t,s=t+e;a<s;a++)n+=o[a*6+r*2];return n/e}var vt=class{constructor(){this.boundingData=new Float32Array(6)}};function _i(o,t,e,r,n,a){let s=r,i=r+n-1,c=a.pos,d=a.axis*2;for(;;){for(;s<=i&&e[s*6+d]<c;)s++;for(;s<=i&&e[i*6+d]>=c;)i--;if(s<i){for(let m=0;m<3;m++){let u=t[s*3+m];t[s*3+m]=t[i*3+m],t[i*3+m]=u}for(let m=0;m<6;m++){let u=e[s*6+m];e[s*6+m]=e[i*6+m],e[i*6+m]=u}s++,i--}else return s}}function Mi(o,t,e,r,n,a){let s=r,i=r+n-1,c=a.pos,d=a.axis*2;for(;;){for(;s<=i&&e[s*6+d]<c;)s++;for(;s<=i&&e[i*6+d]>=c;)i--;if(s<i){let m=o[s];o[s]=o[i],o[i]=m;for(let u=0;u<6;u++){let l=e[s*6+u];e[s*6+u]=e[i*6+u],e[i*6+u]=l}s++,i--}else return s}}function N(o,t){return t[o+15]===65535}function z(o,t){return t[o+6]}function O(o,t){return t[o+14]}function U(o){return o+8}function k(o,t){return t[o+6]}function yt(o,t){return t[o+7]}var Fi,Ot,ue,Pi,os=Math.pow(2,32);function fe(o){return"count"in o?1:1+fe(o.left)+fe(o.right)}function Di(o,t,e){return Fi=new Float32Array(e),Ot=new Uint32Array(e),ue=new Uint16Array(e),Pi=new Uint8Array(e),Ar(o,t)}function Ar(o,t){let e=o/4,r=o/2,n="count"in t,a=t.boundingData;for(let s=0;s<6;s++)Fi[e+s]=a[s];if(n)if(t.buffer){let s=t.buffer;Pi.set(new Uint8Array(s),o);for(let i=o,c=o+s.byteLength;i<c;i+=32){let d=i/2;N(d,ue)||(Ot[i/4+6]+=e)}return o+s.byteLength}else{let s=t.offset,i=t.count;return Ot[e+6]=s,ue[r+14]=i,ue[r+15]=65535,o+32}else{let s=t.left,i=t.right,c=t.splitAxis,d;if(d=Ar(o+32,s),d/4>os)throw new Error("MeshBVH: Cannot store child pointer greater than 32 bits.");return Ot[e+6]=d/4,d=Ar(d,i),Ot[e+7]=c,d}}function ns(o,t){let e=(o.index?o.index.count:o.attributes.position.count)/3,r=e>2**16,n=r?4:2,a=t?new SharedArrayBuffer(e*n):new ArrayBuffer(e*n),s=r?new Uint32Array(a):new Uint16Array(a);for(let i=0,c=s.length;i<c;i++)s[i]=i;return s}function ss(o,t,e,r,n){let{maxDepth:a,verbose:s,maxLeafTris:i,strategy:c,onProgress:d,indirect:m}=n,u=o._indirectBuffer,l=o.geometry,g=l.index?l.index.array:null,y=m?Mi:_i,x=Z(l),h=new Float32Array(6),p=!1,f=new vt;return ce(t,e,r,f.boundingData,h),T(f,e,r,h),f;function v(b){d&&d(b/x)}function T(b,w,S,I=null,A=0){if(!p&&A>=a&&(p=!0,s&&(console.warn(`MeshBVH: Max depth of ${a} reached when generating BVH. Consider increasing maxDepth.`),console.warn(l))),S<=i||A>=a)return v(w+S),b.offset=w,b.count=S,b;let _=Ri(b.boundingData,I,t,w,S,c);if(_.axis===-1)return v(w+S),b.offset=w,b.count=S,b;let M=y(u,g,t,w,S,_);if(M===w||M===w+S)v(w+S),b.offset=w,b.count=S;else{b.splitAxis=_.axis;let R=new vt,F=w,P=M-w;b.left=R,ce(t,F,P,R.boundingData,h),T(R,F,P,h,A+1);let D=new vt,B=M,q=S-P;b.right=D,ce(t,B,q,D.boundingData,h),T(D,B,q,h,A+1)}return b}}function Ci(o,t){let e=o.geometry;t.indirect&&(o._indirectBuffer=ns(e,t.useSharedArrayBuffer),Ti(e)&&!t.verbose&&console.warn('MeshBVH: Provided geometry contains groups that do not fully span the vertex contents while using the "indirect" option. BVH may incorrectly report intersections on unrendered portions of the geometry.')),o._indirectBuffer||bi(e,t);let r=t.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,n=wi(e),a=t.indirect?yr(e):br(e);o._roots=a.map(s=>{let i=ss(o,n,s.offset,s.count,t),c=fe(i),d=new r(32*c);return Di(0,i,d),d})}import{Vector3 as rt,Matrix4 as Ei,Line3 as Li}from"three";import{Vector3 as as}from"three";var W=class{constructor(){this.min=1/0,this.max=-1/0}setFromPointsField(t,e){let r=1/0,n=-1/0;for(let a=0,s=t.length;a<s;a++){let c=t[a][e];r=c<r?c:r,n=c>n?c:n}this.min=r,this.max=n}setFromPoints(t,e){let r=1/0,n=-1/0;for(let a=0,s=e.length;a<s;a++){let i=e[a],c=t.dot(i);r=c<r?c:r,n=c>n?c:n}this.min=r,this.max=n}isSeparated(t){return this.min>t.max||t.min>this.max}};W.prototype.setFromBox=(function(){let o=new as;return function(e,r){let n=r.min,a=r.max,s=1/0,i=-1/0;for(let c=0;c<=1;c++)for(let d=0;d<=1;d++)for(let m=0;m<=1;m++){o.x=n.x*c+a.x*(1-c),o.y=n.y*d+a.y*(1-d),o.z=n.z*m+a.z*(1-m);let u=e.dot(o);s=Math.min(u,s),i=Math.max(u,i)}this.min=s,this.max=i}})();var xl=(function(){let o=new W;return function(e,r){let n=e.points,a=e.satAxes,s=e.satBounds,i=r.points,c=r.satAxes,d=r.satBounds;for(let m=0;m<3;m++){let u=s[m],l=a[m];if(o.setFromPoints(l,i),u.isSeparated(o))return!1}for(let m=0;m<3;m++){let u=d[m],l=c[m];if(o.setFromPoints(l,n),u.isSeparated(o))return!1}}})();import{Triangle as ms,Vector3 as Y,Line3 as bt,Sphere as ds,Plane as hs}from"three";import{Vector3 as lt,Vector2 as cs,Plane as ls,Line3 as us}from"three";var fs=(function(){let o=new lt,t=new lt,e=new lt;return function(n,a,s){let i=n.start,c=o,d=a.start,m=t;e.subVectors(i,d),o.subVectors(n.end,n.start),t.subVectors(a.end,a.start);let u=e.dot(m),l=m.dot(c),g=m.dot(m),y=e.dot(c),h=c.dot(c)*g-l*l,p,f;h!==0?p=(u*l-y*g)/h:p=0,f=(u+p*l)/g,s.x=p,s.y=f}})(),Ht=(function(){let o=new cs,t=new lt,e=new lt;return function(n,a,s,i){fs(n,a,o);let c=o.x,d=o.y;if(c>=0&&c<=1&&d>=0&&d<=1){n.at(c,s),a.at(d,i);return}else if(c>=0&&c<=1){d<0?a.at(0,i):a.at(1,i),n.closestPointToPoint(i,!0,s);return}else if(d>=0&&d<=1){c<0?n.at(0,s):n.at(1,s),a.closestPointToPoint(s,!0,i);return}else{let m;c<0?m=n.start:m=n.end;let u;d<0?u=a.start:u=a.end;let l=t,g=e;if(n.closestPointToPoint(u,!0,t),a.closestPointToPoint(m,!0,e),l.distanceToSquared(u)<=g.distanceToSquared(m)){s.copy(l),i.copy(u);return}else{s.copy(m),i.copy(g);return}}}})(),Bi=(function(){let o=new lt,t=new lt,e=new ls,r=new us;return function(a,s){let{radius:i,center:c}=a,{a:d,b:m,c:u}=s;if(r.start=d,r.end=m,r.closestPointToPoint(c,!0,o).distanceTo(c)<=i||(r.start=d,r.end=u,r.closestPointToPoint(c,!0,o).distanceTo(c)<=i)||(r.start=m,r.end=u,r.closestPointToPoint(c,!0,o).distanceTo(c)<=i))return!0;let x=s.getPlane(e);if(Math.abs(x.distanceToPoint(c))<=i){let p=x.projectPoint(c,t);if(s.containsPoint(p))return!0}return!1}})();var ps=1e-15;function Ir(o){return Math.abs(o)<ps}var V=class extends ms{constructor(...t){super(...t),this.isExtendedTriangle=!0,this.satAxes=new Array(4).fill().map(()=>new Y),this.satBounds=new Array(4).fill().map(()=>new W),this.points=[this.a,this.b,this.c],this.sphere=new ds,this.plane=new hs,this.needsUpdate=!0}intersectsSphere(t){return Bi(t,this)}update(){let t=this.a,e=this.b,r=this.c,n=this.points,a=this.satAxes,s=this.satBounds,i=a[0],c=s[0];this.getNormal(i),c.setFromPoints(i,n);let d=a[1],m=s[1];d.subVectors(t,e),m.setFromPoints(d,n);let u=a[2],l=s[2];u.subVectors(e,r),l.setFromPoints(u,n);let g=a[3],y=s[3];g.subVectors(r,t),y.setFromPoints(g,n),this.sphere.setFromPoints(this.points),this.plane.setFromNormalAndCoplanarPoint(i,t),this.needsUpdate=!1}};V.prototype.closestPointToSegment=(function(){let o=new Y,t=new Y,e=new bt;return function(n,a=null,s=null){let{start:i,end:c}=n,d=this.points,m,u=1/0;for(let l=0;l<3;l++){let g=(l+1)%3;e.start.copy(d[l]),e.end.copy(d[g]),Ht(e,n,o,t),m=o.distanceToSquared(t),m<u&&(u=m,a&&a.copy(o),s&&s.copy(t))}return this.closestPointToPoint(i,o),m=i.distanceToSquared(o),m<u&&(u=m,a&&a.copy(o),s&&s.copy(i)),this.closestPointToPoint(c,o),m=c.distanceToSquared(o),m<u&&(u=m,a&&a.copy(o),s&&s.copy(c)),Math.sqrt(u)}})();V.prototype.intersectsTriangle=(function(){let o=new V,t=new Array(3),e=new Array(3),r=new W,n=new W,a=new Y,s=new Y,i=new Y,c=new Y,d=new Y,m=new bt,u=new bt,l=new bt,g=new Y;function y(x,h,p){let f=x.points,v=0,T=-1;for(let b=0;b<3;b++){let{start:w,end:S}=m;w.copy(f[b]),S.copy(f[(b+1)%3]),m.delta(s);let I=Ir(h.distanceToPoint(w));if(Ir(h.normal.dot(s))&&I){p.copy(m),v=2;break}let A=h.intersectLine(m,g);if(!A&&I&&g.copy(w),(A||I)&&!Ir(g.distanceTo(S))){if(v<=1)(v===1?p.start:p.end).copy(g),I&&(T=v);else if(v>=2){(T===1?p.start:p.end).copy(g),v=2;break}if(v++,v===2&&T===-1)break}}return v}return function(h,p=null,f=!1){this.needsUpdate&&this.update(),h.isExtendedTriangle?h.needsUpdate&&h.update():(o.copy(h),o.update(),h=o);let v=this.plane,T=h.plane;if(Math.abs(v.normal.dot(T.normal))>1-1e-10){let b=this.satBounds,w=this.satAxes;e[0]=h.a,e[1]=h.b,e[2]=h.c;for(let A=0;A<4;A++){let _=b[A],M=w[A];if(r.setFromPoints(M,e),_.isSeparated(r))return!1}let S=h.satBounds,I=h.satAxes;t[0]=this.a,t[1]=this.b,t[2]=this.c;for(let A=0;A<4;A++){let _=S[A],M=I[A];if(r.setFromPoints(M,t),_.isSeparated(r))return!1}for(let A=0;A<4;A++){let _=w[A];for(let M=0;M<4;M++){let R=I[M];if(a.crossVectors(_,R),r.setFromPoints(a,t),n.setFromPoints(a,e),r.isSeparated(n))return!1}}return p&&(f||console.warn("ExtendedTriangle.intersectsTriangle: Triangles are coplanar which does not support an output edge. Setting edge to 0, 0, 0."),p.start.set(0,0,0),p.end.set(0,0,0)),!0}else{let b=y(this,T,u);if(b===1&&h.containsPoint(u.end))return p&&(p.start.copy(u.end),p.end.copy(u.end)),!0;if(b!==2)return!1;let w=y(h,v,l);if(w===1&&this.containsPoint(l.end))return p&&(p.start.copy(l.end),p.end.copy(l.end)),!0;if(w!==2)return!1;if(u.delta(i),l.delta(c),i.dot(c)<0){let F=l.start;l.start=l.end,l.end=F}let S=u.start.dot(i),I=u.end.dot(i),A=l.start.dot(i),_=l.end.dot(i),M=I<A,R=S<_;return S!==_&&A!==I&&M===R?!1:(p&&(d.subVectors(u.start,l.start),d.dot(i)>0?p.start.copy(u.start):p.start.copy(l.start),d.subVectors(u.end,l.end),d.dot(i)<0?p.end.copy(u.end):p.end.copy(l.end)),!0)}}})();V.prototype.distanceToPoint=(function(){let o=new Y;return function(e){return this.closestPointToPoint(e,o),e.distanceTo(o)}})();V.prototype.distanceToTriangle=(function(){let o=new Y,t=new Y,e=["a","b","c"],r=new bt,n=new bt;return function(s,i=null,c=null){let d=i||c?r:null;if(this.intersectsTriangle(s,d))return(i||c)&&(i&&d.getCenter(i),c&&d.getCenter(c)),0;let m=1/0;for(let u=0;u<3;u++){let l,g=e[u],y=s[g];this.closestPointToPoint(y,o),l=y.distanceToSquared(o),l<m&&(m=l,i&&i.copy(o),c&&c.copy(y));let x=this[g];s.closestPointToPoint(x,o),l=x.distanceToSquared(o),l<m&&(m=l,i&&i.copy(x),c&&c.copy(o))}for(let u=0;u<3;u++){let l=e[u],g=e[(u+1)%3];r.set(this[l],this[g]);for(let y=0;y<3;y++){let x=e[y],h=e[(y+1)%3];n.set(s[x],s[h]),Ht(r,n,o,t);let p=o.distanceToSquared(t);p<m&&(m=p,i&&i.copy(o),c&&c.copy(t))}}return Math.sqrt(m)}})();var H=class{constructor(t,e,r){this.isOrientedBox=!0,this.min=new rt,this.max=new rt,this.matrix=new Ei,this.invMatrix=new Ei,this.points=new Array(8).fill().map(()=>new rt),this.satAxes=new Array(3).fill().map(()=>new rt),this.satBounds=new Array(3).fill().map(()=>new W),this.alignedSatBounds=new Array(3).fill().map(()=>new W),this.needsUpdate=!1,t&&this.min.copy(t),e&&this.max.copy(e),r&&this.matrix.copy(r)}set(t,e,r){this.min.copy(t),this.max.copy(e),this.matrix.copy(r),this.needsUpdate=!0}copy(t){this.min.copy(t.min),this.max.copy(t.max),this.matrix.copy(t.matrix),this.needsUpdate=!0}};H.prototype.update=(function(){return function(){let t=this.matrix,e=this.min,r=this.max,n=this.points;for(let d=0;d<=1;d++)for(let m=0;m<=1;m++)for(let u=0;u<=1;u++){let l=1*d|2*m|4*u,g=n[l];g.x=d?r.x:e.x,g.y=m?r.y:e.y,g.z=u?r.z:e.z,g.applyMatrix4(t)}let a=this.satBounds,s=this.satAxes,i=n[0];for(let d=0;d<3;d++){let m=s[d],u=a[d],l=1<<d,g=n[l];m.subVectors(i,g),u.setFromPoints(m,n)}let c=this.alignedSatBounds;c[0].setFromPointsField(n,"x"),c[1].setFromPointsField(n,"y"),c[2].setFromPointsField(n,"z"),this.invMatrix.copy(this.matrix).invert(),this.needsUpdate=!1}})();H.prototype.intersectsBox=(function(){let o=new W;return function(e){this.needsUpdate&&this.update();let r=e.min,n=e.max,a=this.satBounds,s=this.satAxes,i=this.alignedSatBounds;if(o.min=r.x,o.max=n.x,i[0].isSeparated(o)||(o.min=r.y,o.max=n.y,i[1].isSeparated(o))||(o.min=r.z,o.max=n.z,i[2].isSeparated(o)))return!1;for(let c=0;c<3;c++){let d=s[c],m=a[c];if(o.setFromBox(d,e),m.isSeparated(o))return!1}return!0}})();H.prototype.intersectsTriangle=(function(){let o=new V,t=new Array(3),e=new W,r=new W,n=new rt;return function(s){this.needsUpdate&&this.update(),s.isExtendedTriangle?s.needsUpdate&&s.update():(o.copy(s),o.update(),s=o);let i=this.satBounds,c=this.satAxes;t[0]=s.a,t[1]=s.b,t[2]=s.c;for(let l=0;l<3;l++){let g=i[l],y=c[l];if(e.setFromPoints(y,t),g.isSeparated(e))return!1}let d=s.satBounds,m=s.satAxes,u=this.points;for(let l=0;l<3;l++){let g=d[l],y=m[l];if(e.setFromPoints(y,u),g.isSeparated(e))return!1}for(let l=0;l<3;l++){let g=c[l];for(let y=0;y<4;y++){let x=m[y];if(n.crossVectors(g,x),e.setFromPoints(n,t),r.setFromPoints(n,u),e.isSeparated(r))return!1}}return!0}})();H.prototype.closestPointToPoint=(function(){return function(t,e){return this.needsUpdate&&this.update(),e.copy(t).applyMatrix4(this.invMatrix).clamp(this.min,this.max).applyMatrix4(this.matrix),e}})();H.prototype.distanceToPoint=(function(){let o=new rt;return function(e){return this.closestPointToPoint(e,o),e.distanceTo(o)}})();H.prototype.distanceToBox=(function(){let o=["x","y","z"],t=new Array(12).fill().map(()=>new Li),e=new Array(12).fill().map(()=>new Li),r=new rt,n=new rt;return function(s,i=0,c=null,d=null){if(this.needsUpdate&&this.update(),this.intersectsBox(s))return(c||d)&&(s.getCenter(n),this.closestPointToPoint(n,r),s.closestPointToPoint(r,n),c&&c.copy(r),d&&d.copy(n)),0;let m=i*i,u=s.min,l=s.max,g=this.points,y=1/0;for(let h=0;h<8;h++){let p=g[h];n.copy(p).clamp(u,l);let f=p.distanceToSquared(n);if(f<y&&(y=f,c&&c.copy(p),d&&d.copy(n),f<m))return Math.sqrt(f)}let x=0;for(let h=0;h<3;h++)for(let p=0;p<=1;p++)for(let f=0;f<=1;f++){let v=(h+1)%3,T=(h+2)%3,b=p<<v|f<<T,w=1<<h|p<<v|f<<T,S=g[b],I=g[w];t[x].set(S,I);let _=o[h],M=o[v],R=o[T],F=e[x],P=F.start,D=F.end;P[_]=u[_],P[M]=p?u[M]:l[M],P[R]=f?u[R]:l[M],D[_]=l[_],D[M]=p?u[M]:l[M],D[R]=f?u[R]:l[M],x++}for(let h=0;h<=1;h++)for(let p=0;p<=1;p++)for(let f=0;f<=1;f++){n.x=h?l.x:u.x,n.y=p?l.y:u.y,n.z=f?l.z:u.z,this.closestPointToPoint(n,r);let v=n.distanceToSquared(r);if(v<y&&(y=v,c&&c.copy(r),d&&d.copy(n),v<m))return Math.sqrt(v)}for(let h=0;h<12;h++){let p=t[h];for(let f=0;f<12;f++){let v=e[f];Ht(p,v,r,n);let T=r.distanceToSquared(n);if(T<y&&(y=T,c&&c.copy(r),d&&d.copy(n),T<m))return Math.sqrt(T)}}return Math.sqrt(y)}})();var it=class{constructor(t){this._getNewPrimitive=t,this._primitives=[]}getPrimitive(){let t=this._primitives;return t.length===0?this._getNewPrimitive():t.pop()}releasePrimitive(t){this._primitives.push(t)}};var Rr=class extends it{constructor(){super(()=>new V)}},G=new Rr;import{Box3 as xs}from"three";var _r=class{constructor(){this.float32Array=null,this.uint16Array=null,this.uint32Array=null;let t=[],e=null;this.setBuffer=r=>{e&&t.push(e),e=r,this.float32Array=new Float32Array(r),this.uint16Array=new Uint16Array(r),this.uint32Array=new Uint32Array(r)},this.clearBuffer=()=>{e=null,this.float32Array=null,this.uint16Array=null,this.uint32Array=null,t.length!==0&&this.setBuffer(t.pop())}}},C=new _r;var ot,wt,Tt=[],de=new it(()=>new xs);function Ni(o,t,e,r,n,a){ot=de.getPrimitive(),wt=de.getPrimitive(),Tt.push(ot,wt),C.setBuffer(o._roots[t]);let s=Mr(0,o.geometry,e,r,n,a);C.clearBuffer(),de.releasePrimitive(ot),de.releasePrimitive(wt),Tt.pop(),Tt.pop();let i=Tt.length;return i>0&&(wt=Tt[i-1],ot=Tt[i-2]),s}function Mr(o,t,e,r,n=null,a=0,s=0){let{float32Array:i,uint16Array:c,uint32Array:d}=C,m=o*2;if(N(m,c)){let l=z(o,d),g=O(m,c);return E(o,i,ot),r(l,g,!1,s,a+o,ot)}else{let _=function(R){let{uint16Array:F,uint32Array:P}=C,D=R*2;for(;!N(D,F);)R=U(R),D=R*2;return z(R,P)},M=function(R){let{uint16Array:F,uint32Array:P}=C,D=R*2;for(;!N(D,F);)R=k(R,P),D=R*2;return z(R,P)+O(D,F)},l=U(o),g=k(o,d),y=l,x=g,h,p,f,v;if(n&&(f=ot,v=wt,E(y,i,f),E(x,i,v),h=n(f),p=n(v),p<h)){y=g,x=l;let R=h;h=p,p=R,f=v}f||(f=ot,E(y,i,f));let T=N(y*2,c),b=e(f,T,h,s+1,a+y),w;if(b===2){let R=_(y),P=M(y)-R;w=r(R,P,!0,s+1,a+y,f)}else w=b&&Mr(y,t,e,r,n,a,s+1);if(w)return!0;v=wt,E(x,i,v);let S=N(x*2,c),I=e(v,S,p,s+1,a+x),A;if(I===2){let R=_(x),P=M(x)-R;A=r(R,P,!0,s+1,a+x,v)}else A=I&&Mr(x,t,e,r,n,a,s+1);return!!A}}import{Vector3 as zi}from"three";var kt=new zi,Fr=new zi;function Oi(o,t,e={},r=0,n=1/0){let a=r*r,s=n*n,i=1/0,c=null;if(o.shapecast({boundsTraverseOrder:m=>(kt.copy(t).clamp(m.min,m.max),kt.distanceToSquared(t)),intersectsBounds:(m,u,l)=>l<i&&l<s,intersectsTriangle:(m,u)=>{m.closestPointToPoint(t,kt);let l=t.distanceToSquared(kt);return l<i&&(Fr.copy(kt),i=l,c=u),l<a}}),i===1/0)return null;let d=Math.sqrt(i);return e.point?e.point.copy(Fr):e.point=Fr.clone(),e.distance=d,e.faceIndex=c,e}import{Vector3 as J,Vector2 as Ut,Triangle as pe,DoubleSide as vs,BackSide as ys}from"three";var St=new J,At=new J,It=new J,ge=new Ut,xe=new Ut,ve=new Ut,Hi=new J,ki=new J,Ui=new J,ye=new J;function bs(o,t,e,r,n,a){let s;return a===ys?s=o.intersectTriangle(r,e,t,!0,n):s=o.intersectTriangle(t,e,r,a!==vs,n),s===null?null:{distance:o.origin.distanceTo(n),point:n.clone()}}function Ts(o,t,e,r,n,a,s,i,c){St.fromBufferAttribute(t,a),At.fromBufferAttribute(t,s),It.fromBufferAttribute(t,i);let d=bs(o,St,At,It,ye,c);if(d){r&&(ge.fromBufferAttribute(r,a),xe.fromBufferAttribute(r,s),ve.fromBufferAttribute(r,i),d.uv=pe.getInterpolation(ye,St,At,It,ge,xe,ve,new Ut)),n&&(ge.fromBufferAttribute(n,a),xe.fromBufferAttribute(n,s),ve.fromBufferAttribute(n,i),d.uv1=pe.getInterpolation(ye,St,At,It,ge,xe,ve,new Ut)),e&&(Hi.fromBufferAttribute(e,a),ki.fromBufferAttribute(e,s),Ui.fromBufferAttribute(e,i),d.normal=pe.getInterpolation(ye,St,At,It,Hi,ki,Ui,new J),d.normal.dot(o.direction)>0&&d.normal.multiplyScalar(-1));let m={a,b:s,c:i,normal:new J,materialIndex:0};pe.getNormal(St,At,It,m.normal),d.face=m,d.faceIndex=a}return d}function Rt(o,t,e,r,n){let a=r*3,s=a+0,i=a+1,c=a+2,d=o.index;o.index&&(s=d.getX(s),i=d.getX(i),c=d.getX(c));let{position:m,normal:u,uv:l,uv1:g}=o.attributes,y=Ts(e,m,u,l,g,s,i,c,t);return y?(y.faceIndex=r,n&&n.push(y),y):null}import{Vector2 as Xl,Vector3 as Yl,Triangle as $l}from"three";function L(o,t,e,r){let n=o.a,a=o.b,s=o.c,i=t,c=t+1,d=t+2;e&&(i=e.getX(i),c=e.getX(c),d=e.getX(d)),n.x=r.getX(i),n.y=r.getY(i),n.z=r.getZ(i),a.x=r.getX(c),a.y=r.getY(c),a.z=r.getZ(c),s.x=r.getX(d),s.y=r.getY(d),s.z=r.getZ(d)}function Vi(o,t,e,r,n,a){let{geometry:s,_indirectBuffer:i}=o;for(let c=r,d=r+n;c<d;c++)Rt(s,t,e,c,a)}function Gi(o,t,e,r,n){let{geometry:a,_indirectBuffer:s}=o,i=1/0,c=null;for(let d=r,m=r+n;d<m;d++){let u;u=Rt(a,t,e,d),u&&u.distance<i&&(c=u,i=u.distance)}return c}function Wi(o,t,e,r,n,a,s){let{geometry:i}=e,{index:c}=i,d=i.attributes.position;for(let m=o,u=t+o;m<u;m++){let l;if(l=m,L(s,l*3,c,d),s.needsUpdate=!0,r(s,l,n,a))return!0}return!1}function qi(o,t=null){t&&Array.isArray(t)&&(t=new Set(t));let e=o.geometry,r=e.index?e.index.array:null,n=e.attributes.position,a,s,i,c,d=0,m=o._roots;for(let l=0,g=m.length;l<g;l++)a=m[l],s=new Uint32Array(a),i=new Uint16Array(a),c=new Float32Array(a),u(0,d),d+=a.byteLength;function u(l,g,y=!1){let x=l*2;if(i[x+15]===65535){let p=s[l+6],f=i[x+14],v=1/0,T=1/0,b=1/0,w=-1/0,S=-1/0,I=-1/0;for(let A=3*p,_=3*(p+f);A<_;A++){let M=r[A],R=n.getX(M),F=n.getY(M),P=n.getZ(M);R<v&&(v=R),R>w&&(w=R),F<T&&(T=F),F>S&&(S=F),P<b&&(b=P),P>I&&(I=P)}return c[l+0]!==v||c[l+1]!==T||c[l+2]!==b||c[l+3]!==w||c[l+4]!==S||c[l+5]!==I?(c[l+0]=v,c[l+1]=T,c[l+2]=b,c[l+3]=w,c[l+4]=S,c[l+5]=I,!0):!1}else{let p=l+8,f=s[l+6],v=p+g,T=f+g,b=y,w=!1,S=!1;t?b||(w=t.has(v),S=t.has(T),b=!w&&!S):(w=!0,S=!0);let I=b||w,A=b||S,_=!1;I&&(_=u(p,g,b));let M=!1;A&&(M=u(f,g,b));let R=_||M;if(R)for(let F=0;F<3;F++){let P=p+F,D=f+F,B=c[P],q=c[P+3],at=c[D],ct=c[D+3];c[l+F]=B<at?B:at,c[l+F+3]=q>ct?q:ct}return R}}}import{Vector3 as Ss}from"three";import{Box3 as ws}from"three";var Xi=new ws;function $(o,t,e,r){return E(o,t,Xi),e.intersectBox(Xi,r)}function Yi(o,t,e,r,n,a){let{geometry:s,_indirectBuffer:i}=o;for(let c=r,d=r+n;c<d;c++){let m=i?i[c]:c;Rt(s,t,e,m,a)}}function $i(o,t,e,r,n){let{geometry:a,_indirectBuffer:s}=o,i=1/0,c=null;for(let d=r,m=r+n;d<m;d++){let u;u=Rt(a,t,e,s?s[d]:d),u&&u.distance<i&&(c=u,i=u.distance)}return c}function ji(o,t,e,r,n,a,s){let{geometry:i}=e,{index:c}=i,d=i.attributes.position;for(let m=o,u=t+o;m<u;m++){let l;if(l=e.resolveTriangleIndex(m),L(s,l*3,c,d),s.needsUpdate=!0,r(s,l,n,a))return!0}return!1}var Qi=new Ss;function Zi(o,t,e,r,n){C.setBuffer(o._roots[t]),Pr(0,o,e,r,n),C.clearBuffer()}function Pr(o,t,e,r,n){let{float32Array:a,uint16Array:s,uint32Array:i}=C,c=o*2;if(N(c,s)){let m=z(o,i),u=O(c,s);Vi(t,e,r,m,u,n)}else{let m=U(o);$(m,a,r,Qi)&&Pr(m,t,e,r,n);let u=k(o,i);$(u,a,r,Qi)&&Pr(u,t,e,r,n)}}import{Vector3 as As}from"three";var Ki=new As,Is=["x","y","z"];function Ji(o,t,e,r){C.setBuffer(o._roots[t]);let n=Dr(0,o,e,r);return C.clearBuffer(),n}function Dr(o,t,e,r){let{float32Array:n,uint16Array:a,uint32Array:s}=C,i=o*2;if(N(i,a)){let d=z(o,s),m=O(i,a);return Gi(t,e,r,d,m)}else{let d=yt(o,s),m=Is[d],l=r.direction[m]>=0,g,y;l?(g=U(o),y=k(o,s)):(g=k(o,s),y=U(o));let h=$(g,n,r,Ki)?Dr(g,t,e,r):null;if(h){let v=h.point[m];if(l?v<=n[y+d]:v>=n[y+d+3])return h}let f=$(y,n,r,Ki)?Dr(y,t,e,r):null;return h&&f?h.distance<=f.distance?h:f:h||f||null}}import{Box3 as Rs,Matrix4 as _s}from"three";var be=new Rs,_t=new V,Mt=new V,Vt=new _s,to=new H,Te=new H;function eo(o,t,e,r){C.setBuffer(o._roots[t]);let n=Cr(0,o,e,r);return C.clearBuffer(),n}function Cr(o,t,e,r,n=null){let{float32Array:a,uint16Array:s,uint32Array:i}=C,c=o*2;if(n===null&&(e.boundingBox||e.computeBoundingBox(),to.set(e.boundingBox.min,e.boundingBox.max,r),n=to),N(c,s)){let m=t.geometry,u=m.index,l=m.attributes.position,g=e.index,y=e.attributes.position,x=z(o,i),h=O(c,s);if(Vt.copy(r).invert(),e.boundsTree)return E(o,a,Te),Te.matrix.copy(Vt),Te.needsUpdate=!0,e.boundsTree.shapecast({intersectsBounds:f=>Te.intersectsBox(f),intersectsTriangle:f=>{f.a.applyMatrix4(r),f.b.applyMatrix4(r),f.c.applyMatrix4(r),f.needsUpdate=!0;for(let v=x*3,T=(h+x)*3;v<T;v+=3)if(L(Mt,v,u,l),Mt.needsUpdate=!0,f.intersectsTriangle(Mt))return!0;return!1}});for(let p=x*3,f=(h+x)*3;p<f;p+=3){L(_t,p,u,l),_t.a.applyMatrix4(Vt),_t.b.applyMatrix4(Vt),_t.c.applyMatrix4(Vt),_t.needsUpdate=!0;for(let v=0,T=g.count;v<T;v+=3)if(L(Mt,v,g,y),Mt.needsUpdate=!0,_t.intersectsTriangle(Mt))return!0}}else{let m=o+8,u=i[o+6];return E(m,a,be),!!(n.intersectsBox(be)&&Cr(m,t,e,r,n)||(E(u,a,be),n.intersectsBox(be)&&Cr(u,t,e,r,n)))}}import{Matrix4 as Ms,Vector3 as Se}from"three";var we=new Ms,Br=new H,Gt=new H,Fs=new Se,Ps=new Se,Ds=new Se,Cs=new Se;function ro(o,t,e,r={},n={},a=0,s=1/0){t.boundingBox||t.computeBoundingBox(),Br.set(t.boundingBox.min,t.boundingBox.max,e),Br.needsUpdate=!0;let i=o.geometry,c=i.attributes.position,d=i.index,m=t.attributes.position,u=t.index,l=G.getPrimitive(),g=G.getPrimitive(),y=Fs,x=Ps,h=null,p=null;n&&(h=Ds,p=Cs);let f=1/0,v=null,T=null;return we.copy(e).invert(),Gt.matrix.copy(we),o.shapecast({boundsTraverseOrder:b=>Br.distanceToBox(b),intersectsBounds:(b,w,S)=>S<f&&S<s?(w&&(Gt.min.copy(b.min),Gt.max.copy(b.max),Gt.needsUpdate=!0),!0):!1,intersectsRange:(b,w)=>{if(t.boundsTree)return t.boundsTree.shapecast({boundsTraverseOrder:I=>Gt.distanceToBox(I),intersectsBounds:(I,A,_)=>_<f&&_<s,intersectsRange:(I,A)=>{for(let _=I,M=I+A;_<M;_++){L(g,3*_,u,m),g.a.applyMatrix4(e),g.b.applyMatrix4(e),g.c.applyMatrix4(e),g.needsUpdate=!0;for(let R=b,F=b+w;R<F;R++){L(l,3*R,d,c),l.needsUpdate=!0;let P=l.distanceToTriangle(g,y,h);if(P<f&&(x.copy(y),p&&p.copy(h),f=P,v=R,T=_),P<a)return!0}}}});{let S=Z(t);for(let I=0,A=S;I<A;I++){L(g,3*I,u,m),g.a.applyMatrix4(e),g.b.applyMatrix4(e),g.c.applyMatrix4(e),g.needsUpdate=!0;for(let _=b,M=b+w;_<M;_++){L(l,3*_,d,c),l.needsUpdate=!0;let R=l.distanceToTriangle(g,y,h);if(R<f&&(x.copy(y),p&&p.copy(h),f=R,v=_,T=I),R<a)return!0}}}}}),G.releasePrimitive(l),G.releasePrimitive(g),f===1/0?null:(r.point?r.point.copy(x):r.point=x.clone(),r.distance=f,r.faceIndex=v,n&&(n.point?n.point.copy(p):n.point=p.clone(),n.point.applyMatrix4(we),x.applyMatrix4(we),n.distance=x.sub(n.point).length(),n.faceIndex=T),r)}function io(o,t=null){t&&Array.isArray(t)&&(t=new Set(t));let e=o.geometry,r=e.index?e.index.array:null,n=e.attributes.position,a,s,i,c,d=0,m=o._roots;for(let l=0,g=m.length;l<g;l++)a=m[l],s=new Uint32Array(a),i=new Uint16Array(a),c=new Float32Array(a),u(0,d),d+=a.byteLength;function u(l,g,y=!1){let x=l*2;if(i[x+15]===65535){let p=s[l+6],f=i[x+14],v=1/0,T=1/0,b=1/0,w=-1/0,S=-1/0,I=-1/0;for(let A=p,_=p+f;A<_;A++){let M=3*o.resolveTriangleIndex(A);for(let R=0;R<3;R++){let F=M+R;F=r?r[F]:F;let P=n.getX(F),D=n.getY(F),B=n.getZ(F);P<v&&(v=P),P>w&&(w=P),D<T&&(T=D),D>S&&(S=D),B<b&&(b=B),B>I&&(I=B)}}return c[l+0]!==v||c[l+1]!==T||c[l+2]!==b||c[l+3]!==w||c[l+4]!==S||c[l+5]!==I?(c[l+0]=v,c[l+1]=T,c[l+2]=b,c[l+3]=w,c[l+4]=S,c[l+5]=I,!0):!1}else{let p=l+8,f=s[l+6],v=p+g,T=f+g,b=y,w=!1,S=!1;t?b||(w=t.has(v),S=t.has(T),b=!w&&!S):(w=!0,S=!0);let I=b||w,A=b||S,_=!1;I&&(_=u(p,g,b));let M=!1;A&&(M=u(f,g,b));let R=_||M;if(R)for(let F=0;F<3;F++){let P=p+F,D=f+F,B=c[P],q=c[P+3],at=c[D],ct=c[D+3];c[l+F]=B<at?B:at,c[l+F+3]=q>ct?q:ct}return R}}}import{Vector3 as Bs}from"three";var oo=new Bs;function no(o,t,e,r,n){C.setBuffer(o._roots[t]),Er(0,o,e,r,n),C.clearBuffer()}function Er(o,t,e,r,n){let{float32Array:a,uint16Array:s,uint32Array:i}=C,c=o*2;if(N(c,s)){let m=z(o,i),u=O(c,s);Yi(t,e,r,m,u,n)}else{let m=U(o);$(m,a,r,oo)&&Er(m,t,e,r,n);let u=k(o,i);$(u,a,r,oo)&&Er(u,t,e,r,n)}}import{Vector3 as Es}from"three";var so=new Es,Ls=["x","y","z"];function ao(o,t,e,r){C.setBuffer(o._roots[t]);let n=Lr(0,o,e,r);return C.clearBuffer(),n}function Lr(o,t,e,r){let{float32Array:n,uint16Array:a,uint32Array:s}=C,i=o*2;if(N(i,a)){let d=z(o,s),m=O(i,a);return $i(t,e,r,d,m)}else{let d=yt(o,s),m=Ls[d],l=r.direction[m]>=0,g,y;l?(g=U(o),y=k(o,s)):(g=k(o,s),y=U(o));let h=$(g,n,r,so)?Lr(g,t,e,r):null;if(h){let v=h.point[m];if(l?v<=n[y+d]:v>=n[y+d+3])return h}let f=$(y,n,r,so)?Lr(y,t,e,r):null;return h&&f?h.distance<=f.distance?h:f:h||f||null}}import{Box3 as Ns,Matrix4 as zs}from"three";var Ae=new Ns,Ft=new V,Pt=new V,Wt=new zs,co=new H,Ie=new H;function lo(o,t,e,r){C.setBuffer(o._roots[t]);let n=Nr(0,o,e,r);return C.clearBuffer(),n}function Nr(o,t,e,r,n=null){let{float32Array:a,uint16Array:s,uint32Array:i}=C,c=o*2;if(n===null&&(e.boundingBox||e.computeBoundingBox(),co.set(e.boundingBox.min,e.boundingBox.max,r),n=co),N(c,s)){let m=t.geometry,u=m.index,l=m.attributes.position,g=e.index,y=e.attributes.position,x=z(o,i),h=O(c,s);if(Wt.copy(r).invert(),e.boundsTree)return E(o,a,Ie),Ie.matrix.copy(Wt),Ie.needsUpdate=!0,e.boundsTree.shapecast({intersectsBounds:f=>Ie.intersectsBox(f),intersectsTriangle:f=>{f.a.applyMatrix4(r),f.b.applyMatrix4(r),f.c.applyMatrix4(r),f.needsUpdate=!0;for(let v=x,T=h+x;v<T;v++)if(L(Pt,3*t.resolveTriangleIndex(v),u,l),Pt.needsUpdate=!0,f.intersectsTriangle(Pt))return!0;return!1}});for(let p=x,f=h+x;p<f;p++){let v=t.resolveTriangleIndex(p);L(Ft,3*v,u,l),Ft.a.applyMatrix4(Wt),Ft.b.applyMatrix4(Wt),Ft.c.applyMatrix4(Wt),Ft.needsUpdate=!0;for(let T=0,b=g.count;T<b;T+=3)if(L(Pt,T,g,y),Pt.needsUpdate=!0,Ft.intersectsTriangle(Pt))return!0}}else{let m=o+8,u=i[o+6];return E(m,a,Ae),!!(n.intersectsBox(Ae)&&Nr(m,t,e,r,n)||(E(u,a,Ae),n.intersectsBox(Ae)&&Nr(u,t,e,r,n)))}}import{Matrix4 as Os,Vector3 as _e}from"three";var Re=new Os,zr=new H,qt=new H,Hs=new _e,ks=new _e,Us=new _e,Vs=new _e;function uo(o,t,e,r={},n={},a=0,s=1/0){t.boundingBox||t.computeBoundingBox(),zr.set(t.boundingBox.min,t.boundingBox.max,e),zr.needsUpdate=!0;let i=o.geometry,c=i.attributes.position,d=i.index,m=t.attributes.position,u=t.index,l=G.getPrimitive(),g=G.getPrimitive(),y=Hs,x=ks,h=null,p=null;n&&(h=Us,p=Vs);let f=1/0,v=null,T=null;return Re.copy(e).invert(),qt.matrix.copy(Re),o.shapecast({boundsTraverseOrder:b=>zr.distanceToBox(b),intersectsBounds:(b,w,S)=>S<f&&S<s?(w&&(qt.min.copy(b.min),qt.max.copy(b.max),qt.needsUpdate=!0),!0):!1,intersectsRange:(b,w)=>{if(t.boundsTree){let S=t.boundsTree;return S.shapecast({boundsTraverseOrder:I=>qt.distanceToBox(I),intersectsBounds:(I,A,_)=>_<f&&_<s,intersectsRange:(I,A)=>{for(let _=I,M=I+A;_<M;_++){let R=S.resolveTriangleIndex(_);L(g,3*R,u,m),g.a.applyMatrix4(e),g.b.applyMatrix4(e),g.c.applyMatrix4(e),g.needsUpdate=!0;for(let F=b,P=b+w;F<P;F++){let D=o.resolveTriangleIndex(F);L(l,3*D,d,c),l.needsUpdate=!0;let B=l.distanceToTriangle(g,y,h);if(B<f&&(x.copy(y),p&&p.copy(h),f=B,v=F,T=_),B<a)return!0}}}})}else{let S=Z(t);for(let I=0,A=S;I<A;I++){L(g,3*I,u,m),g.a.applyMatrix4(e),g.b.applyMatrix4(e),g.c.applyMatrix4(e),g.needsUpdate=!0;for(let _=b,M=b+w;_<M;_++){let R=o.resolveTriangleIndex(_);L(l,3*R,d,c),l.needsUpdate=!0;let F=l.distanceToTriangle(g,y,h);if(F<f&&(x.copy(y),p&&p.copy(h),f=F,v=_,T=I),F<a)return!0}}}}}),G.releasePrimitive(l),G.releasePrimitive(g),f===1/0?null:(r.point?r.point.copy(x):r.point=x.clone(),r.distance=f,r.faceIndex=v,n&&(n.point?n.point.copy(p):n.point=p.clone(),n.point.applyMatrix4(Re),x.applyMatrix4(Re),n.distance=x.sub(n.point).length(),n.faceIndex=T),r)}function fo(){return typeof SharedArrayBuffer<"u"}import{Box3 as Yt,Matrix4 as Gs}from"three";var Xt=new C.constructor,Me=new C.constructor,nt=new it(()=>new Yt),Dt=new Yt,Ct=new Yt,Or=new Yt,Hr=new Yt,kr=!1;function mo(o,t,e,r){if(kr)throw new Error("MeshBVH: Recursive calls to bvhcast not supported.");kr=!0;let n=o._roots,a=t._roots,s,i=0,c=0,d=new Gs().copy(e).invert();for(let m=0,u=n.length;m<u;m++){Xt.setBuffer(n[m]),c=0;let l=nt.getPrimitive();E(0,Xt.float32Array,l),l.applyMatrix4(d);for(let g=0,y=a.length;g<y&&(Me.setBuffer(a[m]),s=j(0,0,e,d,r,i,c,0,0,l),Me.clearBuffer(),c+=a[g].length,!s);g++);if(nt.releasePrimitive(l),Xt.clearBuffer(),i+=n[m].length,s)break}return kr=!1,s}function j(o,t,e,r,n,a=0,s=0,i=0,c=0,d=null,m=!1){let u,l;m?(u=Me,l=Xt):(u=Xt,l=Me);let g=u.float32Array,y=u.uint32Array,x=u.uint16Array,h=l.float32Array,p=l.uint32Array,f=l.uint16Array,v=o*2,T=t*2,b=N(v,x),w=N(T,f),S=!1;if(w&&b)m?S=n(z(t,p),O(t*2,f),z(o,y),O(o*2,x),c,s+t,i,a+o):S=n(z(o,y),O(o*2,x),z(t,p),O(t*2,f),i,a+o,c,s+t);else if(w){let I=nt.getPrimitive();E(t,h,I),I.applyMatrix4(e);let A=U(o),_=k(o,y);E(A,g,Dt),E(_,g,Ct);let M=I.intersectsBox(Dt),R=I.intersectsBox(Ct);S=M&&j(t,A,r,e,n,s,a,c,i+1,I,!m)||R&&j(t,_,r,e,n,s,a,c,i+1,I,!m),nt.releasePrimitive(I)}else{let I=U(t),A=k(t,p);E(I,h,Or),E(A,h,Hr);let _=d.intersectsBox(Or),M=d.intersectsBox(Hr);if(_&&M)S=j(o,I,e,r,n,a,s,i,c+1,d,m)||j(o,A,e,r,n,a,s,i,c+1,d,m);else if(_)if(b)S=j(o,I,e,r,n,a,s,i,c+1,d,m);else{let R=nt.getPrimitive();R.copy(Or).applyMatrix4(e);let F=U(o),P=k(o,y);E(F,g,Dt),E(P,g,Ct);let D=R.intersectsBox(Dt),B=R.intersectsBox(Ct);S=D&&j(I,F,r,e,n,s,a,c,i+1,R,!m)||B&&j(I,P,r,e,n,s,a,c,i+1,R,!m),nt.releasePrimitive(R)}else if(M)if(b)S=j(o,A,e,r,n,a,s,i,c+1,d,m);else{let R=nt.getPrimitive();R.copy(Hr).applyMatrix4(e);let F=U(o),P=k(o,y);E(F,g,Dt),E(P,g,Ct);let D=R.intersectsBox(Dt),B=R.intersectsBox(Ct);S=D&&j(A,F,r,e,n,s,a,c,i+1,R,!m)||B&&j(A,P,r,e,n,s,a,c,i+1,R,!m),nt.releasePrimitive(R)}}return S}var Fe=new H,po=new go,qs={strategy:0,maxDepth:40,maxLeafTris:10,useSharedArrayBuffer:!1,setBoundingBox:!0,onProgress:null,indirect:!1,verbose:!0},$t=class o{static serialize(t,e={}){e={cloneBuffers:!0,...e};let r=t.geometry,n=t._roots,a=t._indirectBuffer,s=r.getIndex(),i;return e.cloneBuffers?i={roots:n.map(c=>c.slice()),index:s.array.slice(),indirectBuffer:a?a.slice():null}:i={roots:n,index:s.array,indirectBuffer:a},i}static deserialize(t,e,r={}){r={setIndex:!0,indirect:!!t.indirectBuffer,...r};let{index:n,roots:a,indirectBuffer:s}=t,i=new o(e,{...r,[ae]:!0});if(i._roots=a,i._indirectBuffer=s||null,r.setIndex){let c=e.getIndex();if(c===null){let d=new Ws(t.index,1,!1);e.setIndex(d)}else c.array!==n&&(c.array.set(n),c.needsUpdate=!0)}return i}get indirect(){return!!this._indirectBuffer}constructor(t,e={}){if(t.isBufferGeometry){if(t.index&&t.index.isInterleavedBufferAttribute)throw new Error("MeshBVH: InterleavedBufferAttribute is not supported for the index attribute.")}else throw new Error("MeshBVH: Only BufferGeometries are supported.");if(e=Object.assign({...qs,[ae]:!1},e),e.useSharedArrayBuffer&&!fo())throw new Error("MeshBVH: SharedArrayBuffer is not available.");this.geometry=t,this._roots=null,this._indirectBuffer=null,e[ae]||(Ci(this,e),!t.boundingBox&&e.setBoundingBox&&(t.boundingBox=this.getBoundingBox(new go)));let{_indirectBuffer:r}=this;this.resolveTriangleIndex=e.indirect?n=>r[n]:n=>n}refit(t=null){return(this.indirect?io:qi)(this,t)}traverse(t,e=0){let r=this._roots[e],n=new Uint32Array(r),a=new Uint16Array(r);s(0);function s(i,c=0){let d=i*2,m=a[d+15]===65535;if(m){let u=n[i+6],l=a[d+14];t(c,m,new Float32Array(r,i*4,6),u,l)}else{let u=i+32/4,l=n[i+6],g=n[i+7];t(c,m,new Float32Array(r,i*4,6),g)||(s(u,c+1),s(l,c+1))}}}raycast(t,e=ho){let r=this._roots,n=this.geometry,a=[],s=e.isMaterial,i=Array.isArray(e),c=n.groups,d=s?e.side:e,m=this.indirect?no:Zi;for(let u=0,l=r.length;u<l;u++){let g=i?e[c[u].materialIndex].side:d,y=a.length;if(m(this,u,g,t,a),i){let x=c[u].materialIndex;for(let h=y,p=a.length;h<p;h++)a[h].face.materialIndex=x}}return a}raycastFirst(t,e=ho){let r=this._roots,n=this.geometry,a=e.isMaterial,s=Array.isArray(e),i=null,c=n.groups,d=a?e.side:e,m=this.indirect?ao:Ji;for(let u=0,l=r.length;u<l;u++){let g=s?e[c[u].materialIndex].side:d,y=m(this,u,g,t);y!=null&&(i==null||y.distance<i.distance)&&(i=y,s&&(y.face.materialIndex=c[u].materialIndex))}return i}intersectsGeometry(t,e){let r=!1,n=this._roots,a=this.indirect?lo:eo;for(let s=0,i=n.length;s<i&&(r=a(this,s,t,e),!r);s++);return r}shapecast(t){let e=G.getPrimitive(),r=this.indirect?ji:Wi,{boundsTraverseOrder:n,intersectsBounds:a,intersectsRange:s,intersectsTriangle:i}=t;if(s&&i){let u=s;s=(l,g,y,x,h)=>u(l,g,y,x,h)?!0:r(l,g,this,i,y,x,e)}else s||(i?s=(u,l,g,y)=>r(u,l,this,i,g,y,e):s=(u,l,g)=>g);let c=!1,d=0,m=this._roots;for(let u=0,l=m.length;u<l;u++){let g=m[u];if(c=Ni(this,u,a,s,n,d),c)break;d+=g.byteLength}return G.releasePrimitive(e),c}bvhcast(t,e,r){let{intersectsRanges:n,intersectsTriangles:a}=r,s=G.getPrimitive(),i=this.geometry.index,c=this.geometry.attributes.position,d=this.indirect?y=>{let x=this.resolveTriangleIndex(y);L(s,x*3,i,c)}:y=>{L(s,y*3,i,c)},m=G.getPrimitive(),u=t.geometry.index,l=t.geometry.attributes.position,g=t.indirect?y=>{let x=t.resolveTriangleIndex(y);L(m,x*3,u,l)}:y=>{L(m,y*3,u,l)};if(a){let y=(x,h,p,f,v,T,b,w)=>{for(let S=p,I=p+f;S<I;S++){g(S),m.a.applyMatrix4(e),m.b.applyMatrix4(e),m.c.applyMatrix4(e),m.needsUpdate=!0;for(let A=x,_=x+h;A<_;A++)if(d(A),s.needsUpdate=!0,a(s,m,A,S,v,T,b,w))return!0}return!1};if(n){let x=n;n=function(h,p,f,v,T,b,w,S){return x(h,p,f,v,T,b,w,S)?!0:y(h,p,f,v,T,b,w,S)}}else n=y}return mo(this,t,e,n)}intersectsBox(t,e){return Fe.set(t.min,t.max,e),Fe.needsUpdate=!0,this.shapecast({intersectsBounds:r=>Fe.intersectsBox(r),intersectsTriangle:r=>Fe.intersectsTriangle(r)})}intersectsSphere(t){return this.shapecast({intersectsBounds:e=>t.intersectsBox(e),intersectsTriangle:e=>e.intersectsSphere(t)})}closestPointToGeometry(t,e,r={},n={},a=0,s=1/0){return(this.indirect?uo:ro)(this,t,e,r,n,a,s)}closestPointToPoint(t,e={},r=0,n=1/0){return Oi(this,t,e,r,n)}getBoundingBox(t){return t.makeEmpty(),this._roots.forEach(r=>{E(0,new Float32Array(r),po),t.union(po)}),t}};import{DataTexture as To,FloatType as ea,UnsignedIntType as ra,RGBAFormat as ia,RGIntegerFormat as oa,NearestFilter as Be,BufferAttribute as na}from"three";import{DataTexture as Xs,FloatType as Pe,IntType as Ur,UnsignedIntType as De,ByteType as xo,UnsignedByteType as vo,ShortType as Ys,UnsignedShortType as $s,RedFormat as js,RGFormat as Qs,RGBAFormat as Vr,RedIntegerFormat as Zs,RGIntegerFormat as Ks,RGBAIntegerFormat as Gr,NearestFilter as yo}from"three";function Js(o){switch(o){case 1:return"R";case 2:return"RG";case 3:return"RGBA";case 4:return"RGBA"}throw new Error}function ta(o){switch(o){case 1:return js;case 2:return Qs;case 3:return Vr;case 4:return Vr}}function bo(o){switch(o){case 1:return Zs;case 2:return Ks;case 3:return Gr;case 4:return Gr}}var Ce=class extends Xs{constructor(){super(),this.minFilter=yo,this.magFilter=yo,this.generateMipmaps=!1,this.overrideItemSize=null,this._forcedType=null}updateFrom(t){let e=this.overrideItemSize,r=t.itemSize,n=t.count;if(e!==null){if(r*n%e!==0)throw new Error("VertexAttributeTexture: overrideItemSize must divide evenly into buffer length.");t.itemSize=e,t.count=n*r/e}let a=t.itemSize,s=t.count,i=t.normalized,c=t.array.constructor,d=c.BYTES_PER_ELEMENT,m=this._forcedType,u=a;if(m===null)switch(c){case Float32Array:m=Pe;break;case Uint8Array:case Uint16Array:case Uint32Array:m=De;break;case Int8Array:case Int16Array:case Int32Array:m=Ur;break}let l,g,y,x,h=Js(a);switch(m){case Pe:y=1,g=ta(a),i&&d===1?(x=c,h+="8",c===Uint8Array?l=vo:(l=xo,h+="_SNORM")):(x=Float32Array,h+="32F",l=Pe);break;case Ur:h+=d*8+"I",y=i?Math.pow(2,c.BYTES_PER_ELEMENT*8-1):1,g=bo(a),d===1?(x=Int8Array,l=xo):d===2?(x=Int16Array,l=Ys):(x=Int32Array,l=Ur);break;case De:h+=d*8+"UI",y=i?Math.pow(2,c.BYTES_PER_ELEMENT*8-1):1,g=bo(a),d===1?(x=Uint8Array,l=vo):d===2?(x=Uint16Array,l=$s):(x=Uint32Array,l=De);break}u===3&&(g===Vr||g===Gr)&&(u=4);let p=Math.ceil(Math.sqrt(s))||1,f=u*p*p,v=new x(f),T=t.normalized;t.normalized=!1;for(let b=0;b<s;b++){let w=u*b;v[w]=t.getX(b)/y,a>=2&&(v[w+1]=t.getY(b)/y),a>=3&&(v[w+2]=t.getZ(b)/y,u===4&&(v[w+3]=1)),a>=4&&(v[w+3]=t.getW(b)/y)}t.normalized=T,this.internalFormat=h,this.format=g,this.type=l,this.image.width=p,this.image.height=p,this.image.data=v,this.needsUpdate=!0,this.dispose(),t.itemSize=r,t.count=n}},Bt=class extends Ce{constructor(){super(),this._forcedType=De}};var Et=class extends Ce{constructor(){super(),this._forcedType=Pe}};var Ee=class{constructor(){this.index=new Bt,this.position=new Et,this.bvhBounds=new To,this.bvhContents=new To,this._cachedIndexAttr=null,this.index.overrideItemSize=3}updateFrom(t){let{geometry:e}=t;if(aa(t,this.bvhBounds,this.bvhContents),this.position.updateFrom(e.attributes.position),t.indirect){let r=t._indirectBuffer;if(this._cachedIndexAttr===null||this._cachedIndexAttr.count!==r.length)if(e.index)this._cachedIndexAttr=e.index.clone();else{let n=vr(xr(e));this._cachedIndexAttr=new na(n,1,!1)}sa(e,r,this._cachedIndexAttr),this.index.updateFrom(this._cachedIndexAttr)}else this.index.updateFrom(e.index)}dispose(){let{index:t,position:e,bvhBounds:r,bvhContents:n}=this;t&&t.dispose(),e&&e.dispose(),r&&r.dispose(),n&&n.dispose()}};function sa(o,t,e){let r=e.array,n=o.index?o.index.array:null;for(let a=0,s=t.length;a<s;a++){let i=3*a,c=3*t[a];for(let d=0;d<3;d++)r[i+d]=n?n[c+d]:c+d}}function aa(o,t,e){let r=o._roots;if(r.length!==1)throw new Error("MeshBVHUniformStruct: Multi-root BVHs not supported.");let n=r[0],a=new Uint16Array(n),s=new Uint32Array(n),i=new Float32Array(n),c=n.byteLength/32,d=2*Math.ceil(Math.sqrt(c/2)),m=new Float32Array(4*d*d),u=Math.ceil(Math.sqrt(c)),l=new Uint32Array(2*u*u);for(let g=0;g<c;g++){let y=g*32/4,x=y*2,h=y;for(let p=0;p<3;p++)m[8*g+0+p]=i[h+0+p],m[8*g+4+p]=i[h+3+p];if(N(x,a)){let p=O(x,a),f=z(y,s),v=4294901760|p;l[g*2+0]=v,l[g*2+1]=f}else{let p=4*k(y,s)/32,f=yt(y,s);l[g*2+0]=f,l[g*2+1]=p}}t.image.data=m,t.image.width=d,t.image.height=d,t.format=ia,t.type=ea,t.internalFormat="RGBA32F",t.minFilter=Be,t.magFilter=Be,t.generateMipmaps=!1,t.needsUpdate=!0,t.dispose(),e.image.data=l,e.image.width=u,e.image.height=u,e.format=oa,e.type=ra,e.internalFormat="RG32UI",e.minFilter=Be,e.magFilter=Be,e.generateMipmaps=!1,e.needsUpdate=!0,e.dispose()}import{BufferAttribute as Yr,BufferGeometry as ze,Vector3 as Kt,Vector4 as $r,Matrix4 as jr,Matrix3 as ca}from"three";var ut=new Kt,ft=new Kt,mt=new Kt,wo=new $r,Le=new Kt,Wr=new Kt,So=new $r,Ao=new $r,Ne=new jr,Io=new jr;function jt(o,t){if(!o&&!t)return;let e=o.count===t.count,r=o.normalized===t.normalized,n=o.array.constructor===t.array.constructor,a=o.itemSize===t.itemSize;if(!e||!r||!n||!a)throw new Error}function Qt(o,t=null){let e=o.array.constructor,r=o.normalized,n=o.itemSize,a=t===null?o.count:t;return new Yr(new e(n*a),n,r)}function _o(o,t,e=0){if(o.isInterleavedBufferAttribute){let r=o.itemSize;for(let n=0,a=o.count;n<a;n++){let s=n+e;t.setX(s,o.getX(n)),r>=2&&t.setY(s,o.getY(n)),r>=3&&t.setZ(s,o.getZ(n)),r>=4&&t.setW(s,o.getW(n))}}else{let r=t.array,n=r.constructor,a=r.BYTES_PER_ELEMENT*o.itemSize*e;new n(r.buffer,a,o.array.length).set(o.array)}}function la(o,t,e){let r=o.elements,n=t.elements;for(let a=0,s=n.length;a<s;a++)r[a]+=n[a]*e}function Ro(o,t,e){let r=o.skeleton,n=o.geometry,a=r.bones,s=r.boneInverses;So.fromBufferAttribute(n.attributes.skinIndex,t),Ao.fromBufferAttribute(n.attributes.skinWeight,t),Ne.elements.fill(0);for(let i=0;i<4;i++){let c=Ao.getComponent(i);if(c!==0){let d=So.getComponent(i);Io.multiplyMatrices(a[d].matrixWorld,s[d]),la(Ne,Io,c)}}return Ne.multiply(o.bindMatrix).premultiply(o.bindMatrixInverse),e.transformDirection(Ne),e}function qr(o,t,e,r,n){Le.set(0,0,0);for(let a=0,s=o.length;a<s;a++){let i=t[a],c=o[a];i!==0&&(Wr.fromBufferAttribute(c,r),e?Le.addScaledVector(Wr,i):Le.addScaledVector(Wr.sub(n),i))}n.add(Le)}function ua(o,t={useGroups:!1,updateIndex:!1,skipAttributes:[]},e=new ze){let r=o[0].index!==null,{useGroups:n=!1,updateIndex:a=!1,skipAttributes:s=[]}=t,i=new Set(Object.keys(o[0].attributes)),c={},d=0;e.clearGroups();for(let m=0;m<o.length;++m){let u=o[m],l=0;if(r!==(u.index!==null))throw new Error("StaticGeometryGenerator: All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.");for(let g in u.attributes){if(!i.has(g))throw new Error('StaticGeometryGenerator: All geometries must have compatible attributes; make sure "'+g+'" attribute exists among all geometries, or in none of them.');c[g]===void 0&&(c[g]=[]),c[g].push(u.attributes[g]),l++}if(l!==i.size)throw new Error("StaticGeometryGenerator: Make sure all geometries have the same number of attributes.");if(n){let g;if(r)g=u.index.count;else if(u.attributes.position!==void 0)g=u.attributes.position.count;else throw new Error("StaticGeometryGenerator: The geometry must have either an index or a position attribute");e.addGroup(d,g,m),d+=g}}if(r){let m=!1;if(!e.index){let u=0;for(let l=0;l<o.length;++l)u+=o[l].index.count;e.setIndex(new Yr(new Uint32Array(u),1,!1)),m=!0}if(a||m){let u=e.index,l=0,g=0;for(let y=0;y<o.length;++y){let x=o[y],h=x.index;if(s[y]!==!0)for(let p=0;p<h.count;++p)u.setX(l,h.getX(p)+g),l++;g+=x.attributes.position.count}}}for(let m in c){let u=c[m];if(!(m in e.attributes)){let y=0;for(let x in u)y+=u[x].count;e.setAttribute(m,Qt(c[m][0],y))}let l=e.attributes[m],g=0;for(let y=0,x=u.length;y<x;y++){let h=u[y];s[y]!==!0&&_o(h,l,g),g+=h.count}}return e}function fa(o,t){if(o===null||t===null)return o===t;if(o.length!==t.length)return!1;for(let e=0,r=o.length;e<r;e++)if(o[e]!==t[e])return!1;return!0}function ma(o){let{index:t,attributes:e}=o;if(t)for(let r=0,n=t.count;r<n;r+=3){let a=t.getX(r),s=t.getX(r+2);t.setX(r,s),t.setX(r+2,a)}else for(let r in e){let n=e[r],a=n.itemSize;for(let s=0,i=n.count;s<i;s+=3)for(let c=0;c<a;c++){let d=n.getComponent(s,c),m=n.getComponent(s+2,c);n.setComponent(s,c,m),n.setComponent(s+2,c,d)}}return o}var Xr=class{constructor(t){this.matrixWorld=new jr,this.geometryHash=null,this.boneMatrices=null,this.primitiveCount=-1,this.mesh=t,this.update()}update(){let t=this.mesh,e=t.geometry,r=t.skeleton,n=(e.index?e.index.count:e.attributes.position.count)/3;if(this.matrixWorld.copy(t.matrixWorld),this.geometryHash=e.attributes.position.version,this.primitiveCount=n,r){r.boneTexture||r.computeBoneTexture(),r.update();let a=r.boneMatrices;!this.boneMatrices||this.boneMatrices.length!==a.length?this.boneMatrices=a.slice():this.boneMatrices.set(a)}else this.boneMatrices=null}didChange(){let t=this.mesh,e=t.geometry,r=(e.index?e.index.count:e.attributes.position.count)/3;return!(this.matrixWorld.equals(t.matrixWorld)&&this.geometryHash===e.attributes.position.version&&fa(t.skeleton&&t.skeleton.boneMatrices||null,this.boneMatrices)&&this.primitiveCount===r)}},Zt=class{constructor(t){Array.isArray(t)||(t=[t]);let e=[];t.forEach(r=>{r.traverseVisible(n=>{n.isMesh&&e.push(n)})}),this.meshes=e,this.useGroups=!0,this.applyWorldTransforms=!0,this.attributes=["position","normal","color","tangent","uv","uv2"],this._intermediateGeometry=new Array(e.length).fill().map(()=>new ze),this._diffMap=new WeakMap}getMaterials(){let t=[];return this.meshes.forEach(e=>{Array.isArray(e.material)?t.push(...e.material):t.push(e.material)}),t}generate(t=new ze){let e=[],{meshes:r,useGroups:n,_intermediateGeometry:a,_diffMap:s}=this;for(let i=0,c=r.length;i<c;i++){let d=r[i],m=a[i],u=s.get(d);!u||u.didChange(d)?(this._convertToStaticGeometry(d,m),e.push(!1),u?u.update():s.set(d,new Xr(d))):e.push(!0)}if(a.length===0){t.setIndex(null);let i=t.attributes;for(let c in i)t.deleteAttribute(c);for(let c in this.attributes)t.setAttribute(this.attributes[c],new Yr(new Float32Array(0),4,!1))}else ua(a,{useGroups:n,skipAttributes:e},t);for(let i in t.attributes)t.attributes[i].needsUpdate=!0;return t}_convertToStaticGeometry(t,e=new ze){let r=t.geometry,n=this.applyWorldTransforms,a=this.attributes.includes("normal"),s=this.attributes.includes("tangent"),i=r.attributes,c=e.attributes;!e.index&&r.index&&(e.index=r.index.clone()),c.position||e.setAttribute("position",Qt(i.position)),a&&!c.normal&&i.normal&&e.setAttribute("normal",Qt(i.normal)),s&&!c.tangent&&i.tangent&&e.setAttribute("tangent",Qt(i.tangent)),jt(r.index,e.index),jt(i.position,c.position),a&&jt(i.normal,c.normal),s&&jt(i.tangent,c.tangent);let d=i.position,m=a?i.normal:null,u=s?i.tangent:null,l=r.morphAttributes.position,g=r.morphAttributes.normal,y=r.morphAttributes.tangent,x=r.morphTargetsRelative,h=t.morphTargetInfluences,p=new ca;p.getNormalMatrix(t.matrixWorld),r.index&&e.index.array.set(r.index.array);for(let f=0,v=i.position.count;f<v;f++)ut.fromBufferAttribute(d,f),m&&ft.fromBufferAttribute(m,f),u&&(wo.fromBufferAttribute(u,f),mt.fromBufferAttribute(u,f)),h&&(l&&qr(l,h,x,f,ut),g&&qr(g,h,x,f,ft),y&&qr(y,h,x,f,mt)),t.isSkinnedMesh&&(t.applyBoneTransform(f,ut),m&&Ro(t,f,ft),u&&Ro(t,f,mt)),n&&ut.applyMatrix4(t.matrixWorld),c.position.setXYZ(f,ut.x,ut.y,ut.z),m&&(n&&ft.applyNormalMatrix(p),c.normal.setXYZ(f,ft.x,ft.y,ft.z)),u&&(n&&mt.transformDirection(t.matrixWorld),c.tangent.setXYZW(f,mt.x,mt.y,mt.z,wo.w));for(let f in this.attributes){let v=this.attributes[f];v==="position"||v==="tangent"||v==="normal"||!(v in i)||(c[v]||e.setAttribute(v,Qt(i[v])),jt(i[v],c[v]),_o(i[v],c[v]))}return t.matrixWorld.determinant()<0&&ma(e),e}};var dt={};Nn(dt,{bvh_distance_functions:()=>Mo,bvh_ray_functions:()=>Zr,bvh_struct_definitions:()=>Fo,common_functions:()=>Qr});var Qr=`

// A stack of uint32 indices can can store the indices for
// a perfectly balanced tree with a depth up to 31. Lower stack
// depth gets higher performance.
//
// However not all trees are balanced. Best value to set this to
// is the trees max depth.
#ifndef BVH_STACK_DEPTH
#define BVH_STACK_DEPTH 60
#endif

#ifndef INFINITY
#define INFINITY 1e20
#endif

// Utilities
uvec4 uTexelFetch1D( usampler2D tex, uint index ) {

	uint width = uint( textureSize( tex, 0 ).x );
	uvec2 uv;
	uv.x = index % width;
	uv.y = index / width;

	return texelFetch( tex, ivec2( uv ), 0 );

}

ivec4 iTexelFetch1D( isampler2D tex, uint index ) {

	uint width = uint( textureSize( tex, 0 ).x );
	uvec2 uv;
	uv.x = index % width;
	uv.y = index / width;

	return texelFetch( tex, ivec2( uv ), 0 );

}

vec4 texelFetch1D( sampler2D tex, uint index ) {

	uint width = uint( textureSize( tex, 0 ).x );
	uvec2 uv;
	uv.x = index % width;
	uv.y = index / width;

	return texelFetch( tex, ivec2( uv ), 0 );

}

vec4 textureSampleBarycoord( sampler2D tex, vec3 barycoord, uvec3 faceIndices ) {

	return
		barycoord.x * texelFetch1D( tex, faceIndices.x ) +
		barycoord.y * texelFetch1D( tex, faceIndices.y ) +
		barycoord.z * texelFetch1D( tex, faceIndices.z );

}

void ndcToCameraRay(
	vec2 coord, mat4 cameraWorld, mat4 invProjectionMatrix,
	out vec3 rayOrigin, out vec3 rayDirection
) {

	// get camera look direction and near plane for camera clipping
	vec4 lookDirection = cameraWorld * vec4( 0.0, 0.0, - 1.0, 0.0 );
	vec4 nearVector = invProjectionMatrix * vec4( 0.0, 0.0, - 1.0, 1.0 );
	float near = abs( nearVector.z / nearVector.w );

	// get the camera direction and position from camera matrices
	vec4 origin = cameraWorld * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec4 direction = invProjectionMatrix * vec4( coord, 0.5, 1.0 );
	direction /= direction.w;
	direction = cameraWorld * direction - origin;

	// slide the origin along the ray until it sits at the near clip plane position
	origin.xyz += direction.xyz * near / dot( direction, lookDirection );

	rayOrigin = origin.xyz;
	rayDirection = direction.xyz;

}
`;var Mo=`

float dot2( vec3 v ) {

	return dot( v, v );

}

// https://www.shadertoy.com/view/ttfGWl
vec3 closestPointToTriangle( vec3 p, vec3 v0, vec3 v1, vec3 v2, out vec3 barycoord ) {

    vec3 v10 = v1 - v0;
    vec3 v21 = v2 - v1;
    vec3 v02 = v0 - v2;

	vec3 p0 = p - v0;
	vec3 p1 = p - v1;
	vec3 p2 = p - v2;

    vec3 nor = cross( v10, v02 );

    // method 2, in barycentric space
    vec3  q = cross( nor, p0 );
    float d = 1.0 / dot2( nor );
    float u = d * dot( q, v02 );
    float v = d * dot( q, v10 );
    float w = 1.0 - u - v;

	if( u < 0.0 ) {

		w = clamp( dot( p2, v02 ) / dot2( v02 ), 0.0, 1.0 );
		u = 0.0;
		v = 1.0 - w;

	} else if( v < 0.0 ) {

		u = clamp( dot( p0, v10 ) / dot2( v10 ), 0.0, 1.0 );
		v = 0.0;
		w = 1.0 - u;

	} else if( w < 0.0 ) {

		v = clamp( dot( p1, v21 ) / dot2( v21 ), 0.0, 1.0 );
		w = 0.0;
		u = 1.0-v;

	}

	barycoord = vec3( u, v, w );
    return u * v1 + v * v2 + w * v0;

}

float distanceToTriangles(
	// geometry info and triangle range
	sampler2D positionAttr, usampler2D indexAttr, uint offset, uint count,

	// point and cut off range
	vec3 point, float closestDistanceSquared,

	// outputs
	inout uvec4 faceIndices, inout vec3 faceNormal, inout vec3 barycoord, inout float side, inout vec3 outPoint
) {

	bool found = false;
	vec3 localBarycoord;
	for ( uint i = offset, l = offset + count; i < l; i ++ ) {

		uvec3 indices = uTexelFetch1D( indexAttr, i ).xyz;
		vec3 a = texelFetch1D( positionAttr, indices.x ).rgb;
		vec3 b = texelFetch1D( positionAttr, indices.y ).rgb;
		vec3 c = texelFetch1D( positionAttr, indices.z ).rgb;

		// get the closest point and barycoord
		vec3 closestPoint = closestPointToTriangle( point, a, b, c, localBarycoord );
		vec3 delta = point - closestPoint;
		float sqDist = dot2( delta );
		if ( sqDist < closestDistanceSquared ) {

			// set the output results
			closestDistanceSquared = sqDist;
			faceIndices = uvec4( indices.xyz, i );
			faceNormal = normalize( cross( a - b, b - c ) );
			barycoord = localBarycoord;
			outPoint = closestPoint;
			side = sign( dot( faceNormal, delta ) );

		}

	}

	return closestDistanceSquared;

}

float distanceSqToBounds( vec3 point, vec3 boundsMin, vec3 boundsMax ) {

	vec3 clampedPoint = clamp( point, boundsMin, boundsMax );
	vec3 delta = point - clampedPoint;
	return dot( delta, delta );

}

float distanceSqToBVHNodeBoundsPoint( vec3 point, sampler2D bvhBounds, uint currNodeIndex ) {

	uint cni2 = currNodeIndex * 2u;
	vec3 boundsMin = texelFetch1D( bvhBounds, cni2 ).xyz;
	vec3 boundsMax = texelFetch1D( bvhBounds, cni2 + 1u ).xyz;
	return distanceSqToBounds( point, boundsMin, boundsMax );

}

// use a macro to hide the fact that we need to expand the struct into separate fields
#define	bvhClosestPointToPoint(		bvh,		point, faceIndices, faceNormal, barycoord, side, outPoint	)	_bvhClosestPointToPoint(		bvh.position, bvh.index, bvh.bvhBounds, bvh.bvhContents,		point, faceIndices, faceNormal, barycoord, side, outPoint	)

float _bvhClosestPointToPoint(
	// bvh info
	sampler2D bvh_position, usampler2D bvh_index, sampler2D bvh_bvhBounds, usampler2D bvh_bvhContents,

	// point to check
	vec3 point,

	// output variables
	inout uvec4 faceIndices, inout vec3 faceNormal, inout vec3 barycoord,
	inout float side, inout vec3 outPoint
 ) {

	// stack needs to be twice as long as the deepest tree we expect because
	// we push both the left and right child onto the stack every traversal
	int ptr = 0;
	uint stack[ BVH_STACK_DEPTH ];
	stack[ 0 ] = 0u;

	float closestDistanceSquared = pow( 100000.0, 2.0 );
	bool found = false;
	while ( ptr > - 1 && ptr < BVH_STACK_DEPTH ) {

		uint currNodeIndex = stack[ ptr ];
		ptr --;

		// check if we intersect the current bounds
		float boundsHitDistance = distanceSqToBVHNodeBoundsPoint( point, bvh_bvhBounds, currNodeIndex );
		if ( boundsHitDistance > closestDistanceSquared ) {

			continue;

		}

		uvec2 boundsInfo = uTexelFetch1D( bvh_bvhContents, currNodeIndex ).xy;
		bool isLeaf = bool( boundsInfo.x & 0xffff0000u );
		if ( isLeaf ) {

			uint count = boundsInfo.x & 0x0000ffffu;
			uint offset = boundsInfo.y;
			closestDistanceSquared = distanceToTriangles(
				bvh_position, bvh_index, offset, count, point, closestDistanceSquared,

				// outputs
				faceIndices, faceNormal, barycoord, side, outPoint
			);

		} else {

			uint leftIndex = currNodeIndex + 1u;
			uint splitAxis = boundsInfo.x & 0x0000ffffu;
			uint rightIndex = boundsInfo.y;
			bool leftToRight = distanceSqToBVHNodeBoundsPoint( point, bvh_bvhBounds, leftIndex ) < distanceSqToBVHNodeBoundsPoint( point, bvh_bvhBounds, rightIndex );//rayDirection[ splitAxis ] >= 0.0;
			uint c1 = leftToRight ? leftIndex : rightIndex;
			uint c2 = leftToRight ? rightIndex : leftIndex;

			// set c2 in the stack so we traverse it later. We need to keep track of a pointer in
			// the stack while we traverse. The second pointer added is the one that will be
			// traversed first
			ptr ++;
			stack[ ptr ] = c2;
			ptr ++;
			stack[ ptr ] = c1;

		}

	}

	return sqrt( closestDistanceSquared );

}
`;var Zr=`

#ifndef TRI_INTERSECT_EPSILON
#define TRI_INTERSECT_EPSILON 1e-5
#endif

// Raycasting
bool intersectsBounds( vec3 rayOrigin, vec3 rayDirection, vec3 boundsMin, vec3 boundsMax, out float dist ) {

	// https://www.reddit.com/r/opengl/comments/8ntzz5/fast_glsl_ray_box_intersection/
	// https://tavianator.com/2011/ray_box.html
	vec3 invDir = 1.0 / rayDirection;

	// find intersection distances for each plane
	vec3 tMinPlane = invDir * ( boundsMin - rayOrigin );
	vec3 tMaxPlane = invDir * ( boundsMax - rayOrigin );

	// get the min and max distances from each intersection
	vec3 tMinHit = min( tMaxPlane, tMinPlane );
	vec3 tMaxHit = max( tMaxPlane, tMinPlane );

	// get the furthest hit distance
	vec2 t = max( tMinHit.xx, tMinHit.yz );
	float t0 = max( t.x, t.y );

	// get the minimum hit distance
	t = min( tMaxHit.xx, tMaxHit.yz );
	float t1 = min( t.x, t.y );

	// set distance to 0.0 if the ray starts inside the box
	dist = max( t0, 0.0 );

	return t1 >= dist;

}

bool intersectsTriangle(
	vec3 rayOrigin, vec3 rayDirection, vec3 a, vec3 b, vec3 c,
	out vec3 barycoord, out vec3 norm, out float dist, out float side
) {

	// https://stackoverflow.com/questions/42740765/intersection-between-line-and-triangle-in-3d
	vec3 edge1 = b - a;
	vec3 edge2 = c - a;
	norm = cross( edge1, edge2 );

	float det = - dot( rayDirection, norm );
	float invdet = 1.0 / det;

	vec3 AO = rayOrigin - a;
	vec3 DAO = cross( AO, rayDirection );

	vec4 uvt;
	uvt.x = dot( edge2, DAO ) * invdet;
	uvt.y = - dot( edge1, DAO ) * invdet;
	uvt.z = dot( AO, norm ) * invdet;
	uvt.w = 1.0 - uvt.x - uvt.y;

	// set the hit information
	barycoord = uvt.wxy; // arranged in A, B, C order
	dist = uvt.z;
	side = sign( det );
	norm = side * normalize( norm );

	// add an epsilon to avoid misses between triangles
	uvt += vec4( TRI_INTERSECT_EPSILON );

	return all( greaterThanEqual( uvt, vec4( 0.0 ) ) );

}

bool intersectTriangles(
	// geometry info and triangle range
	sampler2D positionAttr, usampler2D indexAttr, uint offset, uint count,

	// ray
	vec3 rayOrigin, vec3 rayDirection,

	// outputs
	inout float minDistance, inout uvec4 faceIndices, inout vec3 faceNormal, inout vec3 barycoord,
	inout float side, inout float dist
) {

	bool found = false;
	vec3 localBarycoord, localNormal;
	float localDist, localSide;
	for ( uint i = offset, l = offset + count; i < l; i ++ ) {

		uvec3 indices = uTexelFetch1D( indexAttr, i ).xyz;
		vec3 a = texelFetch1D( positionAttr, indices.x ).rgb;
		vec3 b = texelFetch1D( positionAttr, indices.y ).rgb;
		vec3 c = texelFetch1D( positionAttr, indices.z ).rgb;

		if (
			intersectsTriangle( rayOrigin, rayDirection, a, b, c, localBarycoord, localNormal, localDist, localSide )
			&& localDist < minDistance
		) {

			found = true;
			minDistance = localDist;

			faceIndices = uvec4( indices.xyz, i );
			faceNormal = localNormal;

			side = localSide;
			barycoord = localBarycoord;
			dist = localDist;

		}

	}

	return found;

}

bool intersectsBVHNodeBounds( vec3 rayOrigin, vec3 rayDirection, sampler2D bvhBounds, uint currNodeIndex, out float dist ) {

	uint cni2 = currNodeIndex * 2u;
	vec3 boundsMin = texelFetch1D( bvhBounds, cni2 ).xyz;
	vec3 boundsMax = texelFetch1D( bvhBounds, cni2 + 1u ).xyz;
	return intersectsBounds( rayOrigin, rayDirection, boundsMin, boundsMax, dist );

}

// use a macro to hide the fact that we need to expand the struct into separate fields
#define	bvhIntersectFirstHit(		bvh,		rayOrigin, rayDirection, faceIndices, faceNormal, barycoord, side, dist	)	_bvhIntersectFirstHit(		bvh.position, bvh.index, bvh.bvhBounds, bvh.bvhContents,		rayOrigin, rayDirection, faceIndices, faceNormal, barycoord, side, dist	)

bool _bvhIntersectFirstHit(
	// bvh info
	sampler2D bvh_position, usampler2D bvh_index, sampler2D bvh_bvhBounds, usampler2D bvh_bvhContents,

	// ray
	vec3 rayOrigin, vec3 rayDirection,

	// output variables split into separate variables due to output precision
	inout uvec4 faceIndices, inout vec3 faceNormal, inout vec3 barycoord,
	inout float side, inout float dist
) {

	// stack needs to be twice as long as the deepest tree we expect because
	// we push both the left and right child onto the stack every traversal
	int ptr = 0;
	uint stack[ BVH_STACK_DEPTH ];
	stack[ 0 ] = 0u;

	float triangleDistance = INFINITY;
	bool found = false;
	while ( ptr > - 1 && ptr < BVH_STACK_DEPTH ) {

		uint currNodeIndex = stack[ ptr ];
		ptr --;

		// check if we intersect the current bounds
		float boundsHitDistance;
		if (
			! intersectsBVHNodeBounds( rayOrigin, rayDirection, bvh_bvhBounds, currNodeIndex, boundsHitDistance )
			|| boundsHitDistance > triangleDistance
		) {

			continue;

		}

		uvec2 boundsInfo = uTexelFetch1D( bvh_bvhContents, currNodeIndex ).xy;
		bool isLeaf = bool( boundsInfo.x & 0xffff0000u );

		if ( isLeaf ) {

			uint count = boundsInfo.x & 0x0000ffffu;
			uint offset = boundsInfo.y;

			found = intersectTriangles(
				bvh_position, bvh_index, offset, count,
				rayOrigin, rayDirection, triangleDistance,
				faceIndices, faceNormal, barycoord, side, dist
			) || found;

		} else {

			uint leftIndex = currNodeIndex + 1u;
			uint splitAxis = boundsInfo.x & 0x0000ffffu;
			uint rightIndex = boundsInfo.y;

			bool leftToRight = rayDirection[ splitAxis ] >= 0.0;
			uint c1 = leftToRight ? leftIndex : rightIndex;
			uint c2 = leftToRight ? rightIndex : leftIndex;

			// set c2 in the stack so we traverse it later. We need to keep track of a pointer in
			// the stack while we traverse. The second pointer added is the one that will be
			// traversed first
			ptr ++;
			stack[ ptr ] = c2;

			ptr ++;
			stack[ ptr ] = c1;

		}

	}

	return found;

}
`;var Fo=`
struct BVH {

	usampler2D index;
	sampler2D position;

	sampler2D bvhBounds;
	usampler2D bvhContents;

};
`;var tm=`
	${Qr}
	${Zr}
`;import{BufferAttribute as Jt}from"three";import{BufferAttribute as Oe,BufferGeometry as lm,Float32BufferAttribute as um,InstancedBufferAttribute as fm,InterleavedBuffer as mm,InterleavedBufferAttribute as dm,TriangleFanDrawMode as hm,TriangleStripDrawMode as pm,TrianglesDrawMode as gm,Vector3 as xm}from"three";function Po(o,t=1e-4){t=Math.max(t,Number.EPSILON);let e={},r=o.getIndex(),n=o.getAttribute("position"),a=r?r.count:n.count,s=0,i=Object.keys(o.attributes),c={},d={},m=[],u=["getX","getY","getZ","getW"],l=["setX","setY","setZ","setW"];for(let f=0,v=i.length;f<v;f++){let T=i[f],b=o.attributes[T];c[T]=new Oe(new b.array.constructor(b.count*b.itemSize),b.itemSize,b.normalized);let w=o.morphAttributes[T];w&&(d[T]=new Oe(new w.array.constructor(w.count*w.itemSize),w.itemSize,w.normalized))}let g=t*.5,y=Math.log10(1/t),x=Math.pow(10,y),h=g*x;for(let f=0;f<a;f++){let v=r?r.getX(f):f,T="";for(let b=0,w=i.length;b<w;b++){let S=i[b],I=o.getAttribute(S),A=I.itemSize;for(let _=0;_<A;_++)T+=`${~~(I[u[_]](v)*x+h)},`}if(T in e)m.push(e[T]);else{for(let b=0,w=i.length;b<w;b++){let S=i[b],I=o.getAttribute(S),A=o.morphAttributes[S],_=I.itemSize,M=c[S],R=d[S];for(let F=0;F<_;F++){let P=u[F],D=l[F];if(M[D](s,I[P](v)),A)for(let B=0,q=A.length;B<q;B++)R[B][D](s,A[B][P](v))}}e[T]=s,m.push(s),s++}}let p=o.clone();for(let f in o.attributes){let v=c[f];if(p.setAttribute(f,new Oe(v.array.slice(0,s*v.itemSize),v.itemSize,v.normalized)),f in d)for(let T=0;T<d[f].length;T++){let b=d[f][T];p.morphAttributes[f][T]=new Oe(b.array.slice(0,s*b.itemSize),b.itemSize,b.normalized)}}return p.setIndex(m),p}function Do(o,t,e){let r=o.index,a=o.attributes.position.count,s=r?r.count:a,i=o.groups;i.length===0&&(i=[{count:s,start:0,materialIndex:0}]);let c;e.length<=255?c=new Uint8Array(a):c=new Uint16Array(a);for(let d=0;d<i.length;d++){let m=i[d],u=m.start,l=m.count,g=Math.min(l,s-u),y=Array.isArray(t)?t[m.materialIndex]:t,x=e.indexOf(y);for(let h=0;h<g;h++){let p=u+h;r&&(p=r.getX(p)),c[p]=x}}return new Jt(c,1,!1)}function Co(o,t){let{attributes:e=[],normalMapRequired:r=!1}=t;if(!o.attributes.normal&&e&&e.includes("normal")&&o.computeVertexNormals(),!o.attributes.uv&&e&&e.includes("uv")){let n=o.attributes.position.count;o.setAttribute("uv",new Jt(new Float32Array(n*2),2,!1))}if(!o.attributes.uv2&&e&&e.includes("uv2")){let n=o.attributes.position.count;o.setAttribute("uv2",new Jt(new Float32Array(n*2),2,!1))}if(!o.attributes.tangent&&e&&e.includes("tangent"))if(r)o.index===null&&(o=Po(o)),o.computeTangents();else{let n=o.attributes.position.count;o.setAttribute("tangent",new Jt(new Float32Array(n*4),4,!1))}if(!o.attributes.color&&e&&e.includes("color")){let n=o.attributes.position.count,a=new Float32Array(n*4);a.fill(1),o.setAttribute("color",new Jt(a,4))}if(!o.index){let n=o.attributes.position.count,a=new Array(n);for(let s=0;s<n;s++)a[s]=s;o.setIndex(a)}}var ga=new da;function xa(){let o=new Kr;return o.setAttribute("position",new ha(new Float32Array(9),3)),new pa(o,ga)}var He=class{get initialized(){return!!this.bvh}constructor(t){Array.isArray(t)||(t=[t]);let e=[...t];e.length===0&&e.push(xa()),this.bvhOptions={},this.attributes=["position","normal","tangent","color","uv","uv2"],this.objects=e,this.bvh=null,this.geometry=new Kr,this.materials=null,this.textures=null,this.lights=[],this.staticGeometryGenerator=new Zt(this.objects)}reset(){this.bvh=null,this.geometry.dispose(),this.geometry=new Kr,this.materials=null,this.textures=null,this.lights=[],this.staticGeometryGenerator=new Zt(this.objects)}dispose(){}prepScene(){if(this.bvh!==null)return;let{objects:t,staticGeometryGenerator:e,geometry:r,lights:n,attributes:a}=this;for(let d=0,m=t.length;d<m;d++)t[d].traverse(u=>{if(u.isMesh){let l=!!u.material.normalMap;Co(u.geometry,{attributes:a,normalMapRequired:l})}else(u.isRectAreaLight||u.isSpotLight||u.isPointLight||u.isDirectionalLight)&&n.push(u)});let s=new Set,i=e.getMaterials();i.forEach(d=>{for(let m in d){let u=d[m];u&&u.isTexture&&s.add(u)}}),e.attributes=a,e.generate(r);let c=Do(r,i,i);r.setAttribute("materialIndex",c),r.clearGroups(),this.materials=i,this.textures=Array.from(s)}generate(){let{objects:t,staticGeometryGenerator:e,geometry:r,bvhOptions:n}=this;if(this.bvh===null)return this.prepScene(),this.bvh=new $t(r,{strategy:2,maxLeafTris:1,...n}),{lights:this.lights,bvh:this.bvh,materials:this.materials,textures:this.textures,objects:t};{let{bvh:a}=this;return e.generate(r),a.refit(),{lights:this.lights,bvh:this.bvh,materials:this.materials,textures:this.textures,objects:t}}}};var Jr=class{generate(t,e={}){Array.isArray(t)?t.forEach(n=>n.updateMatrixWorld(!0)):t.updateMatrixWorld(!0);let r=new He(t);return r.bvhOptions=e,r.generate()}};import{PerspectiveCamera as va}from"three";var ke=class extends va{set bokehSize(t){this.fStop=this.getFocalLength()/t}get bokehSize(){return this.getFocalLength()/this.fStop}constructor(...t){super(...t),this.fStop=1.4,this.apertureBlades=0,this.apertureRotation=0,this.focusDistance=25,this.anamorphicRatio=1}copy(t,e){return super.copy(t,e),this.fStop=t.fStop,this.apertureBlades=t.apertureBlades,this.apertureRotation=t.apertureRotation,this.focusDistance=t.focusDistance,this.anamorphicRatio=t.anamorphicRatio,this}};import{SpotLight as ya}from"three";var ti=class extends ya{constructor(...t){super(...t),this.iesTexture=null,this.radius=0}copy(t,e){return super.copy(t,e),this.iesTexture=t.iesTexture,this.radius=t.radius,this}};import{ClampToEdgeWrapping as ba,Color as Ta,DataTexture as wa,EquirectangularReflectionMapping as Sa,LinearFilter as Bo,RepeatWrapping as Aa,RGBAFormat as Ia,Spherical as Ra,Vector2 as Lo,FloatType as _a}from"three";var ht=new Lo,Eo=new Lo,Ue=new Ra,Ve=new Ta,Ge=class extends wa{constructor(t=512,e=512){super(new Float32Array(t*e*4),t,e,Ia,_a,Sa,Aa,ba,Bo,Bo),this.generationCallback=null}update(){this.dispose(),this.needsUpdate=!0;let{data:t,width:e,height:r}=this.image;for(let n=0;n<e;n++)for(let a=0;a<r;a++){Eo.set(e,r),ht.set(n/e,a/r),ht.x-=.5,ht.y=1-ht.y,Ue.theta=ht.x*2*Math.PI,Ue.phi=ht.y*Math.PI,Ue.radius=1,this.generationCallback(Ue,ht,Eo,Ve);let i=4*(a*e+n);t[i+0]=Ve.r,t[i+1]=Ve.g,t[i+2]=Ve.b,t[i+3]=1}}copy(t){return super.copy(t),this.generationCallback=t.generationCallback,this}};import{Color as No,Vector3 as Ma}from"three";var zo=new Ma,ei=class extends Ge{constructor(t=512){super(t,t),this.topColor=new No().set(16777215),this.bottomColor=new No().set(0),this.exponent=2,this.generationCallback=(e,r,n,a)=>{zo.setFromSpherical(e);let s=zo.y*.5+.5;a.lerpColors(this.bottomColor,this.topColor,s**this.exponent)}}copy(t){return super.copy(t),this.topColor.copy(t.topColor),this.bottomColor.copy(t.bottomColor),this}};import{DataTexture as Fa,RGBAFormat as Pa,ClampToEdgeWrapping as Oo,FloatType as Da,FrontSide as Ca,BackSide as Ba,DoubleSide as Ea,NearestFilter as Ho}from"three";function We(o){return`${o.source.uuid}:${o.colorSpace}`}function qe(o){let t=new Set,e=[];for(let r=0,n=o.length;r<n;r++){let a=o[r],s=We(a);t.has(s)||(t.add(s),e.push(a))}return e}var Vo=45,Lt=Vo*4,ko=56,Uo=57,ri=class{constructor(){this._features={}}isUsed(t){return t in this._features}setUsed(t,e=!0){e===!1?delete this._features[t]:this._features[t]=!0}reset(){this._features={}}},Xe=class extends Fa{constructor(){super(new Float32Array(4),1,1),this.format=Pa,this.type=Da,this.wrapS=Oo,this.wrapT=Oo,this.minFilter=Ho,this.magFilter=Ho,this.generateMipmaps=!1,this.threeCompatibilityTransforms=!1,this.features=new ri}setCastShadow(t,e){let r=this.image.data,n=t*Lt+Uo;r[n]=e?0:1}getCastShadow(t){let e=this.image.data,r=t*Lt+Uo;return!e[r]}setMatte(t,e){let r=this.image.data,n=t*Lt+ko;r[n]=e?1:0}getMatte(t){let e=this.image.data,r=t*Lt+ko;return!!e[r]}updateFrom(t,e){function r(h,p,f=-1){if(p in h&&h[p]){let v=We(h[p]);return y[v]}else return f}function n(h,p,f){return p in h?h[p]:f}function a(h){return h.map||h.specularMap||h.displacementMap||h.normalMap||h.bumpMap||h.roughnessMap||h.metalnessMap||h.alphaMap||h.emissiveMap||h.clearcoatMap||h.clearcoatNormalMap||h.clearcoatRoughnessMap||h.iridescenceMap||h.iridescenceThicknessMap||h.specularIntensityMap||h.specularColorMap||h.transmissionMap||h.thicknessMap||h.sheenColorMap||h.sheenRoughnessMap||null}function s(h,p,f,v){let T;if(m?T=a(h):T=h[p]&&h[p].isTexture?h[p]:null,T){let b=T.matrix.elements,w=0;f[v+w++]=b[0],f[v+w++]=b[3],f[v+w++]=b[6],w++,f[v+w++]=b[1],f[v+w++]=b[4],f[v+w++]=b[7],w++}return 8}let i=0,c=t.length*Vo,d=Math.ceil(Math.sqrt(c))||1,{threeCompatibilityTransforms:m,image:u,features:l}=this,g=qe(e),y={};for(let h=0,p=g.length;h<p;h++)y[We(g[h])]=h;u.width!==d&&(this.dispose(),u.data=new Float32Array(d*d*4),u.width=d,u.height=d);let x=u.data;l.reset();for(let h=0,p=t.length;h<p;h++){let f=t[h];if(f.isFogVolumeMaterial){l.setUsed("FOG");for(let b=0;b<Lt;b++)x[i+b]=0;x[i+0+0]=f.color.r,x[i+0+1]=f.color.g,x[i+0+2]=f.color.b,x[i+8+3]=n(f,"emissiveIntensity",0),x[i+12+0]=f.emissive.r,x[i+12+1]=f.emissive.g,x[i+12+2]=f.emissive.b,x[i+52+1]=f.density,x[i+52+3]=0,x[i+56+2]=4,i+=Lt;continue}x[i++]=f.color.r,x[i++]=f.color.g,x[i++]=f.color.b,x[i++]=r(f,"map"),x[i++]=n(f,"metalness",0),x[i++]=r(f,"metalnessMap"),x[i++]=n(f,"roughness",0),x[i++]=r(f,"roughnessMap"),x[i++]=n(f,"ior",1.5),x[i++]=n(f,"transmission",0),x[i++]=r(f,"transmissionMap"),x[i++]=n(f,"emissiveIntensity",0),"emissive"in f?(x[i++]=f.emissive.r,x[i++]=f.emissive.g,x[i++]=f.emissive.b):(x[i++]=0,x[i++]=0,x[i++]=0),x[i++]=r(f,"emissiveMap"),x[i++]=r(f,"normalMap"),"normalScale"in f?(x[i++]=f.normalScale.x,x[i++]=f.normalScale.y):(x[i++]=1,x[i++]=1),x[i++]=n(f,"clearcoat",0),x[i++]=r(f,"clearcoatMap"),x[i++]=n(f,"clearcoatRoughness",0),x[i++]=r(f,"clearcoatRoughnessMap"),x[i++]=r(f,"clearcoatNormalMap"),"clearcoatNormalScale"in f?(x[i++]=f.clearcoatNormalScale.x,x[i++]=f.clearcoatNormalScale.y):(x[i++]=1,x[i++]=1),i++,x[i++]=n(f,"sheen",0),"sheenColor"in f?(x[i++]=f.sheenColor.r,x[i++]=f.sheenColor.g,x[i++]=f.sheenColor.b):(x[i++]=0,x[i++]=0,x[i++]=0),x[i++]=r(f,"sheenColorMap"),x[i++]=n(f,"sheenRoughness",0),x[i++]=r(f,"sheenRoughnessMap"),x[i++]=r(f,"iridescenceMap"),x[i++]=r(f,"iridescenceThicknessMap"),x[i++]=n(f,"iridescence",0),x[i++]=n(f,"iridescenceIOR",1.3);let v=n(f,"iridescenceThicknessRange",[100,400]);x[i++]=v[0],x[i++]=v[1],"specularColor"in f?(x[i++]=f.specularColor.r,x[i++]=f.specularColor.g,x[i++]=f.specularColor.b):(x[i++]=1,x[i++]=1,x[i++]=1),x[i++]=r(f,"specularColorMap"),x[i++]=n(f,"specularIntensity",1),x[i++]=r(f,"specularIntensityMap");let T=n(f,"thickness",0)===0&&n(f,"attenuationDistance",1/0)===1/0;if(x[i++]=Number(T),i++,"attenuationColor"in f?(x[i++]=f.attenuationColor.r,x[i++]=f.attenuationColor.g,x[i++]=f.attenuationColor.b):(x[i++]=1,x[i++]=1,x[i++]=1),x[i++]=n(f,"attenuationDistance",1/0),x[i++]=r(f,"alphaMap"),x[i++]=f.opacity,x[i++]=f.alphaTest,!T&&f.transmission>0)x[i++]=0;else switch(f.side){case Ca:x[i++]=1;break;case Ba:x[i++]=-1;break;case Ea:x[i++]=0;break}i++,i++,x[i++]=Number(f.vertexColors)|Number(f.flatShading)<<1,x[i++]=Number(f.transparent),i+=s(f,"map",x,i),i+=s(f,"metalnessMap",x,i),i+=s(f,"roughnessMap",x,i),i+=s(f,"transmissionMap",x,i),i+=s(f,"emissiveMap",x,i),i+=s(f,"normalMap",x,i),i+=s(f,"clearcoatMap",x,i),i+=s(f,"clearcoatNormalMap",x,i),i+=s(f,"clearcoatRoughnessMap",x,i),i+=s(f,"sheenColorMap",x,i),i+=s(f,"sheenRoughnessMap",x,i),i+=s(f,"iridescenceMap",x,i),i+=s(f,"iridescenceThicknessMap",x,i),i+=s(f,"specularColorMap",x,i),i+=s(f,"specularIntensityMap",x,i)}this.needsUpdate=!0}};import{WebGLArrayRenderTarget as La,RGBAFormat as Na,UnsignedByteType as za,Color as Oa,RepeatWrapping as Go,LinearFilter as Wo,NoToneMapping as Ha,ShaderMaterial as ka}from"three";var qo=new Oa,Ye=class extends La{constructor(...t){super(...t);let e=this.texture;e.format=Na,e.type=za,e.minFilter=Wo,e.magFilter=Wo,e.wrapS=Go,e.wrapT=Go,e.setTextures=(...n)=>{this.setTextures(...n)};let r=new X(new ii);this.fsQuad=r}setTextures(t,e,r,n){let a=qe(n),s=t.getRenderTarget(),i=t.toneMapping,c=t.getClearAlpha();t.getClearColor(qo);let d=a.length||1;this.setSize(e,r,d),t.setClearColor(0,0),t.toneMapping=Ha;let m=this.fsQuad;for(let u=0,l=d;u<l;u++){let g=a[u];g&&(g.matrixAutoUpdate=!1,g.matrix.identity(),m.material.map=g,t.setRenderTarget(this,u),m.render(t),g.updateMatrix(),g.matrixAutoUpdate=!0)}m.material.map=null,t.setClearColor(qo,c),t.setRenderTarget(s),t.toneMapping=i}dispose(){super.dispose(),this.fsQuad.dispose()}},ii=class extends ka{get map(){return this.uniforms.map.value}set map(t){this.uniforms.map.value=t}constructor(){super({uniforms:{map:{value:null}},vertexShader:`
				varying vec2 vUv;
				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}
			`,fragmentShader:`
				uniform sampler2D map;
				varying vec2 vUv;
				void main() {

					gl_FragColor = texture2D( map, vUv );

				}
			`})}};import{DataTexture as oi,RedFormat as Xo,LinearFilter as Nt,DataUtils as gt,HalfFloatType as st,Source as Va,RepeatWrapping as ni,RGBAFormat as Ga,FloatType as Wa,ClampToEdgeWrapping as qa}from"three";import{DataUtils as Ua}from"three";function pt(o){let t=new Uint16Array(o.length);for(let e=0,r=o.length;e<r;++e)t[e]=Ua.toHalfFloat(o[e]);return t}function Yo(o,t,e=0,r=o.length){let n=e,a=e+r-1;for(;n<a;){let s=n+a>>1;o[s]<t?n=s+1:a=s}return n-e}function Xa(o,t,e){return .2126*o+.7152*t+.0722*e}function Ya(o,t=st){let e=o.clone();e.source=new Va({...e.image});let{width:r,height:n,data:a}=e.image,s=a;if(e.type!==t){t===st?s=new Uint16Array(a.length):s=new Float32Array(a.length);let i;a instanceof Int8Array||a instanceof Int16Array||a instanceof Int32Array?i=2**(8*a.BYTES_PER_ELEMENT-1)-1:i=2**(8*a.BYTES_PER_ELEMENT)-1;for(let c=0,d=a.length;c<d;c++){let m=a[c];e.type===st&&(m=gt.fromHalfFloat(a[c])),e.type!==Wa&&e.type!==st&&(m/=i),t===st&&(s[c]=gt.toHalfFloat(m))}e.image.data=s,e.type=t}if(e.flipY){let i=s;s=s.slice();for(let c=0;c<n;c++)for(let d=0;d<r;d++){let m=n-c-1,u=4*(c*r+d),l=4*(m*r+d);s[l+0]=i[u+0],s[l+1]=i[u+1],s[l+2]=i[u+2],s[l+3]=i[u+3]}e.flipY=!1,e.image.data=s}return e}var $e=class{constructor(){let t=new oi(pt(new Float32Array([1,1,1,1])),1,1);t.type=st,t.format=Ga,t.minFilter=Nt,t.magFilter=Nt,t.wrapS=ni,t.wrapT=ni,t.generateMipmaps=!1,t.needsUpdate=!0;let e=new oi(pt(new Float32Array([0,1])),1,2);e.type=st,e.format=Xo,e.minFilter=Nt,e.magFilter=Nt,e.generateMipmaps=!1,e.needsUpdate=!0;let r=new oi(pt(new Float32Array([0,0,1,1])),2,2);r.type=st,r.format=Xo,r.minFilter=Nt,r.magFilter=Nt,r.generateMipmaps=!1,r.needsUpdate=!0,this.map=t,this.marginalWeights=e,this.conditionalWeights=r,this.totalSum=1}dispose(){this.marginalWeights.dispose(),this.conditionalWeights.dispose(),this.map.dispose()}updateFrom(t){let e=Ya(t);e.wrapS=ni,e.wrapT=qa;let{width:r,height:n,data:a}=e.image,s=new Float32Array(r*n),i=new Float32Array(r*n),c=new Float32Array(n),d=new Float32Array(n),m=0,u=0;for(let h=0;h<n;h++){let p=0;for(let f=0;f<r;f++){let v=h*r+f,T=gt.fromHalfFloat(a[4*v+0]),b=gt.fromHalfFloat(a[4*v+1]),w=gt.fromHalfFloat(a[4*v+2]),S=Xa(T,b,w);p+=S,m+=S,s[v]=S,i[v]=p}if(p!==0)for(let f=h*r,v=h*r+r;f<v;f++)s[f]/=p,i[f]/=p;u+=p,c[h]=p,d[h]=u}if(u!==0)for(let h=0,p=c.length;h<p;h++)c[h]/=u,d[h]/=u;let l=new Uint16Array(n),g=new Uint16Array(r*n);for(let h=0;h<n;h++){let p=(h+1)/n,f=Yo(d,p);l[h]=gt.toHalfFloat((f+.5)/n)}for(let h=0;h<n;h++)for(let p=0;p<r;p++){let f=h*r+p,v=(p+1)/r,T=Yo(i,v,h*r,r);g[f]=gt.toHalfFloat((T+.5)/r)}this.dispose();let{marginalWeights:y,conditionalWeights:x}=this;y.image={width:n,height:1,data:l},y.needsUpdate=!0,x.image={width:r,height:n,data:g},x.needsUpdate=!0,this.totalSum=m,this.map=e}};var je=class{constructor(){this.bokehSize=0,this.apertureBlades=0,this.apertureRotation=0,this.focusDistance=10,this.anamorphicRatio=1}updateFrom(t){t instanceof ke?(this.bokehSize=t.bokehSize,this.apertureBlades=t.apertureBlades,this.apertureRotation=t.apertureRotation,this.focusDistance=t.focusDistance,this.anamorphicRatio=t.anamorphicRatio):(this.bokehSize=0,this.apertureRotation=0,this.apertureBlades=0,this.focusDistance=10,this.anamorphicRatio=1)}};import{DataTexture as $a,RGBAFormat as ja,ClampToEdgeWrapping as $o,FloatType as Qa,Vector3 as te,Quaternion as Za,Matrix4 as Ka,NearestFilter as jo}from"three";var si=6,Ja=0,tc=1,ec=2,rc=3,ic=4,Qe=class{constructor(){let t=new $a(new Float32Array(4),1,1);t.format=ja,t.type=Qa,t.wrapS=$o,t.wrapT=$o,t.generateMipmaps=!1,t.minFilter=jo,t.magFilter=jo,this.tex=t,this.count=0}updateFrom(t,e=[]){let r=this.tex,n=Math.max(t.length*si,1),a=Math.ceil(Math.sqrt(n));r.image.width!==a&&(r.dispose(),r.image.data=new Float32Array(a*a*4),r.image.width=a,r.image.height=a);let s=r.image.data,i=new te,c=new te,d=new Ka,m=new Za,u=new te,l=new te,g=new te(0,1,0);for(let y=0,x=t.length;y<x;y++){let h=t[y],p=y*si*4,f=0;for(let T=0;T<si*4;T++)s[p+T]=0;h.getWorldPosition(c),s[p+f++]=c.x,s[p+f++]=c.y,s[p+f++]=c.z;let v=Ja;if(h.isRectAreaLight&&h.isCircular?v=tc:h.isSpotLight?v=ec:h.isDirectionalLight?v=rc:h.isPointLight&&(v=ic),s[p+f++]=v,s[p+f++]=h.color.r,s[p+f++]=h.color.g,s[p+f++]=h.color.b,s[p+f++]=h.intensity,h.getWorldQuaternion(m),h.isRectAreaLight)i.set(h.width,0,0).applyQuaternion(m),s[p+f++]=i.x,s[p+f++]=i.y,s[p+f++]=i.z,f++,c.set(0,h.height,0).applyQuaternion(m),s[p+f++]=c.x,s[p+f++]=c.y,s[p+f++]=c.z,s[p+f++]=i.cross(c).length()*(h.isCircular?Math.PI/4:1);else if(h.isSpotLight){let T=h.radius||0;u.setFromMatrixPosition(h.matrixWorld),l.setFromMatrixPosition(h.target.matrixWorld),d.lookAt(u,l,g),m.setFromRotationMatrix(d),i.set(1,0,0).applyQuaternion(m),s[p+f++]=i.x,s[p+f++]=i.y,s[p+f++]=i.z,f++,c.set(0,1,0).applyQuaternion(m),s[p+f++]=c.x,s[p+f++]=c.y,s[p+f++]=c.z,s[p+f++]=Math.PI*T*T,s[p+f++]=T,s[p+f++]=h.decay,s[p+f++]=h.distance,s[p+f++]=Math.cos(h.angle),s[p+f++]=Math.cos(h.angle*(1-h.penumbra)),s[p+f++]=h.iesTexture?e.indexOf(h.iesTexture):-1}else if(h.isPointLight){let T=i.setFromMatrixPosition(h.matrixWorld);s[p+f++]=T.x,s[p+f++]=T.y,s[p+f++]=T.z,f++,f+=4,f+=1,s[p+f++]=h.decay,s[p+f++]=h.distance}else if(h.isDirectionalLight){let T=i.setFromMatrixPosition(h.matrixWorld),b=c.setFromMatrixPosition(h.target.matrixWorld);l.subVectors(T,b).normalize(),s[p+f++]=l.x,s[p+f++]=l.y,s[p+f++]=l.z}}r.needsUpdate=!0,this.count=t.length}};import{ClampToEdgeWrapping as tn,Color as sc,HalfFloatType as ac,LinearFilter as en,MeshBasicMaterial as cc,NoToneMapping as lc,RGBAFormat as uc,WebGLArrayRenderTarget as fc}from"three";import{DataTexture as Qo,FileLoader as oc,HalfFloatType as Zo,LinearFilter as Ze,RedFormat as Ko,MathUtils as ai,Loader as nc}from"three";function Jo(o){let t=this,e=o.split(`
`),r=0,n;t.verAngles=[],t.horAngles=[],t.candelaValues=[],t.tiltData={},t.tiltData.angles=[],t.tiltData.mulFactors=[];function a(l){return l=l.trim(),l=l.replace(/,/g," "),l=l.replace(/\s\s+/g," "),l.split(" ")}function s(l,g){for(;;){let y=e[r++],x=a(y);for(let h=0;h<x.length;++h)g.push(Number(x[h]));if(g.length===l)break}}function i(){let l=e[r++],g=a(l);t.tiltData.lampToLumGeometry=Number(g[0]),l=e[r++],g=a(l),t.tiltData.numAngles=Number(g[0]),s(t.tiltData.numAngles,t.tiltData.angles),s(t.tiltData.numAngles,t.tiltData.mulFactors)}function c(){let l=[];s(10,l),t.count=Number(l[0]),t.lumens=Number(l[1]),t.multiplier=Number(l[2]),t.numVerAngles=Number(l[3]),t.numHorAngles=Number(l[4]),t.gonioType=Number(l[5]),t.units=Number(l[6]),t.width=Number(l[7]),t.length=Number(l[8]),t.height=Number(l[9])}function d(){let l=[];s(3,l),t.ballFactor=Number(l[0]),t.blpFactor=Number(l[1]),t.inputWatts=Number(l[2])}for(;n=e[r++],!n.includes("TILT"););n.includes("NONE")||n.includes("INCLUDE")&&i(),c(),d();for(let l=0;l<t.numHorAngles;++l)t.candelaValues.push([]);s(t.numVerAngles,t.verAngles),s(t.numHorAngles,t.horAngles);for(let l=0;l<t.numHorAngles;++l)s(t.numVerAngles,t.candelaValues[l]);for(let l=0;l<t.numHorAngles;++l)for(let g=0;g<t.numVerAngles;++g)t.candelaValues[l][g]*=t.candelaValues[l][g]*t.multiplier*t.ballFactor*t.blpFactor;let m=-1;for(let l=0;l<t.numHorAngles;++l)for(let g=0;g<t.numVerAngles;++g){let y=t.candelaValues[l][g];m=m<y?y:m}if(!0&&m>0)for(let l=0;l<t.numHorAngles;++l)for(let g=0;g<t.numVerAngles;++g)t.candelaValues[l][g]/=m}var Ke=class extends nc{_getIESValues(t){let a=new Float32Array(64800);function s(d,m){let u=0,l=0,g=0,y=0,x=0,h=0;for(let A=0;A<t.numHorAngles-1;++A)if(m<t.horAngles[A+1]||A==t.numHorAngles-2){l=A,g=t.horAngles[A],y=t.horAngles[A+1];break}for(let A=0;A<t.numVerAngles-1;++A)if(d<t.verAngles[A+1]||A==t.numVerAngles-2){u=A,x=t.verAngles[A],h=t.verAngles[A+1];break}let p=y-g,f=h-x;if(f===0)return 0;let v=p===0?0:(m-g)/p,T=(d-x)/f,b=p===0?l:l+1,w=ai.lerp(t.candelaValues[l][u],t.candelaValues[b][u],v),S=ai.lerp(t.candelaValues[l][u+1],t.candelaValues[b][u+1],v);return ai.lerp(w,S,T)}let i=t.horAngles[0],c=t.horAngles[t.numHorAngles-1];for(let d=0;d<64800;++d){let m=d%360,u=Math.floor(d/360);c-i!==0&&(m<i||m>=c)&&(m%=c*2,m>c&&(m=c*2-m)),a[d]=s(u,m)}return a}load(t,e,r,n){let a=new oc(this.manager);a.setResponseType("text"),a.setCrossOrigin(this.crossOrigin),a.setWithCredentials(this.withCredentials),a.setPath(this.path),a.setRequestHeader(this.requestHeader);let s=new Qo(null,360,180,Ko,Zo);return s.minFilter=Ze,s.magFilter=Ze,a.load(t,i=>{let c=new Jo(i);s.image.data=pt(this._getIESValues(c)),s.needsUpdate=!0,e!==void 0&&e(s)},r,n),s}parse(t){let e=new Jo(t),r=new Qo(null,360,180,Ko,Zo);return r.minFilter=Ze,r.magFilter=Ze,r.image.data=pt(this._getIESValues(e)),r.needsUpdate=!0,r}};var rn=new sc,Je=class extends fc{constructor(...t){super(...t);let e=this.texture;e.format=uc,e.type=ac,e.minFilter=en,e.magFilter=en,e.wrapS=tn,e.wrapT=tn,e.generateMipmaps=!1,e.updateFrom=(...n)=>{this.updateFrom(...n)};let r=new X(new cc);this.fsQuad=r,this.iesLoader=new Ke}async updateFrom(t,e){let r=t.getRenderTarget(),n=t.toneMapping,a=t.getClearAlpha();t.getClearColor(rn);let s=e.length||1;this.setSize(360,180,s),t.setClearColor(0,0),t.toneMapping=lc;let i=this.fsQuad;for(let c=0,d=s;c<d;c++){let m=e[c];m&&(m.matrixAutoUpdate=!1,m.matrix.identity(),i.material.map=m,i.material.transparent=!0,t.setRenderTarget(this,c),i.render(t),m.updateMatrix(),m.matrixAutoUpdate=!0)}i.material.map=null,t.setClearColor(rn,a),t.setRenderTarget(r),t.toneMapping=n,i.dispose()}dispose(){super.dispose(),this.fsQuad.dispose()}};var on=`

	// TODO: possibly this should be renamed something related to material or path tracing logic

	#ifndef RAY_OFFSET
	#define RAY_OFFSET 1e-4
	#endif

	// adjust the hit point by the surface normal by a factor of some offset and the
	// maximum component-wise value of the current point to accommodate floating point
	// error as values increase.
	vec3 stepRayOrigin( vec3 rayOrigin, vec3 rayDirection, vec3 offset, float dist ) {

		vec3 point = rayOrigin + rayDirection * dist;
		vec3 absPoint = abs( point );
		float maxPoint = max( absPoint.x, max( absPoint.y, absPoint.z ) );
		return point + offset * ( maxPoint + 1.0 ) * RAY_OFFSET;

	}

	// https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_volume/README.md#attenuation
	vec3 transmissionAttenuation( float dist, vec3 attColor, float attDist ) {

		vec3 ot = - log( attColor ) / attDist;
		return exp( - ot * dist );

	}

	vec3 getHalfVector( vec3 wi, vec3 wo, float eta ) {

		// get the half vector - assuming if the light incident vector is on the other side
		// of the that it's transmissive.
		vec3 h;
		if ( wi.z > 0.0 ) {

			h = normalize( wi + wo );

		} else {

			// Scale by the ior ratio to retrieve the appropriate half vector
			// From Section 2.2 on computing the transmission half vector:
			// https://blog.selfshadow.com/publications/s2015-shading-course/burley/s2015_pbs_disney_bsdf_notes.pdf
			h = normalize( wi + wo * eta );

		}

		h *= sign( h.z );
		return h;

	}

	vec3 getHalfVector( vec3 a, vec3 b ) {

		return normalize( a + b );

	}

	// The discrepancy between interpolated surface normal and geometry normal can cause issues when a ray
	// is cast that is on the top side of the geometry normal plane but below the surface normal plane. If
	// we find a ray like that we ignore it to avoid artifacts.
	// This function returns if the direction is on the same side of both planes.
	bool isDirectionValid( vec3 direction, vec3 surfaceNormal, vec3 geometryNormal ) {

		bool aboveSurfaceNormal = dot( direction, surfaceNormal ) > 0.0;
		bool aboveGeometryNormal = dot( direction, geometryNormal ) > 0.0;
		return aboveSurfaceNormal == aboveGeometryNormal;

	}

	// ray sampling x and z are swapped to align with expected background view
	vec2 equirectDirectionToUv( vec3 direction ) {

		// from Spherical.setFromCartesianCoords
		vec2 uv = vec2( atan( direction.z, direction.x ), acos( direction.y ) );
		uv /= vec2( 2.0 * PI, PI );

		// apply adjustments to get values in range [0, 1] and y right side up
		uv.x += 0.5;
		uv.y = 1.0 - uv.y;
		return uv;

	}

	vec3 equirectUvToDirection( vec2 uv ) {

		// undo above adjustments
		uv.x -= 0.5;
		uv.y = 1.0 - uv.y;

		// from Vector3.setFromSphericalCoords
		float theta = uv.x * 2.0 * PI;
		float phi = uv.y * PI;

		float sinPhi = sin( phi );

		return vec3( sinPhi * cos( theta ), cos( phi ), sinPhi * sin( theta ) );

	}

	// power heuristic for multiple importance sampling
	float misHeuristic( float a, float b ) {

		float aa = a * a;
		float bb = b * b;
		return aa / ( aa + bb );

	}

	// tentFilter from Peter Shirley's 'Realistic Ray Tracing (2nd Edition)' book, pg. 60
	// erichlof/THREE.js-PathTracing-Renderer/
	float tentFilter( float x ) {

		return x < 0.5 ? sqrt( 2.0 * x ) - 1.0 : 1.0 - sqrt( 2.0 - ( 2.0 * x ) );

	}
`;import{NoBlending as mc}from"three";var ci=class extends Q{constructor(t){super({blending:mc,transparent:!1,depthWrite:!1,depthTest:!1,defines:{USE_SLIDER:0},uniforms:{sigma:{value:5},threshold:{value:.03},kSigma:{value:1},map:{value:null}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}

			`,fragmentShader:`

				//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
				//  Copyright (c) 2018-2019 Michele Morrone
				//  All rights reserved.
				//
				//  https://michelemorrone.eu - https://BrutPitt.com
				//
				//  me@michelemorrone.eu - brutpitt@gmail.com
				//  twitter: @BrutPitt - github: BrutPitt
				//
				//  https://github.com/BrutPitt/glslSmartDeNoise/
				//
				//  This software is distributed under the terms of the BSD 2-Clause license
				//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

				uniform sampler2D map;

				uniform float sigma;
				uniform float threshold;
				uniform float kSigma;

				varying vec2 vUv;

				#define INV_SQRT_OF_2PI 0.39894228040143267793994605993439
				#define INV_PI 0.31830988618379067153776752674503

				// Parameters:
				//	 sampler2D tex	 - sampler image / texture
				//	 vec2 uv		   - actual fragment coord
				//	 float sigma  >  0 - sigma Standard Deviation
				//	 float kSigma >= 0 - sigma coefficient
				//		 kSigma * sigma  -->  radius of the circular kernel
				//	 float threshold   - edge sharpening threshold
				vec4 smartDeNoise( sampler2D tex, vec2 uv, float sigma, float kSigma, float threshold ) {

					float radius = round( kSigma * sigma );
					float radQ = radius * radius;

					float invSigmaQx2 = 0.5 / ( sigma * sigma );
					float invSigmaQx2PI = INV_PI * invSigmaQx2;

					float invThresholdSqx2 = 0.5 / ( threshold * threshold );
					float invThresholdSqrt2PI = INV_SQRT_OF_2PI / threshold;

					vec4 centrPx = texture2D( tex, uv );
					centrPx.rgb *= centrPx.a;

					float zBuff = 0.0;
					vec4 aBuff = vec4( 0.0 );
					vec2 size = vec2( textureSize( tex, 0 ) );

					vec2 d;
					for ( d.x = - radius; d.x <= radius; d.x ++ ) {

						float pt = sqrt( radQ - d.x * d.x );

						for ( d.y = - pt; d.y <= pt; d.y ++ ) {

							float blurFactor = exp( - dot( d, d ) * invSigmaQx2 ) * invSigmaQx2PI;

							vec4 walkPx = texture2D( tex, uv + d / size );
							walkPx.rgb *= walkPx.a;

							vec4 dC = walkPx - centrPx;
							float deltaFactor = exp( - dot( dC.rgba, dC.rgba ) * invThresholdSqx2 ) * invThresholdSqrt2PI * blurFactor;

							zBuff += deltaFactor;
							aBuff += deltaFactor * walkPx;

						}

					}

					return aBuff / zBuff;

				}

				void main() {

					gl_FragColor = smartDeNoise( map, vec2( vUv.x, vUv.y ), sigma, kSigma, threshold );
					#include <tonemapping_fragment>
					#include <colorspace_fragment>
					#include <premultiplied_alpha_fragment>

				}

			`}),this.setValues(t)}};import{Matrix4 as ui,Vector2 as Rc}from"three";import{DataArrayTexture as dc,FloatType as hc,RGBAFormat as pc}from"three";function nn(o,t,e,r,n){if(t>r)throw new Error;let a=o.length/t,s=o.constructor.BYTES_PER_ELEMENT*8,i=1;switch(o.constructor){case Uint8Array:case Uint16Array:case Uint32Array:i=2**s-1;break;case Int8Array:case Int16Array:case Int32Array:i=2**(s-1)-1;break}for(let c=0;c<a;c++){let d=4*c,m=t*c;for(let u=0;u<r;u++)e[n+d+u]=t>=u+1?o[m+u]/i:0}}var tr=class extends dc{constructor(){super(),this._textures=[],this.type=hc,this.format=pc,this.internalFormat="RGBA32F"}updateAttribute(t,e){let r=this._textures[t];r.updateFrom(e);let n=r.image,a=this.image;if(n.width!==a.width||n.height!==a.height)throw new Error("FloatAttributeTextureArray: Attribute must be the same dimensions when updating single layer.");let{width:s,height:i,data:c}=a,m=s*i*4*t,u=e.itemSize;u===3&&(u=4),nn(r.image.data,u,c,4,m),this.dispose(),this.needsUpdate=!0}setAttributes(t){let e=t[0].count,r=t.length;for(let u=0,l=r;u<l;u++)if(t[u].count!==e)throw new Error("FloatAttributeTextureArray: All attributes must have the same item count.");let n=this._textures;for(;n.length<r;){let u=new Et;n.push(u)}for(;n.length>r;)n.pop();for(let u=0,l=r;u<l;u++)n[u].updateFrom(t[u]);let s=n[0].image,i=this.image;(s.width!==i.width||s.height!==i.height||s.depth!==r)&&(i.width=s.width,i.height=s.height,i.depth=r,i.data=new Float32Array(i.width*i.height*i.depth*4));let{data:c,width:d,height:m}=i;for(let u=0,l=r;u<l;u++){let g=n[u],x=d*m*4*u,h=t[u].itemSize;h===3&&(h=4),nn(g.image.data,h,c,4,x)}this.dispose(),this.needsUpdate=!0}};var er=class extends tr{updateNormalAttribute(t){this.updateAttribute(0,t)}updateTangentAttribute(t){this.updateAttribute(1,t)}updateUvAttribute(t){this.updateAttribute(2,t)}updateColorAttribute(t){this.updateAttribute(3,t)}updateFrom(t,e,r,n){this.setAttributes([t,e,r,n])}};var sn=`

	struct PhysicalCamera {

		float focusDistance;
		float anamorphicRatio;
		float bokehSize;
		int apertureBlades;
		float apertureRotation;

	};

`;var an=`

	struct EquirectHdrInfo {

		sampler2D marginalWeights;
		sampler2D conditionalWeights;
		sampler2D map;

		float totalSum;

	};

`;var cn=`

	#define RECT_AREA_LIGHT_TYPE 0
	#define CIRC_AREA_LIGHT_TYPE 1
	#define SPOT_LIGHT_TYPE 2
	#define DIR_LIGHT_TYPE 3
	#define POINT_LIGHT_TYPE 4

	struct LightsInfo {

		sampler2D tex;
		uint count;

	};

	struct Light {

		vec3 position;
		int type;

		vec3 color;
		float intensity;

		vec3 u;
		vec3 v;
		float area;

		// spot light fields
		float radius;
		float near;
		float decay;
		float distance;
		float coneCos;
		float penumbraCos;
		int iesProfile;

	};

	Light readLightInfo( sampler2D tex, uint index ) {

		uint i = index * 6u;

		vec4 s0 = texelFetch1D( tex, i + 0u );
		vec4 s1 = texelFetch1D( tex, i + 1u );
		vec4 s2 = texelFetch1D( tex, i + 2u );
		vec4 s3 = texelFetch1D( tex, i + 3u );

		Light l;
		l.position = s0.rgb;
		l.type = int( round( s0.a ) );

		l.color = s1.rgb;
		l.intensity = s1.a;

		l.u = s2.rgb;
		l.v = s3.rgb;
		l.area = s3.a;

		if ( l.type == SPOT_LIGHT_TYPE || l.type == POINT_LIGHT_TYPE ) {

			vec4 s4 = texelFetch1D( tex, i + 4u );
			vec4 s5 = texelFetch1D( tex, i + 5u );
			l.radius = s4.r;
			l.decay = s4.g;
			l.distance = s4.b;
			l.coneCos = s4.a;

			l.penumbraCos = s5.r;
			l.iesProfile = int( round( s5.g ) );

		} else {

			l.radius = 0.0;
			l.decay = 0.0;
			l.distance = 0.0;

			l.coneCos = 0.0;
			l.penumbraCos = 0.0;
			l.iesProfile = - 1;

		}

		return l;

	}

`;var ln=`

	struct Material {

		vec3 color;
		int map;

		float metalness;
		int metalnessMap;

		float roughness;
		int roughnessMap;

		float ior;
		float transmission;
		int transmissionMap;

		float emissiveIntensity;
		vec3 emissive;
		int emissiveMap;

		int normalMap;
		vec2 normalScale;

		float clearcoat;
		int clearcoatMap;
		int clearcoatNormalMap;
		vec2 clearcoatNormalScale;
		float clearcoatRoughness;
		int clearcoatRoughnessMap;

		int iridescenceMap;
		int iridescenceThicknessMap;
		float iridescence;
		float iridescenceIor;
		float iridescenceThicknessMinimum;
		float iridescenceThicknessMaximum;

		vec3 specularColor;
		int specularColorMap;

		float specularIntensity;
		int specularIntensityMap;
		bool thinFilm;

		vec3 attenuationColor;
		float attenuationDistance;

		int alphaMap;

		bool castShadow;
		float opacity;
		float alphaTest;

		float side;
		bool matte;

		float sheen;
		vec3 sheenColor;
		int sheenColorMap;
		float sheenRoughness;
		int sheenRoughnessMap;

		bool vertexColors;
		bool flatShading;
		bool transparent;
		bool fogVolume;

		mat3 mapTransform;
		mat3 metalnessMapTransform;
		mat3 roughnessMapTransform;
		mat3 transmissionMapTransform;
		mat3 emissiveMapTransform;
		mat3 normalMapTransform;
		mat3 clearcoatMapTransform;
		mat3 clearcoatNormalMapTransform;
		mat3 clearcoatRoughnessMapTransform;
		mat3 sheenColorMapTransform;
		mat3 sheenRoughnessMapTransform;
		mat3 iridescenceMapTransform;
		mat3 iridescenceThicknessMapTransform;
		mat3 specularColorMapTransform;
		mat3 specularIntensityMapTransform;

	};

	mat3 readTextureTransform( sampler2D tex, uint index ) {

		mat3 textureTransform;

		vec4 row1 = texelFetch1D( tex, index );
		vec4 row2 = texelFetch1D( tex, index + 1u );

		textureTransform[0] = vec3(row1.r, row2.r, 0.0);
		textureTransform[1] = vec3(row1.g, row2.g, 0.0);
		textureTransform[2] = vec3(row1.b, row2.b, 1.0);

		return textureTransform;

	}

	Material readMaterialInfo( sampler2D tex, uint index ) {

		uint i = index * 45u;

		vec4 s0 = texelFetch1D( tex, i + 0u );
		vec4 s1 = texelFetch1D( tex, i + 1u );
		vec4 s2 = texelFetch1D( tex, i + 2u );
		vec4 s3 = texelFetch1D( tex, i + 3u );
		vec4 s4 = texelFetch1D( tex, i + 4u );
		vec4 s5 = texelFetch1D( tex, i + 5u );
		vec4 s6 = texelFetch1D( tex, i + 6u );
		vec4 s7 = texelFetch1D( tex, i + 7u );
		vec4 s8 = texelFetch1D( tex, i + 8u );
		vec4 s9 = texelFetch1D( tex, i + 9u );
		vec4 s10 = texelFetch1D( tex, i + 10u );
		vec4 s11 = texelFetch1D( tex, i + 11u );
		vec4 s12 = texelFetch1D( tex, i + 12u );
		vec4 s13 = texelFetch1D( tex, i + 13u );
		vec4 s14 = texelFetch1D( tex, i + 14u );

		Material m;
		m.color = s0.rgb;
		m.map = int( round( s0.a ) );

		m.metalness = s1.r;
		m.metalnessMap = int( round( s1.g ) );
		m.roughness = s1.b;
		m.roughnessMap = int( round( s1.a ) );

		m.ior = s2.r;
		m.transmission = s2.g;
		m.transmissionMap = int( round( s2.b ) );
		m.emissiveIntensity = s2.a;

		m.emissive = s3.rgb;
		m.emissiveMap = int( round( s3.a ) );

		m.normalMap = int( round( s4.r ) );
		m.normalScale = s4.gb;

		m.clearcoat = s4.a;
		m.clearcoatMap = int( round( s5.r ) );
		m.clearcoatRoughness = s5.g;
		m.clearcoatRoughnessMap = int( round( s5.b ) );
		m.clearcoatNormalMap = int( round( s5.a ) );
		m.clearcoatNormalScale = s6.rg;

		m.sheen = s6.a;
		m.sheenColor = s7.rgb;
		m.sheenColorMap = int( round( s7.a ) );
		m.sheenRoughness = s8.r;
		m.sheenRoughnessMap = int( round( s8.g ) );

		m.iridescenceMap = int( round( s8.b ) );
		m.iridescenceThicknessMap = int( round( s8.a ) );
		m.iridescence = s9.r;
		m.iridescenceIor = s9.g;
		m.iridescenceThicknessMinimum = s9.b;
		m.iridescenceThicknessMaximum = s9.a;

		m.specularColor = s10.rgb;
		m.specularColorMap = int( round( s10.a ) );

		m.specularIntensity = s11.r;
		m.specularIntensityMap = int( round( s11.g ) );
		m.thinFilm = bool( s11.b );

		m.attenuationColor = s12.rgb;
		m.attenuationDistance = s12.a;

		m.alphaMap = int( round( s13.r ) );

		m.opacity = s13.g;
		m.alphaTest = s13.b;
		m.side = s13.a;

		m.matte = bool( s14.r );
		m.castShadow = ! bool( s14.g );
		m.vertexColors = bool( int( s14.b ) & 1 );
		m.flatShading = bool( int( s14.b ) & 2 );
		m.fogVolume = bool( int( s14.b ) & 4 );
		m.transparent = bool( s14.a );

		uint firstTextureTransformIdx = i + 15u;

		// mat3( 1.0 ) is an identity matrix
		m.mapTransform = m.map == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx );
		m.metalnessMapTransform = m.metalnessMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 2u );
		m.roughnessMapTransform = m.roughnessMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 4u );
		m.transmissionMapTransform = m.transmissionMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 6u );
		m.emissiveMapTransform = m.emissiveMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 8u );
		m.normalMapTransform = m.normalMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 10u );
		m.clearcoatMapTransform = m.clearcoatMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 12u );
		m.clearcoatNormalMapTransform = m.clearcoatNormalMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 14u );
		m.clearcoatRoughnessMapTransform = m.clearcoatRoughnessMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 16u );
		m.sheenColorMapTransform = m.sheenColorMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 18u );
		m.sheenRoughnessMapTransform = m.sheenRoughnessMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 20u );
		m.iridescenceMapTransform = m.iridescenceMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 22u );
		m.iridescenceThicknessMapTransform = m.iridescenceThicknessMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 24u );
		m.specularColorMapTransform = m.specularColorMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 26u );
		m.specularIntensityMapTransform = m.specularIntensityMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 28u );

		return m;

	}

`;var un=`

#ifndef FOG_CHECK_ITERATIONS
#define FOG_CHECK_ITERATIONS 30
#endif

// returns whether the given material is a fog material or not
bool isMaterialFogVolume( sampler2D materials, uint materialIndex ) {

	uint i = materialIndex * 45u;
	vec4 s14 = texelFetch1D( materials, i + 14u );
	return bool( int( s14.b ) & 4 );

}

// returns true if we're within the first fog volume we hit
bool bvhIntersectFogVolumeHit(
	vec3 rayOrigin, vec3 rayDirection,
	usampler2D materialIndexAttribute, sampler2D materials,
	inout Material material
) {

	material.fogVolume = false;

	for ( int i = 0; i < FOG_CHECK_ITERATIONS; i ++ ) {

		// find nearest hit
		uvec4 faceIndices = uvec4( 0u );
		vec3 faceNormal = vec3( 0.0, 0.0, 1.0 );
		vec3 barycoord = vec3( 0.0 );
		float side = 1.0;
		float dist = 0.0;
		bool hit = bvhIntersectFirstHit( bvh, rayOrigin, rayDirection, faceIndices, faceNormal, barycoord, side, dist );
		if ( hit ) {

			// if it's a fog volume return whether we hit the front or back face
			uint materialIndex = uTexelFetch1D( materialIndexAttribute, faceIndices.x ).r;
			if ( isMaterialFogVolume( materials, materialIndex ) ) {

				material = readMaterialInfo( materials, materialIndex );
				return side == - 1.0;

			} else {

				// move the ray forward
				rayOrigin = stepRayOrigin( rayOrigin, rayDirection, - faceNormal, dist );

			}

		} else {

			return false;

		}

	}

	return false;

}

`;var fn=`

	// The GGX functions provide sampling and distribution information for normals as output so
	// in order to get probability of scatter direction the half vector must be computed and provided.
	// [0] https://www.cs.cornell.edu/~srm/publications/EGSR07-btdf.pdf
	// [1] https://hal.archives-ouvertes.fr/hal-01509746/document
	// [2] http://jcgt.org/published/0007/04/01/
	// [4] http://jcgt.org/published/0003/02/03/

	// trowbridge-reitz === GGX === GTR

	vec3 ggxDirection( vec3 incidentDir, vec2 roughness, vec2 uv ) {

		// TODO: try GGXVNDF implementation from reference [2], here. Needs to update ggxDistribution
		// function below, as well

		// Implementation from reference [1]
		// stretch view
		vec3 V = normalize( vec3( roughness * incidentDir.xy, incidentDir.z ) );

		// orthonormal basis
		vec3 T1 = ( V.z < 0.9999 ) ? normalize( cross( V, vec3( 0.0, 0.0, 1.0 ) ) ) : vec3( 1.0, 0.0, 0.0 );
		vec3 T2 = cross( T1, V );

		// sample point with polar coordinates (r, phi)
		float a = 1.0 / ( 1.0 + V.z );
		float r = sqrt( uv.x );
		float phi = ( uv.y < a ) ? uv.y / a * PI : PI + ( uv.y - a ) / ( 1.0 - a ) * PI;
		float P1 = r * cos( phi );
		float P2 = r * sin( phi ) * ( ( uv.y < a ) ? 1.0 : V.z );

		// compute normal
		vec3 N = P1 * T1 + P2 * T2 + V * sqrt( max( 0.0, 1.0 - P1 * P1 - P2 * P2 ) );

		// unstretch
		N = normalize( vec3( roughness * N.xy, max( 0.0, N.z ) ) );

		return N;

	}

	// Below are PDF and related functions for use in a Monte Carlo path tracer
	// as specified in Appendix B of the following paper
	// See equation (34) from reference [0]
	float ggxLamda( float theta, float roughness ) {

		float tanTheta = tan( theta );
		float tanTheta2 = tanTheta * tanTheta;
		float alpha2 = roughness * roughness;

		float numerator = - 1.0 + sqrt( 1.0 + alpha2 * tanTheta2 );
		return numerator / 2.0;

	}

	// See equation (34) from reference [0]
	float ggxShadowMaskG1( float theta, float roughness ) {

		return 1.0 / ( 1.0 + ggxLamda( theta, roughness ) );

	}

	// See equation (125) from reference [4]
	float ggxShadowMaskG2( vec3 wi, vec3 wo, float roughness ) {

		float incidentTheta = acos( wi.z );
		float scatterTheta = acos( wo.z );
		return 1.0 / ( 1.0 + ggxLamda( incidentTheta, roughness ) + ggxLamda( scatterTheta, roughness ) );

	}

	// See equation (33) from reference [0]
	float ggxDistribution( vec3 halfVector, float roughness ) {

		float a2 = roughness * roughness;
		a2 = max( EPSILON, a2 );
		float cosTheta = halfVector.z;
		float cosTheta4 = pow( cosTheta, 4.0 );

		if ( cosTheta == 0.0 ) return 0.0;

		float theta = acosSafe( halfVector.z );
		float tanTheta = tan( theta );
		float tanTheta2 = pow( tanTheta, 2.0 );

		float denom = PI * cosTheta4 * pow( a2 + tanTheta2, 2.0 );
		return ( a2 / denom );

	}

	// See equation (3) from reference [2]
	float ggxPDF( vec3 wi, vec3 halfVector, float roughness ) {

		float incidentTheta = acos( wi.z );
		float D = ggxDistribution( halfVector, roughness );
		float G1 = ggxShadowMaskG1( incidentTheta, roughness );

		return D * G1 * max( 0.0, dot( wi, halfVector ) ) / wi.z;

	}

`;var mn=`

	// See equation (2) in http://www.aconty.com/pdf/s2017_pbs_imageworks_sheen.pdf
	float velvetD( float cosThetaH, float roughness ) {

		float alpha = max( roughness, 0.07 );
		alpha = alpha * alpha;

		float invAlpha = 1.0 / alpha;

		float sqrCosThetaH = cosThetaH * cosThetaH;
		float sinThetaH = max( 1.0 - sqrCosThetaH, 0.001 );

		return ( 2.0 + invAlpha ) * pow( sinThetaH, 0.5 * invAlpha ) / ( 2.0 * PI );

	}

	float velvetParamsInterpolate( int i, float oneMinusAlphaSquared ) {

		const float p0[5] = float[5]( 25.3245, 3.32435, 0.16801, -1.27393, -4.85967 );
		const float p1[5] = float[5]( 21.5473, 3.82987, 0.19823, -1.97760, -4.32054 );

		return mix( p1[i], p0[i], oneMinusAlphaSquared );

	}

	float velvetL( float x, float alpha ) {

		float oneMinusAlpha = 1.0 - alpha;
		float oneMinusAlphaSquared = oneMinusAlpha * oneMinusAlpha;

		float a = velvetParamsInterpolate( 0, oneMinusAlphaSquared );
		float b = velvetParamsInterpolate( 1, oneMinusAlphaSquared );
		float c = velvetParamsInterpolate( 2, oneMinusAlphaSquared );
		float d = velvetParamsInterpolate( 3, oneMinusAlphaSquared );
		float e = velvetParamsInterpolate( 4, oneMinusAlphaSquared );

		return a / ( 1.0 + b * pow( abs( x ), c ) ) + d * x + e;

	}

	// See equation (3) in http://www.aconty.com/pdf/s2017_pbs_imageworks_sheen.pdf
	float velvetLambda( float cosTheta, float alpha ) {

		return abs( cosTheta ) < 0.5 ? exp( velvetL( cosTheta, alpha ) ) : exp( 2.0 * velvetL( 0.5, alpha ) - velvetL( 1.0 - cosTheta, alpha ) );

	}

	// See Section 3, Shadowing Term, in http://www.aconty.com/pdf/s2017_pbs_imageworks_sheen.pdf
	float velvetG( float cosThetaO, float cosThetaI, float roughness ) {

		float alpha = max( roughness, 0.07 );
		alpha = alpha * alpha;

		return 1.0 / ( 1.0 + velvetLambda( cosThetaO, alpha ) + velvetLambda( cosThetaI, alpha ) );

	}

	float directionalAlbedoSheen( float cosTheta, float alpha ) {

		cosTheta = saturate( cosTheta );

		float c = 1.0 - cosTheta;
		float c3 = c * c * c;

		return 0.65584461 * c3 + 1.0 / ( 4.16526551 + exp( -7.97291361 * sqrt( alpha ) + 6.33516894 ) );

	}

	float sheenAlbedoScaling( vec3 wo, vec3 wi, SurfaceRecord surf ) {

		float alpha = max( surf.sheenRoughness, 0.07 );
		alpha = alpha * alpha;

		float maxSheenColor = max( max( surf.sheenColor.r, surf.sheenColor.g ), surf.sheenColor.b );

		float eWo = directionalAlbedoSheen( saturateCos( wo.z ), alpha );
		float eWi = directionalAlbedoSheen( saturateCos( wi.z ), alpha );

		return min( 1.0 - maxSheenColor * eWo, 1.0 - maxSheenColor * eWi );

	}

	// See Section 5, Layering, in http://www.aconty.com/pdf/s2017_pbs_imageworks_sheen.pdf
	float sheenAlbedoScaling( vec3 wo, SurfaceRecord surf ) {

		float alpha = max( surf.sheenRoughness, 0.07 );
		alpha = alpha * alpha;

		float maxSheenColor = max( max( surf.sheenColor.r, surf.sheenColor.g ), surf.sheenColor.b );

		float eWo = directionalAlbedoSheen( saturateCos( wo.z ), alpha );

		return 1.0 - maxSheenColor * eWo;

	}

`;var dn=`

	// XYZ to sRGB color space
	const mat3 XYZ_TO_REC709 = mat3(
		3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);

	vec3 fresnel0ToIor( vec3 fresnel0 ) {

		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );

	}

	// Conversion FO/IOR
	vec3 iorToFresnel0( vec3 transmittedIor, float incidentIor ) {

		return square( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );

	}

	// ior is a value between 1.0 and 3.0. 1.0 is air interface
	float iorToFresnel0( float transmittedIor, float incidentIor ) {

		return square( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ) );

	}

	// Fresnel equations for dielectric/dielectric interfaces. See https://belcour.github.io/blog/research/2017/05/01/brdf-thin-film.html
	vec3 evalSensitivity( float OPD, vec3 shift ) {

		float phase = 2.0 * PI * OPD * 1.0e-9;

		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );

		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - square( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * square( phase ) );
		xyz /= 1.0685e-7;

		vec3 srgb = XYZ_TO_REC709 * xyz;
		return srgb;

	}

	// See Section 4. Analytic Spectral Integration, A Practical Extension to Microfacet Theory for the Modeling of Varying Iridescence, https://hal.archives-ouvertes.fr/hal-01518344/document
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {

		vec3 I;

		// Force iridescenceIor -> outsideIOR when thinFilmThickness -> 0.0
		float iridescenceIor = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );

		// Evaluate the cosTheta on the base layer (Snell law)
		float sinTheta2Sq = square( outsideIOR / iridescenceIor ) * ( 1.0 - square( cosTheta1 ) );

		// Handle TIR:
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {

			return vec3( 1.0 );

		}

		float cosTheta2 = sqrt( cosTheta2Sq );

		// First interface
		float R0 = iorToFresnel0( iridescenceIor, outsideIOR );
		float R12 = schlickFresnel( cosTheta1, R0 );
		float R21 = R12;
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIor < outsideIOR ) {

			phi12 = PI;

		}

		float phi21 = PI - phi12;

		// Second interface
		vec3 baseIOR = fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) ); // guard against 1.0
		vec3 R1 = iorToFresnel0( baseIOR, iridescenceIor );
		vec3 R23 = schlickFresnel( cosTheta2, R1 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[0] < iridescenceIor ) {

			phi23[ 0 ] = PI;

		}

		if ( baseIOR[1] < iridescenceIor ) {

			phi23[ 1 ] = PI;

		}

		if ( baseIOR[2] < iridescenceIor ) {

			phi23[ 2 ] = PI;

		}

		// Phase shift
		float OPD = 2.0 * iridescenceIor * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;

		// Compound terms
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = square( T121 ) * R23 / ( vec3( 1.0 ) - R123 );

		// Reflectance term for m = 0 (DC term amplitude)
		vec3 C0 = R12 + Rs;
		I = C0;

		// Reflectance term for m > 0 (pairs of diracs)
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {

			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;

		}

		// Since out of gamut colors might be produced, negative color values are clamped to 0.
		return max( I, vec3( 0.0 ) );

	}

`;var hn=`

	struct SurfaceRecord {

		// surface type
		bool volumeParticle;

		// geometry
		vec3 faceNormal;
		bool frontFace;
		vec3 normal;
		mat3 normalBasis;
		mat3 normalInvBasis;

		// cached properties
		float eta;
		float f0;

		// material
		float roughness;
		float filteredRoughness;
		float metalness;
		vec3 color;
		vec3 emission;

		// transmission
		float ior;
		float transmission;
		bool thinFilm;
		vec3 attenuationColor;
		float attenuationDistance;

		// clearcoat
		vec3 clearcoatNormal;
		mat3 clearcoatBasis;
		mat3 clearcoatInvBasis;
		float clearcoat;
		float clearcoatRoughness;
		float filteredClearcoatRoughness;

		// sheen
		float sheen;
		vec3 sheenColor;
		float sheenRoughness;

		// iridescence
		float iridescence;
		float iridescenceIor;
		float iridescenceThickness;

		// specular
		vec3 specularColor;
		float specularIntensity;
	};

	struct ScatterRecord {
		float specularPdf;
		float pdf;
		vec3 direction;
		vec3 color;
	};

	${fn}
	${mn}
	${dn}

	// diffuse
	float diffuseEval( vec3 wo, vec3 wi, vec3 wh, SurfaceRecord surf, inout vec3 color ) {

		// https://schuttejoe.github.io/post/disneybsdf/
		float fl = schlickFresnel( wi.z, 0.0 );
		float fv = schlickFresnel( wo.z, 0.0 );

		float metalFactor = ( 1.0 - surf.metalness );
		float transFactor = ( 1.0 - surf.transmission );
		float rr = 0.5 + 2.0 * surf.roughness * fl * fl;
		float retro = rr * ( fl + fv + fl * fv * ( rr - 1.0f ) );
		float lambert = ( 1.0f - 0.5f * fl ) * ( 1.0f - 0.5f * fv );

		// TODO: subsurface approx?

		// float F = evaluateFresnelWeight( dot( wo, wh ), surf.eta, surf.f0 );
		float F = disneyFresnel( wo, wi, wh, surf.f0, surf.eta, surf.metalness );
		color = ( 1.0 - F ) * transFactor * metalFactor * wi.z * surf.color * ( retro + lambert ) / PI;

		return wi.z / PI;

	}

	vec3 diffuseDirection( vec3 wo, SurfaceRecord surf ) {

		vec3 lightDirection = sampleSphere( rand2( 11 ) );
		lightDirection.z += 1.0;
		lightDirection = normalize( lightDirection );

		return lightDirection;

	}

	// specular
	float specularEval( vec3 wo, vec3 wi, vec3 wh, SurfaceRecord surf, inout vec3 color ) {

		// if roughness is set to 0 then D === NaN which results in black pixels
		float metalness = surf.metalness;
		float roughness = surf.filteredRoughness;

		float eta = surf.eta;
		float f0 = surf.f0;

		vec3 f0Color = mix( f0 * surf.specularColor * surf.specularIntensity, surf.color, surf.metalness );
		vec3 f90Color = vec3( mix( surf.specularIntensity, 1.0, surf.metalness ) );
		vec3 F = evaluateFresnel( dot( wo, wh ), eta, f0Color, f90Color );

		vec3 iridescenceF = evalIridescence( 1.0, surf.iridescenceIor, dot( wi, wh ), surf.iridescenceThickness, f0Color );
		F = mix( F, iridescenceF,  surf.iridescence );

		// PDF
		// See 14.1.1 Microfacet BxDFs in https://www.pbr-book.org/
		float incidentTheta = acos( wo.z );
		float G = ggxShadowMaskG2( wi, wo, roughness );
		float D = ggxDistribution( wh, roughness );
		float G1 = ggxShadowMaskG1( incidentTheta, roughness );
		float ggxPdf = D * G1 * max( 0.0, abs( dot( wo, wh ) ) ) / abs ( wo.z );

		color = wi.z * F * G * D / ( 4.0 * abs( wi.z * wo.z ) );
		return ggxPdf / ( 4.0 * dot( wo, wh ) );

	}

	vec3 specularDirection( vec3 wo, SurfaceRecord surf ) {

		// sample ggx vndf distribution which gives a new normal
		float roughness = surf.filteredRoughness;
		vec3 halfVector = ggxDirection(
			wo,
			vec2( roughness ),
			rand2( 12 )
		);

		// apply to new ray by reflecting off the new normal
		return - reflect( wo, halfVector );

	}


	// transmission
	/*
	float transmissionEval( vec3 wo, vec3 wi, vec3 wh, SurfaceRecord surf, inout vec3 color ) {

		// See section 4.2 in https://www.cs.cornell.edu/~srm/publications/EGSR07-btdf.pdf

		float filteredRoughness = surf.filteredRoughness;
		float eta = surf.eta;
		bool frontFace = surf.frontFace;
		bool thinFilm = surf.thinFilm;

		color = surf.transmission * surf.color;

		float denom = pow( eta * dot( wi, wh ) + dot( wo, wh ), 2.0 );
		return ggxPDF( wo, wh, filteredRoughness ) / denom;

	}

	vec3 transmissionDirection( vec3 wo, SurfaceRecord surf ) {

		float filteredRoughness = surf.filteredRoughness;
		float eta = surf.eta;
		bool frontFace = surf.frontFace;

		// sample ggx vndf distribution which gives a new normal
		vec3 halfVector = ggxDirection(
			wo,
			vec2( filteredRoughness ),
			rand2( 13 )
		);

		vec3 lightDirection = refract( normalize( - wo ), halfVector, eta );
		if ( surf.thinFilm ) {

			lightDirection = - refract( normalize( - lightDirection ), - vec3( 0.0, 0.0, 1.0 ), 1.0 / eta );

		}

		return normalize( lightDirection );

	}
	*/

	// TODO: This is just using a basic cosine-weighted specular distribution with an
	// incorrect PDF value at the moment. Update it to correctly use a GGX distribution
	float transmissionEval( vec3 wo, vec3 wi, vec3 wh, SurfaceRecord surf, inout vec3 color ) {

		color = surf.transmission * surf.color;

		// PDF
		// float F = evaluateFresnelWeight( dot( wo, wh ), surf.eta, surf.f0 );
		float F = disneyFresnel( wo, wi, wh, surf.f0, surf.eta, surf.metalness );
		if ( F >= 1.0 ) {

			return 0.0;

		}

		return 1.0 / ( 1.0 - F );

	}

	vec3 transmissionDirection( vec3 wo, SurfaceRecord surf ) {

		float roughness = surf.filteredRoughness;
		float eta = surf.eta;
		vec3 halfVector = normalize( vec3( 0.0, 0.0, 1.0 ) + sampleSphere( rand2( 13 ) ) * roughness );
		vec3 lightDirection = refract( normalize( - wo ), halfVector, eta );

		if ( surf.thinFilm ) {

			lightDirection = - refract( normalize( - lightDirection ), - vec3( 0.0, 0.0, 1.0 ), 1.0 / eta );

		}
		return normalize( lightDirection );

	}

	// clearcoat
	float clearcoatEval( vec3 wo, vec3 wi, vec3 wh, SurfaceRecord surf, inout vec3 color ) {

		float ior = 1.5;
		float f0 = iorRatioToF0( ior );
		bool frontFace = surf.frontFace;
		float roughness = surf.filteredClearcoatRoughness;

		float eta = frontFace ? 1.0 / ior : ior;
		float G = ggxShadowMaskG2( wi, wo, roughness );
		float D = ggxDistribution( wh, roughness );
		float F = schlickFresnel( dot( wi, wh ), f0 );

		float fClearcoat = F * D * G / ( 4.0 * abs( wi.z * wo.z ) );
		color = color * ( 1.0 - surf.clearcoat * F ) + fClearcoat * surf.clearcoat * wi.z;

		// PDF
		// See equation (27) in http://jcgt.org/published/0003/02/03/
		return ggxPDF( wo, wh, roughness ) / ( 4.0 * dot( wi, wh ) );

	}

	vec3 clearcoatDirection( vec3 wo, SurfaceRecord surf ) {

		// sample ggx vndf distribution which gives a new normal
		float roughness = surf.filteredClearcoatRoughness;
		vec3 halfVector = ggxDirection(
			wo,
			vec2( roughness ),
			rand2( 14 )
		);

		// apply to new ray by reflecting off the new normal
		return - reflect( wo, halfVector );

	}

	// sheen
	vec3 sheenColor( vec3 wo, vec3 wi, vec3 wh, SurfaceRecord surf ) {

		float cosThetaO = saturateCos( wo.z );
		float cosThetaI = saturateCos( wi.z );
		float cosThetaH = wh.z;

		float D = velvetD( cosThetaH, surf.sheenRoughness );
		float G = velvetG( cosThetaO, cosThetaI, surf.sheenRoughness );

		// See equation (1) in http://www.aconty.com/pdf/s2017_pbs_imageworks_sheen.pdf
		vec3 color = surf.sheenColor;
		color *= D * G / ( 4.0 * abs( cosThetaO * cosThetaI ) );
		color *= wi.z;

		return color;

	}

	// bsdf
	void getLobeWeights(
		vec3 wo, vec3 wi, vec3 wh, vec3 clearcoatWo, SurfaceRecord surf,
		inout float diffuseWeight, inout float specularWeight, inout float transmissionWeight, inout float clearcoatWeight
	) {

		float metalness = surf.metalness;
		float transmission = surf.transmission;
		// float fEstimate = evaluateFresnelWeight( dot( wo, wh ), surf.eta, surf.f0 );
		float fEstimate = disneyFresnel( wo, wi, wh, surf.f0, surf.eta, surf.metalness );

		float transSpecularProb = mix( max( 0.25, fEstimate ), 1.0, metalness );
		float diffSpecularProb = 0.5 + 0.5 * metalness;

		diffuseWeight = ( 1.0 - transmission ) * ( 1.0 - diffSpecularProb );
		specularWeight = transmission * transSpecularProb + ( 1.0 - transmission ) * diffSpecularProb;
		transmissionWeight = transmission * ( 1.0 - transSpecularProb );
		clearcoatWeight = surf.clearcoat * schlickFresnel( clearcoatWo.z, 0.04 );

		float totalWeight = diffuseWeight + specularWeight + transmissionWeight + clearcoatWeight;
		diffuseWeight /= totalWeight;
		specularWeight /= totalWeight;
		transmissionWeight /= totalWeight;
		clearcoatWeight /= totalWeight;
	}

	float bsdfEval(
		vec3 wo, vec3 clearcoatWo, vec3 wi, vec3 clearcoatWi, SurfaceRecord surf,
		float diffuseWeight, float specularWeight, float transmissionWeight, float clearcoatWeight, inout float specularPdf, inout vec3 color
	) {

		float metalness = surf.metalness;
		float transmission = surf.transmission;

		float spdf = 0.0;
		float dpdf = 0.0;
		float tpdf = 0.0;
		float cpdf = 0.0;
		color = vec3( 0.0 );

		vec3 halfVector = getHalfVector( wi, wo, surf.eta );

		// diffuse
		if ( diffuseWeight > 0.0 && wi.z > 0.0 ) {

			dpdf = diffuseEval( wo, wi, halfVector, surf, color );
			color *= 1.0 - surf.transmission;

		}

		// ggx specular
		if ( specularWeight > 0.0 && wi.z > 0.0 ) {

			vec3 outColor;
			spdf = specularEval( wo, wi, getHalfVector( wi, wo ), surf, outColor );
			color += outColor;

		}

		// transmission
		if ( transmissionWeight > 0.0 && wi.z < 0.0 ) {

			tpdf = transmissionEval( wo, wi, halfVector, surf, color );

		}

		// sheen
		color *= mix( 1.0, sheenAlbedoScaling( wo, wi, surf ), surf.sheen );
		color += sheenColor( wo, wi, halfVector, surf ) * surf.sheen;

		// clearcoat
		if ( clearcoatWi.z >= 0.0 && clearcoatWeight > 0.0 ) {

			vec3 clearcoatHalfVector = getHalfVector( clearcoatWo, clearcoatWi );
			cpdf = clearcoatEval( clearcoatWo, clearcoatWi, clearcoatHalfVector, surf, color );

		}

		float pdf =
			dpdf * diffuseWeight
			+ spdf * specularWeight
			+ tpdf * transmissionWeight
			+ cpdf * clearcoatWeight;

		// retrieve specular rays for the shadows flag
		specularPdf = spdf * specularWeight + cpdf * clearcoatWeight;

		return pdf;

	}

	float bsdfResult( vec3 worldWo, vec3 worldWi, SurfaceRecord surf, inout vec3 color ) {

		if ( surf.volumeParticle ) {

			color = surf.color / ( 4.0 * PI );
			return 1.0 / ( 4.0 * PI );

		}

		vec3 wo = normalize( surf.normalInvBasis * worldWo );
		vec3 wi = normalize( surf.normalInvBasis * worldWi );

		vec3 clearcoatWo = normalize( surf.clearcoatInvBasis * worldWo );
		vec3 clearcoatWi = normalize( surf.clearcoatInvBasis * worldWi );

		vec3 wh = getHalfVector( wo, wi, surf.eta );
		float diffuseWeight;
		float specularWeight;
		float transmissionWeight;
		float clearcoatWeight;
		getLobeWeights( wo, wi, wh, clearcoatWo, surf, diffuseWeight, specularWeight, transmissionWeight, clearcoatWeight );

		float specularPdf;
		return bsdfEval( wo, clearcoatWo, wi, clearcoatWi, surf, diffuseWeight, specularWeight, transmissionWeight, clearcoatWeight, specularPdf, color );

	}

	ScatterRecord bsdfSample( vec3 worldWo, SurfaceRecord surf ) {

		if ( surf.volumeParticle ) {

			ScatterRecord sampleRec;
			sampleRec.specularPdf = 0.0;
			sampleRec.pdf = 1.0 / ( 4.0 * PI );
			sampleRec.direction = sampleSphere( rand2( 16 ) );
			sampleRec.color = surf.color / ( 4.0 * PI );
			return sampleRec;

		}

		vec3 wo = normalize( surf.normalInvBasis * worldWo );
		vec3 clearcoatWo = normalize( surf.clearcoatInvBasis * worldWo );
		mat3 normalBasis = surf.normalBasis;
		mat3 invBasis = surf.normalInvBasis;
		mat3 clearcoatNormalBasis = surf.clearcoatBasis;
		mat3 clearcoatInvBasis = surf.clearcoatInvBasis;

		float diffuseWeight;
		float specularWeight;
		float transmissionWeight;
		float clearcoatWeight;
		// using normal and basically-reflected ray since we don't have proper half vector here
		getLobeWeights( wo, wo, vec3( 0, 0, 1 ), clearcoatWo, surf, diffuseWeight, specularWeight, transmissionWeight, clearcoatWeight );

		float pdf[4];
		pdf[0] = diffuseWeight;
		pdf[1] = specularWeight;
		pdf[2] = transmissionWeight;
		pdf[3] = clearcoatWeight;

		float cdf[4];
		cdf[0] = pdf[0];
		cdf[1] = pdf[1] + cdf[0];
		cdf[2] = pdf[2] + cdf[1];
		cdf[3] = pdf[3] + cdf[2];

		if( cdf[3] != 0.0 ) {

			float invMaxCdf = 1.0 / cdf[3];
			cdf[0] *= invMaxCdf;
			cdf[1] *= invMaxCdf;
			cdf[2] *= invMaxCdf;
			cdf[3] *= invMaxCdf;

		} else {

			cdf[0] = 1.0;
			cdf[1] = 0.0;
			cdf[2] = 0.0;
			cdf[3] = 0.0;

		}

		vec3 wi;
		vec3 clearcoatWi;

		float r = rand( 15 );
		if ( r <= cdf[0] ) { // diffuse

			wi = diffuseDirection( wo, surf );
			clearcoatWi = normalize( clearcoatInvBasis * normalize( normalBasis * wi ) );

		} else if ( r <= cdf[1] ) { // specular

			wi = specularDirection( wo, surf );
			clearcoatWi = normalize( clearcoatInvBasis * normalize( normalBasis * wi ) );

		} else if ( r <= cdf[2] ) { // transmission / refraction

			wi = transmissionDirection( wo, surf );
			clearcoatWi = normalize( clearcoatInvBasis * normalize( normalBasis * wi ) );

		} else if ( r <= cdf[3] ) { // clearcoat

			clearcoatWi = clearcoatDirection( clearcoatWo, surf );
			wi = normalize( invBasis * normalize( clearcoatNormalBasis * clearcoatWi ) );

		}

		ScatterRecord result;
		result.pdf = bsdfEval( wo, clearcoatWo, wi, clearcoatWi, surf, diffuseWeight, specularWeight, transmissionWeight, clearcoatWeight, result.specularPdf, result.color );
		result.direction = normalize( surf.normalBasis * wi );

		return result;

	}

`;var pn=`

	// returns the hit distance given the material density
	float intersectFogVolume( Material material, float u ) {

		// https://raytracing.github.io/books/RayTracingTheNextWeek.html#volumes/constantdensitymediums
		return material.opacity == 0.0 ? INFINITY : ( - 1.0 / material.opacity ) * log( u );

	}

	ScatterRecord sampleFogVolume( SurfaceRecord surf, vec2 uv ) {

		ScatterRecord sampleRec;
		sampleRec.specularPdf = 0.0;
		sampleRec.pdf = 1.0 / ( 2.0 * PI );
		sampleRec.direction = sampleSphere( uv );
		sampleRec.color = surf.color;
		return sampleRec;

	}

`;var gn=`

	// samples the the given environment map in the given direction
	vec3 sampleEquirectColor( sampler2D envMap, vec3 direction ) {

		return texture2D( envMap, equirectDirectionToUv( direction ) ).rgb;

	}

	// gets the pdf of the given direction to sample
	float equirectDirectionPdf( vec3 direction ) {

		vec2 uv = equirectDirectionToUv( direction );
		float theta = uv.y * PI;
		float sinTheta = sin( theta );
		if ( sinTheta == 0.0 ) {

			return 0.0;

		}

		return 1.0 / ( 2.0 * PI * PI * sinTheta );

	}

	// samples the color given env map with CDF and returns the pdf of the direction
	float sampleEquirect( vec3 direction, inout vec3 color ) {

		float totalSum = envMapInfo.totalSum;
		if ( totalSum == 0.0 ) {

			color = vec3( 0.0 );
			return 1.0;

		}

		vec2 uv = equirectDirectionToUv( direction );
		color = texture2D( envMapInfo.map, uv ).rgb;

		float lum = luminance( color );
		ivec2 resolution = textureSize( envMapInfo.map, 0 );
		float pdf = lum / totalSum;

		return float( resolution.x * resolution.y ) * pdf * equirectDirectionPdf( direction );

	}

	// samples a direction of the envmap with color and retrieves pdf
	float sampleEquirectProbability( vec2 r, inout vec3 color, inout vec3 direction ) {

		// sample env map cdf
		float v = texture2D( envMapInfo.marginalWeights, vec2( r.x, 0.0 ) ).x;
		float u = texture2D( envMapInfo.conditionalWeights, vec2( r.y, v ) ).x;
		vec2 uv = vec2( u, v );

		vec3 derivedDirection = equirectUvToDirection( uv );
		direction = derivedDirection;
		color = texture2D( envMapInfo.map, uv ).rgb;

		float totalSum = envMapInfo.totalSum;
		float lum = luminance( color );
		ivec2 resolution = textureSize( envMapInfo.map, 0 );
		float pdf = lum / totalSum;

		return float( resolution.x * resolution.y ) * pdf * equirectDirectionPdf( direction );

	}

`;var xn=`

	float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {

		return smoothstep( coneCosine, penumbraCosine, angleCosine );

	}

	float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {

		// based upon Frostbite 3 Moving to Physically-based Rendering
		// page 32, equation 26: E[window1]
		// https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), EPSILON );

		if ( cutoffDistance > 0.0 ) {

			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );

		}

		return distanceFalloff;

	}

	float getPhotometricAttenuation( sampler2DArray iesProfiles, int iesProfile, vec3 posToLight, vec3 lightDir, vec3 u, vec3 v ) {

		float cosTheta = dot( posToLight, lightDir );
		float angle = acos( cosTheta ) * ( 1.0 / PI );

		return texture2D( iesProfiles, vec3( 0.0, angle, iesProfile ) ).r;

	}

	struct LightRecord {

		float dist;
		vec3 direction;
		float pdf;
		vec3 emission;
		int type;

	};

	bool intersectLightAtIndex( sampler2D lights, vec3 rayOrigin, vec3 rayDirection, uint l, inout LightRecord lightRec ) {

		bool didHit = false;
		Light light = readLightInfo( lights, l );

		vec3 u = light.u;
		vec3 v = light.v;

		// check for backface
		vec3 normal = normalize( cross( u, v ) );
		if ( dot( normal, rayDirection ) > 0.0 ) {

			u *= 1.0 / dot( u, u );
			v *= 1.0 / dot( v, v );

			float dist;

			// MIS / light intersection is not supported for punctual lights.
			if(
				( light.type == RECT_AREA_LIGHT_TYPE && intersectsRectangle( light.position, normal, u, v, rayOrigin, rayDirection, dist ) ) ||
				( light.type == CIRC_AREA_LIGHT_TYPE && intersectsCircle( light.position, normal, u, v, rayOrigin, rayDirection, dist ) )
			) {

				float cosTheta = dot( rayDirection, normal );
				didHit = true;
				lightRec.dist = dist;
				lightRec.pdf = ( dist * dist ) / ( light.area * cosTheta );
				lightRec.emission = light.color * light.intensity;
				lightRec.direction = rayDirection;
				lightRec.type = light.type;

			}

		}

		return didHit;

	}

	LightRecord randomAreaLightSample( Light light, vec3 rayOrigin, vec2 ruv ) {

		vec3 randomPos;
		if( light.type == RECT_AREA_LIGHT_TYPE ) {

			// rectangular area light
			randomPos = light.position + light.u * ( ruv.x - 0.5 ) + light.v * ( ruv.y - 0.5 );

		} else if( light.type == CIRC_AREA_LIGHT_TYPE ) {

			// circular area light
			float r = 0.5 * sqrt( ruv.x );
			float theta = ruv.y * 2.0 * PI;
			float x = r * cos( theta );
			float y = r * sin( theta );

			randomPos = light.position + light.u * x + light.v * y;

		}

		vec3 toLight = randomPos - rayOrigin;
		float lightDistSq = dot( toLight, toLight );
		float dist = sqrt( lightDistSq );
		vec3 direction = toLight / dist;
		vec3 lightNormal = normalize( cross( light.u, light.v ) );

		LightRecord lightRec;
		lightRec.type = light.type;
		lightRec.emission = light.color * light.intensity;
		lightRec.dist = dist;
		lightRec.direction = direction;

		// TODO: the denominator is potentially zero
		lightRec.pdf = lightDistSq / ( light.area * dot( direction, lightNormal ) );

		return lightRec;

	}

	LightRecord randomSpotLightSample( Light light, sampler2DArray iesProfiles, vec3 rayOrigin, vec2 ruv ) {

		float radius = light.radius * sqrt( ruv.x );
		float theta = ruv.y * 2.0 * PI;
		float x = radius * cos( theta );
		float y = radius * sin( theta );

		vec3 u = light.u;
		vec3 v = light.v;
		vec3 normal = normalize( cross( u, v ) );

		float angle = acos( light.coneCos );
		float angleTan = tan( angle );
		float startDistance = light.radius / max( angleTan, EPSILON );

		vec3 randomPos = light.position - normal * startDistance + u * x + v * y;
		vec3 toLight = randomPos - rayOrigin;
		float lightDistSq = dot( toLight, toLight );
		float dist = sqrt( lightDistSq );

		vec3 direction = toLight / max( dist, EPSILON );
		float cosTheta = dot( direction, normal );

		float spotAttenuation = light.iesProfile != - 1 ?
			getPhotometricAttenuation( iesProfiles, light.iesProfile, direction, normal, u, v ) :
			getSpotAttenuation( light.coneCos, light.penumbraCos, cosTheta );

		float distanceAttenuation = getDistanceAttenuation( dist, light.distance, light.decay );
		LightRecord lightRec;
		lightRec.type = light.type;
		lightRec.dist = dist;
		lightRec.direction = direction;
		lightRec.emission = light.color * light.intensity * distanceAttenuation * spotAttenuation;
		lightRec.pdf = 1.0;

		return lightRec;

	}

	LightRecord randomLightSample( sampler2D lights, sampler2DArray iesProfiles, uint lightCount, vec3 rayOrigin, vec3 ruv ) {

		LightRecord result;

		// pick a random light
		uint l = uint( ruv.x * float( lightCount ) );
		Light light = readLightInfo( lights, l );

		if ( light.type == SPOT_LIGHT_TYPE ) {

			result = randomSpotLightSample( light, iesProfiles, rayOrigin, ruv.yz );

		} else if ( light.type == POINT_LIGHT_TYPE ) {

			vec3 lightRay = light.u - rayOrigin;
			float lightDist = length( lightRay );
			float cutoffDistance = light.distance;
			float distanceFalloff = 1.0 / max( pow( lightDist, light.decay ), 0.01 );
			if ( cutoffDistance > 0.0 ) {

				distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDist / cutoffDistance ) ) );

			}

			LightRecord rec;
			rec.direction = normalize( lightRay );
			rec.dist = length( lightRay );
			rec.pdf = 1.0;
			rec.emission = light.color * light.intensity * distanceFalloff;
			rec.type = light.type;
			result = rec;

		} else if ( light.type == DIR_LIGHT_TYPE ) {

			LightRecord rec;
			rec.dist = 1e10;
			rec.direction = light.u;
			rec.pdf = 1.0;
			rec.emission = light.color * light.intensity;
			rec.type = light.type;

			result = rec;

		} else {

			// sample the light
			result = randomAreaLightSample( light, rayOrigin, ruv.yz );

		}

		return result;

	}

`;var vn=`

	vec3 sampleHemisphere( vec3 n, vec2 uv ) {

		// https://www.rorydriscoll.com/2009/01/07/better-sampling/
		// https://graphics.pixar.com/library/OrthonormalB/paper.pdf
		float sign = n.z == 0.0 ? 1.0 : sign( n.z );
		float a = - 1.0 / ( sign + n.z );
		float b = n.x * n.y * a;
		vec3 b1 = vec3( 1.0 + sign * n.x * n.x * a, sign * b, - sign * n.x );
		vec3 b2 = vec3( b, sign + n.y * n.y * a, - n.y );

		float r = sqrt( uv.x );
		float theta = 2.0 * PI * uv.y;
		float x = r * cos( theta );
		float y = r * sin( theta );
		return x * b1 + y * b2 + sqrt( 1.0 - uv.x ) * n;

	}

	vec2 sampleTriangle( vec2 a, vec2 b, vec2 c, vec2 r ) {

		// get the edges of the triangle and the diagonal across the
		// center of the parallelogram
		vec2 e1 = a - b;
		vec2 e2 = c - b;
		vec2 diag = normalize( e1 + e2 );

		// pick the point in the parallelogram
		if ( r.x + r.y > 1.0 ) {

			r = vec2( 1.0 ) - r;

		}

		return e1 * r.x + e2 * r.y;

	}

	vec2 sampleCircle( vec2 uv ) {

		float angle = 2.0 * PI * uv.x;
		float radius = sqrt( uv.y );
		return vec2( cos( angle ), sin( angle ) ) * radius;

	}

	vec3 sampleSphere( vec2 uv ) {

		float u = ( uv.x - 0.5 ) * 2.0;
		float t = uv.y * PI * 2.0;
		float f = sqrt( 1.0 - u * u );

		return vec3( f * cos( t ), f * sin( t ), u );

	}

	vec2 sampleRegularPolygon( int sides, vec3 uvw ) {

		sides = max( sides, 3 );

		vec3 r = uvw;
		float anglePerSegment = 2.0 * PI / float( sides );
		float segment = floor( float( sides ) * r.x );

		float angle1 = anglePerSegment * segment;
		float angle2 = angle1 + anglePerSegment;
		vec2 a = vec2( sin( angle1 ), cos( angle1 ) );
		vec2 b = vec2( 0.0, 0.0 );
		vec2 c = vec2( sin( angle2 ), cos( angle2 ) );

		return sampleTriangle( a, b, c, r.yz );

	}

	// samples an aperture shape with the given number of sides. 0 means circle
	vec2 sampleAperture( int blades, vec3 uvw ) {

		return blades == 0 ?
			sampleCircle( uvw.xy ) :
			sampleRegularPolygon( blades, uvw );

	}


`;var yn=`

	// Finds the point where the ray intersects the plane defined by u and v and checks if this point
	// falls in the bounds of the rectangle on that same plane.
	// Plane intersection: https://lousodrome.net/blog/light/2020/07/03/intersection-of-a-ray-and-a-plane/
	bool intersectsRectangle( vec3 center, vec3 normal, vec3 u, vec3 v, vec3 rayOrigin, vec3 rayDirection, inout float dist ) {

		float t = dot( center - rayOrigin, normal ) / dot( rayDirection, normal );

		if ( t > EPSILON ) {

			vec3 p = rayOrigin + rayDirection * t;
			vec3 vi = p - center;

			// check if p falls inside the rectangle
			float a1 = dot( u, vi );
			if ( abs( a1 ) <= 0.5 ) {

				float a2 = dot( v, vi );
				if ( abs( a2 ) <= 0.5 ) {

					dist = t;
					return true;

				}

			}

		}

		return false;

	}

	// Finds the point where the ray intersects the plane defined by u and v and checks if this point
	// falls in the bounds of the circle on that same plane. See above URL for a description of the plane intersection algorithm.
	bool intersectsCircle( vec3 position, vec3 normal, vec3 u, vec3 v, vec3 rayOrigin, vec3 rayDirection, inout float dist ) {

		float t = dot( position - rayOrigin, normal ) / dot( rayDirection, normal );

		if ( t > EPSILON ) {

			vec3 hit = rayOrigin + rayDirection * t;
			vec3 vi = hit - position;

			float a1 = dot( u, vi );
			float a2 = dot( v, vi );

			if( length( vec2( a1, a2 ) ) <= 0.5 ) {

				dist = t;
				return true;

			}

		}

		return false;

	}

`;var bn=`

	// Fast arccos approximation used to remove banding artifacts caused by numerical errors in acos.
	// This is a cubic Lagrange interpolating polynomial for x = [-1, -1/2, 0, 1/2, 1].
	// For more information see: https://github.com/gkjohnson/three-gpu-pathtracer/pull/171#issuecomment-1152275248
	float acosApprox( float x ) {

		x = clamp( x, -1.0, 1.0 );
		return ( - 0.69813170079773212 * x * x - 0.87266462599716477 ) * x + 1.5707963267948966;

	}

	// An acos with input values bound to the range [-1, 1].
	float acosSafe( float x ) {

		return acos( clamp( x, -1.0, 1.0 ) );

	}

	float saturateCos( float val ) {

		return clamp( val, 0.001, 1.0 );

	}

	float square( float t ) {

		return t * t;

	}

	vec2 square( vec2 t ) {

		return t * t;

	}

	vec3 square( vec3 t ) {

		return t * t;

	}

	vec4 square( vec4 t ) {

		return t * t;

	}

	vec2 rotateVector( vec2 v, float t ) {

		float ac = cos( t );
		float as = sin( t );
		return vec2(
			v.x * ac - v.y * as,
			v.x * as + v.y * ac
		);

	}

	// forms a basis with the normal vector as Z
	mat3 getBasisFromNormal( vec3 normal ) {

		vec3 other;
		if ( abs( normal.x ) > 0.5 ) {

			other = vec3( 0.0, 1.0, 0.0 );

		} else {

			other = vec3( 1.0, 0.0, 0.0 );

		}

		vec3 ortho = normalize( cross( normal, other ) );
		vec3 ortho2 = normalize( cross( normal, ortho ) );
		return mat3( ortho2, ortho, normal );

	}

`;var Tn=`

	bool totalInternalReflection( float cosTheta, float eta ) {

		float sinTheta = sqrt( 1.0 - cosTheta * cosTheta );
		return eta * sinTheta > 1.0;

	}

	// https://google.github.io/filament/Filament.md.html#materialsystem/diffusebrdf
	float schlickFresnel( float cosine, float f0 ) {

		return f0 + ( 1.0 - f0 ) * pow( 1.0 - cosine, 5.0 );

	}

	vec3 schlickFresnel( float cosine, vec3 f0 ) {

		return f0 + ( 1.0 - f0 ) * pow( 1.0 - cosine, 5.0 );

	}

	vec3 schlickFresnel( float cosine, vec3 f0, vec3 f90 ) {

		return f0 + ( f90 - f0 ) * pow( 1.0 - cosine, 5.0 );

	}

	float dielectricFresnel( float cosThetaI, float eta ) {

		// https://schuttejoe.github.io/post/disneybsdf/
		float ni = eta;
		float nt = 1.0;

		// Check for total internal reflection
		float sinThetaISq = 1.0f - cosThetaI * cosThetaI;
		float sinThetaTSq = eta * eta * sinThetaISq;
		if( sinThetaTSq >= 1.0 ) {

			return 1.0;

		}

		float sinThetaT = sqrt( sinThetaTSq );

		float cosThetaT = sqrt( max( 0.0, 1.0f - sinThetaT * sinThetaT ) );
		float rParallel = ( ( nt * cosThetaI ) - ( ni * cosThetaT ) ) / ( ( nt * cosThetaI ) + ( ni * cosThetaT ) );
		float rPerpendicular = ( ( ni * cosThetaI ) - ( nt * cosThetaT ) ) / ( ( ni * cosThetaI ) + ( nt * cosThetaT ) );
		return ( rParallel * rParallel + rPerpendicular * rPerpendicular ) / 2.0;

	}

	// https://raytracing.github.io/books/RayTracingInOneWeekend.html#dielectrics/schlickapproximation
	float iorRatioToF0( float eta ) {

		return pow( ( 1.0 - eta ) / ( 1.0 + eta ), 2.0 );

	}

	vec3 evaluateFresnel( float cosTheta, float eta, vec3 f0, vec3 f90 ) {

		if ( totalInternalReflection( cosTheta, eta ) ) {

			return f90;

		}

		return schlickFresnel( cosTheta, f0, f90 );

	}

	// TODO: disney fresnel was removed and replaced with this fresnel function to better align with
	// the glTF but is causing blown out pixels. Should be revisited
	// float evaluateFresnelWeight( float cosTheta, float eta, float f0 ) {

	// 	if ( totalInternalReflection( cosTheta, eta ) ) {

	// 		return 1.0;

	// 	}

	// 	return schlickFresnel( cosTheta, f0 );

	// }

	// https://schuttejoe.github.io/post/disneybsdf/
	float disneyFresnel( vec3 wo, vec3 wi, vec3 wh, float f0, float eta, float metalness ) {

		float dotHV = dot( wo, wh );
		if ( totalInternalReflection( dotHV, eta ) ) {

			return 1.0;

		}

		float dotHL = dot( wi, wh );
		float dielectricFresnel = dielectricFresnel( abs( dotHV ), eta );
		float metallicFresnel = schlickFresnel( dotHL, f0 );

		return mix( dielectricFresnel, metallicFresnel, metalness );

	}

`;var wn=`

	// add texel fetch functions for texture arrays
	vec4 texelFetch1D( sampler2DArray tex, int layer, uint index ) {

		uint width = uint( textureSize( tex, 0 ).x );
		uvec2 uv;
		uv.x = index % width;
		uv.y = index / width;

		return texelFetch( tex, ivec3( uv, layer ), 0 );

	}

	vec4 textureSampleBarycoord( sampler2DArray tex, int layer, vec3 barycoord, uvec3 faceIndices ) {

		return
			barycoord.x * texelFetch1D( tex, layer, faceIndices.x ) +
			barycoord.y * texelFetch1D( tex, layer, faceIndices.y ) +
			barycoord.z * texelFetch1D( tex, layer, faceIndices.z );

	}

`;var li=`

	// https://www.shadertoy.com/view/wltcRS
	uvec4 WHITE_NOISE_SEED;

	void rng_initialize( vec2 p, int frame ) {

		// white noise seed
		WHITE_NOISE_SEED = uvec4( p, uint( frame ), uint( p.x ) + uint( p.y ) );

	}

	// https://www.pcg-random.org/
	void pcg4d( inout uvec4 v ) {

		v = v * 1664525u + 1013904223u;
		v.x += v.y * v.w;
		v.y += v.z * v.x;
		v.z += v.x * v.y;
		v.w += v.y * v.z;
		v = v ^ ( v >> 16u );
		v.x += v.y*v.w;
		v.y += v.z*v.x;
		v.z += v.x*v.y;
		v.w += v.y*v.z;

	}

	// returns [ 0, 1 ]
	float pcgRand() {

		pcg4d( WHITE_NOISE_SEED );
		return float( WHITE_NOISE_SEED.x ) / float( 0xffffffffu );

	}

	vec2 pcgRand2() {

		pcg4d( WHITE_NOISE_SEED );
		return vec2( WHITE_NOISE_SEED.xy ) / float(0xffffffffu);

	}

	vec3 pcgRand3() {

		pcg4d( WHITE_NOISE_SEED );
		return vec3( WHITE_NOISE_SEED.xyz ) / float( 0xffffffffu );

	}

	vec4 pcgRand4() {

		pcg4d( WHITE_NOISE_SEED );
		return vec4( WHITE_NOISE_SEED ) / float( 0xffffffffu );

	}
`;var Sn=`

	struct Ray {

		vec3 origin;
		vec3 direction;

	};

	struct SurfaceHit {

		uvec4 faceIndices;
		vec3 barycoord;
		vec3 faceNormal;
		float side;
		float dist;

	};

	struct RenderState {

		bool firstRay;
		bool transmissiveRay;
		bool isShadowRay;
		float accumulatedRoughness;
		int transmissiveTraversals;
		int traversals;
		uint depth;
		vec3 throughputColor;
		Material fogMaterial;

	};

	RenderState initRenderState() {

		RenderState result;
		result.firstRay = true;
		result.transmissiveRay = true;
		result.isShadowRay = false;
		result.accumulatedRoughness = 0.0;
		result.transmissiveTraversals = 0;
		result.traversals = 0;
		result.throughputColor = vec3( 1.0 );
		result.depth = 0u;
		result.fogMaterial.fogVolume = false;
		return result;

	}

`;var An=`

	vec3 ndcToRayOrigin( vec2 coord ) {

		vec4 rayOrigin4 = cameraWorldMatrix * invProjectionMatrix * vec4( coord, - 1.0, 1.0 );
		return rayOrigin4.xyz / rayOrigin4.w;
	}

	Ray getCameraRay() {

		vec2 ssd = vec2( 1.0 ) / resolution;

		// Jitter the camera ray by finding a uv coordinate at a random sample
		// around this pixel's UV coordinate for AA
		vec2 ruv = rand2( 0 );
		vec2 jitteredUv = vUv + vec2( tentFilter( ruv.x ) * ssd.x, tentFilter( ruv.y ) * ssd.y );
		Ray ray;

		#if CAMERA_TYPE == 2

			// Equirectangular projection
			vec4 rayDirection4 = vec4( equirectUvToDirection( jitteredUv ), 0.0 );
			vec4 rayOrigin4 = vec4( 0.0, 0.0, 0.0, 1.0 );

			rayDirection4 = cameraWorldMatrix * rayDirection4;
			rayOrigin4 = cameraWorldMatrix * rayOrigin4;

			ray.direction = normalize( rayDirection4.xyz );
			ray.origin = rayOrigin4.xyz / rayOrigin4.w;

		#else

			// get [- 1, 1] normalized device coordinates
			vec2 ndc = 2.0 * jitteredUv - vec2( 1.0 );
			ray.origin = ndcToRayOrigin( ndc );

			#if CAMERA_TYPE == 1

				// Orthographic projection
				ray.direction = ( cameraWorldMatrix * vec4( 0.0, 0.0, - 1.0, 0.0 ) ).xyz;
				ray.direction = normalize( ray.direction );

			#else

				// Perspective projection
				ray.direction = normalize( mat3( cameraWorldMatrix ) * ( invProjectionMatrix * vec4( ndc, 0.0, 1.0 ) ).xyz );

			#endif

		#endif

		#if FEATURE_DOF
		{

			// depth of field
			vec3 focalPoint = ray.origin + normalize( ray.direction ) * physicalCamera.focusDistance;

			// get the aperture sample
			// if blades === 0 then we assume a circle
			vec3 shapeUVW= rand3( 1 );
			int blades = physicalCamera.apertureBlades;
			float anamorphicRatio = physicalCamera.anamorphicRatio;
			vec2 apertureSample = blades == 0 ? sampleCircle( shapeUVW.xy ) : sampleRegularPolygon( blades, shapeUVW );
			apertureSample *= physicalCamera.bokehSize * 0.5 * 1e-3;

			// rotate the aperture shape
			apertureSample =
				rotateVector( apertureSample, physicalCamera.apertureRotation ) *
				saturate( vec2( anamorphicRatio, 1.0 / anamorphicRatio ) );

			// create the new ray
			ray.origin += ( cameraWorldMatrix * vec4( apertureSample, 0.0, 0.0 ) ).xyz;
			ray.direction = focalPoint - ray.origin;

		}
		#endif

		ray.direction = normalize( ray.direction );

		return ray;

	}

`;var In=`

	// step through multiple surface hits and accumulate color attenuation based on transmissive surfaces
	// returns true if a solid surface was hit
	bool attenuateHit(
		RenderState state,
		Ray ray, float rayDist,
		out vec3 color
	) {

		// store the original bounce index so we can reset it after
		uint originalBounceIndex = sobolBounceIndex;

		int traversals = state.traversals;
		int transmissiveTraversals = state.transmissiveTraversals;
		bool isShadowRay = state.isShadowRay;
		Material fogMaterial = state.fogMaterial;

		vec3 startPoint = ray.origin;

		// hit results
		SurfaceHit surfaceHit;

		color = vec3( 1.0 );

		bool result = true;
		for ( int i = 0; i < traversals; i ++ ) {

			sobolBounceIndex ++;

			int hitType = traceScene( ray, fogMaterial, surfaceHit );

			if ( hitType == FOG_HIT ) {

				result = true;
				break;

			} else if ( hitType == SURFACE_HIT ) {

				float totalDist = distance( startPoint, ray.origin + ray.direction * surfaceHit.dist );
				if ( totalDist > rayDist ) {

					result = false;
					break;

				}

				// TODO: attenuate the contribution based on the PDF of the resulting ray including refraction values
				// Should be able to work using the material BSDF functions which will take into account specularity, etc.
				// TODO: should we account for emissive surfaces here?

				uint materialIndex = uTexelFetch1D( materialIndexAttribute, surfaceHit.faceIndices.x ).r;
				Material material = readMaterialInfo( materials, materialIndex );

				// adjust the ray to the new surface
				bool isEntering = surfaceHit.side == 1.0;
				ray.origin = stepRayOrigin( ray.origin, ray.direction, - surfaceHit.faceNormal, surfaceHit.dist );

				#if FEATURE_FOG

				if ( material.fogVolume ) {

					fogMaterial = material;
					fogMaterial.fogVolume = surfaceHit.side == 1.0;
					i -= sign( transmissiveTraversals );
					transmissiveTraversals --;
					continue;

				}

				#endif

				if ( ! material.castShadow && isShadowRay ) {

					continue;

				}

				vec2 uv = textureSampleBarycoord( attributesArray, ATTR_UV, surfaceHit.barycoord, surfaceHit.faceIndices.xyz ).xy;
				vec4 vertexColor = textureSampleBarycoord( attributesArray, ATTR_COLOR, surfaceHit.barycoord, surfaceHit.faceIndices.xyz );

				// albedo
				vec4 albedo = vec4( material.color, material.opacity );
				if ( material.map != - 1 ) {

					vec3 uvPrime = material.mapTransform * vec3( uv, 1 );
					albedo *= texture2D( textures, vec3( uvPrime.xy, material.map ) );

				}

				if ( material.vertexColors ) {

					albedo *= vertexColor;

				}

				// alphaMap
				if ( material.alphaMap != - 1 ) {

					albedo.a *= texture2D( textures, vec3( uv, material.alphaMap ) ).x;

				}

				// transmission
				float transmission = material.transmission;
				if ( material.transmissionMap != - 1 ) {

					vec3 uvPrime = material.transmissionMapTransform * vec3( uv, 1 );
					transmission *= texture2D( textures, vec3( uvPrime.xy, material.transmissionMap ) ).r;

				}

				// metalness
				float metalness = material.metalness;
				if ( material.metalnessMap != - 1 ) {

					vec3 uvPrime = material.metalnessMapTransform * vec3( uv, 1 );
					metalness *= texture2D( textures, vec3( uvPrime.xy, material.metalnessMap ) ).b;

				}

				float alphaTest = material.alphaTest;
				bool useAlphaTest = alphaTest != 0.0;
				float transmissionFactor = ( 1.0 - metalness ) * transmission;
				if (
					transmissionFactor < rand( 9 ) && ! (
						// material sidedness
						material.side != 0.0 && surfaceHit.side == material.side

						// alpha test
						|| useAlphaTest && albedo.a < alphaTest

						// opacity
						|| material.transparent && ! useAlphaTest && albedo.a < rand( 10 )
					)
				) {

					result = true;
					break;

				}

				if ( surfaceHit.side == 1.0 && isEntering ) {

					// only attenuate by surface color on the way in
					color *= mix( vec3( 1.0 ), albedo.rgb, transmissionFactor );

				} else if ( surfaceHit.side == - 1.0 ) {

					// attenuate by medium once we hit the opposite side of the model
					color *= transmissionAttenuation( surfaceHit.dist, material.attenuationColor, material.attenuationDistance );

				}

				bool isTransmissiveRay = dot( ray.direction, surfaceHit.faceNormal * surfaceHit.side ) < 0.0;
				if ( ( isTransmissiveRay || isEntering ) && transmissiveTraversals > 0 ) {

					i -= sign( transmissiveTraversals );
					transmissiveTraversals --;

				}

			} else {

				result = false;
				break;

			}

		}

		// reset the bounce index
		sobolBounceIndex = originalBounceIndex;
		return result;

	}

`;var Rn=`

	#define NO_HIT 0
	#define SURFACE_HIT 1
	#define LIGHT_HIT 2
	#define FOG_HIT 3

	// Passing the global variable 'lights' into this function caused shader program errors.
	// So global variables like 'lights' and 'bvh' were moved out of the function parameters.
	// For more information, refer to: https://github.com/gkjohnson/three-gpu-pathtracer/pull/457
	int traceScene(

		Ray ray, Material fogMaterial, inout SurfaceHit surfaceHit

	) {

		int result = NO_HIT;
		bool hit = bvhIntersectFirstHit( bvh, ray.origin, ray.direction, surfaceHit.faceIndices, surfaceHit.faceNormal, surfaceHit.barycoord, surfaceHit.side, surfaceHit.dist );

		#if FEATURE_FOG

		if ( fogMaterial.fogVolume ) {

			// offset the distance so we don't run into issues with particles on the same surface
			// as other objects
			float particleDist = intersectFogVolume( fogMaterial, rand( 1 ) );
			if ( particleDist + RAY_OFFSET < surfaceHit.dist ) {

				surfaceHit.side = 1.0;
				surfaceHit.faceNormal = normalize( - ray.direction );
				surfaceHit.dist = particleDist;
				return FOG_HIT;

			}

		}

		#endif

		if ( hit ) {

			result = SURFACE_HIT;

		}

		return result;

	}

`;var _n=`

	#define SKIP_SURFACE 0
	#define HIT_SURFACE 1
	int getSurfaceRecord(
		Material material, SurfaceHit surfaceHit, sampler2DArray attributesArray,
		float accumulatedRoughness,
		inout SurfaceRecord surf
	) {

		if ( material.fogVolume ) {

			vec3 normal = vec3( 0, 0, 1 );

			SurfaceRecord fogSurface;
			fogSurface.volumeParticle = true;
			fogSurface.color = material.color;
			fogSurface.emission = material.emissiveIntensity * material.emissive;
			fogSurface.normal = normal;
			fogSurface.faceNormal = normal;
			fogSurface.clearcoatNormal = normal;

			surf = fogSurface;
			return HIT_SURFACE;

		}

		// uv coord for textures
		vec2 uv = textureSampleBarycoord( attributesArray, ATTR_UV, surfaceHit.barycoord, surfaceHit.faceIndices.xyz ).xy;
		vec4 vertexColor = textureSampleBarycoord( attributesArray, ATTR_COLOR, surfaceHit.barycoord, surfaceHit.faceIndices.xyz );

		// albedo
		vec4 albedo = vec4( material.color, material.opacity );
		if ( material.map != - 1 ) {

			vec3 uvPrime = material.mapTransform * vec3( uv, 1 );
			albedo *= texture2D( textures, vec3( uvPrime.xy, material.map ) );

		}

		if ( material.vertexColors ) {

			albedo *= vertexColor;

		}

		// alphaMap
		if ( material.alphaMap != - 1 ) {

			albedo.a *= texture2D( textures, vec3( uv, material.alphaMap ) ).x;

		}

		// possibly skip this sample if it's transparent, alpha test is enabled, or we hit the wrong material side
		// and it's single sided.
		// - alpha test is disabled when it === 0
		// - the material sidedness test is complicated because we want light to pass through the back side but still
		// be able to see the front side. This boolean checks if the side we hit is the front side on the first ray
		// and we're rendering the other then we skip it. Do the opposite on subsequent bounces to get incoming light.
		float alphaTest = material.alphaTest;
		bool useAlphaTest = alphaTest != 0.0;
		if (
			// material sidedness
			material.side != 0.0 && surfaceHit.side != material.side

			// alpha test
			|| useAlphaTest && albedo.a < alphaTest

			// opacity
			|| material.transparent && ! useAlphaTest && albedo.a < rand( 3 )
		) {

			return SKIP_SURFACE;

		}

		// fetch the interpolated smooth normal
		vec3 normal = normalize( textureSampleBarycoord(
			attributesArray,
			ATTR_NORMAL,
			surfaceHit.barycoord,
			surfaceHit.faceIndices.xyz
		).xyz );

		// roughness
		float roughness = material.roughness;
		if ( material.roughnessMap != - 1 ) {

			vec3 uvPrime = material.roughnessMapTransform * vec3( uv, 1 );
			roughness *= texture2D( textures, vec3( uvPrime.xy, material.roughnessMap ) ).g;

		}

		// metalness
		float metalness = material.metalness;
		if ( material.metalnessMap != - 1 ) {

			vec3 uvPrime = material.metalnessMapTransform * vec3( uv, 1 );
			metalness *= texture2D( textures, vec3( uvPrime.xy, material.metalnessMap ) ).b;

		}

		// emission
		vec3 emission = material.emissiveIntensity * material.emissive;
		if ( material.emissiveMap != - 1 ) {

			vec3 uvPrime = material.emissiveMapTransform * vec3( uv, 1 );
			emission *= texture2D( textures, vec3( uvPrime.xy, material.emissiveMap ) ).xyz;

		}

		// transmission
		float transmission = material.transmission;
		if ( material.transmissionMap != - 1 ) {

			vec3 uvPrime = material.transmissionMapTransform * vec3( uv, 1 );
			transmission *= texture2D( textures, vec3( uvPrime.xy, material.transmissionMap ) ).r;

		}

		// normal
		if ( material.flatShading ) {

			// if we're rendering a flat shaded object then use the face normals - the face normal
			// is provided based on the side the ray hits the mesh so flip it to align with the
			// interpolated vertex normals.
			normal = surfaceHit.faceNormal * surfaceHit.side;

		}

		vec3 baseNormal = normal;
		if ( material.normalMap != - 1 ) {

			vec4 tangentSample = textureSampleBarycoord(
				attributesArray,
				ATTR_TANGENT,
				surfaceHit.barycoord,
				surfaceHit.faceIndices.xyz
			);

			// some provided tangents can be malformed (0, 0, 0) causing the normal to be degenerate
			// resulting in NaNs and slow path tracing.
			if ( length( tangentSample.xyz ) > 0.0 ) {

				vec3 tangent = normalize( tangentSample.xyz );
				vec3 bitangent = normalize( cross( normal, tangent ) * tangentSample.w );
				mat3 vTBN = mat3( tangent, bitangent, normal );

				vec3 uvPrime = material.normalMapTransform * vec3( uv, 1 );
				vec3 texNormal = texture2D( textures, vec3( uvPrime.xy, material.normalMap ) ).xyz * 2.0 - 1.0;
				texNormal.xy *= material.normalScale;
				normal = vTBN * texNormal;

			}

		}

		normal *= surfaceHit.side;

		// clearcoat
		float clearcoat = material.clearcoat;
		if ( material.clearcoatMap != - 1 ) {

			vec3 uvPrime = material.clearcoatMapTransform * vec3( uv, 1 );
			clearcoat *= texture2D( textures, vec3( uvPrime.xy, material.clearcoatMap ) ).r;

		}

		// clearcoatRoughness
		float clearcoatRoughness = material.clearcoatRoughness;
		if ( material.clearcoatRoughnessMap != - 1 ) {

			vec3 uvPrime = material.clearcoatRoughnessMapTransform * vec3( uv, 1 );
			clearcoatRoughness *= texture2D( textures, vec3( uvPrime.xy, material.clearcoatRoughnessMap ) ).g;

		}

		// clearcoatNormal
		vec3 clearcoatNormal = baseNormal;
		if ( material.clearcoatNormalMap != - 1 ) {

			vec4 tangentSample = textureSampleBarycoord(
				attributesArray,
				ATTR_TANGENT,
				surfaceHit.barycoord,
				surfaceHit.faceIndices.xyz
			);

			// some provided tangents can be malformed (0, 0, 0) causing the normal to be degenerate
			// resulting in NaNs and slow path tracing.
			if ( length( tangentSample.xyz ) > 0.0 ) {

				vec3 tangent = normalize( tangentSample.xyz );
				vec3 bitangent = normalize( cross( clearcoatNormal, tangent ) * tangentSample.w );
				mat3 vTBN = mat3( tangent, bitangent, clearcoatNormal );

				vec3 uvPrime = material.clearcoatNormalMapTransform * vec3( uv, 1 );
				vec3 texNormal = texture2D( textures, vec3( uvPrime.xy, material.clearcoatNormalMap ) ).xyz * 2.0 - 1.0;
				texNormal.xy *= material.clearcoatNormalScale;
				clearcoatNormal = vTBN * texNormal;

			}

		}

		clearcoatNormal *= surfaceHit.side;

		// sheenColor
		vec3 sheenColor = material.sheenColor;
		if ( material.sheenColorMap != - 1 ) {

			vec3 uvPrime = material.sheenColorMapTransform * vec3( uv, 1 );
			sheenColor *= texture2D( textures, vec3( uvPrime.xy, material.sheenColorMap ) ).rgb;

		}

		// sheenRoughness
		float sheenRoughness = material.sheenRoughness;
		if ( material.sheenRoughnessMap != - 1 ) {

			vec3 uvPrime = material.sheenRoughnessMapTransform * vec3( uv, 1 );
			sheenRoughness *= texture2D( textures, vec3( uvPrime.xy, material.sheenRoughnessMap ) ).a;

		}

		// iridescence
		float iridescence = material.iridescence;
		if ( material.iridescenceMap != - 1 ) {

			vec3 uvPrime = material.iridescenceMapTransform * vec3( uv, 1 );
			iridescence *= texture2D( textures, vec3( uvPrime.xy, material.iridescenceMap ) ).r;

		}

		// iridescence thickness
		float iridescenceThickness = material.iridescenceThicknessMaximum;
		if ( material.iridescenceThicknessMap != - 1 ) {

			vec3 uvPrime = material.iridescenceThicknessMapTransform * vec3( uv, 1 );
			float iridescenceThicknessSampled = texture2D( textures, vec3( uvPrime.xy, material.iridescenceThicknessMap ) ).g;
			iridescenceThickness = mix( material.iridescenceThicknessMinimum, material.iridescenceThicknessMaximum, iridescenceThicknessSampled );

		}

		iridescence = iridescenceThickness == 0.0 ? 0.0 : iridescence;

		// specular color
		vec3 specularColor = material.specularColor;
		if ( material.specularColorMap != - 1 ) {

			vec3 uvPrime = material.specularColorMapTransform * vec3( uv, 1 );
			specularColor *= texture2D( textures, vec3( uvPrime.xy, material.specularColorMap ) ).rgb;

		}

		// specular intensity
		float specularIntensity = material.specularIntensity;
		if ( material.specularIntensityMap != - 1 ) {

			vec3 uvPrime = material.specularIntensityMapTransform * vec3( uv, 1 );
			specularIntensity *= texture2D( textures, vec3( uvPrime.xy, material.specularIntensityMap ) ).a;

		}

		surf.volumeParticle = false;

		surf.faceNormal = surfaceHit.faceNormal;
		surf.normal = normal;

		surf.metalness = metalness;
		surf.color = albedo.rgb;
		surf.emission = emission;

		surf.ior = material.ior;
		surf.transmission = transmission;
		surf.thinFilm = material.thinFilm;
		surf.attenuationColor = material.attenuationColor;
		surf.attenuationDistance = material.attenuationDistance;

		surf.clearcoatNormal = clearcoatNormal;
		surf.clearcoat = clearcoat;

		surf.sheen = material.sheen;
		surf.sheenColor = sheenColor;

		surf.iridescence = iridescence;
		surf.iridescenceIor = material.iridescenceIor;
		surf.iridescenceThickness = iridescenceThickness;

		surf.specularColor = specularColor;
		surf.specularIntensity = specularIntensity;

		// apply perceptual roughness factor from gltf. sheen perceptual roughness is
		// applied by its brdf function
		// https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#microfacet-surfaces
		surf.roughness = roughness * roughness;
		surf.clearcoatRoughness = clearcoatRoughness * clearcoatRoughness;
		surf.sheenRoughness = sheenRoughness;

		// frontFace is used to determine transmissive properties and PDF. If no transmission is used
		// then we can just always assume this is a front face.
		surf.frontFace = surfaceHit.side == 1.0 || transmission == 0.0;
		surf.eta = material.thinFilm || surf.frontFace ? 1.0 / material.ior : material.ior;
		surf.f0 = iorRatioToF0( surf.eta );

		// Compute the filtered roughness value to use during specular reflection computations.
		// The accumulated roughness value is scaled by a user setting and a "magic value" of 5.0.
		// If we're exiting something transmissive then scale the factor down significantly so we can retain
		// sharp internal reflections
		surf.filteredRoughness = applyFilteredGlossy( surf.roughness, accumulatedRoughness );
		surf.filteredClearcoatRoughness = applyFilteredGlossy( surf.clearcoatRoughness, accumulatedRoughness );

		// get the normal frames
		surf.normalBasis = getBasisFromNormal( surf.normal );
		surf.normalInvBasis = inverse( surf.normalBasis );

		surf.clearcoatBasis = getBasisFromNormal( surf.clearcoatNormal );
		surf.clearcoatInvBasis = inverse( surf.clearcoatBasis );

		return HIT_SURFACE;

	}
`;var Mn=`

	vec3 directLightContribution( vec3 worldWo, SurfaceRecord surf, RenderState state, vec3 rayOrigin ) {

		vec3 result = vec3( 0.0 );

		// uniformly pick a light or environment map
		if( lightsDenom != 0.0 && rand( 5 ) < float( lights.count ) / lightsDenom ) {

			// sample a light or environment
			LightRecord lightRec = randomLightSample( lights.tex, iesProfiles, lights.count, rayOrigin, rand3( 6 ) );

			bool isSampleBelowSurface = ! surf.volumeParticle && dot( surf.faceNormal, lightRec.direction ) < 0.0;
			if ( isSampleBelowSurface ) {

				lightRec.pdf = 0.0;

			}

			// check if a ray could even reach the light area
			Ray lightRay;
			lightRay.origin = rayOrigin;
			lightRay.direction = lightRec.direction;
			vec3 attenuatedColor;
			if (
				lightRec.pdf > 0.0 &&
				isDirectionValid( lightRec.direction, surf.normal, surf.faceNormal ) &&
				! attenuateHit( state, lightRay, lightRec.dist, attenuatedColor )
			) {

				// get the material pdf
				vec3 sampleColor;
				float lightMaterialPdf = bsdfResult( worldWo, lightRec.direction, surf, sampleColor );
				bool isValidSampleColor = all( greaterThanEqual( sampleColor, vec3( 0.0 ) ) );
				if ( lightMaterialPdf > 0.0 && isValidSampleColor ) {

					// weight the direct light contribution
					float lightPdf = lightRec.pdf / lightsDenom;
					float misWeight = lightRec.type == SPOT_LIGHT_TYPE || lightRec.type == DIR_LIGHT_TYPE || lightRec.type == POINT_LIGHT_TYPE ? 1.0 : misHeuristic( lightPdf, lightMaterialPdf );
					result = attenuatedColor * lightRec.emission * state.throughputColor * sampleColor * misWeight / lightPdf;

				}

			}

		} else if ( envMapInfo.totalSum != 0.0 && environmentIntensity != 0.0 ) {

			// find a sample in the environment map to include in the contribution
			vec3 envColor, envDirection;
			float envPdf = sampleEquirectProbability( rand2( 7 ), envColor, envDirection );
			envDirection = invEnvRotation3x3 * envDirection;

			// this env sampling is not set up for transmissive sampling and yields overly bright
			// results so we ignore the sample in this case.
			// TODO: this should be improved but how? The env samples could traverse a few layers?
			bool isSampleBelowSurface = ! surf.volumeParticle && dot( surf.faceNormal, envDirection ) < 0.0;
			if ( isSampleBelowSurface ) {

				envPdf = 0.0;

			}

			// check if a ray could even reach the surface
			Ray envRay;
			envRay.origin = rayOrigin;
			envRay.direction = envDirection;
			vec3 attenuatedColor;
			if (
				envPdf > 0.0 &&
				isDirectionValid( envDirection, surf.normal, surf.faceNormal ) &&
				! attenuateHit( state, envRay, INFINITY, attenuatedColor )
			) {

				// get the material pdf
				vec3 sampleColor;
				float envMaterialPdf = bsdfResult( worldWo, envDirection, surf, sampleColor );
				bool isValidSampleColor = all( greaterThanEqual( sampleColor, vec3( 0.0 ) ) );
				if ( envMaterialPdf > 0.0 && isValidSampleColor ) {

					// weight the direct light contribution
					envPdf /= lightsDenom;
					float misWeight = misHeuristic( envPdf, envMaterialPdf );
					result = attenuatedColor * environmentIntensity * envColor * state.throughputColor * sampleColor * misWeight / envPdf;

				}

			}

		}

		// Function changed to have a single return statement to potentially help with crashes on Mac OS.
		// See issue #470
		return result;

	}

`;var Fn=`

	uniform sampler2D stratifiedTexture;
	uniform sampler2D stratifiedOffsetTexture;

	uint sobolPixelIndex = 0u;
	uint sobolPathIndex = 0u;
	uint sobolBounceIndex = 0u;
	vec4 pixelSeed = vec4( 0 );

	vec4 rand4( int v ) {

		ivec2 uv = ivec2( v, sobolBounceIndex );
		vec4 stratifiedSample = texelFetch( stratifiedTexture, uv, 0 );
		return fract( stratifiedSample + pixelSeed.r ); // blue noise + stratified samples

	}

	vec3 rand3( int v ) {

		return rand4( v ).xyz;

	}

	vec2 rand2( int v ) {

		return rand4( v ).xy;

	}

	float rand( int v ) {

		return rand4( v ).x;

	}

	void rng_initialize( vec2 screenCoord, int frame ) {

		// tile the small noise texture across the entire screen
		ivec2 noiseSize = ivec2( textureSize( stratifiedOffsetTexture, 0 ) );
		pixelSeed = texelFetch( stratifiedOffsetTexture, ivec2( screenCoord.xy ) % noiseSize, 0 );

	}

`;import{DataTexture as xc,FloatType as vc,NearestFilter as Pn,RGBAFormat as yc}from"three";function gc(o){for(let t=o.length-1;t>0;t--){let e=Math.floor(Math.random()*(t+1)),r=o[t];o[t]=o[e],o[e]=r}return o}var rr=class{constructor(t,e){let r=t**e,n=new Uint16Array(r),a=r;for(let s=0;s<r;s++)n[s]=s;this.samples=new Float32Array(e),this.strataCount=t,this.restart=function(){a=0},this.next=function(){let{samples:s}=this;a>=n.length&&(gc(n),this.restart());let i=n[a++];for(let c=0;c<e;c++)s[c]=(i%t+Math.random())/t,i=Math.floor(i/t);return s}}};var ir=class{constructor(t,e){let r=0;for(let i of e)r+=i;let n=new Float32Array(r),a=[],s=0;for(let i of e){let c=new rr(t,i);c.samples=new Float32Array(n.buffer,s,c.samples.length),s+=c.samples.length*4,a.push(c)}this.samples=n,this.strataCount=t,this.next=function(){for(let i of a)i.next();return n},this.restart=function(){for(let i of a)i.restart()}}};var or=class extends xc{constructor(t=1,e=1,r=8){super(new Float32Array(1),1,1,yc,vc),this.minFilter=Pn,this.magFilter=Pn,this.strata=r,this.sampler=null,this.init(t,e,r)}init(t,e,r=this.strata){let{image:n}=this;if(n.width===e&&n.height===t)return;let a=new Array(t*e).fill(4),s=new ir(r,a);n.width=e,n.height=t,n.data=s.samples,this.sampler=s,this.dispose(),this.next()}next(){this.sampler.next(),this.needsUpdate=!0}};import{DataTexture as bc,FloatType as Tc,NearestFilter as Bn,RGBAFormat as En,RGFormat as wc,RedFormat as Sc}from"three";function Dn(o,t=Math.random){for(let e=o.length-1;e>0;e--){let r=~~((t()-1e-6)*e),n=o[e];o[e]=o[r],o[r]=n}}function Cn(o,t){o.fill(0);for(let e=0;e<t;e++)o[e]=1}var ee=class{constructor(t){this.count=0,this.size=-1,this.sigma=-1,this.radius=-1,this.lookupTable=null,this.score=null,this.binaryPattern=null,this.resize(t),this.setSigma(1.5)}findVoid(){let{score:t,binaryPattern:e}=this,r=1/0,n=-1;for(let a=0,s=e.length;a<s;a++){if(e[a]!==0)continue;let i=t[a];i<r&&(r=i,n=a)}return n}findCluster(){let{score:t,binaryPattern:e}=this,r=-1/0,n=-1;for(let a=0,s=e.length;a<s;a++){if(e[a]!==1)continue;let i=t[a];i>r&&(r=i,n=a)}return n}setSigma(t){if(t===this.sigma)return;let e=~~(Math.sqrt(20*t**2)+1),r=2*e+1,n=new Float32Array(r*r),a=t*t;for(let s=-e;s<=e;s++)for(let i=-e;i<=e;i++){let c=(e+i)*r+s+e,d=s*s+i*i;n[c]=Math.E**(-d/(2*a))}this.lookupTable=n,this.sigma=t,this.radius=e}resize(t){this.size!==t&&(this.size=t,this.score=new Float32Array(t*t),this.binaryPattern=new Uint8Array(t*t))}invert(){let{binaryPattern:t,score:e,size:r}=this;e.fill(0);for(let n=0,a=t.length;n<a;n++)if(t[n]===0){let s=~~(n/r),i=n-s*r;this.updateScore(i,s,1),t[n]=1}else t[n]=0}updateScore(t,e,r){let{size:n,score:a,lookupTable:s}=this,i=this.radius,c=2*i+1;for(let d=-i;d<=i;d++)for(let m=-i;m<=i;m++){let u=(i+m)*c+d+i,l=s[u],g=t+d;g=g<0?n+g:g%n;let y=e+m;y=y<0?n+y:y%n;let x=y*n+g;a[x]+=r*l}}addPointIndex(t){this.binaryPattern[t]=1;let e=this.size,r=~~(t/e),n=t-r*e;this.updateScore(n,r,1),this.count++}removePointIndex(t){this.binaryPattern[t]=0;let e=this.size,r=~~(t/e),n=t-r*e;this.updateScore(n,r,-1),this.count--}copy(t){this.resize(t.size),this.score.set(t.score),this.binaryPattern.set(t.binaryPattern),this.setSigma(t.sigma),this.count=t.count}};var nr=class{constructor(){this.random=Math.random,this.sigma=1.5,this.size=64,this.majorityPointsRatio=.1,this.samples=new ee(1),this.savedSamples=new ee(1)}generate(){let{samples:t,savedSamples:e,sigma:r,majorityPointsRatio:n,size:a}=this;t.resize(a),t.setSigma(r);let s=Math.floor(a*a*n),i=t.binaryPattern;Cn(i,s),Dn(i,this.random);for(let u=0,l=i.length;u<l;u++)i[u]===1&&t.addPointIndex(u);for(;;){let u=t.findCluster();t.removePointIndex(u);let l=t.findVoid();if(u===l){t.addPointIndex(u);break}t.addPointIndex(l)}let c=new Uint32Array(a*a);e.copy(t);let d;for(d=t.count-1;d>=0;){let u=t.findCluster();t.removePointIndex(u),c[u]=d,d--}let m=a*a;for(d=e.count;d<m/2;){let u=e.findVoid();e.addPointIndex(u),c[u]=d,d++}for(e.invert();d<m;){let u=e.findCluster();e.removePointIndex(u),c[u]=d,d++}return{data:c,maxValue:m}}};function Ac(o){return o>=3?4:o}function Ic(o){switch(o){case 1:return Sc;case 2:return wc;default:return En}}var sr=class extends bc{constructor(t=64,e=1){super(new Float32Array(4),1,1,En,Tc),this.minFilter=Bn,this.magFilter=Bn,this.size=t,this.channels=e,this.update()}update(){let t=this.channels,e=this.size,r=new nr;r.channels=t,r.size=e;let n=Ac(t),a=Ic(n);(this.image.width!==e||a!==this.format)&&(this.image.width=e,this.image.height=e,this.image.data=new Float32Array(e**2*n),this.format=a,this.dispose());let s=this.image.data;for(let i=0,c=t;i<c;i++){let d=r.generate(),m=d.data,u=d.maxValue;for(let l=0,g=m.length;l<g;l++){let y=m[l]/u;s[l*n+i]=y}}this.needsUpdate=!0}};var fi=class extends Q{onBeforeRender(){this.setDefine("FEATURE_DOF",this.physicalCamera.bokehSize===0?0:1),this.setDefine("FEATURE_BACKGROUND_MAP",this.backgroundMap?1:0),this.setDefine("FEATURE_FOG",this.materials.features.isUsed("FOG")?1:0)}constructor(t){super({transparent:!0,depthWrite:!1,defines:{FEATURE_MIS:1,FEATURE_RUSSIAN_ROULETTE:1,FEATURE_DOF:1,FEATURE_BACKGROUND_MAP:0,FEATURE_FOG:1,RANDOM_TYPE:2,CAMERA_TYPE:0,DEBUG_MODE:0,ATTR_NORMAL:0,ATTR_TANGENT:1,ATTR_UV:2,ATTR_COLOR:3},uniforms:{resolution:{value:new Rc},bounces:{value:10},transmissiveBounces:{value:10},physicalCamera:{value:new je},bvh:{value:new Ee},attributesArray:{value:new er},materialIndexAttribute:{value:new Bt},materials:{value:new Xe},textures:{value:new Ye().texture},lights:{value:new Qe},iesProfiles:{value:new Je().texture},cameraWorldMatrix:{value:new ui},invProjectionMatrix:{value:new ui},backgroundBlur:{value:0},environmentIntensity:{value:1},environmentRotation:{value:new ui},envMapInfo:{value:new $e},backgroundMap:{value:null},seed:{value:0},opacity:{value:1},filterGlossyFactor:{value:0},backgroundAlpha:{value:1},sobolTexture:{value:null},stratifiedTexture:{value:new or},stratifiedOffsetTexture:{value:new sr(64,1)}},vertexShader:`

				varying vec2 vUv;
				void main() {

					vec4 mvPosition = vec4( position, 1.0 );
					mvPosition = modelViewMatrix * mvPosition;
					gl_Position = projectionMatrix * mvPosition;

					vUv = uv;

				}

			`,fragmentShader:`
				#define RAY_OFFSET 1e-4
				#define INFINITY 1e20

				precision highp isampler2D;
				precision highp usampler2D;
				precision highp sampler2DArray;
				vec4 envMapTexelToLinear( vec4 a ) { return a; }
				#include <common>

				// bvh intersection
				${dt.common_functions}
				${dt.bvh_struct_definitions}
				${dt.bvh_ray_functions}

				// uniform structs
				${sn}
				${cn}
				${an}
				${ln}

				// random
				#if RANDOM_TYPE == 2 	// Stratified List

					${Fn}

				#elif RANDOM_TYPE == 1 	// Sobol

					${li}
					${ne}
					${gi}

					#define rand(v) sobol(v)
					#define rand2(v) sobol2(v)
					#define rand3(v) sobol3(v)
					#define rand4(v) sobol4(v)

				#else 					// PCG

					${li}

					// Using the sobol functions seems to break the the compiler on MacOS
					// - specifically the "sobolReverseBits" function.
					uint sobolPixelIndex = 0u;
					uint sobolPathIndex = 0u;
					uint sobolBounceIndex = 0u;

					#define rand(v) pcgRand()
					#define rand2(v) pcgRand2()
					#define rand3(v) pcgRand3()
					#define rand4(v) pcgRand4()

				#endif

				// common
				${wn}
				${Tn}
				${on}
				${bn}
				${yn}

				// environment
				uniform EquirectHdrInfo envMapInfo;
				uniform mat4 environmentRotation;
				uniform float environmentIntensity;

				// lighting
				uniform sampler2DArray iesProfiles;
				uniform LightsInfo lights;

				// background
				uniform float backgroundBlur;
				uniform float backgroundAlpha;
				#if FEATURE_BACKGROUND_MAP

				uniform sampler2D backgroundMap;

				#endif

				// camera
				uniform mat4 cameraWorldMatrix;
				uniform mat4 invProjectionMatrix;
				#if FEATURE_DOF

				uniform PhysicalCamera physicalCamera;

				#endif

				// geometry
				uniform sampler2DArray attributesArray;
				uniform usampler2D materialIndexAttribute;
				uniform sampler2D materials;
				uniform sampler2DArray textures;
				uniform BVH bvh;

				// path tracer
				uniform int bounces;
				uniform int transmissiveBounces;
				uniform float filterGlossyFactor;
				uniform int seed;

				// image
				uniform vec2 resolution;
				uniform float opacity;

				varying vec2 vUv;

				// globals
				mat3 envRotation3x3;
				mat3 invEnvRotation3x3;
				float lightsDenom;

				// sampling
				${un}
				${vn}
				${hn}
				${gn}
				${xn}
				${pn}

				float applyFilteredGlossy( float roughness, float accumulatedRoughness ) {

					return clamp(
						max(
							roughness,
							accumulatedRoughness * filterGlossyFactor * 5.0 ),
						0.0,
						1.0
					);

				}

				vec3 sampleBackground( vec3 direction, vec2 uv ) {

					vec3 sampleDir = normalize( direction + sampleHemisphere( direction, uv ) * 0.5 * backgroundBlur );

					#if FEATURE_BACKGROUND_MAP

					return sampleEquirectColor( backgroundMap, sampleDir );

					#else

					return environmentIntensity * sampleEquirectColor( envMapInfo.map, sampleDir );

					#endif

				}

				${Sn}
				${An}
				${Rn}
				${In}
				${Mn}
				${_n}

				void main() {

					// init
					rng_initialize( gl_FragCoord.xy, seed );
					sobolPixelIndex = ( uint( gl_FragCoord.x ) << 16 ) | uint( gl_FragCoord.y );
					sobolPathIndex = uint( seed );

					// get camera ray
					Ray ray = getCameraRay();

					// inverse environment rotation
					envRotation3x3 = mat3( environmentRotation );
					invEnvRotation3x3 = inverse( envRotation3x3 );
					lightsDenom =
						( environmentIntensity == 0.0 || envMapInfo.totalSum == 0.0 ) && lights.count != 0u ?
							float( lights.count ) :
							float( lights.count + 1u );

					// final color
					gl_FragColor = vec4( 0, 0, 0, 1 );

					// surface results
					SurfaceHit surfaceHit;
					ScatterRecord scatterRec;

					// path tracing state
					RenderState state = initRenderState();
					state.transmissiveTraversals = transmissiveBounces;
					#if FEATURE_FOG

					state.fogMaterial.fogVolume = bvhIntersectFogVolumeHit(
						ray.origin, - ray.direction,
						materialIndexAttribute, materials,
						state.fogMaterial
					);

					#endif

					for ( int i = 0; i < bounces; i ++ ) {

						sobolBounceIndex ++;

						state.depth ++;
						state.traversals = bounces - i;
						state.firstRay = i == 0 && state.transmissiveTraversals == transmissiveBounces;

						int hitType = traceScene( ray, state.fogMaterial, surfaceHit );

						// check if we intersect any lights and accumulate the light contribution
						// TODO: we can add support for light surface rendering in the else condition if we
						// add the ability to toggle visibility of the the light
						if ( ! state.firstRay && ! state.transmissiveRay ) {

							LightRecord lightRec;
							float lightDist = hitType == NO_HIT ? INFINITY : surfaceHit.dist;
							for ( uint i = 0u; i < lights.count; i ++ ) {

								if (
									intersectLightAtIndex( lights.tex, ray.origin, ray.direction, i, lightRec ) &&
									lightRec.dist < lightDist
								) {

									#if FEATURE_MIS

									// weight the contribution
									// NOTE: Only area lights are supported for forward sampling and can be hit
									float misWeight = misHeuristic( scatterRec.pdf, lightRec.pdf / lightsDenom );
									gl_FragColor.rgb += lightRec.emission * state.throughputColor * misWeight;

									#else

									gl_FragColor.rgb += lightRec.emission * state.throughputColor;

									#endif

								}

							}

						}

						if ( hitType == NO_HIT ) {

							if ( state.firstRay || state.transmissiveRay ) {

								gl_FragColor.rgb += sampleBackground( envRotation3x3 * ray.direction, rand2( 2 ) ) * state.throughputColor;
								gl_FragColor.a = backgroundAlpha;

							} else {

								#if FEATURE_MIS

								// get the PDF of the hit envmap point
								vec3 envColor;
								float envPdf = sampleEquirect( envRotation3x3 * ray.direction, envColor );
								envPdf /= lightsDenom;

								// and weight the contribution
								float misWeight = misHeuristic( scatterRec.pdf, envPdf );
								gl_FragColor.rgb += environmentIntensity * envColor * state.throughputColor * misWeight;

								#else

								gl_FragColor.rgb +=
									environmentIntensity *
									sampleEquirectColor( envMapInfo.map, envRotation3x3 * ray.direction ) *
									state.throughputColor;

								#endif

							}
							break;

						}

						uint materialIndex = uTexelFetch1D( materialIndexAttribute, surfaceHit.faceIndices.x ).r;
						Material material = readMaterialInfo( materials, materialIndex );

						#if FEATURE_FOG

						if ( hitType == FOG_HIT ) {

							material = state.fogMaterial;
							state.accumulatedRoughness += 0.2;

						} else if ( material.fogVolume ) {

							state.fogMaterial = material;
							state.fogMaterial.fogVolume = surfaceHit.side == 1.0;

							ray.origin = stepRayOrigin( ray.origin, ray.direction, - surfaceHit.faceNormal, surfaceHit.dist );

							i -= sign( state.transmissiveTraversals );
							state.transmissiveTraversals -= sign( state.transmissiveTraversals );
							continue;

						}

						#endif

						// early out if this is a matte material
						if ( material.matte && state.firstRay ) {

							gl_FragColor = vec4( 0.0 );
							break;

						}

						// if we've determined that this is a shadow ray and we've hit an item with no shadow casting
						// then skip it
						if ( ! material.castShadow && state.isShadowRay ) {

							ray.origin = stepRayOrigin( ray.origin, ray.direction, - surfaceHit.faceNormal, surfaceHit.dist );
							continue;

						}

						SurfaceRecord surf;
						if (
							getSurfaceRecord(
								material, surfaceHit, attributesArray, state.accumulatedRoughness,
								surf
							) == SKIP_SURFACE
						) {

							// only allow a limited number of transparency discards otherwise we could
							// crash the context with too long a loop.
							i -= sign( state.transmissiveTraversals );
							state.transmissiveTraversals -= sign( state.transmissiveTraversals );

							ray.origin = stepRayOrigin( ray.origin, ray.direction, - surfaceHit.faceNormal, surfaceHit.dist );
							continue;

						}

						scatterRec = bsdfSample( - ray.direction, surf );
						state.isShadowRay = scatterRec.specularPdf < rand( 4 );

						bool isBelowSurface = ! surf.volumeParticle && dot( scatterRec.direction, surf.faceNormal ) < 0.0;
						vec3 hitPoint = stepRayOrigin( ray.origin, ray.direction, isBelowSurface ? - surf.faceNormal : surf.faceNormal, surfaceHit.dist );

						// next event estimation
						#if FEATURE_MIS

						gl_FragColor.rgb += directLightContribution( - ray.direction, surf, state, hitPoint );

						#endif

						// accumulate a roughness value to offset diffuse, specular, diffuse rays that have high contribution
						// to a single pixel resulting in fireflies
						// TODO: handle transmissive surfaces
						if ( ! surf.volumeParticle && ! isBelowSurface ) {

							// determine if this is a rough normal or not by checking how far off straight up it is
							vec3 halfVector = normalize( - ray.direction + scatterRec.direction );
							state.accumulatedRoughness += max(
								sin( acosApprox( dot( halfVector, surf.normal ) ) ),
								sin( acosApprox( dot( halfVector, surf.clearcoatNormal ) ) )
							);

							state.transmissiveRay = false;

						}

						// accumulate emissive color
						gl_FragColor.rgb += ( surf.emission * state.throughputColor );

						// skip the sample if our PDF or ray is impossible
						if ( scatterRec.pdf <= 0.0 || ! isDirectionValid( scatterRec.direction, surf.normal, surf.faceNormal ) ) {

							break;

						}

						// if we're bouncing around the inside a transmissive material then decrement
						// perform this separate from a bounce
						bool isTransmissiveRay = ! surf.volumeParticle && dot( scatterRec.direction, surf.faceNormal * surfaceHit.side ) < 0.0;
						if ( ( isTransmissiveRay || isBelowSurface ) && state.transmissiveTraversals > 0 ) {

							state.transmissiveTraversals --;
							i --;

						}

						//

						// handle throughput color transformation
						// attenuate the throughput color by the medium color
						if ( ! surf.frontFace ) {

							state.throughputColor *= transmissionAttenuation( surfaceHit.dist, surf.attenuationColor, surf.attenuationDistance );

						}

						#if FEATURE_RUSSIAN_ROULETTE

						// russian roulette path termination
						// https://www.arnoldrenderer.com/research/physically_based_shader_design_in_arnold.pdf
						uint minBounces = 3u;
						float depthProb = float( state.depth < minBounces );

						float rrProb = luminance( state.throughputColor * scatterRec.color / scatterRec.pdf );
						rrProb /= luminance( state.throughputColor );
						rrProb = sqrt( rrProb );
						rrProb = max( rrProb, depthProb );
						rrProb = min( rrProb, 1.0 );
						if ( rand( 8 ) > rrProb ) {

							break;

						}

						// perform sample clamping here to avoid bright pixels
						state.throughputColor *= min( 1.0 / rrProb, 20.0 );

						#endif

						// adjust the throughput and discard and exit if we find discard the sample if there are any NaNs
						state.throughputColor *= scatterRec.color / scatterRec.pdf;
						if ( any( isnan( state.throughputColor ) ) || any( isinf( state.throughputColor ) ) ) {

							break;

						}

						//

						// prepare for next ray
						ray.direction = scatterRec.direction;
						ray.origin = hitPoint;

					}

					gl_FragColor.a *= opacity;

					#if DEBUG_MODE == 1

					// output the number of rays checked in the path and number of
					// transmissive rays encountered.
					gl_FragColor.rgb = vec3(
						float( state.depth ),
						transmissiveBounces - state.transmissiveTraversals,
						0.0
					);
					gl_FragColor.a = 1.0;

					#endif

				}

			`}),this.setValues(t)}};export{ci as DenoiseMaterial,X as FullScreenQuad,ei as GradientEquirectTexture,gr as PathTracingRenderer,Jr as PathTracingSceneGenerator,fi as PhysicalPathTracingMaterial,ti as PhysicalSpotLight};
